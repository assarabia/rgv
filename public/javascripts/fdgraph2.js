function myGraph(el) {

    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
    h = $(el).innerHeight();

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var force = d3.layout.force()
        .gravity(0)
        .charge(-15)
        .linkDistance(80)
        .size([w, h]);

    var nodes = force.nodes(),
    links = force.links();

    var node_color = {"RT"     : "#58FA82",
                      "client" : "#58ACFA",
                      "server" : "#FAAC58"};

    var node_stroke_color = {"RT"     : "#01DF3A",
			     "client" : "#0080FF",
			     "server" : "#DF7401"};

    var node_gravity = {"RT"     : 0.0,
                        "client" : 0.1 ,
                        "server" : 0.5};

    var node_radius = {"RT"     : 10,
                       "client" : 10,
                       "server" : 10};

    this.addNode = function (id) {
        if (findNode(id)) return;
        nodes.push({"id":id});
    }

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        if (n == null) return;
        while (i < links.length) {
            if ((links[i]['source'] == n)||(links[i]['target'] == n))
		links.splice(i,1);
            else
		i++;
        }
        nodes.splice(findNodeIndex(id),1);
    }

    this.removeLinkToTarget = function (source) {
        var i = 0;
        var n = findNode(source);
        if (n == null) return;
        while (i < links.length) {
            if (links[i]['source'] == n)
		links.splice(i,1);
            else
		i++;
	}
    }

    this.addLink = function (source, target) {
        links.push({"source":findNode(source),"target":findNode(target)});
    }

    this.update = function () {
        var link = vis.selectAll("line.link")
            .data(links, function(d) { return d.source.id + "-" + d.target.id; });

        link.enter().insert("line")
            .attr("class", "link");

        link.exit().remove();

        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id;});

        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .call(force.drag);

        nodeEnter.append("circle")
            .attr("r", function(d) { return node_radius[ nodeType(d.id) ] })
            .attr("stroke", function(d) { return node_stroke_color[ nodeType(d.id) ] })
            .attr("stroke-width", 1.5)
            .attr("fill", function(d) { return node_color[ nodeType(d.id) ] });

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});

        node.exit().remove();

        force.on("tick", function(e) {
            node.each(gravity(.1 * e.alpha))
                .each(collide(.5))
		    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });

        // Restart the force layout.
        force.start();
    }

    function findNode(id) {
        for (var i in nodes)
        {if (nodes[i]["id"] === id) return nodes[i]};
    }

    function findNodeIndex(id) {
        for (var i in nodes)
        {if (nodes[i]["id"] === id) return i};
    }

    function nodeType(id) {
        return id.split(" ")[0];
    }

    // Move nodes toward cluster focus.
    function gravity(alpha) {
	return function(d) {
            d.y += (h/2 - d.y) * node_gravity[ nodeType(d.id) ] * alpha;
            d.x += (w/2 - d.x) * node_gravity[ nodeType(d.id) ] * alpha;
	};
    }

    // Resolve collisions between nodes.
    function collide(alpha) {
	var quadtree = d3.geom.quadtree(nodes);
	return function(d) {
	    var r = node_radius[ nodeType(d.id) ] + 16,
            nx1 = d.x - r,
            nx2 = d.x + r,
            ny1 = d.y - r,
            ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
		if (quad.point && (quad.point !== d)) {
		    var x = d.x - quad.point.x,
		    y = d.y - quad.point.y,
		    l = Math.sqrt(x * x + y * y),
		    r = node_radius[ nodeType(d.id) ] + node_radius[ nodeType(quad.point.id) ];
		    if (l < r) {
			l = (l - r) / l * alpha;
			d.x -= x *= l;
			d.y -= y *= l;
			quad.point.x += x;
			quad.point.y += y;
		    }
		}
		return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	};
    }
}
