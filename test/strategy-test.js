var chai = require('chai'),
    should = chai.should(),
    PkiStrategy = require('../').Strategy,
    helpers = require('./helpers');

describe('Passport PKI Strategy', function() {

  var strategy = new PkiStrategy(function() {});

  it('should be named pki', function() {
    strategy.name.should.equal('pki');
  });

  it('should require a verify function', function() {
    (function() {
      new PkiStrategy();
    }).should.throw(Error);

    (function() {
      new PkiStrategy({});
    }).should.throw(Error);

    var f = function() {};
    (function() {
      new PkiStrategy(f);
    }).should.not.throw(Error);

    (function() {
      new PkiStrategy({}, f);
    }).should.not.throw(Error);
  });

  describe('strategy authenticating a request', function() {
    var req,
        cert = { CA: 'common name' },
        failed,
        succeeded,
        passedToVerify;

    beforeEach(function() {
      strategy = new PkiStrategy(function(cert, f) {
        passedToVerify = cert;
      });

      failed = false;
      succeeded = false;
      passedToVerify = null;

      strategy.fail = function() { failed = true };
      strategy.success = function() { succeeded = true };
    });

    it('should fail if the cert is not authorized', function() {
      req = helpers.dummyReq(false);

      strategy.authenticate(req);
      failed.should.eq(true);
      succeeded.should.eq(false);
    });

    it('should fail if the cert is missing', function() {
      req = helpers.dummyReq(true, null);

      strategy.authenticate(req);
      failed.should.eq(true);
      succeeded.should.eq(false);
    });

    it('should fail if the cert is empty', function() {
      req = helpers.dummyReq(true, {});

      strategy.authenticate(req);
      failed.should.eq(true);
      succeeded.should.eq(false);
    });

    it('should pass the parsed cert to the verify callback', function() {
      req = helpers.dummyReq(true, cert);

      strategy.authenticate(req);
      passedToVerify.should.eq(cert);
    });

    it('should succeed if the verify callback provided a user', function() {
      strategy = new PkiStrategy(function(cert, done) {
        done(null, {});
      });

      strategy.fail = function() { throw new Error('should not be called') };
      strategy.success = strategy.error = function() { succeeded = true };
      req = helpers.dummyReq(true, cert);

      strategy.authenticate(req);
      succeeded.should.eq(true);

    });

    it('should fail if the verify callback provided -false- instead of a user', function() {
      strategy = new PkiStrategy(function(cert, done) {
        done(null, false);
      });

      strategy.fail = function() { failed = true };
      strategy.success = strategy.error = function() { throw new Error('should not be called')  };

      req = helpers.dummyReq(true, cert);
      strategy.authenticate(req);

      failed.should.eq(true);
    });

    it('should error if the verify callback provided an error', function() {
      strategy = new PkiStrategy(function(cert, done) {
        done(new Error('error from verify'));
      });

      var ok = false;
      strategy.error = function() { ok = true };
      strategy.success = strategy.fail = function() { throw new Error('should not be called')  };

      req = helpers.dummyReq(true, cert);
      strategy.authenticate(req);

      ok.should.eq(true);
    });

  });

});
