FROM phusion/baseimage:0.9.12
MAINTAINER Max Froumentin <max@froumentin.net>

# needs postgres container
# docker run --name some-postgres -e POSTGRES_PASSWORD=timelines -d postgres
# docker run -it --link some-postgres:postgres --rm postgres sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U postgres'
# docker logs -f 7fddedfc2205

# docker build -t="maxf/historique:v1" .
# docker run -t -p 8000 --name timelines --link some-postgres:pg maxf/historique:v1
# docker exec -it 6fac691c7fb7 bash

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update
RUN apt-get install -y git python-pip python-dev postgresql-server-dev-all

RUN useradd -ms /bin/bash webapp
WORKDIR /home/webapp
RUN mkdir historique
RUN chown -R webapp:webapp historique
COPY requirements.txt /home/webapp/
RUN pip install -r requirements.txt

USER webapp
COPY . /home/webapp/historique/
EXPOSE 8000
WORKDIR /home/webapp/
RUN mkdir static
WORKDIR /home/webapp/historique

CMD ./docker-run.sh import


