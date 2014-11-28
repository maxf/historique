from django.db import models;

class Settings(models.Model):
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=2000)
    string_people = models.CharField(max_length=50)
    string_events = models.CharField(max_length=50)
    string_no_events = models.CharField(max_length=50)
    string_links = models.CharField(max_length=50)
    string_comments = models.CharField(max_length=50)
    string_no_comments = models.CharField(max_length=50)
    string_add_comment = models.CharField(max_length=50)
    string_send = models.CharField(max_length=50)


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
    date = models.DateTimeField('Event date', blank=True, null=True)
    photo = models.URLField(blank=True)
    links = models.ManyToManyField(Link, blank=True, null=True)
    people = models.ManyToManyField(Person, blank=True)
    z = models.DecimalField(max_digits=20, decimal_places=10, null=True, blank=True)
    def __unicode__(self):
        return self.title
    def get_absolute_url(self):
        return "/events/event/%i/" % self.id

class Comment(models.Model):
    text = models.CharField(max_length=2000)
    event = models.ForeignKey(Event)
    def __unicode__(self):
        return self.text
