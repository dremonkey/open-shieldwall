'use strict';

var Stripe = require('stripe')
  , url = require('url')
  , when = require('when');


var log = require('../../../utils/logger')
  , ShopModel = require('../../../models/shop');

module.exports = function (server) {

  var model = new ShopModel();

  // Standard errorHandler of all stripe requests
  function errorHandler (err, res) {
    err.code = err.code || 400;
    res.json(err.code, {
      status: 'error',
      name: (err.type || err.name) || 'UnknownError',
      message: err.message || 'Unknown Error',
      param: err.param || ''
    });
  }

  /**
   * Returns the Stripe public key for a specific shop
   *
   * If this call is made from within the app, i.e. same origin, 
   * the shop hostname should be passed as a querystring parameter,
   * "/?shop=yourshop.myshopify.com". If it is made from outside the app, 
   * for example the shopify theme, then any query string will be ignored 
   * and origin will be used instead
   */
  server.get('/api/auth/stripe',  function (req, res) {

    var origin = req.get('origin')
      , hostname = '';

    if (origin) {
      hostname = url.parse(origin).hostname;
    }
    else {
      hostname = req.query.shop;
    }

    if (hostname) {
      model.retrieve(hostname).then(function (data) {
        if (data) {
          var publicKey = data.stripe.publicKey;
          res.json({
            key: publicKey
          });
        }
        else {
          errorHandler({
            name: 'ParamError',
            message: 'Could not find the shop ' + hostname,
            code: 400
          }, res);
        }
      });
      return;
    }

    errorHandler({
      name: 'ParamError',
      message: 'A shop hostname must be specified as a query string parameter',
      code: 400
    }, res);
  });

  /**
   * All other requests to '/api/stripe' will be proxied to api.stripe.com
   *
   * Currently does not handle the following:
   * - [anyMethod].setMetadata
   * - [anyMethod].getMetadata
   * - customers.deleteSubscriptionDiscount
   */
  server.all('/api/stripe/:m1/:id1?/:m2?/:id2?', function (req, res) {

    // console.log(req);

    var deferred = when.defer()
      , promise = deferred.promise
      , origin = req.get('origin')
      , referer = req.get('referer');
    
    var from = origin || referer;
    log.info('Stripe API Request from ' + from);

    // If the request is coming from the shop theme, which for us will happen
    // when handling subscription requests from shopname.myshopify.com
    // we need to grab the header's 'origin' and use it to retrieve the oauth
    // access token so that we can initialize the Stripe bindings.
    if (origin) {
      var hostname = url.parse(origin).hostname;
      model.retrieve(hostname).then(function (shop) {
        console.log(shop);
        deferred.resolve(shop.stripe.accessToken);
      });
    }
    // If the request is coming from the app, then origin will not be available
    // because the request is coming from our own server, but the shop accessToken 
    // is available to us via the session (encrypted) cookie, so we can use that to 
    // initalize the Stripe bindings.
    else if (req.session.stripe) {
      // console.log(req.session.stripe);
      deferred.resolve(req.session.stripe.accessToken);
    }
    else {
      errorHandler({
        code: 401,
        name: 'StripeAuthError',
        message: 'You must authenticate with Stripe to access this resource'
      }, res);
      return;
    }

    promise.then(function (accessToken) {

      // console.log(accessToken);
      
      // Initialize Stripe bindings
      var stripe = new Stripe(accessToken);

      var m1 = req.params.m1
        , m2 = req.params.m2
        , id1 = req.params.id1
        , id2 = req.params.id2;

      var method = m1
        , verb = 'list';

      switch (req.method) {
        case 'GET':
          verb = id1 ? 'retrieve' : 'list'; // default

          if ('cards' === m2) {
            verb = id2 ? 'retrieveCard' : 'listCards';
          }
          else if ('subscriptions' === m2) {
            verb = id2 ? 'retrieveSubscription' : 'listSubscriptions';
          }

          break;
        case 'POST':
          verb = id1 ? 'update' : 'create'; // default

          if ('cards' === m2) {
            verb = id2 ? 'updateCard' : 'createCard';
          }
          else if ('subscriptions' === m2) {
            verb = id2 ? 'updateSubscription' : 'createSubscription';
          }

          break;
        case 'DELETE':
          verb = 'del'; // default

          if ('cards' === m2) {
            verb = 'deleteCard';
          }
          else if ('subscriptions' === m2) {
            verb = 'cancelSubscription';
          }
          else if ('discount' === m2) {
            verb = 'deleteDiscount';
          }

          break;
      }

      // Some Cards and Subscription requests will be handled here
      if (id2) {
        stripe[method][verb](id1, id2, req.body, function (err, object) {
          if (err) errorHandler(err, res);
          else res.json(object);
          return;
        });
      }
      // Some Cards and Subscription requests will be handled here
      else if (id1) {
        stripe[method][verb](id1, req.body, function (err, object) {
          if (err) errorHandler(err, res);
          else res.json(object);
          return;
        });
      }
      // The majority of the requests will be handled here
      else {
        stripe[method][verb](req.body, function (err, object) {
          if (err) errorHandler(err, res);
          else res.json(object);
          return;
        });
      }
    });
  });
};