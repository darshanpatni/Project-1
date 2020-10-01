
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
function drawMap(item, container) {
    var lineGraph = container.append("path")
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

function drawCircle(item, radius, color, container, legend) {
    var g = container
    .append("g")
    .attr("transform", function(d) {
        return "translate(" + MAP_HEIGHT*item.x + ","+ MAP_HEIGHT*item.y +")" ;
    })
    
    // .on("mouseover", function(){return handleMouseOver(this, item);})
    // .on("mouseout", function(){return handleMouseOut(this, item);});

    g.append("circle")
    .attr("r", radius)
    .attr("fill", function() {
        if(legend) {
            return circleColor(item, legend)
        } else {
            return color;
        }
    })
    .attr("stroke", "#7f7f7f");
}

function drawCircles(data, radius, container, scale, legend) {
    
    container.selectAll(".dot-map")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", ".dot-map")
        .attr("fill", function(d) {
            return circleColor(d, legend);
        })
        .attr("stroke", "#7f7f7f")
        .attr("cx", function(d, i) { 
            return scale*d.x })
        .attr("cy", function(d, i) { return scale*d.y })
        .attr("r", radius)
        .on("mouseover", function(item){return handleMouseOverForMap(this, item);})
        .on("mouseout", function(item){return handleMouseOutForMap(this, item);});
}

function circleColor(data, legend) {
    switch(legend) {
        case LEGEND_NONE:
            return DEATH_COLOR;
        case LEGEND_AGE:
            switch(parseInt(data.age)) {
                case AGE_1TO10:
                    return AGE_HASH_MAP.get(AGE_1TO10);
                case AGE_11TO20:
                    return AGE_HASH_MAP.get(AGE_11TO20);
                case AGE_21TO40:
                    return AGE_HASH_MAP.get(AGE_21TO40);
                case AGE_41TO60:
                    return AGE_HASH_MAP.get(AGE_41TO60);
                case AGE_61TO80:
                    return AGE_HASH_MAP.get(AGE_61TO80);
                default:
                    return AGE_HASH_MAP.get(AGE_80);
            }
        case LEGEND_SEX:
            if (data.gender==0) {
                return MALE_COLOR;
            } else {
                return FEMALE_COLOR;
            }
        default:
            return "#000"
    }
}

/**
 * Draw Bar Chart for death days
 * @param {deathdays csv data} data 
 */
function drawBarChart(data, svg) {
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

function drawLineChart(data, svg, width, height) {
    // parse the date / time
    var parseTime = d3.timeParse("%d-%b");

    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var valueline = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.deaths); });

    // format the data
    data.forEach(function(d) {
        d.date = parseTime(d.date);
        d.deaths = +d.deaths;
    });

    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.deaths; })]);

    // Add the valueline path.
    svg.append("path")
        .data([data])
        .attr("class", "line-chart")
        .attr("d", valueline);
    
    svg.selectAll(".dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function(d, i) { 
            return x(d.date) })
        .attr("cy", function(d, i) { return y(d.deaths) })
        .attr("r", 5)
        .on("mouseover", function(item){return handleMouseOverForLineChat(this, item);})
        .on("mouseout", function(item){return handleMouseOutForLineChat(this, item);});

    // Add the X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
        .call(d3.axisLeft(y));

    svg.selectAll(".domain")
    .attr("class", "axes");

    svg.selectAll(".tick")
    .selectAll("line")
    .attr("class", "axes");
}