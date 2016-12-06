function LogicCompositionManager(iId, InObj, ObjectGroupManager){
	var Info = new Object;
	Info.m_bInitiate = false;
	Info.m_bCompound = false;
	Info.m_liResultEleId = [];
	Info.m_iToCGroupId = -1;
	Info.m_ToOperate = "";

	Info.m_bValid = true;

	Info.__init__ = function(iId, InObj, ObjectGroupManager){
		this.m_iId = iId;
		this.m_InObj = InObj;
		this.m_ObjectGroupManager = ObjectGroupManager;
		this.m_ObjectPanelDivId = "object_p_" + this.m_iId;
		this.m_ComposeDialogId = "compose_object_dialog_" + this.m_iId; 
		this.m_ComposeObjectInputId = "composeobject_name_input_" + this.m_iId;
		this.m_ComposeObjectNumSpanId = "composeobject_number_span_" + this.m_iId; 

		this.m_ComposeDisplayDivId = "compose_display_div_" + this.m_iId;
		this.m_ComposeObjectListId = "composeobject_objectdiv_" + this.m_iId;
		this.m_ComposeOperationId = "composeoperation_objectdiv_" + this.m_iId;
	}

	Info.clear = function(){
		//console.log(" clear !!! ");
		Info.m_bValid = true;
		this.m_bInitiate = false;		
		this.m_liResultEleId = [];
		this.m_iToCGroupId = -1;
		this.m_ToOperate = "";
	}
	Info.setCurrentGroupId = function(iGroupId){
		var self = this;
		this.m_iToCGroupId = iGroupId;
		this.compute();
		//console.log(" filter ele id size ", this.m_liResultEleId.length);
		//update the number		
		$('#' + self.m_ComposeObjectNumSpanId)[0].textContent = ":" + this.getResultEleIds().length;
	}
	Info.setCurrentOperation = function(Operation){
		this.m_ToOperate = Operation;
	}
	//compute the result ele id list according to setted group and operation
	Info.compute = function(){	
		var self = this;
		if(this.m_ToOperate == ""){
			if(this.m_bInitiate == false){
				var groupType = self.m_ObjectGroupManager.getGroupType(this.m_iToCGroupId);
				var liEleId = [];	
				
				if(groupType == 'compound' || groupType == 'logic_compound' || groupType == 'default_compound')
				{
					this.m_bCompound = true;
					liEleId = self.m_ObjectGroupManager.getEleGroupIdsbyGroupId(this.m_iToCGroupId);
				}else{
					this.m_bCompound = false;
					liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(this.m_iToCGroupId);
				}

				//console.log(" Compute ", this.m_iToCGroupId, " operaiton ", this.m_ToOperate);

				//not setted, the first
				this.m_liResultEleId = liEleId;
				this.m_bInitiate = true;	
			}else{
				m_bValid = false;
				// alert('Invalid Composition');
			}
		}else{
			switch(this.m_ToOperate){
				case "union":
					this.unionGroup(this.m_iToCGroupId);
					break;
				case "intersection":
					this.intersectGroup(this.m_iToCGroupId);
					break;
				case "complementary":
					this.complementGroup(this.m_iToCGroupId);
					break; 
			}

			if(!this.m_bValid){
				this.m_liResultEleId = [];
			}
			//clear the operation
			this.m_ToOperate = "";
			this.m_iToCGroupId = -1;
		}
	}
	Info.unionGroup = function(iGroupId){
		var self = this;
		var thisGroupType = self.m_ObjectGroupManager.getGroupType(iGroupId);

		var liEleId = [];
		if(this.m_bCompound){
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				liEleId = self.m_ObjectGroupManager.getEleGroupIdsbyGroupId(iGroupId);
			else{
				this.m_bValid = false;
			}
				// alert('Invalid Composition');
		}else{
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				this.m_bValid = false;
				// alert('Invalid Composition');
			else
				liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		}
		for (var i = 0; i < liEleId.length; i++) {
			var iEleId = liEleId[i];
			if(self.m_liResultEleId.indexOf(iEleId) == -1)
				self.m_liResultEleId.push(iEleId);
		};		
	}
	Info.intersectGroup = function(iGroupId){
		var self = this;
		var thisGroupType = self.m_ObjectGroupManager.getGroupType(iGroupId);
	
		// var liEleId = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		var liEleId = [];
		if(this.m_bCompound){
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				liEleId = self.m_ObjectGroupManager.getEleGroupIdsbyGroupId(iGroupId);
			else
				this.m_bValid = false;
				// alert('Invalid Composition');
		}else{
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				this.m_bValid = false;
				// alert('Invalid Composition');
			else
				liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		}

		var liNewResult = [];
		for (var i = 0; i < liEleId.length; i++) {
			var iEleId = liEleId[i];
			if(self.m_liResultEleId.indexOf(iEleId) != -1)
				liNewResult.push(iEleId);
		};
		self.m_liResultEleId = liNewResult;
	}
	Info.complementGroup = function(iGroupId){
		var self = this;
		// var liEleId = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		var thisGroupType = self.m_ObjectGroupManager.getGroupType(iGroupId);
	
		var liEleId = [];
		if(this.m_bCompound){
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				liEleId = self.m_ObjectGroupManager.getEleGroupIdsbyGroupId(iGroupId);
			else
				m_bValid = false;
				// alert('Invalid Composition');
		}else{
			if(thisGroupType == 'compound' || thisGroupType == 'logic_compound' || thisGroupType == 'default_compound')
				m_bValid = false;
				// alert('Invalid Composition');
			else
				liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		}

		var liAllEleId = self.m_liResultEleId;
		var liNewAllEleId = [];
		//console.log(" complement ", this.m_bCompound, ' , liEleId ', liEleId, ' , ', liAllEleId);

		for(var i = 0; i < liAllEleId.length; i ++){
			var iEleId = liAllEleId[i];
			if(liEleId.indexOf(iEleId) == -1)
				liNewAllEleId.push(iEleId);
		}
		self.m_liResultEleId = liNewAllEleId;
	}
	Info.isDefinitionValid = function(){
		return this.m_bValid;
	}
	Info.getResultEleIds = function(){
		// var liResultEleId = [];
		// if(this.m_bCompound){
		// 	for (var i = 0; i < this.m_liResultEleId.length; i++) {
		// 		var iGroupId = this.m_liResultEleId[i];
		// 		var liEleId = g_ElementProperties.getElementIdsofEleGroup(iGroupId);
		// 		liResultEleId
		// 	};
		// }else
		// 	liResultEleId = this.m_liResultEleId;
		return this.m_liResultEleId;
	}
	//return whether the result is by (compound, logic_compound, default_compound) group
	Info.isResultCompound = function(){
		return this.m_bCompound;
	}

	Info.addObjectCompositionDialog = function(){

		var self = this;

		var dialoghtml = 
		'<div id=<%=composedialogId%> title="Logic Composition" hidden="hidden">'+
			'<div>'+
				'<span style="font-size:12px">Name <input id=<%=composeoinputId%> style="width:50%;"></input>'+
				'<span id=<%=composenumId%> style="font-size:12px"></span></span>'+
			'</div>'+
			'<div id=<%=composedisdivId%> class="innerdiv_dialog dash-gray-border" style="height:50px">'+
				'<span style="font-size:12px">Composition<br></span>'+
			'</div>'+
			'<div class="innerdiv_dialog">'+
				'<span style="font-size:12px">Object<br></span>'+
				'<div id=<%=composeobjectlistId%> ></div>'+
				'<div>'+
					'<span style="font-size:12px">Set Operation<br></span>'+
					'<div id=<%=composeoperationId%> >'+
					'</div>'+
				'</div>'+
			'</div>'+
		'</div>';
		var compiled = _.template(dialoghtml);

		testDiv = document.getElementById(self.m_ObjectPanelDivId);
		// //console.log("")
		
		testDiv.innerHTML = testDiv.innerHTML + compiled({
			composedialogId: self.m_ComposeDialogId,
			composeoinputId: self.m_ComposeObjectInputId, 
			composenumId: self.m_ComposeObjectNumSpanId,
			composedisdivId: self.m_ComposeDisplayDivId, //compose_display_div
			composeobjectlistId: self.m_ComposeObjectListId, //composeobject_objectdiv
			composeoperationId: self.m_ComposeOperationId,//composeoperation_objectdiv
		});	

		$("#" + self.m_ComposeDialogId ).dialog({
			autoOpen: false,
			dialogClass: 'dialog_panel',
		    buttons: {
		        "Compose": function(){
		        	self.composeObjects();
		            $(this).dialog("close");
		       		$('#' + self.m_ComposeObjectInputId)[0].value = "";
		       		self.clear();

		       	 },
		       	"Cancel": function(){
		       		//console.log(" [0] Cancel");
		       		$('#' + self.m_ComposeObjectInputId)[0].value = "";
		       		self.clear();
		       		$(this).dialog('close');
		       		//console.log(" [1] Cancel");
		       	}
	    	}
		});
	}

	Info.drawObjectsInComposeDialog = function(){
		
		var self = this;

		//clear the buttons
		$('#' + self.m_ComposeDialogId + ' .object_compose_span').remove();

		//get property
		var liGroupId = self.m_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();

		var object_div = document.getElementById(self.m_ComposeObjectListId); //composeobject_objectdiv 

		$.each(liGroupId, function(i, iGroupId){
			var attrs = self.m_ObjectGroupManager.getAttrsbyGroupId(iGroupId);
			var groupType = attrs['type'];
			var buttonType, buttonDefaultName;
			var liEles = [];
			switch(groupType)
			{
				case 'origin':
					liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
					buttonType = 'origin_group_span';
					break;
				case 'default_compound':
				case 'logic_compound':
				case 'compound':	
					liEles = self.m_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
					buttonType = 'compound_group_span';
					break;
				case 'propertygroup':
					liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
					buttonType = 'property_group_span';
					break;
				case 'logic':
					liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
					buttonType = 'logic_group_span';
					break;
			}
			self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			var buttonLabel = attrs['name'] + ':' + liEles.length;
			//console.log(" button label ", buttonLabel);
		
			var buttonhtml = 
			'<span class="object_compose_span object_button_span_compose <%=buttonType%>" buttontype=<%=buttonType%> buttonlabel=<%=buttonLabel%> buttonvalue=<%=buttonValue%> >'+
				'<div style="position:relative">'+
					'<span class="object_title_span"><%=buttonLabel%></span>'+
				'</div>'+
			'</span>'; 

			var compiled = _.template(buttonhtml);	

			object_div.innerHTML = object_div.innerHTML + compiled({
				buttonLabel: buttonLabel,
				buttonValue: iGroupId,
				buttonType: buttonType,
			});	
		});

		//click event
		$(".object_compose_span").bind('click', function(){
			//console.log(" object composed span click ");

			var display_div = document.getElementById(self.m_ComposeDisplayDivId);//compose_display_div 

			var buttontype = this.getAttribute('buttontype');
			var buttonvalue = this.getAttribute('buttonvalue');
			var buttonlabel = this.getAttribute('buttonlabel');
			var buttonhtml = '<span class="object_compose_span object_button_span_compose <%=buttonType%>" buttontype=<%=buttonType%> value=<%=buttonValue%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
			var compiled = _.template(buttonhtml);	
			display_div.innerHTML = display_div.innerHTML + compiled({
				buttonLabel: buttonlabel,
				buttonValue: buttonvalue,
				buttonType: buttontype,
			});
			//update the logic composition
			//console.log(" click group id ", buttonvalue);
			self.setCurrentGroupId(buttonvalue);
			$('#' + self.m_ComposeObjectNumSpanId)[0].textContent = ":" + self.getResultEleIds().length;
		});
	}

	Info.drawLogicOperaionsInComposeDialog = function(){
		
		var self = this;

		//clear the buttons
		$('#' + self.m_ComposeDialogId + ' .operation_compose_span').remove();

		//get property
		var liOperation = ['&#8746', '&#8745', 'C'];
		var liOperationName = ['union', 'intersection', 'complementary'];

		var object_div = document.getElementById(self.m_ComposeOperationId);//composeoperation_objectdiv 

		$.each(liOperation, function(i, operation){	
			var buttonLabel = operation;
			var buttonhtml = '<span class="operation_compose_span object_button_span_compose" style="background: #F0AD4E; width: 15px; text-align: center;" value=<%=buttonValue%> buttonlabel=<%=buttonLabel%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
			var compiled = _.template(buttonhtml);	

			object_div.innerHTML = object_div.innerHTML + compiled({
				buttonValue: liOperationName[i],
				buttonLabel: operation,
			});	
		});

		//click event
		$(".operation_compose_span").bind('click', function(){
			//console.log(" operation composed span click ");

			var display_div = document.getElementById(self.m_ComposeDisplayDivId); //compose_display_div 

			var value = this.getAttribute('value');
			var buttonlabel = this.getAttribute('buttonlabel');

			var buttonhtml = '<span class="operation_compose_span object_button_span_compose" style="background: #F0AD4E; width: 15px; text-align: center;" value=<%=buttonValue%> buttonlabel=<%=buttonLabel%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
			var compiled = _.template(buttonhtml);	
			display_div.innerHTML = display_div.innerHTML + compiled({
				buttonValue: value,
				buttonLabel: buttonlabel,
			});
			var operation = "";
			//console.log("operation value ", value);
			// switch(value){
			// 	case '&#8746':
			// 	//console.log('1');
			// 		operation = "union";
			// 		break;
			// 	case '&#8745':
			// 		//console.log('2');
			// 		operation = "intersection";
			// 		break;
			// 	case 'C':
			// 		//console.log('3');
			// 		operation = "complementary";
			// 		break;
			// }
			self.setCurrentOperation(value);
		});
	}

	Info.defineLogicComposition = function(){	
		var self = this;
		self.clear();
		$('#' + self.m_ComposeDialogId).dialog('open');
		self.drawObjectsInComposeDialog();
		self.drawLogicOperaionsInComposeDialog();
	}

	Info.composeObjects = function(){

		var self = this;

		//console.log(" compose object ");

		//console.log(" g_LogicCompositionManager.isDefinitionValid() ", self.isDefinitionValid());

		if(!self.isDefinitionValid())
			return;

		//update interaciton
		var liGroupId = self.m_ObjectGroupManager.getGroupIdList();
		//console.log(" [2] composed ");
		for (var i = 0; i < liGroupId.length; i++) {
			var iGroupId = liGroupId[i];
			//console.log(' iGroup ', iGroupId, ' Ele Id length ', self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
		};

		g_InteractionRecorder.addLogicCount();

		//console.log(" [3] composed");
		for (var i = 0; i < liGroupId.length; i++) {
			var iGroupId = liGroupId[i];
			//console.log(' iGroup ', iGroupId, ' Ele Id length ', self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
		};

		//create a new logic group
		var name = $('#' + self.m_ComposeObjectInputId)[0].value;
		var liEleId = self.getResultEleIds();


		//console.log(" [1] composed");
		for (var i = 0; i < liGroupId.length; i++) {
			var iGroupId = liGroupId[i];
			//console.log(' iGroup ', iGroupId, ' Ele Id length ', self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
		};

		//console.log(" FILTER compose object ", liEleId.length, name, $('#' + self.m_ComposeObjectInputId)[0]);

		var attrs = {};

		if(this.isResultCompound()){
			//compound
			attrs['type'] = 'logic_compound';
			attrs['value'] = 'logic_compound';
			attrs['name'] = name;
		}else{
			attrs['type'] = 'logic';
			attrs['value'] = 'origin';
			attrs['name'] = name;
		}

		//create the new group
		self.m_ObjectGroupManager.addNewGroup(liEleId, attrs);

		//update the button part in the object panel
		self.m_InObj.successCompospeObject();// drawObjectButtons();
	}

	Info.__init__(iId, InObj, ObjectGroupManager);
	return Info;
}

