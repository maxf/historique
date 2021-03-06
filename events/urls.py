from django.conf.urls import patterns, url
from events import views
from rest_framework.routers import DefaultRouter
#from rest_framework.urlpatterns import format_suffix_patterns
from django.conf import settings


urlpatterns = patterns('',
    url(r'^$', views.home, name='home'),
    url(r'^events/$', views.events, name='events'),
    url(r'^people/$', views.people, name='people'),
    url(r'^event/(?P<event_id>\d+)/$', views.event, name='event'),
    url(r'^person/(?P<person_id>\d+)/$', views.person, name='person'),
    url(r'^about/$', views.about, name='about'),
)

if settings.INSTANCE_SETTINGS['features_enabled']['comments']:
    urlpatterns += patterns('',
        url(r'^event/(?P<event_id>\d+)/send_comment/$', views.send_comment, name='send_comment'),
        url(r'^event/(?P<event_id>\d+)/delete_comment/(?P<comment_id>\d+)/$', views.delete_comment, name='delete_comment')
    )


#urlpatterns = format_suffix_patterns(urlpatterns)



router = DefaultRouter()
router.register(r'api/person', views.PersonViewSet)
router.register(r'api/event', views.EventViewSet)
urlpatterns += router.urls
