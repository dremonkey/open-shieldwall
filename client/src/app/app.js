'use strict';

// Declare app level module
angular.module('particle', [
  'ngCookies',
  'particle.common',
  'particle.pages',
  'particle.templates', // dynamically generated by grunt-angular-templates
  'ui.bootstrap',
  'ui.bootstrap.tpls'
]);

angular.module('particle')

  .config(function ($locationProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/');

    // enable the HTML5 push/pop history API  
    $locationProvider.html5Mode(true);
  })
  
  .run(function ($rootScope, $state, $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
  });

// This module will be used by grunt-angular-templates to add all templates to cache
angular.module('particle.templates', []);