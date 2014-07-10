var util = require('util'),
    passport = require('passport');

/*
 * passport.js SSL client certificate strategy
 */
function UpstreamStrategy(options, verify) {
  if (!verify) throw new Error('PKI upstream authentication strategy requires a verify function');
  if (!options.headers) throw new Error('PKI upstream authentication strategy requires a headers option');

  passport.Strategy.call(this);

  this.name = 'pki-upstream';
  this._verify = verify;
  this._headers = options.headers;
}

util.inherits(UpstreamStrategy, passport.Strategy);

UpstreamStrategy.prototype.authenticate = function(req, options) {
  var that = this,
      extractedHeaders = {};

  var foundHeaders = this._headers.every(function(h) {
    if(req.headers[h]) {
      extractedHeaders[h] = req.headers[h];
      return true;
    }
  });

  if(foundHeaders) {
    this._verify(extractedHeaders, function(err, user) {
      if (err) { return that.error(err); }
      if (!user) { return that.fail(); }
      that.success(user);
    });
  } else {
    this.fail();
  }
};

exports.Strategy = UpstreamStrategy;
