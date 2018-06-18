var loopback = require('loopback');
var boot = require('loopback-boot');

var app = module.exports = loopback();

// Set up the /favicon.ico
app.use(loopback.favicon());

// request pre-processing middleware
app.use(loopback.compress());

// -- Add your pre-processing middleware here --

// boot scripts mount components like REST API
boot(app, __dirname);

// -- Mount static files here--
// All static middleware should be registered at the end, as all requests
// passing the static middleware are hitting the file system
// Example:
//   var path = require('path');
//   app.use(loopback.static(path.resolve(__dirname, '../client')));

// Requests that get this far won't be handled
// by any middleware. Convert them into a 404 error
// that will be handled later down the chain.
app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// start the server if `$ node server.js`
if (require.main === module) {
  app.start();
}

app.get('remoting').errorHandler = {
  handler: function(error, req, res, next) {
    console.log('i exist');
    /* Other options for namespace?
     > 'strong-remoting:rest-adapter'
     > 'server:middleware:errorHandler' */
    var log = require('debug')('server:rest:errorHandler');
    if (error instanceof Error) {
      log('Error in %s %s: errorName=%s errorMessage=%s \n errorStack=%s',
        req.method, req.url, error.name, error.message, error.stack);
    }
    else {
      log(req.method, req.originalUrl, res.statusCode, error);
    }
    next(); /* let the default error handler (RestAdapter.errorHandler) run next */
  },
  disableStackTrace: true
};
