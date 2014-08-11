# passport-pki

[passport.js](http://passportjs.org/) strategy for client certificate authentication.

passport-pki provides two strategies:

## Direct strategy
`DirectPkiStrategy` works for SSL connections direct to Node.js. It requires a verify callback, which is used to check the certificate and authenticate the identified user.

The verify callback is provided with the client certificate and a `done` callback. The `done` callback must be called as per the [passport.js documentation](http://passportjs.org/guide/configure/).

````javascript
passport.use(new PkiStrategy(function(clientCert, done) {
  var cn = clientCert.subject.cn,
      user = null;
      
  // The CN will typically be checked against a database
  if(cn === 'test-cn') {
    user = { name: 'Test User' }
  }
  
  done(null, user);
}));
````

## Usage

###

## Test

    $ npm install
    $ npm test

## Examples

Install and start one of the example servers:

    $ npm install
    $ cd examples
    $ node direct-ssl-example.js

Submit a request with a client certificate. `curl` is the simplest way to do this unless you're using OSX Mavericks (its [support for ad-hoc CA certifcates is broken](http://curl.haxx.se/mail/archive-2013-10/0036.html)). If you're using Mavericks, try `wget` instead.

    $ curl -k --cert ssl/joe.crt --key ssl/joe.key --cacert ssl/ca.crt https://localhost:3443

    $ wget -O - --no-check-certificate --certificate=joe.crt --private-key=joe.key --ca-directory=. https://localhost:3443/

Requests submitted with `joe.crt` are authorised, because `joe` is in the list of example users. Requests submitted without a certificate, or with `bob.crt` will fail with a HTTP `401`.



## Licence

[The MIT Licence](http://opensource.org/licenses/MIT)
