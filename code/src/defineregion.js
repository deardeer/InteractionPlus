/*
	user input the information of the defined area
*/

function RegionInfo(){
	var Info = new Object;

	//update inter
	g_InteractionRecorder.addRegionCreateCount();

	//static 
	Info.m_InputPanelWidth = 150;
	Info.m_InputPanelHeight = 200;

	Info.m_liRegionType = ['Visualization', 'Animation', 'Skip']; //'Table', 'Text', //'table', 'text', 'svis': static vis, 'avis': animated visualization
		
	//define
	Info.m_DefinedRegionType = {};//the defined region type

	//console.log(' initiate region info ');
	Info.selectRegionType = function(regionType){
		this.m_DefinedRegionType = regionType;
	}
	Info.getRegionTypes = function(){
		return this.m_liRegionType;
	}
	return Info;
};

var g_RegionInfo = new RegionInfo();

//entry to define the region
function defineRegion(){

	//console.log(' begin region definition ');

	// drawTypeInputPanel_Boostrap(); //current disabled 
	finishDefinition();
	// drawTypeInputPanel();
}

//draw the input button panel by bootstrap
function drawTypeInputPanel_Boostrap(){
	var self = this;
	//div
	var iDiv = document.createElement('div');
	iDiv.id = 'type_panel';
	iDiv.className = 'background_panel';
	// iDiv.className = 'button panel';
	// document.getElementsByTagName('body')[0].appendChild(iDiv);
	$('#addondiv')[0].appendChild(iDiv);

	//filter panel
	var DrawLTPos = getDefaultDrawLTPoint();
	$("#type_panel").css({
		position: 'absolute',
		top: DrawLTPos['y'],
		left: DrawLTPos['x']
	});
	// //console.log(' draw type panel ', DrawLTPos['x'], ', ', DrawLTPos['y']);

	//button
	$.each(g_RegionInfo.getRegionTypes(), function(i, type){
		var button = document.createElement("button");
		button.value = type;
		if(type == 'Skip')
			button.className = 'btn btn-primary btn-warning btn-block';
		else
			button.className = 'btn btn-primary btn-sm btn-block';
		var t = document.createTextNode(type);
		button.appendChild(t);

		button.onclick = function(){
			self.onClick(this.value);
		}
		// document.getElementById("bugdiv").appendChild(para);
		$("#type_panel")[0].appendChild(button);	
	});	
}

function onClick(type){
	//console.log('data' , type);
	g_RegionInfo.selectRegionType(type);

	clearDefinePanel();
	finishDefinition();
}

//call when finishing the region definition
function finishDefinition(){
	//get the defined mask type: todo
	// g_regionMask.getDefinedMask();
	//delete the elements and pros
    detectElements();
    //fade unselected 
    // fadeUndetected();
    //reset the cross filter
    resetCrossFilter();
    // generate the original object groups	
    g_ObjectGroupManager.generateOriginalOGroup();
    //detect the default linked groups
    //generate "default_compound"
    g_ObjectGroupManager.detectDefaultLinkedGroups();
 
    //console.log('generateLegend()');
    drawFilter();    
}

//remove all 
function clearDefinePanel(){
	$('#type_panel').remove();
}