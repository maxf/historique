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
            Person.objects.create(name=import_obj['people'][person]['name'])

        for event_obj in import_obj['events']:
            event = Event(title=event_obj['title'])
            if 'year' in event_obj:
                event.year = event_obj['year']
            if 'month' in event_obj:
                event.month = event_obj['month']
            if 'day' in event_obj:
                event.day = event_obj['day']
            event.save()
            participants = []
            for participant in event_obj['participants']:
                name = import_obj['people'][str(participant)]['name']
                people_with_that_name = Person.objects.filter(name=name)
                participants.append(Person.objects.filter(name__contains=name)[0])
            event.people.add(*participants)
