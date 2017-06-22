/*
	draw, interact in the object panel
*/
var g_renameObject = {};

function ObjectPanelRender(iId, inObj, objectGroupManager){

	var Info = {};

	Info.__init__ = function(iId, inObj, objectGroupManager){

		this.m_iId = iId;

		this.m_LassoDivId = 'lassodiv' + this.m_iId;
		this.m_LassoSvgId = 'lassosvg' + this.m_iId;
		this.m_ObjPanelDivId = 'object_p_' +  this.m_iId + '_div';
		this.m_RemoveDropObjId = 'remove_object_drop_div' + this.m_iId;
		this.m_InvisibleMenuId = "invisible_object_menu" + this.m_iId;
		//'p_' + self.m_iId + 'obj_li_' + groupId
		//'p_' + self.m_iId + '_object_span_' + iGroupId,

		this.m_ObjectGroupManager = objectGroupManager;//new ObjectGroupManager(this.m_iId);
		this.m_InObj = inObj;

		//console.log(" init ObjectPanelRender ", this.m_iId, this.m_ObjPanelDivId);

		this.m_MaxEleNum = 0;
	}

	//draw object part
	Info.addObjectPart = function(){
		var self = this;

		//TODO
		// self.addObjReNameDialog();
		// self.addObjectCompositionDialog();	
		// self.addSubmitDialog();

	  	// addSubmitCommentDialog();
		//drawButtonsinObjectPanel();

		self.drawObjectButtons();
	}

	//add object button
	Info.drawObjectButton = function(iGroupId){

		var self = this;

		//draw origin groups
		var object_div = document.getElementById(self.m_ObjPanelDivId);//'object_p'); 

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

		var buttonhtml = 		
			'<div style="width: 100%; height: 30px;" class="<%=objdivclass%> object_button_div" id=<%=ID%> >'+
				'<div style="float: left; width: 50%; height: 100%; padding: 3px">'+
			 		'<span class="<%=objclass%> object_button_span object_title_span <%=buttonType%>" value=<%=buttonValue%> >'+
		 			'<div style="position:relative">' +		
						'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
						'<p value=<%=buttonValue%> style="text-align: center;"><%=buttonLabel%></p>'+
		 				// '<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
	 				'</div>' +
				'</div>' +
				'<div id=<%=objhisid%> style="float: left; width: 50%; height: 100%;" num=<%=eleNum%> ></div>' +				
			'</div>'
		// '<span class="<%=objclass%> object_button_span <%=buttonType%>" id=<%=ID%> value=<%=buttonValue%> >'+
		// 	'<div style="position:relative">'+
		// 		'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
		// 		'<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
		// 		'<div><div>'
		// 	'</div>'+
		// '</span>'; 

		var compiled = _.template(buttonhtml);	

		// //console.log(' button html ', compiled({
		// 	objclass: 'object_span' + self.m_iId,
		// 	buttonLabel: buttonLabel,
		// 	ID: 'p_' + self.m_iId + '_object_span_' + iGroupId,
		// 	buttonValue: iGroupId,
		// 	buttonType: buttonType,
		// }));

		object_div.innerHTML = object_div.innerHTML + compiled({
			// objclass: 'object_span' + self.m_iId,
			// buttonLabel: buttonLabel,
			// ID: 'p_' + self.m_iId + '_object_span_' + iGroupId,
			// buttonValue: iGroupId,
			// buttonType: buttonType,
			objdivclass: 'object_wholediv_' + self.m_iId, 
			objclass: 'object_span' + self.m_iId,
			// objhisclass: 'object_his' + self.m_iId,
			objhisid: 'object_his_' + self.m_iId + '_'+ iGroupId,
			buttonLabel: buttonLabel,
			ID: 'p_' + self.m_iId + '_object_span_' + iGroupId,
			buttonValue: iGroupId,
			buttonType: buttonType,
			eleNum: liEles.length,
		});	

		//draw his
		var his = d3.select("#object_his_" + self.m_iId + '_'+ iGroupId);

		var heightraito = 0.75;
		var width = $(his[0]).width() * 0.95;
		var height = $(his[0]).height() * heightraito;
		var ratio = liEles.length/self.m_MaxEleNum;
		var rectwidth = width * ratio;
		//console.log(' rect!!!! ', width, height, rectwidth);

		var hissvg = his.append('svg');
		hissvg
		.append('rect')
		.attr("x", function(){
			return $(his[0]).width() * 0.025;
		})
		.attr('y', function(){
			return $(his[0]).height() * (1. - heightraito) * 0.5;
		})
		.attr('width', function(){return rectwidth;})
		.attr('height', function(){return height;})
		.style('fill', '#FF5722');
		hissvg
		.append('text')
		.text(liEles.length)
		.attr('x', function(){
			// if(ratio > 0.7)
			return $(his[0]).width() * 0.05;
		})
		.attr('y', function(){
			return $(his[0]).height() * 0.5 + 7.5;
		})
		.style('fill', 'black')
		.style('font-size', "15");
		
		//click event
		$('.object_span' + self.m_iId).click(function(){		
			var value = parseInt(this.getAttribute('value'));
			//console.log('button click', value);
			$('.object_span' + self.m_iId).removeClass('active');
			$(this).addClass('active');		
			$('#objectname_input').val("");
			self.m_InObj.clickGroupButton(value);
		});
		$('.object_span' + self.m_iId).mouseover(function(event){		
			// //console.log('Mouse Enter');
			$(this).find('.delete_icon').removeClass('hidden');
		}); 
		$('.object_span' + self.m_iId).bind('mouseout', function(){
			// //console.log('Mouse Out');
			$(this).find('.delete_icon').addClass('hidden');
		});

		$('.delete_icon').click(function(event){
			// //console.log('DELETE button click ');
			event.stopPropagation();
			var iGroupId = parseInt(this.getAttribute('groupid'));
			self.deleteGroup(iGroupId);
		});

		$('.object_title_span').bind('dblclick', function() {
			// //console.log(" button span clicked! ");
			// g_renameObject= this;			
			self.m_InObj.setRenameObject(this);
			$('#rename_object_dialog').dialog('open');
	    }).blur(
	        function() {
	        $(this).attr('contentEditable', false);
	    });
	}

	//set the hover ele id
	Info.hoverEleId = function(iHoveredEleId){
		var self = this;	
		$('.object_wholediv_' + self.m_iId)
		.css('border', '');
		if(iHoveredEleId != -1){	
			var iGroupId = self.m_ObjectGroupManager.getGroupIdofEleId(iHoveredEleId);
			//console.log(' iHoveredEleId ', iHoveredEleId, iGroupId);

			$('#p_' + self.m_iId + '_object_span_' + iGroupId)
			.css('border', 'solid 2px black');
		}
	}

	//draw the object buttons
	Info.drawObjectButtons = function(){

		//console.log("drawObjectButtons");

		var self = this;

		//clear the buttons
		$('.object_wholediv_' + self.m_iId).remove();

		var liGroupId = self.m_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
		//console.log(" liGroupId ", liGroupId);
		//draw origin groups
		var object_div = document.getElementById(self.m_ObjPanelDivId); 

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
				case 'compound':	
					liEles = self.m_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
					buttonType = 'compound_group_span';
					break;
				case 'propertygroup':
					liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
					buttonType = 'property_group_span';
					break;				
				case 'logic':
				case 'logic_compound':
					liEles = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
					buttonType = 'logic_group_span';
					break;
			}

			if(self.m_MaxEleNum < liEles.length)
				self.m_MaxEleNum = liEles.length;

			self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			var buttonLabel = attrs['name']; //+ ':' + liEles.length;

			//get the suggested name
			// if(g_VisDecoder.getSemanticMap(buttonLabel) != undefined)
			// 	buttonLabel = g_VisDecoder.getSemanticMap(buttonLabel);

			// if(buttonSuggestLabel != undefined){
			// 	//exist
			// 	suggestButtonHTML = '<span class="<%=objclass%> object_button_span object_title_span <%=buttonType%>" value=<%=buttonValue%> style="float: right; padding: 0px 2px;">'+ 
			// 						'<div style="position:relative">' +		
			// 							'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
			// 							'<p value=<%=buttonValue%> style="text-align: center;"><%=suggestbuttonLabel%></p>'+
			// 								// '<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
			// 							'</div>' +
			// 						'</span>';

			// 	buttonhtml = '<div style="width: 100%; height: 30px;" class="<%=objdivclass%> object_button_div" id=<%=ID%> value=<%=buttonValue%> >'+
			// 					'<div style="float: left; width: 63%; height: 100%; padding: 3px">'+
			// 							'<span>' +
			// 								// '<div style="position:relative">' +
			// 								'<i class="fa fa-times delete_icon" groupid=<%=buttonValue%>></i>'+
			// 								'<span class="<%=objclass%> object_button_span object_title_span <%=buttonType%>" value=<%=buttonValue%> style="float: left; padding: 0px 2px;">'+ 
			// 									'<div style="position:relative">' +		
			// 										'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
			// 										'<p value=<%=buttonValue%> style="text-align: center;"><%=buttonLabel%></p>'+
			// 											// '<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
			// 									'</div>' +
			// 								'</span>' +
			// 								suggestButtonHTML + 
			// 								// '</div>' +
			// 							'</span>' +
			// 					'</div>' +
			// 				'<div id=<%=objhisid%> style="float: left; width: 20%; height: 100%;" num=<%=eleNum%> ></div>' +				
			// 				'</div>'
			// }else{
			var buttonhtml = '<div style="width: 100%; height: 30px;" class="<%=objdivclass%> object_button_div" id=<%=ID%> value=<%=buttonValue%> >'+
					'<div style="float: left; width: 50%; height: 100%; padding: 3px">'+
							'<span class="<%=objclass%> object_button_span object_title_span <%=buttonType%>" value=<%=buttonValue%> style="width:100%">'+ 
							'<div style="position:relative">' +		
							'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
							'<p value=<%=buttonValue%> style="text-align: center;"><%=buttonLabel%></p>'+
								// '<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
							'</div>' +
							'</span>' +
					'</div>' +
				'<div id=<%=objhisid%> style="float: left; width: 50%; height: 100%;" num=<%=eleNum%> ></div>' +				
				'</div>'
			// }
			

			// '<div style="height:30px">'+
			// 	'<div style="width: 30%;position:relative;float: left;">'+
			// 		'<span class="<%=objclass%> object_button_span <%=buttonType%>" id=<%=ID%> value=<%=buttonValue%> >'+
			// 			'<div style="position:relative">'+
			// 				'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
			// 				'<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
			// 			'</div>'+
			// 		'</span>'+
			// 	'</div>'+
			// 	'<div style="position:relative; float: right;height: 100%;width: 70%;background: red; margin-top: 3px;"></div>'+
			// '</div>'; 
			//
			var compiled = _.template(buttonhtml);	

			// //console.log(' button html ', compiled({
			// 	buttonLabel: buttonLabel,
			// 	ID: 'object_span_' + iGroupId,
			// 	buttonValue: iGroupId,
			// 	buttonType: buttonType,
			// }));

			object_div.innerHTML = object_div.innerHTML + compiled({
				objdivclass: 'object_wholediv_' + self.m_iId, 
				objclass: 'object_span' + self.m_iId,
				// objhisclass: 'object_his' + self.m_iId,
				objhisid: 'object_his_' + self.m_iId + '_'+ iGroupId,
				buttonLabel: buttonLabel,
				// suggestbuttonLabel: buttonSuggestLabel,
				ID: 'p_' + self.m_iId + '_object_span_' + iGroupId,
				buttonValue: iGroupId,
				buttonType: buttonType,
				eleNum: liEles.length,
			});	
		});

		
		//add the bar info
		var heightraito = 0.75;
		$.each(liGroupId, function(i, iGroupId){

			var his = d3.select("#object_his_" + self.m_iId + '_'+ iGroupId);

			var width = $(his[0]).width() * 0.95;
			var height = $(his[0]).height() * heightraito;
			var ratio = Number(his.attr('num'))/self.m_MaxEleNum;
			var rectwidth = width * ratio;
			//console.log(' rect!!!! ', width, height, rectwidth);

			var hissvg = his.append('svg');
			hissvg
			.append('rect')
			.attr("x", function(){
				return $(his[0]).width() * 0.025;
			})
			.attr('y', function(){
				return $(his[0]).height() * (1. - heightraito) * 0.5;
			})
			.attr('width', function(){return rectwidth;})
			.attr('height', function(){return height;})
			.style('fill', '#FF5722');
			hissvg
			.append('text')
			.text(Number(his.attr('num')))
			.attr('x', function(){
				// if(ratio > 0.7)
				return $(his[0]).width() * 0.05;
			})
			.attr('y', function(){
				return $(his[0]).height() * 0.5 + 7.5;
			})
			.style('fill', 'black')
			.style('font-size', "15")
		});

		//hover event
		$('.object_button_div').click(function(event){
			var value = parseInt(this.getAttribute('value'));	
			$('.object_wholediv_' + self.m_iId).removeClass('object_button_div_click');
			self.m_InObj.clickGroupButton(value);
			if(value == self.m_InObj.m_CurrentSelectGroupId)
				$(this).addClass("object_button_div_click");
			//console.log(" mouse over object ", value);
		});


		//click event
		// $('.object_span' + self.m_iId).click(function(){		
		// 	var value = parseInt(this.getAttribute('value'));
		// 	//console.log('button click', value);
		// 	$('.object_span' + self.m_iId).removeClass('active');
		// 	$(this).addClass('active');		
		// 	$('#objectname_input').val("");
		// 	self.m_InObj.clickGroupButton(value);
		// });

		$('.object_span' + self.m_iId).mouseover(function(event){		
			// //console.log('Mouse Enter');
			$(this).find('.delete_icon').removeClass('hidden');
		}); 
		$('.object_span' + self.m_iId).bind('mouseout', function(){
			// //console.log('Mouse Out');
			$(this).find('.delete_icon').addClass('hidden');
		});

		// $('.suggest_object_span' + self.m_iId)
		// .mouseover(function(event){
		// 	$(this).find('.delete_suggest_icon').removeClass('hidden');
		// })
		// .mouseout(function(event){
		// 	$(this).find(".delete_suggest_icon").addClass('hidden');
		// })

		$('.delete_icon').click(function(event){
			// //console.log('DELETE button click ');
			event.stopPropagation();
			var iGroupId = parseInt(this.getAttribute('groupid'));
			self.deleteGroup(iGroupId);
		});

		$('.delete_suggest_icon').click(function(event){
			event.stopPropagation();
			var iGroupId = parseInt(this.getAttribute('groupid'));
			console.log(' delete suggest name ');
		});

		$('.object_title_span').bind('dblclick', function() {
			// //console.log(" button span clicked! ");
			// g_renameObject= this;
			self.m_InObj.setRenameObject(this);
			$('#rename_object_dialog' + self.m_iId).dialog('open');
	    }).blur(
	        function() {
	        $(this).attr('contentEditable', false);
	    });
	}

	//draw the buttons in the object panel
	Info.addButtonsinObjectPanel = function(){

		var self = this;
		//console.log(" addButtonsinObjectPanel ");
		
		//clear button group
		self.m_ObjectButtonGroupId = 'object_buttongroup_' + self.m_iId; 
		$('#' + self.m_ObjectButtonGroupId).remove();

		// var buttonNameList = ['Clear', 'Link', 'Logic_Composition']; 

		var buttonNameList = ['Logic_Composition']; 
		self.m_ButtonNameIdList = ['Clear_' + self.m_iId, 'Link' + self.m_iId, 'Logic_Composition' + self.m_iId]; 
		var buttongrouphtml = 
		'<div class="btn-group header_footer_buttongroup" id=<%=objectbtngroupid%> role="group" aria-label="...">'+
			// '<button type="button" class="btn btn-warning btn-xs function_button" id=<%=clearButtonId%> value=<%=clearButtonValue%> >Clear</button>'+
			// '<button type="button" class="btn btn-warning btn-xs function_button" id=<%=linkButtonId%> value=<%=linkButtonValue%> >Link</button>'+
			'<button type="button" class="btn btn-warning btn-xs function_button" id=<%=logicButtonId%> value=<%=logicButtonValue%> >Logic Composition</button>'+
			'<div class="dropdown btn-group" role="group" id=<%=removedropobjid%>>'+
				'<button type="button" id=<%=addbuttonid%> class="btn btn-warning btn-xs function_button dropdown-toggle" data-toggle="dropdown">Add'+
					'<span class="caret"></span>'+
				'</button>'+
				'<ul class="dropdown-menu " id=<%=ivmenu%>></ul>'+
			'</div>'+
		'</div>';
		var compiled = _.template(buttongrouphtml);

		//console.log(" ???? ", '#' + self.m_ObjPanelDivId + ' .titlebar', '&& ', $('#' + self.m_ObjPanelDivId + ' .titlebar').html());
		
		$('#' + self.m_ObjPanelDivId + ' .titlebar').html($('#' + self.m_ObjPanelDivId + ' .titlebar').html() + compiled({
			addbuttonid: 'add_object_button' + self.m_iId,
			objectbtngroupid: self.m_ObjectButtonGroupId,
			// clearButtonId: self.m_ButtonNameIdList[0],
			// clearButtonValue: buttonNameList[0],
			// linkButtonId: self.m_ButtonNameIdList[1],
			// linkButtonValue: buttonNameList[1],
			logicButtonId:  self.m_ButtonNameIdList[0],
			logicButtonValue: buttonNameList[0],
			removedropobjid: self.m_RemoveDropObjId,
			ivmenu: self.m_InvisibleMenuId,
		}));

		$('#' + self.m_ButtonNameIdList[0]).click(function(){
			// //console.log(' ccccclick button ');
			self.clickObjectButton(this.value);		
		})

		// $('#' + self.m_ButtonNameIdList[1]).click(function(){
		// 	// //console.log(' ccccclick button ');
		// 	self.clickObjectButton(this.value);		
		// });

		// $('#' + self.m_ButtonNameIdList[2]).click(function(){
		// 	//console.log(' ccccclick logic button ');
		// 	self.clickObjectButton(this.value);		
		// });

		// $('#' + self.m_ButtonNameIdList[2]).on('click', function(){
		// 	//console.log(' ccccclick logic button ');
		// 	self.clickObjectButton(this.value);		
		// });

		$('#' + self.m_RemoveDropObjId).on('click', function(){
			// //console.log(" click add object button ");
			if($('#' + self.m_InvisibleMenuId)[0].style.display == 'none' || $('#' + self.m_InvisibleMenuId)[0].style.display == '')
				$('#' + self.m_InvisibleMenuId).css({
					display: 'block'
				});
			else
				$('#' + self.m_InvisibleMenuId).css({
					display: 'none'
				});
		});

		// $('#invisible_object_menu').on('mouseout', function(){
		// 	//console.log(" oututtutu! ");
		// 	$('#invisible_object_menu').css({
		// 		display: 'none'
		// 	});
		// });

		$('#add_object_button' + self.m_iId).addClass('alpha-3');

		/*
		//select the titlebar div
		var titleDiv = $('#object_p_div .titlebar');

		//add a button group
		var buttonGroup = $("<div>");

		buttonGroup
		.attr('id', 'object_buttongroup')
		.attr('class', 'btn-group header_footer_buttongroup')
		titleDiv.append(buttonGroup);

		// add button into the buttongroup
		// add the buttons

		//add in the left
		for (var i = buttonNameList.length - 1; i >= 0; i--) {
			var buttonName = buttonNameList[i];
			var buttonRect = $('<button>');
			buttonRect
				.attr('id', 'bg_' + buttonName)
				.attr('class', "btn btn-warning btn-xs")
				.attr("value", buttonName)			
				.text(buttonName);

			buttonGroup.append(buttonRect);
			buttonRect[0].onclick = function(){
				//console.log(' ccccclick button ');
				self.clickObjectButton(this.value);
			}
		};
		
		//add drop-down
		var dropdownhtml = '<div class="btn-group dropdown dropdown-scroll" role="group"> <button type="button" class="btn btn-warning btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Add<span class="caret"></span></button><ul class="dropdown-menu" id="invisible_object_menu"></ul></div>';
		var compiled = _.template(dropdownhtml);
		var titleDiv2 = $('#object_buttongroup');
		titleDiv2.html(titleDiv2.html() + compiled());

		// $('#invisible_object_menu').on('click', 'li', function(e) {
		// 	var groupId = $(this).attr('groupid');
		// 	//console.log(' click ', groupId);

	 //   		$(this).remove();

	 //   		//make group visible
	 //   		g_ObjectGroupManager.setGroupVisible(groupId, true);
	 //   		self.drawObjectButton(groupId);
		// });
	*/
	}

	Info.TEST = function(){
		var self =this;		
		$('#' + self.m_ButtonNameIdList[0]).click(function(){
			// //console.log(' ccccclick button ');
			self.clickObjectButton(this.value);		
		})

		$('#' + self.m_ButtonNameIdList[1]).click(function(){
			// //console.log(' ccccclick button ');
			self.clickObjectButton(this.value);		
		});

		$('#' + self.m_ButtonNameIdList[2]).click(function(){
			//console.log(' ccccclick logic button ');
			self.clickObjectButton(this.value);		
		});
	}

	//feedback by clicking the button 
	Info.clickObjectButton = function(buttonName){

		var self = this;

		//console.log(' click object button ');
		switch(buttonName){
			case 'Link':
				//console.log(' Link button pressed ! ');
				self.clickLinkButton();
				break;
			case 'Clear':
				//console.log(' Clear Selection ! ');
				self.clickClearButton();
				break;
			case 'Logic_Composition':
				$('#compose_object_dialog_' + self.m_iId).dialog('open');
				//console.log(' Logic Composition ! ');

				//TODO
				self.m_InObj.clickLogicComposition();
				break;
			// case 'Delete':
			// 	//console.log(' Delete object');
			// 	self.clickDeleteButton();
			// 	break;
			default: 
				break;
		}
	}

	//when pressing the 'Clear' button
	Info.clickClearButton = function(){
		var self = this;

		if($('#' + self.m_LassoDivId).length != 0){
			//exist to remove
			$('#' + self.m_LassoDivId).remove();
			g_ObjectLinkManager.clearLassoEleIds();
		}

		$('.testrect').remove();
		//reset the filter
		/* */
		self.m_ObjectGroupManager.setSelectedGroupId(-1);
		resetCrossFilter();
		//clear the selected 
		$('.object_span').removeClass('active');
	    //update the filter
	    var liElementId = g_ElementProperties.getElementIds();
	    $.each(liElementId, function(i, id){
	        var ele = g_ElementProperties.getElebyId(id);
	        ele.style.opacity = '';
	        ele.cssText += g_ElementProperties.getEleOrigincssTextbyId(id);
	    }); 
	    //delete the property 
		$('.propertyrow').remove();
	}

	//click link button
	Info.clickLinkButton = function(){
		// //console.log(' click link button ');

		if($('#' + self.m_LassoDivId).length != 0){
			//exist to remove
			$('#' + self.m_LassoDivId).remove();
			g_ObjectLinkManager.clearLassoEleIds();
			return;
		}

		//add a new interaction layer
		var defineRect = d3.select('#define_region_rect' + self.m_iId);
		var lassoWidth = defineRect.attr('width'), lassoHeight = defineRect.attr('height');
		var lassoTop = defineRect.attr('y'), lassoLeft = defineRect.attr('x');
		//console.log(' width ', lassoWidth, 'top ', lassoTop, ' left ', lassoLeft, ' height, ', lassoHeight);

		var lasso_div =  document.createElement('div'); 
		lasso_div.id = self.m_LassoDivId ;

		$('#addondiv')[0].appendChild(lasso_div);	
		
		$('#' + self.m_LassoDivId).css({
			width: lassoWidth,
			height: lassoHeight,
			top: lassoTop + 'px',
			left: lassoLeft + 'px',
			position: 'absolute'
		});

	  d3.select("#" + self.m_LassoDivId).append('svg')	
				.attr('id', self.m_LassoSvgId)
	            .attr("width", lassoWidth)
	            .attr("height", lassoHeight)
	           	.attr("x", 0)
				.attr("y", 0)			
				.on('mousedown', function(){
					self.lassoMouseDown();
				})
				.on('mouseup', function(){
					self.lassoMouseUp();
				})
				.on('mousemove', function(){
					self.lassoMouseMove();
				});;

	   var lasso_bg_rect = d3.select('#' + self.m_LassoSvgId)
	   						.append('rect')
	   						.attr('width', lassoWidth)
	   						.attr('height', lassoHeight)
	   						.attr('x', 0)
	   						.attr('y', 0)
							.style('fill', 'red')
							.style("opacity", 0.04);	                  
		                   
	}

	//feedback when delete a group
	Info.deleteGroup = function(iGroupId){

		var self = this;

		$('#' + self.m_InvisibleMenuId).on('click', 'li', function(e){
			var groupId = Number($(this).attr('groupid'));
			//console.log(' click ', groupId);
	   		$(this).remove();
	   		//make group visible
	   		self.m_ObjectGroupManager.setGroupVisible(groupId, true);
	   		self.drawObjectButton(groupId);
	   		//check for add_object_button
	   		if(self.m_ObjectGroupManager.getInVisibleGroupIdList().length > 0){
				// //console.log(' invisible = true ');
				$('#add_object_button' + self.m_iId).removeClass('alpha-3');
			}else{
				// //console.log(' invisible = false ');
				$('#add_object_button' + self.m_iId).addClass('alpha-3');
			}
		});
		
		$('#' + self.m_InvisibleMenuId).on('mouseenter', 'li', function(e){
			//console.log(" MME ");
			var groupId = $(this).attr('groupid');
			$('#p_' + self.m_iId + 'obj_li_'+ groupId ).addClass('background-highlight cursor-pointer');
		});

		$('#' + self.m_InvisibleMenuId).on('mouseout', 'li', function(e){
			//console.log(" MMOUT")
			var groupId = $(this).attr('groupid');
			$('#p_' + self.m_iId + 'obj_li_' + groupId).removeClass('background-highlight cursor-pointer');
		});

		//console.log(' Delete Group ', iGroupId);
		//remove the objs
		var spanId = 'p_' + self.m_iId + '_object_span_' + iGroupId;// 'object_span_' + iGroupId;

		var groupContent = $('#' + spanId)[0].textContent;
		//console.log(' group centent ', groupContent);

		$('#' + spanId).remove();	

		//TODO
		//set the object manager
		self.m_ObjectGroupManager.setGroupVisible(iGroupId, false);
		//update the list in menu	
		// var attrs = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);

		// var buttonLabel = attrs['name'] + ':' + liEles.length;
		var newlihtml = '<li id=<%=objectliid%> groupid=<%=groupId%> class="text-center"><%=liName%></li>'
		var compiled = _.template(newlihtml);	

	    $('#' + self.m_InvisibleMenuId).html($('#' + self.m_InvisibleMenuId).html() + compiled({
			groupId: iGroupId,
			objectliid: 'p_' + self.m_iId + 'obj_li_' + iGroupId, //'obj_li_'+ iGroupId, 
			liName: groupContent,
		}));

		//check for add_object_button
		if(self.m_ObjectGroupManager.getInVisibleGroupIdList().length > 0){
			// //console.log(' invisible = true ');
			$('#add_object_button' + self.m_iId).removeClass('alpha-3');
		}else{
			// //console.log(' invisible = false ');
			$('#add_object_button' + self.m_iId).addClass('alpha-3');
		}		

		//update inter info
		g_InteractionRecorder.addRemoveObjectCount();
	}


	Info.__init__(iId, inObj, objectGroupManager);
	return Info;
}

