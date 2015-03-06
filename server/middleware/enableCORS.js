'use strict';

var url = require('url');

var WhitelistModel = require('../models/whitelist');

module.exports = function (req, res, next) {

  var origin = req.get('origin');

  // shortcircuit if not an 'api' route
  if (-1 === req.url.indexOf('api') || !origin) {
    next();
    return;
  }
  
  // Allow CORS from whitelisted domains for 'api' routes
  var whitelistModel = new WhitelistModel();
  whitelistModel.all().then(function (whitelist) {

    var hostname = url.parse(origin).hostname;

    // W3C suggests reading the 'origin' from the req header and comparing it
    // to a list of domains to be whitelisted. If it matches then echo the value
    // of the 'origin' req header back to the client as the Access-Control-Allow-Origin
    // header in the response
    //
    // @see http://stackoverflow.com/questions/1653308/access-control-allow-origin-multiple-origin-domains
    if (-1 !== whitelist.indexOf(hostname)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      // All cross origin requests will be preceded by an options request...
      // so we need to make sure to respond with 200
      if ('OPTIONS' === req.method) {
        res.send(200);
        return;
      }
    }

    next();
  });
};