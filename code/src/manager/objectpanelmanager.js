//Class: object group manager
function ObjectGroupManager(iId, elementProperties){

	var Info = new Object;
	//console.log(' object group info ');

	Info.m_TitleContent = 'Object';

	Info.m_mapOGroupIdElementIds = {};//get the elementids if origin
									  //get the ele-group ids if compound or logic_compound
	Info.m_mapOGroupIdAttr = {}; //{type: origin/compound/property; 
								 // value: circle/line
								 // name: user defined name}

	//compound elements
	Info.m_mapOGroupIdElementIdLists = {};//get the elementid lists if compound

	//current selected group
	Info.m_iSelectedGroupId = -1;

	//visibile group
	Info.m_liVisibleGroupId = [];

	Info.__init__ = function(iId, elementProperties){
		this.m_iId = iId;
		this.g_ElementProperties = elementProperties;
		//console.log(" init ObjectGroupManager ", elementProperties, 'A', this.g_ElementProperties);
	}

	Info.addNewGroup = function(liElementId, attri) {
		var iOGroupId = this.m_liOGroupId.length;
		this.m_liOGroupId.push(iOGroupId);
		
		this.m_mapOGroupIdAttr[iOGroupId] = attri;

		if(attri['type'] == 'origin' || attri['type'] == 'propertygroup' || attri['type'] == 'logic' || attri['type'] == 'default_compound' || attri['type'] == 'logic_compound' || attri['type'] == 'compound'){ //|| attri['type'] == 'default_compound' || attri['type'] == 'logic_compound'
			for(var i = 0; i < liElementId.length; i ++)
				liElementId[i] = parseInt(liElementId[i]);
			this.m_mapOGroupIdElementIds[iOGroupId] = liElementId;
		}
		if(attri['type'] == 'compound')
			this.m_mapOGroupIdElementIdLists[iOGroupId] = liElementId;

		//initiate the visible
		var liDefaultInvisible = ['div', 'p', 'h5', 'span'];
		if(liDefaultInvisible.indexOf(attri['name']) == -1){
			this.m_liVisibleGroupId.push(iOGroupId);
		}
			
		return iOGroupId;
	}
	Info.setSelectedGroupId = function(iSelectedGroupId){
		this.m_iSelectedGroupId = iSelectedGroupId;
	}
	Info.setGroupNamebyId = function(iGroupId, GroupName){
		var attr = this.m_mapOGroupIdAttr[iGroupId];
		//save in semantic map
		g_VisDecoder.addSemanticMap(attr['name'], GroupName);
		attr['name'] = GroupName;
		this.m_mapOGroupIdAttr[iGroupId] = attr;
	}
	Info.setGroupVisible = function(iGroupId, bVisible){
		if(bVisible && this.m_liVisibleGroupId.indexOf(iGroupId) == -1){
			this.m_liVisibleGroupId.push(iGroupId);
		}
		if(!bVisible && this.m_liVisibleGroupId.indexOf(iGroupId) != -1){
			var index = this.m_liVisibleGroupId.indexOf(iGroupId);
			this.m_liVisibleGroupId.splice(index, 1);
		}
	}

	Info.getGroupAttrbyId = function(iGroupId){
		return this.m_mapOGroupIdAttr[iGroupId];
	}
	Info.getGroupNamebyId = function(iGroupId){
		var attr = this.m_mapOGroupIdAttr[iGroupId];
		return attr['name'];
	}
	Info.getSelectedGroupId = function(){
		return this.m_iSelectedGroupId;
	}
	Info.getSelectedGroupType = function(){
		return this.getGroupType(this.m_iSelectedGroupId);
	}
	Info.isSelectedGroupTypeCompound = function(){
		var SelectedGroupType = this.getSelectedGroupType();
		if(SelectedGroupType == 'compound' || SelectedGroupType == 'default_compound' || SelectedGroupType == 'logic_compound')
			return true;
		return false;
		// return //.getSelectedGroupType() == 'compound' || g_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || g_ObjectGroupManager.getSele){
	}
	Info.getGroupIdList = function() {
		return this.m_liOGroupId;
	}
	Info.getVisibleGroupIdList = function(){
		return this.m_liVisibleGroupId;
	}
	Info.getInVisibleGroupIdList = function(){
		var liInVisibleGroupId = [];
		for (var i = this.m_liOGroupId.length - 1; i >= 0; i--){
			var iGroupId = this.m_liOGroupId[i];
			if(this.m_liVisibleGroupId.indexOf(iGroupId) == -1)
				liInVisibleGroupId.push(iGroupId);
		};
		return liInVisibleGroupId;
	}
	//get the eleids of the origin group 
	Info.getEleIdsbyGroupId = function(iGroupId){
		var self = this;
		var groupType = this.getGroupType(iGroupId);
		switch(groupType){
			case 'origin':
			case 'propertygroup':
			case 'logic':
				return this.m_mapOGroupIdElementIds[iGroupId];
			case 'logic_compound':
			case 'default_compound':
			case 'compound':
			{				
				var liEleGroupId = this.m_mapOGroupIdElementIds[iGroupId];
				var liEleIdList = [];
				for (var i = 0; i < liEleGroupId.length; i++) {
					var iEleGroupId = liEleGroupId[i];
					var liTempEleId = self.g_ElementProperties.getElementIdsofEleGroup(iEleGroupId);
					liEleIdList.push(liTempEleId);
				};
				return liEleIdList;
			}
			// {	
			// 	var liEleId = [];
			// 	var liEleIdLists = this.m_mapOGroupIdElementIdLists[iGroupId];
			// 	// for(var i = 0; i < liEleIdLists.length; i ++){
			// 	// 	liEleId = liEleId.concat(liEleIdLists[i]);
			// 	// }
			// 	return liEleIdLists;
			// }
		}
	}
	//get the group which ele belongs 
	Info.getGroupIdofEleId = function(iEleId){
		var self = this;
		var liGroupId = Object.keys(self.m_mapOGroupIdElementIds);
		for (var i = liGroupId.length - 1; i >= 0; i--) {
			var iGroupId = liGroupId[i];
			var liEleId = self.getEleIdsbyGroupId(iGroupId);
			if(liEleId.indexOf(iEleId) != -1)
				return iGroupId;
		};
		return -1;
	}

	//get the compound eleids 
	Info.sortToCompoundEleIdLists = function(iGroupId, liEleId){
		var self = this;
		var liCompoundEleIds = [];
		var groupType = this.getGroupType(iGroupId);

		// if(groupType == 'compound'){
		// 	var liAllCompoundEleIds = this.m_mapOGroupIdElementIdLists[iGroupId];
		// 	for (var i = liAllCompoundEleIds.length - 1; i >= 0; i--) {
		// 		var liTempEleId = liAllCompoundEleIds[i];
		// 		//check if all temp ele id in the given eleids
		// 		var bIn = true;
		// 		for (var j = liTempEleId.length - 1; j >= 0; j--) {
		// 			var tempEleId = liTempEleId[j];
		// 			if(liEleId.indexOf(tempEleId) == -1){
		// 				bIn = false;
		// 				break;
		// 			}
		// 		};
		// 		if(bIn)
		// 			liCompoundEleIds.push(liTempEleId);
		// 	};
		// }
		// else 
		if(groupType == 'compound' || groupType == 'default_compound' || groupType == 'logic_compound'){ //} if(groupType == 'default_compound' || groupType == 'logic_compound'){

			var liEleGroupId = this.m_mapOGroupIdElementIds[iGroupId];
			for (var i = 0; i < liEleGroupId.length; i++) {
				var iEleGroupId = liEleGroupId[i];
				var liTempEleId = self.g_ElementProperties.getElementIdsofEleGroup(iEleGroupId);
				//check if all temp ele id in the given eleids
				var bIn = true;
				for (var j = liTempEleId.length - 1; j >= 0; j--) {
					var tempEleId = liTempEleId[j];
					if(liEleId.indexOf(tempEleId) == -1){
						bIn = false;
						break;
					}
				};
				if(bIn)
					liCompoundEleIds.push(liTempEleId);
			};
		}else
			liCompoundEleIds = liEleId;
		return liCompoundEleIds;
	}
	//extend to the linked ele ids by given ele ids
	// Info.expandToCompoundEleIds = function(iGroup, liEleId){
	// 	var self = this;
	// 	var groupType = self.getGroupType(iGroup);
	// 	var liAllEleIds = [];
	// 	if(groupType == 'compound'){
	// 		var liEleIds = this.m_mapOGroupIdElementIdLists[iGroup];
	// 		for (var i = liEleIds.length - 1; i >= 0; i--) {
	// 			var liTempEleId = liEleIds[i];
	// 			var bExist = false;
	// 			for(var j = liTempEleId.length - 1; j >= 0; j --){
	// 				var iEleId = liTempEleId[j];
	// 				if(liEleId.indexOf(iEleId) != -1){
	// 					bExist = true;
	// 					break;
	// 				}
	// 			}
	// 			if(bExist)
	// 				liAllEleIds = liAllEleIds.concat(liTempEleId);			
	// 		};			
	// 	}else if(groupType == 'default_compound'){

	// 	}
	// 	return liAllEleIds;
	// }

	//get all the eleids of the group
	Info.getAllEleIdsofGroup = function(iGroupId){
		var self = this;
		var groupType = this.getGroupType(iGroupId);
		switch(groupType){
			case 'origin':
			case 'propertygroup':
			case 'logic':
				return this.m_mapOGroupIdElementIds[iGroupId];				
			case 'logic_compound':
			case 'default_compound':
			case "compound":
				var liEleGroupId = this.m_mapOGroupIdElementIds[iGroupId];				
				//console.log(' iGroupEle List ', liEleGroupId);
				var liEleIds = [];
				for(var i = liEleGroupId.length - 1; i >= 0; i --){
					var eleList = self.g_ElementProperties.getElementIdsofEleGroup(liEleGroupId[i]);
					// //console.log(' iGropuEleList ', eleList);
					liEleIds = liEleIds.concat(eleList);
				}
				return liEleIds;
			// case 'compound':
			// 	var liEleIdList = this.m_mapOGroupIdElementIdLists[iGroupId];
			// 	var liEleIds = [];
			// 	for (var i = liEleIdList.length - 1; i >= 0; i--) {
			// 		var eleList = liEleIdList[i];
			// 		liEleIds = liEleIds.concat(eleList);
			// 	};
			// 	return liEleIds;
		}
	}

	//get the eleidlists of the compound group id
	Info.getEleIdListsbyGroupId = function(iGroupId){
		var self = this;
		var groupType = this.getGroupType(iGroupId);
		// if(groupType == 'compound')
		// 	return this.m_mapOGroupIdElementIdLists[iGroupId];
		// else
		 if(groupType == 'compound' || groupType == 'default_compound' || groupType == 'logic_compound')
		{
			var liEleIdLists = [];
			var liEleGroupId = this.m_mapOGroupIdElementIds[iGroupId];
			for (var i = 0; i < liEleGroupId.length; i++) {
				var iEleGroupId = liEleGroupId[i];
				var liGroupEleId = self.g_ElementProperties.getElementIdsofEleGroup(iEleGroupId);
				liEleIdLists.push(liGroupEleId);
			};
			return liEleIdLists;
		}
	
	}

	//only to 'compound*'
	Info.getEleGroupIdsbyGroupId = function(iGroupId){
		var groupType = this.getGroupType(iGroupId);
		if(groupType == 'compound' || groupType == 'default_compound' || groupType == 'logic_compound'){
			return this.m_mapOGroupIdElementIds[iGroupId];
		}
		return [];
	}
	Info.getGroupTypeofGroupId = function(iGroupId){
		var attrs = this.m_mapOGroupIdAttr[iGroupId];
		var type = attrs['type'];
		return type;
	}
	Info.getAttrsbyGroupId = function(iGroupId){
		return this.m_mapOGroupIdAttr[iGroupId];
	}
	Info.getGroupType = function(iGroupId){
		var attr = this.getAttrsbyGroupId(iGroupId);
		var type = attr['type'];
		return type;
	}
	Info.isOriginGroup = function(iGroupId){
		var attrs = this.getAttrsbyGroupId(iGroupId);
		//console.log(" this atts ", this.m_mapOGroupIdAttr);
		if(attrs['type'] == 'origin')
			return true;
		return false;
	}

	//function: generate original primitive object group
	Info.generateOriginalOGroup = function(liAllEleIds) {
		var self = this;
		this.clear();
		//input 
		var liEleIds = liAllEleIds;
		if(liEleIds == undefined)
			liEleIds = self.g_ElementProperties.getElementIds();

		var mapTypeEves = {};
		//abstract according to type
		$.each(liEleIds, function(index, item) {
			var elepros = self.g_ElementProperties.getElePropertiesbyId(item);
			var pros = elepros['pros'];

			var type = pros['type'];
			if (mapTypeEves[type] == undefined)
				mapTypeEves[type] = [item];
			else
				mapTypeEves[type].push(item);
		});
		for (var key in mapTypeEves) {
			var liEle = mapTypeEves[key];
			// //console.log('key ', key, 'liEle.length = ', liEle.length);
			var attrs = {};
			attrs['type'] = 'origin';
			attrs['value'] = key;
			attrs['name'] = key;
			this.addNewGroup(liEle, attrs);
		}
	}	

	//function: detect the default linked groups, which satisfy 
	//condition 1: group -- ele1, ele2, ele3, ele4....
	//condition 2: eleX is tagged with certain class

	Info.detectDefaultLinkedGroups = function(){

		var self = this;

		//travesal all the detected element ids
		var liEleId = self.g_ElementProperties.getElementIds();
		var liVisitedIndex = [];
		var mapLinkedGroupIdChildProfile = {};
		var mapLinkedGroupIdEleIdLists = {};

		for (var i = 0; i < liEleId.length; i++){
			if(liVisitedIndex.indexOf(i) >= 0)
				continue;
			var iEleId = liEleId[i];
			var element = self.g_ElementProperties.getElebyId(iEleId);
			// //console.log(' ele ', element);
			var parentofEle = $(element).parent()[0];

			var liChildEleId = [];
			var liChildEle = [];

			if(parentofEle.tagName == 'g'){
				//get the children of the parent
				var childElements = parentofEle.children;

				//travel all the children if they are in the detected ele
				for(var j = 0; j < childElements.length; j ++){
					var tempChild = childElements[j];
					if(checkforNETag(tempChild) == true) 
						continue;
					var iSiblingEleId = self.g_ElementProperties.getEleIdByElement(tempChild);
					if(iSiblingEleId != -1){
						liChildEleId.push(iSiblingEleId);
						liChildEle.push(tempChild);
					}else{
						liChildEleId = [];
						liChildEle = [];
						break;
					}
				}

				if(liChildEleId.length > 0){
					//get the ele profile
					var childPro = getChildProfile(liChildEle);
					// //console.log(" child pro ", childPro);
					var ExistInfo = getLinkedGroupId(mapLinkedGroupIdChildProfile, childPro);
					var iExistLinkedGroupId = ExistInfo.groupId;
					var ExistChildProfile = ExistInfo.childProfile;
					//add to the link group map
					if(iExistLinkedGroupId == -1){
						//not exist
						var iLinkedGroupId = Object.keys(mapLinkedGroupIdChildProfile).length;
						//add a linked group 
						mapLinkedGroupIdChildProfile[iLinkedGroupId] = childPro;
						mapLinkedGroupIdEleIdLists[iLinkedGroupId] = [liChildEleId];
					}else{
						//exist
						liChildEle = getChildListByProfile(liChildEle, ExistChildProfile);
						mapLinkedGroupIdEleIdLists[iExistLinkedGroupId].push(liChildEleId);
					}
				}
			}

			if(liChildEleId.length == 0)
				liVisitedIndex.push(i);
			else{
				for(var j = 0; j < liChildEleId.length; j ++){
					var tempIndex = liEleId.indexOf(liChildEleId[j]);
					liVisitedIndex.push(tempIndex);
				}
			}
		};

		//console.log(' mapLinkedGroupIdEleIdLists ',mapLinkedGroupIdEleIdLists);

		for(var iLinkedGroupId in mapLinkedGroupIdEleIdLists){
			var liEleIdLists = mapLinkedGroupIdEleIdLists[iLinkedGroupId];
			var liEleGroupId = [];
			for(var i = 0; i < liEleIdLists.length; i ++){
				var liEleId = liEleIdLists[i];
				var iGroupEleId = self.g_ElementProperties.addGroupEle(liEleId);
				liEleGroupId.push(iGroupEleId);
			}
			var attrs = {};
			attrs['type'] = 'default_compound';
			attrs['value'] = 'link';
			attrs['name'] = 'group_' + iLinkedGroupId;
			self.addNewGroup(liEleGroupId, attrs);
		}

		function getChildProfile(childrenList){
			var childProfile = [];
			for (var i = 0; i < childrenList.length; i++) {
				var childEle = childrenList[i];
				var profile = {'tagName': childEle.tagName};//, 'class':childEle.getAttribute('class')};
				childProfile.push(profile);
			};
			return childProfile;
		}

		function getLinkedGroupId(mapLinkedGroupIdChildProfile, childProfile){

			var iLinkedGroupId = -1;
			var childProfile_inorder = [];
			var bExist = true;
			//travesal exist
			for(var iTempLinkedGroupId in mapLinkedGroupIdChildProfile){
				var tempChildProfile = mapLinkedGroupIdChildProfile[iTempLinkedGroupId];
					
				//judge two profile same or not
				for(var i = 0; i < tempChildProfile.length; i ++){
					var tempEleProfile = tempChildProfile[i];
					var iIndex = -1;
					for(var j = 0; j < childProfile.length; j ++){
						var thatEleProfile = childProfile[j];
						if(tempEleProfile.tagName == thatEleProfile.tagName){//} && tempEleProfile.class == thatEleProfile.class){
							//same
							iIndex = j;
							break;
						}
					}
					if(iIndex == -1){
						//not exist
						bExist = false;
						break;
					}else{
						childProfile.splice(iIndex, 1);
					}
				}

				if(bExist){
					iLinkedGroupId = iTempLinkedGroupId;
					childProfile_inorder = tempChildProfile;
					break;
				}
			}
			var result = {};
			if(bExist){
				//exist
				result = {
					'groupId': iLinkedGroupId,
					'childProfile': childProfile_inorder,
					};
			}else{
				result = {
					'groupId': -1,
					'childProfile': undefined,
				}
			}
			return result;
		}

		function getChildListByProfile(childrenList, childProfile){
			var newChildrenList = [];
			var visitedIndexList = [];
			for (var i = 0; i < childProfile.length; i++) {
				var eleProfile = childProfile[i];
				for (var j = 0; j < childrenList.length; j ++) {
					if(visitedIndexList.indexOf(j) >= 0)
						continue;
					var childrenEle = childrenList[i];
					if(childrenEle.tagName == eleProfile.tagName && childrenEle.class == eleProfile.class){
						newChildrenList.push(childrenEle);
						visitedIndexList.push(j);
						break;
					}
				};
			};
			return newChildrenList;
		}
	}

	//function: detect the group by mask
	Info.detectGroupsbyMask = function(){
		//LMTODO
	}

	Info.clear = function() {
		Info.m_liOGroupId = [];
		Info.m_liVisibleGroupId = [];
		Info.m_mapOGroupIdElementIds = {};
		Info.m_mapOGroupIdAttr = {};
		Info.m_iSelectedGroupId = -1;
	}

	Info.__init__(iId, elementProperties);
	
	return Info;
};

