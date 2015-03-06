'use strict';

angular.module('particle.pages.controllers')
  .controller('PlansCtrl', function ($scope, $shopify, $stripe, toastr) {
    
    $stripe.plans().list(
      function (res) {
        var plans = res.data;

        if (!plan.length) {
          var link = '<a href="" target="_blank">https://manage.stripe.com/plans</a>'
            , msg = 'Create your first subscription plan at ' + link
            , title = 'Add a subscription plan';

          toastr.info(msg, title, {
            timeOut: 0,
            allowHtml: true
          });
        }

        $scope.list = plans;
      },
      function (err) {
        
        var error = err.data
          , msg = error.message
          , title = error.name;

        if ('StripeAuthError' === error.name) {
          msg = 'You must first connect your Stripe Account to enable subscriptions';
          title = 'Stripe Authentication Error';
        }

        toastr.error(msg, title, {
          timeOut: 0
        });
      });

    // Shopify EASDK Interactions
    if ($shopify) {
      $shopify.Bar.loadingOff();
      $shopify.Bar.setTitle('Subscription Plans');
    }

    // Scope Assignment
    $scope.list = [];
  });