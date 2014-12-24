var d3, Narrative;

// The API returns dates as 2014-05-15T00:00:00Z. We need to map that
// to time axis interval [min(date), max(date)]
function dateToInt(date_string) {
  return new Date(date_string).getTime();
}


// layout: 'horizontal' or 'vertical'
Narrative = function(anchor, layout) {
'use strict';

// Notes:
// Every object's 2d position is along two axes: t (the timeline) and z (where objects are places)
// Only when we draw the shapes do we finally convert to x and y, according to whether the type is
// horizontal or vertuical

  var g_width, g_height;
  this.g_size={};
  this.g_vertical = layout === 'vertical';
  this.g_person_url_prefix = '/events/person/';
  this.g_event_url_prefix = '/events/event/';
  this.g_margin = { start_t: 50, start_z: 20 };
  this.g_curvature = 0.3;
  this.g_color_scale = d3.scale.category20();
  this.g_people_spacing_in_event = 17;
  this.g_anchor = anchor;
  this.g_layout = layout;
//    g_drag;

    var origz;

//    g_drag = d3.behavior.drag()
//      .on("drag", function(event) {
//        var i, person, ct, cz;
//        event.cz += d3.event.dy;
//        d3.select(this).attr('cy', this.cy.baseVal.value + d3.event.dy);
//
//        // move the event's title too
//        this.nextSibling.firstChild.setAttribute('transform', label_pos(event));
//
//        // recalculate the path of the people who are in that event
//        for (i=0; i<event.people.length; i++) {
//          person = event.people[i];
//          d3.select('#P'+person.id).attr('d', person_path(person));
//          // relocate the perosn's disc with id disc-[person.id]-[event.id]
//          ct = event.ct;
//          cz = event_person_z(event, index_person_in_event(person, event));
//          d3.select('#D'+person.id+'-'+event.id)
//            .attr('cx', this.x(ct,cz))
//            .attr('cy', this.y(ct,cz))
//          ;
//        }
//      })
//      .on("dragend", function(event) {
//        d3.json('/events/api/event/'+event.id+'/set/',
//                function(err, rawData){
//                  console.log("got response", err, rawData);
//                })
//          .header("Content-Type","application/x-www-form-urlencoded")
//          .send('POST', 'z='+event.cz);
//
//      });


};

//##############################################################################


Narrative.prototype.x = function(t,z) { return this.g_vertical ? z : t; };
Narrative.prototype.y = function(t,z) { return this.g_vertical ? t : z; };
Narrative.prototype.z = function(x,y) { return this.g_vertical ? x : y; };
Narrative.prototype.t = function(x,y) { return this.g_vertical ? y : x; };


// The API returns dates as 2014-05-15T00:00:00Z. We need to map that
// to time axis interval [min(date), max(date)]
Narrative.prototype.x=function(date_string) {
  return new Date(date_string).getTime();
};

Narrative.prototype.to_grey = function(color) {
  var grey;
  color = color.brighter(0.5);
  grey = (color.r+color.g+color.b)/3;
  return d3.rgb(grey, grey, grey);
};

Narrative.prototype.get_path = function(t0, z0, t1, z1) {
  var itrp = d3.interpolateNumber(t0, t1),
      t2 = itrp(this.g_curvature),
      t3 = itrp(1 - this.g_curvature);
  return ' M' + this.x(t0, z0) + ',' + this.y(t0, z0) +
         ' C' + this.x(t2, z0) + ',' + this.y(t2, z0) +
         '  ' + this.x(t3, z1) + ',' + this.y(t3, z1) +
         '  ' + this.x(t1, z1) + ',' + this.y(t1, z1);
};


Narrative.prototype.find_person_by_id = function(id) {
  var i;
  for (i=0;i<this.g_people.length;i++) {
    if (this.g_people[i].id === id) {
      return this.g_people[i];
    }
  }
  return undefined;
};

Narrative.prototype.index_person_in_event = function(person, event) {
  var i;
  for (i=0; i<event.people.length; i++) {
    if (event.people[i].id === person.id) {
      return i;
    }
  }
  return -1;
};

Narrative.prototype.find_event_by_id = function(id) {
  var i;
  for (i=0;i<this.g_events.length;i++) {
    if (this.g_events[i].id === id) {
      return this.g_events[i];
    }
  }
  return undefined;
};

