# -*- coding: utf-8 -*-
"""
Django settings for timelines project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
#

SECRET_KEY = os.environ.get('SECRET_KEY', 'development_key')

# SECURITY WARNING: don't run with debug turned on in production!

DEBUG = bool(os.environ.get('DEBUG', True))

TEMPLATE_DEBUG = bool(os.environ.get('TEMPLATE_DEBUG', True))

ALLOWED_HOSTS = [os.environ.get('ALLOWED_HOST','127.0.0.1')]


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'events'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'timelines.urls'

WSGI_APPLICATION = 'timelines.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': os.environ.get('PGDATABASE','timelines'),
        'USER': os.environ.get('PGUSER','timelines'),
        'PASSWORD': os.environ.get('PGPASSWORD','timelines'),
        'HOST': os.environ.get('PGHOST','localhost')
    }
}



# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.environ.get('STATIC_ROOT', '')

# we're HTTPS on production
CSRF_COOKIE_SECURE=bool(os.environ.get('CSRF_COOKIE_SECURE', False))
SESSION_COOKIE_SECURE=bool(os.environ.get('SESSION_COOKIE_SECURE', False))



REST_FRAMEWORK = {
    # Use hyperlinked styles by default.
    # Only used if the `serializer_class` attribute is not set on a view.
    'DEFAULT_MODEL_SERIALIZER_CLASS':
        'rest_framework.serializers.HyperlinkedModelSerializer',
}


##########################################
# Variables for specific instance
# To be customised before running

INSTANCE_SETTINGS = {
    "title": "%%title%%",
    "description": "%%description%%",
    "people": "%%people%%",
    "events": "%%events%%",
    "no_events": "%%no_events%%",
    "no_people": "%%no_people%%",
    "links": "%%links%%",
    "comments": "%%comments%%",
    "no_comments": "%%no_comments%%",
    "add_comment": "%%add_comment%%",
    "send": "%%send%%",
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'fr-FR'

TIME_ZONE = 'CET'

USE_I18N = True

USE_L10N = True

USE_TZ = True
