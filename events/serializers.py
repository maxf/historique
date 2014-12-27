from events.models import Person, Event, Link, EventPerson
from rest_framework import serializers


class PeopleSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id','name')
        depth = 1

class EventShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Event
        fields = ('id','title','year','month','day')

class PersonShortSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Person
        fields = ('id','name')

class EventPersonSerializer(serializers.HyperlinkedModelSerializer):
    participant = PersonShortSerializer()
    class Meta:
        model = EventPerson
        fields = ('participant', 'number')
        depth = 1

class EventSerializer(serializers.HyperlinkedModelSerializer):
    participants = EventPersonSerializer(source='eventperson_set', many=True)
    class Meta:
        model = Event
        fields = ('id','title','photo', 'description','year','month','day','eventType','participants','z')
        depth = 1

class PersonSerializer(serializers.HyperlinkedModelSerializer):
    event_set = EventShortSerializer(many=True)
    class Meta:
        model = Person
        fields = ('id', 'name', 'photo', 'event_set')
        depth = 1
