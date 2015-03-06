'use strict';

angular.module('particle.pages', [
  'angular-table',
  'particle.pages.controllers',
  'particle.pages.directives',
  'particle.pages.services',
  'toastr',
  'ui.router.compat'
]);

angular.module('particle.pages')
  .config(function ($stateProvider) {
    $stateProvider

      // ## Shopify Admin Pages
      .state('setup', {
        url: '/',
        templateUrl: 'pages/templates/setup.tpl.html',
        controller: 'SetupCtrl',
        data: {
          bodyId: 'setup'
        }
      })

      .state('plans', {
        url: '/plans',
        templateUrl: 'pages/templates/plans.tpl.html',
        controller: 'PlansCtrl',
        data: {
          bodyId: 'plans'
        }
      })

      .state('members', {
        url: '/members',
        templateUrl: 'pages/templates/members.tpl.html',
        controller: 'MembersCtrl',
        data: {
          bodyId: 'members'
        }
      })

      // ## Stripe Connect Success Redirect Page
      .state('success', {
        url: '/oauth/success',
        templateUrl: 'pages/templates/success.tpl.html',
        controller: 'OAuthSuccessCtrl'
      });
  })

  .run(function ($rootScope, toastr) {
    $rootScope.$on('$stateChangeSuccess', function () {
      toastr.clear();
    });
  });

angular.module('particle.pages.controllers', []);
angular.module('particle.pages.directives', []);
angular.module('particle.pages.services', ['ngResource']);