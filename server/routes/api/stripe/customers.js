'use strict';

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

  // Get a list of all customers
  server.get('/api/stripe/customers', function (req, res) {
    var defaults, params;

    defaults = {
      count: 10,
      created: null,
      offset: 0
    };

    params = utils.params(req.body, defaults);

    stripe.customers.list(params, function (err, customers) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(customers);
    });
  });

  // Create a new customer
  server.post('/api/stripe/customers', function (req, res) {
    var defaults, params;

    /* jshint camelcase:false */
    defaults = {
      account_balance: null,
      card: null,
      coupon: null,
      description: null,
      email: null,
      metadata: null,
      plan: null,
      quantity: null,
      trial_end: null
    };

    params = utils.params(req.body, defaults);

    stripe.customers.create(params, function (err, customer) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(customer);
    });
  });

  // Retrieve a specific customer
  server.get('/api/stripe/customers/:id', function (req, res) {
    stripe.customers.retrieve(req.params.id, function (err, customer) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(customer);
    });
  });

  // Update a customer
  server.post('/api/stripe/customers/:id', function (req, res) {
    var defaults, id, params;
    
    id = req.params.id;

    /* jshint camelcase:false */
    defaults = {
      account_balance: null,
      card: null,
      coupon: null,
      default_card: null,
      description: null,
      email: null,
      metadata: null
    };

    params = utils.params(req.body, defaults);

    stripe.customers.update(id, params, function (err, customer) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(customer);
    });
  });

  // Delete a customer
  server.del('/api/stripe/customers/:id', function (req, res) {
    var id;

    id = req.params.id;

    stripe.customers.del(id, function (err, confirmation) {
      if (err) {
        errorHandler(err, res);
        return;
      }

      res.json(confirmation);
      // res.json({
      //   route: req.route,
      //   params: req.params,
      //   query: req.query
      // });
    });
  });
};