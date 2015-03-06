'use strict';

angular.module('particle.common.skrollr')

  // @TODO Make this a provider so skrollr options can be injected/configured
  // @TODO Add skrollr-menu and make skrollr menu a provider option
  .factory('skrollrd', function () {
    var _instance, _destroyTimer, options;

    options = {
      forceHeight: false
    };

    // Initialize skrollr
    _instance = skrollr.init(options);

    // Helper function to get all nodes of an element
    function getNodes (el, nodes) {
      nodes = nodes || [];
      nodes.push(el);
      var children = el.childNodes;
      for (var i=0; i < children.length; i++) {
        if (children[i].nodeType === 1) {
          nodes = getNodes(children[i], nodes);
        }
      }
      return nodes;
    }

    function destroy () {

      // Clear any existing timer
      if (_destroyTimer) clearTimeout(_destroyTimer);

      // Prevent _instance.refresh() from being called more than needed
      _destroyTimer = setTimeout(function () {

        // We use _instance.refresh() instead of _instance.destroy() to cleanup
        //
        // destroy() causes problems because it sets body to height:auto, overflow:auto
        // which seems to mess up the skrollr calculations in Angular
        //
        // refresh() seems to do everything needed, but there may be a case in the
        // future when destroy() is necessary
        // 
        // @NOTE Possible solutions to allow for the use of destroy involve changing the
        // skrollr.js code by having skrollr save a restore a 'pristine' state instead of
        // setting the body to height:auto, overflow:auto. 
        _instance.refresh();
      }, 10);
    }

    function refresh (el) {
      if (_instance) {
        if (el) _instance.refresh(getNodes(el));
        else _instance.refresh();
      }
      else {
        _instance = skrollr.init(options);
      }
    }

    this.destroy = destroy;
    this.refresh = refresh;

    return this;
  });