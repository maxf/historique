import sys
import json
from django.core.management.base import BaseCommand, CommandError
from events.models import Event, Person, EventPerson, Settings


class Command(BaseCommand):
    help = 'Import the application\'s data from a json file'


    def handle(self, *args, **options):
        Event.objects.all().delete()
        Person.objects.all().delete()
        EventPerson.objects.all().delete()
        Settings.objects.all().delete()

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
                person = people_with_that_name[0]
                ep = EventPerson.objects.create(
                    number = None,
                    event = event,
                    participant = person
                )
        settings = Settings.objects.create(
            title = import_obj['settings']['title'],
            description = import_obj['settings']['description'],
            string_people = import_obj['settings']['string_people'],
            string_no_people = import_obj['settings']['string_no_people'],
            string_events = import_obj['settings']['string_events'],
            string_no_events = import_obj['settings']['string_no_events'],
            string_links = import_obj['settings']['string_links'],
            string_no_links = import_obj['settings']['string_no_links'],
            string_comments = import_obj['settings']['string_comments'],
            string_no_comments = import_obj['settings']['string_no_comments'],
            string_add_comment = import_obj['settings']['string_add_comment'],
            string_send = import_obj['settings']['string_send'],
        )
