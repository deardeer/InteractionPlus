//
// var g_renameProperty = {};
var EXPANDBARHEIGHT = 80;
var UNEXPANDBARHEIGHT = 25;
var XSHIFT = 30;//22;30;
var YSHIFT = 15;

var UI;

var Test;

function PropertiesPanelRender(iId, inObj, objectGroupManager){

	var Info = {};

	Info.__init__ = function(iId, inObj, objectGroupManager){
		//console.log(" init PropertiesPanelRender ", iId);
		this.m_iId = iId;
		this.m_iSelectGroupid = -1;
		this.m_InObj = inObj;
		this.m_ObjectGroupManager = objectGroupManager;
		this.m_PropertyManager = this.m_InObj.m_PropertyManager;
		this.m_ElementProperty = this.m_InObj.m_ElementDetector.m_ElementProperties;
		this.m_CrossFilterInfo = this.m_InObj.m_CrossFilter.m_CrossFilterInfo;

		//DOM
		this.m_ProPanelDivId = 'property_p_' +  this.m_iId + '_div';
		this.m_ButtonGroupId = "property_top_buttongroup" + this.m_iId;
		this.m_CreateButtonId = "pg_Create" + this.m_iId;
		this.m_AddPropertyButton = "add_property_button" + this.m_iId;
		this.m_InvisibleMenu = "invisible_property_menu" + this.m_iId;

		//geometroic
		this.m_mapProIdHeight = {};
		this.m_mapProIdExpand = {};
		this.m_mapProIdSelect = {};

		//droppable 
		this.m_mapGroupIdDropPropertyIds = {};
		//current drop property id
		this.m_liDropPropertyId = [];

		//container for property: self.m_iId + 'proset_' + compoundindex;
		//property_li in invisible_menu: 'p_' + self.m_iId + 'pro_li_' + id;
		//pro-div for property: 'p_' + self.m_iId + 'pro_' + id;
		//'p_' + self.m_iId + 'dis_' + iPId;
		//'#' 'p_' + self.m_iId + 'scatterplot_' + iSPID

	}

	Info.drawColorLegend = function(iGroupId){

		console.log(' draw color legend ', iGroupId);

		var self = this;
		var containerSvg = d3.select('#newsvg_' + this.m_iId)
		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
	   	var propertyId = propertyBag.getPropertyIdbyName('fill')
	   	var disConfig = propertyBag.getDisConfig(propertyId);

	   	var liData = [];
	   	var dis = propertyBag.getDis(propertyId);
	   	for(var i = 0; i < disConfig.valueList.length; i ++){
	   		liData.push({
	   			'value': disConfig.valueList[i],
	   			'count': dis[disConfig.getBinIndex(disConfig.valueList[i])],
	   		})
	   	}
	   	// liData.sort(function(a, b){
	   	// 	return b.count - a.count;
	   	// })

	   	console.log(' fill ', propertyId, disConfig, liData);

	   	var group = containerSvg
	   		.append('g')
	   		.attr('class', 'colorlegend');

	   	var recttext = group.selectAll('.colorcell')
	   		 .data(liData)
	   		 .enter()
 	   		 .append('g')
 	   		 .attr('transform', function(d, i){
 	   		 	return 'translate(0,' + (3 + 15 * i) + ')'
 	   		 })
	   		 .attr('class', 'colorcell');

	   	recttext.append('text')
				.attr("dy", function(d, i){
					return "1.0em"
				})
				.attr('dx', function(d, i){
					return "25px"
				})
				.style("text-anchor", "middle")
	   			.text(function(d, i){
	   				return d.count;
	   			})
	   			

	   	recttext
	   		 .append('rect')
	   		 .attr('width', '10')
	   		 .attr('height', '10')
	   		 .attr('clicked', 'yes')
	   		 .attr('binindex', function(d,i){
	   		 	return i;
	   		 })
	   		 .style('x', function(d, i){
	   		 	return 5
	   		 })
	   		 .style('y', function(d, i){
	   		 	return 0
	   		 	// return (12 * i)
	   		 })
	   		 .style('stroke', 'black')
	   		 .style('fill', function(d, i){
	   		 	return d.value
	   		 })
	   		 .on('click', function(d, i){
	   		 	var clicked = d3.select(this).attr('clicked');
	   		 	if(clicked == 'yes'){
	   		 		clicked = 'no';
	   		 		d3.select(this).style('opacity', 0.3)
	   		 	}else{
	   		 		clicked = 'yes'
	   		 		d3.select(this).style('opacity', 1.)	   		 		
	   		 	}
	   		 	d3.select(this).attr('clicked', clicked);

	   		 	//get clicked index
	   		 	// console.log(' click ', i);

   		 		//compute thte selected ele if necessary
				var liSelectIndexRange = [];
				d3.selectAll("[clicked='yes']")
				   .each(function(d, i){
					liSelectIndexRange.push([d3.select(this).attr('binindex'), d3.select(this).attr('binindex')]);
				   	// console.log(' clicked = ', );
				})
				var liSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(propertyId, liSelectIndexRange);
			
				console.log(' selected ele id ', liSelectedEleId);	

				//notify the cross-filter with selected property range
				self.m_CrossFilterInfo.setFilterEleIdsofPropertyId(propertyId, liSelectedEleId);

				//update the object_create_button
				var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();

				//console.log(' lifilter ', liFilterEleId);
				var eleNum = liFilterEleId.length;

				if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
						//the compound ele
						var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
					eleNum = liCompoundEleIds.length;
				}

				$('#' + self.m_CreateButtonId).text(getCreateObjectButtonName(eleNum));	

				self.updateFilteredRects();	
				// self.updateBoxPlots(propertyId, adjustExtentRange);
				//notify the mask
				self.m_InObj.updateFilteredEleId(liFilterEleId);
	   		 })
	}

	//draw buttons in property panel
	Info.drawButtonsinPropertyPanel = function(){
		var self = this;
		//TODO
		//add derive proerty dialog
		// addDerivePropertyDialog();
		// addScatterPlotDialog();

		//clear button group
		$('#'  + self.m_ButtonGroupId).remove();

		//select the titlebar div

		var titleDiv = $('#' + self.m_ProPanelDivId + ' .titlebar');
		//console.log("drawButtonsinPropertyPanel ", titleDiv.html());
		
		// add the buttons
		var buttonNameList = ['Create', 'Derive', '2D']; 
		self.m_CreateButtonId = self.m_iId + "pg_" + buttonNameList[0];		
		self.m_DeriveButtonId = self.m_iId + "pg_" + buttonNameList[1];
		self.m_2DButtonId = self.m_iId + "pg_" + buttonNameList[2];
			
		var buttongrouphtml = 
		'<div class="btn-group header_footer_buttongroup" role="group" id = "property_top_buttongroup" aria-label="...">'+
			'<button type="button" class="btn btn-warning btn-xs function_button" id=<%=createButtonId%> value=<%=createButtonName%> >Create</button>'+
			// '<button type="button" class="btn btn-warning btn-xs function_button" id=<%=deriveButtonId%> value=<%=deriveButtonName%> >Derive</button>'+
			// '<button type="button" class="btn btn-warning btn-xs function_button" id=<%=scatterButtonId%> value=<%=scatterButtonName%> style="visibility:hidden">2D</button>'+
			'<div class="btn-group dropdown dropdown-scroll" role="group">'+
				'<button id=<%=addpropertybuttonid%> type="button" class="btn btn-warning btn-xs function_button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Add<span class="caret"></span></button>'+
				'<ul class="dropdown-menu" id=<%=invisiblemenu%>></ul>'+
			'</div>'+
		'</div>';
		var compiled = _.template(buttongrouphtml);
		// //console.log(" xxxx ",  compiled({
		// 	createButtonId: self.m_CreateButtonId,//self.m_iId + 'pg_' + buttonNameList[0],
		// 	createButtonName: buttonNameList[0],
		// 	deriveButtonId: self.m_DeriveButtonId,//self.m_iId + 'pg_' + buttonNameList[1],
		// 	deriveButtonName: buttonNameList[1],
		// 	scatterButtonId: self.m_2DButtonId,//self.m_iId + 'pg_' + buttonNameList[2],
		// 	scatterButtonName: buttonNameList[2],
		// 	addpropertybuttonid: self.m_AddPropertyButton,
		// 	invisiblemenu: self.m_InvisibleMenu, 
		// }))
		titleDiv.html(titleDiv.html() + compiled({
			createButtonId: self.m_CreateButtonId,//self.m_iId + 'pg_' + buttonNameList[0],
			createButtonName: buttonNameList[0],
			deriveButtonId: self.m_DeriveButtonId,//self.m_iId + 'pg_' + buttonNameList[1],
			deriveButtonName: buttonNameList[1],
			scatterButtonId: self.m_2DButtonId,//self.m_iId + 'pg_' + buttonNameList[2],
			scatterButtonName: buttonNameList[2],
			addpropertybuttonid: self.m_AddPropertyButton,
			invisiblemenu: self.m_InvisibleMenu, 
		}));

		//console.log("aft drawButtonsinPropertyPanel ", titleDiv.html());

		$('#' + self.m_CreateButtonId).click(function(event){
			self.clickPropertyButton(this.value);		
		});

		$('#' + self.m_DeriveButtonId).click(function(event){
			self.clickPropertyButton(this.value);
		});

		$('#' + self.m_2DButtonId).click(function(event){
			self.clickPropertyButton(this.value);
		});

		$('#' + self.m_AddPropertyButton).on('click', function(){

			if($('#' + self.m_InvisibleMenu)[0].style.display == 'none' || $('#' + self.m_InvisibleMenu)[0].style.display == "")
				$('#' + self.m_InvisibleMenu).css({
					display: 'block'
				});
			else
				$('#' + self.m_InvisibleMenu).css({
					display: 'none'
				});
		})

		$('#' + self.m_InvisibleMenu).on('click', 'li', function(e){
			var propertyId = parseInt($(this).attr('propertyid'));
			//console.log(' click ', propertyId);
	   		$(this).remove();
	   		//make group visible
	   		var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
	   		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
	   		propertyBag.setPropertyVisible(propertyId, true);

	   		var containerdiv = self.m_ProPanelDivId;//'property_p';
	   		var compoundindex = propertyBag.getCompoundIndexofProperty(propertyId);
	   		
	   		if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()) //.getSelectedGroupType() == 'compound')
	   			containerdiv = self.m_iId + 'proset_' + compoundindex;
	   		//console.log(' compound index ', containerdiv);
	   		//check if the property is in propertyset

	   		self.drawProperty(propertyId, containerdiv);

			//check the property-add-button
			if(propertyBag.getInVisiblePropertyIds().length > 0){
				// //console.log(' invisible = true ');
				$('#' + self.m_AddPropertyButton).removeClass('alpha-3');
			}else{
				// //console.log(' invisible = false ');
				$('#' + self.m_AddPropertyButton).addClass('alpha-3');
			}
			$('#' + self.m_InvisibleMenu).css({
				display: 'none'
			});
		});

		$('#' + self.m_InvisibleMenu).on('mouseenter', 'li', function(e){
			//console.log(" mouse enter property list ");
			var propertyId = parseInt($(this).attr('propertyid'));
			$('#' + 'p_' + self.m_iId + 'pro_li_' + propertyId).addClass('background-highlight cursor-pointer');
		});

		$('#' + self.m_InvisibleMenu).on('mouseout', 'li', function(e){
			//console.log(" mouse leave property list ");
			var propertyId = parseInt($(this).attr('propertyid'));
			$('#' + 'p_' + self.m_iId + 'pro_li_' + propertyId).removeClass('background-highlight cursor-pointer');
		});

		//init the 'add' button to semitrans
		$('#' + self.m_AddPropertyButton).addClass('alpha-3');
	}


	Info.removeDrawProperties = function(){
		var self = this;
		$('#' + self.m_ProPanelDivId + ' .propertyrow').remove();
		$('#' + self.m_ProPanelDivId + '.compoundrow').remove();
		$('#' + self.m_ProPanelDivId + '.scatter_plot_row').remove();
	}

	//set the hover ele id
	Info.hoverEleId = function(iHoveredEleId){
		var self = this;

		//set the hoverrect invisible
		d3.selectAll('.hover_rect_' + self.m_iId)
		.style('visibility', 'hidden');

		if(iHoveredEleId != -1){	
			var iGroupId = self.m_ObjectGroupManager.getGroupIdofEleId(iHoveredEleId);
			
			var iSelectGroupId = self.m_ObjectGroupManager.getSelectedGroupId();  
			if(iSelectGroupId == iGroupId){
				var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectGroupId);
				var liVisiblePropertyId = propertyBag.getVisiblePropertyIds();
				// console.log(" BAR ", liVisiblePropertyId);
				for (var i = liVisiblePropertyId.length - 1; i >= 0; i--) {
					var iProId = liVisiblePropertyId[i];
					var disConfig = propertyBag.getDisConfig(iProId);
					var value = propertyBag.getPropertyValue(iProId, iHoveredEleId);
					var binIndex = disConfig.getBinIndex(value);

					//'p_' + self.m_iId + 'dis_' + iPId;
					var bar = d3.select('#p_' + self.m_iId + 'dis_' + iProId + ' .barrect_' + binIndex);
					if(bar == undefined){
						// console.log(" BAR HERE ");
						return;
					}
					// console.log(' BAR ', '#p_' + self.m_iId + 'dis_' + iProId + ' .barrect_' + binIndex);//bar.attr('x'), binIndex, value);
					d3.select('#hover_property_' + self.m_iId + '_' + iProId)
					.style('visibility', 'visible')
					.style('x', bar.attr('x'))
					.style('y', bar.attr('y'))
					.style('width', bar.attr('width'))
					.style('height', bar.attr('height'));
				};
			}
		}
	}


	//release the filtering on property
	Info.releaseFilter = function(iPId){

		var self = this;
		//reset the extent to 0 width
		d3.selectAll('#' + 'p_' + self.m_iId + 'pro_' + iPId + ' .extent').attr('width', 0);
		d3.selectAll('#'  + 'p_' + self.m_iId + 'pro_' + iPId + ' .marker_left').classed('hidden', true);
		d3.selectAll('#' + 'p_' + self.m_iId + 'pro_' + iPId + ' .marker_right').classed('hidden', true);

		//update the cross filter
		self.m_CrossFilterInfo.releaseFilterEleIdsofPropertyId(iPId);

		//update the filter ele ids
		var liFilteredEleId = self.m_CrossFilterInfo.getFilterEleIds();
		var iSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectedGroupId);

		propertyBag.setFilterEldIds(liFilteredEleId);
		// //console.log(" iPId ", iPId, ' filter ele id ', liFilteredEleId);

		//change the rect
		self.updateFilteredRects();
	}

	//set property invisible
	Info.deleteProperty = function(iPropertyID){

		var self = this;
		//release the filtering on this property
		self.releaseFilter(iPropertyID);

		//remove the property
		var propertyId =  'p_' + self.m_iId + 'pro_' + iPropertyID; //self.m_iId + 'pro_' + id;
		$('#' + propertyId).remove();
		
		var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
		var propertyName = propertyBag.getPropertyNamebyId(iPropertyID);
		propertyBag.setPropertyVisible(iPropertyID, false);

		//console.log(' remove property id ', propertyId, ' property name ', propertyName);
		var newlihtml = '<li id=<%=liproid%> propertyid=<%=propertyId%> class="text-center"><%=propertyName%></li>'
		var compiled = _.template(newlihtml);	
	    $('#' + self.m_InvisibleMenu).html($('#' + self.m_InvisibleMenu).html() + compiled({
			propertyId: iPropertyID,
			propertyName: propertyName,
			liproid: 'p_' + self.m_iId + 'pro_li_' + iPropertyID, //self.m_iId + 'pro_li_' + id;
		}));

		//test 
		// //console.log(' visible properties: ', propertyBag.getVisiblePropertyIds());

		//check the property-add-button
		if(propertyBag.getInVisiblePropertyIds().length > 0){
			//console.log(' invisible = true ');
			$('#' + self.m_AddPropertyButton).removeClass('alpha-3');
		}else{
			//console.log(' invisible = false ');
			$('#' + self.m_AddPropertyButton).addClass('alpha-3');
		}

		//update inter
		g_InteractionRecorder.addRemovePropertyCount();
	}

	Info.drawProperties = function(iGroupId){

		var self = this;

		self.m_iSelectGroupid = iGroupId;

		//update the object_create_button
		//get the current ele ids 
		var iSelectGroupId = self.m_ObjectGroupManager.getSelectedGroupId();        
	   	var liSelectedEleIds = self.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);
	   	var eleNum = liSelectedEleIds.length;

	   	var eleNum = self.m_CrossFilterInfo.getFilterEleIds().length;

	   	if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){//.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSele){
			//console.log(" 1 initiate ", liSelectedEleIds.length);
	   		var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liSelectedEleIds);
	   		eleNum = liCompoundEleIds.length;
	   	}
		$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));

		//TODO
		// addProReNameDialog();

		//clear 
		self.removeDrawProperties();

		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
		//console.log(" propertyBag 1 ", propertyBag);
		// propertyBag.getGroupId();
		var liPropertyId = propertyBag.getVisiblePropertyIds();

		// console.log(" liVible Property Id ", liPropertyId);

		//set the filtered eleids
		var liFilteredEleId = self.m_CrossFilterInfo.getFilterEleIds();
		propertyBag.setFilterEldIds(liFilteredEleId);

		if(!self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() != 'compound'){		
			$.each(liPropertyId, function(i, iPId){
				self.drawProperty(iPId, self.m_ProPanelDivId);//'property_p');
			});
		}else{
			//compound
			self.drawCompoundPropertyRows();
		}
		// drawCompoundPropertyRows();

		$('#' + self.m_InvisibleMenu + ' li').remove();

		//init invisible properties
		var liVisiblePropertyId = propertyBag.getVisiblePropertyIds();

		var liAllPropertyId = propertyBag.getPropertyIds();
		var noOkName = ['g_x', 'g_y', 'g_box'];
		for(var i = 0; i < liAllPropertyId.length; i ++){
			var iPropertyId = liAllPropertyId[i];
			var propertyName = propertyBag.getPropertyNamebyId(iPropertyId);
			// console.log(" ERROR ", i, propertyName);
			if(noOkName.indexOf(propertyName) != -1){
				propertyBag.setPropertyVisible(iPropertyId, false);
			}
		}
		var liInvisilePropertyId = propertyBag.getInVisiblePropertyIds();
		// console.log(" ERROR ", liInvisilePropertyId);

		var liInvisilePropertyId = propertyBag.getInVisiblePropertyIds();
		$.each(liInvisilePropertyId, function(i, iPID){
			self.deleteProperty(iPID);
		});

		//draw the droppable one
		self.drawDroppableRow(iGroupId);
	}	

	Info.createMDS = function(){

		var self = this;
		var iSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iSelectedGroupId);
		var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectedGroupId);
		
		var divWidth = $('#drop_' + self.m_iId).width();
		var divHeight = $('#drop_' + self.m_iId).height();

		var mdsWidth = divWidth;//(divWidth>divHeight)?divHeight:divWidth;

		//console.log(" Create MDS ", mdsWidth, divWidth, divHeight);

		d3.select('#drop_' + self.m_iId)
		.append('div')
		.attr('class', 'left-div')
		.style('float', 'left')
		.style('width', divWidth - mdsWidth + 'px')
		.style('border', 'gray solid 1px')
		.style('height', '100%')
		// .style('padding', '5px')
		.style('visibility', 'hidden');

		var x_labelhtml = 
		'<div class="propertylabel mds_label" style="position:relative; width:100%;" >'+
			'<p style="font-size:12px; margin: 5px">MDS Dimensions:</p>' +
			'<p style="font-size:12px; margin: 5px"><%=xPropertyLabel%></p>'+
			'<p style="font-size:12px; margin: 5px"><%=yPropertyLabel%></p>'+
			'<p style="font-size:12px; margin: 5px"><%=zPropertyLabel%></p>'+
			// '<span class="propertyspan mds_label_span">'+
			// 	'<i class="fa fa-times delete_property_icon hidden" id=<%=deletebuttonid%> ></i>'+
			// 	'<p><%=xPropertyLabel%></p><p><%=yPropertyLabel%></p>'+
			// '</span>'+
		'</div>';
		//
		var liPropertyType = [];
		var liPropertyName = [];
		var changeName = ['fill', 'cx', 'cy', 'r'];
		var okName = ['color', 'cen-x', 'cen-y', 'radius'];

		for (var i = self.m_liDropPropertyId.length - 1; i >= 0; i--) {
			var propertyType = propertyBag.getPropertyTypebyId(self.m_liDropPropertyId[i]);
			var propertyName = propertyBag.getPropertyNamebyId(self.m_liDropPropertyId[i])
			// var propertyName = propertyType;
			if(changeName.indexOf(propertyName) != -1){
				propertyName = okName[changeName.indexOf(propertyName)];
				liPropertyName.push(propertyName);
			}
			liPropertyType.push(propertyType);
		};
		var compile_labelhtml = _.template(x_labelhtml);
	    x_labelhtml = compile_labelhtml({
			// propertyType: xPropertyType,
			// propertyName: propertyName,
			xPropertyLabel: liPropertyName[0],
			yPropertyLabel: liPropertyName[1],
			zPropertyLabel: liPropertyName[2],
			deletebuttonid: 'deletebutton_' + self.m_iId + '_mds',// + SPID,
		});		
	 	var label_div = $('#drop_' + self.m_iId).find('.left-div');
		// label_div.html(label_div.html() + x_labelhtml);

		//click event
		 $('.mds_label').bind('click', function(){
	    	//console.log(" mouse click ");
	    	//release the brush	    	
			// var prodiv = $(this).parents('.scatter_plot_row');
			// var iSPId = parseInt(prodiv.attr('scatterplotId'));
			// //console.log(" iSPID = ", iSPId);
			//TODO
			self.m_CrossFilterInfo.releaseFilterEleIdsofMDS();

			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();
			var eleNum = liFilterEleId.length;

			self.updateFilteredRects();

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
				var liCompoundEleId = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				//console.log(" 2 click ", liCompoundEleId.length);
				eleNum = liCompoundEleId.length;
			}
			//TODO
			$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));
	    });

		d3.select('#drop_' + self.m_iId)
		.append('div')
		.attr('class', 'right-div')
		.style('float', 'right')
		.style('width', mdsWidth + 'px')
		.style('border', 'gray solid 1px')		
		.style('height', '100%');

		//remove the scatter plot
		//console.log(" create MDS ");
		//compute mds
		var objectData = [];
		// var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(self.m_iGroupId);
		var liPropertyId = self.m_liDropPropertyId;//self.m_mapMDSIdPropertyIds[iMDSId];

		//check if there is color
		var mapEleIdColor = {};
		for (var i = liPropertyId.length - 1; i >= 0; i--) {
			var iProId = liPropertyId[i];
			var ProType = propertyBag.getPropertyTypebyId(iProId);
			if(colorTypeStr.indexOf(ProType) >= 0){
				var disConfig = propertyBag.getDisConfig(iProId);
				//color property
				for(var j = 0; j < liEleId.length; j ++){
					var iEleId = liEleId[j];
					// self.m_ElementProperty.getElementById
					var color = propertyBag.getPropertyValue(iProId, iEleId);
					// if(j == 0)
						//console.log(" COLORCOLOR ", color);
					mapEleIdColor[iEleId] = color;
				}
			}
		};
		
		var xyPosList = propertyBag.computeMDS(liEleId, liPropertyId);		
		var dotDataList = [];
		for (var i = xyPosList.length - 1; i >= 0; i--) {
		 	var xy = xyPosList[i];
		 	var iEleId = liEleId[i];
		 	var fillcolor;		

		 	dotDataList.push({
		 		'x': xy[0],
		 		'y': xy[1],
		 		'fill': mapEleIdColor[iEleId],
		 		'eleid': iEleId,
		 	})
		};
		
		// //console.log(" selected group id ", iSelectedGroupId, self.m_ElementProperty);

		// var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iSelectedGroupId);

		var radius = 6;
		var widthPad = radius, heightPad = radius;
		
		var mdsWidth = mdsWidth - widthPad * 2;
		var mdsWidth = mdsWidth - heightPad * 2;

		//console.log(" liEleIds!!! ", xyPosList, mdsWidth);
		//draw mds
		var svg = d3.select('#drop_' + self.m_iId + ' .right-div')
		.append('svg')
		.style('width', '100%')
		.style('height', '100%');

		var update = svg.selectAll(".mds-dot")
		.data(dotDataList);

		var enter = update.enter();
		var exit = update.exit();

		update.style('cx', function(d, i){
			return widthPad + mdsWidth * d.x;
		})
		.style('cy', function(d, i){
			return heightPad + mdsWidth * d.y;
		});

		enter.append('circle')
		.attr("class", 'mds-dot')
		.attr("EleId", function(d){
			return d.eleid;
		})
		.style('cx', function(d, i){
			return widthPad + mdsWidth * d.x;
		})
		.style('cy', function(d, i){
			return heightPad + mdsWidth * d.y;
		})
		.style('r', radius)
		.style('fill', function(d){		
			var fillColor = d['fill'];
			if(fillColor == undefined)
				return 'gray';
			return fillColor;			
		})	
		.style('stroke', '#bdbdbd')
		.style('stroke-width', '0.5px');

		exit.remove();	


		//text
		var update_text = svg.selectAll(".mds-text")
		.data(liPropertyName);
		var enter_text = update_text.enter();
		var exit_text = update_text.exit();

		var font = '14px arial';
		var mdstext_fontsize = getTextSize('visibleText', font);

		update_text
		.text(function(d){return d;})
	    .attr('y', function(d, i){
	    	return (i + 1) * mdstext_fontsize.h + 5;
	    });

		enter_text.append("text")
		.attr('class', 'mds-text')
		.text(function(d){return d;})
	    .style('font-size', '14px')
	    .attr('x', 5)
	    .attr('y', function(d, i){
	    	return (i + 1) * mdstext_fontsize.h + 5;
	    });

		exit_text.remove();	

		/*---- lasso ----*/
		// Lasso functions to execute while lassoing
		var color = d3.scale.category10();

		var lasso_start = function() {
		  lasso.items()
		   .attr("opacity", '0.3');

		    // .attr("r",3.5) // reset size
		    // .style("fill",null) // clear all of the fills
		    // .classed({"not_possible":true,"selected":false}); // style as not possible
		};

		var lasso_draw = function() {
		  // Style the possible dots
		  lasso.items().filter(function(d) {return d.possible===true})
		  .attr('stroke', 'black')
		  .attr('stroke-width', '1.5px')
		  .attr("opacity", '1.0');
		    // .classed({"not_possible":false,"possible":true});

		  // Style the not possible dot
		  lasso.items().filter(function(d) {return d.possible===false})
		  .attr('stroke', 'none')		  
		  .attr('opacity', '0.3');
		    // .classed({"not_possible":true,"possible":false});
		};

		var lasso_end = function() {
		  // Reset the color of all dots
		  lasso.items()
			.classed({'selected-mds-dot': false})
		  	.attr('stroke', 'none')
		    .attr("opacity", '0.3');

		  // Style the selected dots
		  lasso.items().filter(function(d) {return d.selected===true})
			 .classed({"selected-mds-dot":true,})
			 .attr('stroke', 'black')
		 	 .attr('stroke-width', '1.5px')
		    // .classed({"not_possible":false,"possible":false})
		    .attr("opacity",'1.0');

		  // var selectPoints = lasso.items().filter(function(d){return d.selected == true;});
		  var liFilterDot = lasso.items().filter(function(d){
		  	return d.selected == true;
		  });
		  var liSelectedEleId = [];
		  //get the lassoed element
		  for (var i = liFilterDot[0].length - 1; i >= 0; i--) {
		  	var eleDot = liFilterDot[0][i];
		  	var eleId = eleDot.getAttribute('EleId');
		  	liSelectedEleId.push(Number(eleId));
		  };
		  //console.log(" SELECT POINT NUM ", liFilterDot, liFilterDot[0].length, liSelectedEleId);//, liEle_Temp);

		  updateLassoSelected(liSelectedEleId);
		};

		function updateLassoSelected(liSelectedEleId){
			//console.log(" XXXX ", liSelectedEleId.length);
			self.m_CrossFilterInfo.setFilterEleIdsofMDS(liSelectedEleId);
			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();
			var eleNum = liFilterEleId.length;
			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
				//the compound ele
				var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				eleNum = liCompoundEleIds.length;
			}
			$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));	
			self.updateFilteredRects();
			// var selectedDots = d3.selectAll('.selected-mds-dot');// d3.selectAll('.selected-mds-dot');
		  	// //console.log(' SELECT POINT NUM NEW', selectedDots.length);
		}

		// Create the area where the lasso event can be triggered
		var lasso_area = svg.append("rect")
	                      .attr("width", $('#drop_1  .right-div').width())
	                      .attr("height",$('#drop_1  .right-div').height())
	                      .style("opacity",0);

		// Define the lasso
		var lasso = d3.lasso()
		      .closePathDistance(75) // max distance for the lasso loop to be closed
		      .closePathSelect(true) // can items be selected by closing the path?
		      .hoverSelect(true) // can items by selected by hovering over them?
		      .area(lasso_area) // area where the lasso can be started
		      .on("start",lasso_start) // lasso start function
		      .on("draw",lasso_draw) // lasso draw function
		      .on("end",lasso_end); // lasso end function

		svg.call(lasso);
  		lasso.items(d3.selectAll("#drop_" + self.m_iId + " .mds-dot"));

		return xyPosList;

		// var cityData = [[0, 587, 1212, 701, 1936, 604, 748, 2139, 2182, 543],
  //   [587, 0, 920, 940, 1745, 1188, 713, 1858, 1737, 597],
  //   [1212, 920, 0, 879, 831, 1726, 1631, 949, 1021, 1494],
  //   [701, 940, 879, 0, 1374, 968, 1420, 1645, 1891, 1220],
  //   [1936, 1745, 831, 1374, 0, 2339, 2451, 347, 959, 2300],
  //   [604, 1188, 1726, 968, 2339, 0, 1092, 2594, 2734, 923],
  //   [748, 713, 1631, 1420, 2451, 1092, 0, 2571, 2408, 205],
  //   [2139, 1858, 949, 1645, 347, 2594, 2571, 0, 678, 2442],
  //   [2182, 1737, 1021, 1891, 959, 2734, 2408, 678, 0, 2329],
  //   [543, 597, 1494, 1220, 2300, 923, 205, 2442, 2329, 0]]
		// self.m_liDropPropertyId
	}


	Info.createAScatterProperties = function(){

		var self = this;

		g_InteractionRecorder.addHybridPropertyCount();

		//get the defined scatter plot
		var iXPropertyId, iYPropertyId;
		var iSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectedGroupId);

		// //console.log(' XXXX: ', $('#scatterplot_x_input')[0].propertyUniValue, 'x', $('#scatterplot_y_input')[0].propertyUniValue);

	 	iXPropertyId = self.m_liDropPropertyId[0]; //propertyBag.getPropertyIdbyUniqName($('#scatterplot_x_input')[0].propertyUniValue);
	 	iYPropertyId = self.m_liDropPropertyId[1];// propertyBag.getPropertyIdbyUniqName($('#scatterplot_y_input')[0].propertyUniValue);
		var xPropertyType = propertyBag.getPropertyTypebyId(iXPropertyId), yPropertyType = propertyBag.getPropertyTypebyId(iYPropertyId);
	 	var xPropertyName = propertyBag.getPropertyNamebyId(iXPropertyId), yPropertyName = propertyBag.getPropertyNamebyId(iYPropertyId);

	 	var changeName = ['fill', 'cx', 'cy', 'r'];
		var okName = ['color', 'cen-x', 'cen-y', 'radius'];		

		if(changeName.indexOf(xPropertyName) != -1){
			xPropertyName = okName[changeName.indexOf(xPropertyName)];
		}
		if(changeName.indexOf(yPropertyName) != -1){
			yPropertyName = okName[changeName.indexOf(yPropertyName)];
		}

	 	var iScatterPlotId = self.m_PropertyManager.createAScatterPlot(iSelectedGroupId, iXPropertyId, iYPropertyId);

	 	//default width	
		var labelDivWidth = '0%';//labelTextSize['w'] + gapWidth;
	 	var disDivWidth = '100%';//prodiv.width() - labelDivWidth - labelDisGap;

	 	//add a div
	 	var SPID = iScatterPlotId;//'scatterplot_' + iScatterPlotId;

	 	var div = d3.select("#drop_" + self.m_iId).append("div");

		// var div = document.getElementById('scatterplot_property_p');	
		var tplhtml = 
		'<div class="scatter_plot_row" id=<%=scatterplotrowdivId%> scatterplotId=<%=iScatterPlotId%> style="height:<%=rowHeight%>" >'+
			'<div class = "scatter_plot_label_div" style="float: left; position: relative; width: <%=labelDivWidth%>;  height: 100%; " >'+
			'</div>'+
			'<div class = "scatter_plot_dis_div" style="float: right; position: relative; width: <%=disDivWidth%>;  height: 100%; border: solid 1px #d9d9d9;" >'+
				'<svg style="width: 100%; height: 100%;" id=<%=svgID%>>'+
				'</svg>'+
			'</div>'+
		'</div>';
		var compiled = _.template(tplhtml);
		
		var dropDivId = 'drop_' + self.m_iId;
		var rowHeight_temp = d3.select('#' + dropDivId)	
		.style('height');

		//console.log(" row heightXXX ", rowHeight_temp);

		div.html(function(d){
			return compiled({
				iScatterPlotId: iScatterPlotId,
				rowHeight: rowHeight_temp, 
				svgID: 'scatterplot_' + self.m_iId + '_' + SPID,
				scatterplotrowdivId: 'scatter_plot_div_' + self.m_iId + '_' + SPID,
				labelDivWidth: labelDivWidth,
				disDivWidth: disDivWidth,
			})
		});

		//update the width
		var font = '12px arial';
		var labelDivWidth, disDivWidth;
		var xLabel = 'X: ' + xPropertyName, yLabel = 'Y: ' + yPropertyName;
		var propertyName = xLabel.length > yLabel.length?xLabel:yLabel;
		var labelTextSize = getTextSize(propertyName, font);
		var gapWidth = 15;
		var labelDisGap = 5;

		div = $('#scatter_plot_div_' + self.m_iId + '_' + SPID);

		var labelDivWidth = labelTextSize['w'] + gapWidth;
		labelDivWidth = 0;
	 	var disDivWidth = div.width() - labelDivWidth - labelDisGap;

	 	div.find('.scatter_plot_label_div').width(labelDivWidth + 'px');
	 	div.find('.scatter_plot_dis_div').width(disDivWidth + 'px');

	 	//add x label
	 	var label_div = div.find('.scatter_plot_label_div');
		var x_labelhtml = 
		'<div class="propertylabel scatterplot_label" value=<%=propertyType%>  style="position:relative; width:100%" >'+
			'<span class="propertyspan scatter_plot_label_span">'+
				'<i class="fa fa-times delete_property_icon hidden" id=<%=deletebuttonid%> ></i>'+
				'<p><%=xPropertyLabel%></p><p><%=yPropertyLabel%></p>'+
			'</span>'+
		'</div>';
		//
		var compile_labelhtml = _.template(x_labelhtml);
	    x_labelhtml = compile_labelhtml({
			propertyType: xPropertyType,
			propertyName: propertyName,
			xPropertyLabel: xLabel,
			yPropertyLabel: yLabel,
			deletebuttonid: 'deletebutton_' + self.m_iId + '_' + SPID,
		});
		// label_div.html(label_div.html() + x_labelhtml);

		//click event
		 $('.scatter_plot_label_span').bind('click', function(){
	    	//console.log(" mouse click ");
	    	//release the brush	    	
			var prodiv = $(this).parents('.scatter_plot_row');
			var iSPId = parseInt(prodiv.attr('scatterplotId'));
			//console.log(" iSPID = ", iSPId);
			//TODO
			self.releaseSPFilter(iSPId);

			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();
			var eleNum = liFilterEleId.length;

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
				var liCompoundEleId = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				//console.log(" 2 click ", liCompoundEleId.length);
				eleNum = liCompoundEleId.length;
			}
			//TODO
			$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));
	    });

		//add the scatter plot
		//console.log(" create scatter plot ");
		var spConfig = propertyBag.getScatterPlotConfig(iScatterPlotId);
		var mapValueList = propertyBag.getScatterPlotDis(iScatterPlotId);

		//get the max value
		var liValue = [];
		for (var i = 0; i < mapValueList.length; i++) {
			var mapValue = mapValueList[i];
			var value = mapValue['count'];
			liValue.push(value);
		};
		var iMinValue = _.min(liValue), iMaxValue = _.max(liValue);
		// var beginColor = d3.rgb('#f0f0f0'), endColor = d3.rgb('#808080');
		// var computeColor = d3.interpolate(beginColor,endColor);

		var xAxisLength = $('#scatterplot_' + self.m_iId + '_' + SPID).width();
		var yAxisLength = $('#scatterplot_' + self.m_iId + '_' + SPID).height();
		var xLeftPos = xAxisLength * 0.13, xRightPos = xAxisLength * 0.9;
		// var xBasePos = xAxisLength * 0.1;
		var yBasePos = yAxisLength * 0.1;
		var yTopPos = yAxisLength * 0.9;
		var rectWidth = 1. * xAxisLength/(spConfig.ixBinNum);
		var rectHeight = 1. * yAxisLength/(spConfig.iyBinNum);

		// //console.log(' propertyType ', xPropertyType, ' , ', yPropertyType);
	
		var xWidthScale = d3.scale.linear()
						.domain([0, iMaxValue])
						.range([0, 1]);

		var xScale = d3.scale.linear()
					.domain([0, spConfig.ixBinNum - 1])
					.range([xLeftPos, xRightPos]);//10, xAxisLength]);
		var yScale = d3.scale.linear()
					.domain([spConfig.iyBinNum, 1])
					.range([yBasePos, yTopPos]);
					// .range([0, yAxisLength]);

		var xAxis = d3.svg.axis()
		     .scale(xScale)
		     .orient("bottom");

		 var yAxis = d3.svg.axis()
		    .scale(yScale)
		    .orient("left")
		    .ticks(4);

		var xShift = 0, yAxisExpandPad = 10;

		//expand x-y axis
		d3.select('#scatterplot_' + self.m_iId + '_' + SPID).append("g")
		.attr("class", "x axis")
		.attr('transform', "translate(" + xShift + "," + yTopPos + ")")
		.call(xAxis)
		.append("text")
			  .attr("class", "label")
			  // .attr("transform", "rotate(-90)")
			  .attr("y", yBasePos - 35)
			  .attr("x", xRightPos)
			  .attr("dy", ".71em")
			  .style('font-size', '14px')
			  .style("text-anchor", "end")
			  .text(xPropertyName)

		d3.select('#scatterplot_' + self.m_iId + '_' + SPID).append("g")
	      .attr("class", "y axis")
		  .attr("transform", "translate(" + (xLeftPos - 8) + "," + 0 + ") ")
			.call(yAxis)	      
			.append("text")
			  .attr("class", "label")
			  .attr("transform", "rotate(-90)")
			  .attr("y", 6)
			  .attr("x", -10)
			  .attr("dy", ".71em")
			  .style('font-size', '14px')
			  .style("text-anchor", "end")
			  .text(yPropertyName)

		propertyBag.setSPSizeScale(iScatterPlotId, xScale, yScale, xWidthScale);

		//console.log(' scatter plot id ', '#' + SPID);


		// var gSel = d3.select("#scatterplot_"+SPID);

		// var groups = gSel.selectAll("g.scatterplot_filter_group")
		// 	.data(mapValueList,function(d){
		// 		return d.index;
		// 	})

		// var enter = groups.enter().append("g")
		// 	.attr("class","scatterplot_filter_group");

		// enter.append("rect");
		// enter.append("title");

		// groups.select("rect").attr("x","")
		// groups.select("title").attr("text",)

		// groups.exit().remove();




		var groups = d3.select('#scatterplot_' + self.m_iId + '_' + SPID)
		.selectAll('.scatterplot_filter_group')
		.data(mapValueList,function(d){
			return d.index
		})
		.enter()
		.append('g')
		.attr('class', 'scatterplot_filter_group');

		var scale = 0.8;
		// groups.append('rect')
		// .attr('class', 'scatter_plot_bar')
		// .attr('width', function(d){
		// 	var value = d['count'];
		// 	return rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value) + 'px';
		// 	// return rectWidth + 'px';
		// })
		// .attr('height', function(){
		// 	return rectHeight + 'px';
		// })
		// .attr('x', function(d){
		// 	var iIndex = d['index'];
		// 	var value = d['count'];
		// 	var xyIndex = spConfig.getXYIndex(iIndex);
		// 	var barwidth = rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value);
		// 	// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
		// 	return xScale(xyIndex.x) + rectWidth/2. - barwidth/2. + 'px';
		// })
		// .attr('y', function(d){
		// 	var iIndex = d['index'];
		// 	var xyIndex = spConfig.getXYIndex(iIndex);
		// 	if(xyIndex.y == 0)
		// 		return "0px";

		// 	return yScale(xyIndex.y) - rectHeight + 'px';
		// })
		groups.append('circle')
		.attr('class', 'scatter_plot_bar')
		.attr('r', function(d){
			var value = d['count'];
			return '5px';
			// return rectWidth * xWidthScale(value) * 0.5 + 'px';//(rectWidth * 0.7 + rectWidth * 0.3 * xWidthScale(value)) * 0.5 * scale + 'px';
			// return rectWidth + 'px';
		})
		// .attr('height', function(){
		// 	return rectHeight + 'px';
		// })
		.attr('cx', function(d){
			var iIndex = d['index'];
			var value = d['count'];
			var xyIndex = spConfig.getXYIndex(iIndex);
			var barwidth = rectWidth * 0.7 + rectWidth * 0.3 * xWidthScale(value);
			// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
			return  xScale(xyIndex.x);// + rectWidth/2. - barwidth/2. - (rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value)) * 0.5 + 'px';
		})
		.attr('cy', function(d){
			var iIndex = d['index'];
			var xyIndex = spConfig.getXYIndex(iIndex);
			if(xyIndex.y == 0)
				return  yBasePos + "px";

			return yScale(xyIndex.y);// + yBasePos - rectHeight - (rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value)) * 0.5 + 'px';
		})
		.style('fill', function(d){		
			var iIndex = d['index'];
			if(colorTypeStr.indexOf(xPropertyType) >= 0){
				//x is the color
				var xyIndex = spConfig.getXYIndex(iIndex);
				//console.log(' color x ', propertyBag.getBinValue(iXPropertyId, xyIndex.x));
				return propertyBag.getBinValue(iXPropertyId, xyIndex.x);
			}

			if(colorTypeStr.indexOf(yPropertyType) >= 0){
				//y is the color			
				var xyIndex = spConfig.getXYIndex(iIndex);
				//console.log(' color y ', propertyBag.getBinValue(iYPropertyId, xyIndex.y));
				return propertyBag.getBinValue(iYPropertyId, xyIndex.y);
			}
			return '#808080';
			// return computeColor(xColorScale(value));
		})
		.style('stroke', '#bdbdbd')
		.style('stroke-width', '0.5px');

		//hover 
	    $('.scatterplot_label').mouseover(function(event){		
			// //console.log('Mouse Enter');
			$(this).find('.delete_property_icon').removeClass('hidden');		
		}); 
		$('.scatterplot_label').bind('mouseout', function(){
			// //console.log('Mouse Out');
			$(this).find('.delete_property_icon').addClass('hidden');
		});

		$('.delete_property_icon').click(function(event){
			//console.log(" delete button clicked ");
			event.stopPropagation();
			var sScatterPlotId = $(this).parents('.scatter_plot_row').attr('scatterplotId');
			//console.log(' scatter plot id ', sScatterPlotId);
			var iScatterPlotId = parseInt(sScatterPlotId);
			//console.log('[2] ', iScatterPlotId);
			self.deleteScatterPlot(iScatterPlotId);
		});

		//brush
		var brush = d3.svg.brush()
	    .x(d3.scale.identity().domain([0, xAxisLength]))
	    .y(d3.scale.identity().domain([0, yAxisLength]))
	    .extent([[-1, -1], [-1, -1]])
	    .on("brush", duringBrush);

	    var gBrush = d3.select('#scatterplot_' + self.m_iId + '_' + SPID)
	    .append('g')
	    .attr("class", "brush")
	    .call(brush);

	    gBrush.selectAll('.brush rect')
	    .attr('fill', 'gray')
	    .attr('opacity', function(){
	    	return 0.2;
	    })
	    .attr('stroke', 'black');

	    var markerGroup = gBrush.append('g')
	    .attr('class', 'marker_group');

	   	var font = '12px arial';
		//left
		var textMarker = markerGroup.append('g')
		.attr('class', 'marker_sp hidden')
		.attr('transform', function(){		
			var left = parseInt(d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent').attr('x'));
			left += parseInt(d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent').attr('width'));
			var top = 0;
			return 'translate(' + left + ',' +  top + ')';
		});

		textMarker.append('text')
		.attr('class', 'text-center sp_xmarker')
		.style('font', font)
		.style('color', 'black');

		textMarker.append('text')
		.attr('class', 'text-center sp_ymarker')
		.style('y', function(){		
			return 0;
		})
		.style('font', font)
		.style('color', 'black');
	 //    function brushended() {
		// 	// var extentRange = brush.extent();
		// 	// var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];		
		// 	// //console.log('adjust brush ', adjustExtentRange);//获取刷子边界范围所对应的输入值
		// }

	    function duringBrush(){		

			var extentRange = brush.extent();
			// //console.log(" during brush ", extentRange[0], ', ', extentRange[1]);

			var xExtentRange = [Math.floor(xScale.invert(extentRange[0][0])), Math.floor(xScale.invert(extentRange[1][0]))];
			var yExtentRange = [Math.floor(yScale.invert(extentRange[0][1])), Math.floor(yScale.invert(extentRange[1][1]))];

			// //console.log(' x range ', xExtentRange);
			// //console.log(' y range ', yExtentRange);

			//update the text marker
			var textmarker = d3.selectAll('#scatterplot_' + self.m_iId + '_' + SPID+ ' .marker_sp')
			.classed('hidden', false)
			.attr('transform', function(){
				var left = parseInt(d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent').attr('x'));
				left += parseInt(d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent').attr('width'));
				var rect = d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent')[0];
				var top = parseInt(rect[0].getAttribute('y'));
				//console.log(' top ', top);
				return 'translate(' + left + ',' +  top + ')';
			});

			textmarker.selectAll('text .sp_xmarker')
			.text('x: ' + xExtentRange[0] + '~' + xExtentRange[1]);

			textmarker.selectAll('text .sp_ymarker')
			.text('y: ' + yExtentRange[0] + '~' + yExtentRange[1])
			.style('y', function(){		
				// return 0;				
				var rect = d3.select('#scatterplot_' + self.m_iId + '_' + SPID + ' .extent')[0];
				// var top = parseInt(rect[0].getAttribute('y'));
				//console.log(" height ",  parseInt(rect[0].getAttribute('height')));
				return parseInt(rect[0].getAttribute('height'));
				// return parseInt(d3.select('#scatterplot_' + sPID + '.extent')).attr('height');	
			});

			//update the bars
			d3.selectAll('#scatterplot_' + self.m_iId + '_' + SPID+ ' .scatter_plot_bar')
			.filter(function(d, i){
				var iIndex = d['index'];
				// //console.log(" sp config" , spConfig);
				var iXYIndex = spConfig.getXYIndex(iIndex); 
				var iXIndex = iXYIndex.x;
				var iYIndex = iXYIndex.y;
				if(iXIndex >= xExtentRange[0] && iXIndex <= xExtentRange[1] && iYIndex >= yExtentRange[0] && iYIndex <= yExtentRange[1])
					return false;
				return true;
			})			
			.style('stroke', '#bdbdbd')
			.style('stroke-width', '0.5px')
			.style('opacity', 0.3);

			var rectCount = 0;

			d3.selectAll('#scatterplot_' + self.m_iId + '_' + SPID+ ' .scatter_plot_bar')
			.filter(function(d, i){
				var iIndex = d['index'];
				// //console.log(" sp config" , spConfig);
				var iXYIndex = spConfig.getXYIndex(iIndex); 
				var iXIndex = iXYIndex.x;
				var iYIndex = iXYIndex.y;
				if(iXIndex >= xExtentRange[0] && iXIndex <= xExtentRange[1] && iYIndex >= yExtentRange[0] && iYIndex <= yExtentRange[1]){
					rectCount += 1;
					return true;
				}
				return false;
			})		
			.style('stroke', 'black')
			.style('stroke-width', '2px')
			.style('opacity', 1.);	

			// //console.log(" Count = ", rectCount);
			var liSelectedEleId = [];

			var groupType = self.m_ObjectGroupManager.getSelectedGroupType();
			//compute thte selected ele if necessary
			var liXSelectIndexRange = [];
			liXSelectIndexRange.push(xExtentRange);
			var liXSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(spConfig.ixPropertyId, liXSelectIndexRange);

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){
				//change to elegroupid
				var liNewEleGroupId = [];
				for (var i = 0; i < liXSelectedEleId.length; i++) {
					var iXSelectedEleId = liXSelectedEleId[i];
					var iEleGroupId = self.m_ElementProperties.getEleGroupIdwithEleId(iXSelectedEleId);
					liNewEleGroupId.push(iEleGroupId);
				};
				liXSelectedEleId = liNewEleGroupId;
			}

			// //console.log('after liXSelectedEleId ', liXSelectedEleId);

			//extent to the group ele id

			var liYSelectIndexRange = [];
			liYSelectIndexRange.push(yExtentRange);
			var liYSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(spConfig.iyPropertyId, liYSelectIndexRange);

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){
				//change to the elegroupid
				var liNewEleGroupId = [];
				for (var i = 0; i < liYSelectedEleId.length; i++) {
					var iYSelectedEleId = liYSelectedEleId[i];
					var iEleGroupId = self.m_ElementProperties.getEleGroupIdwithEleId(iYSelectedEleId);
					liNewEleGroupId.push(iEleGroupId);
				};
				liYSelectedEleId = liNewEleGroupId;
			}
			// //console.log('before liYSelectedEleId ', liYSelectedEleId);
		
			//compute the intersection
			for (var i = 0; i < liXSelectedEleId.length; i++) {
				var iTempEleid = liXSelectedEleId[i];
				if(liYSelectedEleId.indexOf(iTempEleid) >= 0)
					liSelectedEleId.push(iTempEleid);
			};

			// //console.log(" intersection group eleids ", liSelectedEleId.length);

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){
				//change back to the ele ids
				var liNewEleId = [];
				for (var i = 0; i < liSelectedEleId.length; i++) {
					var iSelectedGroupEleId = liSelectedEleId[i];
					var liEleId = self.m_ElementProperties.getElementIdsofEleGroup(iSelectedGroupEleId);
					liNewEleId = liNewEleId.concat(liEleId);
				};
				liSelectedEleId = liNewEleId;
				// //console.log(" Filtered EleIds ", liNewEleId.length);
			}
			
			// liSelectedEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liSelectedEleId);
			
			//sort

			// //console.log(" liSElected !!! ", liSelectedEleId, ' x ', liXSelectedEleId, ' y ', liXSelectedEleId);

			// //console.log(" Extend Reange ", adjustExtentRange, ' xx ', xx, ' selected ele id ', liSelectedEleId.length);	

			//notify the cross-filter with selected property range
			self.m_CrossFilterInfo.setFilterEleIdsofScatterPlotId(SPID, liSelectedEleId);

			//update the object_create_button
			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();

			// //console.log(' lifilter 1111 ', liFilterEleId);

			var eleNum = liFilterEleId.length;

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
				//the compound ele
				var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				eleNum = liCompoundEleIds.length;
			}

			$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));	

			self.updateFilteredRects();
		}
	}

	Info.getCreateObjectButtonName = function(iNum){
		return iNum + ": Create";
	}

	Info.drawCompoundPropertyRows = function(){
		var self = this;
		//double check the select group type
		// if(g_ObjectGroupManager.getSelectedGroupType() != 'compound')
		if(!self.m_ObjectGroupManager.isSelectedGroupTypeCompound())
			return ;

		//get the property bag
		var propertyBag = self.m_PropertyManager.getPropertyBag(self.m_ObjectGroupManager.getSelectedGroupId());
		//get the compound map
		var mapCompoundIndexPropertyIds = propertyBag.getCompoundIndexPropertyIdsMap();
		var liCompoundIndex = Object.keys(mapCompoundIndexPropertyIds);

		for (var i = liCompoundIndex.length - 1; i >= 0; i--) {
			var iCompoundIndex = liCompoundIndex[i];
			var liPropertyId = mapCompoundIndexPropertyIds[iCompoundIndex];

			//add a compound div
			var compoundDiv = $("<div>");
			var compoundId =  self.m_iId + 'proset_' + iCompoundIndex; //self.m_iId + 'proset_' + compoundindex
			compoundDiv.attr('id', compoundId)
			.attr('class', 'propertyset-div compoundrow')
			.attr('compoundindex', iCompoundIndex);

			$("#" + self.m_ProPanelDivId).append(compoundDiv);

			//add the property rows
			for (var j = liPropertyId.length - 1; j >= 0; j--) {
				var iPropertyId = liPropertyId[j];
				self.drawProperty(iPropertyId, compoundId);
			};
		};
	}

	//release the filtering on scatter plot
	Info.releaseSPFilter = function(iSPId){

		var self = this;

		d3.selectAll('#scatterplot_' + self.m_iId + '_' + iSPId + ' .extent').attr('width', 0).attr('height', 0);
		d3.selectAll('#scatterplot_' + self.m_iId + '_' + iSPId + ' .marker_sp').classed('hidden', true);
		
		self.m_CrossFilterInfo.releaseFilterEleIdsofScatterPlotId(iSPId);

		//update the filter ele ids
		var liFilteredEleId = self.m_CrossFilterInfo.getFilterEleIds();
		var iSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iSelectedGroupId);

		propertyBag.setFilterEldIds(liFilteredEleId);
		// //console.log(" iPId ", iSPId, ' filter ele id ', liFilteredEleId);

		//change the rect
		//console.log("[3] bb ");
		self.updateFilteredRects();
		//console.log("[3] ee ");
	}

	//draw the droppable row
	Info.drawDroppableRow = function(iGroupId){

		var self = this;

		$('#drop_' + self.m_iId).remove();

		var	dropRowdiv = $("<div>");
		var dropDivId = 'drop_' + self.m_iId;

		dropRowdiv.attr('id', dropDivId)
		.attr('class', 'droppablerow')		
		.attr('groupid', iGroupId)		
		.css('margin-top', '5px')
		.css('height', 20);

		// dropRowdiv.append('svg')
		// .attr('class', 'droppablerow')		
		// .attr('groupid', iGroupId)		
		// .css('margin-top', '5px')
		// .css('height', UNEXPANDBARHEIGHT/3);

		$("#" + self.m_ProPanelDivId).append(dropRowdiv);

		var width = $()

		dropSVG = d3.select('#' + dropDivId)
		.append('svg')
		.attr("width", '100%')
		.attr("height", '100%');

		var svgWidth = $('#' + dropDivId + ' svg').width();
		var svgHeight = $('#' + dropDivId + ' svg').height();

		var rectHeight = svgHeight * 0.8, rectWidth = svgWidth * 0.95;

		dropSVG
		.append('rect')
		.attr("class", 'dropmarker drophint')
		.attr('x', svgWidth / 2. - rectWidth * 0.5)
		.attr("y", svgHeight / 2. - rectHeight * 0.5)
		.attr("width", rectWidth)
		.attr('height', rectHeight);

		var linewidth = 20, lineheight = svgHeight * 0.5;
		dropSVG
		.append('line')
		.attr('class', 'drophint dropmarker')
		.style('stroke-dasharray', 'none')
		.attr('x1', svgWidth/2. - linewidth * 0.5)
		.attr('x2', svgWidth/2. + linewidth * 0.5)
		.attr('y1', svgHeight/2.)
		.attr('y2', svgHeight/2.);

		dropSVG
		.append('line')
		.attr('class', 'drophint dropmarker')
		.style('stroke-dasharray', 'none')
		.attr('x1', svgWidth/2.)
		.attr('x2', svgWidth/2.)
		.attr('y1', svgHeight/2. - lineheight * 0.5)
		.attr('y2', svgHeight/2. + lineheight * 0.5);
		// var font = '12px arial';
		// var fontSize = getTextSize('Drop to Add', font);
		// dropSVG
		// .append('text')
		// .text('Drop to Add')
		// .attr('x', svgWidth / 2. - fontSize.w/2.)
		// .attr('y', svgHeight / 2. + fontSize.h/2. + 3)
		// .style('font', font)
		// .attr("opacity", '0.6');



		// var titleDiv = d3.select('#' + dropDivId)
		// .append('div')
		// .attr('class', 'drop-property-name-div')
		// .style('width', '20%')
		// .style('height', '100%')
		// .style('float', 'left')
		// .style('border', 'solid yellow 1px');

		// var disDiv = d3.select('#' + dropDivId)
		// .append('div')
		// .attr('class', 'drop-distri-div')
		// .style('float', 'right')
		// .style('width', '80%')
		// .style('height', '100%')
		// .style('border', 'solid green 1px');

		// .attr('propertyid', iPId);
		// .height('25px');

		dropRowdiv.droppable({
			over: function(event, ui) {
				$(this)
				.css('border', 'solid black')
			},
			out: function(event, ui) {
				$(this)
				.css('border', 'solid 1px #f0f0f0')
			},
			drop: function( event, ui ) {
				UI = ui.draggable;
				//console.log(" drop !", UI.attr('propertyid'));
				self.addPropertyInDrop(UI.attr('propertyid'));
				$(this)
				.css('border', 'solid 1px white');//( "ui-state-highlight" )
				// .find( "p" )
				// .html( "Dropped!" );
			}
	    });

		self.addPropertyInDrop();
	}

	//add PropertyInDrop
	Info.addPropertyInDrop = function(iPropertyId){

		var self = this;

		// self.m_liDropPropertyId = self.m_mapGroupIdDropPropertyIds[self.m_iGroupId];
		self.m_liDropPropertyId = self.m_mapGroupIdDropPropertyIds[self.m_iSelectGroupid];

		// //console.log(" addPropertyInDrop ", self.m_liDropPropertyId.length);
		if(self.m_liDropPropertyId == undefined)
			self.m_liDropPropertyId = [];

		if(iPropertyId != undefined){
			if(self.m_liDropPropertyId.indexOf(iPropertyId) == -1){				
				self.m_liDropPropertyId.push(iPropertyId);
				self.m_mapGroupIdDropPropertyIds[self.m_iSelectGroupid] = self.m_liDropPropertyId;
			}else
				return;
		}
		// //console.log(" drop! row height ", dropRowHeight);

		var dropDivId = 'drop_' + self.m_iId;

		if(self.m_liDropPropertyId.length <= 1){
			//histogram
			// self.drawProperty(iPropertyId, dropDivId, 'drop_');
			return;

		}else if(self.m_liDropPropertyId.length == 2){

			//test
			// console.log(" test !! ");
			// var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();
			// for (var i = liFilterEleId.length - 1; i >= 0; i--) {
			// 	var iEleId = liFilterEleId[i];
   //          	var element = self.m_CrossFilterInfo.m_ElementProperties.getElebyId(iEleId);
   //              element.style['fill'] = 'red';
   //              element.style['transform'] = 'translate(10, 10)';
   //              // element.style['stroke-width'] = '1px';
			// };

			//scatter plot			
			var dropRowHeight = UNEXPANDBARHEIGHT * 9;//self.m_liDropPropertyId.length * UNEXPANDBARHEIGHT * 2.5;
			d3.select('#' + dropDivId)	
			.style('height', dropRowHeight + 'px');
			$('#drop_' + self.m_iId).children().remove()
			self.createAScatterProperties();
		}else{
			//mds
			var dropRowHeight = UNEXPANDBARHEIGHT * 9;
			d3.select('#' + dropDivId)	
			.style('height', dropRowHeight + 'px');
			$('#drop_' + self.m_iId).children().remove()
			self.createMDS();
		}
	}

	//select the top range
	Info.selectTopRange = function(iPropertyId, leftB, rightB){
		var self = this;
		//get the filter eleid
		var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
		
		// console.log(' select %%%%% top ', iPropertyId, propertyBag.getPropertyInfo(iPropertyId), propertyBag.isPropertyNumber(iPropertyId), leftB, rightB);

		if(propertyBag.isPropertyNumber(iPropertyId) == true){

			var selectInfo = propertyBag.getEleIdsbyTopRange(iPropertyId, {'left': leftB, 'right': rightB});

			var liFilterEleId = selectInfo['liSelectEleIds'];
			var iBeginIndex = selectInfo['beginBinIndex'], iEndIndex = selectInfo['endBinIndex'];

			//notify the cross-filter with selected property range
			self.m_CrossFilterInfo.setFilterEleIdsofPropertyId(iPropertyId, liFilterEleId);

			//update the object_create_button
			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();

			// console.log(' lifilter %%%% ', liFilterEleId);

			var eleNum = liFilterEleId.length;

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
				//the compound ele
				var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				eleNum = liCompoundEleIds.length;
			}

			$('#' + self.m_CreateButtonId).text(getCreateObjectButtonName(eleNum));	

			self.updateFilteredRects();	
			self.updateBoxPlots(iPropertyId, [iBeginIndex, iEndIndex]);
			//notify the mask
			self.m_InObj.updateFilteredEleId(liFilterEleId);
		}		
		//add the statitic cover
	}

	//draw one property
	Info.drawProperty = function(iPId, ParentDivId, preFix, bExpand, set_labelDivWidth, set_disDivWidth){

		var self = this;
		var parentdiv = $("#" + ParentDivId);

		if(preFix == undefined)
			preFix = '';

		if(parentdiv.length == 0)
		{
			// alert('not exist ', ParentDivId);
			var proset = 'proset_';
			var iCompoundIndex = Number(ParentDivId.substring(proset.length));

			//add a compound div
			var compoundDiv = $("<div>");
			var compoundId =  ParentDivId;
			compoundDiv.attr('id', compoundId)
			.attr('class', 'propertyset-div compoundrow')
			.attr('compoundindex', iCompoundIndex);

			$("#" + self.m_ProPanelDivId).append(compoundDiv);
		}

		var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);

		//every property
		var propertyInfo = propertyBag.getPropertyInfo(iPId);
		var propertyType = propertyBag.getPropertyTypebyId(iPId);
		var propertyNumeric = propertyBag.isPropertyNumber(iPId);
		var propertyName = propertyBag.getPropertyNamebyId(iPId);

		//suggested by decode vis
		// var suggestSemanticName = g_VisDecoder.getSemanticMap(propertyName);

		//check the name
		var changeName = ['fill', 'cx', 'cy', 'r'];
		var okName = ['color', 'cen-x', 'cen-y', 'radius'];

		if(changeName.indexOf(propertyName) != -1){
			propertyName = okName[changeName.indexOf(propertyName)];
		}		

		//check for length
		if(propertyName.length > 5){
			propertyName = propertyName.slice(0, 4);
			propertyName += '.';
		}

		//add suggested name
		// if(suggestSemanticName != undefined)
		// 	propertyName += " - " + suggestSemanticName;

		// console.log(" suggestSemanticName ", propertyName, suggestSemanticName);

		// if(prodiv.length == 0){
		// 	//if parent div not exist
		// // var prodiv = $('#' + ParentDivId);

		// }
		var disDivHeight = UNEXPANDBARHEIGHT;	
		var bExpand = false;

		//console.log("expand histogram  MM ", self.m_mapProIdExpand);
		if(self.m_mapProIdExpand[iGroupId + '-' + iPId] == undefined){			
			self.m_mapProIdExpand[iGroupId + '-' + iPId] = 'false';
		}
		if(self.m_mapProIdExpand[iGroupId + '-' + iPId] == 'true'){
			// //console.log(" expand histogram XXX ");
			bExpand = true;
			disDivHeight = EXPANDBARHEIGHT;
		}

		var	prodiv = $("<div>");
		var propertyDivId =  preFix + 'p_' + self.m_iId + 'pro_' + iPId;

		prodiv.attr('id', propertyDivId)
		.attr('class', 'propertyrow')
		.attr('value', propertyType)
		.attr('numerical', function(){
			if(propertyNumeric)
				return 'yes';
			return 'no';
		})
		.attr('groupid', iGroupId)
		.attr('bexpand', function(){
			if(bExpand == true)
				return 'yes';
			return 'no';
		})
		.css('height', disDivHeight)
		.attr('propertyid', iPId);
		// .height('25px');
		$("#" + ParentDivId).append(prodiv);

		// prodiv.draggable();

		//compute the width of label and dis div
		var font = '12px arial';
		var labelDivWidth, disDivWidth, boxplotDivWidth;
			
		var maginwidth = 10;
		
		var labelTextSize = getTextSize(propertyName, font);
		var gapWidth = 15;
		var legendWidth = 30;
		var labelDisGap = 2;
		var boxplotDivWidth = 50;
		
		if(set_labelDivWidth == undefined || set_disDivWidth == undefined){
			labelDivWidth = 40 + legendWidth;//labelTextSize['w'] + gapWidth;
			// boxplotDivWidth = (prodiv.width() - 2 * labelDisGap - labelDivWidth) * 0.2;
			disDivWidth = (prodiv.width() - labelDivWidth  - 2 * labelDisGap  - boxplotDivWidth);
			console.log(' width: ! ', prodiv.width(), disDivWidth, labelDivWidth, boxplotDivWidth);
		}else{
			labelDivWidth = set_labelDivWidth;
			// boxplotDivWidth = prodiv.width() - labelDivWidth - disDivWidth;
			disDivWidth = set_disDivWidth;
			boxplotDivWidth = prodiv.width() - labelDivWidth - disDivWidth;
		}

		/* label div */
		var sPID = iPId + '';

		var iconmap = {
			'cx': 'rc/legend/x_pos.png',
			'cy': 'rc/legend/y_pos.png',
			'r': 'rc/legend/circle_radius.png',
			'fill': 'rc/legend/circle_fill.png',
		};

		var iconstr = 'rc/legend/abstract.png';
		if(iconmap[propertyType] != undefined)
			iconstr = iconmap[propertyType];

		//legend div
		// var legendhtml = '<div value=<%=propertyType%>  style="position:relative; float:left; border: solid 1px" ><i class="fa fa-times delete_property_icon hidden"></i>' + 
		// 					'<img src=<%=imgsrc%> style="height: 100%"></img>' + 
		// 				'</div>';
		// var compile_legendhtml = _.template(legendhtml);
		// legendhtml = compile_legendhtml({
		// 	propertyType: propertyType,
		// 	imgsrc: serverIp + iconstr,
		// });
		// prodiv.html(prodiv.html() + legendhtml);

		//console.log(' SPID ', sPID);
		var labelhtml =
		// '<div class="propertyimg">' + 
		// 	'<img src=<%=imgsrc%> style="width: 50"/>' +
		// '</div>' + 
		'<div class="propertylabel" value=<%=propertyType%>  propertyid = <%=propertyId%> style="position:relative; padding-left: 2px" >'+
			'<i class="fa fa-times delete_property_icon hidden"></i>'+
			'<img src=<%=imgsrc%> style="height: 100%; float: left"></img>' + 
			'<span class="propertyspan"><%=propertyName%></span>'+
		'</div>';
		var compile_labelhtml = _.template(labelhtml);
	    labelhtml = compile_labelhtml({
	    	propertyId: iPId,
			propertyType: propertyType,
			propertyName: propertyName,
			imgsrc: serverIp + iconstr,
			// imgsrc: serverIp + 'rc/brush-note.png',
		});
		prodiv.html(prodiv.html() + labelhtml);

		prodiv.find('.propertylabel').width(labelDivWidth + 'px');
		prodiv.find('.propertylabel').height(labelTextSize['h'] * 1.5 + 'px');


		//compute disdivwidth, boxplotwidth
		//his div
		var disDivId = preFix + 'p_' + self.m_iId + 'dis_' + iPId;
		// var disDiv = prodiv.append("div")
		// .attr()

		var disDiv = $("<div>");
		disDiv
		.attr('id', disDivId)
		.attr('class', 'distri_div')
		.css('width', disDivWidth + 'px')
		.css('height', disDivHeight + 'px')
		.css('left', labelDivWidth + labelDisGap + maginwidth/2. + 'px');
		prodiv.append(disDiv);

		//box-plot div
		var boxplotDivId = preFix + 'p_' + self.m_iId + 'box_' + iPId;
		var boxplotDiv = $('<div>');

		var boxplotLeftText = '', boxplotRightText = '';
		var selectRange_temp = self.m_mapProIdSelect[iGroupId + '-' + iPId];
		var leftBrushSelect = -1, rightBrushSelect = -1;

		if(selectRange_temp != undefined){
			if(propertyNumeric){
				boxplotLeftText = selectRange_temp[0]/DEFAULTBINNUM; 
				boxplotLeftText = boxplotLeftText.toFixed(1);
				boxplotRightText = selectRange_temp[1]/DEFAULTBINNUM;
				boxplotRightText = boxplotRightText.toFixed(1);				
			}else{
				boxplotLeftText = Math.ceil(selectRange_temp[1] - selectRange_temp[0]) + 1;
				boxplotRightText = "";
			}
			//numeric
			leftBrushSelect = selectRange_temp[0];
			rightBrushSelect = selectRange_temp[1];			
			//console.log('BRUSHBRUSH ', leftBrushSelect, rightBrushSelect);
		}

		boxplotDiv
		// var boxplotDiv = prodiv.append('div')
		.attr("id", boxplotDivId)
		.attr('class', 'boxplot_div')
		.css('width', boxplotDivWidth + 'px')
		.css('height', disDivHeight + 'px')
		.css('left', labelDivWidth + disDivWidth + 2 * labelDisGap + maginwidth/2. + 'px');
		prodiv.append(boxplotDiv);

		//input div	
		var topDivHtml = 
		'<div class="sub_panel hidden" id=<%=topDivId%> style="position:absolute; height: <%=topdivheight%>; left: <%=topleft%>;" >'+
			'<p style="display: inline-block; float:left">Top: </p>' +
			'<input type="text" class="top_topdiv" style="font-size: 14px; float: left; width:40%; height: 80%; margin: 3px">' + 
			'<button class="top-ok btn btn-warning btn-xs function_button">Ok</button>'+
			'<button class="top-cancel btn btn-warning btn-xs function_button">Cancel</button>'+
			// '<input type="text" class="left_topdiv" style="font-size: 14px; float: left; width:40%; height: 80%; margin: 3px">' + 
			// '<p style="display: inline-block; width:10%; float:left">~</p>' +
			// '<input type="text" class="right_topdiv" style="font-size: 14px; float: left; width:40%; height: 80%; margin: 3px">' + 
		'</div>';


		var compile_labelhtml = _.template(topDivHtml);
	    topDivHtml = compile_labelhtml({
	    	topDivId: preFix + 'p_' + self.m_iId + 'top_' + iPId,
			topdivheight: disDivHeight + 'px',
			topleft: prodiv.width() + maginwidth * 3 + 'px',
		});
		prodiv.html(prodiv.html() + topDivHtml);



	
		var boxplotSvg = d3.select('#' + boxplotDivId)
		.append('svg');

		boxplotSvg.append('rect')		
		.attr('width', boxplotDivWidth + 'px')
		.attr('height', disDivHeight + 'px')
		.attr('fill', '#B2EBF2');

		//DECODE
		boxplotSvg.append('rect')
		.attr('width', '10px')
		.attr('height', disDivHeight)
		.attr('x', boxplotDivWidth - 25 )
		.attr('y', disDivHeight * 0.5 - disDivHeight * 0.5)
		.style('fill', 'green')
		.on('click', function(){
			var whichproperty = getDecodePropertyType(propertyType);
			console.log(' data decode ', propertyType, propertyName, whichproperty);			
			g_VisDecoder.enterDecodeMode();
			$('#decodepos_data_dialog_step1_' + self.m_iId).dialog('open');
			// switch(whichproperty){
			// 	case 'pos':
			// 		$('#decode_data_dialog_' + self.m_iId).dialog('open');
			// }
			self.m_InObj.m_CurrentDecodePropertyId = iPId;
		});
	

		//TOP
		boxplotSvg.append('rect')
		.attr('width', '10px')
		.attr('height', '10px')
		.style('fill', 'red')
		// .attr('src', 'rc/brush-note.png')
		.attr('x', boxplotDivWidth - 10)
		.attr('y', disDivHeight - 10)
		.on('click', function(){
			//console.log(" boxplot click ");
			var id_temp = '#' + preFix + 'p_' + self.m_iId + 'top_' + iPId;			
			$(id_temp).toggleClass('hidden');
		});

		d3.select('#' + preFix + 'p_' + self.m_iId + 'top_' + iPId + ' .top-ok')
		.on('click', function(){
			console.log(' click top ok ');
			var id_temp = '#' + preFix + 'p_' + self.m_iId + 'top_' + iPId;
			var top = Number($(id_temp + ' .top_topdiv').val());
			//console.log(' top *** ', top, $(id_temp + ' .top_topdiv').val());
			if(isNaN(top) == false && top != 0){
				var iSelectGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
				var liSelectedEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iSelectGroupId);
				if(top > liSelectedEleId.length)
					top = liSelectedEleId.length;
				self.selectTopRange(iPId, liSelectedEleId.length - top, liSelectedEleId.length - 1);
			}				
			$(id_temp).addClass('hidden');
		});

		d3.select('#' + preFix + 'p_' + self.m_iId + 'top_' + iPId + ' .top-cancel')
		.on('click', function(){
			console.log(" click top Cancel");	
			var id_temp = '#' + preFix + 'p_' + self.m_iId + 'top_' + iPId;		
			$(id_temp).addClass('hidden');
		})

		//EXPAND
		boxplotSvg
		// .append('img')
		.append('rect')
		// .attr("xlink:href", serverIp + "rc/exit.png")
		.attr('iPropertyId', iPId)
		.attr('iGroupId', iGroupId)
		.attr("x", boxplotDivWidth - 10)
		.attr('width', '10px')
		.attr("height", '10px')
		.attr("fill", 'black')
		.attr('stroke', 'none')
		.on('click', function(){
			d3.event.stopPropagation();
			// var expand = d3.select(this).attr("bExpand");
			var iPropertyId = Number(d3.select(this).attr('iPropertyId'));
			var iGroupId = Number(d3.select(this).attr('iGroupId'));
			var expand = self.m_mapProIdExpand[iGroupId + '-' + iPropertyId];
			//console.log(" expand histogram !! ", iPropertyId, iGroupId, expand);
			if(expand == 'true'){
				//close
				// d3.select(this).attr("bExpand", 'true');
				//console.log("  expand histogram close ");
				self.m_mapProIdExpand[iGroupId + '-' + iPropertyId] = 'false';
				// d3.select(this).attr('bExpand', '');
				// self.drawProperty(iPropertyId);
				self.drawProperties(iGroupId);
				// self.expandPropertyRow(iPropertyId, false);
			}else{
				//expand
				//console.log(" expand histogram open ");
				// d3.select(this).attr("bExpand", 'false');
				self.m_mapProIdExpand[iGroupId + '-' + iPropertyId] = 'true';
				self.drawProperties(iGroupId);
				// d3.select(this).attr('bExpand', 'true');
				// self.drawProperty(iPropertyId, 'true')
				// self.expandPropertyRow(iPropertyId, true);
			}
		})
		.on('mouseover', function(){
			d3.select(this).style("fill", 'gray');
		})
		.on('mouseout', function(){
			d3.select(this).style("fill", 'black');
		});

		var boxTextFont = '10px arial';
		var boxTextSize = getTextSize('100%', boxTextFont);

		boxplotSvg.append('text')
		.attr('class', 'boxplot-text left-text')
		.text(boxplotLeftText)
		.attr('x', 0)
		.attr('y', disDivHeight * 0.1 + boxTextSize['h']/2.)
		.style('font', boxTextFont);

		boxplotSvg.append('text')
		.attr('class', 'boxplot-text right-text')
		.text(boxplotRightText)
		.attr('x', 0)
		.attr('y', disDivHeight * 0.5 + boxTextSize['h']/2.)
		.style('font', boxTextFont);

		/*draw histogram */
		var disCountList = propertyBag.getDis(iPId);
		var disFilterList = propertyBag.getFilteredDis(iPId);
		
		//console.log(" dis count : ", disCountList);	
		//console.log(" filter dis count : ", disFilterList);

		var svg = d3.select("#"+disDivId).append("svg")
		.attr('width', '100%')//disDivWidth + 'px')
		.attr('height', '100%');//disDivHeight * 0.9 + 'px')
		// .attr('x', );
		// .attr("width", "100%")
		// .attr("height", "100%");
		var xAxisLength = $('#'+disDivId+' svg').width();
		var yAxisLength = $('#'+disDivId+' svg').height();
		var yAxisExpandPad = 0;
		var xShift = 0;
		var yShift = 0;
		if(bExpand == true){
			xShift = XSHIFT;
			yShift = YSHIFT;
			xAxisLength = $('#'+disDivId+' svg').width() - xShift;
			xAxisLength = xAxisLength * 0.95;
			yAxisLength = $('#'+disDivId+' svg').height() - yShift;
			yAxisLength = yAxisLength * 0.95;
			yAxisExpandPad = 10;
		}
		
		var xScale = d3.scale.linear()
					.domain([0, disCountList.length])
					.range([0, xAxisLength]);


		var yScale = d3.scale.linear()
					.domain([0, d3.max(disCountList)])
					.range([yAxisLength - yAxisExpandPad, 0]);
					// .range([0, yAxisLength]);

		propertyBag.setXYScaleofPropertyId(iPId, xScale, yScale);

		var barWidth = xAxisLength/disCountList.length;
		var barRatio = 0.95;//0.8;
		var baseLineY = yAxisLength;

		if(bExpand == true){

			var xAxis = d3.svg.axis()
			    .scale(xScale)
			    .orient("bottom");

			var yAxis = d3.svg.axis()
			    .scale(yScale)
			    .orient("left")
			    .ticks(4)
			    // .tickSize(4)
			    // .tickValues([0, d3.max(disCountList)/2, d3.max(disCountList)])
			    // .tickFormat(d3.format(".2s"));

			//expand x-y axis
			svg.append("g")
			.attr("class", "x axis")
			.attr('transform', "translate(" + xShift + "," + yAxisLength + ")")
			.call(xAxis);

			svg.append("g")
		      .attr("class", "y axis")
			.attr("transform", "translate(" + xShift + "," + yAxisExpandPad + ") ")
		      .call(yAxis);
		    // .append("text")
		    //   .attr("class", "label")
		    //   .attr("transform", "rotate(-90)")
		    //   .attr("y", 6)
		    //   .attr("dy", ".71em")
		    //   .style("text-anchor", "end")
		    //   .text("Sepal Length (cm)")

			// svg.append("g")
			// .attr("class", "y axis")
			// .attr("transform", "translate(" + xShift + ",0) ")
			// .call(yAxis);

			// baseLineY = 
			// .append("text")
			// .attr("transform", "rotate(90)")
			// // .attr("")
			// .attr("y", 6)
			// .attr("dy", ".71em")
			// .style("text-anchor", "end")
			// .text("#");
		}


		$('.propertylabel').draggable({helper:'clone'});

		//draw the background rect, hiddle initiately
		svg.selectAll('.barrect')
		.data(disCountList)
		.enter()
		.append('rect')
		.attr('class', 'barrect')
		.attr('class', function(d, i){
			return 'barrect_' + i;
		})
		// .attr('transform', "translate(20," + ", 0)")
		.attr(propertyType, function(d, i){
			return propertyBag.getBinPropertyValue(iPId, i);
		})
		.attr('x', function(d, i){
			return xShift + (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
		})
		.attr('y', function(d, i){
			return yScale(d) + yAxisExpandPad;
			// if(d == 0)
				// return baseLineY;
			// return baseLineY - yScale(d3.max(disCountList) - d);
		})
		.attr('width', function(){
			return barWidth * barRatio;
		})
		.attr('height', function(d, i){
			if(d == 0)
				return 0;
			return baseLineY - yScale(d) - yAxisExpandPad;
		})
		.style('fill', 'gray')
		.style('opacity', function(){
			return 0.2;
		})
		.style('invisible', 'hidden');

		svg.selectAll('.filter_barrect')
		.data(disFilterList)
		.enter()
		.append('rect')
		.attr('class', 'filter_barrect')
		// .attr('transform', "translate(20," + ", 0)")
		// .style('stroke', '#d9d9d9')
		.attr(propertyType, function(d, i){
			return propertyBag.getBinPropertyValue(iPId, i);
		})
		.attr('x', function(d, i){
			return xShift + (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
		})
		.attr('y', function(d, i){
			return yScale(d) + yAxisExpandPad;
			// if(d == 0)
			// 	return baseLineY;
			// return baseLineY - yScale(d3.max(disCountList) - d);
		})
		.attr('width', function(){
			return barWidth * barRatio;
		})
		.attr('height', function(d, i){
			if(d == 0)
				return 0;
			return baseLineY - yScale(d) - yAxisExpandPad;
			// return yScale(d3.max(disCountList) - d);
		});


		svg.append('rect')
		.attr('class', 'hover_rect_' + self.m_iId)
		.attr('id', 'hover_property_' + self.m_iId + '_' + iPId)	 
		.style('z-index', g_FrontZIndex + 6)
		.style('visibility', 'hiddle')
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.style('fill', 'none');

		//check if property type is color or not
		if(colorTypeStr.indexOf(propertyType) < 0){
			// var rectSize = $(".distri_div .barrect").size();
			// //console.log(' gray ', propertyType, ' rectSize ', rectSize);			
		   svg.selectAll('.filter_barrect')
			   .attr('fill', 'gray');
		}
		
		//add brush
		var brush = d3.svg.brush()
		.x(xScale)
		.extent([leftBrushSelect, rightBrushSelect])
		// .on('brushstart', beforeBrush)
		.on('brush', duringBrush)
		.on("brushend", brushended);

		var gBrush = svg.append("g")
		 .attr("class", "brush")
		 .attr("transform", 'translate(' + xShift + ',0)')
		 // .attr("id", 'brush_' + iPId)
		 .call(brush)//绑定刷子
		 .call(brush.event);//开始监听

		gBrush.selectAll(".brush rect")//设置刷子区域高度，刷子范围矩形高度
		// .attr('id', 'brush_' + iPId)
		.attr('fill', 'gray')
		.attr('opacity', function(){
			return 0.2;
		})
		.attr('stroke', 'black')
		.attr("height", yAxisLength);

		//add the two text marker
		
		var markerGroup = gBrush.append('g')
		.attr('class', 'marker_group');

		// var enter = markerGroup.enter().append('g')
		// 	.attr('class', 'marker_group');

		var font = '12px arial';
		//left
		var leftMarker = markerGroup.append('g')
		.attr('class', 'marker_left')
		.attr('transform', function(){		
			var left = d3.select('#' + propertyDivId + ' .extent').attr('x');
			var top = yAxisLength/2.;
			return 'translate(' + left + ',' +  top + ')';
		});

		leftMarker.append('text')
		.attr('class', 'text-center')
		.style('visibility', 'hidden')
		.style('font', font)
		.style('color', 'black');

		//right
		var rightMarker = markerGroup.append('g')
		.attr('class', 'marker_right hidden')
		.attr('transform', function(){
			var left = parseInt(d3.select('#' + propertyDivId  + ' .extent').attr('x'));
			left += parseInt(d3.select('#' + propertyDivId  + ' .extent').attr('width'));
			var top = yAxisLength/2.;		
			return 'translate(' + left + ',' +  top + ')';
		});

		rightMarker.append('text')
		.style('visibility', 'hidden')
		.attr('class', 'text-center')
		.style('font', font)
		.style('color', 'black')

		// markerGroup.exit().remove();

		// var gSel = d3.select("#scatterplot_"+SPID);

		// var groups = gSel.selectAll("g.scatterplot_filter_group")
		// 	.data(mapValueList,function(d){
		// 		return d.index;
		// 	})

		// var enter = groups.enter().append("g")
		// 	.attr("class","scatterplot_filter_group");

		// enter.append("rect");
		// enter.append("title");

		// groups.select("rect").attr("x","")
		// groups.select("title").attr("text",)

		// groups.exit().remove();

		// var left = d3.select('#pro_' + iPId + ' .extent').attr('x');
		// var right = left + d3.select('#pro_' + iPId + ' .extent').attr('width');
		// var middle_y = yAxisLength/2.;

		function brushended() {
			var extentRange = brush.extent();
			var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];		
			//console.log('adjust brush ', adjustExtentRange);//获取刷子边界范围所对应的输入值
		}

		function duringBrush(){		

			var extentRange = brush.extent();
			//console.log(" during brush ");
			//get the brushed property id

			//check if [-1, -1], select all
			if(extentRange[0] == -1 && extentRange[1] == -1){
				// //console.log('here?');
				svg.selectAll('#' + disDivId + ' .filter_barrect')
				.style('stroke', 'none')
				.style('opacity', '1');

				//make the marker invisible
				svg.selectAll('#' + propertyDivId + '.brush .marker_right')
				.classed('hidden', true)

				svg.selectAll('#' + propertyDivId + '.brush .marker_left')
				.classed('hidden', true)

				return;
			}

			//not [-1, -1]
			var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];

			self.m_mapProIdSelect[iGroupId + '-' + iPId] = adjustExtentRange;

			var labelTextSize_left = getTextSize(adjustExtentRange[0], font);
			var labelTextSize_right = getTextSize(adjustExtentRange[1], font);

			//console.log(' extentRange ', extentRange);

			//update the brush interface
			var markerleft = svg.selectAll('#' + propertyDivId + ' .brush .marker_left')
			.classed('hidden', false)
			.attr('transform', function(){
				var left = parseInt(d3.select('#' + propertyDivId  + ' .extent').attr('x'));
				var top = yAxisLength/2.;		
				return 'translate(' + left + ',' +  top + ')';
			});
			
			markerleft.selectAll('text')
			.text(adjustExtentRange[0]);

			var markerright = svg.selectAll('#' + propertyDivId + ' .brush .marker_right')
			.classed('hidden', false)
			.attr('transform', function(){
				var left = parseInt(d3.select('#' + propertyDivId + ' .extent').attr('x'));
				left += parseInt(d3.select('#' + propertyDivId + ' .extent').attr('width'));
				var top = yAxisLength/2.;		
				return 'translate(' + left + ',' +  top + ')';
			});

			markerright.selectAll('text')
			.style('font', font)
			.text(adjustExtentRange[1]);

			//update the bars
			var unselectRect = d3.selectAll('#' + disDivId + ' .filter_barrect')
			.filter(function(d, i){
				if(i >= adjustExtentRange[0] && i <= adjustExtentRange[1])
					return false;
				return true;
			})			
			.style('opacity', function(){
				return 0.2;
			});
			var xx = 0;
			d3.selectAll('#' + disDivId + ' .filter_barrect')
			.filter(function(d, i){
				if(i >= adjustExtentRange[0] && i <= adjustExtentRange[1]){
					return true;
				}
				return false;
			})
			.style('stroke', 'black')
			.style('opacity', 1)
			.attr('stroke-width', '1px');

			//compute thte selected ele if necessary
			var liSelectIndexRange = [];
			liSelectIndexRange.push(adjustExtentRange);
			var liSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(iPId, liSelectIndexRange);
		
			//console.log(" Extend Reange ", adjustExtentRange, ' xx ', xx, ' selected ele id ', liSelectedEleId);	

			//notify the cross-filter with selected property range
			self.m_CrossFilterInfo.setFilterEleIdsofPropertyId(iPId, liSelectedEleId);

			//update the object_create_button
			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();

			//console.log(' lifilter ', liFilterEleId);
			var eleNum = liFilterEleId.length;

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
				//the compound ele
				var liCompoundEleIds = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				eleNum = liCompoundEleIds.length;
			}

			$('#' + self.m_CreateButtonId).text(getCreateObjectButtonName(eleNum));	

			self.updateFilteredRects();	
			self.updateBoxPlots(iPId, adjustExtentRange);
			//notify the mask
			self.m_InObj.updateFilteredEleId(liFilterEleId);
		}
		
		//TODO
		// //make the label editable
		$('.propertyspan').bind('dblclick', function(){
			//console.log(" span clicked! ");

			// g_renameProperty = this;
			self.m_InObj.setRenameProperty(this);

			$('#propertyname_input_' + self.m_iId).val("");

			$('#rename_property_dialog_' + self.m_iId).dialog('open');
			// var nameInput = $('#name_input');
			// //get the input value
			// //console.log(nameInput.val());
	    }).blur(
	        function() {
	        $(this).attr('contentEditable', false);
	    });

	    $('.propertyspan').bind('click', function(){
	    	//console.log(" mouse click ");
	    	//release the brush	    	
			var prodiv = $(this).parents('.propertyrow');
			var iPropertyId = parseInt(prodiv.attr('propertyid'));
			self.releaseFilter(iPropertyId);
			var liFilterEleId = self.m_CrossFilterInfo.getFilterEleIds();
			var eleNum = liFilterEleId.length;

			if(self.m_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
				var liCompoundEleId = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
				//console.log(" 2 click ", liCompoundEleId.length);
				eleNum = liCompoundEleId.length;
			}
			$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));

			//notify the mask
			//console.log(" release <>", liFilterEleId.length);
			//update the boxplot text
			delete self.m_mapProIdSelect[iGroupId + '-' + iPropertyId];
			self.updateBoxPlots(iPropertyId, []);
			self.m_InObj.updateFilteredEleId(liFilterEleId);
	    });

	    $('.propertyspan').bind('mouseenter', function(){
	    	//console.log(" mouse enter ");
	    });

	    $('.propertylabel').mouseover(function(event){		
			// //console.log('Mouse Enter');
			$(this).find('.delete_property_icon').removeClass('hidden');		
		}); 
		$('.propertylabel').bind('mouseout', function(){
			// //console.log('Mouse Out');
			$(this).find('.delete_property_icon').addClass('hidden');
		});

		$('#'+ propertyDivId +' .delete_property_icon').click(function(event){
			event.stopPropagation();
			var sPropertyId = $(this).parents('.propertyrow').attr('propertyid');
			var iPropertyId = parseInt(sPropertyId);
			//console.log('[2] ', iPropertyId);
			self.deleteProperty(iPropertyId);
		});

		// d3.selectAll('.propertyrow').style('height', '50px');
		// d3.selectAll('.propertyrow .distri_div').style('height', '45px');
	}

	Info.expandPropertyRow = function(iPropertyId, expandBool){
		//console.log(" expand property row ", iPropertyId, expandBool);
	}

	//update the boxplot when filtered
	Info.updateBoxPlots = function(iPropertyId, SelectRange, Direct){
		var self = this;
		//console.log(" SelectRange ", SelectRange);
		var bNumeric = d3.select('#p_' + self.m_iId + 'pro_' + iPropertyId).attr("numerical");
		var boxplotSvg = d3.select('#p_' + self.m_iId + 'box_' + iPropertyId + ' svg');
		
		if(SelectRange.length == 0){
			//clear
			//console.log(" SelectRange HERE ", SelectRange);
			boxplotSvg.selectAll('.boxplot-text')
			.text('');
			return;
		}

		var leftText = SelectRange[0] / 30; leftText = leftText.toFixed(1);
		var rightText = SelectRange[1] / 30; rightText = rightText.toFixed(1);		
	
		if(Direct == true){
			leftText = SelectRange[0];
			rightText = SelectRange[1];
		}

		if(bNumeric == 'no'){
			//not numeric
			leftText = Math.ceil(SelectRange[1] - SelectRange[0]) + 1;	
			rightText = "";
		}
		boxplotSvg.select('.left-text')
		.text(leftText);

		boxplotSvg.select('.right-text')
		.text(rightText);
	}

	//update the highlighed filtered rects
	Info.updateFilteredRects = function(){
		// //console.log(" xxx !! ");
		//remove the filter rect
		// $(".filter_barrect").remove();
		var self = this;
		if(!self.m_CrossFilterInfo.isSetFiltering()){
			// //console.log(" [1] ");
			//no filtering constraint
			//hidden the background rect
			d3.selectAll('#' + self.m_ProPanelDivId +  " .barrect")
			.attr('invisible', 'hidden');
		}else{
			// //console.log(" [2] ");
			//show the background rect		
			d3.selectAll('#' + self.m_ProPanelDivId + " .barrect")
			.attr('invisible', 'visible');
		}

		//update the filtered bars
		var liFilteredId = self.m_CrossFilterInfo.getFilterEleIds();
		var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
		var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);
		propertyBag.setFilterEldIds(liFilteredId);

		// //console.log(' &&&& filter Ele Id Number = ', liFilteredId.length);

		//for each property, add the filter_bar rects
		var mapPropertyIdFilterIdsDistri = propertyBag.getPropertyIdFilteredEleDis();

		for(var iPId in mapPropertyIdFilterIdsDistri){
		
			var liDistri = mapPropertyIdFilterIdsDistri[iPId];
			var propertyType = propertyBag.getPropertyTypebyId(iPId);

			var xScale = propertyBag.getXScaleOfPropertyId(iPId);
			var yScale = propertyBag.getYScaleOfPropertyId(iPId);
		
			var xAxisLength = $('#' + 'p_' + self.m_iId + 'dis_' + iPId +' svg').width(); //self.m_iId + 'dis_' + iPId;
			var yAxisLength = $('#' + 'p_' + self.m_iId + 'dis_' + iPId +' svg').height();

			var bExpand = self.m_mapProIdExpand[iGroupId + '-' + iPId];
			// self.m_mapProIdExpand[iGroupId + '-' + iPId] 
			var yAxisExpandPad = 0;

			//console.log(" www ", bExpand);
			// var bExpand = d3.select('#p_' + self.m_iId + 'pro_' + iPId).attr('bexpand');
			var xShift = 0, yShift = 0;

			if(bExpand == "true"){
				xShift = XSHIFT;
				yShift = YSHIFT;
				xAxisLength = xAxisLength - xShift;
				xAxisLength = xAxisLength * 0.95;
				yAxisLength = yAxisLength - yShift;
				yAxisLength = yAxisLength * 0.95;
				yAxisExpandPad = 10;
			}
				
			if(xScale == undefined)
				return;
			
			var xScaleDomain = xScale.domain();
			// xScale.range([0, xAxisLength]);

			var yScaleDomain = yScale.domain();
			
			// if(bExpand == "true")
				//console.log(" [11] X ", yScale(2), yAxisExpandPad, xScaleDomain, yScaleDomain);
			// yScale.range([yAxisLength - yAxisExpandPad, 0]);

			xScale = d3.scale.linear()
					.domain(xScaleDomain)
					.range([0, xAxisLength]);

			yScale = d3.scale.linear()
					.domain(yScaleDomain)
					.range([yAxisLength - yAxisExpandPad, 0]);

			// var xScale = d3.scale.linear()
			// 			.domain()
			// 			.range([0, xAxisLength]);

			// var yScale = d3.scale.linear()
			// 			.domain(yScaleDomain)
			// 			.range([yAxisLength * 0.3, yAxisLength]);

			//console.log(" [11][22] ", iGroupId + '-' + iPId, bExpand, self.m_mapProIdExpand, yScale(2));
			// 			// .range([0, yAxisLength]);

			propertyBag.setXYScaleofPropertyId(iPId, xScale, yScale);

			// var barWidth = xAxisLength/disCountList.length;
			var barRatio = 0.95;//0.8;
			var baseLineY = yAxisLength;

			// if(bExpand == 'true'){
			// 	//expand
			// 	yAxisLength = yAxisLength - YSHIFT;		
			// 	yAxisLength = yAxisLength * 0.95;
			// }
			// //console.log(" bExpand %%", bExpand);

			// var barWidth = xAxisLength/liDistri.length;
			// var barRatio = 0.95;//0.8;
			// var baseLineY = yAxisLength;

			
			d3.selectAll('#' + 'p_' + self.m_iId + 'dis_' + iPId + ' .filter_barrect')
			.data(liDistri)
			.attr('y', function(d, i){
				// if(d == 0)
				// 	return baseLineY;
				// return baseLineY - yScale(d);
				return yScale(d) + yAxisExpandPad;
			})
			.attr('height', function(d, i){
				if(d == 0)
					return 0;
				// return yScale(d);
				return baseLineY - yScale(d) - yAxisExpandPad;
			})
			.style('opacity', function(){
				return 1;
			});

			if(self.m_CrossFilterInfo.isSetConstraintOnProperty(iPId) == false)
				d3.selectAll('#' + 'p_' + self.m_iId + 'dis_' + iPId + ' .filter_barrect')
				.style('stroke', 'none');
		}

		//update the scatter plot
		var liSPId = propertyBag.getScatterPlotIds();
		
		for (var i = 0; i < liSPId.length; i++) {

			var iSPID = liSPId[i];

			var bBlackHighlight = self.m_CrossFilterInfo.isScatterPlotSetFilterConstraint(iSPID);

			var sizeScale = propertyBag.getSizeScalebySPID(iSPID);
			var xScale = propertyBag.getXScalebySPID(iSPID);
			var spConfig = propertyBag.getScatterPlotConfig(iSPID);
			var liFilterDis = propertyBag.getFilteredSPDis(iSPID);

			var liFilterIndex = [];
			for (var j = 0; j < liFilterDis.length; j++) {
				var temp = liFilterDis[j];
				liFilterIndex.push(temp['index']);
			};

			//console.log(' filter dis ', liFilterDis, ' liFilterIndex ', liFilterIndex, ' size ', liFilterIndex.length);

			var xAxisLength = $('#' + 'scatterplot_' + self.m_iId + '_' + iSPID ).width();
			var rectWidth = 1. * xAxisLength/(spConfig.ixBinNum);

			var selectedRect = 0;

			//selected
			// //console.log('#' 'scatterplot_' + self.m_iId + '_' + SPID);

			d3.selectAll('#' + 'scatterplot_' + self.m_iId + '_' + iSPID + ' .scatter_plot_bar')
			.filter(function(d, i){
				//console.log('d ', d);
				var iIndex = d['index'];
				if(liFilterIndex.indexOf(iIndex) != -1){
					return true;
				}
				return false;
			})	
			.style('stroke', function(){
				if(bBlackHighlight)
					return 'black';
				else
					return '#bdbdbd';
			})
			.style('stroke-width', function(){
				if(bBlackHighlight)
					return '1px';
				else
					return '0.5px';
			})
			.style('opacity', 1.)
			.attr('width', function(d){		
				var iIndex = d['index'];
				// var value = d['count'];
				var indexOf = liFilterIndex.indexOf(iIndex);		
				var value = liFilterDis[indexOf]['count'];
				return rectWidth * 0.3 + rectWidth * 0.7 * sizeScale(value) + 'px';
			})
			.attr('x', function(d){
				var iIndex = d['index'];
				// var value = d['count'];
				var indexOf = liFilterIndex.indexOf(iIndex);		
				var value = liFilterDis[indexOf]['count'];
				var xyIndex = spConfig.getXYIndex(iIndex);

				var barwidth = rectWidth * 0.3 + rectWidth * 0.7 * sizeScale(value);
				// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
				return xScale(xyIndex.x) + rectWidth/2. - barwidth/2. + 'px';
			});

			//unselected
			d3.selectAll('#' + 'scatterplot_' + self.m_iId + '_' + iSPID + ' .scatter_plot_bar')
			.filter(function(d, i){
				var iIndex = d['index'];
				if(liFilterIndex.indexOf(iIndex) == -1){
					return true;
				}
				return false;
			})
			.style('stroke', '#bdbdbd')
			.style('stroke-width', '1px')
			.style('opacity', 0.3);
		};

		//update the mds

		d3.selectAll('#drop_' + self.m_iId + ' .mds-dot')
		.filter(function(d, i){
			if(liFilteredId.indexOf(Number(d.eleid)) == -1)
				return false;
			return true;
		})
		.style('stroke', 'black')
		.style('stroke-width', '1px')
		.style('opacity', 1.);

		d3.selectAll('#drop_' + self.m_iId + ' .mds-dot')
		.filter(function(d, i){
			//console.log('XXXX???', Number(d['eleid']), liFilteredId);
			if(liFilteredId.indexOf(Number(d.eleid)) == -1)
				return true;
			return false;
		})
		.style('stroke', 'none')
		.style('opacity', 0.3);
	}


	//feedback to the button click
	Info.clickPropertyButton = function(buttonName){
		var self = this;
		switch(buttonName){
			case 'Create':
				self.m_InObj.createANewPGroup();
				break;
			case 'Derive':
				deriveNewProperty();
				break;
			case '2D':
				defineScatterPlot();
				break;
			default:
				break;
		}
	}

	Info.__init__(iId, inObj, objectGroupManager);
	return Info;
}


