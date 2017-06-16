# Motivation

Want to implement api versioning. But this often means different things to different people, so I also want to document the usecases, their respective workarounds/solutions and not just jot down a preferred solution.

# Research

## Usecases

1. Separate loopback service per version. Each service can be scaled independently.
1. One loopback service supports multiple versions. This service can still be scaled.
1. One loopback service supports multiple domains
    * https://github.com/strongloop/loopback/issues/698#issuecomment-67325998
    * https://github.com/strongloop/loopback/issues/698#issuecomment-67619085
        > We don't want to expose the same model on multiple domains. A model must be exposed in one and only one domain.
1. _To be determined..._

### Separate loopback service per version (SLSPS)

#### Scenario A (SLSPS-A)
* /api/1.0
    * /api/1.0/modelA/operationOne
    * /api/1.0/modelA/operationTwo
* /api/2.0
    * supports all of the previous endpoints
        * /api/2.0/modelA/operationOne
            * either, like a wrapper which proxies or reroutes
                * /api/2.0/modelA/operationOne `-->` /api/1.0/modelA/operationOne
            * or, by simply executing the code which was copy/pasted without any changes to it
                * /api/2.0/modelA/operationOne `-->` run the code
    * replaces previous endpoints or adds new endpoints
        * /api/2.0/modelA/operationTwo
        * /api/2.0/modelA/operationThree
        * /api/2.0/modelA/operationFour

#### Scenario B (SLSPS-B)
* /api/1.0
    * /api/1.0/modelA/operationOne
    * /api/1.0/modelA/operationTwo
* /api/2.0
    * only replaces previous endpoints or adds new endpoints
        * /api/2.0/modelA/operationTwo
        * /api/2.0/modelA/operationThree
        * /api/2.0/modelA/operationFour

### Separate loopback service per version (SLSPS)

## Workarounds & Solutions

1. Separate loopback service per version:
    * Change `"restApiRoot": "/api"`
        * can do this in: `config.json` or `config.<env>.js`
        * it can be changed to:
            * `"restApiRoot": "/api/1.0"`, or
            * `"restApiRoot": "/api/2.0"` etc.
            * depending on which loopback service is being configured.
    * Autoset it based on your application's `major` version in package.json.
        * https://loopback.io/doc/en/lb3/Versioning-your-API.html
1. One loopback service supports multiple versions. This service can still be scaled.
    * Hints are here, I haven't tested them: https://github.com/strongloop/loopback/issues/2483
1. One loopback service supports multiple domains
    * Use `sharedClass.http.path`
        * https://github.com/strongloop/loopback/issues/698#issuecomment-67475543
        * https://github.com/strongloop/loopback/issues/698#issuecomment-67645541
        * https://github.com/strongloop/loopback/issues/698#issuecomment-68087181
        * There is even a [test case](https://github.com/PradnyaBaviskar/loopback/commit/701661d49923ebe2bcb88c51d22c2bd51a396769) to verify per-model prefix for the REST path. Further details are [here](https://github.com/strongloop/loopback/pull/1039).
    * Use `plural`
        * https://github.com/strongloop/loopback/issues/698#issuecomment-67475031
        * https://github.com/strongloop/loopback/issues/698#issuecomment-68067683

# Steps

1. Setup project root directory as an environment variable: `export PROJECT_ROOT=~/dev/loopback-mongo-sandbox`
    * Make sure it was done right:

        ```
        echo $PROJECT_ROOT
        cd $PROJECT_ROOT && pwd
        ```
1. Changed `"restApiRoot": "/api"` to `"restApiRoot": "/api/1.0",` in `config.json`
1. If its not running, run `docker-compose up`
1. Open `http://0.0.0.0:3000/explorer/#!/User/User_create`
1. POST a request with payload:

    ```
    {
        "realm": "string",
        "username": "twoString",
        "email": "twoString@along.com",
        "emailVerified": true,
        "password": "blah"
    }
    ```
    and it works. *NOTICE* the URL it used to make the request, has `1.0` in it: `http://0.0.0.0:3000/api/1.0/Users?access_token=xxx`
1. Check in all the work to GitHub

# Wishlist

1. Set up two services, one with `1.0` and another with `2.0` to showcase the research above

