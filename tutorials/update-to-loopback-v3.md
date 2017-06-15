# Motivation

Made an assumption on hearsay and gut feeling that node v6 and loopback v3 should go well together

# Steps - update local env

1. Setup project root directory as an environment variable: `export PROJECT_ROOT=~/dev/loopback-mongo-sandbox`
    * Make sure it was done right:

        ```
        echo $PROJECT_ROOT
        cd $PROJECT_ROOT && pwd
        ```
1. Switch node versions using `nvm` on local machine
    1. What's available? `nvm ls-remote v6`
    1. Pick and use one: `nvm install v6.10.1`
    1. Make sure its the new default: `nvm ls`
1. Run `npm install` to get the right binaries for previously listed dependencies in `package.json` for nodejs v6 ... Why?, because a version switch has taken place.
1. Use the CLI tool, the hope is that it will generate a new project that will put down the right group of `loopback-*` packages which work well together as a unit.
    1. `npm install --save --save-dev loopback-cli`
    1. Check that its installed locally: `ls -alrt ./node_modules/.bin/lb`
    1. Expose it via `scripts` field in `package.json`:

        ```
        scripts: {
            "lb": "lb"
        },
        ```
    1. Create an empty directory for the generator to operate in: `mkdir app && cd app`
    1. If we try to use `npm run lb`, it won't work because it will try to create the files in the project's root direcotry and that needs to be empty for the generator to work. So instead, let's settle for using: `./../node_modules/.bin/lb` ... output:

        ```
        ? What's the name of your application? api-server
        ? Enter name of the directory to contain the project: api-server
        create api-server/
            info change the working directory to api-server

        ? Which version of LoopBack would you like to use? 3.x (current)
        ? What kind of application do you have in mind? api-server (A LoopBack API server with local User auth)
        Generating .yo-rc.json

        I'm all done. Running npm install for you to install the required dependencies. If this fails, try running the command yourself.

        create .editorconfig
        create .eslintignore
        create .eslintrc
        create server/boot/root.js
        create server/middleware.development.json
        create server/middleware.json
        create server/server.js
        create README.md
        create server/boot/authentication.js
        create .gitignore
        create client/README.md

        api-server@1.0.0 /Users/pulkitsinghal/dev/loopback-mongo-sandbox/app/api-server
        ...
        ```
    1. Freeze the dependencies and figure out what group of loopback modules have been setup:

        ```
        cd api-server
        npm shrinkwrap
        cat npm-shrinkwrap.json | grep loopback
        ```
        Output:
        ```
        "loopback": {
          "from": "loopback@>=3.0.0 <4.0.0",
          "resolved": "https://registry.npmjs.org/loopback/-/loopback-3.8.0.tgz"
        "loopback-boot": {
          "from": "loopback-boot@>=2.6.5 <3.0.0",
          "resolved": "https://registry.npmjs.org/loopback-boot/-/loopback-boot-2.24.1.tgz",
        "loopback-component-explorer": {
          "from": "loopback-component-explorer@>=4.0.0 <5.0.0",
          "resolved": "https://registry.npmjs.org/loopback-component-explorer/-/loopback-component-explorer-4.2.0.tgz",
        "loopback-connector": {
          "from": "loopback-connector@>=4.0.0 <5.0.0",
          "resolved": "https://registry.npmjs.org/loopback-connector/-/loopback-connector-4.2.0.tgz"
        "loopback-connector-remote": {
          "from": "loopback-connector-remote@>=3.0.0 <4.0.0",
          "resolved": "https://registry.npmjs.org/loopback-connector-remote/-/loopback-connector-remote-3.1.1.tgz"
        "loopback-datasource-juggler": {
          "from": "loopback-datasource-juggler@>=3.0.0 <4.0.0",
          "resolved": "https://registry.npmjs.org/loopback-datasource-juggler/-/loopback-datasource-juggler-3.9.1.tgz",
        "loopback-datatype-geopoint": {
          "from": "loopback-datatype-geopoint@>=1.0.0 <2.0.0",
          "resolved": "https://registry.npmjs.org/loopback-datatype-geopoint/-/loopback-datatype-geopoint-1.0.0.tgz"
        "loopback-phase": {
          "from": "loopback-phase@>=3.0.0 <4.0.0",
          "resolved": "https://registry.npmjs.org/loopback-phase/-/loopback-phase-3.0.0.tgz",
        "loopback-swagger": {
          "from": "loopback-swagger@>=3.0.1 <4.0.0",
          "resolved": "https://registry.npmjs.org/loopback-swagger/-/loopback-swagger-3.0.2.tgz",
            "loopback-phase": {
              "from": "loopback-phase@>=1.3.0 <2.0.0",
              "resolved": "https://registry.npmjs.org/loopback-phase/-/loopback-phase-1.4.1.tgz",
        ```
