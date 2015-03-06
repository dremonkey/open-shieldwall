'use strict';

module.exports = function (server, config) {

  server.all('/test/*', function (req, res, next) {

    if (!req.session.shop) {
      res.redirect('/auth/shopify');
      return;
    }

    next();
  });

  // Initialize API routes
  require('./shopify')(server, config);
};