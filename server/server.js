'use strict';

// Module dependencies
var express = require('express')
  , http = require('http');

var database = require('./models/db')
  , Config = require('./config/index')
  , log = require('./utils/logger')
  , middleware = require('./middleware')
  , routes = require('./routes');

var config = new Config();

// Sets up the express server instance
// Instantiates the routes, middleware, and starts the http server
var init = function (server) {

  var _config;

  // Retrieve the configuration object
  _config = config.get();

  // ## Initialize the Database
  database(_config.db);

  // ## Middleware
  middleware(server, _config);

  // ## Initialize Routes
  routes.init(server, _config);

  // Forward uncaught requests to index
  server.all('/*', function (req, res) {
    res.sendfile('index.html', {root: server.get('views')});
  });

  function startServer () {
    server.set('port', _config.server.port);
    http.createServer(server).listen(server.get('port'), function () {
      log.info('Express server listening on port ' + server.get('port'));
    });
  }

  // Start the server
  startServer();
};

// Initializes the server
config.load().then(function () {
  log.info('Configurations loaded... initializing the server');
  init(express());
});