var g_LogicCompositionManager = new LogicCompositionManager;


function addObjectCompositionDialog(){	
	var self = this;

	var dialoghtml = '<div id="compose_object_dialog" title="Logic Composition" hidden="hidden"><div><span style="font-size:12px">Name <input id="composeobject_name_input" style="width:50%;"></input><span id="composeobject_number_span" style="font-size:12px"></span></span></div><div id="compose_display_div" class="innerdiv_dialog dash-gray-border" style="height:50px"><span style="font-size:12px">Composition<br></span></div><div class="innerdiv_dialog"><span style="font-size:12px">Object<br></span><div id="composeobject_objectdiv" ></div><div><span style="font-size:12px">Set Operation<br></span><div id="composeoperation_objectdiv" ></div></div></div></div>'
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('object_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#compose_object_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'dialog_panel',
	    buttons: {
	        "Compose": function(){
	        	self.composeObjects();
	            $(this).dialog("close");
	       		$('#composeobject_name_input')[0].value = "";
	       		g_LogicCompositionManager.clear();

	       	 },
	       	"Cancel": function(){
	       		$('#composeobject_name_input')[0].value = "";
	       		g_LogicCompositionManager.clear();
	       		$(this).dialog('close');
	       	}
    	}
	});
}

function drawObjectsInComposeDialog(){
		
	//clear the buttons
	$('.object_compose_span').remove();

	//get property
	var liGroupId = g_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();

	var object_div = document.getElementById('composeobject_objectdiv'); 

	$.each(liGroupId, function(i, iGroupId){
		var attrs = g_ObjectGroupManager.getAttrsbyGroupId(iGroupId);
		var groupType = attrs['type'];
		var buttonType, buttonDefaultName;
		var liEles = [];
		switch(groupType)
		{
			case 'origin':
				liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				buttonType = 'origin_group_span';
				break;
			case 'default_compound':
			case 'logic_compound':
			case 'compound':	
				liEles = g_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
				buttonType = 'compound_group_span';
				break;
			case 'propertygroup':
				liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				buttonType = 'property_group_span';
				break;
			case 'logic':
				liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				buttonType = 'logic_group_span';
				break;
		}
		g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		var buttonLabel = attrs['name'] + ':' + liEles.length;
		//console.log(" button label ", buttonLabel);
	
		var buttonhtml = '<span class="object_compose_span object_button_span_compose <%=buttonType%>" buttontype=<%=buttonType%> buttonlabel=<%=buttonLabel%> buttonvalue=<%=buttonValue%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
		var compiled = _.template(buttonhtml);	

		object_div.innerHTML = object_div.innerHTML + compiled({
			buttonLabel: buttonLabel,
			buttonValue: iGroupId,
			buttonType: buttonType,
		});	
	});

	//click event
	$(".object_compose_span").bind('click', function(){
		//console.log(" object composed span click ");

		var display_div = document.getElementById('compose_display_div'); 

		var buttontype = this.getAttribute('buttontype');
		var buttonvalue = this.getAttribute('buttonvalue');
		var buttonlabel = this.getAttribute('buttonlabel');
		var buttonhtml = '<span class="object_compose_span object_button_span_compose <%=buttonType%>" buttontype=<%=buttonType%> value=<%=buttonValue%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
		var compiled = _.template(buttonhtml);	
		display_div.innerHTML = display_div.innerHTML + compiled({
			buttonLabel: buttonlabel,
			buttonValue: buttonvalue,
			buttonType: buttontype,
		});
		//update the logic composition
		//console.log(" click group id ", buttonvalue);
		g_LogicCompositionManager.setCurrentGroupId(buttonvalue);
		$('#composeobject_number_span')[0].textContent = ":" + g_LogicCompositionManager.getResultEleIds().length;
	});
}

