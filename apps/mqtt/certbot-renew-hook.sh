#!/bin/bash

CERT_DIR=/home/mm/app/apps/mqtt/keys

mkdir -p $CERT_DIR

cp -L -r /etc/letsencrypt/live/pp.mattymo.dev/* $CERT_DIR

chown -R 1883:1883 $CERT_DIR

docker compose -f /home/mm/app/docker-compose.yml restart mosquitto

echo "Done!"
