'use strict';

angular.module('particle.pages.controllers')
  .controller('MembersCtrl', function ($scope, $shopify, $stripe, toastr) {
    
    $stripe.customers().list(
      function (res) {
        $scope.list = res.data;
      },
      function (err) {
        
        var error = err.data
          , msg = error.message
          , title = error.name;

        if ('StripeAuthError' === error.name) {
          msg = 'You must first connect your Stripe Account to enable subscriptions';
          title = 'Stripe Authentication Error';
        }

        // show error message
        toastr.error(msg, title, {
          timeOut: 0
        });
      });

    if ($shopify) {
      $shopify.Bar.loadingOff();
      $shopify.Bar.setTitle('Members');
    }

    // Scope Assignment
    $scope.list = [];
  });