/**
 * This code was copy/pasted from:
 *  > https://github.com/beeman/loopback-ds-mixin-skeleton/blob/7bf0d3074df63ad98348a4e30652bb93f8f458af/test.js#L48
 * and then edited to work with mongodb instead of memory connector
 */

/* jshint mocha: true */

// HACK: being able to enable/disable debug programmatically
//       https://github.com/visionmedia/debug/issues/275#issuecomment-219997340
require('debug').enable('loopback:connector:*'); //enable namespace
var debug = require('debug')('loopback:connector:*'); //reload debug

var loopback = require('loopback');
var lt = require('loopback-testing');

var chai = require('chai');
var expect = chai.expect;

// Reuse the loopback app.
var app = require('../server/server.js'); //path to app.js or server.js

// Set up promise support for loopback in non-ES6 runtime environment.
//global.Promise = require('bluebird');

// Connect to db
var dbConnector = app.datasources.mongodb;

// Main test
describe('loopback datasource property', function () {

  lt.beforeEach.withApp(app);

  beforeEach(function (done) {

    // Create a new model and attach the mixin
    var Item = this.Item = loopback.PersistedModel.extend('item', {
      name: String
    }, {
      mixins: {
        Skeleton: {}
      }
    });

    // Attach model to db
    Item.attachTo(dbConnector);
    app.model(Item);
    app.use(loopback.rest());
    app.set('legacyExplorer', false);
    new lt.TestDataBuilder()
      .define('item', Item, {
        name: 'Item name'
      })
      .buildTo(this, done);
  });


  it('This is a test.', function (done) {
    var item = this.item;
    expect(item.name).to.equal('Item name');
    done();
  });
});
