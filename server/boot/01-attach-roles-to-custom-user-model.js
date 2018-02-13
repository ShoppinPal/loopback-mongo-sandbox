module.exports = function(app){
  var RoleMapping = app.models.RoleMapping;
  var UserModel = app.models.UserModel;
  var Role = app.models.Role;

  RoleMapping.belongsTo(UserModel);
  UserModel.hasMany(RoleMapping, {foreignKey: 'principalId'});
  UserModel.hasMany(Role, {as:'roles', through: RoleMapping, foreignKey: 'principalId'});
  Role.hasMany(UserModel, {through: RoleMapping, foreignKey: 'roleId'});
};