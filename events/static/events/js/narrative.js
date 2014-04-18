var d3;

var Narrative = function() {
  "use strict";

  var
    svg,
    events, people,
    chart_width = 800,
    chart_height = 2000,
    margin = 50,
    curvature = 0.3,
    color = d3.scale.category20(),
    people_spacing_in_event = 20,
    min_date, max_date;

  // The API returns dates as 2013-03-21. We need to map that to time axis interval [min(date), max(date)]
  function dateToInt(date_string) {
    var date = date_string.split('-',3);
    return new Date(date[0],date[1],date[2]).getTime();
  }

  function get_path(x0,y0,x1,y1) {
    var yi = d3.interpolateNumber(y0, y1),
        y2 = yi(curvature),
        y3 = yi(1 - curvature);
    return "M" + x0 + "," + y0 +
           "C" + x0 + "," + y2 +
           " " + x1 + "," + y3 +
           " " + x1 + "," + y1;
  }

  function index_person_in_event(person, event) {
    var i;
    for (i=0; i<event.people.length; i++) {
      if (event.people[i].id == person.id) {
        return i;
      }
    }
    return -1;
  }

  function find_person_by_id(id) {
    var i;
    for (i=0;i<people.length;i++) {
      if (people[i].id == id) {
        return people[i];
      }
    }
    return undefined;
  }

  function find_event_by_id(id) {
    var i;
    for (i=0;i<events.length;i++) {
      if (events[i].id == id) {
        return events[i];
      }
    }
    return undefined;
  }


  function popup_text(text, link, x, y, color) {
    var popup, dummy_text_node, rect;
    popup = svg
      .append("g")
      .on("mouseout", function() { this.remove(); });
    // this text node is only created to get its bounding box and will be discarded later
    dummy_text_node = popup
      .append("text")
      .attr("x",x)
      .attr("y",y)
      .attr("font-family","sans-serif")
      .attr("font-size",20)
      .text(text);
    rect = popup
      .append("rect")
      .attr("x",x-10)
      .attr("y",y-25)
      .attr("width",dummy_text_node[0][0].getBBox().width+20)
      .attr("height",40)
      .attr("fill", color ? color : "#fc3");
    popup
      .append("a")
      .attr("xlink:href",link)
      .append("text")
      .attr("x",x)
      .attr("y",y)
      .attr("font-family","sans-serif")
      .attr("font-size",20)
      .text(text);
    dummy_text_node.remove();
  }

  function event_popup(event_id, mouse) {
    var event;
    event = find_event_by_id(event_id);
    popup_text(event.title, "event/"+event_id, mouse[0], mouse[1]);
  }

  function person_popup(person_id, mouse) {
    var person;
    person = find_person_by_id(person_id);
    popup_text(person.name, "person/"+person_id, mouse[0], mouse[1], person.color);
  }

  function abbreviate(text,max_length) {
    if (text.length < max_length) {
      return text;
    } else {
      return text.substr(0,max_length-2)+"…";
    }
  }

  function calc_people_chart_data() {
    var person, event, previous_event, i, j, idx, previdx, thisx, prevx;
    // Trace each person's timeline
    for (i=0; i<people.length; i++) {
      person = people[i];          
      previous_event = null;
      person.path = "";
      for (j=0; j<events.length; j++) {
        event = events[j];
        idx = index_person_in_event(person, event);
        if (idx !== -1) {
          if (previous_event) {
            // trace person's line from event to previous_event
            prevx = previous_event.cx - previous_event.rx/2 + previdx*people_spacing_in_event;
            thisx = event.cx - event.rx/2 + idx*people_spacing_in_event;
            person.path += get_path(prevx, previous_event.cy, thisx, event.cy);
          } else {
            // the person's first event - write their name
            person.name_pos = {
              x: event.cx - event.rx/2 + idx*people_spacing_in_event, 
              y: event.cy
            };
          }
          previous_event = event;
          previdx = idx;
        }
      }
      person.color = d3.rgb(color(person.id)).darker(0.5).toString();
    }
  }

  function draw_people() {
    var i, person;
    for (i=0; i<people.length; i++) {
      person = people[i];
      svg
        .append("path")
        .attr("d", person.path)
        .attr("class", "person-path")
        .attr("id", "P"+person.id)
        .style("stroke", person.color)
        .on("mouseover", function() { person_popup(this.id.substr(1), d3.mouse(this)); });
    }
    // separate loop because we want to see all text in front
    for (i=0; i<people.length; i++) {
      person = people[i];
      svg
        .append("a")
        .attr("xlink:href","person/"+person.id)
        .append("text")
        .attr("transform", "translate("+person.name_pos.x+","+person.name_pos.y+") rotate(-45)")
        .attr("text-anchor","start")
        .attr("class", "person-text")
        .style("fill", person.color)
        .text(person.name);
    }
  }


  function calc_events_chart_data() {
    var event, i, j, sum_default_x, event_date_range;

    event_date_range = max_date - min_date;

    function person_id_cmp(p1,p2) { return p1.id > p2.id; }
    for (i=0;i<events.length;i++) {
      event = events[i];
      event.people.sort(person_id_cmp);

      // we compute an event's X by averaging the default_x of its participants
      sum_default_x = 0;
      for (j=0; j<event.people.length; j++) {
        sum_default_x += find_person_by_id(event.people[j].id).default_x;
      }

      event.cx = sum_default_x / event.people.length;
      event.cy = (event.dateInt - min_date) * chart_height / event_date_range;
      event.rx = 10*(event.people.length + 1);
      event.ry = 10;
    }
  }

  function draw_events() {
    var i, event;
    for (i=0;i<events.length;i++) {
      event = events[i];
      svg
        .append("ellipse")
        .attr("cx", event.cx)
        .attr("cy", event.cy)
        .attr("rx", event.rx)
        .attr("ry", event.ry)
        .attr("class", "event")
        .attr("id","E"+event.id)
        .on("mouseover", function() { event_popup(this.id.substr(1), d3.mouse(this)); });
    }  
  }

  this.draw_chart = function() {
    d3.json("/events/api/event/", function(e) {
      d3.json("/events/api/person/", function(p) {
        var i, j, event, person, sum_default_x, event_date_range, timescale, yAxis;
        events = e, people = p;
        
        svg = d3
          .select("#chart")
          .append("svg")
          .attr("xmlns:xmlns:xlink","http://www.w3.org/1999/xlink")
          .attr("viewBox", "-"+margin+" -"+margin+" "+(chart_width+2*margin)+" "+(chart_height+2*margin))
          .attr("width", chart_width)
          .attr("height", chart_height)
          .attr("id", "timeline")
          .append("g");

        events.sort(function(e1,e2) { return e1.date > e2.date; }); // don't assume they come in a specific order

        // draw time axis
        timescale = d3.time.scale()
          .domain([new Date(events[0].date), new Date(events[events.length-1].date)])
          .range([0,chart_height]);
        yAxis = d3.svg.axis()
          .scale(timescale)
          .orient('left');
        svg.append("g")
          .attr('class', 'axis')
          .call(yAxis);

        // time calculations (todo: use timescale)
        min_date=9999999999999; max_date=0;
        for (i = 0; i < events.length; i++) {
          events[i].dateInt = dateToInt(events[i].date);
          min_date = Math.min(min_date, events[i].dateInt);
          max_date = Math.max(max_date, events[i].dateInt);
        }

        // a person's default_x is that person's default position on the chart
        for (j=0;j<people.length;j++) {
          people[j].default_x = chart_width * (j+1) / (people.length+1); // todo: use d3.scale.ordinal
        }

        calc_events_chart_data();
        calc_people_chart_data();

        draw_people();
        draw_events();

        // text labels for events
        for (i=0;i<events.length;i++) {
          event = events[i];
          svg
            .append("a")
            .attr("xlink:href","event/"+event.id)
            .append("text")
            .attr("x", event.cx-event.rx/2)
            .attr("y", event.cy+20)
            .attr("text-anchor", "end")
            .attr("class", "event-text")
            .text(abbreviate(event.title,20));
        }
      });
    });
  };
};

var n=new Narrative();
n.draw_chart(true, true);
