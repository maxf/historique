var d3, Narrative;


var EditableNarrative = function(anchor, layout) {
  Narrative.apply(this, arguments);
  var g_drag = d3.behavior.drag()
      .on("drag", function(event) {
        var i, person, ct, cz;
        event.cz += d3.event.dy;
        d3.select(this).attr('cy', this.cy.baseVal.value + d3.event.dy);

        // move the event's title too
        this.nextSibling.firstChild.setAttribute('transform', this.label_pos(event));

        // recalculate the path of the people who are in that event
        for (i=0; i<event.people.length; i++) {
          person = event.people[i];
          d3.select('#P'+person.id).attr('d', this.person_path(person));
          // relocate the perosn's disc with id disc-[person.id]-[event.id]
          ct = event.ct;
          cz = this.event_person_z(event, this.index_person_in_event(person, event));
          d3.select('#D'+person.id+'-'+event.id)
            .attr('cx', this.x(ct,cz))
            .attr('cy', this.y(ct,cz))
          ;
        }
      })
      .on("dragend", function(event) {
        d3.json('/events/api/event/'+event.id+'/set/',
                function(err, rawData){
                  console.log("got response", err, rawData);
                })
          .header("Content-Type","application/x-www-form-urlencoded")
          .send('POST', 'z='+event.cz);

      });
};

EditableNarrative.prototype = new Narrative();
EditableNarrative.prototype.constructor = EditableNarrative;
EditableNarrative.prototype.draw_events = function() {
  console.log("lalala");
  Narrative.prototype.draw_events.call(this);
  d3.select('ellipse.event').call(g_drag);
};
