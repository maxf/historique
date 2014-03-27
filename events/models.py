from django.db import models;

class Link(models.Model):
    title = models.CharField(max_length=200, blank=True)
    url = models.URLField()
    def __unicode__(self):
        return self.title + ' (' + self.url + ')'


class Person(models.Model):
    name = models.CharField(max_length=100)
    links = models.ManyToManyField(Link, blank=True, null=True)
    photo = models.URLField(blank=True)
    def __unicode__(self):
        return self.name
    def get_absolute_url(self):
        return "/events/person/%i/" % self.id

class Event(models.Model):
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=2000, blank=True)
    eventType = models.CharField(max_length=50, blank=True)
    date = models.DateField('Event date', blank=True, null=True)
    links = models.ManyToManyField(Link, blank=True, null=True)
    people = models.ManyToManyField(Person, blank=True)
    def __unicode__(self):
        return self.title
    def get_absolute_url(self):
        return "/events/event/%i/" % self.id

class Comment(models.Model):
    text = models.CharField(max_length=2000)
    event = models.ForeignKey(Event)
    def __unicode__(self):
        return self.text

