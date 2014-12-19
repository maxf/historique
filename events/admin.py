from django.contrib import admin
from events.models import Settings, Event, Comment, Person, Link


class EventAdmin(admin.ModelAdmin):
    list_display = ('title','year','month','day')

admin.site.register(Settings)
admin.site.register(Event, EventAdmin)
#admin.site.register(Comment)
admin.site.register(Person)
admin.site.register(Link)
