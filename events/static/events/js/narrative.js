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
    people_spacing_in_event = 20;

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

  function find_event_by_id(events, id) {
    var i;
    for (i=0;i<events.length;i++) {
      if (events[i].id == id) {
        return events[i];
      }
    }
    return undefined;
  }

  function event_popup(event) {
    svg
      .append("rect")
      .attr("x",event.x)
      .attr("y",event.y)
      .attr("width",20)
      .attr("height",20)
      .attr("class", "event_tooltip");
  }

  function person_popup(person_id, mouse) {
    var person, popup;
    person = find_person_by_id(person_id);
    popup = svg
      .append("g")
      .on("mouseout", function() { this.remove(); });
    popup
      .append("rect")
      .attr("x",mouse[0]-8)
      .attr("y",mouse[1]-30)
      .attr("width",12*person.name.length)
      .attr("height",40)
      .attr("class", "event_tooltip");
    popup
      .append("text")
      .attr("x",mouse[0])
      .attr("y",mouse[1])
      .attr("font-family","sans-serif")
      .attr("font-size",20)
      .text(person.name);
  }

  function abbreviate(text,max_length) {
    if (text.length < max_length) {
      return text;
    } else {
      return text.substr(0,max_length-2)+"…";
    }
  }


  this.draw_chart = function() {
    d3.json("/events/api/event/", function(e) {
      d3.json("/events/api/person/", function(p) {
        var i, j, event, person, sum_default_x, min_date, max_date, event_date_range, previous_event, idx, prevx, thisx, previdx, timescale, yAxis, path, person_name = {};
        events = e, people = p;
        
        svg = d3
          .select("#chart")
          .append("svg")
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
        event_date_range = max_date - min_date;


        // a person's default_x is that person's default position on the chart
        for (j=0;j<people.length;j++) {
          people[j].default_x = chart_width * (j+1) / (people.length+1); // todo: use d3.scale.ordinal
        }

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

          svg
            .append("ellipse")
            .attr("cx", event.cx)
            .attr("cy", event.cy)
            .attr("rx", event.rx)
            .attr("ry", event.ry)
            .attr("class", "event")
            .attr("id","event-"+event.id);
        }

        // Trace each person's timeline
        for (i=0; i<people.length; i++) {
          person = people[i];          
          previous_event = null;
          path = "";
          for (j=0; j<events.length; j++) {
            event = events[j];
            idx = index_person_in_event(person, event);
            if (idx !== -1) {
              if (previous_event) {
                // trace person's line from event to previous_event
                prevx = previous_event.cx - previous_event.rx/2 + previdx*people_spacing_in_event;
                thisx = event.cx - event.rx/2 + idx*people_spacing_in_event;
                path += get_path(prevx, previous_event.cy, thisx, event.cy);
              } else {
                // the person's first event - write their name
                person_name.x = event.cx - event.rx/2 + idx*people_spacing_in_event;
                person_name.y = event.cy;
              }
              previous_event = event;
              previdx = idx;
            }
          }
          var person_color = d3.rgb(color(person.id)).darker(0.5).toString();
          svg
            .append("text")
            .attr("transform", "translate("+person_name.x+","+person_name.y+") rotate(-45)")
            .attr("text-anchor","start")
            .attr("class", "person-text")
            .style("fill", person_color)
            .text(person.name);
          svg
            .append("path")
            .attr("d", path)
            .attr("class", "person-path")
            .attr("id", "P"+person.id)
            .style("stroke", person_color)
            .on("click", function() { person_popup(this.id.substr(1), d3.mouse(this)); });
        }

        // text labels 
        for (i=0;i<events.length;i++) {
          event = events[i];
          svg
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
