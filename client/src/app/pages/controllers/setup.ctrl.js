'use strict';

angular.module('particle.pages.controllers')
  .controller('SetupCtrl', function ($scope, $shopify, $stripe, $cookies) {

    if ($shopify) {
      $shopify.Bar.loadingOff();
      $shopify.Bar.setTitle('Setup');
    }

    $stripe.plans().list(function (res) {
      if (res.count) {
        $scope.stripe.hasPlans = true;
      }
    });

    // Scope Assignment
    $scope.stripe = {};
    $scope.stripe.hasPlans = false;
    $scope.stripe.hasAuth = $cookies.shopStripePK || false;
  });