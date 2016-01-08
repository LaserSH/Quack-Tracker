
//Function for click and toggle between pie view and column view
$(document).ready(function() {

    initialize();

    $("#column-view").click(function(){
        $('#pie-chart svg').remove();
        $('#pieToolTip').remove();
        createColumnChart();
    });

    $("#pie-view").click(function(){
        $('#column-chart svg').remove();
        $('#columnToolTip').remove();
        createPieChart();
    });
});

// Below are for the data visualization part using json
var items;
var timeArray = [];
var domainArray = [];

// Data import and processing part
function initialize(){

    var data = JSON.parse(localStorage.sites);

    // Create items array
    items = Object.keys(data).map(function(key) {
        return [key, data[key]];
    });

// Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    if (items.length > 20) {
        var otherTimeTotal = 0;
        var length = items.length;
        for(var i = 20; i < length; i++) {
            otherTimeTotal += items[i][1];
        }
        items = items.slice(0,19);
        items.push(["Others", otherTimeTotal]);
    }

    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    for(var i = 0; i < items.length; i++) {
        timeArray.push(items[i][1]);
        domainArray.push(items[i][0]);
    }
}

// Visualization for the pie view
function createPieChart(){
    var width = 400,
        height = 400,
        radius = 200,
        donutRadius = 120;
        colors = d3.scale.category20c();

    var pie = d3.layout.pie()
        .value(function(d) {
            return d[1];
        })

    var arc = d3.svg.arc()
        .innerRadius(donutRadius)
        .outerRadius(radius)

    var tooltip = d3.select('body').append('div')
        .attr('id', 'pieToolTip')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style('opacity', 0)

    var pieChart = d3.select('#pie-chart').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate('+(width-radius)+','+(height-radius)+')')
        .selectAll('path').data(pie(items))
        .enter().append('g')
        .attr('class', 'slice')

    var slices = d3.selectAll('g.slice')
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d, i) {
            return colors(i);
        })
        .on('mouseover', function(d,i) {

            tooltip.transition()
                .style('opacity', .9)

            tooltip.html(domainArray[i])
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top',  (d3.event.pageY - 30) + 'px')

            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .5)
                .style('fill', 'yellow')
        })
        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
        })
        .transition()
          .duration(2000)
          .attrTween("d", tweenPie);

    function tweenPie(b) {
        var i = d3.interpolate({startAngle: 0, endAngle: 0}, b);
        return function(t) { return arc(i(t)); };
    }

    d3.select('#pie-chart').select('svg')
        .append("svg:image")
        .attr("xlink:href", "img/icon128.png")
        .attr("x", "140")
        .attr("y", "140")
        .attr("width", "128")
        .attr("height", "128");

/*
var text = d3.selectAll('g.slice')
    .append('text')
    .text(function(d, i) {
        return d.data[0];
    })
    .attr('text-anchor', 'middle')
    .attr('fill', 'white')
    .attr('transform', function(d) {
        d.innerRadius = 0;
        d.outerRadius = radius;
        return 'translate('+ arc.centroid(d)+')'
    });
*/
}

// Below is for the column view.
function createColumnChart(){
    var margin = { top: 30, right: 30, bottom: 40, left:80 }

    var height = 400 - margin.top - margin.bottom,
        width = 600 - margin.left - margin.right,
        barWidth = 50,
        barOffset = 5;

    var tempColor;

    var colors = d3.scale.linear()
        .domain([0, timeArray.length*.33, timeArray.length*.66, timeArray.length])
        .range(['#B58929','#C61C6F', '#268BD2', '#85992C'])

    var yScale = d3.scale.linear()
        .domain([0, d3.max(timeArray)])
        .range([0, height]);

    var xScale = d3.scale.ordinal()
        .domain(d3.range(0, timeArray.length))
        .rangeBands([0, width], 0.2)

    var tooltip = d3.select('body').append('div')
        .attr('id', 'columnToolTip')
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style('opacity', 0)

    var columnChart = d3.select('#column-chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate('+ margin.left +', '+ margin.top +')')
        .selectAll('rect').data(timeArray)
        .enter().append('rect')
            .style('fill', function(d,i) {
                return colors(i);
            })
            .attr('width', xScale.rangeBand())
            .attr('x', function(d,i) {
                return xScale(i);
            })
            .attr('height', 0)
            .attr('y', height)

        .on('mouseover', function(d,i) {

            tooltip.transition()
                .style('opacity', .9)

            tooltip.html(domainArray[i])
                .style('left', (d3.event.pageX - 35) + 'px')
                .style('top',  (d3.event.pageY - 30) + 'px')


            tempColor = this.style.fill;
            d3.select(this)
                .style('opacity', .5)
                .style('fill', 'yellow')
        })

        .on('mouseout', function(d) {
            d3.select(this)
                .style('opacity', 1)
                .style('fill', tempColor)
        })

    columnChart.transition()
        .attr('height', function(d) {
            return yScale(d);
        })
        .attr('y', function(d) {
            return height - yScale(d);
        })
        .delay(function(d, i) {
            return i * 20;
        })
        .duration(1000)
        .ease('elastic')

    d3.select('#column-chart').select('svg')
        .append("svg:image")
        .attr("xlink:href", "img/icon128.png")
        .attr("x", "400")
        .attr("y", "40")
        .attr("width", "128")
        .attr("height", "128");

    var vGuideScale = d3.scale.linear()
        .domain([0, d3.max(timeArray)])
        .range([height, 0])

    var vAxis = d3.svg.axis()
        .scale(vGuideScale)
        .orient('left')
        .ticks(10)

    var vGuide = d3.select('svg').append('g')
        vAxis(vGuide)
        vGuide.attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
        vGuide.selectAll('path')
            .style({ fill: 'none', stroke: "#000"})
        vGuide.selectAll('line')
            .style({ stroke: "#000"})

    var hAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')

    var hGuide = d3.select('svg').append('g')
        hAxis(hGuide)
        hGuide.attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
        hGuide.selectAll('path')
            .style({ fill: 'none', stroke: "#000"})
        hGuide.selectAll('line')
            .style({ stroke: "#000"})
}
