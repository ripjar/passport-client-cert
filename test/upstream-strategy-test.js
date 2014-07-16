var chai = require('chai'),
    should = chai.should(),
    PkiStrategy = require('../').UpstreamStrategy,
    helpers = require('./helpers');

describe('Upstream PKI Strategy', function() {
  var strategy = new PkiStrategy({ headers: ['something'] }, function() {});

  it('should be named pki-upstream', function() {
    strategy.name.should.equal('pki-upstream');
  });

  it('should require a verify function and a headers option', function() {
    (function() {
      new PkiStrategy({});
    }).should.throw(Error);

    var f = function() {};
    (function() {
      new PkiStrategy({}, f);
    }).should.throw(Error);

    new PkiStrategy({ headers: ['something'] }, f);
  });

  describe('strategy authenticating a request', function() {
    var req,
        headers = { h1: 'header one', h2: 'header two', h3: 'header three' },
        options = { headers: ['h1', 'h2'] },
        failed,
        succeeded,
        passedToVerify;

    var fail = function() { failed = true },
        success = function() { succeeded = true },
        err = function() { throw new Error('should not be called') };

    beforeEach(function() {
      strategy = new PkiStrategy(options, function(cert, f) {
        passedToVerify = cert;
      });

      failed = false;
      succeeded = false;
      passedToVerify = null;

      strategy.fail = fail;
      strategy.success = success;
      strategy.error = err;
    });

    it('should fail if no headers are provided', function() {
      req = helpers.dummyReq(null, null, {});

      strategy.authenticate(req);
      failed.should.eq(true);
    });

    it('should fail if a subset of required headers are provided', function() {
      req = helpers.dummyReq(null, null, { h1: headers.h1 });

      strategy.authenticate(req);
      failed.should.eq(true);
    });

    it('should pass extracted headers to the verify callback', function() {
      req = helpers.dummyReq(null, null, headers);

      strategy.authenticate(req);
      passedToVerify.should.eql({ h1: headers.h1, h2: headers.h2 });
    });

    it('should succeed if the verify callback provided a user', function() {
      strategy = new PkiStrategy(options, function(cert, done) {
        done(null, {});
      });

      strategy.fail = strategy.error = err;
      strategy.success = success;
      req = helpers.dummyReq(null, null, headers);

      strategy.authenticate(req);
      succeeded.should.eq(true);

    });

    it('should fail if the verify callback provided -false- instead of a user', function() {
      strategy = new PkiStrategy(options, function(cert, done) {
        done(null, false);
      });

      strategy.fail = fail;
      strategy.success = strategy.error = err;

      req = helpers.dummyReq(null, null, headers);
      strategy.authenticate(req);

      failed.should.eq(true);
    });

    it('should error if the verify callback provided an error', function() {
      strategy = new PkiStrategy(options, function(cert, done) {
        done(new Error('error from verify'));
      });

      var ok = false;
      strategy.error = function() { ok = true };
      strategy.success = strategy.fail = err;

      req = helpers.dummyReq(null, null, headers);
      strategy.authenticate(req);

      ok.should.eq(true);
    });

  });

});
