docker save posture-pad-mqtt-listener:latest | ssh lonos "docker load"

scp apps/mqtt/docker-compose.production.yml lonos:/home/mm/app/docker-compose.yml
scp apps/mqtt/mosquitto.conf lonos:/home/mm/app/mosquitto.conf
scp .env.local lonos:/home/mm/app/.env
scp apps/mqtt/keys/server.key apps/mqtt/keys/server.crt lonos:/home/mm/app/certs
scp apps/mqtt/passwd lonos:/home/mm/app/passwd

ssh lonos "chmod 644 /home/mm/app/passwd"
ssh lonos "chmod 644 /home/mm/app/certs/server.key"