// var g_ObjectGroupManager = new ObjectGroupManager;

/*
	class: object panel info: the relative renderinfo 
	left-top point: 0, 0
*/

function ObjectPanelInfo(){

	var Info = new Object;

	//static render info
	Info.m_StaticRenderInfo = {
		'topPad': 3,
		'bottomPad': 3,
		'leftPad': 3,
		'rightPad': 3,

		//pad in a part
		'withinoriginXPad': 3,
		'withinoriginYPad': 3,

		//height pad between different parts
		'titleoriginPad':3,
		'origindefinedPad': 3
	};

	Info.m_ObjectRenderInfo = {
		'ltwidth': 20,
		'lrwidthgap': 5,
		'tbheightgap': 5,
		'ltheight': 10,
		'fontSize': 10,
		'bheight': 10
	};

	Info.m_titleFontSize = 12;

	/* Geo Info */
	Info.m_ObjectGroupRenderInfo = {};//the whole group panel
	Info.m_mapGroupIdRenderInfo = {};//the map from group id to its render info 

	//left,top,width,height
	Info.m_TitleRenderInfo = {};//the title part
	Info.m_OriginGroupsRenderInfo = {};//the origin group part	
	Info.m_DefinedGroupsRenderInfo = {};//the defined group part

	/* Geo Info */
	//generate render info
	Info.computeObjectPanelRenderInfo = function(panelWidth){

		var self = this;

		self.m_ObjectGroupRenderInfo['width'] = panelWidth;	

		//compute title part
		self.computeTitleRenderInfo();

		//compute origin part
		self.computeOriginRenderInfo();

		//compute defined part
		self.computeDefinedRenderInfo();
	
		self.m_OriginGroupsRenderInfo['height'] = self.m_DefinedGroupsRenderInfo['top'] + self.m_DefinedGroupsRenderInfo['height'] + self.m_StaticRenderInfo['bottomPad'];
	}

	//compute the renderinfo of title
	Info.computeTitleRenderInfo = function(){
		var TitleSize = getTextSize(self.m_TitleContent, self.m_titleFontSize + 'px');
		this.m_TitleRenderInfo['left'] = this.m_StaticRenderInfo['leftPad'];
		this.m_TitleRenderInfo['top'] = this.m_StaticRenderInfo['topPad'];
		this.m_TitleRenderInfo['width'] = TitleSize['w'];
		this.m_TitleRenderInfo['height'] = TitleSize['h'];
	}

	//compute the renderinfo of origin part
	Info.computeOriginRenderInfo = function(){
		var self = this;

		//left-top point	
		self.m_OriginGroupsRenderInfo['left'] = self.m_StaticRenderInfo['leftPad'], 
		self.m_OriginGroupsRenderInfo['top'] = self.m_TitleRenderInfo['top'] + self.m_TitleRenderInfo['height'] + self.m_StaticRenderInfo['titleoriginPad'];

		//for the origin group
		var ltpos = {
			'x': self.m_OriginGroupsRenderInfo['left'],
			'y': self.m_OriginGroupsRenderInfo['top']
		};

		var originGroupHeight = 0;
		var originGroupWidth = self.m_ObjectGroupRenderInfo['width'] - self.m_StaticRenderInfo['leftPad'] - self.m_StaticRenderInfo['rightPad'];
		
		var liGroupId = g_ObjectGroupManager.getGroupIdList();
		$.each(liGroupId, function(i, iGroupId){

			var liEleIds = g_ObjectGroupManager.getEleIdsbyGroupId(iGroupId),
				EleNum = liEleIds.length;
			var sAbstract = g_ObjectGroupManager.getAttrsbyGroupId(iGroupId);
			var sType = sAbstract['name'];
			var OGroupRenderSize = self.computeOGroupRenderSize(sType, EleNum); //width, height

			var objectRenderInfo = {};
			objectRenderInfo['left'] = ltpos['x'];
			objectRenderInfo['top'] = ltpos['y'];

			if (originGroupHeight == 0)
				originGroupHeight += OGroupRenderSize['height'];

			if (ltpos['x'] + OGroupRenderSize['width'] >= originGroupWidth) {
				var rowHeight = (OGroupRenderSize['height'] + self.m_StaticRenderInfo['withinoriginYPad']);
				originGroupHeight['height'] += rowHeight;
				ltpos['x'] = self.m_OriginGroupsRenderInfo['left'];
				ltpos['y'] += rowHeight;
			} else {
				ltpos['x'] += OGroupRenderSize['width'] + self.m_StaticRenderInfo['withinoriginXPad'];
			}
			objectRenderInfo['width'] = OGroupRenderSize['width'];
			objectRenderInfo['height'] = OGroupRenderSize['height'];
			self.m_mapGroupIdRenderInfo[iGroupId] = objectRenderInfo;
		});

		self.m_OriginGroupsRenderInfo['width'] = originGroupWidth;
		self.m_OriginGroupsRenderInfo['height'] = originGroupHeight;
	}

	//compute the renderinfo of defined part
	Info.computeDefinedRenderInfo = function(){
		var self = this;
		self.m_DefinedGroupsRenderInfo['top'] = self.m_OriginGroupsRenderInfo['top'] + self.m_OriginGroupsRenderInfo['height'] + self.m_StaticRenderInfo['origindefinedPad'];
		self.m_DefinedGroupsRenderInfo['left'] = self.m_StaticRenderInfo['leftPad'];
		self.m_DefinedGroupsRenderInfo['width'] = 0;
		self.m_DefinedGroupsRenderInfo['height'] = 0;
	}

	//compute the renderinfo of a group, return {width, height}
	Info.computeOGroupRenderSize = function(sType, EleNum){
		var OGroupRenderInfo = {};
		var textSize = getTextSize('' + EleNum, this.m_ObjectRenderInfo['fontSize']);
		OGroupRenderInfo['width'] = this.m_ObjectRenderInfo['ltwidth'] + this.m_ObjectRenderInfo['lrwidthgap'] + textSize['w'];
		OGroupRenderInfo['height'] = textSize['h'] + this.m_ObjectRenderInfo['tbheightgap'] + this.m_ObjectRenderInfo['bheight'];
		return OGroupRenderInfo;
	}

	/*** get info ***/
	//get the object-panel width
	Info.getPanelWidth = function(){
		return this.m_ObjectGroupRenderInfo['width'];
	}
	//get the object-panel height
	Info.getPanelHeight = function() {
		return this.m_ObjectGroupRenderInfo['height'];
	}
	//get the renderinfo given a group id
	Info.getGroupRenderInfo = function(iGroupId){
		return this.m_mapGroupIdRenderInfo[iGroupId];
	}
	//get the renderinfo of the original group
	Info.getOriginGroupRenderInfo = function(){
		return this.m_OriginGroupsRenderInfo;
	}
	//get the renderinfo of the defined group
	Info.getDefinedGroupRenderInfo = function(){
		return this.m_DefinedGroupsRenderInfo;
	}
	//clear
	Info.clear = function(){		
		this.m_OriginGroupsRenderInfo = {};
		this.m_ObjectGroupRenderInfo = {};
		this.m_mapGroupIdRenderInfo = {};
		this.m_DefinedGroupsRenderInfo = {};
	}

	Info.__init__();
	return Info;
};

// var g_ObjectPanelInfo = new ObjectPanelInfo;