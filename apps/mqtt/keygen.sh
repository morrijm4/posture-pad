OUT_DIR=keys

mkdir -p $OUT_DIR

# Generate CA key and certificate
openssl genrsa -out $OUT_DIR/ca.key 2048
openssl req -new \
    -x509 \
    -days 3650 \
    -key $OUT_DIR/ca.key \
    -out $OUT_DIR/ca.crt \
    -subj "/CN=PosturePad" 

# Generate server key and CSR
openssl genrsa -out $OUT_DIR/server.key 2048
openssl req \
    -new \
    -key $OUT_DIR/server.key \
    -out $OUT_DIR/server.csr \
    -subj "/CN=74.208.37.89"

openssl x509 -req \
    -days 3650 \
    -in $OUT_DIR/server.csr \
    -CA $OUT_DIR/ca.crt \
    -CAkey $OUT_DIR/ca.key \
    -CAcreateserial \
    -out $OUT_DIR/server.crt \
    -extfile $OUT_DIR/san.cnf
