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

  // Get a list of all charges
  server.get('/api/stripe/charges', function (req, res) {
    var defaults, params;

    defaults = {
      count: 10,
      created: null,
      customer: null,
      offset: 0
    };

    params = utils.params(req.body, defaults);

    stripe.charges.list(params, function (err, charges) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(charges);
    });
  });

  // Create a new charge
  server.post('/api/stripe/charges', function (req, res) {
    var defaults, params;

    /* jshint camelcase:false */
    defaults = {
      amount: 0,
      currency: 'usd',
      customer: null,
      card: null,
      description: null,
      metadata: null,
      capture: true,
      application_fee: null
    };

    params = utils.params(req.body, defaults);

    stripe.charges.create(params, function (err, charge) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(charge);
    });
  });

  // Retrieve a specific charge
  server.get('/api/stripe/charges/:id', function (req, res) {
    stripe.charges.retrieve(req.params.id, function (err, charge) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(charge);
    });
  });

  // Update, Refund, Capture a charge
  server.post('/api/stripe/charges/:id/:action?', function (req, res) {
    var defaults, id, params;
    
    id = req.params.id;
    params = req.body || {};
    
    switch (req.params.action) {
      case 'refund':

        /* jshint camelcase:false */
        defaults = {
          amount: null,
          refund_application_fee: false
        };

        params = utils.params(params, defaults);
        
        stripe.charges.refund(id, params, function (err, charge) {
          if (err) {
            errorHandler(err, res);
            return;
          }

          res.json(charge);
        });
        break;
      case 'capture':

        defaults = {
          amount: null,
          application_fee: null
        };

        params = utils.params(params, defaults);

        stripe.charges.capture(id, params, function (err, charge) {
          if (err) {
            errorHandler(err, res);
            return;
          }

          res.json(charge);
        });
        break;
      default:

        defaults = {
          description: null,
          metadata: null
        };

        params = utils.params(params, defaults);

        stripe.charges.update(id, params, function (err, charge) {
          if (err) {
            errorHandler(err, res);
            return;
          }

          res.json(charge);
        });
        break;
    }
  });
};