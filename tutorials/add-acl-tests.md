# Steps

1. In order to test endpoints and their respective ACLs, we must first try to load the loopback server inside our test.
    1. Create `test/test.js` and add the following content:
      ```
      var app;
      describe('describe', function(){
        before('', function(){
          app = require('./../server/server.js');
        });
        it('it', function(){
        });
      });    
      ```
1. Install dependencies: `docker-compose run builder npm install`
1. Create a dummy `.env` file if it doesn't exist: `touch .env`
1. Add `"mocha": "mocha"` to the `package.json` file's `scripts` section
1. Run the test and observe the logs:

    ```
    docker-compose up -d mongo && \
      docker-compose run -e DEBUG=loopback:* builder \
        npm run mocha
    ```
    
1. Add some delay and observe the logs again

    ```
    var app;
    describe('describe', function(){
      before('', function(){
        app = require('./../server/server.js');
      });
      it('it', function(done){
        this.timeout(120000);
        var Promise = require('bluebird');
        return Promise.delay(60000)
          .then(function(){
            done();
          });
      });
    });
    ```

1. The server did not start because we didn't kick off the process from CLI, let's do so programmatically:

```
var app;
describe('describe', function(){
  before('', function(done){
    this.timeout(120000);
    app = require('./../server/server.js');
    app.start();
    app.on('started',function(){
      done();
    })
  });
  it('it', function(done){
    done();
  });
});
```

1. Change the logging slightly and observe the logs:

    ```
    docker-compose up -d mongo && \
      docker-compose run -e DEBUG=loopback:security:*,common:models:* builder \
        npm run mocha
    ```

1. Now we are ready to write code for testing the API endpoints:

```
var app;
var anchor = Date.now();
describe('describe', function(){

  before('start loopback server', function(done){
    this.timeout(30000);
    app = require('./../server/server.js');
    app.start();
    app.on('started',function(){
      done();
    })
  });

  it('signup should fail if the password is too long', function(done){
    this.timeout(30000);
    const supertest = require('supertest');
    supertest(app)
      .post('/api/1.0/UserModels/signup')
      .send({
        "email":`orgAdminA+${anchor}@orgA.com`,
        "username":`orgAdminA+${anchor}@orgA.com`,
        "password":`012345678901234567890`,
        "orgName":"Org A"
      })
      .expect(500, done);
  });

  it('signup should fail if the orgName is missing', function(done){
    this.timeout(30000);
    const supertest = require('supertest');
    supertest(app)
      .post('/api/1.0/UserModels/signup')
      .send({
        "email":`orgAdminA+${anchor}@orgA.com`,
        "username":`orgAdminA+${anchor}@orgA.com`,
        "password":`orgAdminA`
      })
      .expect(500, done);
  });

  it('signup should succeed when all the required info is provided', function(done){
    this.timeout(30000);
    const supertest = require('supertest');
    supertest(app)
      .post('/api/1.0/UserModels/signup')
      .send({
        "email":`orgAdminA+${anchor}@orgA.com`,
        "username":`orgAdminA+${anchor}@orgA.com`,
        "password":`orgAdminAdsdfsdfdsdfdsffsdsf`,
        "orgName":"Org A"
      })
      .expect(200, done);
  });

});
```

1. Reduce the logging slightly and observe the logs:

    ```
    docker-compose up -d mongo && \
      docker-compose run builder \
        npm run mocha
    ```
