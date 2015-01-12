#!/bin/bash

export PGURL=postgres://postgres:${PG_ENV_POSTGRES_PASSWORD}@${PG_PORT_5432_TCP_ADDR}:${PG_PORT_5432_TCP_PORT}/postgres
export STATIC_ROOT=/home/webapp/static/

./manage.py makemigrations
./manage.py migrate
./manage.py createsuperuser --noinput --username=admin --email=a@b.com
./change-admin-password ${ADMIN_PASSWORD}
./manage.py collectstatic

if [[ $1 -eq import ]]; then
    echo importing from initial data
    ./manage.py import < data/timeline.json
fi

echo starting the server
#./manage.py runserver 0.0.0.0:8000
gunicorn -b 0.0.0.0:8000 timelines.wsgi
