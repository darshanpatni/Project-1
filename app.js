var MAP_HEIGHT = 20;

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
    var circles = pumpSVGContainer
                        .append("circle")
                        .attr("cx", MAP_HEIGHT*item.x)
                        .attr("cy", MAP_HEIGHT*item.y)
                        .attr("r", 2)
                        .attr("fill", "red")
                        .style("fill", "red")
                        .attr("width", 600)
                        .attr("height", 400);
}

d3.csv("knowledge/pumps.csv", function(data) {
    data.forEach(drawPumps);
});