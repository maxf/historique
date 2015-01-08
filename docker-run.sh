#!/bin/bash

export PGURL=postgres://postgres:${PG_ENV_POSTGRES_PASSWORD}@${PG_PORT_5432_TCP_ADDR}:${PG_PORT_5432_TCP_PORT}/postgres
export STATIC_ROOT=/home/webapp/static/

#./manage.py syncdb
./manage.py makemigrations
./manage.py migrate
./manage.py collectstatic

if [[ $1 -eq import ]]; then
    echo importing from initial data
    ./manage.py import < data/timeline.json
fi

#./manage.py runserver 0.0.0.0:8000
gunicorn timelines.wsgi