Narrative.prototype.tooltip = function(text, photo_url, link, x, y, color) {
  var popup, popup_width, popup_height, dummy_text_node, rect, popup_close, close_button = {};
  popup = this.g_svg.append('g');
  // this text node is only created to get its bounding box and will be discarded later
  dummy_text_node = popup
    .append('text')
    .attr('x',x)
    .attr('y',y)
    .attr('font-family','sans-serif')
    .attr('font-size',20)
    .text(text);
  popup_width = dummy_text_node[0][0].getBBox().width+20+40;
  popup_height = 150;
  rect = popup
    .append('rect')
    .attr('x',x-10)
    .attr('y',y-25)
    .attr('width', popup_width)
    .attr('height',popup_height);
  if (color) {
    rect.attr('fill', color);
  } else {
    rect.attr('class', 'event_popup');
  }
  popup
    .append('a')
    .attr('xlink:href',link)
    .append('text')
    .attr('x',x)
    .attr('y',y)
    .attr('font-family','sans-serif')
    .attr('font-size',20)
    .text(text);
  dummy_text_node.remove();
   close_button.centre = {x: x + popup_width - 30, y: y - 5 };
  close_button.radius = 12;
  close_button.cross_size = 5;
  popup_close = popup
    .append('g')
    .on('click', function() { popup.remove(); });
  popup_close
    .append('circle')
    .attr('cx', close_button.centre.x)
    .attr('cy', close_button.centre.y)
    .attr('r', close_button.radius)
    .attr('fill','#ddd')
    .attr('opacity','.5')
  ;
  popup_close
    .append('line')
    .attr('x1', close_button.centre.x - close_button.cross_size)
    .attr('y1', close_button.centre.y - close_button.cross_size)
    .attr('x2', close_button.centre.x + close_button.cross_size)
    .attr('y2', close_button.centre.y + close_button.cross_size)
    .attr('class', 'close-button-strokes');
  popup_close
    .append('line')
    .attr('x1', close_button.centre.x - close_button.cross_size)
    .attr('y1', close_button.centre.y + close_button.cross_size)
    .attr('x2', close_button.centre.x + close_button.cross_size)
    .attr('y2', close_button.centre.y - close_button.cross_size)
    .attr('class', 'close-button-strokes');
  popup_close
    .append('image')
    .attr('x',x).attr('y',y+10)
    .attr('height', popup_height - 43).attr('width', popup_width - 20)
    .attr('xlink:href', photo_url)
  ;
};

Narrative.prototype.event_popup = function(event_id, mouse) {
  var event;
  event = this.find_event_by_id(event_id);
  this.tooltip(event.title, event.photo, this.g_event_url_prefix+event_id, mouse[0], mouse[1]);
};

Narrative.prototype.person_popup = function(person_id, mouse) {
  var person, color;
  person = this.find_person_by_id(person_id);
  color = person.color;
  this.tooltip(person.name, person.photo, this.g_person_url_prefix+person_id, mouse[0], mouse[1], color);
};

Narrative.prototype.abbreviate = function(text,max_length) {
  if (text.length < max_length) {
    return text;
  } else {
    return text.substr(0,max_length-2)+'…';
  }
};

// returns y position of idx'th person in event
Narrative.prototype.event_person_z = function(event, idx) {
  return (event.cz - event.rz + this.g_people_spacing_in_event/2) + idx * this.g_people_spacing_in_event;
};

// perform various computations before drawing
Narrative.prototype.prepare_events_people = function() {
  var i;
  // time calculations (todo: use timescale)
  this.g_min_date=9999999999999; this.g_max_date=0;
  for (i = 0; i < this.g_events.length; i++) {
    this.g_events[i].dateInt = dateToInt(this.g_events[i].date);
    this.g_min_date = Math.min(this.g_min_date, this.g_events[i].dateInt);
    this.g_max_date = Math.max(this.g_max_date, this.g_events[i].dateInt);
  }

  for (i=0;i<this.g_people.length;i++) {
     // a person's default_pos is that person's default position
     // in the chart
     this.g_people[i].default_pos = this.g_size.z * (i+1) / (this.g_people.length+1);
     // todo: use d3.scale.ordinal
  }
};

