var util = require('util'),
    passport = require('passport');

/*
 * passport.js TLS client certificate strategy
 */
function ClientCertStrategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('Client cert authentication strategy requires a verify function');

  passport.Strategy.call(this);
  this.name = 'client-cert';
  this._verify = verify;
}

util.inherits(ClientCertStrategy, passport.Strategy);

ClientCertStrategy.prototype.authenticate = function(req, options) {
  var that = this;

  // Requests must be authorized
  // (i.e. the certificate must be signed by at least one trusted CA)
  if(!req.client.authorized) {
    that.fail();
  } else {
    var clientCert = req.connection.getPeerCertificate();

    // The cert must exist and be non-empty
    if(!clientCert || Object.getOwnPropertyNames(clientCert).length === 0) {
      that.fail();
    } else {

      this._verify(clientCert, function(err, user) {
        if (err) { return that.error(err); }
        if (!user) { return that.fail(); }
        that.success(user);
      });
    }
  }
};

exports.Strategy = ClientCertStrategy;
