import simplejson as json
import decimal
from django.core.management.base import BaseCommand, CommandError
from events.models import Event, Person, Settings

class Command(BaseCommand):
    help = 'Export the application\'s data to a json file'

    def handle(self, *args, **options):

        export_obj = { 'people': {}, 'events': [] }

        people = Person.objects.all()
        for person in people:
            export_obj['people'][person.id] = {
                'name': person.name,
                'photo': person.photo,
                }

        events = Event.objects.all()
        for event in events.order_by('year','month','day'):
            event_obj = { 'title':event.title,
                          'description':event.description,
                          'type':event.eventType,
                          'year':event.year, 'month':event.month, 'day':event.day,
                          'photo':event.photo,
                          'z':event.z,
                          'participants':[] }
            for person in event.participants.all().order_by('link_to_person'):
                event_obj['participants'].append(person.id)
            export_obj['events'].append(event_obj)

        settings = Settings.objects.all()[0]
        export_obj['settings'] = {
            'title': settings.title,
            'description': settings.description,
            'string_people': settings.string_people,
            'string_no_people': settings.string_no_people,
            'string_events': settings.string_events,
            'string_no_events': settings.string_no_events,
            'string_links': settings.string_links,
            'string_no_links': settings.string_no_links,
            'string_comments': settings.string_comments,
            'string_no_comments': settings.string_no_comments,
            'string_add_comment': settings.string_add_comment,
            'string_send': settings.string_send,
        }

        self.stdout.write(json.dumps(export_obj, sort_keys=True, indent=4, separators=(',', ': ')))
