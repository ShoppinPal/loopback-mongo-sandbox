'use strict';

module.exports = function (app) {
  var Role = app.models.Role;

  var roles = [
    'orgAdmin',
    'orgUser'
  ];

  var _ = require('underscore');
  _.each(roles, function (eachRole) {
    var log = require('debug')('loopback:security:role-resolver:'+eachRole);
    Role.registerResolver(eachRole, function (role, context, cb) {
      function reject(reason, err) {
        log('DENY'
          + '\n' + '\t' + context.remotingContext.req.method + ' ' + context.remotingContext.req.originalUrl
          + '\n' + '\t' + 'Reason: ' +reason);
        if (err) {
          return cb(err);
        }
        cb(null, false);
      }
      
      if (context.modelName !== 'OrgModel') {
        return reject('target model is not OrgModel'); // return error if target model is not OrgModel
      }
      var currentOrg = context.modelId;
      if (!currentOrg) {
        return reject('an exact OrgModel isn\'t specified'); // return error if an exact OrgModel isn't specified
      }
      var currentUserId = context.accessToken.userId;
      if (!currentUserId) {
        return reject('do not allow unauthenticated users to proceed'); // do not allow unauthenticated users to proceed
      }
      else {
        app.models.UserModel.findById(currentUserId, {
          include: {
            relation: 'roles',
            scope: {
              fields: ['name'] // only include the role name and id
            }
          }
        })
          .then(function (userModelInstance) {
            if(!userModelInstance.orgModelId){
              return reject('user does not belong to any organization'); // reject users who do not belong to any organization
            }
            if (!_.isEqual(userModelInstance.orgModelId.toString(), currentOrg.toString())) {
              return reject('user does not belong to the given organization'); // reject users who do not belong to the given organization
            }
            var isValidUser = _.findWhere(userModelInstance.roles(), {name: eachRole});
            if(!isValidUser) {
              return reject('user does not have this role '+eachRole+' assigned'); // reject users who haven't been assigned the given role
            }
            else {
              log('ALLOW an authenticated user who belongs to this organization and has this role assigned');
              return cb(null, true);
            }
          })
          .catch(function (error) {
            cb(error);
          });
      }
    });
  });
};
