from django.contrib import admin
from events.models import Event, Comment, Person, Link

admin.site.register(Event)
admin.site.register(Comment)
admin.site.register(Person)
admin.site.register(Link)