function drawProperties(iGroupId){

	var self = this;

	//update the object_create_button
	//get the current ele ids 
	var iSelectGroupId = g_ObjectGroupManager.getSelectedGroupId();        
   	var liSelectedEleIds = g_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);
   	var eleNum = liSelectedEleIds.length;

   	if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){//.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSele){
		//console.log(" 1 initiate ", liSelectedEleIds.length);
   		var liCompoundEleIds = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liSelectedEleIds);
   		eleNum = liCompoundEleIds.length;
   	}
	$('#pg_Create').text(getCreateObjectButtonName(eleNum));

	addProReNameDialog();

	//clear 
	removeDrawProperties();

	var self = this;
	var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);
	//console.log(" propertyBag 1 ", propertyBag);
	// propertyBag.getGroupId();
	var liPropertyId = propertyBag.getVisiblePropertyIds();

	//console.log(" liVible Property Id ", liPropertyId);

	//set the filtered eleids
	var liFilteredEleId = g_CrossFilterInfo.getFilterEleIds();
	propertyBag.setFilterEldIds(liFilteredEleId);

	if(!g_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() != 'compound'){		
		$.each(liPropertyId, function(i, iPId){
			self.drawProperty(iPId, 'property_p');
		});
	}else{
		//compound
		drawCompoundPropertyRows();
	}
	// drawCompoundPropertyRows();

	$('#invisible_property_menu li').remove();

	//init invisible properties
	var liVisiblePropertyId = propertyBag.getVisiblePropertyIds();

	var noOkName = ['g_x', 'g_y', 'g_box', 'id', 'opacity'];
	for(var i = 0; i < liVisiblePropertyId.length; i ++){
		var iPropertyId = liVisiblePropertyId[i];
		var propertyName = propertyBag.getPropertyNamebyId(iPropertyId);
		if(noOkName.indexOf(propertyName) != -1){
			propertybag.setPropertyVisible(iPropertyId, false);
		}
	}
	var liInvisilePropertyId = propertyBag.getInVisiblePropertyIds();
	// console.log(" ERROR ", liInvisilePropertyId);

	$.each(liInvisilePropertyId, function(i, iPID){
		self.deleteProperty(iPID);
	});

}	

