# Steps

1. Try to load the loopback app logic inside our test

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
1. Run the test and observe the logs:

```
dc up -d mongo && \
  dc run -e DEBUG=loopback:* builder \
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
    app,start();
    app.on('started',function(){
      done();
    })
  });
  it('it', function(done){
    done();
  });
});
```