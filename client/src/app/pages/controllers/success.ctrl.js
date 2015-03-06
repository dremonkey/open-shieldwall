'use strict';

angular.module('particle.pages.controllers')
  .controller('OAuthSuccessCtrl', function ($window) {
    console.log($window.opener);
    
    $window.opener.location.reload();
    
    setTimeout(function () {
      $window.close();
    }, 2000);
  });