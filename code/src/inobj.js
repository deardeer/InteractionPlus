/*
	InObj: class of the interactions in a rect
*/

function InObj(iId, bMask, maskType){

	var Info = {};
	Info.m_iId = -1;
	Info.m_bMask = bMask;
	Info.m_Render = {};

	Info.__init__ = function(iId, bMask, maskType){
		//console.log(" init InObj", iId);
		this.m_iId = iId;
		this.m_bMask = bMask;
		this.m_Rect = {};
		this.m_Render = new InObjRender(this.m_iId, this);
		//console.log(" mask !! ", maskType);
		this.m_Mask = new InObjMask(this.m_iId, maskType, this);

		this.m_CurrentSelectGroupId = -1;
		this.m_CurrentDecodePropertyId = -1;

 		this.m_TempElementDetector = new ElementDetetor(-1);

 		this.m_iAnnotationNextId = 0;
	}

//~~~~~~~~~ API for drag selection rect~~~~~~~~~~~~//
 	//dragging the selection rect
 	Info.dragSelectRect = function(rect){

		this.m_Rect = rect;
 		this.m_Render.updateSelectRect(rect); 
 				
 		// var temp_grobalRect = this.m_Render.getSelectGlobalRect();

 		// var circleMask;
 		// if(g_ToolBarManager.isRadialMaskEnable() == true)
 		// 	circleMask = true;

 		//console.log(" m_mouseMove ", temp_grobalRect, g_ToolBarManager.isVMaskEnable());

 		//detect the temporal selected ele
 		// this.m_TempElementDetector.detectElement(temp_grobalRect, circleMask);
 		// //console.log("m_TempElementDetector ", temp_grobalRect, this.m_TempElementDetector.m_ElementProperties.getElementIds().length);
 	}

 	Info.finishSelectRect_GlobalAdaptive = function(){
 	
 		var circleMask;

 		if(g_ToolBarManager.isRadialMaskEnable() == true)
 			circleMask = true;

 		//render tool bar
 		this.m_Render.updateSelectRect({'x': 0, 'y': 0, 'width': 100 , 'height': 100})
 		this.m_Render.addToolBar();

 		//delete the elements and pros
 		this.m_ElementDetector = new ElementDetetor(this.m_iId);
 		// var globalRect = this.m_Render.getSelectGlobalRect();
 		var boundaryBox = this.m_ElementDetector.detectElement();
 		this.m_Render.updateSelectRect(boundaryBox)
 		console.log(" boundaryBoxboundaryBox ", boundaryBox);
	    //console.log(" wwww DETECT ", globalRect, this.m_Rect, circleMask, g_ToolBarManager.isRadialMaskEnable());
		
	    //fade unselected 
	    // fadeUndetected();
	    // // generate the original object groups	
	    // //console.log(" this.m_ElementDetector.m_ElementProperties ", this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager = new ObjectGroupManager(this.m_iId, this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager.generateOriginalOGroup();

	    //[1] analyze roles   
	    this.m_ObjectGroupManager.analyseRolesOfObjects();

	    //init 
	    this.m_PropertyManager = new PropertyManager(this.m_iId, this, this.m_ObjectGroupManager, this.m_ElementDetector);

	    //[2] analyze attributes
	    this.m_ObjectGroupManager.setSelectedGroupId(this.m_ObjectGroupManager.getDataGroupId()[0]);
	    this.m_ObjectGroupManager.setSelectedGroupIds(this.m_ObjectGroupManager.getDataGroupId());
	    var liInforPropertyName = this.m_PropertyManager.analyseAttributesOfGroups(this.m_ObjectGroupManager.getDataGroupId());
	    var layoutAnalysis = this.m_PropertyManager.analyseLayoutOfGroups(this.m_ObjectGroupManager.getDataGroupId());

	    if(this.m_bMask){
	    	config = this.computeConfigofEleIds();
	    	if(config['adjustrect'] == true){
	    		this.dragSelectRect(this.m_Rect);
	    	}
 			//compute the default mask
 			this.m_Mask.configure(this.m_Rect, config);
			this.m_Mask.renderMask();
 		} 	

		//reset the cross filter
	    this.m_CrossFilter = new CrossFilter(this.m_iId, this, this.m_ObjectGroupManager, this.m_PropertyManager);
	    this.m_CrossFilter.resetCrossFilter();

	    this.m_Render.setElementDetectorCrossFilter(this.m_ElementDetector, this.m_CrossFilter);
	    
 		this.m_Render.initHoverinSelectRect();

	    // //detect the default linked groups
	    // //generate "default_compound"
	    //g_ObjectGroupManager.detectDefaultLinkedGroups();
	    //console.log(" init [0] ");
	 	this.m_FilterRender = new InObjFilterRender(this.m_iId, this, this.m_ObjectGroupManager, this.m_PropertyManager);
	 	//console.log(" init [1] ");
	    this.m_FilterRender.addFilterPanel();  
	    //console.log(" init [2] ");
	    
	    //[3] integrate interactions
	    if(liInforPropertyName.indexOf('fill') != -1){
	    	d3.select('#filter_panel1').style('visibility', 'hidden')
	    	d3.select('#define_region_rect1').style('visibility', 'hidden')
	    	this.m_FilterRender.drawColorLegend(this.m_ObjectGroupManager.getDataGroupId(),
	    		{left: Number(boundaryBox.x) + Number(boundaryBox.width), top: Number(boundaryBox.y)});
		}		
	    if(this.m_ObjectGroupManager.getDataGroupId().length > 1){
	    	this.m_FilterRender.drawShapeLegend(this.m_ObjectGroupManager.getDataGroupId(),
	    		{left: Number(boundaryBox.x) + Number(boundaryBox.width), top: Number(boundaryBox.y)});
	    }
	    //[4] attribute brush
	    if(1){
	    	this.m_FilterRender.drawSizeLegend(this.m_ObjectGroupManager.getDataGroupId(),
	    		{left: Number(boundaryBox.x) + Number(boundaryBox.width), top: Number(boundaryBox.y)});
	    }

		// if(liInforPropertyName.indexOf('r') != -1){
		// 	this.m_FilterRender.drawSizeLegend(this.m_ObjectGroupManager.getDataGroupId(),
	 //    		{left: Number(boundaryBox.x) + Number(boundaryBox.width), top: Number(boundaryBox.y)});
		// }

		switch(layoutAnalysis){
			case 'linear':
				g_ToolBarManager.setLinearBrush();
				console.log(' Linear Enhancement ');			
				break
			case 'arc':
				console.log(' arc Enhancement ');
				break
			case 'hierarchy':
				console.log(' hierarchy Enhancement ');
				break
			case 'rank':
				console.log(' rank Enhancement ');
				break
			case 'other':
				console.log(' other Enhancement ');
				break
		}
		// if(layoutAnalysis == 'linear'){
		// 	//linear Axis
		// }
		// if(layoutAnalysis == 'arc'){
		// 	//todo
		// }
		// if(layoutAnalysis == 'hierarchy'){
		// 	//todo
		// }
		// if(layoutAnalysis == 'rank'){
		// 	//todo
		// }
		// if(layoutAnalysis == 'other'){
		// 	//todo
		// }

	    //filter setting info
	    this.m_FilterSettingInfo = new FilterSettingInfo(this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager);
		
		this.m_DialogRender = new InObjDialogRender(this, this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager, 
			this.m_CrossFilter, this.m_FilterSettingInfo);
		this.m_DialogRender.addDecodeDialog_step1();
		this.m_DialogRender.addDecodeDialog_Pos();
		this.m_DialogRender.addDecodeDialog_SizeRule();
		this.m_DialogRender.addDecodeDialog_Bound();
		this.m_DialogRender.addDecodeDialog_Legend();
		this.m_DialogRender.addProReNameDialog();
		this.m_DialogRender.addObjReNameDialog();
		this.m_DialogRender.addSubmitDialog();
		
		//logic composition
		this.m_LogicCompositionManager = new LogicCompositionManager(this.m_iId, this, this.m_ObjectGroupManager);
		this.m_LogicCompositionManager.addObjectCompositionDialog();

		//annotation 
		this.m_AnnotationDialog = new AnnotationDialog(this.m_iId, this);
		this.m_AnnotationDialog.addAnnotationDialog();
 	}

 	Info.finishSelectRect_Adaptive = function(){
 	
 		var circleMask;

 		if(g_ToolBarManager.isRadialMaskEnable() == true)
 			circleMask = true;

 		//render tool bar
 		this.m_Render.addToolBar();

 		//delete the elements and pros
 		this.m_ElementDetector = new ElementDetetor(this.m_iId);
 		var globalRect = this.m_Render.getSelectGlobalRect();
	    this.m_ElementDetector.detectElement(globalRect, circleMask);
	    //console.log(" wwww DETECT ", globalRect, this.m_Rect, circleMask, g_ToolBarManager.isRadialMaskEnable());
		
	    //fade unselected 
	    // fadeUndetected();
	    // // generate the original object groups	
	    // //console.log(" this.m_ElementDetector.m_ElementProperties ", this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager = new ObjectGroupManager(this.m_iId, this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager.generateOriginalOGroup();

	    //analyze roles
	    this.m_ObjectGroupManager.analyseRolesOfObjects();

	    //init 
	    this.m_PropertyManager = new PropertyManager(this.m_iId, this, this.m_ObjectGroupManager, this.m_ElementDetector);

	    //analyze attributes
	    this.m_ObjectGroupManager.setSelectedGroupId(this.m_ObjectGroupManager.getDataGroupId());
	    var liInforPropertyName = this.m_PropertyManager.analyseAttributesOfGroups(this.m_ObjectGroupManager.getDataGroupId());


	    if(this.m_bMask){
	    	config = this.computeConfigofEleIds();
	    	if(config['adjustrect'] == true){
	    		this.dragSelectRect(this.m_Rect);
	    	}
 			//compute the default mask
 			this.m_Mask.configure(this.m_Rect, config);
			this.m_Mask.renderMask();
 		} 	

		//reset the cross filter
	    this.m_CrossFilter = new CrossFilter(this.m_iId, this, this.m_ObjectGroupManager, this.m_PropertyManager);
	    this.m_CrossFilter.resetCrossFilter();

	    this.m_Render.setElementDetectorCrossFilter(this.m_ElementDetector, this.m_CrossFilter);
	    
 		this.m_Render.initHoverinSelectRect();

	    // //detect the default linked groups
	    // //generate "default_compound"
	    //g_ObjectGroupManager.detectDefaultLinkedGroups();
	    //console.log(" init [0] ");
	 	this.m_FilterRender = new InObjFilterRender(this.m_iId, this, this.m_ObjectGroupManager, this.m_PropertyManager);
	 	//console.log(" init [1] ");
	    this.m_FilterRender.addFilterPanel();  
	    //console.log(" init [2] ");
	    
	    //integrate interactions
	    if(liInforPropertyName.indexOf('fill') != -1){
	    	this.m_FilterRender.drawColorLegend(this.m_ObjectGroupManager.getDataGroupId());
		}

	    //filter setting info
	    this.m_FilterSettingInfo = new FilterSettingInfo(this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager);
		
		this.m_DialogRender = new InObjDialogRender(this, this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager, 
			this.m_CrossFilter, this.m_FilterSettingInfo);
		this.m_DialogRender.addDecodeDialog_step1();
		this.m_DialogRender.addDecodeDialog_Pos();
		this.m_DialogRender.addDecodeDialog_SizeRule();
		this.m_DialogRender.addDecodeDialog_Bound();
		this.m_DialogRender.addDecodeDialog_Legend();
		this.m_DialogRender.addProReNameDialog();
		this.m_DialogRender.addObjReNameDialog();
		this.m_DialogRender.addSubmitDialog();
		
		//logic composition
		this.m_LogicCompositionManager = new LogicCompositionManager(this.m_iId, this, this.m_ObjectGroupManager);
		this.m_LogicCompositionManager.addObjectCompositionDialog();

		//annotation 
		this.m_AnnotationDialog = new AnnotationDialog(this.m_iId, this);
		this.m_AnnotationDialog.addAnnotationDialog();
 	}

 	//finish dragging the selection
 	Info.finishSelectRect = function(){
 	
 		var circleMask;

 		if(g_ToolBarManager.isRadialMaskEnable() == true)
 			circleMask = true;

 		//render tool bar
 		this.m_Render.addToolBar();

 		//delete the elements and pros
 		this.m_ElementDetector = new ElementDetetor(this.m_iId);
 		var globalRect = this.m_Render.getSelectGlobalRect();
	    this.m_ElementDetector.detectElement(globalRect, circleMask);
	    //console.log(" wwww DETECT ", globalRect, this.m_Rect, circleMask, g_ToolBarManager.isRadialMaskEnable());

		
	    //fade unselected 
	    // fadeUndetected();
	    // // generate the original object groups	
	    // //console.log(" this.m_ElementDetector.m_ElementProperties ", this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager = new ObjectGroupManager(this.m_iId, this.m_ElementDetector.m_ElementProperties);
	    this.m_ObjectGroupManager.generateOriginalOGroup();

	    //init 
	    this.m_PropertyManager = new PropertyManager(this.m_iId, this, this.m_ObjectGroupManager, this.m_ElementDetector);

	    if(this.m_bMask){
	    	config = this.computeConfigofEleIds();
	    	if(config['adjustrect'] == true){
	    		this.dragSelectRect(this.m_Rect);
	    	}
 			//compute the default mask
 			this.m_Mask.configure(this.m_Rect, config);
			this.m_Mask.renderMask();
 		} 	

		//reset the cross filter
	    this.m_CrossFilter = new CrossFilter(this.m_iId, this, this.m_ObjectGroupManager, this.m_PropertyManager);
	    this.m_CrossFilter.resetCrossFilter();

	    this.m_Render.setElementDetectorCrossFilter(this.m_ElementDetector, this.m_CrossFilter);
	    
 		this.m_Render.initHoverinSelectRect();

	    // //detect the default linked groups
	    // //generate "default_compound"
	    //g_ObjectGroupManager.detectDefaultLinkedGroups();
	    //console.log(" init [0] ");
	 	this.m_FilterRender = new InObjFilterRender(this.m_iId, this, this.m_ObjectGroupManager);
	 	//console.log(" init [1] ");
	    this.m_FilterRender.addFilterPanel();  
	    //console.log(" init [2] ");

	    //filter setting info
	    this.m_FilterSettingInfo = new FilterSettingInfo(this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager);
		
		this.m_DialogRender = new InObjDialogRender(this, this.m_iId, this.m_ObjectGroupManager, this.m_PropertyManager, 
			this.m_CrossFilter, this.m_FilterSettingInfo);
		this.m_DialogRender.addDecodeDialog_step1();
		this.m_DialogRender.addDecodeDialog_Pos();
		this.m_DialogRender.addDecodeDialog_SizeRule();
		this.m_DialogRender.addDecodeDialog_Bound();
		this.m_DialogRender.addDecodeDialog_Legend();
		this.m_DialogRender.addProReNameDialog();
		this.m_DialogRender.addObjReNameDialog();
		this.m_DialogRender.addSubmitDialog();
		
		//logic composition
		this.m_LogicCompositionManager = new LogicCompositionManager(this.m_iId, this, this.m_ObjectGroupManager);
		this.m_LogicCompositionManager.addObjectCompositionDialog();

		//annotation 
		this.m_AnnotationDialog = new AnnotationDialog(this.m_iId, this);
		this.m_AnnotationDialog.addAnnotationDialog();
 	}

//~~~~~~~~~~~ API from filter panel ~~~~~~~~~~~~~~~//
	//feedback by clicking the annotation button
	Info.addAnnotation = function(bAnnotation, annotationText, annotationHighlight){
		var self = this;
		console.log(" annotation 2 ");
		self.m_Render.addAnnotation(bAnnotation, annotationText, self.m_iAnnotationNextId, annotationHighlight);
		self.m_iAnnotationNextId += 1;
	}

	//feedback by clicking a group button
	Info.clickGroupButton = function(iGroupId){

		var self = this;
		if(self.m_CurrentSelectGroupId == iGroupId){
			self.m_CurrentSelectGroupId = -1;
			//set the property panel invisible
			self.m_FilterRender.setPropertyPanelVisible(false);
			self.m_ObjectGroupManager.setSelectedGroupId(self.m_CurrentSelectGroupId);
			self.m_CrossFilter.clearFilterToWhole();
			return;
		}
		self.m_CurrentSelectGroupId = iGroupId;
		self.m_FilterRender.setPropertyPanelVisible(true);
		//console.log('click on group button', iGroupId);
		//remove current pros

		$(".currentpro").remove();
		$('.testrect').remove();

		//test: if clicking on the compound group
		var groupType = this.m_ObjectGroupManager.getGroupTypeofGroupId(iGroupId);

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
		this.m_ObjectGroupManager.setSelectedGroupId(iGroupId);
		//reset the filter
		this.m_CrossFilter.resetCrossFilter();
		this.m_CrossFilter.filterElebyGroup(iGroupId);	
		this.m_FilterRender.drawProperties(iGroupId);
		//upate the mask
		if(this.m_bMask){
			var liMaskEleId = this.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			this.m_Mask.setMaskEleIds(liMaskEleId, this.m_ElementDetector);
		}
	}

	//hover on the eleid 
	Info.hoverEleId = function(iHoveredEleId){
		var self = this;
		self.m_FilterRender.hoverEleId(iHoveredEleId);
	}

	//change the filter element id list
	Info.updateFilteredEleId = function(liFilterEleid){
		//update the mask
		if(this.m_bMask){
			this.m_Mask.updateFilteredMaskEleIds(liFilterEleid, this.m_ElementDetector);
		}
	}

	//click close button, delete the inobj
	Info.clickCloseButton = function(){
		var self = this;
		//remove overlays
		// self.clearOverlays();

		//TODO
		//remove define panel
		// self.clearDefinePanel();
		//remove the dialogs
		// self.clearDialogs();

		//remove filter panel related
		self.m_FilterRender.clearFilterRelated();
		self.m_Mask.clearMaskRelated();

		
		// self.clearFilterRelated();
		//remove the object group manager
		// g_ObjectGroupManager.clear();

		//recover the selected elems
		var liElementId = self.m_ElementDetector.m_ElementProperties.getElementIds();
		$.each(liElementId, function(i, id){
		    var ele = self.m_ElementDetector.m_ElementProperties.getElebyId(id);
		    ele.style.opacity = '';
		    // //console.log(' g_ElementProperties.getEleOrigincssTextbyId(id); ', g_ElementProperties.getEleOrigincssTextbyId(id));
		    ele.cssText += self.m_ElementDetector.m_ElementProperties.getEleOrigincssTextbyId(id);
		});

		//delete from manager
		g_InObjManager.removeInObj(self.m_iId);

		//hide the add on div
		// //console.log(' add class !!!!!!!!');
		// $('#addondiv').css('z-index', -1);
	}

	//callback of 'Create' button clicked
	Info.createANewPGroup = function(){

		var self = this;
		//console.log(" create property object ");

		//get current eleids
		var liEleId = [];
		var attrs = {};

		//get current group
		if(self.m_ObjectGroupManager.getSelectedGroupType() == 'origin'){//g_ObjectGroupManager.isSelectedGroupTypeCompound() == false){
			attrs['type'] = 'origin';//'propertygroup';
			attrs['value'] = 'origin';
			liEleId = self.m_CrossFilter.m_CrossFilterInfo.getFilterEleIds();
		}else if(self.m_ObjectGroupManager.getSelectedGroupType() == 'logic'){
			attrs['type'] = 'logic';//'propertygroup';
			attrs['value'] = 'logic';
			liEleId = self.m_CrossFilter.m_CrossFilterInfo.getFilterEleIds();	
		}else if(self.m_ObjectGroupManager.getSelectedGroupType() == 'compound'|| self.m_ObjectGroupManager.getSelectedGroupType() == 'default_compound'){
			attrs['type'] =  'compound';
			attrs['value'] = 'compound';	
			liEleId = self.m_CrossFilter.m_CrossFilterInfo.getFilterEleIds();
			liEleId = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liEleId);
			var liGroupId = [];
			for (var i = 0; i < liEleId.length; i++) {
				var liId = liEleId[i];
				var iGroupId = self.m_ElementDetector.m_ElementProperties.getEleGroupIdbyEleIds(liId);
				liGroupId.push(iGroupId);
			};
			liEleId = liGroupId;
		}else if(self.m_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'){
			attrs['type'] = 'logic_compound';
			attrs['value'] = 'logic_compound';
			liEleId = self.m_CrossFilter.m_CrossFilterInfo.getFilterEleIds();
			liEleId = self.m_ObjectGroupManager.sortToCompoundEleIdLists(self.m_ObjectGroupManager.getSelectedGroupId(), liEleId);
			var liGroupId = [];
			for (var i = 0; i < liEleId.length; i++) {
				var liId = liEleId[i];
				var iGroupId = self.m_ElementDetector.m_ElementProperties.getEleGroupIdbyEleIds(liId);
				liGroupId.push(iGroupId);
			};
			liEleId = liGroupId;
		}
		attrs['name'] = 'group';

		//console.log(' create a Group ', attrs['type'], ' ele list ', liEleId.length);

		//create the new group
		self.m_ObjectGroupManager.addNewGroup(liEleId, attrs);
		//update the button part in the object panel
		self.m_FilterRender.drawObjectButtons();
	}

	//click logic composition button
	Info.clickLogicComposition = function(){
		//console.log(" click logic c");
		this.m_LogicCompositionManager.defineLogicComposition();
	}

	//click annotation button
	Info.clickAnnotation = function(){
		console.log(" click annotation ");
		this.m_AnnotationDialog.openAnnotationDialog();
	}

	//change the mask
	// Info.changeMask = function(){

	// 	if(this.m_bMask){
	// 		// config = this.computeConfigofEleIds();
	// 		//compute the default mask
	// 	} 	
	// }

	//click sumbit in composition panel
	Info.successCompospeObject = function(){
		this.m_FilterRender.drawObjectButtons();
	}

	//db-click the property to rename
	Info.setRenameProperty = function(renameProperty){
		this.m_DialogRender.setRenameProperty(renameProperty);
	}
	//db-click the object to renanme
	Info.setRenameObject = function(renameObject){
		this.m_DialogRender.setRenameObject(renameObject);
	}

	/*~~~~~~~~~~~ Private Function */
	Info.computeConfigofEleIds = function(){	

		var config = {};	

		var offset = $('#addondiv svg').offset();
		var self = this;
		self.m_Rect;

    	//get configure the grids
    	// var iMaskGroupId = this.m_PropertyManager.getGroup..();
    	//get the property bag
    	// var propertyBag = this.m_PropertyManager.getPropertyBag(..);

    	//console.log("g_ToolBarManager.isVLineUpEnable() ", g_ToolBarManager.isVLineUpEnable(), 
    		// g_ToolBarManager.isHLineUpEnable(), g_ToolBarManager.isRadialMaskEnable());

    	if(g_ToolBarManager.isRadialMaskEnable()){

    		d3.select(".test_dot").remove();

    		//adjust the mask rect
    		// var rect = {};    	
			var liEleId = this.m_ElementDetector.m_ElementProperties.getElementIds();
			// console.log(" xxxxx ", liEleId);
    		var x_min, x_max, y_min, y_max;

    		for (var i = liEleId.length - 1; i >= 0; i--) {
    			var iEleId = liEleId[i];    			
    			var result = this.m_ElementDetector.m_ElementProperties.getElePropertiesbyId(iEleId);
    			var attribute = result['pros'];
    			// console.log(" xxx ", attribute, iEleId);
    			var y = attribute['g_y'] - offset['top'];
    			var x = attribute['g_x'] - offset['left'];
    			var rect = attribute['g_box'];
    			var left = rect['x1'] - offset['left'], right = rect['x2'] - offset['left'];
    			var top = rect['y1'] - offset['top'], bottom = rect['y2'] - offset['top'];
    			
    			// console.log("HHHH  x ", x, ' y ', y);
    			if(i == liEleId.length - 1){
    				x_min = left, y_min = top;
    				x_max = right, y_max = bottom;
    			}else{
    				if(x_min > left) x_min = left;
    				if(x_max < right) x_max = right;
    				if(y_min > top) y_min = top;
    				if(y_max < bottom) y_max = bottom;
    			}

    			
    			// d3.select('#addondiv svg')
    			// .append('circle')
    			// .attr('class', 'test_dot')
    			// .attr("cx", x)//attribute['g_x'] - offset['left'])
    			// .attr('cy', y)//attribute['g_y'] - offset['top'])
    			// .attr('r', '3px')
    			// .attr('fill', 'black');

    			// d3.select("#addondiv svg")
    			// .append('rect')
    			// .attr('class', 'test_dot')
    			// .attr('x', left)//rect.x1 - offset['left'])
    			// .attr('y', top)//rect.y1 - offset['top'])
    			// .attr('width', right - left)//rect.x2 - rect.x1)
    			// .attr('height', bottom - top)//rect.y2 - rect.y1)
    			// .attr('fill', 'none')
    			// .attr('stroke', 'black');
    			
    		}

    		
   //  		d3.select("#addondiv svg")
			// .append('rect')
			// .attr('class', 'test_dot')
			// .attr('x', x_min)//rect.x1 - offset['left'])
			// .attr('y', y_min)//rect.y1 - offset['top'])
			// .attr('width', x_max - x_min)//rect.x2 - rect.x1)
			// .attr('height', y_max - y_min)//rect.y2 - rect.y1)
			// .attr('fill', 'none')
			// .attr('stroke', 'black')
			// .attr('stroke-width', '1px');
			

    		console.log(" before rect ", this.m_Rect);

    		var original_width = this.m_Rect['width'], original_height = this.m_Rect['height'];

    		console.log(" x_min ", x_min, y_min);

    		
    		this.m_Rect['x'] = (x_min + x_max) * 0.5 - original_width * 0.5; //(x_min + x_max) * 0.5;// - original_width * 0.5; //(x_min + x_max) * 0.5 - offset['left'] - this.m_Rect['width']/2.;
    		this.m_Rect['y'] = (y_min + y_max) * 0.5 - original_height * 0.5;//(y_min + y_max) * 0.5;// - original_height * 0.5; //(y_min + y_max) * 0.5 - offset['top'] - this.m_Rect['height']/2.;
    		this.m_Rect['x1'] = this.m_Rect['x'], this.m_Rect['x2'] = this.m_Rect['x1'] + original_width;
    		this.m_Rect['y1'] = this.m_Rect['y'], this.m_Rect['y2'] = this.m_Rect['y1'] + original_height;
    		this.m_Rect['width'] = original_width, this.m_Rect['height'] = original_height;
			
    		console.log(" after rect ", this.m_Rect);
    		
    		//radial mask    		
    		config['adjustrect'] = true;
    		config['gridNum'] = 5;
    		// config['maskRect'] = rect;
    		//TODO
    		return config;
    	}

    	if(g_ToolBarManager.isVMaskEnable() || g_ToolBarManager.isHMaskEnable()){


    		d3.select(".test_dot").remove();
    		var edgePad = 10;

    		var posstr = 'g_x';
    		var posxy = 'left'
    		var configposName = 'gridXPosList';
    		if(g_ToolBarManager.isHMaskEnable()){
    			posstr = 'g_y';
    			posxy = 'top';
    			configposName = 'gridYPosList';
    		}
			//console.log(" is H Mask enabled ", posstr);
    		//get the x pos
    		var liEleId = this.m_ElementDetector.m_ElementProperties.getElementIds();
    		var liXPos = [];
    		var mapEleIdXPos = {};
    		// var liRect = [];
    		for (var i = liEleId.length - 1; i >= 0; i--) {

    			var iEleId = liEleId[i];
    			var result = this.m_ElementDetector.m_ElementProperties.getElePropertiesbyId(iEleId);
    			var attribute = result['pros'];
    			var x_or_y_pos = Number(attribute[posstr]) - offset[posxy];

    			//step 1: draw the rect
    			var y = attribute['g_y'] - offset['top'];
    			var x = attribute['g_x'] - offset['left'];
    			var rect = attribute['g_box'];
    			var left = rect['x1'] - offset['left'], right = rect['x2'] - offset['left'];
    			var top = rect['y1'] - offset['top'], bottom = rect['y2'] - offset['top'];


    // 			d3.select('#addondiv svg')
				// .append('circle')
				// .attr('class', 'test_dot')
				// .attr("cx", x)//attribute['g_x'] - offset['left'])
				// .attr('cy', y)//attribute['g_y'] - offset['top'])
				// .attr('r', '3px')
				// .attr('fill', 'black');

				// d3.select('#addondiv svg')
				// .append('rect')
				// .attr('class', 'test_dot')
				// // .style('fill', "rgba(2, 136, 209, 0.39)")
				// .attr("x", x - (right - left)/2.)//attribute['g_x'] - offset['left'])
				// .attr('y', y - (bottom - top)/2.)//attribute['g_y'] - offset['top'])
				// .attr("height", (right - left))
				// .attr("width", (bottom - top))
				// .attr('fill', 'none')
				// .attr('stroke', 'black')
				// .attr('stroke-width', '2px');

				//step 1.5: draw the 20 boundary
				
				// if(g_ToolBarManager.isVMaskEnable()){
				// 	var top = self.m_Rect['y1'], bottom = self.m_Rect['y2'];
				// 	d3.select('#addondiv svg')
				// 	.append('rect')
				// 	.attr('class', 'test_dot')
				// 	.style('fill', "rgba(2, 136, 209, 0.5)")
				// 	.attr("x", x - edgePad/2.)//attribute['g_x'] - offset['left'])
				// 	.attr('y', top)//attribute['g_y'] - offset['top'])
				// 	.attr("height", bottom - top)
				// 	.attr("width", edgePad)
				// 	// .attr('stroke', 'red');
				// }else{
	   // 				var left = self.m_Rect['x1'], right = self.m_Rect['x2'];
				// 	d3.select('#addondiv svg')
				// 	.append('rect')
				// 	.attr('class', 'test_dot')
				// 	.style('fill', "rgba(2, 136, 209, 0.05)")
				// 	.attr("x", left)//attribute['g_x'] - offset['left'])
				// 	.attr('y', y - edgePad/2.)//attribute['g_y'] - offset['top'])
				// 	.attr("height", edgePad)
				// 	.attr("width", right - left)
				// 	// .attr('stroke', 'red');
				// }
			
    		
    			if(liXPos.indexOf(x_or_y_pos) == -1){
    				liXPos.push(x_or_y_pos);   
    				mapEleIdXPos[iEleId] = x_or_y_pos; 			    				
    				// liRect.push(
    				// 	{
    				// 		'left': left, 'right': right, 'top': top, 'bottom': bottom,
    				// 	}
    				// );
    			}
    		};

    		liXPos.sort(function(a, b) {
	   			  return a - b;
   			});    			

   			//peel off the out of boundary pos
   			var liNewXPos = [];
   			if(g_ToolBarManager.isVMaskEnable()){
   				for (var i = 0; i < liXPos.length; i ++) {
   					if(liXPos[i] >= this.m_Rect['x1'] && liXPos[i] <= this.m_Rect['x2'])
   						liNewXPos.push(liXPos[i]);
   					console.log(" vertical mask ", liXPos[i], this.m_Rect['x1'], this.m_Rect['x2']);
   				}    			
   			}else{
   				for (var i = 0; i < liXPos.length; i ++) {
   					if(liXPos[i] >= this.m_Rect['y1'] && liXPos[i] <= this.m_Rect['y2'])
   						liNewXPos.push(liXPos[i]);
   				}    			   				
   			}
   			liXPos = liNewXPos;

   			console.log(" first config lipos ", liXPos);

   			//remove the interval less than 10
   			var liNewPos = [];
   			var mapNewPosPointList = {};
   			liNewPos.push(liXPos[0]);

   			var iCount = 0;
   			mapNewPosPointList[iCount] = [liXPos[0]];
   			for (var i = 1; i < liXPos.length; i++) {
   				var x1 = liXPos[i - 1], x2 = liXPos[i];
   				if(x2 - x1 > 30){   	 //10			
   					liNewPos.push(x2); 
   					iCount += 1;
   					mapNewPosPointList[iCount] = [x2];
   				}else{
   					mapNewPosPointList[iCount].push(x2);
   				}
   			};

   			liXPos = liNewPos;
   			console.log(" mapNew PointList ", mapNewPosPointList);
   			var edgePad = 10;

   			liMinMaxXPos = [];

   			var liColor = ['#e50011', '#0da7cc', '#e78f09', '#5f1885'];

   			for(var i = 0; i < liXPos.length; i ++){
   				var pos = liXPos[i];
   				var color = liColor[i];
   				var liPoint = mapNewPosPointList[i];
   				var sumPos = 0;
   				for(var j = 0; j < liPoint.length; j ++){
   					sumPos += liPoint[j];
   				}
   				var minPos = -1 , maxPos = -1;
   				for (var j = liEleId.length - 1; j >= 0; j--) {
   					var iEleIdTemp = liEleId[j];
   					var Pos = mapEleIdXPos[iEleIdTemp];
   					if(liPoint.indexOf(Pos) == -1)
   						continue;
   					//get the rect
					var result = this.m_ElementDetector.m_ElementProperties.getElePropertiesbyId(iEleIdTemp);
					var attribute = result['pros'];
					var x_or_y_pos = Number(attribute[posstr]) - offset[posxy];

					//step 1: draw the rect
					var y = attribute['g_y'] - offset['top'];
					var x = attribute['g_x'] - offset['left'];
					var rect = attribute['g_box'];
					var left = rect['x1'] - offset['left'], right = rect['x2'] - offset['left'];
					var top = rect['y1'] - offset['top'], bottom = rect['y2'] - offset['top'];

					// step 2: draw cluster frame
					// d3.select('#addondiv svg')
					// .append('rect')
					// .attr('class', 'test_dot')
					// // .style('fill', "rgba(2, 136, 209, 0.39)")
					// .attr("x", x - (right - left)/2.)//attribute['g_x'] - offset['left'])
					// .attr('y', y - (bottom - top)/2.)//attribute['g_y'] - offset['top'])
					// .attr("height", (right - left))
					// .attr("width", (bottom - top))
					// .attr('fill', 'none')
					// .attr('stroke', color)
					// .attr('stroke-width', '1px')
					// // .attr('opacity', '0.2')
					// .attr('rx', '2px')
					// .attr('ry', '2px');

					// if(g_ToolBarManager.isVMaskEnable()){
					// 	if(minPos == -1)
					// 		minPos = left;
					// 	if(maxPos == -1)
					// 		maxPos = right;
					// 	if(minPos > left)
					// 		minPos = left;
					// 	if(maxPos < right)
					// 		maxPos = right;
					// }else{
					// 	if(minPos == -1)
					// 		minPos = top;
					// 	if(maxPos == -1)
					// 		maxPos = bottom;
					// 	if(minPos > top)
					// 		minPos = top;
					// 	if(maxPos < bottom)
					// 		maxPos = bottom;
					// }
   				};

   				liXPos[i] = sumPos/(liPoint.length);
   				liMinMaxXPos.push([minPos, maxPos])
   			}
   			
   			//step 2: draw the center points
   			if(g_ToolBarManager.isVMaskEnable()){
   				var top = self.m_Rect['y1'], bottom = self.m_Rect['y2'];
   				for (var i = liXPos.length - 1; i >= 0; i--) {
	   				var xPos = liXPos[i];
	   				var xMinPos = liMinMaxXPos[i][0], xMaxPos = liMinMaxXPos[i][1];

	   				/*
	   				d3.select('#addondiv svg')
					.append('circle')
					.attr('class', 'test_dot')
					.attr("cx", xPos)//attribute['g_x'] - offset['left'])
					.attr('cy', top)//attribute['g_y'] - offset['top'])
					.attr('r', '3px')
					.attr('fill', 'red');

					//draw the center line
					d3.select('#addondiv svg')
					.append('line')
					.attr('x1', xPos)
					.attr('y1', top)
					.attr('x2', xPos)
					.attr('y2', bottom)
					.style('stroke', "red")
					.style("stroke-width", '2px');

					//draw the rect
					d3.select('#addondiv svg')
					.append('rect')
					.attr('class', 'test_dot')
					.style('fill', "rgba(2, 136, 209, 0.39)")
					.attr("x", xMinPos)//attribute['g_x'] - offset['left'])
					.attr('y', top)//attribute['g_y'] - offset['top'])
					.attr("height", bottom - top)
					.attr("width", xMaxPos - xMinPos)
					.attr('stroke', 'red');
					*/

	   			};
   			}else{
   				var left = self.m_Rect['x1'], right = self.m_Rect['x2'];
   				for (var i = liXPos.length - 1; i >= 0; i--) {
	   				var yPos = liXPos[i];
	   				var color = liColor[i];
	   				var yMinPos = liMinMaxXPos[i][0], yMaxPos = liMinMaxXPos[i][1];


					//step 3: draw line
					// d3.select('#addondiv svg')
					// .append('line')
					// .attr('x1', left)
					// .attr('y1', yPos)
					// .attr('x2', right)
					// .attr('y2', yPos)
					// .style('stroke', color)
					// // .style('opacity', '0.2')
					// .style("stroke-width", '3px')
					// .style('stroke-dasharray', '3px 3px');

					// // draw center dot
	   	// 			d3.select('#addondiv svg')
					// .append('circle')
					// .attr('class', 'test_dot')
					// .attr("cx", (left + right) * 0.5 - 1.5)//attribute['g_x'] - offset['left'])
					// .attr('cy', yPos)//attribute['g_y'] - offset['top'])
					// .attr('r', '6px')
					// .attr('fill', color)
					// .attr("stroke", 'black');

					// d3.select('#addondiv svg')
					// .append('rect')
					// .attr('class', 'test_dot')
					// .attr("x", left)//attribute['g_x'] - offset['left'])
					// .attr('y', yMinPos)//attribute['g_y'] - offset['top'])
					// .attr("width", right - left)
					// .attr("height", yMaxPos - yMinPos)
					// .attr("fill", 'none')
					// // .style('fill', "rgba(2, 136, 209, 0.3)")
					// // .attr("stroke-width", '2px')
					// .attr('stroke', '#0277BD')
					// .attr('stroke-width', '2px')
					// .attr('opacity', '0.2');
	   			};
   			}
   			
   			//console.log(" new liXPos ", liXPos);

   			config['gridNum'] = liXPos.length - 1;
   			var liGridXPos = [];
   			for(var i = 0; i < liXPos.length - 1 ; i ++){
   				liGridXPos.push((liXPos[i] + liXPos[i + 1]) * 0.5);
   			}

   			config[configposName] = liGridXPos;
    		// config['gridNum'] = 3;
    		//console.log(" gridNum ", config);
    		return config;
    	}

    	d3.select('.define_region').style('visibility', 'hidden')

    	if(g_ToolBarManager.isHMaskEnable()){
    		//get the y pos
    		config['gridNum'] = 3;
    		return config;
    	}
    	return undefined;
	}

	Info.__init__(iId, bMask, maskType);

	return Info;
}