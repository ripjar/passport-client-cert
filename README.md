# passport-client-cert

[passport.js](http://passportjs.org/) strategy for TLS client certificate authentication.

passport-client-cert is for TLS connections direct to a Node.js application.

## Usage
The `ClientCertStrategy` constructor requires a verify callback, which is used to check the certificate and authenticate the identified user.

The verify callback is provided with the client certificate and a `done` callback. The `done` callback must be called as per the [passport.js documentation](http://passportjs.org/guide/configure/).

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
