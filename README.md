# passport-client-cert

[![Build](https://travis-ci.org/ripjar/passport-client-cert.svg?branch=master)](https://travis-ci.org/ripjar/passport-client-cert)

[passport.js](http://passportjs.org/) strategy for TLS client certificate authentication and authorisation.

passport-client-cert is for TLS connections direct to a Node.js application.

## Usage
The strategy constructor requires a verify callback, which will be executed on each authenticated request. It is responsible for checking the validity of the certificate and user authorisation.

### Options

* `passReqToCallback` - optional. Causes the request object to be supplied to the verify callback as the first parameter.

The verify callback is passed with the [client certificate object](https://nodejs.org/api/tls.html#tls_tlssocket_getpeercertificate_detailed) and a `done` callback. The `done` callback must be called as per the [passport.js documentation](http://passportjs.org/guide/configure/).

````javascript
var passport = require('passport');
var ClientCertStrategy = require('passport-client-cert').Strategy;

passport.use(new ClientCertStrategy(function(clientCert, done) {
  var cn = clientCert.subject.cn,
      user = null;
      
  // The CN will typically be checked against a database
  if(cn === 'test-cn') {
    user = { name: 'Test User' }
  }
  
  done(null, user);
}));
````

The verify callback can be supplied with the `request` object by setting the `passReqToCallback` option to `true`, and changing callback arguments accordingly.

````javascript
passport.use(new ClientCertStrategy({ passReqToCallback: true }, function(req, clientCert, done) {
  var cn = clientCert.subject.cn,
      user = null;
      
  // The CN will typically be checked against a database
  if(cn === 'test-cn') {
    user = { name: 'Test User' }
  }
  
  done(null, user);
}));
````

## Examples

Install and start the example server app:

    $ npm install
    $ cd example
    $ node example-server.js

Submit a request with a client certificate:

    $ curl -k --cert certs/joe.crt --key certs/joe.key --cacert certs/ca.crt https://localhost:3443

If `curl` fails and you are using OSX Mavericks or newer (where [support for ad-hoc CA certifcates is broken](http://curl.haxx.se/mail/archive-2013-10/0036.html), try `wget` instead:

    $ wget -qSO - --no-check-certificate --certificate=certs/joe.crt --private-key=certs/joe.key --ca-certificate=certs/ca.crt https://localhost:3443/

Requests submitted with `joe.crt` are authorised because `joe` is in the list of valid users. Requests submitted without a certificate, or with `bob.crt` will fail with a HTTP `401`.

## Test

    $ npm install
    $ npm test


## Licence

[The MIT Licence](http://opensource.org/licenses/MIT)