function ObjectLinkManager(){
	
	var Info = new Object;

	Info.m_liLassoEleId = [];

	//delete the lassoed eleids 
	Info.detectLassoEleIds = function(){
		var lassoDefinedRect = $('#lasso_rect');
		var lassoOffSet = lassoDefinedRect.offset();
		//detect the elements
		var definedRect = {
			'x1': lassoOffSet.left,
			'x2': parseInt(lassoDefinedRect.attr('width')) + lassoOffSet.left,
			'y1': lassoOffSet.top,
			'y2': lassoOffSet.top + parseInt(lassoDefinedRect.attr('height'))
		}
		//go through the detected ele
		var selectEleId = [];
		var liEleId = g_ElementProperties.getElementIds();
		// //console.log('before filter ', liEleId.length);
		$.each(liEleId, function(i, iEleId){
			var Ele = g_ElementProperties.getElebyId(iEleId);
			var tempRect = getRectofElement(Ele);
			//shift if iframe by offset
			var shiftpos = {x: 0, y: 0};
			var iFrame = g_ElementProperties.getIFramebyId(iEleId);
			if(iFrame != undefined){
				shiftpos['x'] = $(iFrame).offset().left;
				shiftpos['y'] = $(iFrame).offset().top;
			}
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];
 			var bIntersect = isIntersect(definedRect, tempRect);
			var bIntersect2 = isIntersect(tempRect, definedRect);			
			if(bIntersect || bIntersect2){
				selectEleId.push(iEleId);		
				// //console.log(' select ', Ele);
			}
		});
		return selectEleId;
	}
	Info.setLassoEleIds = function(liLassoEleId){
		var self = this;
		//set the new lasso ele
		this.m_liLassoEleId = liLassoEleId;
		var liAllEleIds = g_ElementProperties.getElementIds();
		if(this.m_liLassoEleId.length == 0){
			//nothing selected, opacity all
			$.each(liAllEleIds, function(i, id){
				var ele = g_ElementProperties.getElebyId(id);
				ele.style.opacity = '';
				ele.cssText += g_ElementProperties.getEleOrigincssTextbyId(id);		
			}); 
		}else{
			//recover old lasso ele, update the new lasso ele
			$.each(liAllEleIds, function(i, id){
				var ele = g_ElementProperties.getElebyId(id);
				if(self.m_liLassoEleId.indexOf(id) >= 0){
					ele.style.opacity = '';
					ele.cssText += g_ElementProperties.getEleOrigincssTextbyId(id);
				}else{
					ele.style.opacity = 0.3;
				}			
			}); 
		}
	}
	Info.getLassoEleIds = function(){
		return this.m_liLassoEleId;
	}
	Info.clearLassoEleIds = function(){
		this.setLassoEleIds([]);
	}
	return Info;
}