function removeDrawProperties(){
	$('.propertyrow').remove();
	$(".compoundrow").remove();
	$(".scatter_plot_row").remove();
}

//update the highlighed filtered rects
function updateFilteredRects(){
	// //console.log(" xxx !! ");
	//remove the filter rect
	// $(".filter_barrect").remove();
	if(!g_CrossFilterInfo.isSetFiltering()){
		// //console.log(" [1] ");
		//no filtering constraint
		//hidden the background rect
		d3.selectAll(".barrect")
		.attr('invisible', 'hidden');
	}else{
		// //console.log(" [2] ");
		//show the background rect		
		d3.selectAll(".barrect")
		.attr('invisible', 'visible');
	}

	//update the filtered bars
	var liFilteredId = g_CrossFilterInfo.getFilterEleIds();
	var iGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);
	propertyBag.setFilterEldIds(liFilteredId);

	// //console.log(' &&&& filter Ele Id Number = ', liFilteredId.length);

	//for each property, add the filter_bar rects
	var mapPropertyIdFilterIdsDistri = propertyBag.getPropertyIdFilteredEleDis();

	for(var iPId in mapPropertyIdFilterIdsDistri){
	
		var liDistri = mapPropertyIdFilterIdsDistri[iPId];
		var propertyType = propertyBag.getPropertyTypebyId(iPId);

		var xScale = propertyBag.getXScaleOfPropertyId(iPId);
		var yScale = propertyBag.getYScaleOfPropertyId(iPId);

		var xAxisLength = $('#dis_' + iPId +' svg').width();
		var yAxisLength = $('#dis_' + iPId +' svg').height();

		var barWidth = xAxisLength/liDistri.length;
		var barRatio = 0.95;//0.8;
		var baseLineY = yAxisLength;
		
		d3.selectAll('#dis_' + iPId + ' .filter_barrect')
		.data(liDistri)
		.attr('y', function(d, i){
			return yScale(d);
			// if(d == 0)
			// 	return baseLineY;
			// return baseLineY - yScale(d);
		})
		.attr('height', function(d, i){
			if(d == 0)
				return 0;
			// return yScale(d);
			return baseLineY - yScale(d);
		})
		.style('opacity', function(){
			return 1;
		});

		if(g_CrossFilterInfo.isSetConstraintOnProperty(iPId) == false)
			d3.selectAll('#dis_' + iPId + ' .filter_barrect')
			.style('stroke', 'none');
	}

	//update the scatter plot
	var liSPId = propertyBag.getScatterPlotIds();
	
	for (var i = 0; i < liSPId.length; i++) {

		var iSPID = liSPId[i];

		var bBlackHighlight = g_CrossFilterInfo.isScatterPlotSetFilterConstraint(iSPID);

		var sizeScale = propertyBag.getSizeScalebySPID(iSPID);
		var xScale = propertyBag.getXScalebySPID(iSPID);
		var spConfig = propertyBag.getScatterPlotConfig(iSPID);
		var liFilterDis = propertyBag.getFilteredSPDis(iSPID);

		var liFilterIndex = [];
		for (var j = 0; j < liFilterDis.length; j++) {
			var temp = liFilterDis[j];
			liFilterIndex.push(temp['index']);
		};

		//console.log(' filter dis ', liFilterDis, ' liFilterIndex ', liFilterIndex, ' size ', liFilterIndex.length);

		var xAxisLength = $('#scatterplot_' + iSPID).width();
		var rectWidth = 1. * xAxisLength/(spConfig.ixBinNum);

		var selectedRect = 0;

		//selected
		//console.log('#scatterplot_' + iSPID);

		d3.selectAll('#scatterplot_' + iSPID + ' .scatter_plot_bar')
		.filter(function(d, i){
			//console.log('d ', d);
			var iIndex = d['index'];
			if(liFilterIndex.indexOf(iIndex) != -1){
				return true;
			}
			return false;
		})	
		.style('stroke', function(){
			if(bBlackHighlight)
				return 'black';
			else
				return '#bdbdbd';
		})
		.style('stroke-width', function(){
			if(bBlackHighlight)
				return '1px';
			else
				return '0.5px';
		})
		.style('opacity', 1.)
		.attr('width', function(d){		
			var iIndex = d['index'];
			// var value = d['count'];
			var indexOf = liFilterIndex.indexOf(iIndex);		
			var value = liFilterDis[indexOf]['count'];
			return rectWidth * 0.3 + rectWidth * 0.7 * sizeScale(value) + 'px';
		})
		.attr('x', function(d){
			var iIndex = d['index'];
			// var value = d['count'];
			var indexOf = liFilterIndex.indexOf(iIndex);		
			var value = liFilterDis[indexOf]['count'];
			var xyIndex = spConfig.getXYIndex(iIndex);

			var barwidth = rectWidth * 0.3 + rectWidth * 0.7 * sizeScale(value);
			// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
			return xScale(xyIndex.x) + rectWidth/2. - barwidth/2. + 'px';
		});

		//unselected
		d3.selectAll('#scatterplot_' + iSPID + ' .scatter_plot_bar')
		.filter(function(d, i){
			var iIndex = d['index'];
			if(liFilterIndex.indexOf(iIndex) == -1){
				return true;
			}
			return false;
		})
		.style('stroke', '#bdbdbd')
		.style('stroke-width', '0.5px')
		.style('opacity', 0.3);
	};
}