Narrative.prototype.person_path = function(person) {
  var previous_event = null;
  var path = '';
  var person_events = this.g_events.filter(function(event) { return event.people.indexOf(person) !== -1; });
  var event;
  var i, idx, prevz, thisz, previdx, first_event_t, first_event_z;

  for (i=0; i<person_events.length; i++) {
    event = person_events[i];
    idx = this.index_person_in_event(person, event);
    if (idx !== -1) {
      if (previous_event) {
        // trace person's line from event to previous_event
        prevz = this.event_person_z(previous_event, previdx);
        thisz = this.event_person_z(event, idx);
        path += this.get_path(previous_event.ct, prevz, event.ct, thisz);
      } else {
        // the person's first event - write their name
        first_event_t = event.ct;
        first_event_z = this.event_person_z(event, idx);
        // if this is a single person's timeline, remember first event for initial zoom
//          person.name_pos = {
//            t: event.ct - 5,
//            z: event.cz - event.rz + (idx+1)*this.g_people_spacinthis.g_in_event
//          };
      }
      previous_event = event;
      previdx = idx;
    }
  }
  return path;
};


Narrative.prototype.calc_people_chart_data = function() {
  var person, event, person_events, i, j, idx, previdx, thisz, prevz, first_event_t, first_event_z;
  // Trace each person's timeline
  for (i=0; i<this.g_people.length; i++) {
    person = this.g_people[i];
    person.path = this.person_path(person);
    person.color = d3.rgb(this.g_color_scale(person.id)).darker(0.5);
    person_events = [];
    for (j=0; j<this.g_events.length; j++) {
      event = this.g_events[j];
      if (event.people.indexOf(person) !== -1) {
        person_events.push(event);
      }
    }
  }
}


Narrative.prototype.draw_people = function() {
  var i, j, person, person_group, radius,
    ct, cz, angle, group, person_events, event;
  this.g_svg.select('#people').remove();
  group = this.g_svg.append('g').attr('id', 'people');
  for (i=this.g_people.length-1; i>=0; i--) {
    person_group = group.append('g');
    person = this.g_people[i];
    if (person.path !== '') {
      person_group
        .attr('class', 'person')
        .append('path')
        .attr('d', person.path)
        .attr('class', 'person-path')
        .style('stroke', person.color)
        .attr('id', 'P'+person.id)
//          .on('click', function() {
//            person_popup(this.id.substr(1), d3.mouse(this));
//          })
      ;
      }

      radius = Math.sqrt(4*this.g_people_spacing_in_event);

      person_events = this.g_events.filter(function(event) { return event.people.indexOf(person) !== -1; });
      for (j=0; j<person_events.length; j++) {
        event = person_events[j];
        ct = event.ct;
        cz = this.event_person_z(event, this.index_person_in_event(person, event));
        person_group.append('circle')
          .attr('id', 'D'+person.id+'-'+event.id)
          .style('fill', person.color)
          .attr('cx', this.x(ct,cz))
          .attr('cy', this.y(ct,cz))
          .attr('r', radius)
        ;
      }

////          .on('click', function() {
////            person_popup(this.id.substr(1), d3.mouse(this));
////          })
//          ;
//      }
    }
    // separate loop because we want to see all text in front
//    for (i=0; i<this.g_people.length; i++) {
//      person = this.g_people[i];
//      if (this.g_vertical) {
//        angle = 0;
//        lx = person.name_pos.z-10;
//        ly = person.name_pos.t+20;
//      } else {
//        angle = -70;
//        lx = person.name_pos.t;
//        ly = person.name_pos.z;
//      }
//      group
//        .append('a')
//        .attr('xlink:href',this.g_person_url_prefix+person.id)
//        .append('text')
//        .attr('transform', 'translate('+lx+','+ly+') rotate(-45)')
//        .attr('text-anchor','end')
//        .attr('class', 'person-text')
//        .style('fill', person.color)
//        .text(person.name)
//      ;
//    }
  };

