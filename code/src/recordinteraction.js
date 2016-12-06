var g_InteractionInfo = {

	//region create
	regioncreatecount: 0,

	//special property function	
	derivepropertycount: 0,
	hybridpropertycount: 0, //2D scatter plot
		
	//object function
	compoundgroupcount: 0,
	origingroupcount: 0,
	propertygroupcount: 0,
	logicgroupcount: 0,

	logiccompositioncount: 0,

	//minor function
	renamepropertycount: 0,
	renameobjectcount: 0,
	removepropertycount: 0,
	removeobjectcount: 0,

	//share
	shareexplorecount: 0,
	exploreothercount: 0,
};


function InteractionRecorder(){
	var Info = new Object;

	//
	Info.addRegionCreateCount = function(){
		g_InteractionInfo.regioncreatecount += 1;
	}

	//derive property
	Info.addDerivePropertyCount = function(){
		g_InteractionInfo.derivepropertycount += 1;
	}

	//2d scatter plot count
	Info.addHybridPropertyCount = function(){
		g_InteractionInfo.hybridpropertycount += 1;
	}

	//explore the compound group
	Info.addExploreCompoundGroup = function(){
		g_InteractionInfo.compoundgroupcount += 1;
	}

	//explore the origin group 
	Info.addExploreOriginGroup = function(){
		g_InteractionInfo.origingroupcount += 1;
	}

	//explore the property group
	Info.addExplorePropertyGroup = function(){
		g_InteractionInfo.propertygroupcount += 1;
	}

	//explre the logic group
	Info.addExploreLogicGroup = function(){
		g_InteractionInfo.logicgroupcount += 1;
	}

	//logic composition of groups
	Info.addLogicCount = function(){
		g_InteractionInfo.logiccompositioncount += 1;
	}

	Info.addRenamePropertyCount = function(){
		g_InteractionInfo.renamepropertycount += 1;
	}

	Info.addRenameObjectCount = function(){
		g_InteractionInfo.renameobjectcount += 1;
	}

	Info.addRemovePropertyCount = function(){
		g_InteractionInfo.removepropertycount += 1;
	}

	Info.addRemoveObjectCount = function(){
		g_InteractionInfo.removeobjectcount += 1;
	}	

	//share and explore others 
	Info.addShareExploreCount = function(){
		g_InteractionInfo.shareexplorecount += 1;
	}

	Info.addExploreOtherCount = function(){
		g_InteractionInfo.exploreothercount += 1;
	}

	Info.clear = function(){
		g_InteractionInfo = {

			regioncreatecount: 0,

			//special property function	
			derivepropertycount: 0,
			hybridpropertycount: 0, //2D scatter plot
				
			//object function
			compoundgroupcount: 0,
			origingroupcount: 0,
			propertygroupcount: 0,
			logicgroupcount: 0,

			logiccompositioncount: 0,

			//minor function
			renamepropertycount: 0,
			renameobjectcount: 0,
			removepropertycount: 0,
			removeobjectcount: 0,

			//share
			shareexplorecount: 0,
			exploreothercount: 0,
		}
	}

	return Info;
}

var g_InteractionRecorder = new InteractionRecorder();