'use strict';

// ## Module Dependencies
var passport = require('passport')
  , StripeStrategy = require('passport-stripe').Strategy;

var ShopModel = require('../../models/shop');

module.exports = function (server) {

  var model = new ShopModel();

  // Setup the strategy
  passport.use(new StripeStrategy({
      clientID: 'ca_3jVkXA3NmHlSoC0sLEo2kEVWRrpCtwEA', // app clientID
      clientSecret: 'sk_test_VCdUuecJtsryuItI873uzMza', // account client secret
      callbackURL: '/auth/stripe/callback',
      success: '/',
      failure: '/auth/stripe/error',

      // tell passport to pass the req callback to the verification callback
      // so that we can access the token
      passReqToCallback: true
    },

    // verify callback
    //
    // The 'stripe' variable contains the information you would receive 
    // from making a GET request to https://api.stripe.com/v1/account
    // @see https://stripe.com/docs/api/curl#retrieve_account
    function(req, accessToken, refreshToken, params, stripe, done) {

      /* jshint camelcase:false */

      // save info to session
      var _stripe = {};
      _stripe.id = params.stripe_user_id;
      _stripe.email = params.email;
      _stripe.accessToken = accessToken;
      _stripe.refreshToken = refreshToken;
      _stripe.publicKey = params.stripe_publishable_key;

      req.session.stripe = _stripe;

      var shop = req.session.shop;

      console.log('**** Stripe Access Token');

      // save the data to our database
      model.save({
        hostname: shop.url,
        stripe: _stripe
      });

      return done(null, stripe);
    }
  ));

  // Initialization
  // By this point we should already have authenticated with Shopify
  server.get('/auth/stripe', function (req, res, next) {

    if (!req.session.shop) {
      // tell Shopify Auth to return us here after authentication
      req.session.redirectPath = '/auth/stripe';
      res.redirect('/auth/shopify');
      return;
    }

    /* jshint camelcase:false */

    // prefill some user data
    var shop = req.session.shop
      , shopowner = shop.owner.split(' ')
      , options = {};

    options.scope = ['read_write'];
    options['stripe_user[email]'] = shop.email;
    options['stripe_user[url]'] = 'http://' + shop.url;
    options['stripe_user[country]'] = shop.country;
    options['stripe_user[phone_number]'] = shop.phone;
    options['stripe_user[business_name]'] = shop.name;
    options['stripe_user[first_name]'] = shopowner[0]; // crude but the best we can do
    options['stripe_user[last_name]'] = shopowner[1]; // crude but the best we can do
    options['stripe_user[street_address]'] = shop.address;
    options['stripe_user[city]'] = shop.city;
    options['stripe_user[state]'] = shop.state;
    options['stripe_user[zip]'] = shop.zip;
    options['stripe_user[currency]'] = shop.currency;

    // console.log('authenticate stripe');

    passport.authenticate('stripe', options)(req, res, next);
  });

  // Callback Route
  server.get('/auth/stripe/callback', function (req, res, next) {
    
    // OAuth will be done in a new window (popup) so on success we send it to a
    // special success page that will be automatically closed.
    var success = '/oauth/success';

    passport.authenticate('stripe', {
      // session not used here because we will be responsible for saving the token to session
      // also it throws an error because we haven't configured a serializeUser function
      session: false,

      // route to go to on successful auth
      successRedirect: success,

      // route to go to on failed auth
      // failureRedirect: endpoints.failure
    })(req, res, next);
  });
};