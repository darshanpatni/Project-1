var MAP_HEIGHT = 20;
var PUMP_RADIUS = 3;
var PUMP_COLOR = "orange";

var mapSVGContainer = d3.select("div")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 400")
    .classed("svg-content-responsive", true);

var drawLine = d3.svg.line()
.x(function(d) { return MAP_HEIGHT*d.x; })
.y(function(d) { return MAP_HEIGHT*d.y; })
.interpolate("linear");

function drawMap(item) {
    var lineGraph = mapSVGContainer.append("path")
    .attr("d", drawLine(item))
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("fill", "white")
    .classed("line", true)
    .attr("width", 600)
    .attr("height", 400);
}

d3.json("knowledge/streets.json", function(data) {
    data.forEach(drawMap);
});

var pumpSVGContainer = d3.select("div")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 400")
    .classed("svg-content-responsive", true);

var circles = pumpSVGContainer.selectAll("circle")
                        .append("circle");
                        
function drawPumps(item) {
    var g = pumpSVGContainer
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + MAP_HEIGHT*item.x + ","+ MAP_HEIGHT*item.y +")" ;
        })
        // .on("mouseover", function(){return handleMouseOver(this, item);})
        // .on("mouseout", function(){return handleMouseOut(this, item);});

        g.append("circle")
        .attr("r", PUMP_RADIUS)
        .attr("fill",PUMP_COLOR)
        .attr("width", 600)
        .attr("height", 400)
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
d3.csv("knowledge/pumps.csv", function(data) {
    data.forEach(drawPumps);
});