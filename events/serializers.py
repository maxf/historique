from events.models import Person, Event, Link
from rest_framework import serializers


class PeopleSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id', 'name')

class EventSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('id', 'title', 'description')

class PersonSerializer(serializers.HyperlinkedModelSerializer):
    events = EventSerializer(many=True)
    class Meta:
        model = Person
        fields = ('id', 'name', 'photo', 'events')
