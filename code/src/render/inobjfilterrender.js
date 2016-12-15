/*
	InObjFilterRender: render the filter panel
*/

function InObjFilterRender(iId, inObj, objectGroupManager){

	var Info = {};
	
	Info.__init__ = function(iId, inObj, objectGroupManager){
		this.m_iId = iId;
		this.m_ObjectGroupManager = objectGroupManager;
		this.m_InObj = inObj;
		//console.log(" init inobjfilter render", this.m_iId);
	}

	Info.addFilterPanel = function(){	

		var self = this;
		//console.log(" render addFilterPanel");

		//add div
		this.m_FilterDivId = 'filter_panel' + this.m_iId;

		var Div = document.createElement('div');
		Div.id = this.m_FilterDivId ;//'filter_panel'; //<div class="container">
		Div.className = 'container filter_panel';
		$('#addondiv')[0].appendChild(Div);

		var DrawLTPos = self.getDefaultDrawLTPoint();
		if(g_ToolBarManager.isRadialMaskEnable() == true){
			//enable the radial mask
			DrawLTPos['x'] = DrawLTPos['x'] + 30;
		}
		$("#" + this.m_FilterDivId).css({
			position: 'absolute',
			top: DrawLTPos['y'],
			left: DrawLTPos['x'],
			'z-index': g_FrontZIndex,
		});

		//add the drag button
		this.drawDragButton(this.m_FilterDivId, DrawLTPos);

		//add subdiv
		var SubDivTitle = ['Object', 'Attribute'];//, 'Logic Composition'];//, 'Filter'];
		var SubDivId = ['object_p', 'property_p'];//, 'logic_p'];//, 'filter_p'];

		for (var i = 0; i < SubDivId.length; i++){
			// var SubDiv = document.createElement('div');
			// SubDiv.id =  SubDivId[i];
			// SubDiv.className = 'sub_panel';	
			// $('#filter_panel')[0].appendChild(SubDiv);	
			var testDiv = document.createElement('div');
			var DivId = 'subpanel_whole_' + this.m_iId + '_' + i;
			testDiv.id = DivId
			$('#' + this.m_FilterDivId)[0].appendChild(testDiv);

			// var tplhtml = '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">Panel title</h3></div><div class="panel-body">Panel content</div></div>';
			//var tplhtml = '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title"><%= subpaneltitle %></h3></div><div class="panel-body" id=<%=subpanelid%> ></div></div>';
			var tplhtml = '';
			if(SubDivId[i] == 'object_p') 
				tplhtml = '<div class="row sub_panel" style="width: 230px" id=<%=subpaneldiv%> ><div class="span12 titlebar margin-bottom-7"><span><%= subpaneltitle %></span></div><div class="span12" id=<%=subpanelid%> ></div></div>';
			if(SubDivId[i] == 'property_p')
				tplhtml = '<div class="row sub_panel" style="margin-top: 10px; visibility: hidden;" id=<%=subpaneldiv%> ><div class="span12 titlebar margin-bottom-7"><span><%= subpaneltitle %></span></div><div class="span12" id=<%=subpanelid%> ></div><div class="span12" id=<%=spid%> ></div></div>';
			//left: 250px; top: 0px; position: absolute; 
			var compiled = _.template(tplhtml);
			
			testDiv = document.getElementById(DivId);//'subpanel_whole_' + i);
			testDiv.innerHTML = testDiv.innerHTML + compiled(
			{
				subpaneldiv: SubDivId[i] + '_' + self.m_iId + '_div',
				subpanelid: SubDivId[i] + '_' + self.m_iId,
				spid: 'scatterplot_property_p_' + self.m_iId,
				subpaneltitle: SubDivTitle[i]
			});		
		}
		//draw object panel 
		self.m_ObjectPanelRender = new ObjectPanelRender(self.m_iId, this.m_InObj, self.m_ObjectGroupManager);
		self.m_ObjectPanelRender.addButtonsinObjectPanel();

		//draw property panel 
		self.m_PropertyPanelRender = new PropertiesPanelRender(self.m_iId, self.m_InObj, self.m_ObjectGroupManager);
		self.m_PropertyPanelRender.drawButtonsinPropertyPanel();

		self.m_ObjectPanelRender.addObjectPart();
		self.m_ObjectPanelRender.TEST();
		// self.drawFilterPart();
	}

	//set the hovered eleid 
	Info.hoverEleId = function(iHoveredEleId){
		var self = this;
		//highlight in the object panel
		self.m_ObjectPanelRender.hoverEleId(iHoveredEleId);
		//highlight in property panel
		self.m_PropertyPanelRender.hoverEleId(iHoveredEleId);
	}

	
	//draw the draggble button
	Info.drawDragButton = function(parentpanelid, DrawLTPos){

	    var circleButtonRadius = 10;
	    var expandWidth = circleButtonRadius * 2.5;//g_CircleButtonRadius * 2.5;

	    console.log(" expand Width, ", expandWidth);
		
		// var DrawLTPos = getDefaultDrawLTPoint();
		
		 // var expandSvg = d3.select("#filter_panel").append("svg")
		 var expandSvg = d3.select('#' + parentpanelid).append('svg')
		.attr('id',  parentpanelid + '_drag_svg')
	    .attr("width", expandWidth)
	    .attr("height", expandWidth)
	    .attr('x', DrawLTPos['x'])
	    .attr('y', DrawLTPos['y'])
	    // .attr("transform", function(){return "translate(" + (g_CircleButtonRadius * 1.1) + "," + (-g_CircleButtonRadius * 1.1)+ ")";})
	 // .attr("x", )
	    // .attr("y", DrawLTPos['y'])
	    .style("position", "absolute")
	    .style("margin-left", '-15px')
	    .style('margin-top', '3px');

	    var drawButton = expandSvg.append('g')
	    .attr('id', parentpanelid + '_drag_button');

	    drawButton.append('circle')
	    .attr('x', 0)
	    .attr('y', 0)
	    .style('z-index', 105)
	    // .attr('x')
	    .attr("r", circleButtonRadius)
	    .style("fill", "#74c476")
	    .style("stroke-width", '1px')
	    .style('stroke', 'black')
	    .style('cursor', 'pointer')
	    .on("mouseover", function(){
	      // alert("delete");
	      d3.select('#' + parentpanelid + '_drag_button')
	      .style('stroke-width', '2px'); 

	      d3.select('#' + parentpanelid + '_drag_button')
	      .style('opacity', '0.8'); 

	    })
	    .on('mouseout', function(){
	      d3.select('#' + parentpanelid + '_drag_button')
	      .style('stroke-width', '1px');

	      d3.select('#' + parentpanelid + '_drag_button')
	      .style('opacity', '1.'); 
	    });

	    var drag = d3.behavior.drag();

		d3.select('#' + parentpanelid + '_drag_button').call(drag);

		d3.select('#' + parentpanelid + '_drag_button').on("click", function() {
	  	if (d3.event.defaultPrevented) return; // click suppressed
		  //console.log("clicked!");
		});

		drag.on("dragstart", function() {
			// //console.log(' drag start ', d);
	 		d3.event.sourceEvent.stopPropagation(); // silence other listeners
		});

		drag.on("drag", function() {
			// //console.log(' draging ', d3.event.x, ', ', d3.event.y);
		 	var offset = $('#' + parentpanelid+ '_drag_svg').offset();
		 	var newPos = {left: offset.left + d3.event.x,
		 	              top: offset.top + d3.event.y};
			// $("#filter_panel").css({
			$('#' + parentpanelid).css({
				top: newPos.top,
				left: newPos.left,
			});

		});
	}

	//set the property panel visible or not
	Info.setPropertyPanelVisible = function(bVisible){
		if(bVisible == true)
			$('#property_p_' + this.m_iId + '_div').css('visibility', 'visible');
		else
			$('#property_p_' + this.m_iId + '_div').css('visibility', 'hidden');
	}

	//draw the properties of given group
	Info.drawProperties = function(iGroupId){
		var self = this;
		// $('#property_p_' + self.m_iId + '_div').css('visibility', 'visible');
		self.m_PropertyPanelRender.drawProperties(iGroupId);
	}

	//draw the object buttons 
	Info.drawObjectButtons = function(){
		this.m_ObjectPanelRender.drawObjectButtons();
		this.m_ObjectPanelRender.TEST();
	}
	
	//clear the filter related
	Info.clearFilterRelated = function(){
		$('#' + this.m_FilterDivId).remove();
		// $('.testrect').remove();
		// g_PropertyManager.clear();
	}

	Info.drawFilterPart = function(){
	}


	//get the relative rect of defined region in the 'addondiv'
	Info.getDefinedRegionRect_inAddonDiv = function(){
		var self = this;
		var setRect = {};

		var defineRegionRect = d3.select('#' + "define_region_rect" + self.m_iId);
		var setRect = {};

		var defineRegionTop = $(defineRegionRect[0]).offset().top - $('#addondiv').offset().top;
		var defineRegionLeft = $(defineRegionRect[0]).offset().left - $('#addondiv').offset().left;
		var defineRegionWidth, defineRegionHeight;
		defineRegionWidth = parseInt(defineRegionRect.attr('width')), defineRegionHeight = parseInt(defineRegionRect.attr('height'));
		// if(g_ToolBarManager.isRadialMaskEnable() == false){
		// }else{
		// 	defineRegionWidth = parseInt(defineRegionRect.attr('r')), defineRegionHeight = parseInt(defineRegionRect.attr('r'));
		// }
		
		setRect = {
			'x1': defineRegionLeft,
			'x2': defineRegionLeft + defineRegionWidth,
			'y1': defineRegionTop,
			'y2': defineRegionTop + defineRegionHeight
		};
		return setRect;
	}


	//get the drawing left-top point according to the dfrect
	Info.getDefaultDrawLTPoint = function(){
		var self = this;
		var defineRect = self.getDefinedRegionRect_inAddonDiv();
		var widthPad = 5;
		var rectLX = defineRect['x2'] + widthPad, rectLY = defineRect['y1']; 
		var LTPoint = {x: rectLX, y: rectLY} ;
		return LTPoint;

	  // return getDefaultDrawLBPoint();
	}

	Info.getDefaultDrawLBPoint = function(){
		var self = this;
		var defineRect = self.getDefinedRegionRect_inAddonDiv();
		var widthPad = 5;
		var rectLX = defineRect['x1'], rectLY = defineRect['y2'] + widthPad; 
		var LTPoint = {x: rectLX, y: rectLY} ;
		return LTPoint;
	}


	Info.__init__(iId, inObj ,objectGroupManager);

	return Info;
}