var express = require('express'),
    https = require('https'),
    path = require('path'),
    fs = require('fs');

var passport = require('passport'),
    ClientCertStrategy = require('../').Strategy;

require('colors');

// A list of valid user IDs
var users = ['joe', 'amy'];

/*
 * Dummy user lookup method - simulates database lookup
 */
function lookupUser(cn, done) {
  var user = users.indexOf(cn) >= 0 ? { username: cn } : null;
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
  key: fs.readFileSync("./certs/server.key"),
  cert: fs.readFileSync("./certs/server.crt"),
  ca: fs.readFileSync("./certs/ca.crt"),
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

passport.use(new ClientCertStrategy(authenticate));

// Test curl command:
// $ curl -k --cert certs/joe.crt --key certs/joe.key --cacert certs/ca.crt https://localhost:3443

// curl on OSX Mavericks and newer has broken --cacert: http://curl.haxx.se/mail/archive-2013-10/0036.html
// If this affacets you, equivalent wget command:
// wget -qSO - --no-check-certificate --certificate=certs/joe.crt --private-key=certs/joe.key --ca-certificate=certs/ca.crt https://localhost:3443/
app.get('/',
  passport.authenticate('client-cert', { session: false }),
  function(req, res) {
    res.json(req.user);
  });


https.createServer(options, app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));

});
