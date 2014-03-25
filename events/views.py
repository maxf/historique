from django.http import Http404
from django.shortcuts import render, get_object_or_404, redirect
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from events.models import Event, Comment, Person, Link
from events.serializers import PersonSerializer, PeopleSerializer, EventSerializer


def events(request):
    events = Event.objects.order_by('date')
    return render(request, 'events/index.html', {'events':events})

def people(request):
    people = Person.objects.order_by('name')
    return render(request, 'people/index.html', {'people':people})

def event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    context = {
        'event': event,
        'comments':Comment.objects.filter(event_id=event_id),
        'links': event.links.all(),
        'people': event.people.all()
    }
    return render(request, 'event/index.html', context)

def send_comment(request, event_id):
    target_event = get_object_or_404(Event, id=event_id)
    target_event.comment_set.create(text=request.POST['comment_text'])
    return redirect(target_event)

def delete_comment(request, event_id, comment_id):
    target_event = get_object_or_404(Event, id=event_id)
    target_comment = Comment.objects.get(id=comment_id)
    target_comment.delete()
    return redirect(target_event)

def person(request, person_id):
    person = get_object_or_404(Person, id=person_id)
    links = person.links.all()
    events = Event.objects.filter(people=person)
    return render(request, 'person/index.html', {'person': person, 'links': links, 'events': events})

def add_person(request):
    Person(name=request.POST['name']).save()
    return redirect('/events/people/')

class PeopleList(generics.ListAPIView):
    """
    List all people
    """
    model = Person
    serializer_class = PeopleSerializer

class PersonDetail(APIView):
    """
    API endpoint that allows one person to be viewed
    """
    def get_object(self, pk):
        try:
            return Person.objects.get(pk=pk)
        except Person.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        person = self.get_object(pk)
        serializer = PersonSerializer(person)
        return Response(serializer.data)

class EventDetail(APIView):
    """
    API endpoint that allows one event to be viewed
    """
    def get_object(self, pk):
        try:
            return Event.objects.get(pk=pk)
        except Event.DoesNotExist:
            raise Http404

    def get(self, request, pk, format=None):
        event = self.get_object(pk)
        serializer = EventSerializer(event)
        return Response(serializer.data)
