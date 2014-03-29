var d3;

var width = 960,
    height = 500,
    graph = {},
    color = d3.scale.category20(),
    force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height]),
    svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);



d3.json("/events/api/event/", function(error, events) {
  var i,person;

  // build graph nodes from events
  graph.nodes = [];
  for (i=0; i<events.length; i++) {
    graph.nodes.push({name:events[i].title});
  }

  d3.json("/events/api/person/", function(error, people) {
    var timeline;
    // build graph edges from people
    graph.links = [];
    for (i=0; i<people.length; i++) {
      var j, k, source_index, target_index;
      person = people[i];
      // sort a person's events by date so we get a proper timeline
      timeline = person.event_set.sort(function(e1,e2) { return e1.date > e2.date; });
console.log(timeline);
      // links are found between events along the timeline
      for (j=0; j<timeline.length-1; j++) {
        for (k=0; k<graph.nodes.length; k++) {
          if(timeline[j].id === events[k].id) { source_index = k; }
          if(timeline[j+1].id === events[k].id) { target_index = k; }
        }
        console.log(source_index + "," + target_index)
        graph.links.push({source:source_index, target:target_index});
      }
    }

    console.log(graph)

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .start();
  
    var link = svg.selectAll(".link")
        .data(graph.links)
      .enter().append("line")
        .attr("class", "link")
      ;
  
    var node = svg.selectAll(".node")
        .data(graph.nodes)
      .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
//        .style("fill", function(d) { return color(d.group); })
        .call(force.drag)
      ;
  
    node.append("title")
        .text(function(d) { return d.name; });
  
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
  
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    });
  });
});
