# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('events', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Settings',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('title', models.CharField(max_length=200)),
                ('description', models.CharField(max_length=2000)),
                ('string_people', models.CharField(max_length=50)),
                ('string_events', models.CharField(max_length=50)),
                ('string_no_events', models.CharField(max_length=50)),
                ('string_links', models.CharField(max_length=50)),
                ('string_comments', models.CharField(max_length=50)),
                ('string_no_comments', models.CharField(max_length=50)),
                ('string_add_comment', models.CharField(max_length=50)),
                ('string_send', models.CharField(max_length=50)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]
