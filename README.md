# passport-pki

[passport.js](http://passportjs.org/) strategy for client certificate authentication.

## TODO

 * Upstream strategy example
 * Integration test
 * Docs

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
