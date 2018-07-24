/*
	InOjbManager: manage the list of InObj
*/
function InObjManager(){
	var Info = {};
	//key: id, value: InObj
	Info.m_iCounter = 0;
	Info.m_CurrentObjId = -1;
	Info.m_mapIdInObj = {};

//~~~~~~~~~~ API for Drag Select Rect ~~~~~~~~~~~~//
	Info.dragSelectRectOfInObj = function(iId, rect){
		var inObj = this.m_mapIdInObj[iId];
		if(inObj == undefined)
			return;
		inObj.dragSelectRect(rect);
	}

	Info.extractGlobalRectOfInObj = function(iId){

		var inObj = this.m_mapIdInObj[this.addInObj()];
		this.m_CurrentObjId = inObj.getId();
		if(inObj == undefined)
			return;
		inObj.finishSelectRect_GlobalAdaptive();
	}

	
	Info.finishSelectRectOfInObj = function(iId){
		var inObj = this.m_mapIdInObj[iId];
		if(inObj == undefined)
			return;
		inObj.finishSelectRect_Adaptive();
	}

	Info.setCurrentObjId = function(iId){
		this.m_CurrentObjId = iId;
	}

	Info.getCurrentObjId = function(){
		return this.m_CurrentObjId;
	}

	Info.getCurrentObj = function(){
		return this.getInObj(this.m_CurrentObjId);
	}


//~~~~~~~~~~ Obj List ~~~~~~~~~~~~//
	Info.clear = function(){
		var liId = Object.keys(this.m_mapIdInObj);
		for (var i = liId.length - 1; i >= 0; i--) {
			var iId = liId[i];
			var inObj = this.getInObj(iId);
			inObj.m_ObjectGroupManager.setSelectedGroupId(-1);
			inObj.m_CrossFilter.clearFilterToWhole();
		};
		this.m_mapIdInObj = {};
		this.m_iCounter = 0;
		this.m_CurrentObjId = -1;
	}

	//add a InObj, return valid id
	Info.addInObj = function(bMask, maskType){		
		var iId = this.getNextValidId();
		var inObj = new InObj(iId, bMask, maskType);
		this.m_mapIdInObj[iId] = inObj;
		return iId;
	}

	Info.getCurrentInObj = function(){
		if(this.m_CurrentObjId != -1)
			return this.getInObj(this.m_CurrentObjId);
		return {};
	}

	Info.getInObj = function(iId){
		return this.m_mapIdInObj[iId];
	}

	//remove a InObj
	Info.removeInObj = function(iId){
		var inObj = this.getInObj(iId);
		inObj.m_ObjectGroupManager.setSelectedGroupId(-1);
		inObj.m_CrossFilter.clearFilterToWhole();
		delete this.m_mapIdInObj[iId];
	}

	Info.getNextValidId = function(){
		this.m_iCounter += 1;
		return this.m_iCounter;
	}

	return Info;
}




