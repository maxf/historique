var d3;

var Narrative = function() {
  "use strict";

  var
    chart_width, // proportional to number of people, so set later
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

  function find_person_by_id(people, id) {
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

  function event_popup(event, svg_context) {
    svg_context
      .append("rect")
      .attr("x",event.x)
      .attr("y",event.y)
      .attr("width",20)
      .attr("height",20)
      .attr("class", "event_tooltip");
  }


  function abbreviate(text,max_length) {
    if (text.length < max_length) {
      return text;
    } else {
      return text.substr(0,max_length-2)+"…";
    }
  }

  this.draw_chart = function() {
    var svg;

    d3.json("/events/api/event/", function(events) {
      d3.json("/events/api/person/", function(people) {
        var i, j, event, person, sum_default_x, min_date, max_date, event_date_range, previous_event, idx, prevx, thisx, previdx;
        chart_width = 50*people.length;
        
        svg = d3
          .select("#chart")
          .append("svg")
          .attr("viewBox", "-"+margin+" -"+margin+" "+(chart_width+2*margin)+" "+(chart_height+2*margin))
          .attr("width", chart_width)
          .attr("height", chart_height)
          .attr("id", "timeline")
          .append("g");



        events.sort(function(e1,e2) { return e1.date > e2.date; }); // don't assume they come in a specific order

        min_date=9999999999999; max_date=0;
        for (i = 0; i < events.length; i++) {
          events[i].dateInt = dateToInt(events[i].date);
          min_date = Math.min(min_date, events[i].dateInt);
          max_date = Math.max(max_date, events[i].dateInt);
        }
        event_date_range = max_date - min_date;

        // a person's default_x is that person's default position on the chart
        for (j=0;j<people.length;j++) {
          people[j].default_x = chart_width * (j+1) / (people.length+1);
        }

        function person_id_cmp(p1,p2) { return p1.id > p2.id; }
        for (i=0;i<events.length;i++) {
          event = events[i];
          event.people.sort(person_id_cmp);

          // we compute an event's X by averaging the default_x of its participants
          sum_default_x = 0;
          for (j=0; j<event.people.length; j++) {
            sum_default_x += find_person_by_id(people, event.people[j].id).default_x;
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
//            .on("click", function(e) { event_popup(find_event_by_id(events,this.id.split('-')[1]), svg); });

        }

        // Trace each person's timeline
        for (i=0; i<people.length; i++) {
          person = people[i];          

          previous_event = null;
          for (j=0; j<events.length; j++) {
             event = events[j];
             idx = index_person_in_event(person, event);
             if (idx !== -1) {
               console.log(person.name, event.title);
               if (previous_event) {
                 // trace person's line from event to previous_event
                 prevx = previous_event.cx - previous_event.rx/2 + previdx*people_spacing_in_event;
                 thisx = event.cx - event.rx/2 + idx*people_spacing_in_event;
                 svg
                   .append("path")
                   .attr("d", get_path(prevx, previous_event.cy, thisx, event.cy))
                   .attr("class", "person")
                   .style("stroke", function(d) { return d3.rgb(color(person.id)).darker(0.5).toString(); });

               } else {
                 // the person's first event - write their name
                 thisx = event.cx - event.rx/2 + idx*people_spacing_in_event;
                 svg
                   .append("text")
                   .attr("transform", "translate("+thisx+","+event.cy+") rotate(-45)")
                   .attr("text-anchor","start")
                   .attr("class", "person-text")
                   .style("fill", function(d) { return d3.rgb(color(person.id)).darker(0.5).toString(); })
                   .text(person.name);
               }
               previous_event = event;
               previdx = idx;
            }
          }
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
