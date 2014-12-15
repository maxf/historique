import json
from django.core.management.base import BaseCommand, CommandError
from events.models import Event, Person


class Command(BaseCommand):
    help = 'Import the application\'s data from a json file'


    def handle(self, *args, **options):
        Event.objects.all().delete()
        Person.objects.all().delete()

        import_obj = json.loads(self.stdin.read())

        for person_obj in import_obj['people']:
            Person.objects.create(name=person_obj['name'])

        for event_obj in import_obj['events']:
            event = Event(title=event_obj['title'])
            if hasattr(event_obj, 'year'):
                event['year'] = event_obj['year']
            if hasattr(event_obj, 'month'):
                event['month'] = event_obj['month']
            if hasattr(event_obj, 'day'):
                event['day'] = event_obj['day']
            event.save()
            participant_pks = []
            for participant in event_obj['participants']:
                participant_pks.append(Person.objects.filter(name=participant['name'])[0]['pk'])
            event.participants.add(*participants_pks)
