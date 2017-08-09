/*
Decode Visualization
*/

function VisDecoder(){
	var Info = {};

	Info.__init__ = function(){
		console.log(' init decoder ');
		this.m_DecodeMethod = ''; //decode_pos, _rule, _bound, _legend

		this.m_InDecodMode = false;
		this.m_DecodeDiv = {};
		this.m_DecodeDivSvg = {};

		//interact recorder
		this.m_PosCurrentHoverEleId = -1;
		this.m_PosCurrentSelectEleId = -1;
		this.m_PosCurrentEleCenPos = {};
		this.m_PosInteractStage = "";

		//DOM
		this.m_DecodeGroupId = 'decode-group';
	}


	//clear the temp objects when hovering
	Info.clearTemp = function(){
		d3.selectAll('.decodetemp').remove();
	}

	Info.setDecodeMethod = function(decodeMethod){
		this.m_DecodeMethod = decodeMethod;
		//enter decode method
		this.enterDecodeMode();
	}

	Info.isInDecodeMode = function(){
		return this.m_InDecodMode;
	}

	Info.isTargetEleSelected = function(){
		var self = this;
		if(self.m_DecodeMethod == 'decode_pos'){
			if(this.m_PosCurrentSelectEleId != -1){
				return true;
			}
			return false;
		}else if(self.m_DecodeMethod == 'decode_rule'){			
			if(this.m_PosCurrentSelectEleId != -1){
				return true;
			}
			return false;
		}else if(self.m_DecodeMethod == 'decode_bound'){
			//todo
		}else if(self.m_DecodeMethod == 'decode_legend'){
			//todo
		}
		return false;
	}

	Info.unsetDecodeMethod = function(){
		this.exitDecodeMode();
	}

	Info.addDecodeDiv = function(){
		var svgwidth =  document.body.scrollWidth;
		var svgheight = document.body.scrollHeight;	
	}

	//cover an decode-div
	Info.enterDecodeMode = function(){
		this.m_InDecodMode = true;
		$('#addondiv').css({
			'background': 'rgba(244, 67, 54, 0.1)',
		});

		d3.select('#' + this.m_DecodeGroupId)
		.remove();

		d3.select('#addondiv svg')
		.append('g')
		.attr('id', this.m_DecodeGroupId);

		g_ToolBarManager.m_ToolBarRender.resetVLineUpButton();
		g_ToolBarManager.m_ToolBarRender.resetHLineUpButton();
	}

	Info.resetDecodeMode = function(){		

		d3.select('#' + this.m_DecodeGroupId).remove();
		this.m_InDecodMode = false;

		this.m_PosCurrentHoverEleId = -1;
		this.m_PosCurrentSelectEleId = -1;
		this.m_PosCurrentEleCenPos = {};
		this.m_PosInteractStage = "";
	}

	//uncover an decode-div
	Info.exitDecodeMode = function(){
		//remove the DOM
		$('#addondiv').css({
			'background': 'rgba(255, 195, 74, 0.1)',
		});

		d3.select('#' + this.m_DecodeGroupId).remove();
		this.m_InDecodMode = false;

		this.m_PosCurrentHoverEleId = -1;
		this.m_PosCurrentSelectEleId = -1;
		this.m_PosCurrentEleCenPos = {};
		this.m_PosInteractStage = "";
	}

	Info.hoverTargetObj = function(iEleId){
		var self = this;
		if(self.m_DecodeMethod == 'decode_pos'){
			self.m_PosCurrentHoverEleId = iEleId;
			if(self.m_PosCurrentSelectEleId == -1){
				self.drawCenterPos(iEleId);					
			}
			console.log("[Decode Mode] hover target ", self.m_PosCurrentHoverEleId, self.m_PosCurrentSelectEleId);
		}else if(self.m_DecodeMethod == 'decode_rule'){			
			self.m_PosCurrentHoverEleId = iEleId;
			if(self.m_PosCurrentSelectEleId == -1){
				self.drawBoundaryRect(iEleId);					
			}
		}else if(self.m_DecodeMethod == 'decode_bound'){
			//todo
		}else if(self.m_DecodeMethod == 'decode_legend'){
			//todo
		}
	}

	//mouse event
	Info.handleMouseDown = function(pos){

		var self = this;
		console.log("[Decode Mode] handle mouse down ", self.m_PosCurrentHoverEleId, self.m_PosCurrentSelectEleId);

		if(self.m_DecodeMethod == 'decode_pos'){
			if(self.m_PosCurrentHoverEleId == -1){				
				console.log(' [Decode Mode] 0');
				return;
			}else{
				if(self.m_PosCurrentSelectEleId == -1 &&  self.m_PosCurrentSelectEleId != self.m_PosCurrentHoverEleId){
					//new one
					console.log(' [Decode Mode] 1');
					self.m_PosCurrentSelectEleId = self.m_PosCurrentHoverEleId;
					self.clearTemp();
					self.drawReferLineCandidates(true);
				}else if(self.m_PosCurrentSelectEleId != -1 &&  self.m_PosCurrentSelectEleId == self.m_PosCurrentHoverEleId){
					//release the selected
					console.log(' [Decode Mode] 2 ', self.m_PosCurrentHoverEleId, self.m_PosCurrentSelectEleId);
					self.drawReferLineCandidates(false);
					self.m_PosCurrentSelectEleId = -1;
				}
			}
		}else if(self.m_DecodeMethod == 'decode_rule'){
			if(self.m_PosCurrentHoverEleId == -1){	
				return;
			}else{
				if(self.m_PosCurrentSelectEleId == -1 &&  self.m_PosCurrentSelectEleId != self.m_PosCurrentHoverEleId){
					//new one
					console.log(' [Decode Mode] 1');
					self.m_PosCurrentSelectEleId = self.m_PosCurrentHoverEleId;
					// self.clearTemp();
					self.drawBoundaryRect(self.m_PosCurrentSelectEleId);
				}else if(self.m_PosCurrentSelectEleId != -1 &&  self.m_PosCurrentSelectEleId == self.m_PosCurrentHoverEleId){
					//release the selected
					console.log(' [Decode Mode] 2 ', self.m_PosCurrentHoverEleId, self.m_PosCurrentSelectEleId);
					self.drawBoundaryRect(-1);
					self.m_PosCurrentSelectEleId = -1;
				}
			}
		}else if(self.m_DecodeMethod == 'decode_bound'){
			//todo
		}else if(self.m_DecodeMethod == 'decode_legend'){
			//todo
		}
	}

	//mouse over
	Info.handleMouseMove = function(pos){
		console.log("[Deocde Mode] handle mouse move ");		
	}

	Info.handleMouseUp = function(){
		console.log("[Deocde Mode] handle mouse up ");	
	}

	Info.drawBoundaryRect = function(iEleId){

		if(iEleId == -1){
			console.log(' draw bound 0 ');
			//remove 
			d3.select('.decode_temp_object_boundary').remove();
		}else{
			
			var tempRect = g_GlobalElementIdManager.getGlobalRectbyEleId(iEleId);
			var fatPix = 5;
			var lineWidth = 10;
			tempRect = {
				'x1': tempRect['x1'] - fatPix,
				'x2': tempRect['x2'] + fatPix,
				'y1': tempRect['y1'] - fatPix,
				'y2': tempRect['y2'] + fatPix,
			}

			var lines = [];
			lines.push([
				{'x': tempRect['x1'], 'y': tempRect['y1'] - lineWidth},
				{'x': tempRect['x1'], 'y': tempRect['y1']},
				{'x': tempRect['x1'] +  lineWidth, 'y': tempRect['y1']}]);
			lines.push([
				{'x': tempRect['x2'] - lineWidth, 'y': tempRect['y1']},
				{'x': tempRect['x2'], 'y': tempRect['y1']},
				{'x': tempRect['x2'], 'y': tempRect['y1'] + lineWidth}]);
			lines.push([
				{'x': tempRect['x2'], 'y': tempRect['y2'] - lineWidth},
				{'x': tempRect['x2'], 'y': tempRect['y2']},
				{'x': tempRect['x2'] -  lineWidth, 'y': tempRect['y2']}]);
			lines.push([
				{'x': tempRect['x1'] - lineWidth, 'y': tempRect['y2'] - lineWidth},
				{'x': tempRect['x1'], 'y': tempRect['y2']},
				{'x': tempRect['x1'], 'y': tempRect['y2']}]);

			var lineFunction = d3.svg.line()
				  .x(function(d) { return d.x; })
				  .y(function(d) { return d.y; })
				  .interpolate('linear');

				//Position: draw the center pos
			if(d3.select('.decode_temp_object_boundary').empty() == true){

				console.log(' draw bound 1 ');

				d3.select('#' + this.m_DecodeGroupId)
				.append('rect')
				.attr('class', 'decode_temp_object_boundary')
				.attr('x', tempRect['x1'])
				.attr('y', tempRect['y1'])
				.attr('width', tempRect['x2'] - tempRect['x1'])
				.attr('height', tempRect['y2'] - tempRect['y1'])
				.style('fill', 'none')
				.style('stroke', 'black');

			 //    linegroup = d3.select('#' + this.m_DecodeGroupId)
				// .append('g')
				// .attr('class', 'decode_temp_object_boundary decodetemp')
				// .data(lines)
				// .enter()
				// .append('path')
				// .attr("d", function(d, i){
				// 	return lineFunction(d);
				// })				
				// .style('stroke', 'black');

			}else{

				console.log(' draw bound 2 ');

				d3.select('.decode_temp_object_boundary')
					.attr("d", function(d, i){
					return lineFunction = d3.svg.line()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
						.interpolate("linear");
					})	
			}
		}
	}

	Info.drawCenterPos = function(iEleId, radius){
		if(iEleId == -1){
			//remove 
			console.log(" [De] 0 ");
			d3.select('.decode_temp_object_centerpos').remove();
		}else{
			
			var tempRect = g_GlobalElementIdManager.getGlobalRectbyEleId(iEleId);
			var centerPos = {
				'x': (tempRect['x1'] + tempRect['x2']) * 0.5, 
				'y': (tempRect['y1'] + tempRect['y2']) * 0.5
			};
			this.m_PosCurrentEleCenPos = centerPos;
			//Position: draw the center pos
			if(d3.select('.decode_temp_object_centerpos').empty() == true){

				if(radius == undefined)
					radius = 5;

				// d3.select('#decodediv svg')

				console.log(" [De] 1 ");
				console.log(" create temp circle ", centerPos);
			    d3.select('#' + this.m_DecodeGroupId)
				.append('circle')
				.attr('class', 'decode_temp_object_centerpos decodetemp')
				.attr('cx', centerPos['x'])
				.attr('cy', centerPos['y'])
				.attr('r', radius)
				.style('fill', 'black')
				.style('stroke', 'black')
				.attr("pointer-events", "none");

			}else{
				console.log(" [De] 2 ");
				d3.select('.decode_temp_object_centerpos')
				.attr('cx', centerPos['x'])
				.attr('cy', centerPos['y']);
			}
		}
	}

	Info.drawReferLineCandidates = function(create){
		//delete the existing one
		d3.select('#decode_referline_g').remove();

		if(!create){
			return;
		}

		//new refer line candadiate
		var lineGroup = d3.select('#' + this.m_DecodeGroupId)
		.append('g')
		.attr('id', 'decode_referline_g')
		.attr('transform', 'translate(' + this.m_PosCurrentEleCenPos['x'] + ',' + this.m_PosCurrentEleCenPos['y'] + ')');

		//default refer lines: - , | 
		var defaultAngleList = [0];
		var defaultRadius = 50;

		console.log(" add refer lines ");

		//reference line
		var referLineGroup = lineGroup.append('g');
		var referAngle = 90;
		var smallAngle = 8;
		var referenceLineLength = 150;
		for(var i = 0; i < 360/referAngle; i ++){
			var angleDegree = referAngle * i;			
			var arc = Math.PI * (angleDegree/180);
			var cosArc = Math.cos(arc), sinArc = Math.sin(arc);
			var x2 = referenceLineLength * cosArc, y2 = referenceLineLength * sinArc;
			
			referLineGroup.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', x2)
					.attr('y2', y2)
					.attr('class', 'decode_baseline')
					.attr('id', 'decode_baseline-' + i)
					.attr('angle', angleDegree)
					.style('stroke', '#795548')
					.style('stroke-width', '1px')
					.style('visibility', 'hidden')
					.style('stroke-dasharray', '2 2');
		}
		
		for (var i = defaultAngleList.length - 1; i >= 0; i--) {
			var angleDegree = defaultAngleList[i];
			var arc = Math.PI * (angleDegree/180);
			var cosArc = Math.cos(arc), sinArc = Math.sin(arc);
			var x2 = defaultRadius * cosArc, y2 = defaultRadius * sinArc;
			var group = lineGroup.append('g')
						.attr('angle', angleDegree);

			group.append('line')
					.attr('x1', 0)
					.attr('y1', 0)
					.attr('x2', x2)
					.attr('y2', y2)
					.attr('class', 'decode_referline')
					.style('stroke', 'black')
					.style('stroke-width', '2px')
					.style('stroke-dasharray', '3 3');

			//circle
			var circle = group.append('circle')
					.attr('cx', x2)
					.attr('cy', y2)
					.attr('r', '5px')
					.attr('fill', 'none')
					.attr('stroke', 'black')
					.attr('stroke-width', '1px')
					.attr('pointer-event', 'all')
					.on('mouseover', function(){
						d3.event.stopPropagation();
						//increase the granularity
						d3.select(this)
						.attr("stroke-width", '3px');
					})
					.on('mouseout', function(){
						d3.select(this)
						.attr("stroke-width", '1px');
					})
					.on("mouseup", function(){
						console.log(" mouse up ");
					});

			var drag = d3.behavior.drag()
						.on("drag", function(d,i) {
							var x = d3.mouse(this)[0], y = d3.mouse(this)[1];
							var angle, arc; 
							if(x == 0){
								if(y <= 0){
									angle = 270;
								}else{
									anagle = 90;
								}
							}else{
								arc = Math.atan(y/x);
								if(x<0)
									arc += (Math.PI);
								else if(y < 0){
									arc += (Math.PI * 2);
								}
								angle = 180 * (arc/Math.PI)
							}

							//judget is in referAngle region
							var referNum = Math.floor(angle/referAngle);
							var leftAngle = Math.abs(angle - referNum * referAngle);

							d3.selectAll('.decode_baseline')
							.style('visibility', 'hidden');
							if(leftAngle <= smallAngle){
								//highlight
								d3.select('#decode_baseline-' + referNum)
								.style('visibility', 'visible');
								angle = referNum * referAngle;
							}else{
								leftAngle = Math.abs(angle - (1 + referNum) * referAngle);
								if(leftAngle <= smallAngle){
									d3.select('#decode_baseline-' + (referNum + 1))
									.style('visibility', 'visible');
									angle = (referNum + 1) * referAngle;
								}
							}

							console.log(' angle ', angle);

							var newradius = Math.sqrt(x * x + y * y);
						   	// console.log(' drag ', xy, d3.event.dx, d3.event.dy);
						    
						    // var angleDegree = Number(d3.select(this.parentNode).attr("angle"));
						 	var arc = Math.PI * (angle/180);
						    var cosArc = Math.cos(arc), sinArc = Math.sin(arc);
												
							x = newradius * cosArc; 
							y = newradius * sinArc;

							d3.select(this.parentNode)
							.attr('angle', angle);
							
						  	d3.select(this.parentNode).select('line')
						  	.attr('x2', x)
						  	.attr('y2', y);

						  	d3.select(this.parentNode).select('circle')
						  	.attr('cx', x)
						  	.attr('cy', y);

						})
						.on("dragend", function(d,i){
							var angle = d3.select(this.parentNode).attr('angle');
							console.log(" drag end ", angle);
							//calibrate
							// var x = d3.mouse(this)[0], y = d3.mouse(this)[1];
						});
			
				circle.call(drag);

		};		
	}

	Info.__init__();
	return Info;
}

function getDecodePropertyType(propertyName){
	var posProList = ['x', 'y', 'cx', 'cy'];
	var sizeProList = ['rx', 'ry', 'width', 'height'];
	if(posProList.indexOf(propertyName) != -1)
		return 'pos';
	if(sizeProList.indexOf(propertyName) != -1)
		return 'size';
	return "other";
}
