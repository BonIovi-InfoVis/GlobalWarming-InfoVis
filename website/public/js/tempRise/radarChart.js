
function RadarChart(id, options, jsonTemp) {
	var cfg = {
	 w: 600,				//Width of the circle
	 h: 600,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
	 maxValue: 0, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 4, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 3, 		//The width of the stroke around each blob
	 roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10()	//Color function
	};
	
	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if

    function leapYear(year) {
        return ((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0);
    };

    function convertDecimalDate(decimalDate) {
        var year = parseInt(decimalDate);
        var reminder = decimalDate - year;
        var daysPerYear = leapYear(year) ? 366 : 365;
        var miliseconds = reminder * daysPerYear * 24 * 60 * 60 * 1000;
        var yearDate = new Date(year, 0, 1);
        return new Date(yearDate.getTime() + miliseconds);
    }

	/////////////////////////////////////////////////////////
	//////////////RADAR DRAWING - DATA INDEPENDENT///////////
	/////////////////////////////////////////////////////////

	//In Celsius degree
	var maxValue = 2,
        minValue = -1;

    months = ["Jenuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dicember"];
		
	var allAxis = months,	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('C'),			 	//Celsius degree formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"
	
	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([minValue, maxValue]);
		
	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();
	
	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element		
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");
	
	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////
	
	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////
	
	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");
	
	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");

	//Text indicating at what Celsius degree each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(maxValue * d/cfg.levels); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////
	
	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);
	
	/////////////////////////////////////////////////////////
	////////////////////END DRAWING RADAR////////////////////
	/////////////////////////////////////////////////////////

	/////////////////////////////////////////////////////////
	//////////////DRAWING PATH - DATA DEPENDENT//////////////
	/////////Using different batches to upload data//////////
	/////////////////////////////////////////////////////////

	var saturationScale = d3.scale.linear()
    .domain([1880, 2017])
    .range([0, 1]);

	var hueScale = d3.scale.linear()
    .domain([1880, 2017])
    .range([100, 0]);
	
	//The radial line function
	var radarLine = d3.svg.line.radial()
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d) { return convertDecimalDate(d.date).getMonth()*angleSlice; });

	var yearWrapper = g.selectAll(".axisWrapper").append("g")
		.attr("class", "yearWrapper")
		.append("text")
		.attr('x', -22)
		.attr('y', 0)
		.attr('fill', '#000')
		.attr("class", "yearText");
	
	// Drawing function
	var drawLineForData = function(current, next) {
		
		var blobWrapper = g.selectAll(".axisWrapper")
		.data([current, next])
		.enter().append("g")
		.attr("class", "radarWrapper");

		var	path = blobWrapper.append("path")
				.attr("class", "radarStroke")
				.attr("d", radarLine([current, next]))
				.style("stroke-width", cfg.strokeWidth + "px")
				.style("stroke", function(d){
					var colorLine = d3.hsl("#3170d6");
					//colorLine.s = saturationScale(convertDecimalDate(d.date).getYear() + 1900);
					colorLine.h = hueScale(convertDecimalDate(d.date).getYear() + 1900);
					return colorLine;})
				.style("fill", "none")
				.style("opacity", 0.5);
				//.style("filter" , "url(#glow)");
			

		yearWrapper.text(convertDecimalDate(current.date).getYear() + 1900 );
				
		//Wrapper for the invisible circles on top
		var blobCircleWrapper = g.selectAll(".axisWrapper")
			.data([current, next])
			.enter().append("g")
			.attr("class", "radarCircleWrapper");
			
		//Append a set of invisible circles on top for the mouseover pop-up
		blobCircleWrapper.selectAll(".radarInvisibleCircle")
			.data([current, next])
			.enter().append("circle")
			.attr("class", "radarInvisibleCircle")
			.attr("r", cfg.dotRadius*1.5)
			.attr("cx", function(d){ return rScale(d.value) * Math.cos(angleSlice*convertDecimalDate(d.date).getMonth() - Math.PI/2); })
			.attr("cy", function(d){ return rScale(d.value) * Math.sin(angleSlice*convertDecimalDate(d.date).getMonth() - Math.PI/2); })
			.style("fill", "none")
			.style("pointer-events", "all")
			.on("mouseover", function(d) {
				newX =  parseFloat(d3.select(this).attr('cx')) - 10;
				newY =  parseFloat(d3.select(this).attr('cy')) - 10;
						
				tooltip
					.attr('x', newX)
					.attr('y', newY)
					.text(Format(d.value))
					.transition().duration(200)
					.style('opacity', 1);
			})
			.on("mouseout", function(){
				tooltip.transition().duration(200)
					.style("opacity", 0);
			});
			
		//Set up the small tooltip for when you hover over a circle
		var tooltip = g.append("text")
			.attr("class", "tooltip")
			.style("opacity", 0);
	}
	
	// Global index to browse data
	var index = 0;
	
	// Drawing lines
	setInterval(function() {
		//console.log(index);
		if(+index+1 < jsonTemp.length){
			drawLineForData(jsonTemp[index], jsonTemp[+index+1]);
			index++;
		}
	}, 50);
	
	
	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
			
		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap	
}//RadarChart