import sys
import json
from django.core.management.base import BaseCommand, CommandError
from events.models import Event, Person


class Command(BaseCommand):
    help = 'Import the application\'s data from a json file'


    def handle(self, *args, **options):
        Event.objects.all().delete()
        Person.objects.all().delete()

        import_obj = json.loads(sys.stdin.read())

        for person in import_obj['people']:
            Person.objects.create(name=import_obj['people'][person])

        for event_obj in import_obj['events']:
            event = Event(title=event_obj['title'])
            if hasattr(event_obj, 'year'):
                event['year'] = event_obj['year']
            if hasattr(event_obj, 'month'):
                event['month'] = event_obj['month']
            if hasattr(event_obj, 'day'):
                event['day'] = event_obj['day']
            event.save()
            participants = []
            for participant in event_obj['participants']:
                name = import_obj['people'][str(participant)]
                participants.append(Person.objects.filter(name=name)[0])
            event.people.add(*participants)
