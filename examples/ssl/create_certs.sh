#!/bin/sh
# Do not follow these steps to create production certs!

function create_user
{
user="$@"
openssl genrsa -out ${user}.key 1024
openssl req -new -key ${user}.key -out ${user}.csr <<END
.
.
.
.
.
${user}
.
.

END
openssl x509 -req -in ${user}.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out ${user}.crt
}

cd $(dirname $0)
rm *.{crt,key,csr,srl} 2> /dev/null


# Self-signed CA key/cert
openssl genrsa -out ca.key 2048
openssl req -new -x509 -key ca.key -out ca.crt <<END
.
.
.
.
.
CA
.
END

# Server key/cert
openssl genrsa -out server.key 1024
openssl req -new -key server.key -out server.csr <<END
.
.
.
.
.
localhost
.
.
.
END
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out server.crt

# Client key/cert for user 'joe'
create_user "joe"

# Client key/cert for user 'bob', who is not in the example users list
create_user "bob"


# Return to previous working dir
cd -
