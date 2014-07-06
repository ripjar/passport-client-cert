/*
 * Stub the relevent parts of the request API
 */
exports.dummyReq = function(authorized, cert) {
  return {
    client: {
      authorized: authorized
    },
    connection: {
      getPeerCertificate: function() {
        return cert;
      }
    }
  };
};
