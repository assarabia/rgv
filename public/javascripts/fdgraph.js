function myGraph(el) {

    // Add and remove elements on the graph object
    this.addNode = function (id) {
        nodes.push({"id":id});
        update();
    }

    this.removeNode = function (id) {
        var i = 0;
        var n = findNode(id);
        while (i < links.length) {
            if ((links[i]['source'] == n)||(links[i]['target'] == n))
		links.splice(i,1);
            else
		i++;
        }
        nodes.splice(findNodeIndex(id),1);
        update();
    }

    this.addLink = function (source, target) {
        links.push({"source":findNode(source),"target":findNode(target)});
        update();
    }

    var findNode = function(id) {
        for (var i in nodes)
        {if (nodes[i]["id"] === id) return nodes[i]};
    }

    var findNodeIndex = function(id) {
        for (var i in nodes)
        {if (nodes[i]["id"] === id) return i};
    }

    var update = function () {
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
            .attr("r", 5)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5)
            .attr("fill", function(d) { return node_color[ nodeType(d.id) ] });

        nodeEnter.append("text")
            .attr("class", "nodetext")
            .attr("dx", 12)
            .attr("dy", ".35em")
            .text(function(d) {return d.id});

        node.exit().remove();

        force.on("tick", function(e) {
            node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });
        });

        // Restart the force layout.
        force.start();
    }


    // set up the D3 visualisation in the specified element
    var w = $(el).innerWidth(),
    h = $(el).innerHeight();

    var vis = this.vis = d3.select(el).append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(50)    
        .size([w, h]);

    var nodes = force.nodes(),
    links = force.links();

    var node_color = {"RT"     : "#1f77b4",
                      "ILM"    : "#ff7f0e",
                      "RT-EXP" : "#2ca02c",
                      "LSP"    : "#d62728",
                      "LINK"   : "#9467bd",
                      "TNL"    : "#8c564b",
                      "NHDN"   : "#e377c2"};

    // Make it all go
    update();
}