//release the filtering on property
function releaseFilter(iPId){
	//reset the extent to 0 width
	d3.selectAll('#pro_' + iPId + ' .extent').attr('width', 0);
	d3.selectAll('#pro_' + iPId + ' .marker_left').classed('hidden', true);
	d3.selectAll('#pro_' + iPId + ' .marker_right').classed('hidden', true);

	//update the cross filter
	g_CrossFilterInfo.releaseFilterEleIdsofPropertyId(iPId);

	//update the filter ele ids
	var liFilteredEleId = g_CrossFilterInfo.getFilterEleIds();
	var iSelectedGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iSelectedGroupId);

	propertyBag.setFilterEldIds(liFilteredEleId);
	// //console.log(" iPId ", iPId, ' filter ele id ', liFilteredEleId);

	//change the rect
	updateFilteredRects();
}

//release the filtering on scatter plot
function releaseSPFilter(iSPId){

	d3.selectAll('#scatterplot_' + iSPId + ' .extent').attr('width', 0).attr('height', 0);
	d3.selectAll('#scatterplot_' + iSPId + ' .marker_sp').classed('hidden', true);
	
	g_CrossFilterInfo.releaseFilterEleIdsofScatterPlotId(iSPId);

	//update the filter ele ids
	var liFilteredEleId = g_CrossFilterInfo.getFilterEleIds();
	var iSelectedGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iSelectedGroupId);

	propertyBag.setFilterEldIds(liFilteredEleId);
	// //console.log(" iPId ", iSPId, ' filter ele id ', liFilteredEleId);

	//change the rect
	//console.log("[3] bb ");
	updateFilteredRects();
	//console.log("[3] ee ");
}

