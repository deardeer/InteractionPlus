var VBARWIDTH = 10;//20;
var HBARHEIGHT = 15;

function InObjMaskRender(iId, maskType, inObjMask){
	var Info = {};

	Info.__init__ = function(iId, maskType, inObjMask){
		this.m_iId = iId;
		this.m_MaskType = maskType;
		this.m_InObjMask = inObjMask;
		this.m_MaskRect = "";
		this.m_SelectRectDomId = "g_defined_region" + this.m_iId;
		this.m_lineGroup = "mask_line_" + this.m_iId;
		this.m_GroupDivClass = "mask_group_region_" + this.m_iId; //group region div; 
		//groupdiv class id : maskgroup_rect_ + i

		this.m_liVisibleGroupName = [];

		//geometric lines
		this.m_MaskLineList = [];
		this.m_MaskRectList = [];
		//group region
		this.m_GroupRectList = [];
	}

	Info.configure = function(maskRect, maskDefaultConfig){
		var self = this;
		self.m_MaskRect = maskRect;

		// if(maskDefaultConfig == undefined){
			// //console.log(" render defaultVVV ", self.maskRect, maskRect);
			//not defined
		self.computeMaskLineRects(this.m_MaskRect, maskDefaultConfig);	
			// //console.log(" RECT , ", self.m_MaskRectList);
		// }else{
		// 	//with configure
		// }
	}

	//set the list of visible group list, e.g. [circle, text, line...]
	Info.setVisibleGroupList = function(liGroupName){
		this.m_liVisibleGroupName = liGroupName;
		this.renderMask();
	}

	Info.clearMaskRelated = function(){
		d3.select("#" + this.m_SelectRectDomId).remove();
	}

	Info.renderMask = function(){
		var self = this;
		switch(this.m_MaskType){
			case "tabular":
				self.renderDefaultTabular();
				break;
			case "radial":
				self.renderDefaultRadial();
				break;
			case "vparalell":
				self.renderDefaultVParallel();
				break;
			case "hparallel":
				self.renderDefaultHParallel();
				break;
		}
	}

	//
	Info.renderDefaultTabular = function(){

	}

	Info.renderDefaultRadial = function(){
		var self = this;
		self.addLines();
	}

	Info.renderDefaultVParallel = function(){
		var self = this;
		//add lines
		self.addLines(); //self.m_MaskLineList
		self.addGroups(); //self.group region
	}

	Info.renderDefaultHParallel = function(){
		var self = this;
		self.addLines();
		self.addGroups();
	}

	Info.addLines = function(){
		var self = this;
		var drawLines = [];
		if(self.m_MaskType == 'radial')
			drawLines = self.m_MaskLineList.slice(1, self.m_MaskLineList.length);
		else
			drawLines = self.m_MaskLineList.slice(1, self.m_MaskLineList.length - 1);

		d3.selectAll('.mask_line').remove();
		
		var lineGroup = d3.select("#" + self.m_SelectRectDomId).selectAll("." + self.m_lineGroup)
			// .data(self.m_MaskLineList)
			.data(drawLines)
			.enter()
			.append('g');

		var line = lineGroup
			.append("line")
			.attr("class", function(d, i){
				return self.m_lineGroup + ' define_boundary_line mask_line handler_line_' + i;
			})
			// .attr('class', )
			// .attr('class', 'mask_line')
			.attr("x1", function(d){return d.x1;})
			.attr("y1", function(d){return d.y1;})
			.attr("x2", function(d){return d.x2;})
			.attr("y2", function(d){return d.y2;});

		var drag = d3.behavior.drag()
					.on("drag", function(d,i) {

						var x = Number(d3.select(this).attr('cx')), y = Number(d3.select(this).attr('cy'));
					   
					    var type = d3.select(this).attr("type");
					    var index = d3.select(this).attr('index');
					    if(type == 'horizontal'){
					    	 y += d3.event.dy;

						    d3.select(this)
						    // .attr("cx", x)
						    .attr('cy', y);

						    //update the line
						    d3.select('.handler_line_' + index)
						    .attr('y1', y)
						    .attr('y2', y);
					    }

					    if(type == 'vertical'){
					    	x += d3.event.dx;
					    	
						    d3.select(this)
						    .attr("cx", x);
						    // .attr('cy', y);

						    d3.select('.handler_line_' + index)
						    .attr('x1', x)
						    .attr('x2', x);
					    }

					    // console.log(" drag point ");
						// console.log(" drag point ", d3.select(this).attr('type'), d3.select(this).attr('cx'), d3.select(this).attr('cy'));
					});


		switch(self.m_MaskType){
			case 'vparalell':
					lineGroup
					.append('circle')			
					.attr('class', 'mask_line mask_handler')
					.attr("type", 'vertical')
					.attr("index", function(d, i){
						return i;
					})
					.attr('cx', function(d){
						return d.x1;
					})
					.attr('cy', function(d){
						return d.y1;
					})
					.attr('r', '5px')
					.style('fill', 'white')
					.style('stroke', 'black')
					.attr('stroke-width', '1px')
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

						var type = d3.select(this).attr("type");
					    var index = d3.select(this).attr('index');
					    var x = Number(d3.select(this).attr("cx"));

					    var liPosList = [];
					    for (var i = 1; i < self.m_MaskLineList.length - 1; i++) {
					    	if((i - 1) == index)
					    		liPosList.push(x);
					    	else
					    		liPosList.push(self.m_MaskLineList[i].x1);
					    };
					  
					    // var liPosList = self.m_MaskLineList.slice(1, self.m_MaskLineList.length - 1);
					    // liPosList[index] = x;
					    console.log(" XXX ", liPosList);
					    self.m_InObjMask.changePosList(liPosList);
					});

					d3.selectAll('.mask_handler')
					.call(drag);

			
				break;

			case 'hparallel':
					lineGroup
					.append('circle')			
					.attr('class', 'mask_line mask_handler')
					.attr("type", 'horizontal')
					.attr("index", function(d, i){
						return i;
					})
					.attr('cx', function(d){
						return d.x1;
					})
					.attr('cy', function(d){
						return d.y1;
					})
					.attr('r', '5px')
					.style('fill', 'white')
					.style('stroke', 'black')
					.attr('stroke-width', '1px')
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

						var type = d3.select(this).attr("type");
					    var index = d3.select(this).attr('index');
					    var y = Number(d3.select(this).attr("cy"));
					  
					     var liPosList = [];
					    for (var i = 1; i < self.m_MaskLineList.length - 1; i++) {
					    	if((i - 1) == index)
					    		liPosList.push(y);
					    	else
					    		liPosList.push(self.m_MaskLineList[i].y1);
					    };
					    // liPosList[index] = y;
					    console.log(" XXX ", liPosList);
					    self.m_InObjMask.changePosList(liPosList);
					});
					
					d3.selectAll('.mask_handler')
					.call(drag);


				break;
		}
		
		d3.select('#' + self.m_SelectRectDomId)
			.append('rect')
			.attr('id', 'inc_granularity_'+ self.m_iId)
			.attr('class', self.m_lineGroup)
			// .attr('class', 'define_boundary_line')
			.attr('class', 'mask_line')
			.attr('x', (self.m_MaskRect['x1'] + self.m_MaskRect['x2']) * 0.5 - 5)
			.attr('y', (self.m_MaskRect['y1'] + self.m_MaskRect['y2']) * 0.5 - 5)
			.attr('width', '5px')
			.attr("height", '10px')
			.attr('fill', 'white')
			.attr('stroke-width', '1px')
			.attr('stroke', 'black')
			.on('mouseover', function(){
				d3.event.stopPropagation();
				//increase the granularity
				console.log(" hoverover cen circle ");

				d3.select(this)
				.attr("stroke-width", '3px');
			})
			.on('mouseout', function(){
				console.log(" mouseout cen circle ");
				d3.select(this)
				.attr("stroke-width", '1px');
			})
			.on('click', function(){
				d3.event.stopPropagation();
				self.m_InObjMask.increaseGraunarity();
			});

		d3.select('#' + self.m_SelectRectDomId)
			.append('rect')
			.attr('id', 'dec_granularity_'+ self.m_iId)
			.attr('class', self.m_lineGroup)
			// .attr('class', 'define_boundary_line')
			.attr('class', 'mask_line')
			.attr('x', (self.m_MaskRect['x1'] + self.m_MaskRect['x2']) * 0.5)
			.attr('y', (self.m_MaskRect['y1'] + self.m_MaskRect['y2']) * 0.5 - 5)
			.attr('width', '5px')
			.attr("height", '10px')
			.attr('fill', 'white')
			.attr('stroke-width', '1px')
			.attr('stroke', 'black')
			.on('mouseover', function(){
				d3.event.stopPropagation();
				//increase the granularity
				console.log(" hoverover dec circle ");
				d3.select(this)
				.attr("stroke-width", '3px');
			})
			.on('mouseout', function(){
				console.log(" mouseout cen circle ");
				d3.select(this)
				.attr("stroke-width", '1px');
			})
			.on('click', function(){
				d3.event.stopPropagation();
				self.m_InObjMask.decreaseGraunarity();
			});;
		
	}

	//updaet mask groups
	Info.renderMaskGroups = function(){
		var self = this;

	}

	Info.addMaskGroup = function(iGroupIndex, groupObjectManager, filterGroupIdEleIds, maxGroupEleNum){

		var self = this;

		switch(self.m_MaskType){
			case 'vparalell':
			case 'hparallel':
				self.addMaskGroupInRect(iGroupIndex, groupObjectManager, filterGroupIdEleIds, maxGroupEleNum);
				break;
			case 'radial':
				self.addMaskGroupInFan(iGroupIndex, groupObjectManager, filterGroupIdEleIds, maxGroupEleNum);
				break;
			case 'tabular':
				break;
		}
	}

	Info.removeMaskGroups = function(){
		d3.selectAll('.mask_group_object').remove();
	}

	Info.addMaskGroupInFan = function(iGroupIndex, groupObjectManager, filterGroupIdEleIds, maxGroupEleNum){

		var self = this;
		console.log(" remove fan ", "mask_object_g" + self.m_iId + "_" + iGroupIndex);
		d3.select(".mask_object_g" + self.m_iId + "_" + iGroupIndex).remove();

		var Fan = self.m_FanList[iGroupIndex];
		
		var groupFan = self.m_GroupFanList[iGroupIndex];

		// var arc = d3.svg.arc();
		var dx, dy, rect_width, rect_height;
        dx = (self.m_MaskRect['x1'] + self.m_MaskRect['x2']) * 0.5, dy = (self.m_MaskRect['y1'] + self.m_MaskRect['y2']) * 0.5;
        rect_width = self.m_MaskRect['x2'] - self.m_MaskRect['x1'], rect_height = self.m_MaskRect['y2'] - self.m_MaskRect['y1'];
        var arcHeight = 18;
				    // .startAngle(function(d) { return d.startAngle; })
				    // .endAngle(function(d) { return d.endAngle; })
				    // .innerRadius(function(d) { return d.innerRadius;})
				    // .outerRadius(function(d) { return d.outerRadius;});

		var liGroupData = [];
		var liGroupId = groupObjectManager.getVisibleGroupIdList();//.getGroupIdList();
	
		for (var i = liGroupId.length - 1; i >= 0; i--){
			var iGroupId = liGroupId[i];
			var iEleNum = groupObjectManager.getEleIdsbyGroupId(iGroupId).length;
			var iFilterEleNum = filterGroupIdEleIds[iGroupId].length;
			var attrs = groupObjectManager.getAttrsbyGroupId(iGroupId);
			
			var Data = {
				'start': groupFan['beginArc'],//iGroupIndex * Math.PI * 2 / self.m_FanList.length,
				'end': groupFan['beginArc'] + (groupFan['endArc'] - groupFan['beginArc']) * iEleNum / maxGroupEleNum, //(iGroupIndex + 1) * Math.PI * 2 / self.m_FanList.length,
				'filter_end': groupFan['beginArc'] + (groupFan['endArc'] - groupFan['beginArc']) * iFilterEleNum / maxGroupEleNum,
				'x_text': Math.sin(groupFan['beginArc']) * rect_width * 0.5,
				'y_text': - Math.cos(groupFan['beginArc']) * rect_width * 0.5,
			
				'groupId': iGroupId,
				'groupName': attrs['name'],
				'eleNum': iEleNum,
				'filterEleNum': iFilterEleNum,
				// 'x': leftX,
				// 'y': bottomY - (i + 1) * barHeight,
				// 'width': iEleNum * totalWidth / maxGroupEleNum,
				// 'filterWidth': iFilterEleNum * totalWidth / maxGroupEleNum,
				// 'height': barHeight * 0.9, 
			}
			liGroupData.push(Data);
		}

		console.log(" add fan ", liGroupData);

		//console.log(" addMaskGroupInFan ");

		var update = d3.select("#" + self.m_SelectRectDomId)
		.selectAll(".mask_object_g" + self.m_iId + "_" + iGroupIndex)
		.data(liGroupData);		

		var enter = update.enter();
		var exit = update.exit();

		var whole_arc = d3.svg.arc()
				.innerRadius(rect_width/2.)
				.outerRadius(rect_width/2. + arcHeight)
			    .startAngle(function(d, i){return d.start;})
			    .endAngle(function(d, i){return d.end;});

	    var filter_arc = d3.svg.arc()
			.innerRadius(rect_width/2.)
			.outerRadius(rect_width/2. + arcHeight)
		    .startAngle(function(d, i){return d.start;})
		    .endAngle(function(d, i){return d.filter_end;});

		//add whole-arc, filter-arc, text
		var group = enter.append('g')
		.attr('class', "mask_group_object mask_object_g" + self.m_iId + "_" + iGroupIndex)
		.attr("transform", "translate(" + dx + ',' + dy + ")");

		group.append('path')
		.attr('class', 'whole-arc')	
		.attr('class', 'arc')
        // .attr("filter", "url(#glow)")
		.style('opacity', '0.2')
		.style("fill", '#ff5722')
		.attr("d", whole_arc );

		group.append('path')
		.attr("class", 'filter-arc')
        .attr("filter", "url(#glow)")
		.attr('class', 'arc')
		.style("fill", '#ff5722')
		.attr("d", filter_arc);

		group.append('text')		
		.text(function(d, i){
			return d.filterEleNum;
		})
		.attr('transform', function(d, i){
			return 'rotate(' +  (d.start * 180/Math.PI - 90 ) + ')';
		})
		.attr('x', function(d, i){
			return rect_width * 0.5 + 2;
			// return d['x_text'];
		})
		.attr('y', function(d, i){
			// return d['y_text'];
			return 15;
			// return 0;
		})
		.style('font-size', '14px')
		.style('fill', function(d, i){
			if(i < 1)
				return 'black';
			return 'white';
		});


		//update
		group.selectAll('.filter-arc')	
		.attr("class", 'filter-arc')
		.attr('class', 'arc')
		.style("fill", '#ff5722')
		.attr("d", filter_arc);

		exit.remove();

      
		// var chart = d3.select('#' + self.m_SelectRectDomId)
		// 		.attr("class", "chart")
		// 		.attr("width", rect_width)
		// 		.attr("height", rect_height)
		// 		.append("g")
		// 		.attr("transform", "translate(" + dx + ',' + dy + ")");

		// var update = chart.selectAll(".mask_object_g" + self.m_iId + "_" + iGroupIndex)//.arc")
		// 		.data(liGroupData);

		// // var enter = update.enter(), exit = update.exit();

		
		
		

		// //udpate
		// update.


		// exit.remove();
				
	}

	Info.addMaskGroupInRect = function(iGroupIndex, groupObjectManager, filterGroupIdEleIds, maxGroupEleNum){
		
		var self = this;

		//remove
		d3.select(".mask_object_g" + self.m_iId + "_" + iGroupIndex).remove();

		//draw object-number		
		//console.log("drawObjectButtons", maxGroupEleNum);

		//clear the buttons
		var RegionRect = self.m_GroupRectList[iGroupIndex];
		console.log(" iGroup Index ", iGroupIndex);
		var leftX = RegionRect.x1, rightX = RegionRect.x2, bottomY = RegionRect.y2, topY = RegionRect.y1, totalWidth = 50, totalHeight = 20;//(RegionRect.y2 - RegionRect.y1) * 0.9;
		var barHeight = HBARHEIGHT, barWidth = VBARWIDTH;

		var liGroupData = [];
		var liGroupId = groupObjectManager.getVisibleGroupIdList();//.getGroupIdList();

		var widthGap = 3, heightGap = 3;

		var font = '12px arial';
	
		for (var i = liGroupId.length - 1; i >= 0; i--){
			var iGroupId = liGroupId[i];
			var iEleNum = groupObjectManager.getEleIdsbyGroupId(iGroupId).length;
			var iFilterEleNum = filterGroupIdEleIds[iGroupId].length;
			var attrs = groupObjectManager.getAttrsbyGroupId(iGroupId);


			var fontSize = getTextSize(iFilterEleNum, font);

			var Data = {}
			if(self.m_MaskType == 'vparalell'){
				Data = {
					'groupId': iGroupId,
					'groupName': attrs['name'],
					'eleNum': iEleNum,
					'filterEleNum': iFilterEleNum,
					"x": leftX,
					'y': bottomY -  iEleNum * totalWidth / maxGroupEleNum - heightGap,
					'x_filter': leftX,
					'y_filter': bottomY - iFilterEleNum * totalWidth / maxGroupEleNum - heightGap,
					'width': barHeight * 0.9,
					'height': iEleNum * totalWidth / maxGroupEleNum,
					'filterWidth': barHeight * 0.9,
					'filterHeight': iFilterEleNum * totalWidth / maxGroupEleNum,
					'x_text': leftX,
					'y_text': bottomY - iFilterEleNum * totalWidth / maxGroupEleNum - heightGap - 4,
					// 'x': leftX,
					// 'y': bottomY - (i + 1) * barHeight - heightGap,
					// 'width': iEleNum * totalWidth / maxGroupEleNum,
					// 'x_filter': leftX,
					// 'y_filter': bottomY - (i + 1) * barHeight - heightGap,
					// 'x_text': leftX,
					// 'y_text': bottomY - (i + 1) * barHeight + barHeight * 0.9 - heightGap,
					// 'filterWidth': iFilterEleNum * totalWidth / maxGroupEleNum,
					// 'filterHeight': barHeight * 0.9,
					// 'height': barHeight * 0.9, 
				}	
			}else if(self.m_MaskType == 'hparallel'){
				Data = {
					'groupId': iGroupId,
					'groupName': attrs['name'],
					'eleNum': iEleNum,
					'filterEleNum': iFilterEleNum,
					// 'x': rightX - (i + 1) * barWidth,
					// 'y': bottomY - iEleNum * totalHeight / maxGroupEleNum,
					'x': rightX - iEleNum * totalHeight / maxGroupEleNum - widthGap,
					'y': topY,
					// 'x_filter': rightX - (i + 1) * barWidth,
					// 'y_filter': bottomY - iFilterEleNum * totalHeight / maxGroupEleNum,
					'x_filter': rightX - iFilterEleNum * totalHeight / maxGroupEleNum - widthGap,
					'y_filter': topY,
					'x_text': rightX - iFilterEleNum * totalHeight / maxGroupEleNum - fontSize['w'] - 4 - widthGap,
					'y_text': topY + barHeight * 0.9,
					// 'height': iEleNum * totalHeight / maxGroupEleNum,
					// 'filterHeight': iFilterEleNum * totalHeight / maxGroupEleNum,
					// 'filterWidth': barWidth * 0.9, 
					// 'width': barWidth * 0.9, 
					'width': iEleNum * totalHeight / maxGroupEleNum,
					'filterWidth': iFilterEleNum * totalHeight / maxGroupEleNum,
					'height': barHeight * 0.9,
					'filterHeight': barHeight * 0.9,
				}	
			}
			
			liGroupData.push(Data);
		};

		//draw origin groups		
		var update = d3.select("#" + self.m_SelectRectDomId)
		.selectAll(".mask_object_g" + self.m_iId + "_" + iGroupIndex)
		.data(liGroupData);
		
		var enter = update.enter();
		var exit = update.exit();
		
		//all-rect
		// update.select(".whole-rect")
		// .attr('x', function(d, i){
		// 	return d.x;
		// })
		// .attr('y', function(d, i){
		// 	return d.y;
		// })
		// .attr('width', function(d, i){
		// 	return d.width;
		// })
		// .attr('height', function(d, i){
		// 	return d.height;
		// });

		update.select(".filter_rect")
		.attr('x', function(d, i){
			return d.x_filter;
		})
		.attr('y', function(d, i){
			return d.y_filter;
		})
		.attr('width', function(d, i){
			return d.filterWidth;
		})
		.attr('height', function(d, i){
			return d.filterHeight;
		});

		update.select("text")
		.attr("text", function(d, i){
			return d.filterEleNum;
		});

		var group = enter.append('g')
		// .attr('class', '')
		.attr('class', "mask_group_object mask_object_g" + self.m_iId + "_" + iGroupIndex);
		
		group.append('rect')
		.attr('class', 'whole-rect')
		.attr('name', function(d, i){
			return d.groupName;
		})
		.attr('x', function(d, i){
			return d.x;
		})
		.attr('y', function(d, i){
			return d.y;
		})
		.attr('width', function(d, i){
			return d.width;
		})
		.attr('height', function(d, i){
			return d.height;
		})
		.style('fill', '#ff5722')
		.style('opacity', '0.2');

		group.append('rect')
		.attr('class', 'filter_rect')
        .attr("filter", "url(#glow)")
		.attr('name', function(d, i){
			return d.groupName;
		})
		.attr('x', function(d, i){
			return d.x_filter;
		})
		.attr('y', function(d, i){
			return d.y_filter;
		})
		.attr('width', function(d, i){
			return d.filterWidth;
		})
		.attr('height', function(d, i){
			return d.filterHeight;
		})
		.style('fill', '#ff5722');

		group.append('text')
		.text(function(d, i){
			return d.filterEleNum;
		})
		.attr('x', function(d, i){
			return d.x_text;
		})
		.attr('y', function(d, i){
			return d.y_text;
			// return d.y + d.height;
		})
		.style('font-size', '14px')
		.style('fill', 'black');

		exit.remove();
	}

	Info.addGroups = function(){
		var self = this;

		// d3.select("#" + self.m_SelectRectDomId).selectAll("." + self.m_GroupDivClass)
		// 	.data(self.m_MaskRectList)
		// 	.enter()
		// 	.append("rect")
		// 	.attr("id", function(d, i){ return "maskgroup_rect_" + i;})
		// 	.attr("class", self.m_GroupDivClass)
		// 	.attr("width", function(d){return d.x2 - d.x1;})
		//     .attr("height", function(d){return d.y2 - d.y1;})
		//     .attr("x", function(d) { return d.x1; })
		//     .attr("y", function(d) { return d.y1; })
		// 	.style("stroke", "red")
		// 	.style('fill', 'none')
		// 	.style("stroke-width", "2px");	
	}

	//return mask rect list
	Info.getMaskRectList = function(){
		var self = this;
		return self.m_MaskRectList;
	}

	//return rect and lines
	Info.computeMaskLineRects = function(rect, configure){
		var self = this;
		self.m_MaskRect = rect;
		switch(self.m_MaskType){
			case "tabular":
				break;
			case "radial":
				self.computeFanList(rect, configure);
				// self.renderDefaultRadial(maskDefaultConfig);
				break;
			case "vparalell":
				self.computeVLineList(rect, configure);
				break;
			case "hparallel":
				self.computeHLineList(rect, configure);
				break;
		}
	}

	Info.computeVLineList = function(rect, configure){

		var self = this;

		var iGridNum = 3;

		self.m_MaskLineList = [];
		self.m_MaskRectList = [];
		self.m_GroupRectList = [];

		var groupRectHeight = 30;

		var liGridXPos = [];
		var left = rect.x1; var right = rect.x2; var top = rect.y1; var bottom = rect.y2;

		if(configure == undefined){
			//compute default
			var widthStep = rect.width/(iGridNum);
			for (var i = 0; i <= iGridNum; i++) {
				liGridXPos.push(left + i * widthStep);
			}
		}else{
			var gridXPosList = configure['gridXPosList'];
			//console.log(" gridXPosList ", gridXPosList);
			for(var i = 0; i < gridXPosList.length + 2; i ++){
				if(i == 0){
					//left 
					liGridXPos.push(left);
				}else if(i == gridXPosList.length + 1){
					//right
					liGridXPos.push(right);
				}else{
					liGridXPos.push(gridXPosList[i - 1]);
				}
			}
		}

		for (var i = 0; i < liGridXPos.length; i++) {
			var Line = {};
			Line['x1'] = liGridXPos[i];
			Line['y1'] = top;
			Line['x2'] = liGridXPos[i];
			Line['y2'] = bottom;

			if(i > 0){
				var Rect = {
					"x1": liGridXPos[i - 1],
					"y1": Line['y1'],
					"x2": liGridXPos[i],
					"y2": Line['y2'],
				};
				var GroupRect = {
					"x1": (Rect['x1'] + Rect['x2'] - VBARWIDTH) * 0.5,
					"y1": Line['y1'] - groupRectHeight,
					"x2": Line['x1'],
					"y2": Line['y1'],	
				}
				// console.log(" Group Rect11111 ", GroupRect, Rect);
				self.m_MaskRectList.push(Rect);
				self.m_GroupRectList.push(GroupRect);
			}			
			self.m_MaskLineList.push(Line);
		};
	}

	Info.computeHLineList = function(rect, configure){

		var self = this;

		var iGridNum = 3;

		self.m_MaskLineList = [];
		self.m_MaskRectList = [];
		self.m_GroupRectList = [];

		var groupRectWidth = 30;

		var liGridYPos = [];
		var left = rect.x1, right = rect.x2; var top = rect.y1; var bottom = rect.y2;

		if(configure == undefined){
			//default
			var heightStep = rect.height/(iGridNum);
			for(i = 0; i <= iGridNum; i ++){
				liGridYPos.push(top + i * heightStep);
			}
		}else{
			var gridYPosList = configure['gridYPosList'];
			//console.log(" gridYPosList ", gridYPosList, top, bottom);
			for (var i = 0; i < gridYPosList.length + 2; i ++){
				if(i == 0){
					liGridYPos.push(top);
				}else if(i == gridYPosList.length + 1){
					liGridYPos.push(bottom);
				}else{
					liGridYPos.push(gridYPosList[i - 1]);
				}
			};	
		}

		for (var i = 0; i < liGridYPos.length; i ++) {
			var Line = {};
			Line['x1'] = left;
			Line['y1'] = liGridYPos[i];
			Line['x2'] = right;
			Line['y2'] = liGridYPos[i];

			if(i > 0){
				var Rect = {
					"x1": Line['x1'],
					"y1": liGridYPos[i - 1],
					"x2": Line['x2'],
					"y2": Line['y2'],
				};
				var GroupRect = {
					"x1": Line['x1'] - groupRectWidth,
					"y1": (Rect['y1'] + Rect['y2'] - HBARHEIGHT) * 0.5,
					"x2": Line['x1'],
					"y2": Line['y1'],	
				}
				//console.log(" Group Rect2222", GroupRect, " Rect ", Rect);
				self.m_MaskRectList.push(Rect);
				self.m_GroupRectList.push(GroupRect);
			}			

			self.m_MaskLineList.push(Line);
		};
	}

	Info.computeFanList = function(rect, configure){
		var self = this;
		//console.log(' compute fan list ');
		var iFanNum = configure['gridNum'];

		self.m_MaskLineList = [];
		self.m_FanList = [];
		self.m_GroupFanList = [];
		var arcStep = 2 * Math.PI/iFanNum;
		var center = {'x': 0.5 * (rect.x1 + rect.x2), 'y': 0.5 * (rect.y1 + rect.y2)};
		var radius = (rect.x2 - rect.x1) * 0.5;
		for(var i = 0; i <= iFanNum; i ++){
			var Line = {};
			var arc = arcStep * i;
			Line['x1'] = center.x;
			Line['y1'] = center.y;
			Line['x2'] = center.x + Math.sin(arc) * radius;
			Line['y2'] = center.y - Math.cos(arc) * radius;
			self.m_MaskLineList.push(Line);
			if(i > 0){
				self.m_FanList.push({
					'beginArc': arc - arcStep,
					'endArc': arc,
					'centerPos': center,
					'radius': radius,
				})
				self.m_GroupFanList.push({
					'beginArc': arc - arcStep,
					'endArc': arc - arcStep * 0.1,
					'centerPos': center,
					'innerradius': radius,
					'outerradius': radius + 30,
				})
			}
		}
		//console.log(' compute fan list m_MaskLineList ', self.m_MaskLineList);
	}

	Info.getFanList = function(){
		return this.m_FanList;
	}

	Info.__init__(iId, maskType, inObjMask);
	return Info;
}


