FROM ubuntu:14.04
MAINTAINER Max Froumentin <max@froumentin.net>


# needs postgres container
# docker run --name some-postgres -e POSTGRES_PASSWORD=timelines -d postgres
# docker run -it --link some-postgres:postgres --rm postgres sh -c 'exec psql -h "$POSTGRES_PORT_5432_TCP_ADDR" -p "$POSTGRES_PORT_5432_TCP_PORT" -U postgres'
# docker logs -f 7fddedfc2205

# docker build -t="maxf/historique:v1" .
# docker run -p 8000:8000 --name timelines-tmp --link some-postgres:pg maxf/historique:v1

EXPOSE 8000

RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update
RUN apt-get install -y git python-virtualenv python-pip python-dev postgresql-server-dev-all apache2

RUN useradd -ms /bin/bash webapp
USER webapp

WORKDIR /home/webapp

RUN git clone https://github.com/maxf/historique.git
WORKDIR historique
RUN virtualenv venv
RUN source venv/bin/activate && pip install -r requirements.txt


CMD ./docker-run.sh

