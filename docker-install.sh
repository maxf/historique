#!/bin/bash

cd
git clone git@github.com:maxf/historique.git
cd historique
docker build -t="maxf/historique:v1" .

docker run --name timelines-db -e POSTGRES_PASSWORD=timelines -d postgres

@@ remove interactive functions [collectstatic, syncdb admin]
docker run -p 8000:8000 --name timelines --link timelines-db:pg maxf/historique:v1

docker cp timelines:/home/webapp/static .

@@ sudo :(
sudo cp nginx.conf /etc/nginx/sites-enabled/default
