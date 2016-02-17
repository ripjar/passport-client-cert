/*
 * Stub the relevent parts of the request API
 */
exports.dummyReq = function(authorized, cert, headers) {
  return {
    socket: {
      getPeerCertificate: function() {
        return cert;
      },
      authorized: authorized
    },
    headers: headers
  };
};
