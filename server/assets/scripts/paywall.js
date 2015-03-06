'use strict';

(function ($) {

  // @TODO This needs to be updated to the production address
  var appServer = 'http://127.0.0.1:3000/';

  function initSubmitHandler ($form, stripeCheckout) {

    // This is easy but a little risky because there is no guarantee that
    // this meta property will be set. A better way would probably be to query
    // my server using the shopurl as the key and retrieve public info about 
    // the current shop, i.e. associated shopname and stripe public key
    var shopname = $('meta[property="og:site_name"]').attr('content');

    // intercept the submit event... 
    // assumes that the registration form is the only form on this page
    $form.submit(function (event, params) {

      // var $btn = $(this).find('[type="submit"]');
      
      params = params || {};
      if (!params.subscribed) {
        event.preventDefault();

        var url = $(this).attr('action')
          , data = $(this).serializeArray();

        console.log('submit intercepted', url, data);

        // trigger stripe checkout
        stripeCheckout.open({
          name: shopname,
          description: '1 Year Subscription', // will need to set these via the form
          amount: 10000, // will need to set these via the form
          email: $form.find('input[name="customer[email]"]').val(),
          allowRememberMe: false
        });
      }
    });
  }

  /**
   * Returns a promise that will resolve with the stripeCheckout instance when
   * it is available. We need to use a promise here because the js files load async, 
   * so we don't know if the StripeCheckout class is initially available or not
   */
  function initStripeCheckout ($form) {
    var deferred = $.Deferred();

    var shop = window.location.hostname // Get the current shops hostname
      , pkUrl = appServer + 'api/auth/stripe';

    // Retrieve the current shops Stripe Public Key
    $.get(pkUrl, function (data) {

      // Because the js files load async, we don't know if the StripeCheckout object 
      // will be immediately available so we need to check to see if it is there
      var id = window.setInterval(function () {
        try {
          if (StripeCheckout) {
            // @NOTE 
            // Remember that the callback does not actually submit the charge, it only 
            // ensures that the CC information is valid and prepares the CC token
            var stripeCheckout = StripeCheckout.configure({
              key: data.key,
              token: function (token, args) {
                // Use the token to create the charge with a server-side script.
                // You can access the token ID with `token.id`
                console.log(token, args);

                var subUrl = appServer + 'api/stripe/customers';
                
                var params = {
                  card: token.id,
                  plan: 'led-wholesaler-sub',
                  email: token.email,
                  description: '1 Year Subscription to ' + shop
                };

                $.post(subUrl, params)

                  // success handler
                  .done(function (res) {
                    console.log(res);

                    // @TODO check for error

                    // Build the customer tags, add it to a hidden form field 
                    // and submit the form
                    var tags = buildCustomerTags(res.id);
                    $form.find('#tags').attr('value', tags);
                    $form.trigger('submit', {subscribed: true});
                  })

                  // error handler
                  .fail(function (res) {
                    var error = JSON.parse(res.responseText);
                    console.error(error);
                  });
              }
            });

            deferred.resolve(stripeCheckout);
            clearInterval(id);
          }
        }
        catch (e) {
          console.info('Waiting for https://checkout.stripe.com/checkout.js to load');
        }
      }, 10);
    });

    return deferred.promise();
  }

  /**
   * Constructs the tag we are going to add to the shopify customer
   *
   * @param id (string) 
   *  The stripe customer id returned by a successful subscription charge
   */
  function buildCustomerTags (id) {
    var tags = ['paywall'] // group tag to make locating all subs easier later
      , tag = ''; // customer specific tag

    var time = new Date().getTime();

    // customer tag
    tag = 'paywall-' + id + '-' + time;
    tags.push(tag);

    return tags.join(',');
  }

  // Only triggers on the registration page
  if ('/account/register' === window.location.pathname) {
    // assumes that the registration form is the only form on this page
    var $form = $('#create_customer');

    // Do some stuff to make the registration flow a little better
    // Assumes that 'email' and 'password' are always required
    $form.find('input[name="customer[email]"]').attr('required', true);
    $form.find('input[name="customer[password]"]').attr('required', true);

    // Create hidden input field for customer tag
    $form.prepend('<input id="tags" name="customer[tags]" type="hidden" value=""/>');

    initStripeCheckout($form).then(function (stripeCheckout) {
      initSubmitHandler($form, stripeCheckout);
    });
  }

})(jQuery);