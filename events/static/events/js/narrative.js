var d3, Narrative;

// layout: 'horizontal' or 'vertical'
Narrative = function(anchor, layout) {
  'use strict';

// Notes:
// Every object's 2d position is along two axes: t (the timeline) and z (where objects are places)
// Only when we draw the shapes do we finally convert to x and y, according to whether the type is
// horizontal or vertuical

  var g_width, g_height, g_size={};

  var
    g_vertical = layout === 'vertical',
    g_person_url_prefix = '/events/person/',
    g_event_url_prefix = '/events/event/',
    g_svg,
    g_events, g_people,
    g_margin = { start_t: 50, start_z: 20 },
    g_curvature = 0.3,
    g_color_scale = d3.scale.category20(),
    g_people_spacing_in_event = 17,
    g_min_date, g_max_date,
    g_timescale, g_zscale,
    g_startDate, g_endDate,
    g_drag;


    g_drag = d3.behavior.drag()
      .on("drag", function(event) {
        var i, person, ct, cz;
        event.cz = z(d3.event.x, d3.event.y);
        d3.select(this)
          .attr('cy', d3.event.y)
        ;
        // recalculate the path of the people who are in that event
        for (i=0; i<event.people.length; i++) {
          person = event.people[i];
          d3.select('#P'+person.id).attr('d', person_path(person));
          // relocate the perosn's disc with id disc-[person.id]-[event.id]
          ct = event.ct;
          cz = event_person_z(event, index_person_in_event(person, event));
          d3.select('#D'+person.id+'-'+event.id)
            .attr('cx', x(ct,cz))
            .attr('cy', y(ct,cz))
          ;
        }
      })
      ;

  function x(t,z) { return g_vertical ? z : t; }
  function y(t,z) { return g_vertical ? t : z; }
  function z(x,y) { return g_vertical ? x : y; }
  function t(x,y) { return g_vertical ? y : x; }

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
    color = person.color;
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

  // perform various computations before drawing
  function prepare_events_people() {
    var i;
    // time calculations (todo: use timescale)
    g_min_date=9999999999999; g_max_date=0;
    for (i = 0; i < g_events.length; i++) {
      g_events[i].dateInt = dateToInt(g_events[i].date);
      g_min_date = Math.min(g_min_date, g_events[i].dateInt);
      g_max_date = Math.max(g_max_date, g_events[i].dateInt);
    }

    for (i=0;i<g_people.length;i++) {
       // a person's default_pos is that person's default position
       // in the chart
       g_people[i].default_pos = g_size.z * (i+1) / (g_people.length+1);
       // todo: use d3.scale.ordinal
    }
  }

  function person_path(person) {
    var previous_event = null;
    var path = '';
    var person_events = g_events.filter(function(event) { return event.people.indexOf(person) !== -1; });
    var event;
    var i, idx, prevz, thisz, previdx, first_event_t, first_event_z;

    for (i=0; i<person_events.length; i++) {
      event = person_events[i];
      idx = index_person_in_event(person, event);
      if (idx !== -1) {
        if (previous_event) {
          // trace person's line from event to previous_event
          prevz = event_person_z(previous_event, previdx);
          thisz = event_person_z(event, idx);
          path += get_path(previous_event.ct, prevz, event.ct, thisz);
        } else {
          // the person's first event - write their name
          first_event_t = event.ct;
          first_event_z = event_person_z(event, idx);
          // if this is a single person's timeline, remember first event for initial zoom
//          person.name_pos = {
//            t: event.ct - 5,
//            z: event.cz - event.rz + (idx+1)*g_people_spacing_in_event
//          };
        }
        previous_event = event;
        previdx = idx;
      }
    }
    return path;
  }


  function calc_people_chart_data() {
    var person, event, person_events, i, j, idx, previdx, thisz, prevz, first_event_t, first_event_z;
    // Trace each person's timeline
    for (i=0; i<g_people.length; i++) {
      person = g_people[i];
      person.path = person_path(person);
      person.color = d3.rgb(g_color_scale(person.id)).darker(0.5);
      person_events = [];
      for (j=0; j<g_events.length; j++) {
        event = g_events[j];
        if (event.people.indexOf(person) !== -1) {
          person_events.push(event);
        }
      }
    }
  }


  function draw_people() {
    var i, j, person, person_group, radius,
      ct, cz, angle, group, person_events, event;
    g_svg.select('#people').remove();
    group = g_svg.append('g').attr('id', 'people');
    for (i=g_people.length-1; i>=0; i--) {
      person_group = group.append('g');
      person = g_people[i];
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

      radius = Math.sqrt(4*g_people_spacing_in_event);

      person_events = g_events.filter(function(event) { return event.people.indexOf(person) !== -1; });
      for (j=0; j<person_events.length; j++) {
        event = person_events[j];
        ct = event.ct;
        cz = event_person_z(event, index_person_in_event(person, event));
        person_group.append('circle')
          .attr('id', 'D'+person.id+'-'+event.id)
          .style('fill', person.color)
          .attr('cx', x(ct,cz))
          .attr('cy', y(ct,cz))
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
//    for (i=0; i<g_people.length; i++) {
//      person = g_people[i];
//      if (g_vertical) {
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
//        .attr('xlink:href',g_person_url_prefix+person.id)
//        .append('text')
//        .attr('transform', 'translate('+lx+','+ly+') rotate(-45)')
//        .attr('text-anchor','end')
//        .attr('class', 'person-text')
//        .style('fill', person.color)
//        .text(person.name)
//      ;
//    }
  }

  function calc_events_chart_data() {
    var event, i, j, sum_default_pos, event_date_range, person;

    event_date_range = g_max_date - g_min_date;

    for (i=0;i<g_events.length;i++) {
      event = g_events[i];
      event.ct = g_timescale(event.dateInt);
      event.rz = g_people_spacing_in_event*event.people.length/2;
      event.rt = g_people_spacing_in_event/2;
      // adjust event if needed
      // we compute an event's Z by averaging the default_pos of its participants
      sum_default_pos = 0;

      for (j=0; j<event.people.length; j++) {
        person = event.people[j];
        sum_default_pos += person.default_pos;
      }
      event.cz = sum_default_pos / event.people.length;
    }
  }


  function draw_events() {
    g_svg
      .append('g').attr('id', 'events').selectAll('g.event')
        .data(g_events).enter()
        .append('g').attr('class', 'event')
        .append('ellipse')
        .attr('cx', function(event) { return x(event.ct, event.cz); })
        .attr('cy', function(event) { return y(event.ct, event.cz); })
        .attr('rx', function(event) { return x(event.rt, event.rz); })
        .attr('ry', function(event) { return y(event.rt, event.rz); })
        .attr('id', function(event) { return 'E'+event.id; })
        .attr('class', 'event')
        .call(g_drag)
    ;
  }


  function draw_event_labels() {
    var event, i, ex, ey, angle;
    for (i=0;i<g_events.length;i++) {
      event = g_events[i];
      if (g_vertical) {
        angle = 0;
        ex = event.cz+event.rz;
        ey = event.ct;
      } else {
        angle = -70;
        ex = event.ct;
        ey = event.cz-event.rz;
      }
      g_svg
        .append('a')
        .attr('xlink:href',g_event_url_prefix+event.id)
        .append('text')
        .attr('transform', 'translate('+ex+','+ey+') rotate('+angle+')')
        .attr('text-anchor', 'start')
        .attr('class', 'event-text')
        .text(abbreviate(event.title,20));
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


  function draw_axes() {
    var i, startYear, endYear, time_axis, year_t, group;
    time_axis = d3.svg.axis()
      .scale(g_timescale)
      .orient(g_vertical?'right':'bottom')
      .tickFormat(d3.time.format(''))
      .ticks(d3.time.year, 1)
    ;
    startYear = g_startDate.getFullYear();
    endYear = g_endDate.getFullYear() + 1;

    var group = g_svg.append('g')
      .attr('class', 'axis')
      .call(time_axis);
    for (i=startYear-startYear%5; i<=endYear; i+=5) {
      year_t = g_timescale(new Date(i,6));
      group
        .append('g')
        .attr('class','label-year')
        .append('text')
        .attr('x', x(year_t, 25))
        .attr('y', y(year_t, 25))
        .text(i);
    }
  }

  function draw_everything() {
    draw_axes();
    draw_people();
    draw_events();
//    draw_event_labels();
//    draw_key(30,30,1.3);
  }


//######## Public functions ####################################################

  this.draw_chart = function(person_id) {
    d3.json('/events/api/event/', function(e) {
      d3.json('/events/api/person/', function(p) {
        var i, j, timeSpan, canvas_width, canvas_height;

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

        if (g_vertical) {
          g_width = 500;
          g_height = 3000;
          g_size.t = g_height;
          g_size.z = g_width;
          canvas_width = g_size.z + 2*g_margin.start_z;
          canvas_height = g_size.t + 2*g_margin.start_t;
        } else {
          g_width = 3000;
          g_height = 500;
          g_size.t = g_width;
          g_size.z = g_height;
          canvas_width = g_size.t + 2*g_margin.start_t;
          canvas_height = g_size.z + 2*g_margin.start_z;
        }

        g_svg = d3
          .select('#'+anchor)
          .append('svg')
          .attr('xmlns:xmlns:xlink','http://www.w3.org/1999/xlink')
          .attr('height', canvas_height)
          .attr('width', canvas_width)
          .attr('id', 'timeline')
          .append('g')
        ;

        if (g_vertical) {
          pan_to(0,-20);
        } else {
          pan_to(-20,0);
        }

        // time scale
        g_startDate = new Date(g_events[0].date);
        g_endDate = new Date(g_events[g_events.length-1].date);
        timeSpan = g_endDate-g_startDate; // milliseconds
        g_timescale = d3.time.scale()
          .domain([g_startDate, g_endDate])
          .rangeRound([0, g_size.t])
          .nice(d3.time.year) // should depend on domain width
        ;
        // background colour
        g_svg
          .append('rect')
          .attr('fill','#ddd')
          .attr('x',-100000)
          .attr('y',-100000)
          .attr('width',200000)
          .attr('height',200000);


        prepare_events_people();
        calc_events_chart_data();
        calc_people_chart_data();

        draw_everything();
      });
    });
  };
};