var colorTypeStr = ['color', 'fill'];

//draw one property
function drawProperty(iPId, ParentDivId, set_labelDivWidth, set_disDivWidth){

	var parentdiv = $("#" + ParentDivId);

	if(parentdiv.length == 0)
	{
		// alert('not exist ', ParentDivId);
		var proset = 'proset_';
		var iCompoundIndex = Number(ParentDivId.substring(proset.length));

		//add a compound div
		var compoundDiv = $("<div>");
		var compoundId =  ParentDivId;
		compoundDiv.attr('id', compoundId)
		.attr('class', 'propertyset-div compoundrow')
		.attr('compoundindex', iCompoundIndex);

		$("#property_p").append(compoundDiv);
	}

	var iGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);

	//every property
	var propertyInfo = propertyBag.getPropertyInfo(iPId);
	var propertyType = propertyBag.getPropertyTypebyId(iPId);
	var propertyName = propertyBag.getPropertyNamebyId(iPId);

	// if(prodiv.length == 0){
	// 	//if parent div not exist
	// // var prodiv = $('#' + ParentDivId);

	// }

	var	prodiv = $("<div>");
	var propertyId =  'pro_' + iPId;
	prodiv.attr('id', propertyId)
	.attr('class', 'propertyrow')
	.attr('value', propertyType)
	.attr('groupid', iGroupId)
	.attr('propertyid', iPId);
	// .height('25px');
	$("#" + ParentDivId).append(prodiv);


	//compute the width of label and dis div
	var font = '12px arial';
	var labelDivWidth, disDivWidth;
	var disDivHeight = 25;
	// var legendWidth = 25;
	var labelTextSize = getTextSize(propertyName, font);
	var gapWidth = 15;
	var labelDisGap = 5;
	
	if(set_labelDivWidth == undefined || set_disDivWidth == undefined){
		labelDivWidth = labelTextSize['w'] + gapWidth;
		disDivWidth = prodiv.width() - labelDivWidth - labelDisGap - legendWidth - labelDisGap;
	}else{
		labelDivWidth = set_labelDivWidth;
		disDivWidth = set_disDivWidth;
	}

	/* legend div */
	// var sPID = iPId + '';
	// var legendhtml = '<div class="propertylabel" value=<%=propertyType%>  style="position:relative" ><i class="fa fa-times delete_property_icon hidden"></i><img src=<%=imgsrc%> ></img></div>';
	// var compile_legendhtml = _.template(legendhtml);
	// legendhtml = compile_legendhtml({
	// 	propertyType: propertyType,

	// })

	/* label div */
	//console.log(' SPID ', sPID);
	var labelhtml = '<div class="propertylabel" value=<%=propertyType%>  style="position:relative" ><i class="fa fa-times delete_property_icon hidden"></i><span class="propertyspan"><%=propertyName%></span></div>';
	var compile_labelhtml = _.template(labelhtml);
    labelhtml = compile_labelhtml({
		propertyType: propertyType,
		propertyName: propertyName,
	});
	prodiv.html(prodiv.html() + labelhtml);
	prodiv.find('.propertylabel').width(labelDivWidth + 'px');

	//his div
	var disDiv = $("<div>");
	var disDivId = 'dis_' + iPId;
	disDiv
	.attr('id', disDivId)
	.attr('class', 'distri_div')
	.width(disDivWidth + 'px');
	// .height(disDivHeight + 'px');
	prodiv.append(disDiv);


	/*draw histogram */
	var disCountList = propertyBag.getDis(iPId);
	var disFilterList = propertyBag.getFilteredDis(iPId);
	
	//console.log(" dis count : ", disCountList);	
	//console.log(" filter dis count : ", disFilterList);

	var svg = d3.select("#"+disDivId).append("svg")
	.attr('width', disDivWidth + 'px')
	.attr('height', disDivHeight * 0.9 + 'px');
	// .attr("width", "100%")
	// .attr("height", "100%");

	var xAxisLength = $('#'+disDivId+' svg').width();
	var yAxisLength = $('#'+disDivId+' svg').height();

	var xScale = d3.scale.linear()
				.domain([0, disCountList.length])
				.range([0, xAxisLength]);
	var yScale = d3.scale.linear()
				.domain([0, d3.max(disCountList)])
				.range([yAxisLength * 0.3, yAxisLength]);
				// .range([0, yAxisLength]);

	propertyBag.setXYScaleofPropertyId(iPId, xScale, yScale);

	var barWidth = xAxisLength/disCountList.length;
	var barRatio = 0.95;//0.8;
	var baseLineY = yAxisLength;

	//draw the background rect, hiddle initiately
	svg.selectAll('.barrect')
	.data(disCountList)
	.enter()
	.append('rect')
	.attr('class', 'barrect')
	.attr(propertyType, function(d, i){
		return propertyBag.getBinPropertyValue(iPId, i);
	})
	.attr('x', function(d, i){
		return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
	})
	.attr('y', function(d, i){
		if(d == 0)
			return baseLineY;
		return baseLineY - yScale(d);
	})
	.attr('width', function(){
		return barWidth * barRatio;
	})
	.attr('height', function(d, i){
		if(d == 0)
			return 0;
		return yScale(d);
	})
	.style('fill', 'gray')
	.style('opacity', function(){
		return 0.2;
	})
	.style('invisible', 'hidden');

	svg.selectAll('.filter_barrect')
	.data(disFilterList)
	.enter()
	.append('rect')
	.attr('class', 'filter_barrect')
	// .style('stroke', '#d9d9d9')
	.attr(propertyType, function(d, i){
		return propertyBag.getBinPropertyValue(iPId, i);
	})
	.attr('x', function(d, i){
		return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
	})
	.attr('y', function(d, i){
		if(d == 0)
			return baseLineY;

		return baseLineY - yScale(d);
	})
	.attr('width', function(){
		return barWidth * barRatio;
	})
	.attr('height', function(d, i){
		if(d == 0)
			return 0;

		return yScale(d);
	});

	//check if property type is color or not
	if(colorTypeStr.indexOf(propertyType) < 0){
		// var rectSize = $(".distri_div .barrect").size();
		// //console.log(' gray ', propertyType, ' rectSize ', rectSize);			
	   svg.selectAll('.filter_barrect')
		   .attr('fill', 'gray');
	}
	
	//add brush
	var brush = d3.svg.brush()
	.x(xScale)
	.extent([-1, -1])
	// .on('brushstart', beforeBrush)
	.on('brush', duringBrush)
	.on("brushend", brushended);

	var gBrush = svg.append("g")
	 .attr("class", "brush")
	 // .attr("id", 'brush_' + iPId)
	 .call(brush)//绑定刷子
	 .call(brush.event);//开始监听

	gBrush.selectAll(".brush rect")//设置刷子区域高度，刷子范围矩形高度
	// .attr('id', 'brush_' + iPId)
	.attr('fill', 'gray')
	.attr('opacity', function(){
		return 0.2;
	})
	.attr('stroke', 'black')
	.attr("height", yAxisLength);

	//add the two text marker
	
	var markerGroup = gBrush.append('g')
	.attr('class', 'marker_group');

	// var enter = markerGroup.enter().append('g')
	// 	.attr('class', 'marker_group');

	var font = '12px arial';
	//left
	var leftMarker = markerGroup.append('g')
	.attr('class', 'marker_left')
	.attr('transform', function(){		
		var left = d3.select('#pro_' + iPId + ' .extent').attr('x');
		var top = yAxisLength/2.;
		return 'translate(' + left + ',' +  top + ')';
	});

	leftMarker.append('text')
	.attr('class', 'text-center')
	.style('visibility', 'hidden')
	.style('font', font)
	.style('color', 'black');

	//right
	var rightMarker = markerGroup.append('g')
	.attr('class', 'marker_right hidden')
	.attr('transform', function(){
		var left = parseInt(d3.select('#pro_' + iPId + ' .extent').attr('x'));
		left += parseInt(d3.select('#pro_' + iPId + ' .extent').attr('width'));
		var top = yAxisLength/2.;		
		return 'translate(' + left + ',' +  top + ')';
	});

	rightMarker.append('text')
	.style('visibility', 'hidden')
	.attr('class', 'text-center')
	.style('font', font)
	.style('color', 'black')

	// markerGroup.exit().remove();

	// var gSel = d3.select("#scatterplot_"+SPID);

	// var groups = gSel.selectAll("g.scatterplot_filter_group")
	// 	.data(mapValueList,function(d){
	// 		return d.index;
	// 	})

	// var enter = groups.enter().append("g")
	// 	.attr("class","scatterplot_filter_group");

	// enter.append("rect");
	// enter.append("title");

	// groups.select("rect").attr("x","")
	// groups.select("title").attr("text",)

	// groups.exit().remove();

	// var left = d3.select('#pro_' + iPId + ' .extent').attr('x');
	// var right = left + d3.select('#pro_' + iPId + ' .extent').attr('width');
	// var middle_y = yAxisLength/2.;

	function brushended() {
		var extentRange = brush.extent();
		var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];		
		//console.log('adjust brush ', adjustExtentRange);//获取刷子边界范围所对应的输入值
	}

	function duringBrush(){		

		var extentRange = brush.extent();
		//console.log(" during brush ");
		//get the brushed property id

		//check if [-1, -1], select all
		if(extentRange[0] == -1 && extentRange[1] == -1){
			// //console.log('here?');
			svg.selectAll('#dis_'+iPId+ ' .filter_barrect')
			.style('stroke', 'none')
			.style('opacity', '1');

			//make the marker invisible
			svg.selectAll('#pro_' + iPId + '.brush .marker_right')
			.classed('hidden', true)

			svg.selectAll('#pro' + iPId + '.brush .marker_left')
			.classed('hidden', true)

			return;
		}

		//not [-1, -1]
		var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];

		var labelTextSize_left = getTextSize(adjustExtentRange[0], font);
		var labelTextSize_right = getTextSize(adjustExtentRange[1], font);

		//console.log(' extentRange ', extentRange);

		//update the brush interface
		var markerleft = svg.selectAll('#pro_' + iPId + ' .brush .marker_left')
		.classed('hidden', false)
		.attr('transform', function(){
			var left = parseInt(d3.select('#pro_' + iPId + ' .extent').attr('x'));
			var top = yAxisLength/2.;		
			return 'translate(' + left + ',' +  top + ')';
		});
		
		markerleft.selectAll('text')
		.text(adjustExtentRange[0]);

		var markerright = svg.selectAll('#pro_' + iPId + ' .brush .marker_right')
		.classed('hidden', false)
		.attr('transform', function(){
			var left = parseInt(d3.select('#pro_' + iPId + ' .extent').attr('x'));
			left += parseInt(d3.select('#pro_' + iPId + ' .extent').attr('width'));
			var top = yAxisLength/2.;		
			return 'translate(' + left + ',' +  top + ')';
		});

		markerright.selectAll('text')
		.style('font', font)
		.text(adjustExtentRange[1]);

		//update the bars
		var unselectRect = d3.selectAll('#dis_'+iPId+ ' .filter_barrect')
		.filter(function(d, i){
			if(i >= adjustExtentRange[0] && i <= adjustExtentRange[1])
				return false;
			return true;
		})			
		.style('opacity', function(){
			return 0.2;
		});
		var xx = 0;
		d3.selectAll('#dis_'+iPId+ ' .filter_barrect')
		.filter(function(d, i){
			if(i >= adjustExtentRange[0] && i <= adjustExtentRange[1]){
				return true;
			}
			return false;
		})
		.style('stroke', 'black')
		.style('opacity', 1)
		.attr('stroke-width', '1px');

		//compute thte selected ele if necessary
		var liSelectIndexRange = [];
		liSelectIndexRange.push(adjustExtentRange);
		var liSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(iPId, liSelectIndexRange);
	
		//console.log(" Extend Reange ", adjustExtentRange, ' xx ', xx, ' selected ele id ', liSelectedEleId);	

		//notify the cross-filter with selected property range
		g_CrossFilterInfo.setFilterEleIdsofPropertyId(iPId, liSelectedEleId);

		//update the object_create_button
		var liFilterEleId = g_CrossFilterInfo.getFilterEleIds();

		//console.log(' lifilter ', liFilterEleId);

		var eleNum = liFilterEleId.length;

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){// g_ObjectGroupManager.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
			//the compound ele
			var liCompoundEleIds = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
			eleNum = liCompoundEleIds.length;
		}

		$('#' + self.m_CreateButtonId).text(getCreateObjectButtonName(eleNum));	

		updateFilteredRects();	
	}
	
	// //make the label editable
	$('.propertyspan').bind('dblclick', function() {
		//console.log(" span clicked! ");
		g_renameProperty = this;

		$('#propertyname_input').val("");

		$('#rename_property_dialog').dialog('open');
		// var nameInput = $('#name_input');
		// //get the input value
		// //console.log(nameInput.val());
    }).blur(
        function() {
        $(this).attr('contentEditable', false);
    });

    $('.propertyspan').bind('click', function(){
    	//console.log(" mouse click ");
    	//release the brush	    	
		var prodiv = $(this).parents('.propertyrow');
		var iPropertyId = parseInt(prodiv.attr('propertyid'));
		releaseFilter(iPropertyId);
		var liFilterEleId = g_CrossFilterInfo.getFilterEleIds();
		var eleNum = liFilterEleId.length;

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
			var liCompoundEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
			//console.log(" 2 click ", liCompoundEleId.length);
			eleNum = liCompoundEleId.length;
		}
		$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));
    });

    $('.propertyspan').bind('mouseenter', function(){
    	//console.log(" mouse enter ");
    });

    $('.propertylabel').mouseover(function(event){		
		// //console.log('Mouse Enter');
		$(this).find('.delete_property_icon').removeClass('hidden');		
	}); 
	$('.propertylabel').bind('mouseout', function(){
		// //console.log('Mouse Out');
		$(this).find('.delete_property_icon').addClass('hidden');
	});

	$('#'+propertyId+' .delete_property_icon').click(function(event){
		event.stopPropagation();
		var sPropertyId = $(this).parents('.propertyrow').attr('propertyid');
		var iPropertyId = parseInt(sPropertyId);
		//console.log('[2] ', iPropertyId);
		self.deleteProperty(iPropertyId);
	});

	// d3.selectAll('.propertyrow').style('height', '50px');
	// d3.selectAll('.propertyrow .distri_div').style('height', '45px');
}