function drawLogicOperaionsInComposeDialog(){
	
	//clear the buttons
	$('.operation_compose_span').remove();

	//get property
	var liOperation = ['&#8746', '&#8745', 'C'];
	var liOperationName = ['union', 'intersection', 'complementary'];

	var object_div = document.getElementById('composeoperation_objectdiv'); 

	$.each(liOperation, function(i, operation){	
		var buttonLabel = operation;
		var buttonhtml = '<span class="operation_compose_span object_button_span_compose" style="background: #F0AD4E; width: 15px; text-align: center;" value=<%=buttonValue%> buttonlabel=<%=buttonLabel%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
		var compiled = _.template(buttonhtml);	

		object_div.innerHTML = object_div.innerHTML + compiled({
			buttonValue: liOperationName[i],
			buttonLabel: operation,
		});	
	});

	//click event
	$(".operation_compose_span").bind('click', function(){
		//console.log(" operation composed span click ");

		var display_div = document.getElementById('compose_display_div'); 

		var value = this.getAttribute('value');
		var buttonlabel = this.getAttribute('buttonlabel');

		var buttonhtml = '<span class="operation_compose_span object_button_span_compose" style="background: #F0AD4E; width: 15px; text-align: center;" value=<%=buttonValue%> buttonlabel=<%=buttonLabel%> ><div style="position:relative"><span class="object_title_span"><%=buttonLabel%></span></div></span>'; //
		var compiled = _.template(buttonhtml);	
		display_div.innerHTML = display_div.innerHTML + compiled({
			buttonValue: value,
			buttonLabel: buttonlabel,
		});
		var operation = "";
		//console.log("operation value ", value);
		// switch(value){
		// 	case '&#8746':
		// 	//console.log('1');
		// 		operation = "union";
		// 		break;
		// 	case '&#8745':
		// 		//console.log('2');
		// 		operation = "intersection";
		// 		break;
		// 	case 'C':
		// 		//console.log('3');
		// 		operation = "complementary";
		// 		break;
		// }
		g_LogicCompositionManager.setCurrentOperation(value);
	});
}