var g_ObjectLinkManager = new ObjectLinkManager;

var lassMouseBegin = {}, lassMouseEnd = {};
var bLassoCreating = false;


function drawObjectPart(){
	var self = this;

	addObjReNameDialog();
	addObjectCompositionDialog();	
	addSubmitDialog();
  	// addSubmitCommentDialog();
	// drawButtonsinObjectPanel();

	drawObjectButtons();
}

//add a rename dialog, default hide
function addObjReNameDialog(){
	var self = this;

	if($('#rename_object_dialog').length != 0)
		return;

	var dialoghtml = '<div id="rename_object_dialog" title="Rename" hidden="hidden"><input id="objectname_input"></input></div>'
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('object_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#rename_object_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
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


function addSubmitDialog(){
	var self = this;

	if($('#comment_submit_dialog').length != 0)
		return;

	var dialoghtml = '<div id="comment_submit_dialog" title="Submission" hidden="hidden"><div><label class="font_dialog">Name</label><br><input id="submit_comment_input"></input></div><div><label class="font_dialog">Detail Description</label><br><textarea id="submit_description_input" style="font-size:10px; width:100%; height: 100px"></textarea></div></div>'
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('object_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#comment_submit_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
	    buttons: {
	        "Ok": function(){	        	
	        	// self.submitExploration();
	        	// self.renameObject();
    			submitExploration();
	            $(this).dialog("close");
	       	 },
	       	"Cancel": function(){
	       		$(this).dialog('close');
	       	}
    	}
	});
}


//add a rename dialog, default hide
function addSubmitCommentDialog(){	
	var self = this;

	var dialoghtml = '<div id="comment_submit_dialog" title="Comment" hidden="hidden"><input id="comment_input"></input></div>'
	//'<div id="dialog-rename" title="Empty the recycle bin?" style="display: none"><p><span style="float: left; margin: 0 7px 20px 0;"></span>Rename</p></div>';
	//'<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar"><%= subpaneltitle %></div><div class="span12" id=<%=subpanelid%> ></div></div>';
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('object_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#comment_submit_dialog").dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
	    buttons: {
	        "Submit": function() {
	        	// submitExploration();
	            $(this).dialog("close");
	       	 },
	       	"Cancel": function(){
	       		$(this).dialog('close');
	       	}
    	}
	});
}

