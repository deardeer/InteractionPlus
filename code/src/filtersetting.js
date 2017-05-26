//deal with the filter setting

function FilterSettingInfo(mID, objectGroupManager, propertyManager){
	
	var Info = new Object;

	Info.__init__ = function(mID, objectGroupManager, propertyManager){
		this.m_iId = mID;
		this.m_ObjectGroupManager = objectGroupManager;
		this.m_PropertyManager = propertyManager;
	}

	//generate the filtering setting of current Add-on Filter
	Info.generateFilterSetting = function(){

		var filterSetting = {};

		// filterSetting.flagId = 1;
		filterSetting.caseUrl = window.location.href;

		if(isUrlSpecial(filterSetting.caseUrl)){
			filterSetting.caseUrl = getFakeUrlbyRealUrl(filterSetting.caseUrl);
		}

		filterSetting.userName = USER;

		//1. get the defined region geo-info		
		filterSetting.defineRegionInfo = this.extractDefinedRect();

		//1.t get the name of the origin, default_compound groups
		filterSetting.defaultGroupInfoMap = this.extractDefaultGroupInfo();

		//2. get the new created group not the origin ones
		filterSetting.newGroupInfoList = this.extractNewCreateGroupInfo();
				
	    //3. get the invisibleGroupIdList 
	    filterSetting.invisibleGroupIdList = this.extractInvisibleGroupIdList();

	    //3.5 
	    filterSetting.selectedGroupId = this.m_ObjectGroupManager.getSelectedGroupId();
		
	    //4. get the derived properties and the name of the properties of all groups
	    filterSetting.mapGroupDerivedPropertyNameDefinition = this.extractDerivedPropertyNameDefinition();
	    filterSetting.mapGroupIdProNameList = this.extractGroupProNameMap();
	
		//todo
		return filterSetting;
	}

	//save 1: the defined rect
	Info.extractDefinedRect = function(){
		var defineRegionInfo = {
			left: Number($('#define_region_rect' + this.m_iId).attr('x')),
			top: Number($('#define_region_rect' + this.m_iId).attr('y')),
			height: Number($('#define_region_rect' + this.m_iId).attr('height')),
			width: Number($('#define_region_rect' + this.m_iId).attr('width')),
		};
		return defineRegionInfo;
	}

	//save 1: the default (origin, default_compound) group info
	Info.extractDefaultGroupInfo = function(){
		var groupIdNameMap = {};
		var liGroupId = this.m_ObjectGroupManager.getGroupIdList();
		for (var i = 0; i < liGroupId.length; i++) {
			var iGroupId = liGroupId[i];
			var groupName = this.m_ObjectGroupManager.getGroupNamebyId(iGroupId);
			groupIdNameMap[iGroupId] = groupName;
		};
		return groupIdNameMap;
	}

	//save 2: the new created group info
	Info.extractNewCreateGroupInfo = function(){
		var newGroupInfoList = [];
		
		//get the group id list
		var liGroupId = this.m_ObjectGroupManager.getGroupIdList();
		liGroupId.sort();
		for (var i = 0; i < liGroupId.length; i++) {
			var iGroupId = liGroupId[i];
			var groupType = this.m_ObjectGroupManager.getGroupType(iGroupId);
			if(groupType == 'origin' || groupType == 'default_compound'){
				continue;
			}
			var attr = this.m_ObjectGroupManager.getGroupAttrbyId(iGroupId);
			var liEleId = this.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			var groupInfo = {
				attr: attr,
				liEleId: liEleId,
			}
			newGroupInfoList.push(groupInfo);
		};

		return newGroupInfoList;
	}

	//save 3: extract the invisible group id list
	Info.extractInvisibleGroupIdList = function(){
		return this.m_ObjectGroupManager.getInVisibleGroupIdList();
	}

	//save 4: extract the derived properties
	Info.extractDerivedPropertyNameDefinition = function(){
		var mapGroupDerivedPropertyNameDefinition = {};
		//get all the group ids
		var liGroupId = this.m_ObjectGroupManager.getGroupIdList();
		for(var i = 0; i < liGroupId.length; i ++){
			var iGroupId = liGroupId[i];
			var propertyBag = this.m_PropertyManager.getPropertyBag(iGroupId);
			var liDerivedPropertyId = propertyBag.getDerivedPropertyIds();
			liDerivedPropertyId.sort();
			var liDerivedProNameDefinition = [];
			for (var j = 0; j < liDerivedPropertyId.length; j ++) {
				var derivedPropertyId = liDerivedPropertyId[j];
				var proName = propertyBag.getPropertyNamebyId(derivedPropertyId);
				var proDefinition = propertyBag.getDerivedPropertyDefinition(derivedPropertyId);
				var proNameDefinition = {
					proName: proName,
					proDefinition: proDefinition,
				};
				liDerivedProNameDefinition.push(proNameDefinition);
			};
			mapGroupDerivedPropertyNameDefinition[iGroupId] = liDerivedProNameDefinition;
		}
		return mapGroupDerivedPropertyNameDefinition;
	}

	//save 5: extract the new property name
	Info.extractGroupProNameMap = function(){
		var mapGroupIdProNameList = {};

		//get all the group ids
		var liGroupId = this.m_ObjectGroupManager.getGroupIdList();
		for(var i = 0; i < liGroupId.length; i ++){
			var iGroupId = liGroupId[i];
			var propertyBag = this.m_PropertyManager.getPropertyBag(iGroupId);
			var liPropertyId = propertyBag.getPropertyIds();
			var liPropertyIdName = [];
			for (var j = 0; j < liPropertyId.length; j ++) {
				var iPropertyId = liPropertyId[i];
				var propertyName = propertyBag.getPropertyNamebyId(iPropertyId);
				var properIdName = {
					propertyId: iPropertyId,
					propertyName: propertyName,
				};
				liPropertyIdName.push(properIdName);
			};
			mapGroupIdProNameList[iGroupId] = liPropertyIdName;
		}
		return mapGroupIdProNameList;
	}

	//post the filter setting to the server
	Info.postFilterSetting = function(filterSetting){
		//ajax 'post' to server
		var iFlagId = 1;
		//todo: communicate with server, save to DB, return a ID
		return iFlagId;
	}

	//load the filter setting from server
	Info.loadFilterSetting = function(iFlagId){
		var filterSetting = {};
		//todo: get the filtersetting
		return filterSetting;
	}

	Info.__init__(mID, objectGroupManager, propertyManager);

	return Info;
}

// var g_FilterSettingInfo = new FilterSettingInfo();

// //add the flagbuttons, 
// function addAllFlagButtons(){
// 	addTopFlagButtons(-1);
// }


