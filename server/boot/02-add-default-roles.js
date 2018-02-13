'use strict';

module.exports = function (app, cb) {

  var Role = app.models.Role;
  var Promise = require('bluebird'); // jshint ignore:line

  Promise.resolve()
    .then(function () {
      return Role.findOrCreate(
        {where: {name: 'orgAdmin'}}, // either find
        { // or create
          name: 'orgAdmin',
          description: 'Org Admins' + '\n' +
          '- should be able to read-update-delete their organization' + '\n' +
          '- should be able to create-read-update-delete any users within their organization' + '\n' +
          '- should be able to add new users to their organization'
        }
      );
    })
    .spread(function (created, found) {
      return Role.findOrCreate(
        {where: {name: 'orgUser'}}, // either find
        { // or create
          name: 'orgUser',
          description: 'Org Users' + '\n' +
          '- should be able to create-read-update-delete any models within their organization, other than OrgModel'
        }
      );
    })
    .spread(function (created, found) {
        return cb();
    })
    .catch(function (error) {
        return cb(error);
    });

};
