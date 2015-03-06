'use strict';

// ## Module Dependencies
var _ = require('lodash')
  , Shopify = require('shopify');
  
// ## Routes
var api = require('./api')
  , auth = require('./auth')
  , test = require('./test');


/**
 * Adds necessary scripts to the shop frontend
 *
 * @param auth (obj)
 * @param auth.token (str) OAuth Permanent Token
 * @param auth.shop (str) Hostname of the Shopify shp
 */
function addShopifyScripts (shop) {
  console.log('**** addShopifyScripts');
  
  var auth = shop.auth;
  var hostname = shop.auth.hostname;
  var shopify = new Shopify(auth, hostname);

  // ## Setup ScriptTags

  // script urls need to be absolute
  var scriptUrls = [
    'https://checkout.stripe.com/checkout.js',
    'http://127.0.0.1:3000/scripts/paywall.js'
  ];

  // check if scripts exist
  shopify.scriptTags.list(function (err, scripts) {

    console.log(scripts);
    // shopify.scriptTags.del(887421);

    /* jshint camelcase:false */

    // extract all script urls
    var temp = _.map(scripts.script_tags, function (val) {
      return val.src;
    });

    for (var i = scriptUrls.length - 1; i >= 0; i--) {
      var src = scriptUrls[i];
      
      // add the script... 
      // currently we do not wait for a response
      if(-1 === temp.indexOf(src)) {
        shopify.scriptTags.create({
          script_tag: {
            event: 'onload',
            src: src
          }
        });
      }
    }
  });
}

function init (server, config) {

  // Check to see if session is set... if not login
  // server.get('/', function (req, res, next) {
  //   console.log(req);
  // });

  // Init Auth Routes
  auth(server, config);

  // Init API Routes
  api(server, config);

  // Init Test Routes
  test(server, config);

  // Event Listener... fires after the Shop owner has
  // allowed access to the app and we get the token
  server.on('oauth:shopifyToken', addShopifyScripts);
}

module.exports = {
  init: init
};