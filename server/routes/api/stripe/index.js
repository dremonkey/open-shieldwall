'use strict';

module.exports = function (server, config) {

  var stripe = require('stripe')(config.stripe.secret);

  // Initialize Stripe routes
  require('./charges')(server, stripe);
  require('./customers')(server, stripe);
  require('./subscriptions')(server, stripe);
};