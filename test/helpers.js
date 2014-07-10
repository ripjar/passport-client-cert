/*
 * Stub the relevent parts of the request API
 */
exports.dummyReq = function(authorized, cert, headers) {
  return {
    client: {
      authorized: authorized
    },
    connection: {
      getPeerCertificate: function() {
        return cert;
      }
    },
    headers: headers
  };
};
