FROM ubuntu:14.04
MAINTAINER Max Froumentin <max@froumentin.net>
RUN rm /bin/sh && ln -s /bin/bash /bin/sh
RUN apt-get update
RUN apt-get install -y git python-virtualenv python-pip python-dev postgresql postgresql-client postgresql-server-dev-all apache2

WORKDIR /root
RUN pwd
RUN git clone https://github.com/maxf/historique.git
WORKDIR historique
RUN virtualenv venv
RUN source venv/bin/activate
RUN pip install -r requirements.txt
# TODO: create db
#RUN ./manage.py syncdb
#RUN ./manage.py makemigrations
#RUN ./manage.py migrate
#RUN ./manage.py collectstatic
# TODO LATER apache/cgi
CMD /etc/init.d/postgres start && ./manage.py runserver