function drawCompoundPropertyRows(){
	//double check the select group type
	// if(g_ObjectGroupManager.getSelectedGroupType() != 'compound')
	if(!g_ObjectGroupManager.isSelectedGroupTypeCompound())
		return ;

	//get the property bag
	var propertyBag = g_PropertyManager.getPropertyBag(g_ObjectGroupManager.getSelectedGroupId());
	//get the compound map
	var mapCompoundIndexPropertyIds = propertyBag.getCompoundIndexPropertyIdsMap();
	var liCompoundIndex = Object.keys(mapCompoundIndexPropertyIds);

	for (var i = liCompoundIndex.length - 1; i >= 0; i--) {
		var iCompoundIndex = liCompoundIndex[i];
		var liPropertyId = mapCompoundIndexPropertyIds[iCompoundIndex];

		//add a compound div
		var compoundDiv = $("<div>");
		var compoundId =  'proset_' + iCompoundIndex;
		compoundDiv.attr('id', compoundId)
		.attr('class', 'propertyset-div compoundrow')
		.attr('compoundindex', iCompoundIndex);

		$("#property_p").append(compoundDiv);

		//add the property rows
		for (var j = liPropertyId.length - 1; j >= 0; j--) {
			var iPropertyId = liPropertyId[j];
			drawProperty(iPropertyId, compoundId);
		};
	};
}

//set property invisible
function deleteProperty(iPropertyID){
	//release the filtering on this property
	releaseFilter(iPropertyID);

	//remove the property
	var propertyId =  'pro_' + iPropertyID;
	$('#' + propertyId).remove();
	
	var iGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);
	var propertyName = propertyBag.getPropertyNamebyId(iPropertyID);
	propertyBag.setPropertyVisible(iPropertyID, false);

	//console.log(' remove property id ', propertyId, ' property name ', propertyName);
	var newlihtml = '<li id=<%=liproid%> propertyid=<%=propertyId%> class="text-center"><%=propertyName%></li>'
	var compiled = _.template(newlihtml);	
    $('#invisible_property_menu').html($('#invisible_property_menu').html() + compiled({
		propertyId: iPropertyID,
		propertyName: propertyName,
		liproid: 'pro_li_' + iPropertyID,
	}));

	//test 
	// //console.log(' visible properties: ', propertyBag.getVisiblePropertyIds());

	//check the property-add-button
	if(propertyBag.getInVisiblePropertyIds().length > 0){
		//console.log(' invisible = true ');
		$('#add_property_button').removeClass('alpha-3');
	}else{
		//console.log(' invisible = false ');
		$('#add_property_button').addClass('alpha-3');
	}

	//update inter
	g_InteractionRecorder.addRemovePropertyCount();
}

function deleteScatterPlot(iSPID){

	//console.log(" [1]bb ");
	releaseSPFilter(iSPID);
	//console.log(" [1]ee ");

	var scatterplot_rowId = 'scatter_plot_div_' + iSPID;
	$('#' + scatterplot_rowId).remove();

	var iGroupId = g_ObjectGroupManager.getSelectedGroupId();
	g_PropertyManager.removeAScatterPlot(iGroupId, scatterplot_rowId);
}

function addProperty(iPropertyID){
	//todo
}

//add a delete button 
function addDeletePopButton(parentDiv){
	var delpophtml = '<div class="del_pop_but" hidden="hidden"></div>'
	//hidden="hidden"
	//'<div id="dialog-rename" title="Empty the recycle bin?" style="display: none"><p><span style="float: left; margin: 0 7px 20px 0;"></span>Rename</p></div>';
	//'<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar"><%= subpaneltitle %></div><div class="span12" id=<%=subpanelid%> ></div></div>';
	var compiled = _.template(delpophtml);	
	parentDiv.innerHTML = parentDiv.innerHTML + compiled({});	
}