Narrative.prototype.calc_events_chart_data = function() {
  var event, i, j, sum_default_pos, event_date_range, person;

  event_date_range = this.g_max_date - this.g_min_date;

  for (i=0;i<this.g_events.length;i++) {
    event = this.g_events[i];
    event.ct = this.g_timescale(event.dateInt);
    event.rz = this.g_people_spacing_in_event*event.people.length/2;
    event.rt = this.g_people_spacing_in_event/2;
    // adjust event if needed
    // we compute an event's Z by averaging the default_pos of its participants
    sum_default_pos = 0;
    if (event.z) {
      event.cz = parseFloat(event.z);
    } else {
      for (j=0; j<event.people.length; j++) {
        person = event.people[j];
        sum_default_pos += person.default_pos;
      }
      event.cz = sum_default_pos / event.people.length;
    }
  }
}



Narrative.prototype.label_pos = function(event) {
  if (this.g_vertical) {
    return 'translate('+(event.cz+event.rz)+','+event.ct+')';
  } else {
    return 'translate('+event.ct+', '+(event.cz-event.rz)+') rotate(-70)';
  }
}

Narrative.prototype.draw_key = function(boxx, boxy, size) {
  var i, svg = d3.select('#timeline'), popup_key, visible=false;

  function toggle_info() {
    popup_key.style('display',visible?'none':'block');
    visible=!visible;
  }

  svg
    .append('g')
    .attr('id','info-button')
    .on('click',toggle_info)
    .append('image')
    .attr('x',10).attr('y',10)
    .attr('width',20).attr('height',20)
    .attr('xlink:href','/static/events/img/info.png')
  ;

  popup_key = svg
    .append('g')
    .attr('id', 'popup-key')
    .style('display','none')
  ;
  popup_key.append('rect')
    .attr('x',boxx).attr('y',boxy)
    .attr('width',200*size).attr('height',size*(14*(1+this.g_people.length)-5))
    .attr('fill','black')
    .attr('opacity',0.2)
  ;
  for (i=0; i< this.g_people.length; i++) {
    popup_key
      .append('a')
      .attr('xlink:href',this.g_person_url_prefix+this.g_people[i].id)
      .append('rect')
      .attr('x',boxx+5).attr('y',boxy+7+14*i*size)
      .attr('width',20*size).attr('height',12*size)
      .attr('fill',this.g_people[i].color)
    ;
    popup_key
      .append('a')
      .attr('xlink:href',this.g_person_url_prefix+this.g_people[i].id)
      .append('image')
      .attr('x',boxx+20*size+10).attr('y',boxy+7+14*i*size)
      .attr('width',20*size).attr('height',12*size)
      .attr('xlink:href',this.g_people[i].photo)
    ;
    popup_key
      .append('a')
      .attr('xlink:href',this.g_person_url_prefix+this.g_people[i].id)
      .append('text')
      .attr('x',boxx+40*size+10).attr('y',boxy+7+14*i*size+14*size/1.4)
      .attr('font-family','sans-serif')
      .attr('font-size',14*size)
      .text(this.g_people[i].name)
    ;
  }
};

Narrative.prototype.pan_to = function(x,y) {
  if (this.g_vertical) {
    this.g_svg.attr('transform', ' translate(' + (-x+this.g_margin.start_z) + ',' + (-y+this.g_margin.start_t) + ')');
  } else {
    this.g_svg.attr('transform', ' translate(' + (-x+this.g_margin.start_t) + ',' + (-y+this.g_margin.start_z) + ')');
  }
}


Narrative.prototype.draw_axes = function() {
  var i, startYear, endYear, time_axis, year_t, group;
  time_axis = d3.svg.axis()
    .scale(this.g_timescale)
    .orient(this.g_vertical?'right':'bottom')
    .tickFormat(d3.time.format(''))
    .ticks(d3.time.year, 20)
  ;
  startYear = this.g_startDate.getFullYear();
  endYear = this.g_endDate.getFullYear() + 1;

  group = this.g_svg.append('g')
    .attr('class', 'axis')
    .call(time_axis);
  for (i=startYear-startYear%5; i<=endYear; i+=20) {
    year_t = this.g_timescale(new Date(i,6));
    group
      .append('g')
      .attr('class','label-year')
      .append('text')
      .attr('x', this.x(year_t, 25))
      .attr('y', this.y(year_t, 25))
      .text(i);
  }
};

Narrative.prototype.draw_everything = function() {
  this.draw_axes();
  this.draw_people();
  this.draw_events();
//    draw_key(30,30,1.3);
};












