const MAP_HEIGHT = 20;
const PUMP_RADIUS = 4;
const PUMP_COLOR = "#20272F";

const DEATH_RADIUS = 3;
const DEATH_COLOR = "#ff000099";
const MALE_COLOR = "#256676cc"
const FEMALE_COLOR = "#b6e45ccc";

const viewBox = "0 0 500 400";
const WIDTH = 600;
const HEIGHT = 400;

const LEGEND_NONE = 1;
const LEGEND_AGE = 2;
const LEGEND_SEX = 3;

const LEGEND_NONE_ID = "none-legend";
const LEGEND_SEX_ID = "sex-legend";
const LEGEND_AGE_ID = "age-legend";

const AGE_1TO10 = 0;
const AGE_11TO20 = 1;
const AGE_21TO40 = 2;
const AGE_41TO60 = 3;
const AGE_61TO80 = 4;
const AGE_80 = 5;

var AGE_HASH_MAP = new Map();
AGE_HASH_MAP.set(AGE_1TO10, "#4f8c9d99")
AGE_HASH_MAP.set(AGE_11TO20, "#94d2cf99")
AGE_HASH_MAP.set(AGE_21TO40, "#0b522e99")
AGE_HASH_MAP.set(AGE_41TO60, "#4cf18599")
AGE_HASH_MAP.set(AGE_61TO80, "#35972199")
AGE_HASH_MAP.set(AGE_80, "#bde26799")

var DEATH_DAYS_LIST = [];
var DEATHS_AGE_SEX_LIST = [];
var PUMPS_LIST = [];
var DEATH_DATE_HASH_MAP = new Map();

var selectedLegend = 1;

function onLegendUpdate() {
    var eID = document.getElementById("legend-selector");
    selectedLegend = parseInt(eID.options[eID.selectedIndex].value);
    if(deathsSVGContainer!=null) {
        deathsSVGContainer.selectAll("g").remove();
    }
    displayAllDeaths();
    displayLegend(selectedLegend);
}

showDefaultLegend();

function displayLegend(legend) {
    switch(legend) {
        case LEGEND_NONE:
            showDefaultLegend();
            break;
        case LEGEND_SEX:
            showSexLegend();
            break;
        case LEGEND_AGE:
            showAgeLegend();
            break;
    }
}

function showDefaultLegend() {
    document.getElementById(LEGEND_NONE_ID).style.display = "block";
    document.getElementById(LEGEND_SEX_ID).style.display = "none";
    document.getElementById(LEGEND_AGE_ID).style.display = "none";
}

function showSexLegend() {
    document.getElementById(LEGEND_SEX_ID).style.display = "block";
    document.getElementById(LEGEND_NONE_ID).style.display = "none";
    document.getElementById(LEGEND_AGE_ID).style.display = "none";
}

function showAgeLegend() {
    document.getElementById(LEGEND_AGE_ID).style.display = "block";
    document.getElementById(LEGEND_SEX_ID).style.display = "none";
    document.getElementById(LEGEND_NONE_ID).style.display = "none";
}

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


function drawDeathCircles(death, radius) {
    if (death.gender==0) {
        drawCircle(death, radius, MALE_COLOR, deathsSVGContainer, selectedLegend)
    } else {
        drawCircle(death, radius, FEMALE_COLOR, deathsSVGContainer, selectedLegend)
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

var deathsSVGContainer = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", viewBox)
    .classed("svg-content-responsive", true);

function displayAllDeaths() {
    d3.csv("knowledge/deaths_age_sex.csv", function(data) {
        drawCircles(data, DEATH_RADIUS, deathsSVGContainer, MAP_HEIGHT, selectedLegend)
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
    console.log(d)
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

function getAgeRangeInString(sex) {
    switch(parseInt(sex)) {
        case AGE_1TO10:
            return "1 to 10";
        case AGE_11TO20:
            return "11 to 20";
        case AGE_21TO40:
            return "21 to 40";
        case AGE_41TO60:
            return "41 to 60";
        case AGE_61TO80:
            return "61 to 80";
        case AGE_80:
            return "> 80";
    }
}

// Create Event Handlers for mouse
function handleMouseOverForMap(g,d) {  // Add interactivity
    // Use D3 to select element, change color and size
    d3.select(g)
    .attr("fill", "orange")
    .attr("r", 6);

    // // Specify where to put label of text
    // var month = new Intl.DateTimeFormat('en', { month: 'short' }).format(d.date);
    // var day = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(d.date);
    // var dateString = `${day}-${month}`;


    d3.select(g)
    .append("text")
    .text("dateString");

    div.transition()		
        .duration(200)		
        .style("opacity", .9);	
    div	.html(
        + "<b>Sex: </b>"+ d.gender==0 ? "Male": "Female"
        + "<br/>"
        + "<b>Age: </b>"+getAgeRangeInString(d.age))
        .style("left", (d3.event.pageX + 20) + "px")		
        .style("top", (d3.event.pageY - 28) + "px");	
}

function handleMouseOutForMap(g,d) {
    // Use D3 to select element, change color back to normal
    d3.select(g)
    .attr("fill",circleColor(d, selectedLegend))
    .attr("r", DEATH_RADIUS);
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
                    var death = data[sumOfDeathsTillDate-1+index];
                    death["date"] = element.date;
                    DEATHS_AGE_SEX_LIST.push(death);
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
            drawDeathCircles(data[sumOfDeathsTillDate-1+index], DEATH_RADIUS);
        }
    });
}
