from django.conf.urls import patterns, url
from events import views

urlpatterns = patterns('',
    url(r'^$', views.events, name='events'),
    url(r'^people/$', views.people, name='people'),
    url(r'^people/add/$', views.add_person, name='add_person'),
    url(r'^event/(?P<event_id>\d+)/$', views.event, name='event'),
    url(r'^event/(?P<event_id>\d+)/send_comment/$', views.send_comment, name='send_comment'),
    url(r'^event/(?P<event_id>\d+)/delete_comment/(?P<comment_id>\d+)/$', views.delete_comment, name='delete_comment'),
    url(r'^person/(?P<person_id>\d+)/$', views.person, name='person'),
)
