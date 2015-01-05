FROM ubuntu:14.04
MAINTAINER Max Froumentin <max@froumentin.net>


# needs postgres container
# docker run --name some-postgres -e POSTGRES_PASSWORD=timelines -d postgres
# docker run -it --link some-postgres:postgres --rm postgres sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U postgres'
# docker logs -f 7fddedfc2205

# docker build -t="maxf/historique:v1" .
# docker run -t -p 8000:8000 --name timelines-tmp --link some-postgres:pg maxf/historique:v1
# docker exec -it 6fac691c7fb7 bash

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update
RUN apt-get install -y git python-virtualenv python-pip python-dev postgresql-server-dev-all apache2 curl

RUN useradd -ms /bin/bash webapp
WORKDIR /home/webapp
RUN mkdir historique
COPY . /home/webapp/historique/
RUN chown -R webapp:webapp historique

USER webapp
WORKDIR /home/webapp/historique

RUN virtualenv venv
RUN source venv/bin/activate && pip install -r requirements.txt


CMD ./docker-run.sh


