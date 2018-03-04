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
        "password":`orgAdminA`,
        "orgName":"Org A"
      })
      .expect(200);
  });

});
