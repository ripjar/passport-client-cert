var chai = require('chai'),
    should = chai.should(),
    Strategy = require('../').Strategy,
    helpers = require('./helpers');

describe('Client cert strategy', function() {

  var strategy = new Strategy(function() {});

  it('should be named client-cert', function() {
    strategy.name.should.equal('client-cert');
  });

  it('should require a verify function', function() {
    (function() {
      new Strategy();
    }).should.throw(Error);

    (function() {
      new Strategy({});
    }).should.throw(Error);

    // should not throw an error
    var f = function() {};
    new Strategy(f);
    new Strategy({}, f);
  });

  describe('strategy authenticating a request', function() {
    var req,
        cert = { CA: 'common name' },
        failed,
        succeeded,
        passedToVerify;

    var fail = function() { failed = true },
        success = function() { succeeded = true },
        err = function() { throw new Error('should not be called') };

    beforeEach(function() {
      strategy = new Strategy(function(cert, f) {
        passedToVerify = cert;
      });

      failed = false;
      succeeded = false;
      passedToVerify = null;

      strategy.fail = fail;
      strategy.success = success;
      strategy.error = err;
    });

    it('should fail if the cert is not authorized', function() {
      req = helpers.dummyReq(false);

      strategy.authenticate(req);
      failed.should.eq(true);
    });

    it('should fail if the cert is missing', function() {
      req = helpers.dummyReq(true, null);

      strategy.authenticate(req);
      failed.should.eq(true);
    });

    it('should fail if the cert is empty', function() {
      req = helpers.dummyReq(true, {});

      strategy.authenticate(req);
      failed.should.eq(true);
    });

    it('should pass the parsed cert to the verify callback', function() {
      req = helpers.dummyReq(true, cert);

      strategy.authenticate(req);
      passedToVerify.should.eq(cert);
    });

    it('should succeed if the verify callback provided a user', function() {
      strategy = new Strategy(function(cert, done) {
        done(null, {});
      });

      strategy.success = success;
      strategy.fail = strategy.error = err;
      req = helpers.dummyReq(true, cert);

      strategy.authenticate(req);
      succeeded.should.eq(true);

    });

    it('should fail if the verify callback provided -false- instead of a user', function() {
      strategy = new Strategy(function(cert, done) {
        done(null, false);
      });

      strategy.fail = fail;
      strategy.success = strategy.error = err;

      req = helpers.dummyReq(true, cert);
      strategy.authenticate(req);

      failed.should.eq(true);
    });

    it('should error if the verify callback provided an error', function() {
      strategy = new Strategy(function(cert, done) {
        done(new Error('error from verify'));
      });

      var ok = false;
      strategy.error = function() { ok = true };
      strategy.success = strategy.fail = err;

      req = helpers.dummyReq(true, cert);
      strategy.authenticate(req);

      ok.should.eq(true);
    });

    it("should pass the request object to the verify callback when directed", function () {
      var passedReq;

      strategy = new Strategy({ passReqToCallback: true }, function (req, cert, done) {
        passedReq = req;
        done(null, {});
      });

      strategy.fail = fail;
      strategy.success = success;
      req = helpers.dummyReq(true, cert);

      strategy.authenticate(req);

      failed.should.eq(false);
      succeeded.should.eq(true);
      passedReq.should.eq(req);
    });

  });

});
