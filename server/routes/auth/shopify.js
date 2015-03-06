'use strict';

// ## Module Dependencies
var OAuth = require('shopify-auth').OAuth;

var ShopModel = require('../../models/shop')
  , WhitelistModel = require('../../models/whitelist');

module.exports = function (server, config) {

  var shopModel = new ShopModel()
    , whitelistModel = new WhitelistModel();
  
  function saveShop (err, shop) {
    // Let the rest of the app know that we have received the shop and token data
    server.emit('oauth:shopifyToken', shop);

    shopModel.save({
      hostname: shop.url,
      shop: shop
    });

    // add shop url to whitelist metadata
    whitelistModel.save(shop.url);
  }

  var options = {
    apiKey: config.shopify.oauth.apiKey,
    secret: config.shopify.oauth.sharedSecret,
    scope: config.shopify.oauth.scope,
    success: saveShop
  };

  // Initialize OAuth
  // options.shop will be set later
  new OAuth(server, options);

  server.get('/*', function (req, res, next) {
    
    if (req.session.shop) {
      var hostname = req.session.shop.auth.hostname;

      // save stripe data to session
      shopModel.retrieve(hostname).then(function (data) {
        console.info('**** Get Saved Stripe Data and Save to Session');
        console.info(data);
        req.session.stripe = data.stripe;

        // save stripe public key and shop hostname to non-encrypted 
        // browser cookie so that we can access it from the client side
        res.cookie('shopStripePK', data.stripe.publicKey);
        res.cookie('shopHostname', hostname);
        
        next();
      });
    }
    else {
      next();
    }
  });
};