function renameObject(){
	//console.log('rename! ', g_renameObject);
	var iGroupId = parseInt(g_renameObject.getAttribute('value'));
	var attr = g_ObjectGroupManager.getAttrsbyGroupId(iGroupId);

	//get the input value
	var nameInput = $('#objectname_input');
	var newName = nameInput.val();
	//console.log('new name ', newName);

	switch(attr['type']){
		case 'origin':
			liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			buttonType = 'origin_group_span';
			break;
		case 'logic_compound':
		case 'default_compound':
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

	//change the out-looking
	g_renameObject.innerText = newName + ":" + liEles.length;

	//update the object name
	g_ObjectGroupManager.setGroupNamebyId(iGroupId, newName);

	//update inter info
	g_InteractionRecorder.addRenameObjectCount();
}

//draw the object buttons
function drawObjectButtons(){
	//clear the buttons
	$('.object_span').remove();

	var liGroupId = g_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
	//draw origin groups
	var object_div = document.getElementById('object_p'); 

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
			case 'compound':	
				liEles = g_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
				buttonType = 'compound_group_span';
				break;
			case 'propertygroup':
				liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				buttonType = 'property_group_span';
				break;				
			case 'logic':
			case 'logic_compound':
				liEles = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				buttonType = 'logic_group_span';
				break;
		}
		g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		var buttonLabel = attrs['name'] + ':' + liEles.length;
	
		var buttonhtml = '<span class="object_span object_button_span <%=buttonType%>" id=<%=ID%> value=<%=buttonValue%> >'+
		'<div style="position:relative">'+
		'<i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i>'+
		'<span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span>'+
		'</div></span>'; //
		var compiled = _.template(buttonhtml);	

		// //console.log(' button html ', compiled({
		// 	buttonLabel: buttonLabel,
		// 	ID: 'object_span_' + iGroupId,
		// 	buttonValue: iGroupId,
		// 	buttonType: buttonType,
		// }));

		object_div.innerHTML = object_div.innerHTML + compiled({
			buttonLabel: buttonLabel,
			ID: 'object_span_' + iGroupId,
			buttonValue: iGroupId,
			buttonType: buttonType,
		});	
	});
	//click event
	$('.object_span').click(function(){		
		var value = parseInt(this.getAttribute('value'));
		//console.log('button click', value);
		$('.object_span').removeClass('active');
		$(this).addClass('active');		
		$('#objectname_input').val("");
		self.clickGroup(value);
	});
	$('.object_span').mouseover(function(event){		
		// //console.log('Mouse Enter');
		$(this).find('.delete_icon').removeClass('hidden');
	}); 
	$('.object_span').bind('mouseout', function(){
		// //console.log('Mouse Out');
		$(this).find('.delete_icon').addClass('hidden');
	});

	$('.delete_icon').click(function(event){
		// //console.log('DELETE button click ');
		event.stopPropagation();
		var iGroupId = parseInt(this.getAttribute('groupid'));
		self.deleteGroup(iGroupId);
	});

	$('.object_title_span').bind('dblclick', function() {
		// //console.log(" button span clicked! ");
		g_renameObject= this;
		$('#rename_object_dialog').dialog('open');
    }).blur(
        function() {
        $(this).attr('contentEditable', false);
    });
}

