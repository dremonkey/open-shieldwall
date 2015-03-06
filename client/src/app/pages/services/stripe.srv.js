'use strict';

angular.module('particle.pages.services')
  
  .factory('$stripe', function ($resource) {

    return {
      charges: function () {
        var Charge, actions;

        actions = {
          list: {method: 'GET'}, // no id
          create: {method: 'POST'}, // no id
          retrieve: {method: 'GET'}, // need id
          update: {method: 'POST'}, // need id

          // need id and method
          refund: {
            method: 'POST',
            params:{action:'refund'}
          },

          // need id and method
          capture: {
            method: 'POST',
            params:{action:'capture'}
          }
        };

        Charge = $resource('/api/stripe/charges/:id/:action', {id:'@id', action: '@action'}, actions);
        return Charge;
      },

      customers: function () {
        var Customer, actions;

        actions = {
          list: {method: 'GET'}, // no id
          create: {method: 'POST'}, // no id
          retrieve: {method: 'GET'}, // needs id
          update: {method: 'POST'}, // needs id
          del: {method: 'DELETE'} // needs id
        };

        Customer = $resource('/api/stripe/customers/:id', {id:'@id'}, actions);
        return Customer;
      },

      subscriptions: function () {
        var Sub, actions;

        actions = {
          list: {method: 'GET'}, // needs cid
          create: {method: 'POST'}, // needs cid
          retrieve: {method: 'GET'}, // needs cid and sid
          update: {method: 'POST'}, // needs cid and sid
          cancel: {method: 'DELETE'} // needs cid and sid
        };

        Sub = $resource('/api/stripe/customers/:cid/subscriptions/:sid', {cid:'@cid', sid:'@sid'}, actions);
        return Sub;
      },

      plans: function () {
        var Plan, actions;

        actions = {
          list: {method: 'GET'}, // needs cid
          create: {method: 'POST'}, // needs cid
          retrieve: {method: 'GET'}, // needs cid and sid
          update: {method: 'POST'}, // needs cid and sid
          del: {methode: 'DELETE'} // needs cid and sid
        };

        Plan = $resource('/api/stripe/plans/:id', {id:'@id'}, actions);
        return Plan;
      }
    };
  });