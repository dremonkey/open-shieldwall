'use strict';

module.exports = function (server, config) {

  // Initialize API routes
  require('./stripe')(server, config);

};