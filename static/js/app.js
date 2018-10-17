function init() {
    
    d3.json('/samples').then(function(sampleData) {
        console.log(sampleData);
        
        var $select = d3.select('div.selection')
                .append('select');
        $select.selectAll('option')
            .data(sampleData)
            .enter()
            .append('option')
            .text(function(d){ return d; });
    });
    
    sample = 940

    d3.json('/sampledata/' + sample).then(function(data) {
    
        console.log(data.sample_values);


        var color = d3.schemeCategory10;
        
        var pie = d3.pie();
        
        var w = 800;
        var h = 600;
        
        var outerRadius = h/3;
        var innerRadius = 0;

        var arc =  d3.arc()
                     .innerRadius(innerRadius)
                     .outerRadius(outerRadius);


        var svg = d3.select('div#Main')
                    .append('svg')
                    .attr('id', 'pie_svg')
                    .attr('width', w)
                    .attr('height', h);

        var arcs = svg.selectAll("g.arc")
                      .data(pie(data.sample_values))
                      .enter()
                      .append("g")
                      .attr('class', 'arc')
                      .attr("transform", "translate(" + h/2  + ", " + h/2 + ")");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", function(d,i) {
                return color[i];
            })
            //.attr("d", arc);

        var _pie = arcs.append("text")
            .attr("transform", function(d, i) {
                var c = arc.centroid(d);
                var x = c[0];
                var y = c[1];
                var h = Math.sqrt(x*x + y*y);
                var a = "translate(" + arc.centroid(d)  + ")";
                var b = "translate(" + (x/h * (outerRadius + 30)) + ", "  + (y/h * (outerRadius + 30)) +  ")";
                return (d.endAngle - d.startAngle) > (Math.PI / 10) ?
                    a : b;
            })
            .attr("text-anchor", function(d) {
                return (d.endAngle - d.startAngle) > (Math.PI / 10) ?
                    "middle" : "start";
            })
            .text(function(d) {
                return d.value;
            })
            .style("font-size", "15px")
            .style("fill", function(d) {
                return (d.endAngle - d.startAngle) > (Math.PI / 10) ?
                    "white" : "black";
            });
        
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", w - 200)
            .attr("cy", function(d,i) {
                return (i * 50) + 25; 
            })
            .attr("r", 10)
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", function(d,i) {
                return color[i];
            });
        
        svg.selectAll('text')
            .data(data)
            .enter()
            .append('text')
            .attr('class', 'text1')
            .attr("x", w - 100)
            .attr("y", function(d,i) {
                return (i * 50) + 50;
            })
            .text(function(d,i) {
                return data.otu_id[i];
            });
        
        wb = 1050;
        hb = 270;
        var svg2 = d3.select('div#Main')
                    .append('svg')
                    .attr('id', 'bubble_svg')
                    .attr('width', wb)
                    .attr('height', hb);
    }); //function end
}

init();
