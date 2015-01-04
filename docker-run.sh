#!/bin/bash

. venv/bin/activate
export PGURL=postgres://postgres:${PG_ENV_POSTGRES_PASSWORD}@${PG_PORT_5432_TCP_ADDR}:${PG_PORT_5432_TCP_PORT}/postgres
source venv/bin/activate
./manage.py syncdb
./manage.py makemigrations
./manage.py migrate
#./manage.py collectstatic
./manage.py runserver
