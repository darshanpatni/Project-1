const MAP_HEIGHT = 20;
const PUMP_RADIUS = 2.5;
const PUMP_COLOR = "green";

const DEATH_RADIUS = 3;
const DEATH_COLOR = "#ff000066";

const viewBox = "0 0 500 500";
const WIDTH = 600;
const HEIGHT = 400;

var mapSVGContainer = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", viewBox)
    .classed("svg-content-responsive", true);

d3.json("knowledge/streets.json", function(data) {
    data.forEach(element => {
        drawMap(element, mapSVGContainer)
    });
});

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

var deathsSVGContainer = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", viewBox)
    .classed("svg-content-responsive", true);

d3.csv("knowledge/deaths_age_sex.csv", function(data) {
    data.forEach(element => {
        drawCircle(element, DEATH_RADIUS, DEATH_COLOR, deathsSVGContainer)
    });
})

var pumpSVGContainer = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", viewBox)
    .classed("svg-content-responsive", true);


d3.csv("knowledge/pumps.csv", function(data) {
    data.forEach(element => {
        drawCircle(element, PUMP_RADIUS, PUMP_COLOR, pumpSVGContainer)
    });
});

var barChartContainer = d3.select("#main"),
            margin = 110,
            width = barChartContainer.attr("width") - margin,
            height = barChartContainer.attr("height") - 250


var xScale = d3.scaleBand().range([0, width]).padding(0.4),
            yScale = d3.scaleLinear().range([height, 0]);

var g = barChartContainer.append("g")
            .attr("transform", "translate(" + 100 + "," + 100 + ")");
            
d3.csv("knowledge/deathdays.csv", function(data) {
    drawBarChart(data, g);
});