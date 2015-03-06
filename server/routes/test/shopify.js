'use strict';

// Module Dependencies
var Shopify = require('shopify')
  , when = require('when');

module.exports = function (server) {

  // Make sure we are authenticated with Shopify before allowing
  // access to any of the '/test' routes
  // server.all('/test/*', function (req, res, next) {

  //   var shop = req.session.shop;

  //   if (!shop) {
  //     // let shopify-auth know that we want to come back here after
  //     // we have authenticated
  //     req.session.redirectPath = req.url;
  //     res.redirect('/auth/shopify');
  //     return;
  //   }

  //   shopify = new Shopify(shop.token, shop.url);
  //   next();
  // });

  server.get('/test/shopify', function (req, res) {

    var shop = req.session.shop;
    var shopify = new Shopify(shop.token, shop.url);

    var p1 = shopify.customers.list({limit:1});
    var p2 = shopify.scriptTags.list();
    var p3 = shopify.orders.list({limit:1});
    var p4 = shopify.products.list({limit:1});
    var p5 = shopify.applicationCharges.list({limit:1});
    var p6 = shopify.events.list({limit:1});

    // [Works] Create Article and Create Blog
    // var p6 = shopify.articles.create(4541341, {
    //   article: {
    //     title: "Test Title"
    //   }
    // });

    // [Works] Delete Product
    // var p6 = shopify.products.del(272158437);

    // [Works] Update Product
    // var p6 = shopify.products.update(272156605, {
    //   product: {
    //     title: "Unicorns and Ponies",
    //     handle: "unicorns-and-ponies"
    //   }
    // });

    // [Works] Create Application Charge
    // var p6 = shopify.applicationCharges.create({
    //   application_charge: {
    //     name: 'Super Duper Expensive action',
    //     price: 100.0,
    //     return_url: 'http://super-duper.shopifyapps.com'
    //   }
    // });

    // [Works] Activate Application Charge
    // var p6 = shopify.applicationCharges.activate(441309);

    // [Works] Create Product
    // var p6 = shopify.products.create({
    //   product: {
    //     title: 'Burpple Lurple',
    //     product_type: 'Test',
    //     vendor: 'Test'
    //   }
    // });

    // Wait until all promises have resolved
    when.join(p1, p2, p3, p4, p5, p6).then(function (all) {
      res.json({
        status: 'logged in',
        session: req.session,
        data: all
      });
    });
  });
};