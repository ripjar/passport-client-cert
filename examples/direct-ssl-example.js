var express = require('express'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

var passport = require('passport'),
    PkiStrategy = require('../lib/passport-pki').DirectStrategy;

require('colors');

// A list of valid user IDs
var users = ['joe', 'amy'];

/*
 * Dummy user lookup method - simulates database lookup
 */
function lookupUser(cn, done) {
  var user = ['amy', 'joe'].indexOf(cn) >= 0 ? { username: cn } : null;
  done(null, user);
}

/**
 * Authentication callback for PKI authentication
 *  - Look up a user by ID (which, in this simple case, is identical
 *    to the certificate's Common Name attribute).
 */
function authenticate(cert, done) {
  var subject = cert.subject,
      msg = 'Attempting PKI authentication';

  if(!subject) {
    console.log(msg + ' ✘ - no subject'.red);
    done(null, false);
  } else if(!subject.CN) {
    console.log(msg +  '✘ - no client CN'.red);
    done(null, false);
  } else {
    var cn = subject.CN;

    lookupUser(cn, function(err, user) {
      msg = 'Authenticating ' +  cn + ' with certificate';

      if(!user) {
        console.log(msg + ' ✘ - no such user'.red);
        done(null, false);
      } else {
        console.log(msg + ' - ✔'.green);
        done(null, user);
      }
    });
  }
}


var options = {
  key: fs.readFileSync("./ssl/server.key"),
  cert: fs.readFileSync("./ssl/server.crt"),
  ca: fs.readFileSync("./ssl/ca.crt"),
  requestCert: true,
  rejectUnauthorized: false
};

var app = express();

app.set('port', process.env.PORT || 3443);

app.use(express.logger('dev'));
app.use(express.json());
app.use(passport.initialize());
app.use(app.router);
app.use(express.errorHandler());

passport.use(new PkiStrategy(authenticate));

// Test curl command:
//
// curl on OSX Mavericks has broken --cacert: http://curl.haxx.se/mail/archive-2013-10/0036.html
// If this does not affect you:
// $ curl -k --cert ssl/joe.crt --key ssl/joe.key --cacert ssl/ca.crt https://localhost:3443
//
// If it does, equivalent wget command:
// $ wget -q -O - --no-check-certificate --certificate=ssl/client.crt --private-key=ssl/client.key --ca-directory=ssl https://localhost:3443/b
app.get('/',
  passport.authenticate('pki-direct', { session: false }),
  function(req, res) {
    res.json(req.user);
  });


https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));

});
