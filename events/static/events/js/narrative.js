var d3, Narrative;

// layout: 'horizontal' or 'vertical'
Narrative = function(anchor, layout) {
  'use strict';

// Notes:
// Every object's 2d position is along two axes: t (the timeline) and z (where objects are places)
// Only when we draw the shapes do we finally convert to x and y, according to whether the type is
// horizontal or vertuical


  var
    g_vertical = layout === 'vertical',
    g_person_url_prefix = '/events/person/',
    g_event_url_prefix = '/events/event/',
    g_svg,
    g_events, g_people,
    g_width,
    g_height,
    g_margin = { start_t: 100, start_z: 20 },
    g_curvature = 0.3,
    g_color_scale = d3.scale.category20(),
    g_people_spacing_in_event = 17,
    g_main_person, g_main_person_first_event_pos,
    g_min_date, g_max_date;


  if (g_vertical) {
     g_width = 500;
     g_height = 2000;
  } else {
     g_width = 2000;
     g_height = 500;
  }


  function x(t,z) {
    return g_vertical ? z : t;
  }

  function y(t,z) {
    return g_vertical ? t : z;
  }

  // The API returns dates as 2014-05-15T00:00:00Z. We need to map that
  // to time axis interval [min(date), max(date)]
  function dateToInt(date_string) {
    return new Date(date_string).getTime();
  }

  function to_grey(color) {
    var grey;
    color = color.brighter(0.5);
    grey = (color.r+color.g+color.b)/3;
    return d3.rgb(grey, grey, grey);
  }

  function get_path(t0, z0, t1, z1) {
    var itrp = d3.interpolateNumber(t0, t1),
        t2 = itrp(g_curvature),
        t3 = itrp(1 - g_curvature);
    return ' M' + x(t0, z0) + ',' + y(t0, z0) +
           ' C' + x(t2, z0) + ',' + y(t2, z0) +
           '  ' + x(t3, z1) + ',' + y(t3, z1) +
           '  ' + x(t1, z1) + ',' + y(t1, z1);
  }

  function index_person_in_event(person, event) {
    var i;
    for (i=0; i<event.people.length; i++) {
      if (event.people[i].id === person.id) {
        return i;
      }
    }
    return -1;
  }

  function find_person_by_id(id) {
    var i;
    for (i=0;i<g_people.length;i++) {
      if (g_people[i].id === id) {
        return g_people[i];
      }
    }
    return undefined;
  }

  function find_event_by_id(id) {
    var i;
    for (i=0;i<g_events.length;i++) {
      if (g_events[i].id === id) {
        return g_events[i];
      }
    }
    return undefined;
  }

  function tooltip(text, photo_url, link, x, y, color) {
    var popup, popup_width, popup_height, dummy_text_node, rect, popup_close, close_button = {};
    popup = g_svg.append('g');
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
  }

  function event_popup(event_id, mouse) {
    var event;
    event = find_event_by_id(event_id);
    tooltip(event.title, event.photo, g_event_url_prefix+event_id, mouse[0], mouse[1]);
  }

  function person_popup(person_id, mouse) {
    var person, color;
    person = find_person_by_id(person_id);
    if (g_main_person && person!==g_main_person) {
      color = to_grey(person.color);
    } else {
      color = person.color;
    }
    tooltip(person.name, person.photo, g_person_url_prefix+person_id, mouse[0], mouse[1], color);
  }

  function abbreviate(text,max_length) {
    if (text.length < max_length) {
      return text;
    } else {
      return text.substr(0,max_length-2)+'…';
    }
  }

  // returns y position of idx'th person in event
  function event_person_z(event, idx) {
    return (event.cz - event.rz + g_people_spacing_in_event/2) + idx * g_people_spacing_in_event;
  }

  // return index of person in event
  function index_of_person_in_event(event, person) {
    var i;
    for (i=0; i<event.people.length; i++) {
      if (event.people[i] === person) {
        return i;
      }
    }
    return -1;
  }

  function calc_people_chart_data() {
    var person, event, previous_event, i, j, idx, previdx, thisz, prevz, first_event_t, first_event_z;
    // Trace each person's timeline
    for (i=0; i<g_people.length; i++) {
      person = g_people[i];
      person.discs = [];
      previous_event = null;
      person.path = '';
      for (j=0; j<g_events.length; j++) {
        event = g_events[j];
        idx = index_person_in_event(person, event);
        if (idx !== -1) {
          if (previous_event) {
            // trace person's line from event to previous_event
            prevz = event_person_z(previous_event, previdx);
            thisz = event_person_z(event, idx);
            person.path += get_path(previous_event.ct, prevz, event.ct, thisz);
            person.discs.push({t:event.ct, z:thisz});
          } else {
            // the person's first event - write their name
            first_event_t = event.ct;
            first_event_z = event_person_z(event, idx);
            // if this is a single person's timeline, remember first event for initial zoom
            if (person === g_main_person) {
              g_main_person_first_event_pos = {t:first_event_t, z:first_event_z};
            }
            person.discs.push({t:first_event_t, z:first_event_z});
            person.name_pos = {
              t: event.ct - 5,
              z: event.cz - event.rz + (idx+1)*g_people_spacing_in_event
            };
          }
          previous_event = event;
          previdx = idx;
        }
      }
      person.color = d3.rgb(g_color_scale(person.id)).darker(0.5);
    }
  }

  function draw_people() {
    var i, j, person, style, color, radius, namepos_x, namepos_y;
    for (i=g_people.length-1; i>=0; i--) {
      person = g_people[i];
      if (person.path !== '') {
        if (g_main_person && person!==g_main_person) {
          style = 'not-main-person-path';
          color = to_grey(person.color);
        } else {
          style = 'person-path';
          color = person.color;
        }
        g_svg
          .append('path')
          .attr('d', person.path)
          .attr('class', style)
          .style('stroke', color)
          .attr('id', 'P'+person.id)
          .on('click', function() {
            person_popup(this.id.substr(1), d3.mouse(this));
          });
        }
      for (j=0;j<g_people[i].discs.length;j++) {
        radius = Math.sqrt(4*g_people_spacing_in_event);
        if (g_main_person && person!==g_main_person) {
          radius/=3;
          color = to_grey(person.color);
        } else {
          color = person.color;
        }

        var ct = person.discs[j].t, cz = person.discs[j].z;

        g_svg
          .append('circle')
          .style('fill', color)
          .attr('cx', x(ct,cz))
          .attr('cy', y(ct,cz))
          .attr('r', radius)
          .on('click', function() {
            person_popup(this.id.substr(1), d3.mouse(this));
          });
      }
    }
    // separate loop because we want to see all text in front
    for (i=0; i<g_people.length; i++) {
      person = g_people[i];
      if (g_main_person && person!==g_main_person) {
        continue;
      }
      namepos_x = x(person.name_pos.t, person.name_pos.z);
      namepos_y = y(person.name_pos.t, person.name_pos.z);
      g_svg
        .append('a')
        .attr('xlink:href',g_person_url_prefix+person.id)
        .append('text')
        .attr('transform', 'translate('+(namepos_x-5)+','+
              (namepos_y-5)+') rotate(-45)')
        .attr('text-anchor','end')
        .attr('class', 'person-text')
        .style('fill', person.color)
        .text(person.name)
      ;
    }
  }

  function calc_events_chart_data() {
    var event, i, j, sum_default_pos, event_date_range, person, main_person_index_in_event;

    event_date_range = g_max_date - g_min_date;

    for (i=0;i<g_events.length;i++) {
      event = g_events[i];
      event.ct = (event.dateInt - g_min_date) * g_width / event_date_range;
      event.rz = g_people_spacing_in_event*event.people.length/2;
      event.rt = g_people_spacing_in_event/2;
      // adjust event if needed
      if (g_main_person && (main_person_index_in_event = index_of_person_in_event(event, g_main_person)) !== -1) {
        event.cz = g_main_person.default_pos - g_people_spacing_in_event * (main_person_index_in_event-(event.people.length-1)/2);
      } else {
        // we compute an event's Z by averaging the default_pos of its participants
        sum_default_pos = 0;

        for (j=0; j<event.people.length; j++) {
          person = event.people[j];
          sum_default_pos += person.default_pos;
        }
        event.cz = sum_default_pos / event.people.length;
      }
    }
  }

  function draw_events() {
    var i, event;
    for (i=0;i<g_events.length;i++) {
      event = g_events[i];
      console.log(event.ct, event.cz);
      g_svg
        .append('ellipse')
        .attr('cx', x(event.ct, event.cz))
        .attr('cy', y(event.ct, event.cz))
        .attr('rx', x(event.rt, event.rz))
        .attr('ry', y(event.rt, event.rz))
        .attr('class', 'event')
        .attr('id','E'+event.id)
        .on('click', function() { event_popup(this.id.substr(1), d3.mouse(this)); });
    }
  }

  function draw_event_labels() {
    var event, i, ex, ey;
    for (i=0;i<g_events.length;i++) {
      event = g_events[i];
      if (!g_main_person || index_person_in_event(g_main_person,event)!==-1) {
        ex = x(event.ct, event.cz),
        ey = y(event.ct, event.cz),
        g_svg
          .append('a')
          .attr('xlink:href',g_event_url_prefix+event.id)
          .append('text')
          .attr('transform', 'translate('+(ex+10)+','+(ey-10)+') rotate(-70)')
          .attr('text-anchor', 'start')
          .attr('class', 'event-text')
          .text(abbreviate(event.title,20));
      }
    }
  }

  function draw_key(boxx, boxy, size) {
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
      .attr('width',200*size).attr('height',size*(14*(1+g_people.length)-5))
      .attr('fill','black')
      .attr('opacity',0.2)
    ;
    for (i=0; i< g_people.length; i++) {
      popup_key
        .append('a')
        .attr('xlink:href',g_person_url_prefix+g_people[i].id)
        .append('rect')
        .attr('x',boxx+5).attr('y',boxy+7+14*i*size)
        .attr('width',20*size).attr('height',12*size)
        .attr('fill',g_people[i].color)
      ;
      popup_key
        .append('a')
        .attr('xlink:href',g_person_url_prefix+g_people[i].id)
        .append('image')
        .attr('x',boxx+20*size+10).attr('y',boxy+7+14*i*size)
        .attr('width',20*size).attr('height',12*size)
        .attr('xlink:href',g_people[i].photo)
      ;
      popup_key
        .append('a')
        .attr('xlink:href',g_person_url_prefix+g_people[i].id)
        .append('text')
        .attr('x',boxx+40*size+10).attr('y',boxy+7+14*i*size+14*size/1.4)
        .attr('font-family','sans-serif')
        .attr('font-size',14*size)
        .text(g_people[i].name)
      ;
    }
  }

  function pan_to(x,y) {
    if (g_vertical) {
      g_svg.attr('transform', ' translate(' + (-x+g_margin.start_z) + ',' + (-y+g_margin.start_t) + ')');
    } else {
      g_svg.attr('transform', ' translate(' + (-x+g_margin.start_t) + ',' + (-y+g_margin.start_z) + ')');
    }
  }

  function draw_everything() {
    draw_people();
    draw_events();
    draw_event_labels();
    if (!g_main_person) {
      draw_key(30,30,1.3);
    }
    if (g_main_person) {
      pan_to(g_main_person_first_event_pos.x - 100,
              g_main_person_first_event_pos.y - g_height/3);
    }
  }


//######## Public functions ####################################################

  this.draw_chart = function(person_id) {
    d3.json('/events/api/event/', function(e) {
      d3.json('/events/api/person/', function(p) {
        var i, j, timescale, time_axis, startDate, endDate, timeSpan, tickFormat;

        // sort events by data
        g_events = e.sort(function(e1,e2) {
          return new Date(e1.date) - new Date(e2.date);
        });

        // remove events with no participants
        g_events = g_events.filter(function(e) {
          return e.people.length > 0;
        });

        // remove people with no events
        g_people = p.filter(function(person) {
          return person.event_set.length>0;
        });

        // sort people by number of events (so the most important people are
        // visible from the start
        g_people.sort(function(a,b) {
          return b.event_set.length - a.event_set.length;
        });

        g_main_person = find_person_by_id(person_id);

        // populate the event objects with people
        for (i=0; i<g_events.length; i++) {
          for (j=0; j<g_events[i].people.length; j++) {
            g_events[i].people[j] = find_person_by_id(g_events[i].people[j].id);
          }
          g_events[i].people.sort(function(a,b) {
            return b.event_set.length - a.event_set.length;
          });
        }

        // create svg for the chart
        g_svg = d3
          .select('#'+anchor)
          .append('svg')
          .attr('xmlns:xmlns:xlink','http://www.w3.org/1999/xlink')
          .attr('width', g_width)
          .attr('height', g_height)
          .attr('id', 'timeline')
          .append('g')
        ;

        if (g_vertical) {
          pan_to(0,-20);
        } else {
          pan_to(-20,0);
        }

        // draw time axis
        startDate = new Date(g_events[0].date);
        endDate = new Date(g_events[g_events.length-1].date);
        timeSpan = endDate-startDate; // milliseconds
        timescale = d3.time.scale()
          .domain([startDate, endDate])
          .range(g_vertical?[0,g_height]:[0,g_width])
        // .nice(d3.time.year) // should depend on domain width
        ;
        if (timeSpan < 86400000) {
          // less than a day
          tickFormat = '%H:%M';
        } else {
          if (timeSpan < 31536000000) {
            // less than a year
            tickFormat = '%d %B';
          } else {
            // multiple years
            tickFormat = '%Y';
          }
        }
        time_axis = d3.svg.axis()
          .scale(timescale)
          .orient(g_vertical?'right':'bottom')
          .tickFormat(d3.time.format(tickFormat))
          // should depend on domain width
        ;

        // background colour
        g_svg
          .append('rect')
          .attr('fill','#ddd')
          .attr('x',-100000)
          .attr('y',-100000)
          .attr('width',200000)
          .attr('height',200000);

        // draw time axis
        g_svg.append('g')
          .attr('class', 'axis')
          .call(time_axis);

        // time calculations (todo: use timescale)
        g_min_date=9999999999999; g_max_date=0;
        for (i = 0; i < g_events.length; i++) {
          g_events[i].dateInt = dateToInt(g_events[i].date);
          g_min_date = Math.min(g_min_date, g_events[i].dateInt);
          g_max_date = Math.max(g_max_date, g_events[i].dateInt);
        }

        for (j=0;j<g_people.length;j++) {
          // a person's default_pos is that person's default position
          // in the chart
          g_people[j].default_pos = (g_vertical?g_width:g_height) * (j+1) /
            (g_people.length+1);
          // todo: use d3.scale.ordinal
        }

        calc_events_chart_data();
        calc_people_chart_data();

        draw_everything();
      });
    });
  };
};
