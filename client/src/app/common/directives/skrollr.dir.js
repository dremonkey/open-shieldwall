'use strict';

/**
 * Attach to any element that needs the skrollr functionality
 */

angular.module('particle.common.skrollr')
  .directive('skrollr', function (skrollrd) {
    var def;

    def = {
      link: function (scope, element) {

        // Initialize this element
        skrollrd.refresh(element[0]);

        // Watch for changes to the element offsetTop
        // because it means we will have recalculate the skrollr keyframes
        scope.$watch(function () {
          var top = element[0].offsetTop;
          return top;
        }, function (newTop, oldTop) {
          if (newTop === oldTop) return;
          console.log('newTop', newTop);
          skrollrd.refresh(element[0]);
        });

        // Do Cleanup
        scope.$on('$destroy', function () {
          console.log('$destroy', 'skrollr-directive');
          skrollrd.destroy();
        });
      }
    };

    return def;
  });