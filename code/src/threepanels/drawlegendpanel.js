/*
	legend panel
*/

function LegendPanelRender(iId, objectGroupManager){

	var Info = {};

	Info.__init__ = function(iId, objectGroupManager){
		this.m_iId = iId;
		this.m_ObjectGroupManager = objectGroupManager;

		d3.select('#legend_p_' + this.m_iId)
		.append('svg')
		.attr('height', '100px')
		.attr('width', '100%');

		var boundingRect = d3.select('#legend_p_' + this.m_iId + ' svg')
							.node()
							.getBoundingClientRect();
		this.m_CenterPos = {
			'x' : boundingRect['width'] * 0.5,
			'y' : boundingRect['height'] * 0.5
		};

		this.m_SvgRectWidth = boundingRect['width'];
		this.m_SvgRectHeight = boundingRect['height'];

		this.m_repreEleBox = {
			'width': 30,
			'height': 30,
		}

		this.m_axisBox = {
			'width': 70,
			'height': 70,
		}

		this.m_arrowSide = 0.5;
		this.m_arrowCenter = 0.8;

		this.m_FontGap = 1;
		this.m_FontHeight = 10;
	}

	Info.drawLegend = function(iGroupId){		
		var self = this;
		//draw legend of group
		console.log(' draw legend iGroupId ', iGroupId);
		//get one ele
		var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		if(liEleId.length == 0){
			//remove
			d3.select('#legend_example')
			.remove();
			return;
		}else{
			//remove previous
			d3.select('#legend_example')
			.remove();
			//add new one
			var group = d3.select('#legend_p_' + self.m_iId  + ' svg')
			.append('g')
			.attr('id', 'legend_example')
		
			//get the first element		
			var originEle = self.m_ObjectGroupManager
							.g_ElementProperties
							.getElebyId(liEleId[0]);

			var repEle = originEle.cloneNode();

			self.drawRepreEle(repEle);

			group
			.append('circle')
			.attr('cx', self.m_CenterPos['x'])
			.attr('cy', self.m_CenterPos['y'])
			.attr('r', '2px')
			.attr('stroke', 'black');
		}
	}

	Info.drawRepreEle = function(repEle){

		var self = this;  

		if(repEle.tagName == 'line'){

			d3.select('#legend_example')
			.append('line')
			.attr('id', 'legend_element_example')
			.attr('x1', this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5)
			.attr('x2', this.m_CenterPos['x'] + this.m_axisBox['width'] * 0.5)
			.attr('y1', this.m_CenterPos['y'])
			.attr('y2', this.m_CenterPos['y'])
			.style('stroke-width', '2px')
			.style('stroke', 'black');

			//draw end points
			this.drawTextOn('[x1, y1]', 
			{
				'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] - this.m_FontGap * 6, 
			});

			this.drawTextOn('[x2, y2]', 
			{
				'x': this.m_CenterPos['x'] + this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] - this.m_FontGap * 6, 
			})

			this.drawLine({
				'x': this.m_CenterPos['x'] + this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] - this.m_FontGap * 5,
			},
			{
				'x': this.m_CenterPos['x'] + this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] + this.m_FontGap * 8,
			});

			this.drawLine({
				'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] - this.m_FontGap * 2,
			},
			{
				'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5,
				'y': this.m_CenterPos['y'] + this.m_FontGap * 8,
			});
			this.drawTextOn('width', {
				'x': this.m_CenterPos['x'],
				'y': this.m_CenterPos['y'] + this.m_FontGap * 15
			});
			// this.drawBoundaryLines();

		}else if(repEle.tagName == 'circle'){
			var radius = this.m_repreEleBox['width']/2.;
			//draw repre circle
			d3.select('#legend_example')
			.append('circle')
			.attr('cx', this.m_CenterPos['x'])
			.attr('cy', this.m_CenterPos['y'])
			.attr('r', radius)
			.attr('stroke', 'black')
			.attr('fill', 'none');

			//drawAxis
			this.drawAxes(true, true);
			//draw dash line to axis
			this.drawLineToXAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});
			this.drawLineToYAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});
			this.drawTextOn('cen-x', {'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y'] - this.m_axisBox['height'] * 0.5 - this.m_FontGap * 4.});
			this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90); //this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90);
			
			//draw radius tag
			var radiusangle = Math.PI/8.;			
			//draw radius line
			this.drawLine(
			{
				'x': this.m_CenterPos['x'],
				'y': this.m_CenterPos['y']
			},
			{
				'x': this.m_CenterPos['x'] + Math.cos(radiusangle) * radius,
				'y': this.m_CenterPos['y'] + Math.sin(radiusangle) * radius
			});
			// d3.select('#legend_example')
			// .append("line")
			// .attr('x1', this.m_CenterPos['x'])
			// .attr('y1', this.m_CenterPos['y'])
			// .attr('x2', this.m_CenterPos['x'] + Math.cos(radiusangle) * radius)
			// .attr('y2', this.m_CenterPos['y'] + Math.sin(radiusangle) * radius)
			// .style('stroke', 'black');

			this.drawCurveTo([
				{'x': this.m_CenterPos['x'] + Math.cos(radiusangle) * this.m_repreEleBox['width']/4., 'y': this.m_CenterPos['y'] + Math.sin(radiusangle) * this.m_repreEleBox['height']/4.},
				{'x': this.m_CenterPos['x'] + 1.3 * radius, 'y': this.m_CenterPos['y']}]);
				// {'x': this.m_CenterPos['x'] + this.m_repreEleBox['width']/2., 'y': this.m_CenterPos['y'] + Math.sin(0) * this.m_repreEleBox['height']/2.},]);
			this.drawTextOn('radius', {'x': this.m_CenterPos['x'] + 1.3 * radius + this.m_FontGap, 'y': this.m_CenterPos['y']}, undefined, 'left');
			//draw color tag
			// var colorrangle = Math.PI/3.;
			// this.drawCurveTo([
			// 	{'x': this.m_CenterPos['x'] + Math.cos(colorrangle) * this.m_repreEleBox['width']/4., 'y': this.m_CenterPos['y'] + Math.sin(colorrangle) * this.m_repreEleBox['height']/4.},
			// 	{'x': this.m_CenterPos['x'] + 1.3 * Math.cos(colorrangle) * this.m_repreEleBox['width']/2., 'y': this.m_CenterPos['y'] + 1.3 * Math.sin(colorrangle) * this.m_repreEleBox['height']/2.}]);
			// this.drawTextOn('color', {'x': this.m_CenterPos['x'] + 1.3 * Math.cos(colorrangle) * this.m_repreEleBox['width']/2. + this.m_FontGap, 'y': this.m_CenterPos['y'] + 1.3 * Math.sin(colorrangle) * this.m_repreEleBox['height']/2.}, undefined, 'left');
			return;
		}
		if(repEle.tagName == 'rect'){

			d3.select('#legend_example')
			.append('rect')
			.attr('id', 'legend_element_example')
			.attr('x', this.m_CenterPos['x'] - this.m_repreEleBox['width']/2.)
			.attr('y', this.m_CenterPos['y'] - this.m_repreEleBox['height']/2.)
			.attr('width', this.m_repreEleBox['width'])
			.attr('height', this.m_repreEleBox['height'])
			.style('stroke', 'black')
			.style('fill', 'none');
			this.drawAxes(true, true);

			this.drawLineToXAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});
			this.drawLineToYAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});

			this.drawTextOn('cen-x', {'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y'] - this.m_axisBox['height'] * 0.5 - this.m_FontGap * 4.});			
			this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90); //this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90);
				
			this.drawBoundaryLines();
			return;
		}
		if(repEle.tagName == 'path'){

			var domStyleProcessor = new DomStyleProcessor();
			domStyleProcessor.cleanDomPos(repEle);
			domStyleProcessor.analysisPath(repEle);
			
			//shift 
			var id = document.createAttribute('id');
			id.nodeValue = 'legend_element_example';
			repEle.attributes.setNamedItem(id);

			// console.log(" represent dom ", originEle, repEle);
			$('#legend_example')
			.append(repEle);

			var boxRect = $('#legend_element_example')[0].getBBox();
			var width = boxRect['width'], height = boxRect['height'];
			var left = boxRect['x'], top = boxRect['y'];

			d3.select('#legend_element_example')			
			.style('transform', function(){
				console.log(' transform ', 'translate(' + (self.m_CenterPos['x'] - left - width * 0.5) + 'px,' + (self.m_CenterPos['y'] - top - height * 0.5) + 'px)')
				return 'translate(' + (self.m_CenterPos['x'] - left - width * 0.5) + 'px,' + (self.m_CenterPos['y'] - top - height * 0.5) + 'px)';	
			});

			//drawAxis
			this.drawAxes(true, true);
			//draw dash line to axis
			this.drawLineToXAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});
			this.drawLineToYAxis({'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y']});
			//label
			this.drawTextOn('cen-x', {'x': this.m_CenterPos['x'], 'y': this.m_CenterPos['y'] - this.m_axisBox['height'] * 0.5 - this.m_FontGap * 4.});			
			this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90); //this.drawTextOn('cen-y', {'x': this.m_CenterPos['x'] - this.m_axisBox['width'] * 0.5  - this.m_FontGap - this.m_FontHeight, 'y': this.m_CenterPos['y']}, 90);
			//draw the boundary lines
			this.drawBoundaryLines();		
		}
	}

	Info.drawTextOn = function(label, cenPos, rotateDegree, anchor){
		if(rotateDegree == undefined)
			rotateDegree = 0;
		if(anchor == undefined)
			anchor = 'middle';
		d3.select('#legend_example')
		  .append('text')
		  .attr('class', 'cursor-pointer')
		  .text(label)
		  .attr('x', 0)
		  .attr('y', 0)
		  .attr('font-size', '12px')
		  .style('text-anchor', anchor)
		  .style('transform', function(){
		  	// console.log('transform: ', 'translate(' + cenPos['x'] + 'px,' + cenPos['y'] + 'px) rotate(' + rotateDegree + 'deg)');
		  	return 'translate(' + cenPos['x'] + 'px,' + cenPos['y'] + 'px) rotate(' + rotateDegree + 'deg)';
		  })
		  .on('mouseover', function(){
		  	d3.select(this)
		  	.style('fill', 'blue')
		  	.style('');
		  })
		  .on('mouseout', function(){
		  	d3.select(this).style('fill', 'black');
		  });

		 // d3.select('#legend_example')
		 // .append('rect')
		 // .attr('x', )
		 // .attr('y', )
		 // .attr('width', )
		 // .attr('height', )
		 // .style('fill', 'yellow');
	}

	Info.drawLineToXAxis = function(Pos){
		var ypos = this.m_CenterPos['y'] - this.m_axisBox['height']/2;	
		d3.select('#legend_example')
		.append('line')
		.style('stroke', 'red')
		.style('stroke-dasharray', '1 2')
		.attr('x1', Pos['x'])
		.attr('x2', Pos['x'])
		.attr('y1', Pos['y'])
		.attr('y2', ypos);
	}

	Info.drawCurveTo = function(pointList){
		var line = d3.svg.line()
				    .x(function(d) {
				      return d.x;
				    })
				    .y(function(d) {
				      return d.y;
				    })
				    .interpolate('cardinal');

	   d3.select('#legend_example').append('path')
			    .attr({
				      'd': line(pointList),
				      'y': 0,
				      'stroke': 'gray',
				      'stroke-width': '1px',
				      'fill': 'none'
			    });
	}

	Info.drawLineToYAxis = function(Pos){
		var xpos = this.m_CenterPos['x'] - this.m_axisBox['width']/2;	
		d3.select('#legend_example')
		.append('line')
		.style('stroke', 'red')
		.style('stroke-dasharray', '1 2')
		.attr('x1', Pos['x'])
		.attr('x2', xpos)
		.attr('y1', Pos['y'])
		.attr('y2', Pos['y']);
	}

	Info.drawAxes = function(xOn, yOn){

		var line = d3.svg.line()
					    .x(function(d) {
					      return d.x;
					    })
					    .y(function(d) {
					      return d.y;
					    })
					    .interpolate('linear-closed');
		if(xOn){
			var left = this.m_CenterPos['x'] - this.m_axisBox['width']/2;
			var right = this.m_CenterPos['x'] + this.m_axisBox['width']/2;
			var ypos = this.m_CenterPos['y'] - this.m_axisBox['height']/2;
			d3.select('#legend_example')
			.append('line')
			.style('stroke', 'black')
			.attr('x1', left)
			.attr('x2', right)
			.attr('y1', ypos)
			.attr('y2', ypos);

			//arrow
			var arrowpointlist = [
				{'x': right, 'y': ypos - this.m_arrowSide},
				{'x': right, 'y': ypos + this.m_arrowSide},
				{'x': right + this.m_arrowCenter, 'y': ypos}
			];

		    d3.select('#legend_example').append('path')
		    .attr({
			      'd': line(arrowpointlist),
			      'y': 0,
			      'stroke': '#000',
			      'stroke-width': '5px',
			      'fill': 'none'
		    });

		}
		if(yOn){
			var bottom = this.m_CenterPos['y'] + this.m_axisBox['width']/2;
			var xpos = this.m_CenterPos['x'] - this.m_axisBox['width']/2;
			d3.select('#legend_example')
			.append('line')
			.style('stroke', 'black')
			.attr('x1', xpos)
			.attr('x2', xpos)
			.attr('y1', this.m_CenterPos['y'] - this.m_axisBox['width']/2)
			.attr('y2', bottom);

			//arrow
			var arrowpointlist = [
				{'x': xpos - this.m_arrowSide, 'y': bottom},
				{'x': xpos + this.m_arrowSide, 'y': bottom},
				{'x': xpos, 'y': bottom + this.m_arrowCenter}
			];

		    d3.select('#legend_example').append('path')
		    .attr({
			      'd': line(arrowpointlist),
			      'y': 0,
			      'stroke': '#000',
			      'stroke-width': '5px',
			      'fill': 'none'
		    });
		}			
	}

	Info.drawLine = function(point1, point2){
		d3.select('#legend_example')
		.append('line')
		.style('stroke', 'black')
		.style('stroke-dasharray', '1 2')
		.attr('x1', point1.x)
		.attr('x2', point2.x)
		.attr('y1', point1.y)
		.attr('y2', point2.y);
	}

	Info.drawBoundaryLines = function(){

		var boxRect = $('#legend_element_example')[0].getBBox();

		var padding = 15;
		var left_padding = boxRect['x'] - padding;
		var right_padding = boxRect['x'] + boxRect['width'] + padding;
		var top_padding = boxRect['y'] - padding;
		var bottom_padding = boxRect['y'] + boxRect['height'] + padding;

		//top
		this.drawLine({
			'x': this.m_CenterPos['x'] - (boxRect['width'] * 0.5 + padding), 'y': this.m_CenterPos['y'] - boxRect['height'] * 0.5,
		},
		{
			'x': this.m_CenterPos['x'] + (boxRect['width'] * 0.5 + padding), 'y': this.m_CenterPos['y'] - boxRect['height'] * 0.5,
		});
		//bottom
		this.drawLine({
			'x': this.m_CenterPos['x'] - (boxRect['width'] * 0.5 + padding), 'y': this.m_CenterPos['y'] + boxRect['height'] * 0.5,
		},
		{
			'x': this.m_CenterPos['x'] + (boxRect['width'] * 0.5 + padding), 'y': this.m_CenterPos['y'] + boxRect['height'] * 0.5,
		});
		//left
		this.drawLine({
			'x': this.m_CenterPos['x'] - (boxRect['width'] * 0.5), 'y': this.m_CenterPos['y'] - (boxRect['height'] * 0.5 + padding),
		},
		{
			'x': this.m_CenterPos['x'] - (boxRect['width'] * 0.5), 'y': this.m_CenterPos['y'] + (boxRect['height'] * 0.5 + padding),
		});
		//right
		this.drawLine({
			'x': this.m_CenterPos['x'] + (boxRect['width'] * 0.5), 'y': this.m_CenterPos['y'] - (boxRect['height'] * 0.5 + padding),
		},
		{
			'x': this.m_CenterPos['x'] + (boxRect['width'] * 0.5), 'y': this.m_CenterPos['y'] + (boxRect['height'] * 0.5 + padding),
		});

		//text
		this.drawTextOn('height', 
			{'x': this.m_CenterPos['x'] + boxRect['width'] * 0.5 + this.m_FontGap * 4, 
			 'y': this.m_CenterPos['y']
			}, undefined, 'left');			

		this.drawTextOn('width', 
			{'x': this.m_CenterPos['x'], 
			 'y': this.m_CenterPos['y'] + boxRect['height'] * 0.5 + this.m_FontGap * 10.
			});			
	}

	Info.__init__(iId, objectGroupManager);
	return Info;
}
