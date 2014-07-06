var util = require('util'),
    passport = require('passport');

/*
 * passport.js SSL client certificate strategy
 */
function PkiStrategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('PKI authentication strategy requires a verify function');

  passport.Strategy.call(this);
  this.name = 'pki';
  this._verify = verify;
}

util.inherits(PkiStrategy, passport.Strategy);

PkiStrategy.prototype.authenticate = function(req, options) {
  var that = this,
      clientCert = req.connection.getPeerCertificate();

  if(!req.client.authorized) {
    that.fail();
  } else {
    this._verify(clientCert.subject, function(err, user) {
      if (err) { return that.error(err); }
      if (!user) { return that.fail(); }
      that.success(user);
    });
  }
};

exports.Strategy = PkiStrategy;