//add object button
function drawObjectButton(iGroupId){

	//draw origin groups
	var object_div = document.getElementById('object_p'); 

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

	var buttonhtml = '<span class="object_span object_button_span <%=buttonType%>" id=<%=ID%> value=<%=buttonValue%> ><div style="position:relative"><i class="fa fa-times delete_icon hidden" groupid=<%=buttonValue%>></i><span class="object_title_span" value=<%=buttonValue%> > <%=buttonLabel%></span></div></span>'; //
	var compiled = _.template(buttonhtml);	

	//console.log(' button html ', compiled({
	// 	buttonLabel: buttonLabel,
	// 	ID: 'object_span_' + iGroupId,
	// 	buttonValue: iGroupId,
	// 	buttonType: buttonType,
	// }));

	object_div.innerHTML = object_div.innerHTML + compiled({
		buttonLabel: buttonLabel,
		ID: 'object_span_' + iGroupId,
		buttonValue: iGroupId,
		buttonType: buttonType,
	});	
	
	//click event
	$('.object_span').click(function(){		
		var value = parseInt(this.getAttribute('value'));
		//console.log('button click', value);
		$('.object_span').removeClass('active');
		$(this).addClass('active');		
		$('#objectname_input').val("");
		self.clickGroup(value);
	});
	$('.object_span').mouseover(function(event){		
		// //console.log('Mouse Enter');
		$(this).find('.delete_icon').removeClass('hidden');
	}); 
	$('.object_span').bind('mouseout', function(){
		// //console.log('Mouse Out');
		$(this).find('.delete_icon').addClass('hidden');
	});

	$('.delete_icon').click(function(event){
		// //console.log('DELETE button click ');
		event.stopPropagation();
		var iGroupId = parseInt(this.getAttribute('groupid'));
		self.deleteGroup(iGroupId);
	});

	$('.object_title_span').bind('dblclick', function() {
		// //console.log(" button span clicked! ");
		g_renameObject= this;
		$('#rename_object_dialog').dialog('open');
    }).blur(
        function() {
        $(this).attr('contentEditable', false);
    });
}

