'use strict';

angular.module('particle.pages.controllers')
  .controller('TableCtrl', function ($scope) {
    $scope.getSortIcon = function (predicate, currentPredicate) {
      if (predicate !== currentPredicate) {
        return 'fa fa-minus';
      }
      if ($scope.descending) {
        return 'fa fa-sort-alpha-desc';
      } else {
        return 'fa fa-sort-alpha-asc';
      }
    };
  });