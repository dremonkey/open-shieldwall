'use strict';

// ## Module Dependencies
var Knex = require('knex');

module.exports = function (dbconfig) {
  var params = dbconfig;
  dbconfig.ssl = true; // needed when trying to connect from local to heroku

  var db = Knex.initialize({
    client: 'pg',
    connection: params
  });

  // Store the instance so it can be easily referenced later
  Knex.db = db;

  // Create Shops Table
  db.schema.hasTable('shops').then(function (exists) {
    if (!exists) {
      return db.schema.createTable('shops', function (t) {
        t.increments('id').primary();
        t.string('hostname', 100).unique().index(); // yourshop.myshopify.com
        t.text('shop'); // serialized shop data
        t.text('stripe'); // serialized stripe account
      });
    }
  });

  db.schema.hasTable('metadata').then(function (exists) {
    if (!exists) {
      return db.schema.createTable('metadata', function (t) {
        t.increments('id').primary();
        t.string('metakey', 255).unique().index();
        t.text('metavalue');
      });
    }
  });

  // db.schema.table('metadata', function (table) {
  //   table.renameColumn('key', 'metakey');
  //   table.renameColumn('value', 'metavalue');
  // });

  // db.schema.hasColumn('metadata', 'metakey').then(function (bool) {
  //   console.log('**** metadata table has column:metakey:', bool)
  // });

  // db.schema.hasColumn('metadata', 'key').then(function (bool) {
  //   console.log('**** metadata table has column:key:', bool)
  // });
};

