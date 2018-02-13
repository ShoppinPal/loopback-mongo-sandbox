module.exports = function (OrgModel) {

    // Hiding methods and REST endpoints
    // https://loopback.io/doc/en/lb3/Exposing-models-over-REST.html#hiding-methods-and-rest-endpoints

    // Clients should not be able to create organizations
    OrgModel.disableRemoteMethodByName("create");                               // disables POST /OrgModels
    OrgModel.disableRemoteMethodByName("upsert");                               // disables PATCH /OrgModels
    OrgModel.disableRemoteMethodByName("replaceOrCreate");                      // disables PUT /OrgModels
    OrgModel.disableRemoteMethodByName("replaceById");                          // disables PUT /OrgModels/{id}
    OrgModel.disableRemoteMethodByName("upsertWithWhere");                      // disables POST /OrgModels/upsertWithWhere

    // Clients should not be able to discover organizations 
    OrgModel.disableRemoteMethodByName("count");                                // disables HEAD /OrgModels/count
    OrgModel.disableRemoteMethodByName("find");                                 // disables GET /OrgModels
    OrgModel.disableRemoteMethodByName("findOne");                              // disables GET /OrgModels/findOne
    OrgModel.disableRemoteMethodByName("findById");                             // disables GET /OrgModels/{id}
    OrgModel.disableRemoteMethodByName("exists");                               // disables HEAD /OrgModels/{id}

    // Certain organization operations should take place on server-side only
    // and aren't meant to be exposed to the client-side
    //OrgModel.disableRemoteMethodByName("update");                               // disables POST /OrgModels/update
    //OrgModel.disableRemoteMethodByName("prototype.updateAttributes");           // disables PATCH /OrgModels/{id}
    //OrgModel.disableRemoteMethodByName("deleteById");                           // disables DELETE /OrgModels/{id}    

    // An organization does not need login related functionality
    OrgModel.disableRemoteMethodByName('login');
    OrgModel.disableRemoteMethodByName('logout');
    OrgModel.disableRemoteMethodByName('confirm');
    OrgModel.disableRemoteMethodByName("resetPassword");        // disables POST /OrgModels/reset
    OrgModel.disableRemoteMethodByName("setPassword");          // disables POST /OrgModels/reset-password
    OrgModel.disableRemoteMethodByName("prototype.verify");     // disable POST /OrgModels/{id}/verify
    OrgModel.disableRemoteMethodByName("changePassword");       // disable POST /OrgModels/change-password

    // Don't expose what you don't need to
    OrgModel.disableRemoteMethodByName("createChangeStream");   // disable GET and POST /OrgModels/change-stream

    // An organization does not need accessToken related functionality
    OrgModel.disableRemoteMethodByName('prototype.__count__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__create__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__delete__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__destroyById__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__findById__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__get__accessTokens');
    OrgModel.disableRemoteMethodByName('prototype.__updateById__accessTokens');

    OrgModel.on('dataSourceAttached', function () {
        delete OrgModel.validations.password; // An organization does not require a password
    });

    OrgModel.on('attached', function () {

        var app = OrgModel.app;

        /**
         * Any OrgModel related validations should be placed here
         */
        OrgModel.validatesUniquenessOf('email');

    });
};
