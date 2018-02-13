# Outline

* [Motivation](#motivation)
* [Research &amp; References](#research--references)
* [Solution](#solution)
* [Steps](#steps)
* [Wishlist](#wishlist)

# Motivation

1. Users can belong to an organization.
2. We can have multiple organizations in the same loopback server/db.
3. Any data created for the organization or any data created by the users of that organization should be segragated from the the users of another organization.
4. If we want, we should be able to configure the users that belong to the same organization to view any data that other users of that organization created.

# Research & References

* https://github.com/ShoppinPal/multi-tenant-loopback-example
* https://github.com/aquid/multi-tenancy-loopback
* https://github.com/ShoppinPal/multi-tenant-loopback-example-two
* https://loopback.io/doc/en/lb3/Using-current-context.html
* https://github.com/haxejs/dtrCloud/blob/351138ec69697ec0c04a4e6c5b4e862b35cdfd40/server/models/customer.ts#L161
* Tools
  * https://stedolan.github.io/jq/

# Solution

## Conceptual Overview

* Use an `organization` model and all API calls should go through it. All the APIs for other models should be disabled. Other models are only accesible through [relations](https://loopback.io/doc/en/lb3/Creating-model-relations.html) to an `organization`.
  * In order to use `belongsTo` relation, the `organization` model needs to be an extension of the `user` model.
    * All the inherited funtionality, which is unneccesary, will be hidden away and/or disabled.
* `Role Resolvers` should make an additional comparison and validate if the user belongs to the organization whose data is being accessed.
* It is not recommended to have multiple types of user models, for ex: `Employee extends User` and `Customer extends User`.
  * We recommend keeping only one user model and relying on roles instead, for ex: `Employee is a role`, `Customer is a Role`.
  * But if you insist on fragmenting the users across multiple different models then `role resolvers` must search each type of user model.

## Implementation Overview
1. Update the ACLs for other models to `deny all access`.
    * Do not rely on `model-config.json` to disable access to models because it has an unintended side-effect where the generator for angular `lb-services` file will stop generating methods for accessing these related models through `organization`!
1. Setup ACLs in `organization` for related methods accessed through it and restrict to appropriate roles as needed.
    * Using the array syntax will help you avoid cumbersome and lengthy edits.
1. Use a mixin with `createOptionsFromRemotingContext` method overridden to "leak" any information that you need, into server-side context/options.
1. If you want to test multi tenancy via CURL comamnds, refer to this [gist](https://gist.github.com/pulkitsinghal/c5679d6c69aa7db51dd7e254bdc22daa)

# Steps

1. The work on this feature + tutorial started at a specific point in time: [pre-multi-tenancy](https://github.com/ShoppinPal/loopback-mongo-sandbox/releases/tag/). So if you want to follow along step-by-step and build the complete feature yourself, then you must checkout the code starting from that point in time.
    * Local Setup
        ```
        git clone https://github.com/ShoppinPal/loopback-mongo-sandbox.git multi-tenancy-exercise
        cd add-multi-tenancy-exercise
        git checkout tags/pre-multi-tenancy -b multi-tenancy-exercise
        ```
    * [Remote Setup](https://github.com/ShoppinPal/loopback-mongo-sandbox/blob/develop/readme/local-ide-remote-docker.md)
        * `LMS_PROJECT_NAME` should be `multi-tenancy-exercise`
        * After [Step 4](https://github.com/ShoppinPal/loopback-mongo-sandbox/blob/develop/readme/local-ide-remote-docker.md) run:
            ```
            git checkout tags/pre-multi-tenancy -b multi-tenancy-exercise
            ```

1. Remove previous files related to the employee model:

    ```
    cd $LMS_HOME
    rm common/models/*
    ```
1. Remove the following lines referencing employee model from `server/model-config.json`:

    ```
    , "Employee": {
        "dataSource": "mongodb",
        "public": true
    }
    ```
1. Create `.env` file:

    ```
    NODE_ENV=local
    DEBUG=loopback:security:*,common:models:*
    ```
1. Install known dependencies: `docker-compose run builder npm install`
1. Create a file named `org-model.json`
    * Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/5eae5075c90ad81280775d4e17b9051dbba8b7ca/org-model.1.json && \
          mv org-model.1.json common/models/org-model.json
        ```
    * When you look over the file, take note:
        * it uses the built-in `User` as its `base` which conceptually means `OrgModel extends User`
        * it has `name` and `email` properties
1. Create a file named `org-model.js`
    * Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/22743db03c33bb744b755bda96c2b7004ce686f8/org-model.1.js && \
          mv org-model.1.js common/models/org-model.js
        ```
    * When you look over the file, take note:
        * any endpoints which were inherited from the built-in `User` model and are irrelevant ... are disabled
        * any validations which were inherited from the built-in `User` model and are irrelevant ... are disabled
        * it only cares about having a unique `email`
1. Add the following lines referencing `OrgModel` to `server/model-config.json`:

    ```
    , "OrgModel": {
      "dataSource": "mongodb",
      "public": true
    }
    ```
1. Find the block referencing `User` in `server/model-config.json` and use `"public": false` to hide it from public view, like so:

    ```
    "User": {
      "dataSource": "mongodb",
      "public": false
    },
    ```
1. Let's bring up the server to see what we have thus far: `docker-compose up`
1. When you substitute `host` in `http://<host>:3000/explorer/#/OrgModel` and open the appropriate URL in your browser:
    1. `OrgModel` should be the only entity exposed to clients
    1. You should NOT see any inherited endpoints (like login/logout) being exposed for OrgModel
1. Go ahead and shut down the server: `ctrl+c` and/or `docker-compose down`
    1. Thus far we've created an `OrgModel` that inherits from `User` and doesn't expose any inherited endpoints
1. Now we will add a `UserModel` and tie it to `OrgModel` with a `hasMany` relationship
    1. Install `joi`, which we will use in our models for validation:

        ```
        docker-compose run builder npm install --save --save-exact joi@13.1.1
        ```
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/0b59301a0ee628277bbb0a4e0945584eab997376/org-model.2.json && \
            mv org-model.2.json common/models/org-model.json && \
          curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/18dbad917c7fdb63c4abdb886a332f4d39b1d9a5/user-model.1.json && \
            mv user-model.1.json common/models/user-model.json && \
          curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/3b83461f94589bd51c66a15ef157d10179b1c57d/user-model.1.js && \
            mv user-model.1.js common/models/user-model.js && \
          curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/8d59fa74b987f7e7a35580f8909444223fe35cb2/01-attach-roles-to-custom-user-model.js && \
            mv 01-attach-roles-to-custom-user-model.js server/boot/01-attach-roles-to-custom-user-model.js
        ```
    1. When you look over the files, take note:
        * a `hasMany users` relationship is setup with `UserModel` in `common/models/org-model.json`
        * a `belongsTo org` relationship is setup with `OrgModel` in `common/models/user-model.json`
        * `common/models/user-model.json` has been setup to `DENY any and all requests which we do not explicitly ALLOW`
        * `common/models/user-model.json` has been setup so that `Anyone can signup`
        * `common/models/user-model.js` disables endpoints to create users so clients cannot create them directly
        * `common/models/user-model.js` has a remote method to allow user `signup`
            * an organization is auto-created first and the user is created afterwards
        * `server/boot/01-attach-roles-to-custom-user-model.js` attaches `Role` to our `UserModel` via `RoleMapping`
            * there is some history in loopback-v2.x behind `RoleMapping` fields being incorrectly cross-cast between `String` and `ObjectId` when working with mongodb so even though we are now on loopback-v3.x, I sortof take this fix for granted and haven't really verified what problems might or might not occur without it.
1. Add the following lines referencing `UserModel` to `server/model-config.json`:

    ```
    , "UserModel": {
      "dataSource": "mongodb",
      "public": true
    }
    ```
1. Let's bring up the server to see what we have thus far: `docker-compose down && docker-compose up`
1. When you substitute `host` in `http://<host>:3000/explorer/` and open the appropriate URL in your browser:
    1. `UserModel` should be exposed to clients in addition to `OrgModel`
    1. By expanding `OrgModel`, you should see additional endpoints which show that you can CRUD users in a specific organization:
        * `/OrgModels/{id}/users`
        * `/OrgModels/{id}/users/{fk}`
1. Go ahead and shut down the server: `ctrl+c` and/or `docker-compose down`
    1. Thus far we've created `OrgModel` and `UserModel`
    1. But the security and data segregation features, required in a multi-tenant environment, are still missing.
1. Let's define two roles `orgAdmin` and `orgUser` with the following goals
    1. Org Admins
        - should NOT be able to create organizations
        - should be able to read-update-delete their organization
        - should be able to create-read-update-delete any users within their organization
        - should be able to add new users to their organization
        - should NOT have access to data from other organizations
    1. Org Users
        - should be able to create-read-update-delete any models within their organization, other than OrgModel
        - should NOT have access to data from other organizations
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/c5529ff1424007cb60ede6932ff054113523f50a/02-add-default-roles.js && \
            mv 02-add-default-roles.js server/boot/02-add-default-roles.js
        ```
1. Let's implement `role-resolvers` that verify a client's identity, the target model and client's role ... then either `ALLOW` or `DENY` the API request
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/c5529ff1424007cb60ede6932ff054113523f50a/03-add-role-resolvers-for-org-model.js && \
            mv 03-add-role-resolvers-for-org-model.js server/boot/03-add-role-resolvers-for-org-model.js
        ```
1. We are now ready to tie roles with ACLs and get the desired effects
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/c5529ff1424007cb60ede6932ff054113523f50a/org-model.3.json && \
            mv org-model.3.json common/models/org-model.json
        ```
    1. When you look over the files, take note:
        * `common/models/org-model.json` has ACLs defined which make sure that only Org Admins can CRUD users via the REST API
1. But we haven't assigned the roles to users anywhere!
    1. We should make sure that anyone who signsup will get `orgAdmin` role
        1. We can implement this in the `signup` method in UserModel
    1. And any user should by default have the `orgUser` role
        1. We can implement this by overriding the `create` method in UserModel
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/0a0db2c2546f14bc23f9b823c85f417e0635cb86/user-model.2.js && \
            mv user-model.2.js common/models/user-model.js
        ```
1. Let's bring up the server to see what we have thus far: `docker-compose down && docker-compose up`
1. When you substitute `host` in `http://<host>:3000/explorer/` and open the appropriate URL in your browser:
    1. You won't see any "visible" changes in the endpoints but invoking them now offers data segregation
    1. Let's run some tests to prove it
        1. You will need to install the `jq` [tool](https://stedolan.github.io/jq/) in order to massage the JSON and follow along with these `curl` commands
        1. Make sure that you watch the server logs while executing these commands to see the access control logs live and learn
        1. edit the following as-needed to setup HOST_URL && make sure that HOST_URL is setup:

            ```
            export HOST_URL=http://localhost:3000 && echo "HOST_URL=$HOST_URL"
            ```
        1. orgAdminA signs-up
            ```
            export ORG_ADMIN_A=`curl -X POST \
                "$HOST_URL/api/1.0/UserModels/signup" \
                --header "Content-Type: application/json" \
                --header "Accept: application/json" \
                -d "{\"email\":\"orgAdminA@orgA.com\", \"username\":\"orgAdminA@orgA.com\", \"password\":\"orgAdminA\", \"orgName\":\"Org A\"}"` && \
            echo "ORG_ADMIN_A=$ORG_ADMIN_A" && \
            export ORG_ADMIN_A_ORG_ID=`echo $ORG_ADMIN_A | \
                jq -r ".orgModelId"` && \
            echo "ORG_ADMIN_A_ORG_ID=$ORG_ADMIN_A_ORG_ID" && \
            export ORG_ADMIN_A_ID=`echo $ORG_ADMIN_A | \
                jq -r ".id"` && \
            echo "ORG_ADMIN_A_ID=$ORG_ADMIN_A_ID"
            ```
        1. orgAdminA logs in

            ```
            export ORG_ADMIN_A_TOKEN=`curl -X POST \
                "$HOST_URL/api/1.0/UserModels/login" \
                --header "Content-Type: application/json" \
                --header "Accept: application/json" \
                -d "{\"username\":\"orgAdminA@orgA.com\", \"password\":\"orgAdminA\"}" | \
            jq -r ".id"` && \
            echo "ORG_ADMIN_A_TOKEN=$ORG_ADMIN_A_TOKEN"
            ```
        1. orgAdminB signs-up

            ```
            export ORG_ADMIN_B=`curl -X POST \
                "$HOST_URL/api/1.0/UserModels/signup" \
                --header "Content-Type: application/json" \
                --header "Accept: application/json" \
                -d "{\"email\":\"orgAdminB@orgB.com\", \"username\":\"orgAdminB@orgB.com\", \"password\":\"orgAdminB\", \"orgName\":\"Org B\"}"` && \
            echo "ORG_ADMIN_B=$ORG_ADMIN_B" && \
            export ORG_ADMIN_B_ORG_ID=`echo $ORG_ADMIN_B | jq -r ".orgModelId"` && \
                echo "ORG_ADMIN_B_ORG_ID=$ORG_ADMIN_B_ORG_ID" && \
            export ORG_ADMIN_B_ID=`echo $ORG_ADMIN_B | jq -r ".id"` && \
                echo "ORG_ADMIN_B_ID=$ORG_ADMIN_B_ID"
            ```
        1. orgAdminB logs in

            ```
            export ORG_ADMIN_B_TOKEN=`curl -X POST \
            "$HOST_URL/api/1.0/UserModels/login" \
            --header "Content-Type: application/json" \
            --header "Accept: application/json" \
            -d "{\"username\":\"orgAdminB@orgB.com\", \"password\":\"orgAdminB\"}" | \
            jq -r ".id"`  && \
            echo "ORG_ADMIN_B_TOKEN=$ORG_ADMIN_B_TOKEN"
            ```
        1. orgAdminA can create users within its own organization

            ```
            curl -w "\n" \
            -X POST \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/users?access_token=$ORG_ADMIN_A_TOKEN" \
            --header "Content-Type: application/json" \
            --header "Accept: application/json" \
            -d '{"username": "orgUserA1@orgA.com", "email": "orgUserA1@orgA.com", "password": "orgUserA1"}'
            ```
        1. orgAdminA can NOT create users in other organizations

            ```
            curl -w "\n" \
            -X POST \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_B_ORG_ID/users?access_token=$ORG_ADMIN_A_TOKEN" \
            --header "Content-Type: application/json" \
            --header "Accept: application/json" \
            -d '{"username": "orgUserB1@orgB.com", "email": "orgUserB1@orgB.com", "password": "orgUserB1"}'
            ```
        1. orgAdminA can list all users within its own organization

            ```
            curl -w "\n" \
            -X GET \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/users?access_token=$ORG_ADMIN_A_TOKEN" \
            --header "Content-Type: application/json"
            ```
        1. orgUserA1 logs in

            ```
            export ORG_USER_A1_TOKEN=`curl -X POST \
                "$HOST_URL/api/1.0/UserModels/login" \
                --header "Content-Type: application/json" \
                --header "Accept: application/json" \
                -d "{\"username\":\"orgUserA1@orgA.com\", \"password\":\"orgUserA1\"}" | \
            jq -r ".id"` && \
            echo "ORG_USER_A1_TOKEN=$ORG_USER_A1_TOKEN"
            ```
        1. orgUserA1 can NOT create other users, this request should fail

            ```
            curl -w "\n" \
            -X POST \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/users?access_token=$ORG_USER_A1_TOKEN" \
            --header "Content-Type: application/json" \
            --header "Accept: application/json" \
            -d '{"username": "storeAdminA4@orgA.com", "email": "storeAdminA4@orgA.com", "password": "storeAdminA4"}'
            ```
        1. orgUserA1 can NOT list users within its own organization because its an `orgUser`

            ```
            curl -w "\n" \
            -X GET \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/users?access_token=$ORG_USER_A1_TOKEN" \
            --header "Content-Type: application/json"
            ```
        1. orgAdminA can list all users within its own organization because its an `orgAdmin`

            ```
            curl -w "\n" \
            -X GET \
            "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/users?access_token=$ORG_ADMIN_A_TOKEN" \
            --header "Content-Type: application/json" | jq .
            ```
1. At this point this starter project has become multi-tenant capable but we still haven't demonstrated how `orgUser`s can access common models within an organization.
1. Let's create a hypothecial model named StuffModel which should be CRUD by any and all users within an organization but not by outsiders.
    1. Add the following lines referencing `StuffModel` to `server/model-config.json`:

        ```
        , "StuffModel": {
          "dataSource": "mongodb",
          "public": true
        }
        ```
    1. Download the raw source code:

        ```
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/97216894e5d3c0ce96806d8ecbc6517fd5e13563/stuff-model.js && \
            mv stuff-model.js common/models/stuff-model.js && \
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/12241162cd83c7340c5f3bc74848089a2886de96/stuff-model.json && \
            mv stuff-model.json common/models/stuff-model.json && \
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/12241162cd83c7340c5f3bc74848089a2886de96/org-model.4.json && \
            mv org-model.4.json common/models/org-model.json
        ```
    1. When you look over the files, take note:
        * a `hasMany users` relationship is setup with `StuffModel` in `common/models/org-model.json`
        * a `belongsTo org` relationship is setup with `OrgModel` in `common/models/stuff-model.json`
        * all direct API requests will be denied in `common/models/stuff-model.json`
        * OrgModel's ACLs have been enhanced to allow access for `orgUser`s through related API requests in `common/models/org-model.json`
            ```
            {
                "description": "Users can CRUD stuff within their own org",
                "accessType": "EXECUTE",
                "principalType": "ROLE",
                "principalId": "orgUser",
                "permission": "ALLOW",
                "property": [
                    "__count__stuffModels",
                    "__create__stuffModels",
                    "__delete__stuffModels",
                    "__destroyById__stuffModels",
                    "__findById__stuffModels",
                    "__get__stuffModels",
                    "__updateById__stuffModels"
                ]
            } 
            ```
1. Let's bring up the server to see what we have thus far: `docker-compose down && docker-compose up`
1. When you substitute `host` in `http://<host>:3000/explorer/` and open the appropriate URL in your browser:
    1. You will see additional related endpoints exposed inside OrgModel for performing CRUD on StuffModel.
    1. Data segregation will be enforced by the server side.
    1. Let's run some tests to prove it
        1. You will need to install the `jq` [tool](https://stedolan.github.io/jq/) in order to massage the JSON and follow along with `curl` commands
        1. Make sure that you watch the server logs while executing commands to see the access control logs live and learn
        1. You can copy/paste and run the commands provided [here](https://gist.githubusercontent.com/pulkitsinghal/c5679d6c69aa7db51dd7e254bdc22daa/raw/4a75e01e8a48753c9ecc3b29d6855ee6d5cc69cc/test.2.sh)
1. You can remove StuffModel and revert back with:

    1. Remove the following lines referencing StuffModel model from `server/model-config.json`:

        ```
        , "StuffModel": {
            "dataSource": "mongodb",
            "public": true
        }
        ```
    1. Remove StuffModel files and its reference from OrgModel
        ```
        rm common/models/stuff-model.* && \
        curl -L -O https://gist.githubusercontent.com/pulkitsinghal/1152cad3b66a640a0d52e007ee8aa373/raw/c5529ff1424007cb60ede6932ff054113523f50a/org-model.3.json && \
            mv org-model.3.json common/models/org-model.json
        ```

# Wishlist

Lofty goals that we will NOT tackle in this tutorial:

1. Mocha tests
1. Avoiding signup hijacking when someone signs-up before the true owner of an email and email verification is not mandatory
1. Avoiding signup collisions when many actors attempt to signup with the same email within a short duration of one another and the email verification is mandatory
    1. if a bad actor signsup with true@owner.com email then they might effectively blocking the true owner from signing up
        1. a workaround could be to create `SignupModel extends user` and only create `UserModel extends user` upon verification
        1. this way we can verify if the account is already taken by searching against `UserModel` but leave the actual `UserModel` creation until after email verification
    1. since its the true actor who will always receive the email, even when it wasn't the one to signup first ... it must then have a way to immediately change the password after email verification from within their inbox
        1. a workaround could be to only create `UserModel` upon verification and therefore only collect the password at that time
        1. the email would say something like if you didn't signup with us then please ignore ... otherwise click the link to verify your email and then create your account with a secure password
            1. if user selects `i didn't signup` or something similar then use the metadata from the original `SignupModel` to block signups for that IP+email combination ... or something of the sort
1. Handing off the resposibility of an orgAdmin
    1. to someone who is already a verified user and part of this organization
    1. to someone who isn't yet verified or isn't yet part of this organization or both
1. Being an user across organizations
1. Being an admin across organizations, owning multiple organizations
1. How can users create data that is only accessible to them and not other users of their organization?
    1. is this impossible to do in the loopback framework alongside multi-tenancy?
    1. can there be infinitely deep relational chains to discern ownership, like:
        1. GET or POST /api/1.0/org/ORG_ID/stuff - common to all of org's users
        1. GET or POST /api/1.0/org/ORG_ID/user/USER_ID/stuff - private for one of the org's users
        1. Would such an approach lead to slow DB access as compared to queries that are implemented directly in remote methods and circumvent how the loopback ORM might build them?
1. Can `findOne` be used in a related model's RESTful URL?

    ```
    #10 orgAdminA can NOT use FIND-ONE to get stuff from another org
    #   filter={"where":{"name":{"like":"stuff for orgB"}}}
    #   SHOULD return 401 with AUTHORIZATION_REQUIRED

    curl -w "\n" \
      -X GET \
      "$HOST_URL/api/1.0/StuffModels/findOne?filter=%7B%22where%22%3A%7B%22name%22%3A%7B%22like%22%3A%22stuff%20for%20orgB%22%7D%7D%7D&access_token=$ORG_ADMIN_A_TOKEN" \
      --header "Accept: application/json"

    curl -w "\n" \
      -X GET \
      "$HOST_URL/api/1.0/OrgModels/$ORG_ADMIN_A_ORG_ID/stuffModels/findOne?filter=%7B%22where%22%3A%7B%22name%22%3A%7B%22like%22%3A%22stuff%20for%20orgB%22%7D%7D%7D&access_token=$ORG_ADMIN_A_TOKEN" \
      --header "Accept: application/json"
    ```
1. Use a workflow where users have better control over which organization they join
    1. User signs up - organizaton is nether immediately created nor assigned
    1. User must activate account by confirming via email (later even SMS can be used an alternative)
    1. On server side as part of post-confirmation or post-verify ... code can run to attach user with an org
    1. User can choose to have its own organization (entity is auto-created but user can assign name and other attributes)
    1. Or the user can manually provide the invitation code to join a pre-existing organization
    1. Or the link in the email confirmation can already have invitation code embedded into it, therefore providing a seamless experience for joining that organization as part of activation
1. Support for adding/editing ACLs dynamically
    1. https://github.com/strongloop/loopback/issues/2055
    1. https://github.com/strongloop/loopback/issues/2830
1. Support for uploading new role-resolvers
    1. nodemon
    1. WYSIWYG editor
    1. sandbox for testing before deploying
    1. rolling deployments
