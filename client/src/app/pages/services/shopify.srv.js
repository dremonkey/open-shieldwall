'use strict';

angular.module('particle.pages.services')

  .factory('$shopify', function ($location, $cookies) {
    
    var apiKey = '76f81b621da38e21bff0971dc8a92e78'
      , shopUrl = ''
      , shopify = null;

    // Determines if app is embedded and initalize the Shopify EASDK if it is
    //
    // Controllers can then include this like any other service and call the Shopify
    // EASDK methods as needed
    var hostname = $cookies.shopHostname;
    if (hostname) {
      shopUrl = 'https://' + hostname;
      ShopifyApp.init({
        apiKey: apiKey,
        shopOrigin: shopUrl
      });

      // Make Shopify App Available to the App scope
      shopify = ShopifyApp;
    }

    return shopify;
  });