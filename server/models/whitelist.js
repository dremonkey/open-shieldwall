'use strict';

var _ = require('lodash')
  , when = require('when');

var MetaModel = require('./meta');

function WhitelistModel () {

  if (!(this instanceof WhitelistModel)) {
    return new WhitelistModel();
  }

  this._meta = new MetaModel();
}

WhitelistModel.prototype.all = function () {
  return this._meta.retrieve('whitelist', ['metavalue']).then(function (data) {
    return data.metavalue;
  });
};

WhitelistModel.prototype.save = function (hostname) {
  var self = this
    , deferred = when.defer();

  // Retrieve existing whitelist data
  this._meta.retrieve('whitelist').done(function (old) {
    var data = null;
    if (old) {
      data = _.clone(old);

      // add hostname to metavalue array
      if (-1 === data.metavalue.indexOf(hostname)) {
        data.metavalue.push(hostname);
        self._meta.update('whitelist', data, old).then(function (res) {
          console.log('Whitelist: successfully added', hostname);
          deferred.resolve(res);
        });
      }
      else {
        // resolve with -1 to indicate no change
        deferred.resolve(-1);
      }
    }
    else {
      data = {
        metakey: 'whitelist',
        metavalue: [hostname]
      };

      self._meta.save(data).then(function (res) {
        deferred.resolve(res);
      });
    }
  });

  return deferred.promise;
};

WhitelistModel.prototype.del = function (hostname) {
  var self = this
    , deferred = when.defer();

  this._meta.retrieve('whitelist').done(function (old) {

    if (old) {
      var data = _.clone(old, true)
        , index = data.metavalue.indexOf(hostname);

      if (-1 !== index) {
        data.metavalue.splice(index,1);
        self._meta.update('whitelist', data, old).then(function (res) {
          console.log('Whitelist: successfully deleted', hostname);
          deferred.resolve(res);
        });
      }
      else {
        // resolve with -1 to indicate no change
        deferred.resolve(-1);
      }
    }
  });

  return deferred.promise;
};

module.exports = WhitelistModel;