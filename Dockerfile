FROM ubuntu:14.04
MAINTAINER Max Froumentin <max@froumentin.net>
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