//add a rename dialog, default hide
function addProReNameDialog(){
	
	var self = this;

	if($('#rename_property_dialog').length != 0)
		return;

	var dialoghtml = '<div id="rename_property_dialog" title="Rename" hidden="hidden"><input id="propertyname_input"></input></div>'
	//'<div id="dialog-rename" title="Empty the recycle bin?" style="display: none"><p><span style="float: left; margin: 0 7px 20px 0;"></span>Rename</p></div>';
	//'<div class="row sub_panel" style="border:solid 1px #111" id=<%=subpaneldiv%> ><div class="span12 titlebar"><%= subpaneltitle %></div><div class="span12" id=<%=subpanelid%> ></div></div>';
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('property_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#rename_property_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
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

//add a derive property dialog, default hide
function addDerivePropertyDialog(){
	
	var self = this;

	if($('#derive_property_dialog').length != 0)
		return;

	// var dialoghtml = '<div id="derive_property_dialog" title="Define Derived Property" hidden="hidden"><div><span style="display:inline;"><input id="deriveproperty_name_input" style="width:30%;"></input></span>=<span style="display:inline;"><input id="deriveproperty_definition_input" style="width:60%;"></input></span></div><div class="innerdiv_dialog"><span style="font-size:12px">Properties<br></span><div id="deriveproperty_propertydiv" ></div></div><div class="innerdiv_dialog"><span style="font-size:12px">Operators<br><span><div id="deriveproperty_operationdiv" ></div></div><div class="innerdiv_dialog"><span style="font-size:12px">Number<br><span><div id="deriveproperty_numberdiv" ></div></div><div class="innerdiv_dialog"><span style="font-size:12px">Character<br><span><div id="deriveproperty_chardiv" ></div></div></div>';
	
	var dialoghtml = '<div id="derive_property_dialog" title="Derive Attribute" hidden="hidden"><div><span style="display:inline;"><input id="deriveproperty_name_input" style="width:30%;"></input></span>=<span style="display:inline;"><input id="deriveproperty_definition_input" style="width:60%;"></input></span></div><div class="innerdiv_dialog"><span style="font-size:12px">Properties<br></span><div id="deriveproperty_propertydiv" ></div></div></div>';
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('property_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#derive_property_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
	    buttons: {
	        "Define": function() {
	        	self.defineProperty();
	            $(this).dialog("close");
	       	 },
	       	"Cancel": function(){
	       		$(this).dialog('close');
	       	}
    	}
	});

	$('#deriveproperty_definition_input').bind('input', function() { 
    	//console.log('current value ', $(this).val()); // get the current value of the input field.
	});
}

//add a scatterplot
function addScatterPlotDialog(){
	
	var self = this;

	if($('#scatterplot_dialog').length != 0)
		return;
	
	var dialoghtml = '<div id="scatterplot_dialog" title="Define Scatter Plot" hidden="hidden"><div><span style="display:inline;" id="scatterplot_x_input">X Property: </span><div class="innerdiv_dialog" id="scatterplot_xdiv"></div><span style="display:inline;" id="scatterplot_y_input">Y Property: </span><div class="innerdiv_dialog" id="scatterplot_ydiv"></div></div>';
	var compiled = _.template(dialoghtml);

	testDiv = document.getElementById('property_p');
	
	testDiv.innerHTML = testDiv.innerHTML + compiled({});	

	$("#scatterplot_dialog" ).dialog({
		autoOpen: false,
		dialogClass: 'background_panel',
	    buttons: {
	        "Define": function() {
	        	self.createAScatterProperties();
	            $(this).dialog("close");
	       	 },
	       	"Cancel": function(){
	       		$(this).dialog('close');
	       	}
    	}
	});

	$('#deriveproperty_definition_input').bind('input', function() { 
    	//console.log('current value ', $(this).val()); // get the current value of the input field.
	});
}

function renameProperty(){
	//console.log('rename! ', g_renameProperty);
	//get the input value
	var nameInput = $('#propertyname_input');
	var newName = nameInput.val();
	//console.log('new name ', newName);

	//compute the width of label and dis div
	var prodiv = $(g_renameProperty).parents('.propertyrow');
	var iPropertyId = parseInt(prodiv.attr('propertyid'));
	var iSelectedGroupId = g_ObjectGroupManager.getSelectedGroupId();
	
	//update the property bag 
	renamePropertyOfGroup(iSelectedGroupId, iPropertyId, newName);

	//update inter
	g_InteractionRecorder.addRenamePropertyCount();
}

function renamePropertyOfGroup(iSelectedGroupId, iPropertyId, newName){
	var prodiv = $(g_renameProperty).parents('.propertyrow');
	var propertyBag = g_PropertyManager.getPropertyBag(iSelectedGroupId);
	propertyBag.setPropertyName(iPropertyId, newName);

	//change the out-looking
	g_renameProperty.innerText = newName;

	var font = '12px arial';
	var labelDivWidth, disDivWidth;
	var labelTextSize = getTextSize(g_renameProperty.innerText, font);
	var gapWidth = 15;
	var labelDisGap = 5;
	var labelDivWidth = labelTextSize['w'] + gapWidth;
	var disDivWidth = prodiv.width() - labelDivWidth - labelDisGap;

	// //console.log(' disDivwidth: ', disDivWidth, ' labelDivWidth ', labelDivWidth);
	
	/* 1. update label div */
	var labelDiv = $(g_renameProperty).parents('.propertylabel');
	labelDiv.width(labelDivWidth + 'px');

	/* 2. update the dis div */
	var disDiv = prodiv.children('.distri_div');
	disDiv.width(disDivWidth + 'px');

	/* 3. update the svg */
	var xAxisLength = disDivWidth;
	var svg = $('#dis_' + iPropertyId + ' svg');
	svg.attr('width', disDivWidth + 'px');

	var xScale = propertyBag.getXScaleOfPropertyId(iPropertyId);
	xScale.range([0, xAxisLength]);

	var disCountList = propertyBag.getDis(iPropertyId);

	var barWidth = xAxisLength/disCountList.length;
	var barRatio = 0.95;//0.8;

	//draw the background rect, hiddle initiately
	d3.selectAll('#dis_' + iPropertyId + ' .barrect')
	.attr('x', function(d, i){
		return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
	})
	.attr('width', function(){
		return barWidth * barRatio;
	});

	d3.selectAll('#dis_' + iPropertyId + ' .filter_barrect')
	.attr('x', function(d, i){
		return (xScale(i) + xScale(i + 1)) * 0.5 - barWidth * barRatio * 0.5;
	})
	.attr('width', function(){
		return barWidth * barRatio;
	});
}

function defineProperty(){
	
	var iSelectedGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iSelectedGroupId);

	//get the new property name & definition
	var propertyName = $("#deriveproperty_name_input")[0].value;
	var propertyDefinition = $("#deriveproperty_definition_input")[0].value;

	//console.log(" Define Property: ", propertyName, ' = ', propertyDefinition);

	//parse the new property, compute and add the new property
	var iPropertyId = g_PropertyManager.createADerivedProperty(iSelectedGroupId, propertyName, propertyDefinition);
	
	if(iPropertyId == -1){
		$("#deriveproperty_name_input")[0].value = "";
		$("#deriveproperty_definition_input")[0].value = "";
		return;
	}

	//set the filtered eleids
	var liFilteredEleId = g_CrossFilterInfo.getFilterEleIds();
	//console.log(' iPropertyId ' , iPropertyId, ' liFiltered EleId ', liFilteredEleId);
	propertyBag.setFilterEldIds(liFilteredEleId);

	//add the new property 
	var containerdiv = 'property_p';
	var compoundindex = propertyBag.getCompoundIndexofProperty(iPropertyId);
		
	if(g_ObjectGroupManager.isSelectedGroupTypeCompound())//{} .getSelectedGroupType() == 'compound')
		containerdiv = 'proset_' + compoundindex;
	//console.log(' compound index ', containerdiv);
	//check if the property is in propertyset
	self.drawProperty(iPropertyId, containerdiv);

	//set the value of input to empty
	$("#deriveproperty_name_input")[0].value = "";
	$("#deriveproperty_definition_input")[0].value = "";

	g_InteractionRecorder.addDerivePropertyCount();
}

//draw buttons in property panel
function drawButtonsinPropertyPanel(){

	//add derive proerty dialog
	addDerivePropertyDialog();
	addScatterPlotDialog();

	//clear button group
	$('#property_top_buttongroup').remove();

	//select the titlebar div
	var titleDiv = $('#property_p_div .titlebar');

	// add the buttons
	var buttonNameList = ['Create', 'Derive', '2D']; 

	var buttongrouphtml = '<div class="btn-group header_footer_buttongroup" role="group" id=<%=btngroupid%> aria-label="..."><button type="button" class="btn btn-warning btn-xs function_button" id=<%=createButtonId%> value=<%=createButtonName%> >Create</button><button type="button" class="btn btn-warning btn-xs function_button" id=<%=deriveButtonId%> value=<%=deriveButtonName%> >Derive</button><button type="button" class="btn btn-warning btn-xs function_button" id=<%=scatterButtonId%> value=<%=scatterButtonName%> >2D</button><div class="btn-group dropdown dropdown-scroll" role="group"><button id="add_property_button" type="button" class="btn btn-warning btn-xs function_button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Add<span class="caret"></span></button><ul class="dropdown-menu" id="invisible_property_menu"></ul></div></div>';
	var compiled = _.template(buttongrouphtml);
	titleDiv.html(titleDiv.html() + compiled({
		btngroupid: self.m_ButtonGroupId, 
		createButtonId: 'pg_' + buttonNameList[0],
		createButtonName: buttonNameList[0],
		deriveButtonId: 'pg_' + buttonNameList[1],
		deriveButtonName: buttonNameList[1],
		scatterButtonId: 'pg_' + buttonNameList[2],
		scatterButtonName: buttonNameList[2]
	}));

	$('#pg_' + buttonNameList[0]).click(function(event){
		self.clickPropertyButton(this.value);		
	});

	$('#pg_' + buttonNameList[1]).click(function(event){
		self.clickPropertyButton(this.value);
	});

	$('#pg_' + buttonNameList[2]).click(function(event){
		self.clickPropertyButton(this.value);
	});

	$('#add_property_button').on('click', function(){

		if($('#invisible_property_menu')[0].style.display == 'none' || $('#invisible_property_menu')[0].style.display == "")
			$('#invisible_property_menu').css({
				display: 'block'
			});
		else
			$('#invisible_property_menu').css({
				display: 'none'
			});
	})

	$('#invisible_property_menu').on('click', 'li', function(e){
		var propertyId = parseInt($(this).attr('propertyid'));
		//console.log(' click ', propertyId);
   		$(this).remove();
   		//make group visible
   		var iGroupId = g_ObjectGroupManager.getSelectedGroupId();
   		var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);
   		propertyBag.setPropertyVisible(propertyId, true);

   		var containerdiv = 'property_p';
   		var compoundindex = propertyBag.getCompoundIndexofProperty(propertyId);
   		
   		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()) //.getSelectedGroupType() == 'compound')
   			containerdiv = 'proset_' + compoundindex;
   		//console.log(' compound index ', containerdiv);
   		//check if the property is in propertyset

   		self.drawProperty(propertyId, containerdiv);

		//check the property-add-button
		if(propertyBag.getInVisiblePropertyIds().length > 0){
			// //console.log(' invisible = true ');
			$('#add_property_button').removeClass('alpha-3');
		}else{
			// //console.log(' invisible = false ');
			$('#add_property_button').addClass('alpha-3');
		}
		$('#invisible_property_menu').css({
				display: 'none'
		});
	});

	$('#invisible_property_menu').on('mouseenter', 'li', function(e){
		//console.log(" mouse enter property list ");
		var propertyId = parseInt($(this).attr('propertyid'));
		$('#pro_li_'+propertyId).addClass('background-highlight cursor-pointer');
	});

	$('#invisible_property_menu').on('mouseout', 'li', function(e){
		//console.log(" mouse leave property list ");
		var propertyId = parseInt($(this).attr('propertyid'));
		$('#pro_li_'+propertyId).removeClass('background-highlight cursor-pointer');
	});

	//init the 'add' button to semitrans
	$('#add_property_button').addClass('alpha-3');
}

function getCreateObjectButtonName(iNum){
	return iNum + ": Create";
}

//feedback to the button click
function clickPropertyButton(buttonName){
	
	switch(buttonName){
		case 'Create':
			createANewPGroup();
			break;
		case 'Derive':
		//TODO
			deriveNewProperty();
			break;
		case '2D':
		//TODO
			defineScatterPlot();
			break;
		default:
			break;
	}
}

//callback of 'Create' button clicked
function createANewPGroup(){
	//console.log(" create property object ");

	//get current eleids
	var liEleId = [];
	var attrs = {};

	//get current group
	if(g_ObjectGroupManager.getSelectedGroupType() == 'origin'){//g_ObjectGroupManager.isSelectedGroupTypeCompound() == false){
		attrs['type'] = 'origin';//'propertygroup';
		attrs['value'] = 'origin';
		liEleId = g_CrossFilterInfo.getFilterEleIds();
	}else if(g_ObjectGroupManager.getSelectedGroupType() == 'logic'){
		attrs['type'] = 'logic';//'propertygroup';
		attrs['value'] = 'logic';
		liEleId = g_CrossFilterInfo.getFilterEleIds();	
	}else if(g_ObjectGroupManager.getSelectedGroupType() == 'compound'|| g_ObjectGroupManager.getSelectedGroupType() == 'default_compound'){
		attrs['type'] =  'compound';
		attrs['value'] = 'compound';	
		liEleId = g_CrossFilterInfo.getFilterEleIds();
		liEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liEleId);
		var liGroupId = [];
		for (var i = 0; i < liEleId.length; i++) {
			var liId = liEleId[i];
			var iGroupId = g_ElementProperties.getEleGroupIdbyEleIds(liId);
			liGroupId.push(iGroupId);
		};
		liEleId = liGroupId;
	}else if(g_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
		attrs['type'] = 'logic_compound';
		attrs['value'] = 'logic_compound';
		liEleId = g_CrossFilterInfo.getFilterEleIds();
		liEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liEleId);
		var liGroupId = [];
		for (var i = 0; i < liEleId.length; i++) {
			var liId = liEleId[i];
			var iGroupId = g_ElementProperties.getEleGroupIdbyEleIds(liId);
			liGroupId.push(iGroupId);
		};
		liEleId = liGroupId;
	}
	attrs['name'] = 'group';

	//console.log(' create a Group ', attrs['type'], ' ele list ', liEleId.length);

	//create the new group
	g_ObjectGroupManager.addNewGroup(liEleId, attrs);
	//update the button part in the object panel
	drawObjectButtons();
}

//callback of 'derive ' button click
function deriveNewProperty(){
	//console.log(' derive new property');

	//draw object buttons in the dialog
	drawPropertiesInDeriveDialog();

	$('#derive_property_dialog').dialog('open');
}

function defineScatterPlot(){

	drawPropretiesInScatterPlotDialog();
	$('#scatterplot_dialog').dialog('open');
}

