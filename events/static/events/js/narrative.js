var d3;

var Narrative = function() {
  "use strict";

  var
    chart_width = 1000,
    chart_height = 2000,
    margin = 20,
    curvature = 0.5;

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


//    raw_chart_width = 1000,
//    raw_chart_height = 360,
//
//    link_width = 1.8,
//    link_gap = 2,
//
//    node_width = 10, // Set to panel_width later
//    color = d3.scale.category10(),
//
//    // This is used for more than just text height.
//    text_height = 8,
//
//    // If a name's x is smaller than this value * chart width,
//    // the name appears at the start of the chart, as
//    // opposed to appearing right before the first scene
//    // (the name doesn't make any sense).
//    per_width = 0.3,
//
//    // The character's name appears before its first
//    // scene's x value by this many pixels
//    name_shift = 10,
//
//    // True: Use a white background for names
//    name_bg = true,
//
//
//    // Scene width in panel_width
//    // i.e. scene width = panel_width*sw_panels
//    //sw_panels = 3,
//
//    // Longest name in pixels to make space at the beginning
//    // of the chart. Can calculate but this works okay.
//    longest_name = 115;
//
//  // d3 function
//
//
//  function Link(from, to, char_id) {
//    // to and from are ids of scenes
//    this.from = from;
//    this.to = to;
//    this.char_id = char_id;
//    this.x0 = 0;
//    this.y0 = -1;
//    this.x1 = 0;
//    this.y1 = -1;
//    this.char_ptr = null; // TODO: Not used
//  } // Link
//
//
//  function SceneNode(chars, start, id) {
//    this.chars = chars; // List of characters in the Scene (ids)
//    this.start = start; // Scene starts after this many panels
//    this.id = id;
//    this.char_ptrs = [];
//    // Determined later
//    this.x = 0;
//    this.y = 0;
//    this.width = node_width; // Same for all nodes
//    this.height = 0; // Will be set later; proportional to link count
//    this.in_links = [];
//    this.out_links = [];
//    this.name = "";
//    this.has_person = function(id) {
//      for (var i = 0; i < this.chars.length; i++) {
//        if (id === this.chars[i]) {
//          return true;
//        }
//      }
//      return false;
//    };
//    this.char_node = false;
//    this.first_scene = null; // Only defined for char_node true
//    // Used when determining the y position of the name (i.e. the char_node)
//    // Char nodes are divided into x-regions, and the names in each region
//    // are sorted separately. This is the index of the x-region.
//    // ... Actually, I'll just keep an array of the nodes in every region.
//    //this.x_region = 0;
//  }
//
//  function reposition_node_links(scene_id, x, y, width, height, svg, ydisp, comic_name) {
//    //console.log(d3.selectAll("[from=\"" + scene_id + "\"]"));
//    var counter = 0;
//    d3
//      .selectAll("[to=\"" + comic_name + "_" +  scene_id + "\"]")
//      .each(function(d) {
//        d.x1 =  x + width/2;
//        d.y1 -= ydisp;
//        counter += 1;
//      })
//      .attr("d", function(d) { return get_path(d); });
//    counter = 0;
//    d3
//      .selectAll("[from=\"" + comic_name + "_" +  scene_id + "\"]")
//      .each(function(d) {
//        d.x0 =  x + width/2;
//        d.y0 -= ydisp;
//        counter += 1;
//      })
//      .attr("d", function(d) { return get_path(d); });
//  } // reposition_link_nodes
//
//  function generate_links(people, events) {
//    var i,j,links=[],person_events;
//    function scene_cmp(a,b) { return a.start-b.start; }
//    for (i = 0; i < people.length; i++) {
//      // The events in which the person appears
//      person_events = [];
//      for (j = 0; j < events.length; j++) {
//        if (events[j].has_person(people[i].id)) {
//          person_events[person_events.length] = events[j];
//        }
//      }
//
//      char_scenes.sort(scene_cmp);
//      chars[i].first_scene = char_scenes[0];
//      for (j = 1; j < char_scenes.length; j++) {
//        links[links.length] = new Link(char_scenes[j-1], char_scenes[j], chars[i].id);
//        links[links.length-1].char_ptr = chars[i];
//        char_scenes[j-1].out_links[char_scenes[j-1].out_links.length] = links[links.length-1];
//        char_scenes[j].in_links[char_scenes[j].in_links.length] = links[links.length-1];
//        //console.log(char_scenes[j].in_links[char_scenes[j].in_links.length-1].y0);
//
//      person_events.sort(scene_cmp);
//      people[i].first_scene = person_events[0];
//      for (j = 1; j < person_events.length; j++) {
//        links[links.length] = new Link(person_events[j-1], person_events[j],
//               people[i].group, people[i].id);
//        links[links.length-1].char_ptr = people[i];
//        //console.log("char name = " + people[i].name + ", group = " + people[i].group);
//        person_events[j-1].out_links[person_events[j-1].out_links.length] = links[links.length-1];
//        person_events[j].in_links[person_events[j].in_links.length] = links[links.length-1];
//        //console.log(person_events[j].in_links[person_events[j].in_links.length-1].y0);
//      }
//    } // for
//    return links;
//  } // generate_links
//
//  function Group() {
//    this.min = -1;
//    this.max = -1;
//    this.id = -1;
//    this.chars = [];
//    this.first_scene_chars = []; // NOT USED?
//    this.median_count = 0;
//    this.biggest_scene = 0; // largest scene height. NOT USED
//    this.all_chars = {};
//    this.char_scenes = [];
//    this.order = -1;
//  }
//
//  function sort_groups(groups_sorted, groups_desc, top, bottom) {
//    var i,m,t1,b1,t2,b2,g1,g2;
//    if (groups_desc.length === 2) {
//      groups_sorted[bottom] = groups_desc[0];
//      groups_sorted[top] = groups_desc[1];
//      return;
//    }
//    if (top >= bottom) {
//      if (groups_desc.length > 0) {
//        groups_sorted[top] = groups_desc[0];
//      }
//      return;
//    }
//    m = Math.floor((top + bottom)/2);
//    groups_sorted[m] = groups_desc[0];
//    t1 = top;
//    b1 = m-1;
//    t2 = m+1;
//    b2 = bottom;
//    g1 = [];
//    g2 = [];
//    // TODO: make more efficient
//    for (i = 1; i < groups_desc.length; i++) {
//      if (i % 2 === 0) {
//        g1[g1.length] = groups_desc[i];
//      } else {
//        g2[g2.length] = groups_desc[i];
//      }
//    } // for
//    sort_groups(groups_sorted, g1, t1, b1);
//    sort_groups(groups_sorted, g2, t2, b2);
//  } // sort_groups
//
//  function define_groups(chars) {
//    var groups = [];
//    chars.forEach(function(c) {
//      // Put char in group
//      var g,found_group = false;
//      groups.forEach(function(g) {
//        if (g.id === c.group) {
//          found_group = true;
//          g.chars[g.chars.length] = c;
//          c.group_ptr = g;
//        }
//      });
//      if (!found_group) {
//        g = new Group();
//        g.id = c.group;
//        g.chars[g.chars.length] = c;
//        c.group_ptr = g;
//        groups[groups.length] = g;
//      }
//    });
//    return groups;
//  }
//
//  // for each event, find its median group
//  function find_median_groups(groups, events, people, tie_breaker) {
//    events.forEach(function(event) {
//      var i, group_count, max_index;
//      if (!event.char_node) {
//        group_count = [];
//        for (i = 0; i < groups.length; i++) {
//          group_count[i] = 0;
//        }
//        max_index = 0;
//        event.people.forEach(function(person) {
//          // TODO: Can just search group.people
////          var i, score1, score2, group_index = find_group(people, groups, c);
//          var i, score1, score2, group_index = 0;
//          group_count[group_index] += 1;
//          if ( (!tie_breaker && group_count[group_index] >= group_count[max_index]) ||
//               (group_count[group_index] > group_count[max_index])) {
//            max_index = group_index;
//          } else {
//            if (group_count[group_index] === group_count[max_index]) {
//              // Tie-breaking
//              score1 = 0;
//              score2 = 0;
//              for (i = 0; i < event.in_links.length; i++) {
//                if (event.in_links[i].from.median_group !== null) {
//                  if (event.in_links[i].from.median_group.id === groups[group_index].id) {
//                    score1 += 1;
//                  } else {
//                    if (event.in_links[i].from.median_group.id === groups[max_index].id) {
//                      score2 += 1;
//                    }
//                  }
//                }
//              }
//              for (i = 0; i < event.out_links.length; i++) {
//                if (event.out_links[i].to.median_group !== null) {
//                  if (event.out_links[i].to.median_group.id === groups[group_index].id) {
//                    score1 += 1;
//                  } else {
//                    if (event.out_links[i].to.median_group.id === groups[max_index].id) {
//                      score2 += 1;
//                    }
//                  }
//                }
//              }
//              if (score1 > score2) {
//                max_index = group_index;
//              }
//            }
//          }
//        });
//        event.median_group = groups[max_index];
//        groups[max_index].median_count += 1;
//        event.people.forEach(function(c) {
//          // This just puts this character in the set
//          // using sets to avoid duplicating characters
//          groups[max_index].all_chars[c] = true;
//        });
//      }
//    });
//    // Convert all the group char sets to regular arrays
//    groups.forEach(function(group) {
//      var c, chars_list = [];
//      for (c in group.all_chars) {
//        if (group.all_chars.hasOwnProperty(c)) {
//          chars_list.push(people[c]);
//        }
//      }
//      group.all_chars = chars_list;
//    });
//    console.log(groups);
//  }
//
//  function sort_groups_main(groups, center_sort) {
//    var groups_cpy = [], i, groups_desc, groups_desc1, groups_desc2, center;
//    groups.sort(function(a, b) {
//      return b.median_count - a.median_count;
//    });
//    for (i = 0; i < groups.length; i++) {
//      groups_cpy[i] = groups[i];
//    }
//    if (!center_sort) {
//      if (groups.length > 0) {
//        groups_cpy[0] = groups[0];
//      }
//      if (groups.length > 1) {
//        groups_cpy[groups.length-1] = groups[1];
//      }
//      if (groups.length > 2) {
//        groups_desc = [];
//        for (i = 0; i < groups.length - 2; i++) {
//          groups_desc[i] = groups[i+2];
//        }
//        // groups_cpy is the one that gets sorted
//        sort_groups(groups_cpy, groups_desc, 1, groups.length-2);
//      }
//    } else {
//      center = Math.floor(groups.length/2.0);
//      groups_cpy[center] = groups[0];
//      groups_desc1 = [];
//      for (i = 0; i < center; i++) {
//        groups_desc1[i] = groups[i];
//      }
//      groups_desc2 = [];
//      for (i = center + 1; i < groups.length; i++) {
//        groups_desc2[i-center-1] = groups[i];
//      }
//      sort_groups(groups_cpy, groups_desc1, 0, center);
//      sort_groups(groups_cpy, groups_desc2, center+1, groups.length);
//    }
//    for (i = 0 ; i < groups_cpy.length; i++) {
//      groups_cpy[i].order = i;
//    }
//    return groups_cpy;
//  } // sort_groups_main
//
//
//  // Called before link positions are determined
//  function add_char_scenes(chars, scenes, links, panel_shift, comic_name) {
//    // Shift starting times for the rest of the scenes panel_shift panels to the left
//    var char_scenes = [];
//    // Set y values
//    var cury = 0;
//    for (var i = 0; i < chars.length; i++) {
//      var s = new SceneNode([chars[i].id], [0], [1]); // @@this probably doesn't work
//      s.char_node = true;
//      s.y = i*text_height;
//      s.x = 0;
//      s.width = 5;
//      s.height = link_width;
//      s.name = chars[i].name;
//      s.chars[s.chars.length] = chars[i].id;
//      s.id = scenes.length;
//      s.comic_name = comic_name;
//      if (chars[i].first_scene !== undefined) {
//        var l = new Link(s, chars[i].first_scene, chars[i].id);
//        l.char_ptr = chars[i];
//        s.out_links[s.out_links.length] = l;
//        chars[i].first_scene.in_links[chars[i].first_scene.in_links.length] = l;
//        links[links.length] = l;
//        s.first_scene = chars[i].first_scene;
//        scenes[scenes.length] = s;
//        char_scenes[char_scenes.length] = s;
//      } // if
//    } // for
//    return char_scenes;
//  } // add_char_scenes
//
//
//  function calculate_node_positions(chars, scenes, total_panels, chart_width,
//                                    chart_height, char_scenes, panel_width,
//                                    panel_shift, char_map) {
//    scenes.forEach(function(scene) {
//      if (!scene.char_node) {
//        scene.height = Math.max(0, scene.chars.length*link_width + (scene.chars.length - 1)*link_gap);
//        scene.width = panel_width*3;
//        // Average of chars meeting at the scene _in group_
//        var sum1 = 0;
//        var sum2 = 0;
//        var den1 = 0;
//        var den2 = 0;
//        for (var i = 0; i < scene.chars.length; i++) {
//          var c = char_map[scene.chars[i]];
//          var y = ??;
//          if (!y) {
//            continue;
//          }
//        }
//        var avg;
//        // If any non-median-group characters appear in the scene, use
//        // the average of their positions in the median group
//        if (den2 !== 0) {
//          avg = sum2/den2;
//          // Otherwise, use the average of the group characters
//        } else if (den1 !== 0) {
//          avg = sum1/den1;
//        } else {
//          console.log("ERROR: den1 and den2 are 0. Scene doesn't have characters?");
//        }
//        scene.y = avg - scene.height/2.0;
//        scene.x = scene.start;
//      }
//    });
//    char_scenes.forEach(function(scene) {
//      if (scene.first_scene !== null) { // i.e. if it's a char scene node
//        // Position char node right before the char's first scene
//        if (scene.first_scene.x > per_width*raw_chart_width) {
//          scene.x = scene.first_scene.x - name_shift;
//        } else {
//          scene.x = panel_shift*panel_width - name_shift;
//        }
//      }
//    });
//  } // calculate_node_positions
//
//  // The positions of the nodes have to be set before this is called
//  // (The positions of the links are determined according to the positions
//  // of the nodes they link.)
//  function calculate_link_positions(scenes, chars) {
//    // Sort by x
//    // Because the sorting of the in_links will depend on where the link
//    // is coming from, so that needs to be calculated first
//    //scenes.sort(function(a, b) { return a.x - b.x; });
//    scenes.forEach(function(scene) {
//      var i,j;
//      // TODO: Sort the in_links here
//@@      scene.in_links.sort(function(a, b) { return a.char_ptr.group_ptr.order - b.char_ptr.group_ptr.order; });
//@@      scene.out_links.sort(function(a, b) { return a.char_ptr.group_ptr.order - b.char_ptr.group_ptr.order; });
//
//      // We can't calculate the y positions of the in links in the same
//      // way we do the out links, because some links come in but don't go
//      // out, and we need every link to go out the same position it came in
//      // so we flag the unset positions.
//      for (i = 0; i < scene.out_links.length; i++) {
//        scene.out_links[i].y0 = -1;
//      }
//      j = 0;
//      for (i = 0; i < scene.in_links.length; i++) {
//        // These are links incoming to the node, so we're setting the
//        // co-cordinates for the last point on the link path
//        scene.in_links[i].y1 = scene.y + i*(link_width+link_gap) + link_width/2.0;
//        scene.in_links[i].x1 = scene.x + 0.5*scene.width;
//        if (j < scene.out_links.length && scene.out_links[j].char_id === scene.in_links[i].char_id) {
//          scene.out_links[j].y0 = scene.in_links[i].y1;
//          j++;
//        }
//      }
//      for (i = 0; i < scene.out_links.length; i++) {
//        if (scene.out_links[i].y0 === -1) {
//          scene.out_links[i].y0 = scene.y + i*(link_width+link_gap) + link_width/2.0;
//        }
//        scene.out_links[i].x0 = scene.x + 0.5*scene.width;
//      }
//    });
//  } // calculate_link_positions
//
//  function draw_nodes(scenes, svg, chart_width, chart_height) {
//    var node;
//      function mouseover(d) {
//        if (d.char_node === true) {
//          return;
//        }
//        var im = new Image();
//        im.name = "Scene panel";
//        im.id = "scene" + d.id;
////        im.src = folder + "/scene_images/scene" + d.id + ".png";
//        im.onload = function() {
//          var w,h,x,y,ratio,max_w,max_h;
//          w = this.width;
//          h = this.height;
//          x = d.x + d.width;
//          y = d.y + d.height;
//          if (h > chart_height-y) {
//            max_h = Math.max(y, chart_height-y);
//            if (h > max_h) {
//              ratio = max_h/h;
//              h *= ratio;
//              w *= ratio;
//            }
//            if (max_h === y) {
//              y -= h + d.height;
//            }
//          }
//          if (w > chart_width-x) {
//            max_w = Math.max(x, chart_width-x);
//            if (w > max_w) {
//              ratio = max_w/w;
//              h *= ratio;
//              w *= ratio;
//            }
//            if (max_w === x) {
//              x -= w + d.width;
//            }
//          }
//        svg
//          .append("image")
//          .data([this])
//          .attr("x", x)
//          .attr("y", y)
//          .attr("xlink:href", this.src)
//          .attr("transform", null)
//          .style("position", "relative")
//          .attr("id", this.id)
//          .attr("class", "scene-image")
//          .attr("width", w)
//          .attr("height", h);
//        }; // im.onload
//      } // mouseover
//      function mouseout() {
//        //console.log("mouse out");
//        // could use d.id to remove just the one image
//        d3.selectAll("[class=\"scene-image\"]").remove();
//      }
//      function dragmove(d) {
//        var newy = Math.max(0, Math.min(chart_height - d.height, d3.event.y));
//        var ydisp = d.y - newy;
//        d3.select(this).attr("transform", "translate(" + (d.x = Math.max(0, Math.min(chart_width - d.width, d3.event.x))) + "," + (d.y = Math.max(0, Math.min(chart_height - d.height, d3.event.y))) + ")");
//        reposition_node_links(d.id, d.x, d.y, d.width, d.height, svg, ydisp, d.comic_name);
//      }
//
//      node = svg
//      .append("g")
//      .selectAll(".node")
//      .data(scenes)
//      .enter()
//      .append("g")
//      .attr("class", "node")
//      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
//      .attr("scene_id", function(d) { return d.id; })
//      .on("mouseover", mouseover)
//      .on("mouseout", mouseout)
//      .call(d3.behavior.drag()
//        .origin(function(d) { return d; })
//        .on("dragstart", function() { this.parentNode.appendChild(this); })
//        .on("drag", dragmove));
//      node
//        .append("rect")
//        .attr("width", function(d) { return d.width; })
//        .attr("height", function(d) { return d.height; })
//        .attr("class", "scene")
//        //.style("fill", function(d) { return "#1f77b4"; })
//        //.style("stroke", function(d) { return "#0f3a58"; })
//        .attr("rx", 20)
//        .attr("ry", 10)
//        .append("title")
//        .text(function(d) { return d.name; });
//      // White background for the names
//      if (name_bg) {
//        node
//          .append("rect")
//          .filter(function(d) {
//            return d.char_node;
//          })
//          .attr("x", function(d) {
//            return -((d.name.length+2)*5);
//          })
//          .attr("y", function() { return -3; })
//          .attr("width", function() { return (d.name.length+1)*5; })
//          .attr("height", 7.5)
//          .attr("transform", null)
//          .attr("fill", "#fff")
//          .style("opacity", 1);
//      }
//      node
//        .append("text")
//        .filter(function(d) {
//          return d.char_node;
//        })
//        .attr("x", -6)
//        .attr("y", function() { return 0; })
//        .attr("dy", ".35em")
//        .attr("text-anchor", "end")
//        .attr("transform", null)
//        //.attr("background", "#fff")
//        .text(function(d) { return d.name; })
//          //.style("fill", "#000")
//          //.style("stroke", "#fff")
//          //.style("stroke-width", "0.5px")
//        .filter(function() {
//          return false;
//      //return d.x < chart_width / 2;
//        })
//        .attr("x", function(d) { return 6 + d.width; })
//        .attr("text-anchor", "start");
//  }
//
////   function find_link(links, char_id) {
////     for (var i = 0; i < links.length; i++) {
////       if (links[i].char_id === char_id) {
////         return links[i];
////       }
////     }
////     return 0;
////   }
//
//  function draw_links(links, svg) {
//    function mouseover_cb(d) {
//      d3
//        .selectAll("[charid=\"" + d.from.comic_name + "_" + d.char_id + "\"]")
//        .style("stroke-opacity", "1");
//    }
//    function mouseout_cb(d) {
//      d3
//        .selectAll("[charid=\"" + d.from.comic_name + "_" + d.char_id + "\"]")
//        .style("stroke-opacity", "0.6");
//    }
//    svg
//      .append("g").selectAll(".link")
//      .data(links)
//      .enter().append("path")
//      .attr("class", "link")
//      .attr("d", function(d) { return get_path(d); })
//      .attr("from", function(d) { return d.from.comic_name + "_" + d.from.id; })
//      .attr("to", function(d) { return d.to.comic_name + "_" +  d.to.id; })
//      .attr("charid", function(d) { return d.from.comic_name + "_" + d.char_id; })
//      .style("stroke", function(d) { return d3.rgb(color("#fdd")).darker(0.5).toString(); }) @@ color def?
//      .style("stroke-width", link_width)
//            .style("stroke-opacity", "0.6")
//            .style("stroke-linecap", "round")
//            .on("mouseover", mouseover_cb)
//            .on("mouseout", mouseout_cb);
//  }
//
//
//
//
//  this.draw_chart = function(tie_breaker, center_sort) {
//    d3.json("/events/api/event/", function(events) {
//      var minDate, maxDate, margin, width, height, scene_width, i;
//      margin = {top: 20, right: 25, bottom: 20, left: 1};
//      width = raw_chart_width - margin.left - margin.right;
//      height = raw_chart_height - margin.top - margin.bottom;
//      scene_width = (width - longest_name) / (events.length + 1);
//      minDate = 9999999999999; maxDate = 0;
//
//      // first, sort events from API
//      events.sort(function(e1,e2) { e1.date > e2.date; });
//
//      // then find min and max date numbers
//      for (i = 0; i < events.length; i++) {
//        events[i].dateInt = dateToInt(events[i].date);
//        minDate = Math.min(minDate, events[i].dateInt);
//        maxDate = Math.max(minDate, events[i].dateInt);
//      }
//
//      // then, add extra parameters needed for plottingeach event
//      for (i = 0; i < events.length; i++) {
//        events[i].start = events[i].dateInt / ( maxDate - minDate);
//        events[i].char_ptrs = [];
//        events[i].x = 0;
//        events[i].y = 0;
//        events[i].width = node_width;
//        events[i].height = 0;
//        events[i].in_links = [];
//        events[i].out_links = [];
//        events[i].has_person = function(id) {
//          for (var i = 0; i < events[i].people.length; i++) {
//            if (id === events[i].people[i]) {
//              return true;
//            }
//          }
//          return false;
//        };
//        events[i].char_node = false;
//        events[i].first_scene = null; // Only defined for char_node true
//        // Used when determining the y position of the name (i.e. the char_node)
//        // Char nodes are divided into x-regions, and the names in each region
//        // are sorted separately. This is the index of the x-region.
//        // ... Actually, I'll just keep an array of the nodes in every region.
//        //this.x_region = 0;
//      }
//
////      var panel_width = Math.min((width-longest_name)/total_panels, 15);
////      var panel_shift = Math.round(longest_name/panel_width);
////      total_panels += panel_shift;
////      panel_width = Math.min(width/total_panels, 15);
//
//      d3.json("/events/api/person/", function(people) {
//        var svg, chars, char_map, links, char_scenes, i;
//        svg = d3
//          .select("#chart")
//          .append("svg")
//          .attr("width", width + margin.left + margin.right)
//          .attr("height", height + margin.top + margin.bottom)
//          .attr("class", "chart")
//          .attr("id", "timeline")
//          .append("g")
//          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//        for (i = 0; i < people.length; i++) {
//          people[i].first_scene = null;
//        }
//
//        links = generate_links(people, events);
//        char_scenes = add_char_scenes(people, events, links, panel_shift);
//        groups = define_groups(people);
//
//        find_median_groups(groups, events, people, tie_breaker);
//
//
//        groups = sort_groups_main(groups, center_sort);
//        links = generate_links(people, events);
//        char_scenes = add_char_scenes(people, events, links, groups, 40);
//        // Determine the position of each character in each group
//        // (if it ever appears in the scenes that appear in that
//        // group)
//        groups.forEach(function(g) {
//          g.all_chars.sort(function(a, b) {
//            return a.group_ptr.order - b.group_ptr.order;
//          });
//          var y = g.min;
//          for (var i = 0; i < g.all_chars.length; i++) {
//            g.all_chars[i].group_positions[g.id] = y + i*(text_height);
//          }
//        });
//
//        calculate_node_positions(people, scenes, total_panels,
//             width, height, char_scenes, panel_width,
//             panel_shift, char_map);
//        scenes.forEach(function(s) {
//          if (!s.char_node) {
//            var first_scenes = [];
//            //ys = [];
//            s.in_links.forEach(function(l) {
//              if (l.from.char_node) {
//                first_scenes[first_scenes.length] = l.from;
//                //ys[ys.length] = l.y1;
//                //console.log(l.y1);
//              }
//            });
//        /*
//        if (first_scenes.length === 1) {
//            first_scenes[0].y = s.y + s.height/2.0;
//            console.log(first_scenes[0].y);
//        } else {
//        */
//            for (var i = 0; i < first_scenes.length; i++) {
//              first_scenes[i].y = s.y + s.height/2.0 + i*text_height;
//            }
//        //}
//          }
//        });
//        // Determining the y-positions of the names (i.e. the char scenes)
//        // if the appear at the beginning of the chart
//        char_scenes.forEach(function(cs) {
//          var character = char_map[cs.chars[0]];
//          if (character.first_scene.x < per_width*width) {
//            cs.y = character.group_positions[@@];
//          }
//        });
//        calculate_link_positions(events, people, char_map);
//@@        height = groups[groups.length-1].max + group_gap*5;
//        raw_chart_height = height + margin.top + margin.bottom;
//        d3.select('svg#timeline').style("height", raw_chart_height);
//        draw_links(links, svg);
//        draw_nodes(events, svg, width, height, raw_chart_height);
//      }); // d3.xml (read chars)
//    }); // d3.json (read scenes)
//  };

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

  this.draw_chart = function() {
    var svg;
    svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", "-"+margin+" -"+margin+" "+(chart_width+2*margin)+" "+(chart_height+2*margin))
      .attr("width", chart_width)
      .attr("height", chart_height)
      .attr("id", "timeline")
      .append("g");

    d3.json("/events/api/event/", function(events) {
      d3.json("/events/api/person/", function(people) {
        var i, j, event, person, sum_default_x, min_date, max_date, event_date_range, previous_event, idx, prevx, thisx, previdx;
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

          svg
            .append("text")
            .attr("x", event.cx)
            .attr("y", event.cy)
            .attr("text-anchor", "end")
            .attr("class", "event-text")
            .text(event.title);
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
                 console.log("not the first");
                 // trace person's line from event to previous_event
                 prevx = previous_event.cx - previous_event.rx/2 + previdx*10;
                 thisx = event.cx - event.rx/2 + idx*10;
                 svg
                   .append("path")
                   .attr("d", get_path(prevx, previous_event.cy, thisx, event.cy))
                   .attr("class", "person");
               }
               previous_event = event;
               previdx = idx;
            }
          }
        }
      });
    });
  };
};

var n=new Narrative();
n.draw_chart(true, true);
