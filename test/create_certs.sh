#!/bin/sh
# Do not follow these steps to create production certs!

data_dir=$(dirname $0)/data

function create_user
{
user="$@"
openssl genrsa -out ${user}.key 1024
openssl req -new -key ${user}.key -out ${user}.csr <<END
UK
Gloucestershire
Cheltenham
Ripjar
Engineering
${user}
${user}@example.com
.

END
openssl x509 -req -in ${user}.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 9999 -out ${user}.crt
}

function create_ca
{
openssl genrsa -out ca.key 2048
openssl req -new -x509 -key ca.key -days 9999 -out ca.crt <<END
UK
Gloucestershire
Cheltenham
Ripjar
Engineering
ca
ca@example.com
END
}

# Server key/cert
function create_server
{
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
openssl x509 -req -in server.csr -CA ca.crt -CAkey ca.key -CAcreateserial -days 9999 -out server.crt
}

rm -rf $data_dir
mkdir -p $data_dir
cd $data_dir

create_ca
create_server
create_user "ann"
create_user "bob"

echo "Remember to update expected cert values in integration tests!"

cd -