Narrative.prototype.draw_chart = function(person_id) {
  var that = this;
  d3.json('/events/api/event/', function(e) {
    var i;
    for (i=0; i<e.length; i++) {
      e[i].date = new Date(
        e[i].year,
        e[i].month ? e[i].month-1 : 6,
        e[i].day || 1
      );
    }

    d3.json('/events/api/person/', function(p) {
      var j, timeSpan, canvas_width, canvas_height;

      // sort events by data
      that.g_events = e.sort(function(e1,e2) {
        return new Date(e1.date) - new Date(e2.date);
      });

      // remove events with no participants
      that.g_events = that.g_events.filter(function(e) {
        return e.people.length > 0;
      });

      // remove people with no events
      that.g_people = p.filter(function(person) {
        return person.event_set.length>0;
      });

      // sort people by number of events (so the most important people are
      // visible from the start
      that.g_people.sort(function(a,b) {
        return b.event_set.length - a.event_set.length;
      });

      // populate the event objects with people
      for (i=0; i<that.g_events.length; i++) {
        for (j=0; j<that.g_events[i].people.length; j++) {
          that.g_events[i].people[j] = that.find_person_by_id(that.g_events[i].people[j].id);
        }
        that.g_events[i].people.sort(function(a,b) {
          return b.event_set.length - a.event_set.length;
        });
      }

      // create svg for the chart

      if (that.g_vertical) {
        that.g_width = 500;
        that.g_height = 6000;
        that.g_size.t = that.g_height;
        that.g_size.z = that.g_width;
        canvas_width = that.g_size.z + 2*that.g_margin.start_z;
        canvas_height = that.g_size.t + 2*that.g_margin.start_t;
      } else {
        that.g_width = 6000;
        that.g_height = 500;
        that.g_size.t = that.g_width;
        that.g_size.z = that.g_height;
        canvas_width = that.g_size.t + 2*that.g_margin.start_t;
        canvas_height = that.g_size.z + 2*that.g_margin.start_z;
      }

      that.g_svg = d3
        .select('#'+that.g_anchor)
        .append('svg')
        .attr('xmlns:xmlns:xlink','http://www.w3.org/1999/xlink')
        .attr('height', canvas_height)
        .attr('width', canvas_width)
        .attr('id', 'timeline')
        .append('g')
      ;

      if (that.g_vertical) {
        that.pan_to(0,-20);
      } else {
        that.pan_to(-20,0);
      }

      // time scale
      that.g_startDate = that.g_events[0].date;
      that.g_endDate = that.g_events[that.g_events.length-1].date;
      timeSpan = that.g_endDate-that.g_startDate; // milliseconds
      that.g_timescale = d3.time.scale()
        .domain([that.g_startDate, that.g_endDate])
        .rangeRound([0, that.g_size.t])
        .nice(d3.time.year) // should depend on domain width
      ;
      // background colour
      that.g_svg
        .append('rect')
        .attr('fill','#ddd')
        .attr('x',-100000)
        .attr('y',-100000)
        .attr('width',200000)
        .attr('height',200000);


      that.prepare_events_people();
      that.calc_events_chart_data();
      that.calc_people_chart_data();

      that.draw_everything();
    });
  });
};


Narrative.prototype.draw_events = function() {
  var that=this;
  var gEnter = this.g_svg
    .append('g').attr('id', 'events').selectAll('g.event')
    .data(this.g_events).enter()
    .append('g');
    gEnter
      .attr('class', 'event')
      .append('ellipse')
      .attr('cx', function(event) { return that.x(event.ct, event.cz); })
      .attr('cy', function(event) { return that.y(event.ct, event.cz); })
      .attr('rx', function(event) { return that.x(event.rt, event.rz); })
      .attr('ry', function(event) { return that.y(event.rt, event.rz); })
      .attr('id', function(event) { return 'E'+event.id; })
      .attr('class', 'event-shape');
    ;
    gEnter
      .append('a')
      .attr('xlink:href', function(event) { return this.g_event_url_prefix+event.id; })
      .append('text')
      .attr('transform', this.label_pos)
      .attr('text-anchor', 'start')
      .attr('class', 'event-text')
      .text( function(event) { return that.abbreviate(event.title,20); })
    ;
};
