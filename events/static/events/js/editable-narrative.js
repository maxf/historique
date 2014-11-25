var d3, Narrative;


var EditableNarrative = function(anchor, layout) {
  var that = this;
  Narrative.apply(this, arguments);
  this.g_drag = d3.behavior.drag()
    .on("drag", function(event) {
      var i, person, ct, cz;
      event.cz += d3.event.dy;
      d3.select(this).attr('cy', this.cy.baseVal.value + d3.event.dy);

      // move the event's title too
      this.nextSibling.firstChild.setAttribute('transform', that.label_pos(event));

      // recalculate the path of the people who are in that event
      for (i=0; i<event.people.length; i++) {
        person = event.people[i];
        d3.select('#P'+person.id).attr('d', that.person_path(person));
        // relocate the perosn's disc with id disc-[person.id]-[event.id]
        ct = event.ct;
        cz = that.event_person_z(event, that.index_person_in_event(person, event));
        d3.select('#D'+person.id+'-'+event.id)
          .attr('cx', that.x(ct,cz))
          .attr('cy', that.y(ct,cz))
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
      .attr('class', 'event-shape')
      .call(this.g_drag)
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
