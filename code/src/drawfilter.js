
function drawFilter(){

	//add div
	var Div = document.createElement('div');
	Div.id = 'filter_panel'; //<div class="container">
	Div.className = 'container';
	$('#addondiv')[0].appendChild(Div);

	var DrawLTPos = getDefaultDrawLTPoint();
	$("#filter_panel").css({
		position: 'absolute',
		top: DrawLTPos['y'],
		left: DrawLTPos['x'],
		'z-index': g_FrontZIndex,
	});

	//add the drag button
	drawDragButton('filter_panel', DrawLTPos);

	//add subdiv
	var SubDivTitle = ['Object', 'Attribute'];//, 'Logic Composition'];//, 'Filter'];
	var SubDivId = ['object_p', 'property_p'];//, 'logic_p'];//, 'filter_p'];

	for (var i = 0; i < SubDivId.length; i++){
		// var SubDiv = document.createElement('div');
		// SubDiv.id =  SubDivId[i];
		// SubDiv.className = 'sub_panel';	
		// $('#filter_panel')[0].appendChild(SubDiv);	
		var testDiv = document.createElement('div');
		testDiv.id = 'subpanel_whole_' + i;
		$('#filter_panel')[0].appendChild(testDiv);

		// var tplhtml = '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">Panel title</h3></div><div class="panel-body">Panel content</div></div>';
		//var tplhtml = '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title"><%= subpaneltitle %></h3></div><div class="panel-body" id=<%=subpanelid%> ></div></div>';
		var tplhtml = '<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar margin-bottom-7"><span><%= subpaneltitle %></span></div><div class="span12" id=<%=subpanelid%> ></div></div>';
		if(SubDivId[i] == 'property_p')
			tplhtml = '<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar margin-bottom-7"><span><%= subpaneltitle %></span></div><div class="span12" id=<%=subpanelid%> ></div><div class="span12" id="scatterplot_property_p" ></div></div>';
		var compiled = _.template(tplhtml);
		
		testDiv = document.getElementById('subpanel_whole_' + i);
		testDiv.innerHTML = testDiv.innerHTML + compiled(
		{
			subpaneldiv: SubDivId[i] + '_div',
			subpanelid: SubDivId[i],
			subpaneltitle: SubDivTitle[i]
		});		
	}
	
	//draw buttons in three sub panel
	drawButtonsinObjectPanel();
	drawButtonsinPropertyPanel();

	drawObjectPart();
	drawFilterPart();
}

//draw the draggble button
function drawDragButton(parentpanelid, DrawLTPos, margin_left, margin_top){

    var expandWidth = g_CircleButtonRadius * 2.5;

    if(margin_left == undefined)
    	margin_left = "0px";
    if(margin_top == undefined)
    	margin_top = "0px";
	
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
    .style("margin-left", margin_left)//'-15px')
    .style('margin-top', margin_top)//'3px');

    var drawButton = expandSvg.append('g')
    .attr('id', parentpanelid + '_drag_button');

    drawButton.append('circle')
    .attr('x', 0)
    .attr('y', 0)
    .style('z-index', 105)
    // .attr('x')
    .attr("r", g_CircleButtonRadius)
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
		console.log(' drag start ', d);
 		d3.event.sourceEvent.stopPropagation(); // silence other listeners
	});

	drag.on("drag", function() {
		console.log(' draging ', d3.event.x, ', ', d3.event.y);
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

//clear the filter related
function clearFilterRelated(){
	$('#filter_panel').remove();
	$('.testrect').remove();
	g_PropertyManager.clear();
}


function drawFilterPart(){
}




