#!/usr/bin/env python

import sys
import os
from django.core.wsgi import get_wsgi_application

password = sys.argv[1]
os.environ['DJANGO_SETTINGS_MODULE'] = 'timelines.settings'
application = get_wsgi_application()

from django.contrib.auth.models import User

u = User.objects.get(username='admin')
u.set_password(password)
u.save()
