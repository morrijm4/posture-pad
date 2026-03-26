OUT_DIR=keys

mkdir -p $OUT_DIR
cd $OUT_DIR

# Generate CA key and certificate
openssl genrsa -out ca.key 2048
openssl req -new \
    -x509 \
    -days 3650 \
    -key ca.key \
    -out ca.crt \
    -subj "CN=PosturePad" 

# Generate server key and CSR
openssl genrsa -out privkey.pem 2048
openssl req \
    -new \
    -key privkey.pem \
    -out server.csr \
    -subj "/CN=pp.mattymo.dev"

openssl x509 -req \
    -days 3650 \
    -in server.csr \
    -CA ca.crt \
    -CAkey ca.key \
    -CAcreateserial \
    -out fullchain.pem \
    -extfile san.cnf