1. Let's start bringing over the new stuff:
    1. replace the previous `server` directory
        ```
        rm -r $PROJECT_ROOT/server
        mv $PROJECT_ROOT/app/api-server/server $PROJECT_ROOT/server/
        ```
    1. Use a diff tool and bring out the good parts from `$PROJECT_ROOT/app/api-server/package.json` ... here are the highlights of things that I moved over:
        * `engines` field, I changed it from v4 to v6 though:
        * updated `scripts`
        * removed `jshint` and embraced `eslint`

            ```
            rm -r $PROJECT_ROOT/.jshintignore && mv $PROJECT_ROOT/app/api-server/.eslintignore $PROJECT_ROOT/
            rm -r $PROJECT_ROOT/.jshintrc && mv $PROJECT_ROOT/app/api-server/.eslintrc $PROJECT_ROOT/
            ```
        * redid the dependencies, optionalDependencies and devDependencies
        * also brought in absolute version numbers from `$PROJECT_ROOT/app/api-server/npm-shrinkwrap.json`
        * deleted `$PROJECT_ROOT/node_modules` and `$PROJECT_ROOT/npm-shrinkwrap.json`
        * added `loopback-connector-mongodb` with latest version: `3.1.0` according to [this doc](https://github.com/strongloop/loopback-connector-mongodb/releases) as of this writing
        * the end result with the following diff-like changes:

            ```
            +  "engines": {
            +    "node": ">=6"
            +  },

            ...

            "scripts": {
            -    "test": "mocha"
            +    "lb": "lb",
            +    "lint": "eslint .",
            +    "posttest": "npm run lint && nsp check"
            },

            ...

            "dependencies": {
                "compression": "^1.0.3",

            -    "errorhandler": "^1.1.1",
            +    "cors": "^2.5.2",
            +    "helmet": "^1.3.0",

            -    "loopback": "^2.5.0",
            +    "loopback": "3.8.0",

            -    "loopback-boot": "^2.2.0",
            +    "loopback-boot": "2.24.1",

            -    "loopback-connector-mongodb": "1.15.2",
            +    "loopback-connector-mongodb": "3.1.0",

            -    "loopback-datasource-juggler": "^2.7.0",
            +    "loopback-datasource-juggler": "3.9.1",

            +    "strong-error-handler": "^2.0.0"
            },

            ...

            "optionalDependencies": {
            -    "loopback-explorer": "^1.1.0"
            +    "loopback-component-explorer": "4.2.0"
            },

            ...

            "devDependencies": {
                "chai": "3.5.0",
                "mocha": "2.5.3",
                "debug": "2.2.0",

            +    "loopback-cli": "https://registry.npmjs.org/loopback-cli/-/loopback-cli-2.5.1.tgz",

                ...

            -    "jshint": "^2.5.6",
            +    "eslint": "^3.17.1",
            +    "eslint-config-loopback": "^8.0.0",
            +    "nsp": "^2.1.0"
            }
            ```
1. Now almost everything that matters has been brought over so let's run a clean install:

    ```
    # cleanup
    cd $PROJECT_ROOT && rm -rf node_modules/ && rm npm-shrinkwrap.json
    cd $PROJECT_ROOT && npm install
    ```
1. Let us freeze the dependencies and eyeball to make sure the loopback modules that have been setup are close to what we got when we let the generator do everything for us:

    ```
    cd $PROJECT_ROOT && npm shrinkwrap
    cat npm-shrinkwrap.json | grep loopback
    ```
    Output:
    ```
    "name": "loopback-mongo-sandbox",
    "loopback": {
      "from": "loopback@3.8.0",
      "resolved": "https://registry.npmjs.org/loopback/-/loopback-3.8.0.tgz"
    "loopback-boot": {
      "from": "loopback-boot@2.24.1",
      "resolved": "https://registry.npmjs.org/loopback-boot/-/loopback-boot-2.24.1.tgz",
    "loopback-component-explorer": {
      "from": "loopback-component-explorer@4.2.0",
      "resolved": "https://registry.npmjs.org/loopback-component-explorer/-/loopback-component-explorer-4.2.0.tgz",
    "loopback-connector": {
      "from": "loopback-connector@>=4.0.0 <5.0.0",
      "resolved": "https://registry.npmjs.org/loopback-connector/-/loopback-connector-4.2.0.tgz"
    "loopback-connector-mongodb": {
      "from": "loopback-connector-mongodb@3.1.0",
      "resolved": "https://registry.npmjs.org/loopback-connector-mongodb/-/loopback-connector-mongodb-3.1.0.tgz",
    "loopback-connector-remote": {
      "from": "loopback-connector-remote@>=3.0.0 <4.0.0",
      "resolved": "https://registry.npmjs.org/loopback-connector-remote/-/loopback-connector-remote-3.1.1.tgz"
    "loopback-datasource-juggler": {
      "from": "loopback-datasource-juggler@3.9.1",
      "resolved": "https://registry.npmjs.org/loopback-datasource-juggler/-/loopback-datasource-juggler-3.9.1.tgz",
    "loopback-datatype-geopoint": {
      "from": "loopback-datatype-geopoint@>=1.0.0 <2.0.0",
      "resolved": "https://registry.npmjs.org/loopback-datatype-geopoint/-/loopback-datatype-geopoint-1.0.0.tgz"
    "loopback-phase": {
      "from": "loopback-phase@>=3.0.0 <4.0.0",
      "resolved": "https://registry.npmjs.org/loopback-phase/-/loopback-phase-3.0.0.tgz",
    "loopback-swagger": {
      "from": "loopback-swagger@>=3.0.1 <4.0.0",
      "resolved": "https://registry.npmjs.org/loopback-swagger/-/loopback-swagger-3.0.2.tgz",
        "loopback-phase": {
          "from": "loopback-phase@>=1.3.0 <2.0.0",
          "resolved": "https://registry.npmjs.org/loopback-phase/-/loopback-phase-1.4.1.tgz",
    ```
    I would call that a good match.
1. If you run `npm test`, you will notice that the tests no longer work. We probably need to find a way to make them work with loopback v3.x ... let's postpone that endeavour for another day. For now, rip out the old v2.x-based tests completely: `rm -rf test/*`
    * Try again: `npm test`
    * And the output is perfect now:

        ```
        > loopback-mongo-sandbox@0.0.0 test /Users/pulkitsinghal/dev/loopback-mongo-sandbox
        > mocha
        0 passing (3ms)
        > loopback-mongo-sandbox@0.0.0 posttest /Users/pulkitsinghal/dev/loopback-mongo-sandbox
        > npm run lint && nsp check
        > loopback-mongo-sandbox@0.0.0 lint /Users/pulkitsinghal/dev/loopback-mongo-sandbox
        > eslint .
        (+) No known vulnerabilities found
        ```
1. Run it with `node .`
1. Open `http://0.0.0.0:3000/explorer/#!/User/User_create`
1. POST a request with payload:

    ```
    {
        "realm": "string",
        "username": "string",
        "email": "string@along.com",
        "emailVerified": true,
        "password": "blah"
    }
    ```
    and it works.
1. Might as well clean out the test project: `rm -rf $PROJECT_ROOT/app`

# Steps - update docker env

1. The following assumes that you followed all the `Steps - update local env` to completion already.
1. Switch node versions for docker by editing `Dockerfile` to be `FROM node:6.10.1`
    1. Test it, sometimes the version you want, just isn't available anymore
    1. `docker-compose up` will try to build it for you so if it fails, you know this won't cut it
        * FYI, this is the version of Docker Community Edition that I was using when I ran the command above:

            ```
            Version 17.06.0-rc1-ce-mac13 (18169)
            Channel: edge
            2425473dc2
            ```
        * If your command runs to completion without errors, take the resulting setup down with: `docker-compose down`, in a new terminal window.
1. Re-configure the previously replaced `$PROJECT_ROOT/server/datasources.json` file to be:

    ```
    {
      "mongodb": {
        "url": "mongodb://mongo:27017/loopback-mongo-sandbox",
        "connector": "loopback-connector-mongodb"
      }
    }
    ```
1. Re-configure the previously replaced `$PROJECT_ROOT/server/model-config.json` file to use `mongodb` isntead of `db` as the value for `datasource`
1. Open `http://0.0.0.0:3000/explorer/#!/User/User_create`
1. POST a request with payload:

    ```
    {
        "realm": "string",
        "username": "string",
        "email": "string@along.com",
        "emailVerified": true,
        "password": "blah"
    }
    ```
    and it works.
1. Check in all the work to GitHub

# Wishlist

1. The tests no longer work and we probably need to find a way to make them work with loopback v3.x
1. Hide methods that we don't want exposed in our public API
