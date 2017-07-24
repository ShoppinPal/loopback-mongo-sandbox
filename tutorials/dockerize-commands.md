# Motivation

1. `npm` does nothing meaningful to warn or enforce the values for `engines` or `engineStrict` in a `package.json` file.
2. Developers may use `nvm` to work across several nodejs versions so often they can make a mistake and install dependencies based on the wrong version of nodejs when switching between multiple projects.

# Solution

1. Specify the project's desired nodejs and npm versions in a `docker-compose.yml` file
2. Delegate commands to `docker-compose` in the CLI

# Steps

1. Add a `builder` service (name it however you like) with an appropriate nodejs version for your project:
    ```
    builder:
        image: node:6.10.1
        volumes:
            - .:/builder/
        working_dir: /builder/
    ```
2. Use it to delegate CLI commands in creative ways, examples:
    ```
    docker-compose run builder npm install
    docker-compose run builder npm install --prefix .
    docker-compose run builder npm shrinkwrap

    docker-compose run builder ./node_modules/.bin/bower install --allow-root
    docker-compose run builder npm run bower -- install --allow-root

    docker-compose run builder ./node_modules/.bin/gulp build-development
    docker-compose run builder npm run gulp -- build-development
    ```