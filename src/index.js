var util = require('util'),
    Strategy = require('passport-strategy');

/*
 * passport.js TLS client certificate strategy
 */
function ClientCertStrategy(options, verify) {
  if (typeof options == 'function') {
    verify = options;
    options = {};
  }
  if (!verify) throw new Error('Client cert authentication strategy requires a verify function');

  Strategy.call(this);
  this.name = 'client-cert';
  this._verify = verify;
  this._passReqToCallback = options.passReqToCallback;
}

util.inherits(ClientCertStrategy, Strategy);

ClientCertStrategy.prototype.authenticate = function(req, options) {
  var that = this;
  options = options || {};

  // Requests must be authorized
  // (i.e. the certificate must be signed by at least one trusted CA)
  if(!req.socket.authorized && !options.allowUnauthorized) {
    that.fail();
  } else {
    var clientCert = req.socket.getPeerCertificate();

    // The cert must exist and be non-empty
    if(!clientCert || Object.getOwnPropertyNames(clientCert).length === 0) {
      that.fail();
    } else {

      var verified = function verified(err, user) {
        if (err) { return that.error(err); }
        if (!user) { return that.fail(); }
        that.success(user);
      };

      if (this._passReqToCallback) {
        this._verify(req, clientCert, verified);
      } else {
        this._verify(clientCert, verified);
      }
    }
  }
};

exports.Strategy = ClientCertStrategy;
