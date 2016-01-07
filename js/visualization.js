

var timeArray = [];
var domainArray = [];

var data = JSON.parse(localStorage.sites);

// Create items array
var items = Object.keys(data).map(function(key) {
    return [key, data[key]];
});

// Sort the array based on the second element
items.sort(function(first, second) {
    return second[1] - first[1];
});
items = items.filter(function(item) {
    return item[1] >= 60;
});

for(var i = 0; i < items.length; i++) {
    timeArray.push(items[i][1]);
    domainArray.push(items[i][0]);
}

var width = 400,
    height = 400,
    radius = 200,
    colors = d3.scale.category20c();

var pie = d3.layout.pie()
    .value(function(d) {
        return d[1];
    })

var arc = d3.svg.arc()
    .outerRadius(radius)

var myChart1 = d3.select('#chart1').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate('+(width-radius)+','+(height-radius)+')')
    .selectAll('path').data(pie(items))
    .enter().append('g')
        .attr('class', 'slice')

var slices = d3.selectAll('g.slice')
        .append('path')
        .attr('fill', function(d, i) {
            return colors(i);
        })
        .attr('d', arc)
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
        .style('position', 'absolute')
        .style('padding', '0 10px')
        .style('background', 'white')
        .style('opacity', 0)

var myChart2 = d3.select('#chart2').append('svg')
        .style('background', '#E7E0CB')
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

    myChart2.transition()
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