//draw the buttons in the object panel
function drawButtonsinObjectPanel(){
	var self = this;
	//clear button group
	$('#object_buttongroup').remove();

	var buttonNameList = ['Clear', 'Link', 'Logic_Composition']; 
	var buttongrouphtml = '<div class="btn-group header_footer_buttongroup" id="object_buttongroup" role="group" aria-label="..."><button type="button" class="btn btn-warning btn-xs function_button" id=<%=clearButtonId%> value=<%=clearButtonValue%> >Clear</button><button type="button" class="btn btn-warning btn-xs function_button" id=<%=linkButtonId%> value=<%=linkButtonValue%> >Link</button><button type="button" class="btn btn-warning btn-xs function_button" id=<%=logicButtonId%> value=<%=logicButtonValue%> >Logic Composition</button><div class="dropdown btn-group" role="group" id="remove_object_drop_div"><button type="button" id="add_object_button" class="btn btn-warning btn-xs function_button dropdown-toggle" data-toggle="dropdown">Add<span class="caret"></span></button><ul class="dropdown-menu " id="invisible_object_menu"></ul></div></div>';
	var compiled = _.template(buttongrouphtml);
	$('#object_p_div .titlebar').html($('#object_p_div .titlebar').html() + compiled({
		clearButtonId: 'bg_' + buttonNameList[0],
		clearButtonValue: buttonNameList[0],
		linkButtonId: 'bg_' + buttonNameList[1],
		linkButtonValue: buttonNameList[1],
		logicButtonId: 'bg_' + buttonNameList[2],
		logicButtonValue: buttonNameList[2],
	}));

	$('#' + 'bg_' + buttonNameList[0]).click(function(){
		// //console.log(' ccccclick button ');
		self.clickObjectButton(this.value);		
	})
	$('#' + 'bg_' + buttonNameList[1]).click(function(){
		// //console.log(' ccccclick button ');
		self.clickObjectButton(this.value);		
	});
	$('#' + 'bg_' + buttonNameList[2]).click(function(){
		// //console.log(' ccccclick logic button ');
		self.clickObjectButton(this.value);		
	});

	$('#remove_object_drop_div').on('click', function(){
		// //console.log(" click add object button ");

		if($('#invisible_object_menu')[0].style.display == 'none' || $('#invisible_object_menu')[0].style.display == '')
			$('#invisible_object_menu').css({
				display: 'block'
			});
		else
			$('#invisible_object_menu').css({
				display: 'none'
			});
	});

	// $('#invisible_object_menu').on('mouseout', function(){
	// 	//console.log(" oututtutu! ");
	// 	$('#invisible_object_menu').css({
	// 		display: 'none'
	// 	});
	// });

	$('#invisible_object_menu').on('click', 'li', function(e){
		var groupId = Number($(this).attr('groupid'));
		//console.log(' click ', groupId);
   		$(this).remove();
   		//make group visible
   		g_ObjectGroupManager.setGroupVisible(groupId, true);
   		self.drawObjectButton(groupId);
   		//check for add_object_button
   		if(g_ObjectGroupManager.getInVisibleGroupIdList().length > 0){
			// //console.log(' invisible = true ');
			$('#add_object_button').removeClass('alpha-3');
		}else{
			// //console.log(' invisible = false ');
			$('#add_object_button').addClass('alpha-3');
		}
	});

	$('#invisible_object_menu').on('mouseenter', 'li', function(e){
		var groupId = $(this).attr('groupid');
		$('#obj_li_'+groupId).addClass('background-highlight cursor-pointer');
	});
	$('#invisible_object_menu').on('mouseout', 'li', function(e){
		var groupId = $(this).attr('groupid');
		$('#obj_li_'+groupId).removeClass('background-highlight cursor-pointer');
	});

	$('#add_object_button').addClass('alpha-3');

	/*
	//select the titlebar div
	var titleDiv = $('#object_p_div .titlebar');

	//add a button group
	var buttonGroup = $("<div>");

	buttonGroup
	.attr('id', 'object_buttongroup')
	.attr('class', 'btn-group header_footer_buttongroup')
	titleDiv.append(buttonGroup);

	// add button into the buttongroup
	// add the buttons

	//add in the left
	for (var i = buttonNameList.length - 1; i >= 0; i--) {
		var buttonName = buttonNameList[i];
		var buttonRect = $('<button>');
		buttonRect
			.attr('id', 'bg_' + buttonName)
			.attr('class', "btn btn-warning btn-xs")
			.attr("value", buttonName)			
			.text(buttonName);

		buttonGroup.append(buttonRect);
		buttonRect[0].onclick = function(){
			//console.log(' ccccclick button ');
			self.clickObjectButton(this.value);
		}
	};
	
	//add drop-down
	var dropdownhtml = '<div class="btn-group dropdown dropdown-scroll" role="group"> <button type="button" class="btn btn-warning btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Add<span class="caret"></span></button><ul class="dropdown-menu" id="invisible_object_menu"></ul></div>';
	var compiled = _.template(dropdownhtml);
	var titleDiv2 = $('#object_buttongroup');
	titleDiv2.html(titleDiv2.html() + compiled());

	// $('#invisible_object_menu').on('click', 'li', function(e) {
	// 	var groupId = $(this).attr('groupid');
	// 	//console.log(' click ', groupId);

 //   		$(this).remove();

 //   		//make group visible
 //   		g_ObjectGroupManager.setGroupVisible(groupId, true);
 //   		self.drawObjectButton(groupId);
	// });
*/
}

//feedback when delete a group
function deleteGroup(iGroupId){
	//console.log(' Delete Group ', iGroupId);
	//remove the objs
	var spanId = 'object_span_' + iGroupId;

	var groupContent = $('#' + spanId)[0].textContent;
	//console.log(' group centent ', groupContent);

	$('#' + spanId).remove();	
	//set the object manager
	g_ObjectGroupManager.setGroupVisible(iGroupId, false);
	//update the list in menu	
	// var attrs = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);

	// var buttonLabel = attrs['name'] + ':' + liEles.length;
	var newlihtml = '<li id=<%=objectliid%> groupid=<%=groupId%> class="text-center"><%=liName%></li>'
	var compiled = _.template(newlihtml);	
    $('#invisible_object_menu').html($('#invisible_object_menu').html() + compiled({
		groupId: iGroupId,
		objectliid: 'obj_li_'+ iGroupId,
		liName: groupContent,
	}));

	//check for add_object_button
	if(g_ObjectGroupManager.getInVisibleGroupIdList().length > 0){
		// //console.log(' invisible = true ');
		$('#add_object_button').removeClass('alpha-3');
	}else{
		// //console.log(' invisible = false ');
		$('#add_object_button').addClass('alpha-3');
	}

	//update inter info
	g_InteractionRecorder.addRemoveObjectCount();
}

//feedback by clicking a group button
function clickGroup(iGroupId){
	var self = this;
	//console.log('click on group ', iGroupId);
	//remove current pros

	$(".currentpro").remove();
	$('.testrect').remove();

	//test: if clicking on the compound group
	var groupType = g_ObjectGroupManager.getGroupTypeofGroupId(iGroupId);

	switch(groupType){
		case 'origin':
			g_InteractionRecorder.addExploreOriginGroup();
			break;
		case 'propertygroup':
			g_InteractionRecorder.addExplorePropertyGroup();
			break;
		case 'logic':
		case 'logic_compound':
			g_InteractionRecorder.addExploreLogicGroup();
			break;
		case 'default_compound':
		case 'compound':
			g_InteractionRecorder.addExploreCompoundGroup();
			break;
	}
	
	//origin group
	//update
	g_ObjectGroupManager.setSelectedGroupId(iGroupId);
	//reset the filter
	resetCrossFilter();
	filterElebyGroup(iGroupId);	
	drawProperties(iGroupId);
}

function extendRect(Rect, otherRect) {
	var x = Rect['x1'], y = Rect['y1'], width = Math.abs(Rect['x2'] - Rect['x1']), height = Math.abs(Rect['y1'] - Rect['y2']);
	var otherX = otherRect['x1'], otherY = otherRect['y1'], otherWidth = Math.abs(otherRect['x2'] - otherRect['x1']), otherHeight = Math.abs(otherRect['y1'] - otherRect['y2']);
	if (otherX + otherWidth > x + width) { width = otherX + otherWidth - x; }
	if (otherY + otherHeight > y + height) { height = otherY + otherHeight - y; }
	if (otherX < x) { width += x - otherX; x = otherX; }
	if (otherY < y) { height += y - otherY; y = otherY; }

	Rect['x1'] = x, Rect['y1'] = y, Rect['x2'] = Rect['x1'] + width, Rect['y2'] = Rect['y1'] + height;
	return Rect;
}

