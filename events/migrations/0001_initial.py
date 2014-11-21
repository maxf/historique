# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('text', models.CharField(max_length=2000)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Event',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('description', models.CharField(max_length=2000, blank=True)),
                ('eventType', models.CharField(max_length=50, blank=True)),
                ('date', models.DateTimeField(null=True, verbose_name=b'Event date', blank=True)),
                ('photo', models.URLField(blank=True)),
                ('z', models.DecimalField(null=True, max_digits=20, decimal_places=10, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Link',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200, blank=True)),
                ('url', models.URLField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Person',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('name', models.CharField(max_length=100)),
                ('photo', models.URLField(blank=True)),
                ('links', models.ManyToManyField(to='events.Link', null=True, blank=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='event',
            name='links',
            field=models.ManyToManyField(to='events.Link', null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='event',
            name='people',
            field=models.ManyToManyField(to='events.Person', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='comment',
            name='event',
            field=models.ForeignKey(to='events.Event'),
            preserve_default=True,
        ),
    ]
