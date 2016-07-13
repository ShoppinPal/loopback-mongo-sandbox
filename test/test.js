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

var lt = require('loopback-testing');

var chai = require('chai');
var expect = chai.expect;

// Reuse the existing loopback app.
var app = require('../server/server.js'); //path to app.js or server.js
var loopback = app.loopback;

// Create a new loopback app.
//var app = loopback();
//var loopback = require('loopback');

// Set up promise support for loopback in non-ES6 runtime environment.
//global.Promise = require('bluebird');

// Connect to db
var dbConnector = app.datasources.mongodb;

describe('this is test group 1', function () {

  // Step 1 - initialize `loopback-testing` with the application as an argument
  lt.beforeEach.withApp(app);

  // Step 2 - create a model and attach it to the application on the fly
  //          NOTE: some tasks are repetitive and don't seem to take effect
  //                like `item` doesn't show up in the explorer ... but that maybe because
  //                this test uses its own app and not the app instance run by the container bootup!!
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

  // Step 3 - cleanup the DB before each test
  lt.beforeEach.cleanDatasource('mongodb');

  it('this is test one', function (done) {
    // Here, the item is NOT being read from DB again,
    // it was stored in memory after creation in DB
    // and is being read from memory now
    // Q: how do we read from the DB again instead of memory?
    var item = this.item;
    expect(item.name).to.equal('Item name');
    done();
  });
});
