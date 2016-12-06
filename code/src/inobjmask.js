/*
	InObjMask: 
*/

function InObjMask(iId, maskType, InObj){

	var Info = {};

	Info.__init__ = function(iId, maskType, InObj){
		this.m_iId = iId;
		this.m_maskType = maskType;
		this.m_InObj = InObj;

		this.m_maskConfig = {};

		this.m_ParallelGranThred = 5;
		// this.m_ElementDetector = this.m_InObj.m_ElementDetector;

		this.m_liSelectedEleId = [];

		this.m_MaskRender = new InObjMaskRender(iId, maskType, this);
		this.m_liObjectGroupManager = [];
		this.m_liRectIndexGroupIdFilterEleIds = []; //{1: liEleId} 
		// this.m_mapGroupNameEleNum = {};
		this.m_maxGroupEleNum = -1;
	}

	//set the rect 
	Info.configure = function(maskRect, maskDefaultConfig){
		this.m_MaskRect = maskRect;
		this.m_maskConfig = maskDefaultConfig;
		console.log(" first configure ", this.m_maskConfig);
		// switch(this.m_maskType){
		// 	case "tabular":
		// 		// self.renderDefaultTabular();
		// 		break;
		// 	case "radial":
		// 		self.configureRadial();
		// 		break;
		// 	case "vparalell":
		// 		self.configureVParallel();
		// 		break;
		// 	case "hparallel":
		// 		self.configureHParallel();
		// 		break;
		// }
		this.m_MaskRender.configure(this.m_MaskRect, this.m_maskConfig);
	}

	// Info.configureRadial = function(){
	// 	//with maskect done

	// }

	// Info.configureHParallel = function(){
	// }

	// Info.configureVParallel = function(){
		
	// }

	//click from filter
	Info.setMaskEleIds = function(liEleId, elementDetector){
		var self = this;
		self.m_ElementDetector = elementDetector;
		self.m_liSelectedEleId = liEleId;
		
		//detect the object in each mask-group
		self.detect();
		//
		self.renderMaskGroup();
	}

	//update the filtered ele id list, caused by changing the property
	Info.updateFilteredMaskEleIds = function(liFilterEleId){
		var self = this;
		// liFilterEleId.sort();
		self.m_liRectIndexGroupIdFilterEleIds = [];
		//console.log("<> &&& ", liFilterEleId.length);

		for (var i = 0; i < self.m_liObjectGroupManager.length; i++) {
			var ObjectGroupManager = self.m_liObjectGroupManager[i];
			var liGroupId = ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();	
			var result = {};
			for(var j = 0; j < liGroupId.length ; j ++){
				var iGroupId = liGroupId[j];
				var liEleId = ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				// liEleId.sort();
				//console.log("<>i-0", i, liEleId);
				//console.log("<>i-1", i, liFilterEleId);
				var liIntersectEleId = intersect_safe(liEleId, liFilterEleId);
				//console.log("<>i-2", i, liIntersectEleId);
				result[iGroupId] = liIntersectEleId;
			}
			self.m_liRectIndexGroupIdFilterEleIds.push(result);
		}
		//render
		self.renderMaskGroup();
	}

	//detect the object in mask
	Info.detect = function(){
		var self = this;
		switch(self.m_maskType){
			case "tabular":
				self.renderDefaultTabular();
				break;
			case "radial":
				self.detectbyFan();
				break;
			case "vparalell":
			case "hparallel":
				self.detectbyRect();
				break;
		}
	}

	Info.detectbyFan = function(){
		var self = this;
		var fanList = self.m_MaskRender.getFanList();

		// console.log(" Fan Number ", fanList.length, self.m_liSelectedEleId.length);

		self.m_liRectIndexGroupIdFilterEleIds = [];
		self.m_maxGroupEleNum = -1;
		self.m_liObjectGroupManager = [];
		self.m_liMGroupEleId = [];
		
		for(var i = 0; i < fanList.length; i ++){
			// var beginArc = fanArcRangeList.beginArc;
			// var endArc = fanArcRangeList.endArc;

			var liEle = self.m_ElementDetector.detectGivenElementsInFan(self.m_liSelectedEleId, fanList[i]);
			self.m_liMGroupEleId.push(liEle);
			//for each m-group
			var mgroup_ObjectGroupManager = new ObjectGroupManager(this.m_iId + '_' + i, self.m_ElementDetector.m_ElementProperties);
			//cluster ele by type
			mgroup_ObjectGroupManager.generateOriginalOGroup(liEle);

			//update the max ele number of a group
			var liGroupId = mgroup_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
			var result = {};
			for(var j = 0; j < liGroupId.length ; j ++){
				var iGroupId = liGroupId[j];
				var liEleId = mgroup_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				var iEleNum = liEleId.length;
				if(self.m_maxGroupEleNum < iEleNum) 
					self.m_maxGroupEleNum = iEleNum;
				result[iGroupId] = liEleId;
			}
			self.m_liRectIndexGroupIdFilterEleIds.push(result);
			self.m_liObjectGroupManager.push(mgroup_ObjectGroupManager);
			// console.log(" Fan Number ", i, fanList[i], liEle.length, liGroupId);
		}
	}

	Info.detectbyRect = function(){

		var self = this;
		self.m_liRectIndexGroupIdFilterEleIds = [];
		//get the rect list
		rectList = self.m_MaskRender.getMaskRectList();

		var offset = $('#addondiv svg').offset();

		self.m_maxGroupEleNum = -1;
		self.m_liObjectGroupManager = [];
		self.m_liMGroupEleId = [];

		for (var i = 0; i < rectList.length ; i++){			
			var rect = rectList[i];
			//console.log("rect && ", rect, i);
			rect = {
				'x1': rect['x1'] + offset.left,
				'x2': rect['x2'] + offset.left,
				'y1': rect['y1'] + offset.top,
				'y2': rect['y2'] + offset.top,
			}
			//detect the elements
			var liEle = self.m_ElementDetector.detectGivenElementsInRect(self.m_liSelectedEleId, rect);
			self.m_liMGroupEleId.push(liEle);
			//for each m-group
			var mgroup_ObjectGroupManager = new ObjectGroupManager(this.m_iId + '_' + i, self.m_ElementDetector.m_ElementProperties);
			//cluster ele by type
			mgroup_ObjectGroupManager.generateOriginalOGroup(liEle);

			//update the max ele number of a group
			var liGroupId = mgroup_ObjectGroupManager.getVisibleGroupIdList();//.getGroupIdList();
			var result = {};
			for(var j = 0; j < liGroupId.length ; j ++){
				var iGroupId = liGroupId[j];
				var liEleId = mgroup_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
				var iEleNum = liEleId.length;
				if(self.m_maxGroupEleNum < iEleNum) 
					self.m_maxGroupEleNum = iEleNum;
				result[iGroupId] = liEleId;
			}
			
			//console.log("rect && ", rect, i, liEle.length);

			self.m_liRectIndexGroupIdFilterEleIds.push(result);
			self.m_liObjectGroupManager.push(mgroup_ObjectGroupManager);
		}
	
		//console.log(" groupMaxNum ! ", self.m_mapGroupNameEleNum);
		// self.m_MaskRender.setVisibleGroupList(self.m_liGroupName);

		//update the width


		// for (var i = liGroupId.length - 1; i >= 0; i--){
		// 	var iGroupId = liGroupId[i];
		// 	var iEleNum = groupObjectManager.getEleIdsbyGroupId(iGroupId).length;
		// 	var attrs = groupObjectManager.getAttrsbyGroupId(iGroupId);
		// }
	}

	//api from mask render

	Info.decreaseGraunarity = function(){					
		var self = this;
		switch(self.m_maskType){
			//check the mask type
			case "tabular":
				break;
			case "radial":
				self.m_MaskRender.removeMaskGroups();
				self.decreaseRadialGranu();
				break;
			case "vparalell":
			case "hparallel":
				self.decreaseParallGranu();
		}
		self.updateMaskConfigure();
	}

	Info.increaseGraunarity = function(){	
		var self = this;
		switch(self.m_maskType){
			//check the mask type
			case "tabular":
				break;
			case "radial":
				self.m_MaskRender.removeMaskGroups();
				self.increaseRadialGranu();
				break;
			case "vparalell":
			case "hparallel":
				self.m_MaskRender.removeMaskGroups();
				self.increaseParallGranu();
		}				
		self.updateMaskConfigure();
	}

	Info.decreaseRadialGranu = function(){
		var self = this;
		self.m_maskConfig['gridNum'] = self.m_maskConfig['gridNum'] - 1;
		if(self.m_maskConfig['gridNum'] < 0)
			self.m_maskConfig = 0;
		console.log(' decrease fan ', self.m_maskConfig['gridNum']);
	}

	Info.decreaseParallGranu = function(){
		var self = this;
		self.m_ParallelGranThred -= 1;
		if(self.m_ParallelGranThred < 0)
			self.m_ParallelGranThred = 0;		
		self.recomputeParallelConfig();
		console.log(" decrease parall ", self.m_ParallelGranThred);
	}

	Info.increaseRadialGranu = function(){
		var self = this;
		self.m_maskConfig['gridNum'] = self.m_maskConfig['gridNum'] + 1;
		if(self.m_maskConfig['gridNum'] < 0)
			self.m_maskConfig = 0;
		console.log(' increase fan ', self.m_maskConfig['gridNum']);
	}

	Info.increaseParallGranu = function(){
		var self = this;
		self.m_ParallelGranThred += 1;		
		self.recomputeParallelConfig();
		console.log(" increase parall ", self.m_ParallelGranThred);
	}

	Info.recomputeParallelConfig = function(){

		var self = this;

		var maxWidth = self.m_MaskRect.x2 - self.m_MaskRect.x1;
		var maxHeight = self.m_MaskRect.y2 - self.m_MaskRect.y1;

		var step = 0;
		var config = {};
		var begin = 0;
		if(this.m_maskType == 'vparalell'){
			PosName = 'gridXPosList';
			step = maxWidth / this.m_ParallelGranThred;
			begin = self.m_MaskRect.x1;
		}else if(this.m_maskType == 'hparallel'){
			PosName = 'gridYPosList';	
			step = maxHeight / this.m_ParallelGranThred;
			begin = self.m_MaskRect.y1;
		}

		var liPos = [];
		for(var i = 0; i < self.m_ParallelGranThred - 1; i ++){
			var Pos = begin + (i + 1) * step;
			liPos.push(Pos);
		}

		console.log(" line number new liXPos ", liPos);

		config['gridNum'] = self.m_ParallelGranThred; //liXPos.length - 1;
		config[PosName] = liPos;
		self.m_maskConfig = config;
		console.log(' line number ', liPos.length);
	}

	Info.updateMaskConfigure = function(){	
		console.log(" update mask ");
		this.configure(this.m_MaskRect, this.m_maskConfig);
		this.renderMask();		
	}

	//render 
	Info.renderMaskGroup = function(){
		var self = this;
		for (var i = self.m_liObjectGroupManager.length - 1; i >= 0; i--) {
			var ObjectGroupManager = self.m_liObjectGroupManager[i];
			var FilterGroupIdEleIds = self.m_liRectIndexGroupIdFilterEleIds[i];
			console.log("Add Fan ", i);
			self.m_MaskRender.addMaskGroup(i, ObjectGroupManager, FilterGroupIdEleIds, self.m_maxGroupEleNum);
		};
	}

	Info.renderMask = function(){
		this.m_MaskRender.renderMask();
	}

	Info.clearMaskRelated = function(){
		this.m_MaskRender.clearMaskRelated();
	}

	//from mask render
	Info.changePosList = function(gridPosList){
		var self = this;
		if(self.m_maskType == 'vparalell'){
			self.m_maskConfig['gridXPosList'] = gridPosList;
		}
		if(self.m_maskType == 'hparallel'){			
			self.m_maskConfig['gridYPosList'] = gridPosList;
		}
		self.updateMaskConfigure();
	}

	Info.__init__(iId, maskType, InObj);

	return Info;
}

function intersect_safe(a, b){
	var result = [];
	if(a.length < b.length){
		for (var i = a.length - 1; i >= 0; i--) {
		var aa = a[i];
		if(b.indexOf(aa) >= 0)
			result.push(aa);
		};
	}else{
		for (var i = b.length - 1; i >= 0; i--) {
		var bb = b[i];
		if(a.indexOf(bb) >= 0)
			result.push(bb);
		};
	}
	
  // var ai=0, bi=0;
  // var result = [];

  // while( ai < a.length && bi < b.length )
  // {
  //    if      (a[ai] < b[bi] ){ ai++; }
  //    else if (a[ai] > b[bi] ){ bi++; }
  //    else /* they're equal */
  //    {
  //      result.push(a[ai]);
  //      ai++;
  //      bi++;
  //    }
  // }

  return result;
}