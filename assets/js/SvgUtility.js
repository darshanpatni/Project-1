/**
 * CODE FOR DRAWING MAP
 */
//Draw lines for map
var drawLine = d3.line()
.x(function(d) { return MAP_HEIGHT*d.x; })
.y(function(d) { return MAP_HEIGHT*d.y; })
.curve(d3.curveLinear);

/**
 *Draw map function 
 *parameter - one pair of xy co-ordinates
 */
function drawMap(item) {
    var lineGraph = mapSVGContainer.append("path")
    .attr("d", drawLine(item))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "white")
    .classed("line", true);
}


// Create Event Handlers for mouse
function handleMouseOver(g,d) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(g).select("circle").attr({
        fill: "orange",
        r: PUMP_RADIUS * 2
    });

    // Specify where to put label of text
    d3.select(g)
    .append("text")
    .text("Pump");
}

function handleMouseOut(g,d) {
    // Use D3 to select element, change color back to normal
    d3.select(g).select("circle").attr({
        fill: PUMP_COLOR,
        r: PUMP_RADIUS
    });

    // Select text by id and then remove
    d3.select(g).selectAll("text").remove();  // Remove text location
}

/**
 * Draw circles on map
 * @param {x,y coordinates} item 
 */

function drawCircle(item, radius, color) {
    var g = deathsSVGContainer
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + MAP_HEIGHT*item.x + ","+ MAP_HEIGHT*item.y +")" ;
        })
        
        // .on("mouseover", function(){return handleMouseOver(this, item);})
        // .on("mouseout", function(){return handleMouseOut(this, item);});

        g.append("circle")
        .attr("r", radius)
        .attr("fill",color);
}

/**
 * Draw Bar Chart for death days
 * @param {deathdays csv data} data 
 */
function drawBarChart(data) {
    var maxValue = 0;
    d3.max(data, function(d) {
    
        if(parseInt(d.deaths)>parseInt(maxValue)) {
            maxValue = d.deaths;
        }
    });

    xScale.domain(data.map(function(d) { return d.date; }));
    yScale.domain([0, maxValue]);

    g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("dx", "-2.8em")
    .attr("dy", "-.55em")
    .attr("transform", "rotate(-90)" );


    g.append("g")
    .call(d3.axisLeft(yScale).tickFormat(function(d){
        return d;
    })
    .ticks(10))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", "-5.1em")
    .attr("text-anchor", "end")
    .attr("stroke", "black");

    g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.date); })
    .attr("y", function(d) { return yScale(d.deaths); })
    .attr("width", xScale.bandwidth())
    .attr("height", function(d) { return height - yScale(d.deaths); });
}