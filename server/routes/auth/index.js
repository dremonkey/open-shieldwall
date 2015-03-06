'use strict';

// ## Module Dependencies
var shopifyAuthRoutes = require('./shopify')
  , stripeAuthRoutes = require('./stripe')
  , ShopModel = require('../../models/shop');

module.exports = function (server, config) {

  var model = new ShopModel();

  /**
   * Returns the public key for a specific shop
   *
   * The shop should be passed as a querystring parameter
   * and should be the hostname, i.e. 'yourshop.myshopify.com'
   */
  server.get('/auth/pk/stripe',  function (req, res) {
    var hostname = req.query.shop;

    // @TODO use origin instead of query string
    // @TODO only allow query string if same origin
    // @TODO move to /api

    if (hostname) {
      model.retrieve(hostname).then(function (data) {
        var publicKey = data.stripe.publicKey;
        res.json({
          key: publicKey
        });
      });
      return;
    }

    res.json(403, {
      status: 'error',
      message: 'You must specify a shop'
    });
  });

  // Initialize Shopify OAuth Routes
  shopifyAuthRoutes(server, config);

  // Initialize Stripe OAuth Routes
  stripeAuthRoutes(server);
};