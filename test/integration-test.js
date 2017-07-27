var fs = require('fs');
var path = require('path');
var http = require('http');
var https = require('https');
var connect = require('connect');
var request = require('request');
var passport = require('passport');
var assert = require("chai").assert;
var ClientCertStrategy = require('..').Strategy;

var HTTPS_PORT = 3433;
var HTTP_PORT = 3080;

var clientKey = fs.readFileSync(path.join(__dirname, 'data', 'ann.key'));
var clientCert = fs.readFileSync(path.join(__dirname, 'data', 'ann.crt'));
var revokedClientKey = fs.readFileSync(path.join(__dirname, 'data', 'bob.key'));
var revokedClientCert = fs.readFileSync(path.join(__dirname, 'data', 'bob.crt'));
var serverKey = fs.readFileSync(path.join(__dirname, 'data', 'server.key'));
var serverCert = fs.readFileSync(path.join(__dirname, 'data', 'server.crt'));
var caCert = fs.readFileSync(path.join(__dirname, 'data', 'ca.crt'));

var httpsSettings = {
  key: serverKey,
  cert: serverCert,
  ca: caCert,
  requestCert: true,
  rejectUnauthorized: false
};

describe('Client cert strategy integration', function () {
  var server;

  function createHttpsServer(app, done) {
    server = https.createServer(httpsSettings, app).listen(HTTPS_PORT, done);
  }

  function createHttpServer(app, done) {
    server = http.createServer(app).listen(HTTP_PORT, done);
  }

  afterEach(function (done) {
    server.close(done);
    server = null;
  })

  describe('handling a request with a valid client cert', function () {
    var validRequestOptions = {
      hostname: 'localhost',
      url: 'https://localhost:' + HTTPS_PORT,
      path: '/',
      method: 'GET',
      key: clientKey,
      cert: clientCert,
      ca: caCert
    }

    it('passes the certificate to the verify callback', function (done) {
      var app = connect();

      var strategy = new ClientCertStrategy(function (cert, done) {
        assert.strictEqual(cert.fingerprint,
          '17:2C:6E:88:E8:F3:6F:41:C7:3A:FE:6D:35:3E:7E:AA:09:09:E4:5B')

        assert.deepEqual(cert.subject, {
          C: 'UK',
          ST: 'Gloucestershire',
          L: 'Cheltenham',
          O: 'Ripjar',
          OU: 'Engineering',
          CN: 'ann',
          emailAddress: 'ann@example.com'
        })

        assert.deepEqual(cert.issuer, {
          C: 'UK',
          ST: 'Gloucestershire',
          L: 'Cheltenham',
          O: 'Ripjar',
          OU: 'Engineering',
          CN: 'ca',
          emailAddress: 'ca@example.com'
        })

        done(null, {
          cn: cert.subject.CN
        })
      });

      passport.use(strategy);
      app.use(passport.initialize());
      app.use(passport.authenticate('client-cert', {
        session: false
      }))

      app.use(function (req, res) {
        assert.isTrue(req.isAuthenticated());
        res.end(JSON.stringify(req.user));
      });

      createHttpsServer(app, function () {
        request.get(validRequestOptions, function (err, res) {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.body, '{"cn":"ann"}');
          done();
        })
      })

    });

  });

  describe('handling a request with no client cert', function () {
    var noCertRequestOptions = {
      hostname: 'localhost',
      url: 'https://localhost:' + HTTPS_PORT,
      path: '/',
      method: 'GET',
      ca: caCert // don't error when request encounters the server's self-signed cert
    }

    it('rejects authorization without calling the verify callback', function (done) {
      var app = connect();

      var strategy = new ClientCertStrategy(function (cert, done) {
        assert.fail(); // should not be called
        done();
      });

      passport.use(strategy);
      app.use(passport.initialize());
      app.use(passport.authenticate('client-cert', {
        session: false
      }))

      app.use(function (req, res) {
        assert.fail(); // should not be called
        res.end();
      });

      createHttpsServer(app, function () {
        request.get(noCertRequestOptions, function (err, res, c) {
          assert.equal(res.statusCode, 401);
          done();
        })
      });
    });

  });

  describe('handling a http request', function () {
    var httpRequestOptions = {
      hostname: 'localhost',
      url: 'http://localhost:' + HTTP_PORT,
      path: '/',
      method: 'GET',
    }

    it('rejects authorization without calling the verify callback', function (done) {
      var app = connect();

      var strategy = new ClientCertStrategy(function (cert, done) {
        assert.fail(); // should not be called
        done();
      });

      passport.use(strategy);
      app.use(passport.initialize());
      app.use(passport.authenticate('client-cert', {
        session: false
      }))

      app.use(function (req, res) {
        assert.fail(); // should not be called
        res.end();
      });

      createHttpServer(app, function () {
        request.get(httpRequestOptions, function (err, res, c) {
          console.log(err);
          assert.equal(res.statusCode, 401);
          done();
        })
      });
    });

  });


  describe('handling a request with a self-signed client cert', function () {
    var validRequestOptions; 

    beforeEach(function () {
      validRequestOptions = {
        hostname: 'localhost',
        url: 'https://localhost:' + HTTPS_PORT,
        path: '/',
        method: 'GET',
        key: clientKey,
        cert: clientCert,
        rejectUnauthorized: false
      }
    });

    it('passes the certificate to the verify callback when allowUnauthorized is true ', function (done) {
      var app = connect();

      var strategy = new ClientCertStrategy(function (cert, done) {
        assert.strictEqual(cert.fingerprint,
          '17:2C:6E:88:E8:F3:6F:41:C7:3A:FE:6D:35:3E:7E:AA:09:09:E4:5B')

        assert.deepEqual(cert.subject, {
          C: 'UK',
          ST: 'Gloucestershire',
          L: 'Cheltenham',
          O: 'Ripjar',
          OU: 'Engineering',
          CN: 'ann',
          emailAddress: 'ann@example.com'
        })
        done(null, {
          cn: cert.subject.CN
        })
      });

      passport.use(strategy);
      app.use(passport.initialize());
      app.use(passport.authenticate('client-cert', {
        session: false,
        allowUnauthorized: true
      }))

      app.use(function (req, res) {
        assert.isTrue(req.isAuthenticated());
        res.end(JSON.stringify(req.user));
      });

      createHttpsServer(app, function () {
        request.get(validRequestOptions, function (err, res) {
          assert.equal(res.statusCode, 200);
          assert.deepEqual(res.body, '{"cn":"ann"}');
          done();
        })
      })

    });

  });
});