from django.contrib import admin
from events.models import Event, Comment, Person, Link


class EventAdmin(admin.ModelAdmin):
    list_display = ('title','date')

admin.site.register(Event, EventAdmin)
#admin.site.register(Comment)
admin.site.register(Person)
admin.site.register(Link)

