/*
	NameRenger: manage the semantic naming panel
*/

var HIGHLIGHTPAD = 3;

function NameRender(){

	var Info = {};
	
	Info.__init__ = function(){
		//console.log(" init Name Render ");

		this.m_SelectText = {};
		this.m_SelectRectonAddDiv = {};

		this.m_NamePanelWidth = 100;
		this.m_NamePanelHeight = 100;
	}

	Info.clearSelectText = function(){
		self.m_SelectText = "";
		d3.select("#name-panel").remove();
		d3.select("#hightlight-name-frame").remove();
		d3.select(".name_connector").remove();
	}

	//select some text
	Info.selectText = function(selectText){
		var self = this;

		self.m_SelectText = selectText;

		//console.log(" select Text ");

		var r =window.getSelection().getRangeAt(0).getBoundingClientRect();
		var relative = $('#addondiv')[0].getBoundingClientRect();

		self.m_SelectRectonAddDiv = {
			'x': r.left - relative.left - HIGHLIGHTPAD,
			'y': r.top - relative.top - HIGHLIGHTPAD,
			'width': r.right - r.left + HIGHLIGHTPAD * 2,
			'height': r.bottom - r.top + HIGHLIGHTPAD * 2, 
		};

		self.m_NamePanelDiv = {
			'x': self.m_SelectRectonAddDiv['x'] + self.m_SelectRectonAddDiv['width']  + 20,
			'y':  self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2 - self.m_NamePanelHeight/2,
		};
		

		self.drawHighlightRect();

		self.drawNamePanel();

		self.drawConnectors();
	}

	Info.drawConnectors = function(){
		var self = this;

		d3.select(".name_connector").remove();

		var connectorGroup = d3.select('#addondiv svg')
		.append('g')
		.attr('class', 'name_connector');

		var iCurrentObjId = g_InObjManager.getCurrentObjId();

		if(iCurrentObjId != -1){
			//get the object list
			var inObj = g_InObjManager.getInObj(iCurrentObjId);

			var liGroupId = inObj.m_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
			//console.log(" liGroupId ", liGroupId);

			var font = '16px arial';

			$.each(liGroupId, function(i, iGroupId){
				var iEleId = 'name_obj_' + i;
				var posInAdd = getPosInAddDiv(iEleId);
				self.drawConnector(posInAdd['y'] + posInAdd['height']/2.);
			});
		}
	}

	Info.drawConnector = function(yPos){
		
		var self = this;

		var connectorGroup = d3.select('.name_connector');

		var radius = 3;

		connectorGroup
		.append('line')
		.attr("x1", self.m_SelectRectonAddDiv['x'] + self.m_SelectRectonAddDiv['width'])
		.attr('y1', self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2.)
		.attr('x2', self.m_NamePanelDiv['x'])
		.attr('y2', yPos)//self.m_NamePanelDiv['y'] + self.m_NamePanelDiv['height']/2.)
		// .style('fill', 'black')
		.style('stroke', 'black')//'#0b92d9')
		.style('stroke-width', '3px');

		connectorGroup
		.append('circle')
		.style('cx', self.m_SelectRectonAddDiv['x'] + self.m_SelectRectonAddDiv['width'])
		.style('cy', self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2.)
		.style('r', radius + 'px')
		.style('stroke', '#0277BD')
		.style('stroke-width', '2px')
		.style('fill', 'black');//'#0288D1');

		connectorGroup
		.append('circle')
		.style('cx', self.m_NamePanelDiv['x'])
		.style('cy', yPos)//self.m_NamePanelDiv['y'] + self.m_NamePanelDiv['height']/2.)
		.style('r', radius + 'px')
		.style('stroke', '#0277BD')
		.style('stroke-width', '2px')
		.style('fill', 'black');//'#0288D1');


	}

	//draw the highlight rect frame
	Info.drawHighlightRect = function(){
		var self = this;
		// //console.log(" self.m_SelectRectonAddDiv['x'] ", self.m_SelectRectonAddDiv['x'], self.m_SelectRectonAddDiv['y']);
		d3.select('#hightlight-name-frame').remove();

		var update = d3.select('#addondiv svg ')
		.append('rect')
		.attr("id", 'hightlight-name-frame')
		.attr('x', self.m_SelectRectonAddDiv['x'])
		.attr('y', self.m_SelectRectonAddDiv['y'])
		.attr('width', self.m_SelectRectonAddDiv['width'])
		.attr('height', self.m_SelectRectonAddDiv['height'])
		.style('stroke', '#2196F3')
		.style('stroke-width', '2px')
		.style('fill', 'none');
	}

	//draw the name panel
	Info.drawNamePanel = function(){
		var self = this;

		//remove
		d3.select('#name-panel').remove();

		namePanel = d3.select('#addondiv')
		.append('div')
		.attr('id', 'name-panel')
		// .attr('class', 'background_panel')
		.style('position', 'absolute')
		.style('left', self.m_NamePanelDiv['x'] + 'px')
		.style('top', self.m_NamePanelDiv['y'] + 'px');
		// .style('width', self.m_NamePanelWidth + 'px')
		// .style('height', self.m_NamePanelHeight + 'px');
		$('#name-panel').css("pointer-events", "all"); 

		//add the label span
		self.addLabelSpans();

		//reset the top of namepanel
		self.m_NamePanelHeight = $('#name-panel').height();
		//console.log(" ERROR!! ", self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2 - self.m_NamePanelHeight/2 );
		namePanel.style('top', self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2 - self.m_NamePanelHeight/2 + 'px')
		self.m_NamePanelDiv['y'] = self.m_SelectRectonAddDiv['y'] + self.m_SelectRectonAddDiv['height']/2 - self.m_NamePanelHeight/2;
		self.m_NamePanelDiv['height'] = self.m_NamePanelHeight;
		self.m_NamePanelDiv['width'] = $('#name-panel').width();

	
	}

	//add current label spans
	Info.addLabelSpans = function(){		

		var self = this;
		var iCurrentObjId = g_InObjManager.getCurrentObjId();

		if(iCurrentObjId != -1){

			//get the object list
			var inObj = g_InObjManager.getInObj(iCurrentObjId);
		
			var liGroupId = inObj.m_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
			//console.log(" liGroupId ", liGroupId);

			//draw origin groups
			var object_div = document.getElementById('name-panel'); 

			var font = '16px arial';

			$.each(liGroupId, function(i, iGroupId){

				var attrs = inObj.m_ObjectGroupManager.getAttrsbyGroupId(iGroupId);
				var groupType = attrs['type'];
				var buttonType, buttonDefaultName;
				var liEles = [];
				switch(groupType)
				{
					case 'origin':
						// liEles = inObj.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
						buttonType = 'origin_group_span';
						break;
					case 'default_compound':
					case 'compound':	
						// liEles = inObj.m_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
						buttonType = 'compound_group_span';
						break;
					case 'propertygroup':
						// liEles = inObj.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
						buttonType = 'property_group_span';
						break;				
					case 'logic':
					case 'logic_compound':
						// liEles = inObj.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
						buttonType = 'logic_group_span';
						break;
				}

				// if(self.m_MaxEleNum < liEles.length)
				// 	self.m_MaxEleNum = liEles.length;

				// inObj.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				var buttonLabel = attrs['name']; //+ ':' + liEles.length;

				var textSize = getTextSize(buttonLabel, font);

				var gap = 5;
			
				var buttonhtml = 
				// '<div style="float: left; width: 30%; height: 100%; padding: 3px">'+
					'<div class = "name_obj_div" id=<%=name_obj_id%> >' + 
			 			'<span class="object_button_span name_object_span" style="display:block; width: <%=width%>; height: <%=height%>; margin: 5px; text-align: center;" groupId=<%=groupId%> ><%=buttonLabel%></span>' +
			 		'</div>';
		 			// '<div style="position:relative">' +		
						// '<p value=<%=groupId%> style="text-align: center;"></p>'+
		 				// '<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
	 				// '</div>' +
				// '</div>';
			
				var compiled = _.template(buttonhtml);	

				// //console.log(' button html ', compiled({
				// 	buttonLabel: buttonLabel,
				// 	ID: 'object_span_' + iGroupId,
				// 	buttonValue: iGroupId,
				// 	buttonType: buttonType,
				// }));

				object_div.innerHTML = object_div.innerHTML + compiled({
					// objdivclass: 'object_wholediv_' + self.m_iId, 
					// objclass: 'object_span' + self.m_iId,
					// objhisclass: 'object_his' + self.m_iId,
					// objhisid: 'object_his_' + self.m_iId + '_'+ iGroupId,
					name_obj_id: "name_obj_" + i,
					width: textSize.w + 2 * gap + 'px',
					height: textSize.h + 2 * gap + 'px',
					buttonLabel: buttonLabel,
					// ID: 'p_' + self.m_iId + '_object_span_' + iGroupId,
					groupId: iGroupId,
					// buttonType: buttonType,
					// eleNum: liEles.length,
				});	
			});			
			
			$('.name_object_span').click(function(event){
				// //console.log('DELETE button click ');
				event.stopPropagation();
				var iGroupId = parseInt(this.getAttribute('groupId'));
				//console.log("select igroupid", iGroupId);
				//'#p_' + self.m_iId + 
				$("#p_" + inObj.m_iId + '_object_span_' + iGroupId + ' .object_title_span').find('p')[0].innerText = self.m_SelectText;// + ":" + liEles.length;
				inObj.m_ObjectGroupManager.setGroupNamebyId(iGroupId, self.m_SelectText);
				
				d3.select("#name-panel").remove();
				d3.select("#hightlight-name-frame").remove();
				d3.select(".name_connector").remove();
				$('#addondiv').css("pointer-events", "all"); 

    			$('.function_button-clicked').removeClass('function_button-clicked');

				document.onmouseup = "";//doSomethingWithSelectedText;
				document.onkeyup = ""; //doSomethingWithSelectedText;
				// self.deleteGroup(iGroupId);
			});

			// $('.object_title_span').bind('dblclick', function() {
			// 	// //console.log(" button span clicked! ");
			// 	// g_renameObject= this;
			// 	self.m_InObj.setRenameObject(this);
			// 	$('#rename_object_dialog' + self.m_iId).dialog('open');
		 //    }).blur(
		 //        function() {
		 //        $(this).attr('contentEditable', false);
		 //    });
		
		}


	}

	Info.__init__();
	return Info;
}

function getPosInAddDiv(iEleId){
	var r = $('#' + iEleId)[0].getBoundingClientRect();
	var relative = $('#addondiv')[0].getBoundingClientRect();

	var rect = {
		'x': r.left - relative.left - HIGHLIGHTPAD,
		'y': r.top - relative.top - HIGHLIGHTPAD,
		'width': r.right - r.left + HIGHLIGHTPAD * 2,
		'height': r.bottom - r.top + HIGHLIGHTPAD * 2, 
	};
	return rect;
}

function getPosbyDOMInAddDiv(Dom){
	var r = $(Dom)[0].getBoundingClientRect();
	var relative = $('#addondiv')[0].getBoundingClientRect();

	var rect = {
		'x': r.left - relative.left - HIGHLIGHTPAD,
		'y': r.top - relative.top - HIGHLIGHTPAD,
		'width': r.right - r.left + HIGHLIGHTPAD * 2,
		'height': r.bottom - r.top + HIGHLIGHTPAD * 2, 
	};
	return rect;
}