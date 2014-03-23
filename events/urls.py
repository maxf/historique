from django.conf.urls import patterns, url
from events import views
from rest_framework.urlpatterns import format_suffix_patterns
from django.conf import settings


urlpatterns = patterns('',
    url(r'^$', views.events, name='events'),
    url(r'^people/$', views.people, name='people'),
    url(r'^people/add/$', views.add_person, name='add_person'),
    url(r'^event/(?P<event_id>\d+)/$', views.event, name='event'),
    url(r'^event/(?P<event_id>\d+)/send_comment/$', views.send_comment, name='send_comment'),
    url(r'^event/(?P<event_id>\d+)/delete_comment/(?P<comment_id>\d+)/$', views.delete_comment, name='delete_comment'),
    url(r'^person/(?P<person_id>\d+)/$', views.person, name='person'),

    url(r'^api/people/$', views.PeopleList.as_view()),
    url(r'^api/person/(?P<pk>[0-9]+)/$', views.PersonDetail.as_view()),
)

urlpatterns = format_suffix_patterns(urlpatterns)
