import json
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
            for person in event.people.all():
                event_obj['participants'].append(person.id)
            export_obj['events'].append(event_obj)

        settings = Settings.objects.all()[0]
        export_obj['settings'] = settings

        self.stdout.write(json.dumps(export_obj, sort_keys=True, indent=4, separators=(',', ': ')))
