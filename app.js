const MAP_HEIGHT = 20;
const PUMP_RADIUS = 2.5;
const PUMP_COLOR = "green";

const DEATH_RADIUS = 3;
const DEATH_COLOR = "#ff000066";
const MALE_COLOR = "#7700ff66"
const FEMALE_COLOR = "#ff000066";

const viewBox = "0 0 500 500";
const WIDTH = 600;
const HEIGHT = 400;

var AGE_HASH_MAP = new Map();
AGE_HASH_MAP.set(0, "0-10")
AGE_HASH_MAP.set(1, "11-20")
AGE_HASH_MAP.set(2, "21-40")
AGE_HASH_MAP.set(3, "41-60")
AGE_HASH_MAP.set(4, "61-80")
AGE_HASH_MAP.set(5, ">80")

var DEATH_DAYS_LIST = undefined;
var DEATHS_AGE_SEX_LIST = undefined;
var PUMPS_LIST = undefined;
var DEATH_DATE_HASH_MAP = new Map();

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


function drawDeathCircles(death, radius) {
    if (death.gender==0) {
        drawCircle(death, radius, MALE_COLOR, deathsSVGContainer)
    } else {
        drawCircle(death, radius, FEMALE_COLOR, deathsSVGContainer)
    }
}

var pumpSVGContainer = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", viewBox)
    .classed("svg-content-responsive", true);


d3.csv("knowledge/pumps.csv", function(data) {
    PUMPS_LIST = data;
    data.forEach(element => {
        drawCircle(element, PUMP_RADIUS, PUMP_COLOR, pumpSVGContainer)
    });
});


var barChartContainer = d3.select("#main"),
            margin = 110,
            width = 750 - margin,
            height = barChartContainer.attr("height") - 250

var g = barChartContainer.append("g")
            .attr("transform", "translate(" + 70 + "," + 100 + ")");
            
d3.csv("knowledge/deathdays.csv", function(data) {
    DEATH_DAYS_LIST = data.slice(0);
    // drawBarChart(data, g);
    drawLineChart(data, g, width, height);
});

function displayAllDeaths() {
    d3.csv("knowledge/deaths_age_sex.csv", function(data) {
        DEATHS_AGE_SEX_LIST = data;
        drawCircles(data, DEATH_RADIUS, deathsSVGContainer, MAP_HEIGHT)
    });
}

displayAllDeaths();

// Define the div for the tooltip
var div = d3.select("body").append("div")	
    .attr("class", "tooltip")				
    .style("opacity", 0);

// Create Event Handlers for mouse
function handleMouseOverForLineChat(g,d) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(g)
    .attr("r", 7)
    .attr("class", "dot-selected");

    var month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d.date);
    var day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d.date);
    var dateString = `${day}-${month}`;
    filterDeathDaysByDateV2(dateString);

    // Specify where to put label of text
    d3.select(g)
    .append("text")
    .text(dateString);

    div.transition()		
        .duration(200)		
        .style("opacity", .9);		
    div	.html(dateString 
        + "<br/>"  
        + "<b>Deaths: </b>"+d.deaths
        + "<br/>"
        + "<b>Male: </b>"+DEATH_DATE_HASH_MAP.get(dateString).maleDeaths
        + "<br/>"
        + "<b>Female: </b>"+DEATH_DATE_HASH_MAP.get(dateString).femaleDeaths)	
        .style("left", (d3.event.pageX + 20) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");	
}

function handleMouseOutForLineChat(g,d) {
    // Use D3 to select element, change color back to normal
    d3.select(g)
    .attr("r", 5)
    .attr("class", "dot");

    deathsSVGContainer.selectAll("g").remove();
    displayAllDeaths();

    div.transition()		
    .duration(500)		
    .style("opacity", 0);	
    // Select text by id and then remove
    d3.select(g).selectAll("text").remove();  // Remove text location
}

function createDateDeathHashMap() {
    var sumOfDeathsTillDate = 0;
    var deathDays = [];
    d3.csv("knowledge/deathdays.csv", function(data) {
        data.forEach(element => {
            sumOfDeathsTillDate = sumOfDeathsTillDate + parseInt(element.deaths);
            var deathData = {
                sumOfDeathsTillDate: sumOfDeathsTillDate,
                deathsOnDate: element.deaths
            }
            DEATH_DATE_HASH_MAP.set(element.date, deathData);
        });
        data.forEach(element => {    
            var maleDeaths = 0;
            var femaleDeaths = 0;
            var ageRange = 0;
            var deathList = [];
            var deathsOnDate = DEATH_DATE_HASH_MAP.get(element.date).deathsOnDate;
            var sumOfDeathsTillDate = DEATH_DATE_HASH_MAP.get(element.date).sumOfDeathsTillDate;
            d3.csv("knowledge/deaths_age_sex.csv", function(data) {
                for (let index = 0; index < deathsOnDate; index++) {
                    deathList.push(data[sumOfDeathsTillDate-1+index]);
                    if (data[sumOfDeathsTillDate-1+index].gender==0) {
                        maleDeaths = maleDeaths+1;   
                    } else {
                        femaleDeaths = femaleDeaths+1;
                    }
                }
                DEATH_DATE_HASH_MAP.get(element.date)["deathList"] = deathList;
                DEATH_DATE_HASH_MAP.get(element.date)["maleDeaths"] = maleDeaths;
                DEATH_DATE_HASH_MAP.get(element.date)["femaleDeaths"] = femaleDeaths;
            });
        });
    });

}

createDateDeathHashMap();

function filterDeathDaysByDateV2(date) {
    console.log(date)
    deathsSVGContainer.selectAll("circle").remove();
    var deathsOnDate = DEATH_DATE_HASH_MAP.get(date).deathsOnDate;
    var sumOfDeathsTillDate = DEATH_DATE_HASH_MAP.get(date).sumOfDeathsTillDate;
    // drawCircles(DEATH_DATE_HASH_MAP.get(date).deathList, DEATH_RADIUS, deathsSVGContainer, MAP_HEIGHT)
    var calculatedRadius = (571)/deathsOnDate;
    calculatedRadius = calculatedRadius > 8 ? 8 : calculatedRadius;
    d3.csv("knowledge/deaths_age_sex.csv", function(data) {
        for (let index = 0; index < deathsOnDate; index++) {
            drawDeathCircles(data[sumOfDeathsTillDate-1+index], calculatedRadius);
        }
    });
}