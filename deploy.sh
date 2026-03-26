WORKDIR=/home/mm/app

ssh lonos "mkdir -p $WORKDIR/apps/mqtt"

scp .env.local docker-compose.yml lonos:$WORKDIR
scp apps/mqtt/passwd apps/mqtt/mosquitto.conf lonos:$WORKDIR/apps/mqtt
scp apps/mqtt/certbot-renew-hook.sh lonos:/etc/letsencrypt/renewal-hooks/deploy/mosquitto-copy.sh

ssh lonos "chmod 644 $WORKDIR/apps/mqtt/passwd"
