from events.models import Person, Event, Link
from rest_framework import serializers


class PeopleSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id','name')
        depth = 1

class EventShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('id','title','date')

class PersonShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id','name')

class EventSerializer(serializers.HyperlinkedModelSerializer):
    people = PersonShortSerializer(many=True)
    class Meta:
        model = Event
        fields = ('id','title','description','date','eventType','people')
        depth = 1

class PersonSerializer(serializers.HyperlinkedModelSerializer):
    event_set = EventShortSerializer(many=True)
    class Meta:
        model = Person
        fields = ('id', 'name', 'photo', 'event_set')
        depth = 1