//feedback by clicking the button 
function clickObjectButton(buttonName){
	//console.log(' click object button ');
	switch(buttonName){
		case 'Link':
			//console.log(' Link button pressed ! ');
			clickLinkButton();
			break;
		case 'Clear':
			//console.log(' Clear Selection ! ');
			clickClearButton();
			break;
		case 'Logic_Composition':
			$('#compose_object_dialog_' + self.m_iId).dialog('open');
			//console.log(' Logic Composition ! ');			
			defineLogicComposition();
			break;
		case 'Delete':
			//console.log(' Delete object');
			clickDeleteButton();
			break;
		default: 
			break;
	}
}

//when pressing the 'Clear' button
function clickClearButton(){

	if($('#lassodiv').length != 0){
		//exist to remove
		$('#lassodiv').remove();
		g_ObjectLinkManager.clearLassoEleIds();
	}

	$('.testrect').remove();
	//reset the filter
	/* */
	g_ObjectGroupManager.setSelectedGroupId(-1);
	resetCrossFilter();
	//clear the selected 
	$('.object_span').removeClass('active');
    //update the filter
    var liElementId = g_ElementProperties.getElementIds();
    $.each(liElementId, function(i, id){
        var ele = g_ElementProperties.getElebyId(id);
        ele.style.opacity = '';
        ele.cssText += g_ElementProperties.getEleOrigincssTextbyId(id);
    }); 
    //delete the property 
	$('.propertyrow').remove();
}

function removeLasso(){
	d3.select('#lassodiv').remove();
}


function clickLinkButton(){
	// //console.log(' click link button ');

	if($('#lassodiv').length != 0){
		//exist to remove
		$('#lassodiv').remove();
		g_ObjectLinkManager.clearLassoEleIds();
		return;
	}

	//add a new interaction layer
	var defineRect = d3.select('#define_region_rect');
	var lassoWidth = defineRect.attr('width'), lassoHeight = defineRect.attr('height');
	var lassoTop = defineRect.attr('y'), lassoLeft = defineRect.attr('x');
	//console.log(' width ', lassoWidth, 'top ', lassoTop, ' left ', lassoLeft, ' height, ', lassoHeight);

	var lasso_div =  document.createElement('div'); 
	lasso_div.id = 'lassodiv';

	$('#addondiv')[0].appendChild(lasso_div);	
	
	$('#lassodiv').css({
		width: lassoWidth,
		height: lassoHeight,
		top: lassoTop + 'px',
		left: lassoLeft + 'px',
		position: 'absolute'
	});

   d3.select("#lassodiv").append('svg')	
			.attr('id', 'lassosvg')
            .attr("width", lassoWidth)
            .attr("height", lassoHeight)
           	.attr("x", 0)
			.attr("y", 0)			
			.on('mousedown', function(){
				lassoMouseDown();
			})
			.on('mouseup', function(){
				lassoMouseUp();
			})
			.on('mousemove', function(){
				lassoMouseMove();
			});;

   var lasso_bg_rect = d3.select('#lassosvg')
   						.append('rect')
   						.attr('width', lassoWidth)
   						.attr('height', lassoHeight)
   						.attr('x', 0)
   						.attr('y', 0)
						.style('fill', 'red')
						.style("opacity", 0.04);	                  
	                   
}

function getPosInLassoSvg(e){	
  var parentOffset = $('#lassosvg').offset(); 
  //or $(this).offset(); if you really just want the current element's offset
  var relX = d3.event.pageX - parentOffset.left;
  var relY = d3.event.pageY - parentOffset.top;
  return {x: relX, y: relY};
}

function lassoMouseDown(e){

	//console.log(' lasso mouse down ');

	//clear the confirm button
	$('#linkconfirmbt').remove();
	$('#lasso_rect').remove();
	$(".rule_group").remove();
	
	bLassoCreating = true;
	lassMouseBegin['x'] = getPosInLassoSvg(e)['x'];
	lassMouseBegin['y'] = getPosInLassoSvg(e)['y'];
	lassMouseEnd['x'] = lassMouseBegin['x'];
	lassMouseEnd['y'] = lassMouseBegin['y'];
	// var posInSvg = getPosInLassoSvg(e);

	// //console.log('lasso mouse down');
	var defineRegionRect = d3.select('#lassosvg').append("rect")
      .attr('id', 'lasso_rect')
      .attr("fill", "none")
      .attr("stroke", '#636363')
      .attr("stroke-width", 2)
      .attr("width", 0)
      .attr("height", 0)
      .attr("x", lassMouseBegin['x'])
      .attr("y", lassMouseBegin['y']);

    //clear the previous lasso selection
    g_ObjectLinkManager.clearLassoEleIds();
}

function lassoMouseUp(e){

	//console.log(' lasso mouse up!! ');

	if(bLassoCreating){
		//after the rect defined
		bLassoCreating = false;
		var selectEleId = g_ObjectLinkManager.detectLassoEleIds();
		
		// //console.log(' filter ele size ', selectEleId.length,
		// 	' ele ', selectEleId);

		// $.each(selectEleId, function(i, iEleId){
		// 	var ele = g_ElementProperties.getElebyId(iEleId);

		// 	//console.log('lass ele ', ele);
		// })

		//update the object-link manager
		g_ObjectLinkManager.setLassoEleIds(selectEleId);
		//draw the confirm buttton
		// var lassodiv = d3.select('#lassodiv');
		var lassorect = d3.select('#lasso_rect')

		// var confirmButton = $('<button>');
		// confirmButton
		// 	.attr('id', 'linkconfirmbt')
		// 	.attr('class', "btn btn-warning btn-xs")
		// 	.css({
		// 		left: parseInt(lassorect.attr('x')) + parseInt(lassorect.attr('width')) + 4 + 'px',
		// 		top: parseInt(lassorect.attr('y')) + 'px',
		// 		position: 'absolute'
		// 	})
		// 	// .on('click', )
		// 	.text('Link');

		//todo1: draw the position relationship button here
		var left = parseInt(lassorect.attr('x')) + parseInt(lassorect.attr('width')) + 4;
		var top = parseInt(lassorect.attr('y'));
		var widthGap = 5;
		var buttonWidth = 20;

		var resizeRatio = 0.8;
		var liPositionRelationship = ['left_aligned', 'right_aligned', 'centerh_aligned', 'verticalh_aligned', 'buttom_aligned', 'top_aligned', 'connecth_aligned', 'connectv_aligned'];
		
		for (var i = 0; i < liPositionRelationship.length; i++) {
			var posRelationship = liPositionRelationship[i];

			var group = d3.select("#lassosvg").append("g")
			.attr('class', 'rule_group')
			.attr('id', posRelationship)
	      // .attr("class", "")
	        .attr("transform", function(d){ return "translate(" + left + "," + top + ")"; });

	        group.append('rect')
			.style('fill', 'white')
			// .attr("fill", "red")
			  // .attr("xlink:href",serverIp + "rc/left_aligned.png")
			.style("stroke", 'black')
			.style("stroke-width", 1)
			.attr("width", buttonWidth)
			.attr("height", buttonWidth);

			group.append('svg:image')
			.attr("xlink:href",serverIp + "rc/" + posRelationship + '.png')
			.style("width", buttonWidth * resizeRatio)
			.style("height", buttonWidth * resizeRatio)			
			.attr("x", buttonWidth * (0.5 - resizeRatio/2.))
			.attr("y", buttonWidth * (0.5 - resizeRatio/2.))				        
			.on("mouseover", function(){
				$(this).parent().children('rect')
				// d3.select(this).siblings('rect')
				.css({'stroke-width': 2});
			})
			.on('mouseout', function(){
				$(this).parent().children('rect')
				.css({'stroke-width': 1});
			})
			.on('mouseup', function(){
				d3.event.stopPropagation();
			})
			.on('mousedown', function(){
				d3.event.stopPropagation();
				var posrelation = $(this).parent().attr('id')
				//console.log(' click !!!!', posrelation);
				//todo
				clickBaseRuleConfirmButton(posrelation);
			});

			// var Rect = d3.select('#lassosvg').append("rect")
			// // var Rect = buttongroup.append('rect')
			//   .attr('id', posRelationship)
			//   .style('fill', 'white')
		 //      // .attr("fill", "red")
   // 			  // .attr("xlink:href",serverIp + "rc/left_aligned.png")
		 //      .style("stroke", 'black')
		 //      .style("stroke-width", 1)
		 //      .attr("width", buttonWidth)
		 //      .attr("height", buttonWidth)
		 //      .attr("x", left)
		 //      .attr("y", top)
		 //      .on("mouseover", function(){
		 //      	d3.select(this)
		 //      	.style('stroke-width', 2);
		 //      })
		 //      .on('mouseout', function(){
		 //      	d3.select(this)
		 //      	.style('stroke-width', 1);
		 //      })
		 //      .on('click', function(){
		 //      	//console.log(' click !!!!');
		 //      });

			// var imageRect = d3.select('#lassosvg').append("svg:image")
		 //      // .attr("fill", "red")
   // 			  .attr("xlink:href",serverIp + "rc/" + posRelationship + '.png')
		 //      // .attr("stroke", '#636363')
		 //      // .attr("stroke-width", 2)
		 //      .attr("width", buttonWidth * resizeRatio)
		 //      .attr("height", buttonWidth * resizeRatio)
		 //      .attr("x", left + buttonWidth * (0.5 - resizeRatio/2.))
		 //      .attr("y", top + buttonWidth * (0.5 - resizeRatio/2.))
		 //       .on("mouseover", function(){
		 //      	d3.select(this)
		 //      	.style('stroke-width', 2);
		 //      })
		 //      .on('mouseout', function(){
		 //      	d3.select(this)
		 //      	.style('stroke-width', 1);
		 //      });


			left += (buttonWidth + widthGap);
			if(i == 3){
				top += (buttonWidth + widthGap);
				left = parseInt(lassorect.attr('x')) + parseInt(lassorect.attr('width')) + 4;
			}
		};

		// confirmButton[0].onclick = function(){
		// 	clickConfirmButton();
		// }

		// var tempdiv = document.getElementById("lassodiv");
		// tempdiv.insertBefore(confirmButton[0], tempdiv.firstChild);		
	}
	// //console.log('lasso mouse up');
}