function createAScatterProperties(){

	g_InteractionRecorder.addHybridPropertyCount();

	//get the defined scatter plot
	var iXPropertyId, iYPropertyId;
	var iSelectedGroupId = g_ObjectGroupManager.getSelectedGroupId();
	var propertyBag = g_PropertyManager.getPropertyBag(iSelectedGroupId);

	//console.log(' XXXX: ', $('#scatterplot_x_input')[0].propertyUniValue, 'x', $('#scatterplot_y_input')[0].propertyUniValue);

 	iXPropertyId = propertyBag.getPropertyIdbyUniqName($('#scatterplot_x_input')[0].propertyUniValue);
 	iYPropertyId = propertyBag.getPropertyIdbyUniqName($('#scatterplot_y_input')[0].propertyUniValue);
	var xPropertyType = propertyBag.getPropertyTypebyId(iXPropertyId), yPropertyType = propertyBag.getPropertyTypebyId(iYPropertyId);
 	var xPropertyName = propertyBag.getPropertyNamebyId(iXPropertyId), yPropertyName = propertyBag.getPropertyNamebyId(iYPropertyId);

 	var iScatterPlotId = g_PropertyManager.createAScatterPlot(iSelectedGroupId, iXPropertyId, iYPropertyId);

 	//default width	
	var labelDivWidth = '20%';//labelTextSize['w'] + gapWidth;
 	var disDivWidth = '80%';//prodiv.width() - labelDivWidth - labelDisGap;

 	//add a div
 	var SPID = iScatterPlotId;//'scatterplot_' + iScatterPlotId;

 	var div = d3.select("#scatterplot_property_p").append("div");

	// var div = document.getElementById('scatterplot_property_p');	
	var tplhtml = '<div class="scatter_plot_row" id=<%=scatterplotrowdivId%> scatterplotId=<%=iScatterPlotId%>><div class = "scatter_plot_label_div" style="float: left; position: relative; width: <%=labelDivWidth%>;  height: 100%; " ></div><div class = "scatter_plot_dis_div" style="float: right; position: relative; width: <%=disDivWidth%>;  height: 100%; border: solid 1px #d9d9d9;" ><svg style="width: 100%; height: 100%;" id=<%=svgID%>></svg></div></div>';
	var compiled = _.template(tplhtml);
	// div.innerHTML = div.innerHTML + compiled({
	// 	iScatterPlotId: iScatterPlotId,
	// 	svgID: 'scatterplot_' + SPID,
	// 	scatterplotrowdivId: 'scatter_plot_div_' + SPID,
	// 	labelDivWidth: labelDivWidth,
	// 	disDivWidth, disDivWidth,
	// });
	div.html(function(d){
		return compiled({
			iScatterPlotId: iScatterPlotId,
			svgID: 'scatterplot_' + SPID,
			scatterplotrowdivId: 'scatter_plot_div_' + SPID,
			labelDivWidth: labelDivWidth,
			disDivWidth: disDivWidth,
		})
	});


	//update the width
	var font = '12px arial';
	var labelDivWidth, disDivWidth;
	var xLabel = 'X: ' + xPropertyName, yLabel = 'Y: ' + yPropertyName;
	var propertyName = xLabel.length>yLabel.length?xLabel:yLabel;
	var labelTextSize = getTextSize(propertyName, font);
	var gapWidth = 15;
	var labelDisGap = 5;

	div = $('#scatter_plot_div_' + SPID);

	var labelDivWidth = labelTextSize['w'] + gapWidth;
 	var disDivWidth = div.width() - labelDivWidth - labelDisGap;

 	div.find('.scatter_plot_label_div').width(labelDivWidth + 'px');
 	div.find('.scatter_plot_dis_div').width(disDivWidth + 'px');

 	//add x label
 	var label_div = div.find('.scatter_plot_label_div');
	var x_labelhtml = '<div class="propertylabel scatterplot_label" value=<%=propertyType%>  style="position:relative; width:100%" ><span class="propertyspan scatter_plot_label_span"><i class="fa fa-times delete_property_icon hidden" id=<%=deletebuttonid%> ></i><p><%=xPropertyLabel%></p><p><%=yPropertyLabel%></p></span></div>';
	//
	var compile_labelhtml = _.template(x_labelhtml);
    x_labelhtml = compile_labelhtml({
		propertyType: xPropertyType,
		propertyName: propertyName,
		xPropertyLabel: xLabel,
		yPropertyLabel: yLabel,
		deletebuttonid: 'deletebutton_' + SPID,
	});
	label_div.html(label_div.html() + x_labelhtml);

	//click event
	 $('.scatter_plot_label_span').bind('click', function(){
    	//console.log(" mouse click ");
    	//release the brush	    	
		var prodiv = $(this).parents('.scatter_plot_row');
		var iSPId = parseInt(prodiv.attr('scatterplotId'));
		//console.log(" iSPID = ", iSPId);
		releaseSPFilter(iSPId);

		var liFilterEleId = g_CrossFilterInfo.getFilterEleIds();
		var eleNum = liFilterEleId.length;

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
			var liCompoundEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
			//console.log(" 2 click ", liCompoundEleId.length);
			eleNum = liCompoundEleId.length;
		}
		$('#' + self.m_CreateButtonId).text(self.getCreateObjectButtonName(eleNum));
    });

	//add the scatter plot
	//console.log(" create scatter plot ");
	var spConfig = propertyBag.getScatterPlotConfig(iScatterPlotId);
	var mapValueList = propertyBag.getScatterPlotDis(iScatterPlotId);

	//get the max value
	var liValue = [];
	for (var i = 0; i < mapValueList.length; i++) {
		var mapValue = mapValueList[i];
		var value = mapValue['count'];
		liValue.push(value);
	};
	var iMinValue = _.min(liValue), iMaxValue = _.max(liValue);
	// var beginColor = d3.rgb('#f0f0f0'), endColor = d3.rgb('#808080');
	// var computeColor = d3.interpolate(beginColor,endColor);

	var xAxisLength = $('#scatterplot_' + SPID).width();
	var yAxisLength = $('#scatterplot_' + SPID).height();
	var rectWidth = 1. * xAxisLength/(spConfig.ixBinNum);
	var rectHeight = 1. * yAxisLength/(spConfig.iyBinNum);

	// //console.log(' propertyType ', xPropertyType, ' , ', yPropertyType);
	var xWidthScale = d3.scale.linear()
					.domain([0, iMaxValue])
					.range([0, 1]);

	var xScale = d3.scale.linear()
				.domain([0, spConfig.ixBinNum])
				.range([0, xAxisLength]);
	var yScale = d3.scale.linear()
				.domain([0, spConfig.iyBinNum])
				.range([yAxisLength * 0.3, yAxisLength]);
				// .range([0, yAxisLength]);

	propertyBag.setSPSizeScale(iScatterPlotId, xScale, yScale, xWidthScale);

	//console.log(' scatter plot id ', '#' + SPID);


	// var gSel = d3.select("#scatterplot_"+SPID);

	// var groups = gSel.selectAll("g.scatterplot_filter_group")
	// 	.data(mapValueList,function(d){
	// 		return d.index;
	// 	})

	// var enter = groups.enter().append("g")
	// 	.attr("class","scatterplot_filter_group");

	// enter.append("rect");
	// enter.append("title");

	// groups.select("rect").attr("x","")
	// groups.select("title").attr("text",)

	// groups.exit().remove();




	var groups = d3.select('#scatterplot_' + SPID)
	.selectAll('g')
	.data(mapValueList,function(d){
		return d.index
	})
	.enter()
	.append('g')
	.attr('class', 'scatterplot_filter_group');

	// groups.append('rect')
	// .attr('class', 'scatter_plot_bar')
	// .attr('width', function(d){
	// 	var value = d['count'];
	// 	return rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value) + 'px';
	// 	// return rectWidth + 'px';
	// })
	// .attr('height', function(){
	// 	return rectHeight + 'px';
	// })
	// .attr('x', function(d){
	// 	var iIndex = d['index'];
	// 	var value = d['count'];
	// 	var xyIndex = spConfig.getXYIndex(iIndex);
	// 	var barwidth = rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value);
	// 	// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
	// 	return xScale(xyIndex.x) + rectWidth/2. - barwidth/2. + 'px';
	// })
	// .attr('y', function(d){
	// 	var iIndex = d['index'];
	// 	var xyIndex = spConfig.getXYIndex(iIndex);
	// 	if(xyIndex.y == 0)
	// 		return "0px";

	// 	return yScale(xyIndex.y) - rectHeight + 'px';
	// })
	groups.append('circle')
	.attr('class', 'scatter_plot_bar')
	.attr('r', function(d){
		var value = d['count'];
		return (rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value)) * 0.5 + 'px';
		// return rectWidth + 'px';
	})
	// .attr('height', function(){
	// 	return rectHeight + 'px';
	// })
	.attr('cx', function(d){
		var iIndex = d['index'];
		var value = d['count'];
		var xyIndex = spConfig.getXYIndex(iIndex);
		var barwidth = rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value);
		// //console.log(" x ", xyIndex.x, ' , ', xScale(xyIndex.x) - rectWidth/2.);
		return xScale(xyIndex.x) + rectWidth/2. - barwidth/2. - (rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value)) * 0.5 + 'px';
	})
	.attr('cy', function(d){
		var iIndex = d['index'];
		var xyIndex = spConfig.getXYIndex(iIndex);
		if(xyIndex.y == 0)
			return "0px";

		return yScale(xyIndex.y) - rectHeight - (rectWidth * 0.3 + rectWidth * 0.7 * xWidthScale(value)) * 0.5 + 'px';
	})
	.style('fill', function(d){		
		var iIndex = d['index'];
		if(colorTypeStr.indexOf(xPropertyType) >= 0){
			//x is the color
			var xyIndex = spConfig.getXYIndex(iIndex);
			//console.log(' color x ', propertyBag.getBinValue(iXPropertyId, xyIndex.x));
			return propertyBag.getBinValue(iXPropertyId, xyIndex.x);
		}

		if(colorTypeStr.indexOf(yPropertyType) >= 0){
			//y is the color			
			var xyIndex = spConfig.getXYIndex(iIndex);
			//console.log(' color y ', propertyBag.getBinValue(iYPropertyId, xyIndex.y));
			return propertyBag.getBinValue(iYPropertyId, xyIndex.y);
		}
		return '#808080';
		// return computeColor(xColorScale(value));
	})
	.style('stroke', '#bdbdbd')
	.style('stroke-width', '0.5px');

	//hover 
    $('.scatterplot_label').mouseover(function(event){		
		// //console.log('Mouse Enter');
		$(this).find('.delete_property_icon').removeClass('hidden');		
	}); 
	$('.scatterplot_label').bind('mouseout', function(){
		// //console.log('Mouse Out');
		$(this).find('.delete_property_icon').addClass('hidden');
	});

	$('.delete_property_icon').click(function(event){
		//console.log(" delete button clicked ");
		event.stopPropagation();
		var sScatterPlotId = $(this).parents('.scatter_plot_row').attr('scatterplotId');
		//console.log(' scatter plot id ', sScatterPlotId);
		var iScatterPlotId = parseInt(sScatterPlotId);
		//console.log('[2] ', iScatterPlotId);
		self.deleteScatterPlot(iScatterPlotId);
	});

	//brush
	var brush = d3.svg.brush()
    .x(d3.scale.identity().domain([0, xAxisLength]))
    .y(d3.scale.identity().domain([0, yAxisLength]))
    .extent([[-1, -1], [-1, -1]])
    .on("brush", duringBrush);

    var gBrush = d3.select('#scatterplot_' + SPID)
    .append('g')
    .attr("class", "brush")
    .call(brush);

    gBrush.selectAll('.brush rect')
    .attr('fill', 'gray')
    .attr('opacity', function(){
    	return 0.2;
    })
    .attr('stroke', 'black');

    var markerGroup = gBrush.append('g')
    .attr('class', 'marker_group');

   	var font = '12px arial';
	//left
	var textMarker = markerGroup.append('g')
	.attr('class', 'marker_sp hidden')
	.attr('transform', function(){		
		var left = parseInt(d3.select('#scatterplot_' + SPID + ' .extent').attr('x'));
		left += parseInt(d3.select('#scatterplot_' + SPID + ' .extent').attr('width'));
		var top = 0;
		return 'translate(' + left + ',' +  top + ')';
	});

	textMarker.append('text')
	.attr('class', 'text-center sp_xmarker')
	.style('font', font)
	.style('color', 'black');

	textMarker.append('text')
	.attr('class', 'text-center sp_ymarker')
	.style('y', function(){		
		return 0;
	})
	.style('font', font)
	.style('color', 'black');
 //    function brushended() {
	// 	// var extentRange = brush.extent();
	// 	// var adjustExtentRange = [Math.floor(extentRange[0]), Math.floor(extentRange[1])];		
	// 	// //console.log('adjust brush ', adjustExtentRange);//获取刷子边界范围所对应的输入值
	// }

    function duringBrush(){		

		var extentRange = brush.extent();
		// //console.log(" during brush ", extentRange[0], ', ', extentRange[1]);

		var xExtentRange = [Math.floor(xScale.invert(extentRange[0][0])), Math.floor(xScale.invert(extentRange[1][0]))];
		var yExtentRange = [Math.floor(yScale.invert(extentRange[0][1])), Math.floor(yScale.invert(extentRange[1][1]))];

		// //console.log(' x range ', xExtentRange);
		// //console.log(' y range ', yExtentRange);

		//update the text marker
		var textmarker = d3.selectAll('#scatterplot_' + SPID+ ' .marker_sp')
		.classed('hidden', false)
		.attr('transform', function(){
			var left = parseInt(d3.select('#scatterplot_' + SPID + ' .extent').attr('x'));
			left += parseInt(d3.select('#scatterplot_' + SPID + ' .extent').attr('width'));
			var rect = d3.select('#scatterplot_' + SPID + ' .extent')[0];
			var top = parseInt(rect[0].getAttribute('y'));
			//console.log(' top ', top);
			return 'translate(' + left + ',' +  top + ')';
		});

		textmarker.selectAll('text .sp_xmarker')
		.text('x: ' + xExtentRange[0] + '~' + xExtentRange[1]);

		textmarker.selectAll('text .sp_ymarker')
		.text('y: ' + yExtentRange[0] + '~' + yExtentRange[1])
		.style('y', function(){		
			// return 0;				
			var rect = d3.select('#scatterplot_' + SPID + ' .extent')[0];
			// var top = parseInt(rect[0].getAttribute('y'));
			//console.log(" height ",  parseInt(rect[0].getAttribute('height')));
			return parseInt(rect[0].getAttribute('height'));
			// return parseInt(d3.select('#scatterplot_' + sPID + '.extent')).attr('height');	
		});

		//update the bars
		d3.selectAll('#scatterplot_' + SPID+ ' .scatter_plot_bar')
		.filter(function(d, i){
			var iIndex = d['index'];
			// //console.log(" sp config" , spConfig);
			var iXYIndex = spConfig.getXYIndex(iIndex); 
			var iXIndex = iXYIndex.x;
			var iYIndex = iXYIndex.y;
			if(iXIndex >= xExtentRange[0] && iXIndex <= xExtentRange[1] && iYIndex >= yExtentRange[0] && iYIndex <= yExtentRange[1])
				return false;
			return true;
		})			
		.style('stroke', '#bdbdbd')
		.style('stroke-width', '0.5px')
		.style('opacity', 0.3);

		var rectCount = 0;

		d3.selectAll('#scatterplot_' + SPID+ ' .scatter_plot_bar')
		.filter(function(d, i){
			var iIndex = d['index'];
			// //console.log(" sp config" , spConfig);
			var iXYIndex = spConfig.getXYIndex(iIndex); 
			var iXIndex = iXYIndex.x;
			var iYIndex = iXYIndex.y;
			if(iXIndex >= xExtentRange[0] && iXIndex <= xExtentRange[1] && iYIndex >= yExtentRange[0] && iYIndex <= yExtentRange[1]){
				rectCount += 1;
				return true;
			}
			return false;
		})		
		.style('stroke', 'black')
		.style('stroke-width', '2px')
		.style('opacity', 1.);	

		// //console.log(" Count = ", rectCount);
		var liSelectedEleId = [];

		var groupType = g_ObjectGroupManager.getSelectedGroupType();
		//compute thte selected ele if necessary
		var liXSelectIndexRange = [];
		liXSelectIndexRange.push(xExtentRange);
		var liXSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(spConfig.ixPropertyId, liXSelectIndexRange);

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){
			//change to elegroupid
			var liNewEleGroupId = [];
			for (var i = 0; i < liXSelectedEleId.length; i++) {
				var iXSelectedEleId = liXSelectedEleId[i];
				var iEleGroupId = g_ElementProperties.getEleGroupIdwithEleId(iXSelectedEleId);
				liNewEleGroupId.push(iEleGroupId);
			};
			liXSelectedEleId = liNewEleGroupId;
		}

		// //console.log('after liXSelectedEleId ', liXSelectedEleId);

		//extent to the group ele id

		var liYSelectIndexRange = [];
		liYSelectIndexRange.push(yExtentRange);
		var liYSelectedEleId = propertyBag.getEleIdsbyPropertyIndexRangeList(spConfig.iyPropertyId, liYSelectIndexRange);

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){
			//change to the elegroupid
			var liNewEleGroupId = [];
			for (var i = 0; i < liYSelectedEleId.length; i++) {
				var iYSelectedEleId = liYSelectedEleId[i];
				var iEleGroupId = g_ElementProperties.getEleGroupIdwithEleId(iYSelectedEleId);
				liNewEleGroupId.push(iEleGroupId);
			};
			liYSelectedEleId = liNewEleGroupId;
		}
		// //console.log('before liYSelectedEleId ', liYSelectedEleId);
	
		//compute the intersection
		for (var i = 0; i < liXSelectedEleId.length; i++) {
			var iTempEleid = liXSelectedEleId[i];
			if(liYSelectedEleId.indexOf(iTempEleid) >= 0)
				liSelectedEleId.push(iTempEleid);
		};

		// //console.log(" intersection group eleids ", liSelectedEleId.length);

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){
			//change back to the ele ids
			var liNewEleId = [];
			for (var i = 0; i < liSelectedEleId.length; i++) {
				var iSelectedGroupEleId = liSelectedEleId[i];
				var liEleId = g_ElementProperties.getElementIdsofEleGroup(iSelectedGroupEleId);
				liNewEleId = liNewEleId.concat(liEleId);
			};
			liSelectedEleId = liNewEleId;
			// //console.log(" Filtered EleIds ", liNewEleId.length);
		}
		
		// liSelectedEleId = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liSelectedEleId);
		
		//sort

		// //console.log(" liSElected !!! ", liSelectedEleId, ' x ', liXSelectedEleId, ' y ', liXSelectedEleId);

		// //console.log(" Extend Reange ", adjustExtentRange, ' xx ', xx, ' selected ele id ', liSelectedEleId.length);	

		//notify the cross-filter with selected property range
		g_CrossFilterInfo.setFilterEleIdsofScatterPlotId(SPID, liSelectedEleId);

		//update the object_create_button
		var liFilterEleId = g_CrossFilterInfo.getFilterEleIds();

		// //console.log(' lifilter 1111 ', liFilterEleId);

		var eleNum = liFilterEleId.length;

		if(g_ObjectGroupManager.isSelectedGroupTypeCompound()){// .getSelectedGroupType() == 'compound'){
			//the compound ele
			var liCompoundEleIds = g_ObjectGroupManager.sortToCompoundEleIdLists(g_ObjectGroupManager.getSelectedGroupId(), liFilterEleId);
			eleNum = liCompoundEleIds.length;
		}

		$('#pg_Create').text(getCreateObjectButtonName(eleNum));	

		updateFilteredRects();
	}
}

//basic function
function drawPropertySpansInDiv(parentDivId, propertySpanClass){
	//draw origin groups
	var prodiv = $('#' + parentDivId); 

	if(prodiv.length == 0){
		//prodiv unexist
		alert('pro div unexist ', parentDivId);
	}

	var iSelectGroupId = g_ObjectGroupManager.getSelectedGroupId();  

	if(iSelectGroupId == -1)
		return;

	var propertyBag = g_PropertyManager.getPropertyBag(iSelectGroupId);
	var liPropertyId = propertyBag.getVisiblePropertyIds();

	//console.log(" liVible Property Id ", parentDivId, ' , ' , liPropertyId);

	$.each(liPropertyId, function(i, iPropertyId){
		var propertyName = propertyBag.getPropertyNamebyId(iPropertyId);
		var propertyUniqName = propertyBag.getPropertyUniqNamebyId(iPropertyId);
		var propertyType = propertyBag.getPropertyTypebyId(iPropertyId);		
		
		var labelhtml = '<span class="<%=propertySpanClass%> span_inline cursor-pointer" value=<%=propertyType%> name=<%=propertyName%> uniqvalue=<%=propertyUniqName%> ><div class = "propertylabel_object" style="position:relative" ><span class="propertyspan"><%=propertyName%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
	    labelhtml = compile_labelhtml({
	    	propertySpanClass: propertySpanClass,
			propertyType: propertyType,
			propertyName: propertyName + ': ' + propertyUniqName,
			propertyUniqName: propertyUniqName,
			// labelDivWidth: labelDivWidth + 'px',
		});
		prodiv.html(prodiv.html() + labelhtml);	
	});
}

function drawPropertiesInDeriveDialog(){
	
	//clear the buttons
	$('.property_derive_span').remove();

	//get property
	var iSelectGroupId = g_ObjectGroupManager.getSelectedGroupId();     
	
	if(iSelectGroupId == -1) return;

	//draw origin groups
	drawPropertySpansInDiv('deriveproperty_propertydiv', 'property_derive_span');
	/*
	var prodiv = $('#deriveproperty_propertydiv'); 
	$.each(liPropertyId, function(i, iPropertyId){
		var propertyName = propertyBag.getPropertyNamebyId(iPropertyId);
		var propertyUniqName = propertyBag.getPropertyUniqNamebyId(iPropertyId);
		var propertyType = propertyBag.getPropertyTypebyId(iPropertyId);		
		
		var labelhtml = '<span class="property_derive_span span_inline cursor-pointer" value=<%=propertyType%> name=<%=propertyName%> uniqvalue=<%=propertyUniqName%> ><div class = "propertylabel_object" style="position:relative" ><span class="propertyspan"><%=propertyName%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
	    labelhtml = compile_labelhtml({
			propertyType: propertyType,
			propertyName: propertyName + ': ' + propertyUniqName,
			propertyUniqName: propertyUniqName,
			// labelDivWidth: labelDivWidth + 'px',
		});
		prodiv.html(prodiv.html() + labelhtml);	
	});
	*/

	//click event
	$(".property_derive_span").bind('click', function(){
		//console.log(" property derive span click ", this.getAttribute('uniqvalue'));
		$("#deriveproperty_definition_input")[0].value += this.getAttribute('uniqvalue');//this.getAttribute('name');
	    // $("#deriveproperty_definition_input")[0].definition = $("#deriveproperty_definition_input")[0].value;
		//console.log(' definition ', $("#deriveproperty_definition_input")[0].value);
	});
}

function drawPropretiesInScatterPlotDialog(){
	//clear
	$('#scatterplot_x_input')[0].textContent = 'X: ';
	$('#scatterplot_y_input')[0].textContent = 'Y: ';
	$('.property_scatterplot_x_span').remove();
	$('.property_scatterplot_y_span').remove();
		

	//get property
	var iSelectGroupId = g_ObjectGroupManager.getSelectedGroupId();     
	
	if(iSelectGroupId == -1) return;

	//draw origin groups
	drawPropertySpansInDiv('scatterplot_xdiv', 'property_scatterplot_x_span');
	drawPropertySpansInDiv('scatterplot_ydiv', 'property_scatterplot_y_span');

	$(".property_scatterplot_x_span").bind('click', function(){
		//console.log(" property derive span click ", this.getAttribute('value'));
		$("#scatterplot_x_input")[0].textContent = 'X: ' + this.getAttribute('value');//this.getAttribute('name');
		$("#scatterplot_x_input")[0].propertyUniValue = this.getAttribute('uniqvalue');
	    // $("#deriveproperty_definition_input")[0].definition = $("#deriveproperty_definition_input")[0].value;
		//console.log(' definition ', $("#scatterplot_x_input")[0].value);
	});
	$(".property_scatterplot_y_span").bind('click', function(){
		//console.log(" property derive span click ", this.getAttribute('vaue'));
		$("#scatterplot_y_input")[0].textContent = 'Y: ' + this.getAttribute('value');//this.getAttribute('name');
		$("#scatterplot_y_input")[0].propertyUniValue = this.getAttribute('uniqvalue');
	    // $("#deriveproperty_definition_input")[0].definition = $("#deriveproperty_definition_input")[0].value;
		//console.log(' definition ', $("#scatterplot_y_input")[0].value);
	});
}

function drawOperationInDeriveDialog(){
	$('.operation_derive_span').remove();

	var operationdiv = $('#deriveproperty_operationdiv');

	var operationList = g_PropertyManager.getPropertyFunctionList(); //['+', '-', 'X', '/', '(', ')'];

	$.each(operationList, function(i, operation){			
		var labelhtml = '<span class="operation_derive_span span_inline cursor-pointer" value=<%=Operation%> ><div class = "propertylabel_object" style="position:relative; background: rgb(255,0,0);" ><span><%=Operation%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
	    labelhtml = compile_labelhtml({
			Operation: operation,
			// labelDivWidth: labelDivWidth + 'px',
		});
		operationdiv.html(operationdiv.html() + labelhtml);	
	});	

	//click event
	$('.operation_derive_span').bind('click', function(){
		$("#deriveproperty_definition_input")[0].value += this.getAttribute('value');	
		//console.log(' equation', this.getAttribute('value'));		

		// if($("#deriveproperty_definition_input")[0].definition == undefined)	
		// 	$("#deriveproperty_definition_input")[0].definition = this.getAttribute('value');
		// else
		// 	$("#deriveproperty_definition_input")[0].definition += this.getAttribute('value');
		// //console.log(' definition ', $("#deriveproperty_definition_input")[0].definition);
	});
}

function drawNumberInDeriveDialog(){
// deriveproperty_numberdiv
	$('.number_derive_span').remove();

	var numberdiv = $('#deriveproperty_numberdiv');

	var numberList = g_PropertyManager.getNumberList(); 

	$.each(numberList, function(i, number){			
		var labelhtml = '<span class="number_derive_span span_inline cursor-pointer" value=<%=number%> ><div class = "propertylabel_object" style="position:relative; background: rgb(255,0,0);" ><span><%=number2%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
		var number2 = number;
		if(number == 'Math.PI')
			number2 = 'PI';
	    labelhtml = compile_labelhtml({
			number: number,
			number2: number2,
			// labelDivWidth: labelDivWidth + 'px',
		});
		numberdiv.html(numberdiv.html() + labelhtml);	
	});	

	//click event
	$('.number_derive_span').bind('click', function(){
		// //console.log(' operation_derive_span click ', this.getAttribute('value'));		
		$("#deriveproperty_definition_input")[0].value += this.getAttribute('value');	
		//console.log(' equation', $("#deriveproperty_definition_input")[0].value);		
		// if($("#deriveproperty_definition_input")[0].definition == undefined)	
		// 	$("#deriveproperty_definition_input")[0].definition = this.getAttribute('value');
		// else
		// 	$("#deriveproperty_definition_input")[0].definition += this.getAttribute('value');
		// //console.log(' definition ', $("#deriveproperty_definition_input")[0].definition);
	});
}


function drawCharsInDeriveDialog(){
// deriveproperty_numberdiv
	$('.char_derive_span').remove();

	var chardiv = $('#deriveproperty_chardiv');

	var beginChar = 'a', endChar = 'z';
	var Length = endChar.charCodeAt(0) - beginChar.charCodeAt(0) + 1;
	for (var i = 0; i < Length; i++) {
		var tempChar = String.fromCharCode(beginChar.charCodeAt(0) + i);
		var labelhtml = '<span class="char_derive_span span_inline cursor-pointer" value=<%=charactor%> ><div class = "propertylabel_object" style="position:relative; background: rgb(255,0,0);" ><span><%=charactor%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
		labelhtml = compile_labelhtml({
			charactor: tempChar,			
		});
		chardiv.html(chardiv.html() + labelhtml);	
	};
    beginChar = 'A', endChar = 'Z';
	Length = endChar.charCodeAt(0) - beginChar.charCodeAt(0) + 1;
	for (var i = 0; i < Length; i++) {
		var tempChar = String.fromCharCode(beginChar.charCodeAt(0) + i);
		var labelhtml = '<span class="char_derive_span span_inline cursor-pointer" value=<%=charactor%> ><div class = "propertylabel_object" style="position:relative; background: rgb(255,0,0);" ><span><%=charactor%></span></div></span>';
		var compile_labelhtml = _.template(labelhtml);
		labelhtml = compile_labelhtml({
			charactor: tempChar,			
		});
		chardiv.html(chardiv.html() + labelhtml);	
	};


	//click event
	$('.char_derive_span').bind('click', function(){
		// //console.log(' operation_derive_span click ', this.getAttribute('value'));		
		$("#deriveproperty_definition_input")[0].value += this.getAttribute('value');	
		//console.log(' equation', this.getAttribute('value'));		
		// if($("#deriveproperty_definition_input")[0].definition == undefined)	
		// 	$("#deriveproperty_definition_input")[0].definition = this.getAttribute('value');
		// else
		// 	$("#deriveproperty_definition_input")[0].definition += this.getAttribute('value');
		// //console.log(' definition ', $("#deriveproperty_definition_input")[0].definition);
	});
}
