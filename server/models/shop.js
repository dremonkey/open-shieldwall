'use strict';

var _ = require('lodash')
  , when = require('when')
  , Knex = require('knex');

function ShopModel () {

  if (!(this instanceof ShopModel)) {
    return new ShopModel();
  }

  this._db = Knex.db;
}

ShopModel.prototype._parse = function (shops) {
  shops = Array.isArray(shops) ? shops : [shops];
  return _.map(shops, function (shop) {
    shop.shop = JSON.parse(shop.shop);
    shop.stripe = JSON.parse(shop.stripe);
    return shop;
  });
};

ShopModel.prototype.all = function () {
  var self = this
    , table = this._db('shops')
    , promise = table.limit(30).select();

  return promise.then(function (shops) {
    return self._parse(shops);
  });
};

ShopModel.prototype.retrieve = function (id, cols) {
  var self = this
    , table = this._db('shops');

  var key = null;
  
  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'hostname';

  cols = cols || '*';

  var promise = table.where(key, id).select(cols);
  return promise.then(function (shops) {
    return self._parse(shops)[0];
  });
};

ShopModel.prototype.save = function (data) {
  var self = this
    , table = this._db('shops');

  return this.retrieve(data.hostname).then(function (shops) {
    if (!shops) {
      return table.insert(data);
    }
    else {
      return self.update(shops.id, data, shops);
    }
  });
};

ShopModel.prototype.update = function (id, data, shop) {
  var deferred = when.defer()
    , table = this._db('shops');

  var key = null;

  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'hostname';

  // If existing shop data is passed in such as from 'save'
  // resolve the promise immediately
  if (shop) {
    deferred.resolve(shop);
  }
  // Otherwise retrieve the existing shop data and resolve
  else {
    this.retrieve(key, id).then(function (shop) {
      deferred.resolve(shop);
    });
  }

  // Now update the shop data and save
  return deferred.promise.then(function (shop) {
    // Merge existing with new data... new data overwrites existing
    shop.shop = _.defaults(data.shop || {}, shop.shop);
    shop.stripe = _.defaults(data.stripe || {}, shop.stripe);
    return table.where(key, id).update(shop);
  });
};

ShopModel.prototype.del = function (id) {
  var table = this._db('shops');
  var key = null;

  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'hostname';

  return table.where(key, id).del();
};

module.exports = ShopModel;