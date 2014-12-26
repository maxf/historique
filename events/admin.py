from django.contrib import admin
from events.models import Settings, Event, EventPerson, Comment, Person, Link



class EventPersonInline(admin.TabularInline):
    model = EventPerson
    extra = 1


class EventAdmin(admin.ModelAdmin):
    list_display = ('title','year','month','day')
    inlines = (EventPersonInline,)


class PersonAdmin(admin.ModelAdmin):
    inlines = (EventPersonInline,)


admin.site.register(Settings)
admin.site.register(Event, EventAdmin)
#admin.site.register(Comment)
admin.site.register(Person, PersonAdmin)
admin.site.register(Link)