function defineLogicComposition(){	
	g_LogicCompositionManager.clear();
	$('#compose_object_dialog').dialog('open');
	drawObjectsInComposeDialog();
	drawLogicOperaionsInComposeDialog();
}

function composeObjects(){

	//console.log(" compose object ");

	//console.log(" g_LogicCompositionManager.isDefinitionValid() ", g_LogicCompositionManager.isDefinitionValid());

	if(!g_LogicCompositionManager.isDefinitionValid())
		return;

	//update interaciton
	var liGroupId = g_ObjectGroupManager.getGroupIdList();
	//console.log(" [2] composed ");
	for (var i = 0; i < liGroupId.length; i++) {
		var iGroupId = liGroupId[i];
		//console.log(' iGroup ', iGroupId, ' Ele Id length ', g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
	};

	g_InteractionRecorder.addLogicCount();

	//console.log(" [3] composed");
	for (var i = 0; i < liGroupId.length; i++) {
		var iGroupId = liGroupId[i];
		//console.log(' iGroup ', iGroupId, ' Ele Id length ', g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
	};

	//create a new logic group
	var name = $('#composeobject_name_input')[0].value;
	var liEleId = g_LogicCompositionManager.getResultEleIds();


	//console.log(" [1] composed");
	for (var i = 0; i < liGroupId.length; i++) {
		var iGroupId = liGroupId[i];
		//console.log(' iGroup ', iGroupId, ' Ele Id length ', g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId).length);
	};

	//console.log(" FILTER compose object ", liEleId.length);

	var attrs = {};

	if(g_LogicCompositionManager.isResultCompound()){
		//compound
		attrs['type'] = 'logic_compound';
		attrs['value'] = 'logic_compound';
		attrs['name'] = name;
	}else{
		attrs['type'] = 'logic';
		attrs['value'] = 'origin';
		attrs['name'] = name;
	}

	//create the new group
	g_ObjectGroupManager.addNewGroup(liEleId, attrs);

	//update the button part in the object panel
	drawObjectButtons();
}