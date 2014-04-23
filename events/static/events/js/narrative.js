var d3;

var Narrative = function() {
  "use strict";

  var
    svg,
    events, people,
    chart_width = 5000,
    chart_height = 800,
    margin = 30,
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
    var xi = d3.interpolateNumber(x0, x1),
        x2 = xi(curvature),
        x3 = xi(1 - curvature);
    return "M" + x0 + "," + y0 +
           "C" + x2 + "," + y0 +
           " " + x3 + "," + y1 +
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
    var person, event, previous_event, i, j, idx, previdx, thisy, prevy;
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
            prevy = previous_event.cy - previous_event.ry/2 + previdx*people_spacing_in_event;
            thisy = event.cy - event.ry/2 + idx*people_spacing_in_event;
            person.path += get_path(previous_event.cx, prevy, event.cx, thisy);
          } else {
            // the person's first event - write their name
            person.name_pos = {
              y: event.cy - event.ry/2 + idx*people_spacing_in_event, 
              x: event.cx
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
        .attr("transform", "translate("+(person.name_pos.x-5)+","+(person.name_pos.y-5)+") rotate(-45)")
        .attr("text-anchor","end")
        .attr("class", "person-text")
        .style("fill", person.color)
        .text(person.name);
    }
  }


  function calc_events_chart_data() {
    var event, i, j, sum_default_y, event_date_range;

    event_date_range = max_date - min_date;

    function person_id_cmp(p1,p2) { return p1.id > p2.id; }
    for (i=0;i<events.length;i++) {
      event = events[i];
      event.people.sort(person_id_cmp);

      // we compute an event's Y by averaging the default_y of its participants
      sum_default_y = 0;
      for (j=0; j<event.people.length; j++) {
        sum_default_y += find_person_by_id(event.people[j].id).default_y;
      }

      event.cy = sum_default_y / event.people.length;
      event.cx = (event.dateInt - min_date) * chart_width / event_date_range;
      event.ry = 10*(event.people.length + 1);
      event.rx = 10;
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

  function draw_event_labels() {
    var event, i;
    for (i=0;i<events.length;i++) {
      event = events[i];
      svg
        .append("a")
        .attr("xlink:href","event/"+event.id)
        .append("text")
        .attr("x", event.cx+10)
        .attr("y", event.cy-event.ry)
        .attr("text-anchor", "start")
        .attr("class", "event-text")
        .text(abbreviate(event.title,20));
    }
  }



  this.draw_chart = function() {
    d3.json("/events/api/event/", function(e) {
      d3.json("/events/api/person/", function(p) {
        var i, j, timescale, time_axis;
        events = e;
        people = p;
        
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
          .range([0,chart_width]);
        time_axis = d3.svg.axis()
          .scale(timescale)
          .orient('bottom');
        svg.append("g")
          .attr('class', 'axis')
          .call(time_axis);

        // time calculations (todo: use timescale)
        min_date=9999999999999; max_date=0;
        for (i = 0; i < events.length; i++) {
          events[i].dateInt = dateToInt(events[i].date);
          min_date = Math.min(min_date, events[i].dateInt);
          max_date = Math.max(max_date, events[i].dateInt);
        }

        // a person's default_y is that person's default position on the chart
        for (j=0;j<people.length;j++) {
          people[j].default_y = chart_height * (j+1) / (people.length+1); // todo: use d3.scale.ordinal
        }

        calc_events_chart_data();
        calc_people_chart_data();

        draw_people();
        draw_events();

        draw_event_labels();
      });
    });
  };
};

var n=new Narrative();
n.draw_chart(true, true);
