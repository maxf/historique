#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: $0 admin-password"
fi



ADMIN_PASSWORD=$1

#apt-get -y update
#apt-get -y upgrade
apt-get install git nginx

# docker
apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 36A1D7869245C8950F966E92D8576A8BA88D21E9
echo deb https://get.docker.com/ubuntu docker main > /etc/apt/sources.list.d/docker.list
apt-get update
apt-get install lxc-docker

# postgres
docker rm -f timelines-db
docker run --name timelines-db -e POSTGRES_PASSWORD=timelines -d postgres

rm -rf historique
git clone https://github.com/maxf/historique.git
cd historique
cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.bak
cp nginx.conf /etc/nginx/sites-enabled/default

docker rm -f timelines
docker build -t="maxf/historique:v1" .
docker run -d -p 8000:8000  -e "ADMIN_PASSWORD=${ADMIN_PASSWORD}" --name timelines --link timelines-db:pg maxf/historique:v1
docker cp timelines:/home/webapp/static /home/ubuntu/static
