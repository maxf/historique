from django.http import Http404
from django.shortcuts import render, get_object_or_404, redirect
from django.conf import settings
from rest_framework import viewsets
from rest_framework.response import Response
from events.models import Event, Comment, Person, Link
from events.serializers import PersonSerializer, PeopleSerializer, EventSerializer

def home(request):
    return render(request, 'home/index.html', {'instance_settings': settings.INSTANCE_SETTINGS})

def about(request):
    return render(request, 'about/index.html', {'instance_settings': settings.INSTANCE_SETTINGS})


def events(request):
    events = Event.objects.order_by('date')
    return render(request, 'events/index.html', {'events':events, 'instance_settings': settings.INSTANCE_SETTINGS})

def people(request):
    people = Person.objects.order_by('name')
    return render(request, 'people/index.html', {'people':people, 'instance_settings': settings.INSTANCE_SETTINGS})

def event(request, event_id):
    event = get_object_or_404(Event, id=event_id)
    context = {
        'event': event,
        'comments':Comment.objects.filter(event_id=event_id),
        'links': event.links.all(),
        'people': event.people.all(),
        'instance_settings': settings.INSTANCE_SETTINGS
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
    context = {'person': person, 'links': links, 'events': events, 'instance_settings': settings.INSTANCE_SETTINGS}
    return render(request, 'person/index.html', context)



# API viewsets

class PersonViewSet(viewsets.ModelViewSet):
    serializer_class = PersonSerializer
    queryset = Person.objects.all()
    def list(self, request):
        queryset = Person.objects.all()
        serializer = PersonSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = Person.objects.all()
        person = get_object_or_404(queryset, pk=pk)
        serializer = PersonSerializer(person)
        return Response(serializer.data)

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer
    queryset = Event.objects.all()
    def list(self, request):
        queryset = Event.objects.all()
        serializer = EventSerializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        queryset = Event.objects.all()
        event = get_object_or_404(queryset, pk=pk)
        serializer = EventSerializer(event)
        return Response(serializer.data)

    def update_z(self, request, pk=None):
        if request.POST is not None:
            event = get_object_or_404(queryset, pk=pk)
            new_z = request.POST.get('z', None)
            if new_z is not None:
                event.z = new_z
                event.save()
                return Response(EventSerializer(event))
