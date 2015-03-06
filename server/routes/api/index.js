'use strict';

module.exports = function (server, config) {

  // server.all('/api/stripe/*', function (req, res, next) {
  //   if (!req.session.stripe) {
  //     res.json(403, {
  //       status: 'error',
  //       message: 'You must be authenticated'
  //     });
  //     return;
  //   }

  //   next();
  // });

  // Temp - THIS NEEDS TO BE REMOVED WHEN NOT NEEDED
  server.get('/api/session', function (req, res) {
    res.json(req.session);
  });

  // Initialize API routes
  require('./stripe')(server, config);
};