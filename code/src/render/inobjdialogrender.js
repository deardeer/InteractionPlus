
/*
	InObjDialagRender: manage the rendering of dialog, 
	1) object/property rename dialog
*/

function InObjDialogRender(iId, objectGroupManager, propertyManager){
	var Info = {};
	Info.__init__ = function(iId, objectGroupManager, propertyManager){
		this.m_iId = iId;
		this.m_ObjectGroupManager = objectGroupManager;
		this.m_PropertyManager = propertyManager;

		this.m_PropertyDivId = 'property_p_' + this.m_iId;
		this.m_RenamePropertyDialogId = "rename_property_dialog_" + this.m_iId; 
		this.m_RenameInputId = 'propertyname_input_' + this.m_iId;

		this.m_ObjectDivId = "object_p_" + this.m_iId;
		this.m_RenameObjectDialogId = "rename_object_dialog" + this.m_iId;
		this.m_RenameObjectInputId = "objectname_input" + this.m_iId;

		this.m_RenameProperty = {};
	}

	Info.setRenameProperty = function(renameProperty){
		//console.log(" setRenameProperty ", renameProperty);
		this.m_RenameProperty = renameProperty;
	}


	Info.setRenameObject = function(renameObject){
		//console.log(" setRenameObject ", renameObject);
		this.m_RenameObject = renameObject;
	}



	//add a rename dialog, default hide
	Info.addObjReNameDialog = function(){
		var self = this;
		if($('#' + self.m_RenameObjectDialogId).length != 0)
			return;

		var dialoghtml = 
		'<div id=<%=dialogId%> title="Rename" hidden="hidden">'+
			'<input id=<%=inputId%>></input>'+
		'</div>'

		var compiled = _.template(dialoghtml);

		testDiv = document.getElementById(self.m_ObjectDivId);
		
		testDiv.innerHTML = testDiv.innerHTML + compiled({
			dialogId: self.m_RenameObjectDialogId,
			inputId: self.m_RenameObjectInputId,
		});	

		$("#" + self.m_RenameObjectDialogId ).dialog({
			autoOpen: false,
			dialogClass: 'dialog_panel',
		    buttons: {
		        "Ok": function(){
		        	self.renameObject();
		            $(this).dialog("close");
		       	 },
		       	"Cancel": function(){
		       		$(this).dialog('close');
		       	}
	    	}
		});
	}


	//add a rename dialog, default hide
	Info.addProReNameDialog = function(){		
		var self = this;
		if($('#' + self.m_RenamePropertyDialogId).length != 0)
			return;

		var dialoghtml = 
		'<div id=<%=dialogId%> title="Rename" hidden="hidden">' +
			'<input id=<%=renameinputid%>></input>'+
		'</div>'
		//'<div id="dialog-rename" title="Empty the recycle bin?" style="display: none"><p><span style="float: left; margin: 0 7px 20px 0;"></span>Rename</p></div>';
		//'<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar"><%= subpaneltitle %></div><div class="span12" id=<%=subpanelid%> ></div></div>';
		var compiled = _.template(dialoghtml);

		testDiv = document.getElementById(self.m_PropertyDivId);
		
		testDiv.innerHTML = testDiv.innerHTML + compiled({
			dialogId: self.m_RenamePropertyDialogId,
			renameinputid: self.m_RenameInputId,
		});	

		$("#" + self.m_RenamePropertyDialogId).dialog({
			autoOpen: false,
			dialogClass: 'dialog_panel',
		    buttons: {
		        "Ok": function() {
		        	self.renameProperty();
		            $(this).dialog("close");
		       	 },
		       	"Cancel": function(){
		       		$(this).dialog('close');
		       	}
	    	}
		});
	}

	Info.renameProperty = function(){
		var self = this;
		//console.log('rename! ', self.m_RenameProperty);
		//get the input value
		var nameInput = $('#' + self.m_RenameInputId);
		var newName = nameInput.val();
		//console.log('new name ', newName);

		//compute the width of label and dis div
		var prodiv = $(self.m_RenameProperty).parents('.propertyrow'); //g_renameProperty
		var iPropertyId = parseInt(prodiv.attr('propertyid'));
		var iSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		
		//update the property bag 
		self.renamePropertyOfGroup(iSelectedGroupId, iPropertyId, newName);

		//update inter
		g_InteractionRecorder.addRenamePropertyCount();
	}

	Info.renamePropertyOfGroup = function(iSelectedGroupId, iPropertyId, newName){

		//console.log(" new name ", newName);

		//check for length
		if(newName.length > 5){
			newName = newName.slice(0, 4);
			newName += '.';
		}

		
		var self = this;
		var prodiv = $(self.m_RenameProperty).parents('.propertyrow');
		var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectedGroupId);
		propertyBag.setPropertyName(iPropertyId, newName);

		//change the out-looking
		self.m_RenameProperty.innerText = newName;


		var font = '12px arial';
		var labelDivWidth, disDivWidth;
		var labelTextSize = getTextSize(self.m_RenameProperty.innerText, font);
		var gapWidth = 15;
		var labelDisGap = 5;
		var labelDivWidth = labelTextSize['w'] + gapWidth;
		var disDivWidth = prodiv.width() - labelDivWidth - labelDisGap;

		//console.log(' disDivwidth: ', disDivWidth, ' labelDivWidth ', labelDivWidth);
		
		/* 1. update label div */
		var labelDiv = $(self.m_RenameProperty).parents('.propertylabel');
		labelDiv.width(labelDivWidth + 'px');

		/* 2. update the dis div */
		var disDiv = prodiv.children('.distri_div');
		disDiv.width(disDivWidth + 'px');

		/* 3. update the svg */
		var xAxisLength = disDivWidth;

		//'p_' + self.m_iId + 'dis_' + iPId;
		var svg = $('#p_' + self.m_iId + 'dis_' + iPropertyId + ' svg');
		svg.attr('width', disDivWidth + 'px');

		var xScale = propertyBag.getXScaleOfPropertyId(iPropertyId);
		xScale.range([0, xAxisLength]);

		var disCountList = propertyBag.getDis(iPropertyId);

		var barWidth = xAxisLength/disCountList.length;
		var barRatio = 0.95;//0.8;

		//draw the background rect, hiddle initiately
		d3.selectAll('#p_' + self.m_iId + 'dis_' + iPropertyId + ' .barrect')
		.attr('x', function(d, i){
			return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
		})
		.attr('width', function(){
			return barWidth * barRatio;
		});

		d3.selectAll('#p_' + self.m_iId + 'dis_' + iPropertyId + ' .filter_barrect')
		.attr('x', function(d, i){
			return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
		})
		.attr('width', function(){
			return barWidth * barRatio;
		});
	}

	Info.renameObject = function(){
		var self = this;

		//console.log('rename! ', self.m_RenameObject);
		var iGroupId = parseInt(self.m_RenameObject.getAttribute('value'));
		var attr = self.m_ObjectGroupManager.getAttrsbyGroupId(iGroupId);

		//get the input value
		var nameInput = $('#'  + self.m_RenameObjectInputId);
		var newName = nameInput.val();
		//console.log('new name ', newName);

		// switch(attr['type']){
		// 	case 'origin':
		// 		liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		// 		buttonType = 'origin_group_span';
		// 		break;
		// 	case 'logic_compound':
		// 	case 'default_compound':
		// 	case 'compound':	
		// 		liEles = self.m_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
		// 		buttonType = 'compound_group_span';
		// 		break;
		// 	case 'propertygroup':
		// 		liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		// 		buttonType = 'property_group_span';
		// 		break;
		// 	case 'logic':
		// 		liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		// 		buttonType = 'logic_group_span';
		// 		break;
		// }

		//change the out-looking
		//console.log(" rename! XX ", $(self.m_RenameObject).find('p')[0]);
		$(self.m_RenameObject).find('p')[0].innerText = newName;// + ":" + liEles.length;

		//update the object name
		self.m_ObjectGroupManager.setGroupNamebyId(iGroupId, newName);

		//update inter info
		g_InteractionRecorder.addRenameObjectCount();

		// $('#'  + self.m_RenameObjectInputId)[0].innerHTML = "";
	}


	Info.__init__(iId, objectGroupManager, propertyManager);
	return Info;
}

