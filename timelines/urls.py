from django.conf.urls import patterns, include, url
from django.shortcuts import redirect
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^events/', include('events.urls', namespace='events')),
    (r'^$', lambda x: redirect('/events/')),
    url(r'^admin/', include(admin.site.urls)),
)
