'use strict';

// The 'Metadata' table stores all application metadata
// in particular the whitelist of shop hostnames that can
// make queries to the api.

var _ = require('lodash')
  , when = require('when')
  , Knex = require('knex');

var log = require('../utils/logger');

function MetaModel () {

  if (!(this instanceof MetaModel)) {
    return new MetaModel();
  }

  this._db = Knex.db;
}

MetaModel.prototype._parse = function (data) {
  data = Array.isArray(data) ? data : [data];
  return _.map(data, function (_data) {
    try {
      var parsed = JSON.parse(_data.metavalue);
      _data.metavalue = parsed;
    }
    catch (e) {
      log.error(e);
    }

    return _data;
  });
};

MetaModel.prototype._prep = function (data) {
  data.metavalue = JSON.stringify(data.metavalue);
  return data;
};

MetaModel.prototype.retrieve = function (id, cols) {
  var self = this
    , table = this._db('metadata');

  var key = null;
  
  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'metakey';

  cols = cols || '*';

  var query = table.where(key, id).select(cols);

  return query.then(function (data) {
    var metadata = self._parse(data);
    return metadata[0];
  });
};

MetaModel.prototype.save = function (data) {
  var self = this
    , table = this._db('metadata');

  var metakey = data.metakey;
  data = this._prep(data);

  return this.retrieve(metakey).then(function (metadata) {
    if (!metadata) {
      return table.insert(data);
    }
    else {
      return self.update(metadata.id, data, metadata);
    }
  });
};


/**
 * @param id (string|int)
 * @param data (obj)
 *  The new metadata to be saved
 * @param (obj)
 *  The existing metadata 
 */
MetaModel.prototype.update = function (id, data, old) {
  var self = this
    , deferred = when.defer()
    , table = this._db('metadata');

  var key = null;

  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'metakey';

  // If existing metadata is passed in such as from 'save'
  // resolve the promise immediately
  if (old) {
    deferred.resolve(old);
  }
  // Otherwise retrieve the existing metadata and resolve
  else {
    this.retrieve(key, id).done(function (old) {
      deferred.resolve(old);
    });
  }

  // Now update the metadata and save
  return deferred.promise.then(function (metadata) {
    var newMetaValue = data.metavalue
      , oldMetaValue = metadata.metavalue;

    // Merge existing with new data if metadata is an object...
    if ('object' === typeof oldMetaValue && !Array.isArray(oldMetaValue)) {
      metadata.metavalue = _.defaults(newMetaValue, oldMetaValue);
    }
    else {
      metadata.metavalue = newMetaValue;
    }

    metadata = self._prep(metadata);
    return table.where(key, id).update(metadata);
  });
};

MetaModel.prototype.del = function (id) {
  var table = this._db('metadata');
  var key = null;

  if ('number' === typeof id) key = 'id';
  if ('string' === typeof id) key = 'metakey';

  return table.where(key, id).del().then(function (res) {
    if (res) {
      console.log('Metadata: successfully deleted', id);
    }
    return res;
  });
};

module.exports = MetaModel;