function lassoMouseMove(e){

	if(!bLassoCreating) return;

	// //console.log('lasso mouse move');

	lassMouseEnd['x'] = getPosInLassoSvg(e)['x'];
	lassMouseEnd['y'] = getPosInLassoSvg(e)['y'];
    
    var rectLX = (lassMouseBegin['x'] < lassMouseEnd['x'])? lassMouseBegin['x'] : lassMouseEnd['x'];
	var rectTY = (lassMouseBegin['y'] < lassMouseEnd['y'])? lassMouseBegin['y'] : lassMouseEnd['y'];
	var rectWidth = lassMouseEnd['x'] - lassMouseBegin['x'];
	var rectHeight = lassMouseEnd['y'] - lassMouseBegin['y'];
 
	if(rectWidth < 0)
		rectWidth = -rectWidth;
	if(rectHeight < 0)
		rectHeight = -rectHeight;

	d3.select('#lasso_rect')
	 .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", rectLX)
      .attr("y", rectTY); 
}

function clickConfirmButton(){
	//console.log(' press confirm button ');

	createANewLGroup();	

	//remove the lasso panel
	$('#lassodiv').remove();
	//clear the link manager 
	g_ObjectLinkManager.clearLassoEleIds();
}	

function clickBaseRuleConfirmButton(baseRule){
	//console.log(" press clickBaseRuleConfirmButton ", baseRule);
	//todo
	createANewLGroup_baseRule(baseRule);

	$('#lassodiv').remove();	
	//clear the link manager 
	g_ObjectLinkManager.clearLassoEleIds();
}

//create a new linked group, by link
function createANewLGroup(){

	//get the lassoed eleids
	var liExampleEleIds = g_ObjectLinkManager.getLassoEleIds();

	var attrs = {};
	attrs['type'] = 'compound';
	attrs['value'] = 'link';
	attrs['name'] = 'link';

	//detect the new group
	var liCompoundEleIds = detectCompoundEles(liExampleEleIds);

	//update the group ele ids
	var liEleGroupId = [];
	for(var i = 0; i < liCompoundEleIds.length; i ++){
		var liEleId = liCompoundEleIds[i];
		var iGroupEleId = g_ElementProperties.addGroupEle(liEleId);
		liEleGroupId.push(iGroupEleId);
	}

	// //console.log(" Linked Compound EleIdList ", liCompoundEleIds);
	// //console.log('111111 groupid ', iGroupId, ' xxx ', ' , ', liCompoundEleIds[0]);

	var iGroupId = g_ObjectGroupManager.addNewGroup(liEleGroupId, attrs);//liCompoundEleIds, attrs);
	// //console.log('groupid ', iGroupId, ' xxx ', ' , ', liCompoundEleIds[0]);

	//update the button part in the object panel
	drawObjectButtons();
}

//create a new linked group based on the user defined rule
function createANewLGroup_baseRule(baseRule){

	//get the lassoed eleids
	var liExampleEleIds = g_ObjectLinkManager.getLassoEleIds();

	var attrs = {};
	attrs['type'] = 'compound';
	attrs['value'] = 'link';
	attrs['name'] = 'link';

	var liCompoundEleIds = detectCompoundEles(liExampleEleIds);

	//update the group ele ids
	var liEleGroupId = [];
	for(var i = 0; i < liCompoundEleIds.length; i ++){
		var liEleId = liCompoundEleIds[i];
		var iGroupEleId = g_ElementProperties.addGroupEle(liEleId);
		liEleGroupId.push(iGroupEleId);
	}

	//sort the compound ele by the position rules
	liCompoundEleIds = sortCompoundEleIdsbyRule(liCompoundEleIds, baseRule);

	var iGroupId = g_ObjectGroupManager.addNewGroup(liEleGroupId, attrs);//liCompoundEleIds, attrs);

	//console.log('groupid ', iGroupId, ' xxx ', liCompoundEleIds[0][0], liCompoundEleIds[0][1]);

	//update the button part in the object panel
	drawObjectButtons();
}

//sort the compound ele id list by given rules
function sortCompoundEleIdsbyRule(liCompoundEleIds ,baseRule){
	var liNewCompoundEleIds = [];


	//console.log(" base rule ", baseRule);
//	var liPositionRelationship = ['left_aligned', 'right_aligned', 'centerh_aligned', 'verticalh_aligned', 'buttom_aligned', 'top_aligned', 'connecth_aligned', 'connectv_aligned'];
			
	for (var i = 0; i < liCompoundEleIds.length; i++) {
		var liEleId = liCompoundEleIds[i];
		if(liEleId.length > 2) continue;
		var eleid1 = liEleId[0], eleid2 = liEleId[1];
		var ele1 = g_ElementProperties.getElebyId(eleid1), ele2 = g_ElementProperties.getElebyId(eleid2);
		var center1 = getCentroidOfEle(ele1), center2 = getCentroidOfEle(ele2);			
		var liNewEleId = [];
		switch(baseRule){
			case "left_aligned":
			case "right_aligned":
			case "centerh_aligned":
			case "verticalh_aligned":
			//top-down
				if(center1.y < center2.y)
					liNewEleId = [eleid1, eleid2];
				else
					liNewEleId = [eleid2, eleid1];
				break;
			default:
			//left-right
				if(center1.x < center2.x)
					liNewEleId = [eleid1, eleid2];
				else
					liNewEleId = [eleid2, eleid1];
				break;
		}
		liNewCompoundEleIds.push(liNewEleId);
	};

	return liNewCompoundEleIds;
}

function clickDeleteButton(){
}

