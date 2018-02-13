var path = require('path');
var fileName = path.basename(__filename, '.js'); // gives the filename without the .js extension
var log = require('debug')('common:models:' + fileName);

var Promise = require('bluebird');
var Joi = Promise.promisifyAll(require('joi'));
var validate = Promise.promisify(require('joi').validate);
var _ = require('underscore');

module.exports = function (UserModel) {

    // Hiding methods and REST endpoints
    // https://loopback.io/doc/en/lb3/Exposing-models-over-REST.html#hiding-methods-and-rest-endpoints

    // Clients should not be able to create users (BUT signups are a different story)
    UserModel.disableRemoteMethodByName("create");                               // disables POST /UserModels
    UserModel.disableRemoteMethodByName("upsert");                               // disables PATCH /UserModels
    UserModel.disableRemoteMethodByName("replaceOrCreate");                      // disables PUT /UserModels
    UserModel.disableRemoteMethodByName("replaceById");                          // disables PUT /UserModels/{id}
    UserModel.disableRemoteMethodByName("upsertWithWhere");                      // disables POST /UserModels/upsertWithWhere

    UserModel.on('attached', function () {
        var app = UserModel.app;
        var Role = app.models.Role;
        var RoleMapping = app.models.RoleMapping;

        /**
         * Overrides the `create` method
         * - must restrict access so its only called from server-side and not client-side
         */
        var overriddenCreate = UserModel.create;
        UserModel.create = function(data, options, callback) {
            log('OVERRIDING UserModel create method');

            console.assert(data.orgModelId); // sanity check 
            // if its a direct api call via `POST /OrgModels/:id/users` then loopback will add this value
            // if its a server side api by developers then they must add this value

            // handle both callbacks and promise based invocations
            var loopbackUtils = require('loopback/lib/utils');
            originalCallback = callback || loopbackUtils.createPromiseCallback();

            // nest callbacks to attach desired functionality, post-create
            callback = function(error, userInstance) {
                if (error) {
                    originalCallback(error);
                }
                else {
                    // Is `selfEditingOrgUser` a better role name than `orgUser:self` ???
                    // if the code was not split across two "boot" files then
                    // there wouldn't be need to register a role resolver under the name `orgUser:self`
                    // because having all the code under one file registered with role-resolver named `orgUser`
                    // would let us handle permissions to OrgModel and UserModel in one place under one named role
                    var rolesToAssign = ['orgUser', 'orgUser:self'];
                    UserModel.assignRoles(rolesToAssign, userInstance, options)
                        .then(function(){
                            originalCallback(null, userInstance);
                        })
                        .catch(function(error){
                            originalCallback(error);
                        });
                }
            };

            // call original `create` method
            var self = this;
            var argsForCreate = arguments;
            overriddenCreate.apply(self, argsForCreate);
        }; // END of UserModel.create

        UserModel.remoteMethod('signup', {
            accepts: [
                { arg: 'data', type: 'object', required: true, http: { source: 'body' } },
                { arg: 'options', type: 'object', http: 'optionsFromRequest' }
            ],
            http: { path: '/signup', verb: 'post' },
            returns: { type: 'string', root: true }
        });

        UserModel.signup = function (data, options, cb) {
            log('initiating sign-up', data);
            var OrgModel = UserModel.app.models.OrgModel;
            var validObjectSchema = Joi.object().keys({
                'orgName': Joi.string().required(),
                'email': Joi.string().email().required(),
                'password': Joi.string().min(8).max(15).required()
            });

            var orgData = {
                name: data.orgName,
                email: data.email
            };

            delete data.username;

            var orgCreated = {};
            var userCreated = {};

            validate(data, validObjectSchema)
                .then(function () {
                    return OrgModel.create(orgData);
                })
                .then(function (orgInstance) {
                    delete data.orgName;
                    data.username = data.email;
                    orgCreated = orgInstance; //creating object reference instead of copying, so that can be accessed in catch block
                    return orgInstance.users.create(data, options);
                })
                .then(function (userInstance) {
                    userCreated = userInstance;
                    var rolesToAssign = ['orgAdmin']; // for users who "self-signup", one additional role MUST be that of `orgAdmin`
                    return UserModel.assignRoles(rolesToAssign, userInstance, options);
                })
                .then(function () {
                    cb(null, userCreated);
                })
                .catch(function (error) {
                    log('Error creating organization, rolling back ...', JSON.stringify(error, null, 2));
                    if (!_.isEmpty(orgCreated)) {
                        OrgModel.deleteById(orgCreated.id)
                            .then(function () {
                                if (!_.isEmpty(userCreated)) {
                                    return UserModel.deleteById(userCreated.id);
                                }
                                else {
                                    return Promise.resolve();
                                }
                            })
                            .then(function () {
                                if (error && error.details && error.details.codes && error.details.codes.email && error.details.codes.email[0] === 'uniqueness') {
                                    cb({ 'property': 'email', 'message': 'This email address already exists.' });
                                }
                                else {
                                    cb('Internal Server Error. Please try again.');
                                }
                            })
                            .catch(function (anotherError) {
                                log('signup error', anotherError);
                                cb('Internal Server Error. Please try again.');
                            });
                    }
                    else {
                        cb(error);
                    }
                });
        };

        UserModel.assignRoles = function (rolesToAssign, userInstance, options) {
            var Role = UserModel.app.models.Role;
            var RoleMapping = UserModel.app.models.RoleMapping;
            var orConditions = [];
            rolesToAssign.forEach(function (eachRole) {
                orConditions.push({ name: eachRole });
            });
            return Role.find({
                where: {
                    or: orConditions
                }
            })
                .then(function (roles) {
                    return Promise.map(roles, function (eachRole) {
                        log('Assigning role ' + eachRole.name);
                        return RoleMapping.create({ roleId: eachRole.id, principalId: userInstance.id });
                    });
                })
                .then(function (result) {
                    log('Finished assigning roles to user');
                    return Promise.resolve(result);
                })
                .catch(function (error) {
                    log('Error assigning roles', error);
                    return Promise.reject(error);
                });
        };

    });
};