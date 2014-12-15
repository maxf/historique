import json
from django.core.management.base import BaseCommand, CommandError
from events.models import Event, Person


class Command(BaseCommand):
    help = 'Export the application\'s data to a json file'

    def handle(self, *args, **options):

        export_obj = { 'people': {}, 'events': [] }

        people = Person.objects.all()
        for person in people:
            export_obj['people'][person.id] = person.name

        events = Event.objects.all()
        for event in events:
            event_obj = { 'title':event.title, 'z':event.z, 'participants':[] }
            for person in event.people.all():
                event_obj['participants'].append(person.id)
            export_obj['events'].append(event_obj)

        self.stdout.write(json.dumps(export_obj))
