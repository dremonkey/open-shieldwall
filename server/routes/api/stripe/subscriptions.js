'use strict';

// DEPRECATED
// Realized this was not necessary and was sufficient to just use single req handler
// that could proxy requests to api.stripe.com

var _, utils;

_ = require('lodash');
utils = require('../../../utils');

module.exports = function (server, stripe) {

  // Standard errorHandler of all stripe requests
  function errorHandler (err, res) {
    res.json({
      status: 'error',
      name: err.name,
      message: err.message,
      code: err.code,
      param: err.param
    });
  }

  // Get a list of all subscriptions
  server.get('/api/stripe/customers/:cid/subscriptions', function (req, res) {
    var cid, defaults, params;

    cid = req.params.cid; // customer id

    defaults = {
      count: 10,
      created: null,
      offset: 0
    };

    params = utils.params(req.body, defaults);

    stripe.customers.listSubscriptions(cid, params, function (err, subscriptions) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(subscriptions);
    });
  });

  // Create a new subscription
  server.post('/api/stripe/customers/:cid/subscriptions', function (req, res) {
    var cid, defaults, params;

    cid = req.params.cid; // customer id

    /* jshint camelcase:false */
    defaults = {
      plan: null, // required
      application_fee_percent: null,
      card: null,
      coupon: null,
      quantity: 1,
      trial_end: null
    };

    params = utils.params(req.body, defaults);

    stripe.customers.createSubscription(cid, params, function (err, subscription) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(subscription);
    });
  });

  // Retrieve a specific subscription
  server.get('/api/stripe/customers/:cid/subscriptions/:sid', function (req, res) {
    var cid, sid;

    cid = req.params.cid; // customer id
    sid = req.params.sid; // subscription id

    stripe.subscriptions.retrieve(cid, sid, function (err, subscription) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(subscription);
    });
  });

  // Update a subscription
  server.post('/api/stripe/customers/:cid/subscriptions/:sid', function (req, res) {
    var cid, defaults, params, sid;

    cid = req.params.cid; // customer id
    sid = req.params.sid; // subscription id

    /* jshint camelcase:false */
    defaults = {
      plan: null,
      application_fee_percent: null,
      card: null,
      coupon: null,
      prorate: true,
      quantity: 1,
      trial_end: null
    };

    params = utils.params(req.body, defaults);

    stripe.customers.updateSubscription(cid, sid, params, function (err, subscription) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(subscription);
    });
  });

  // Cancel a subscription
  server.del('/api/stripe/customers/:cid/subscriptions/:sid', function (req, res) {
    var cid, defaults, params, sid;

    cid = req.params.cid; // customer id
    sid = req.params.sid; // subscription id

    /* jshint camelcase:false */
    defaults = {
      at_period_end: false
    };

    params = utils.params(req.body, defaults);

    stripe.customers.cancelSubscription(cid, sid, params, function (err, confirmation) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(confirmation);
    });
  });
};