//Class: property manager

var DEFAULTBINNUM = 30;

function PropertyManager(iId, inObj, objectGroupManager, elementDetector){

	var Info = new Object;

	Info.m_mapGroupIdPropertyBag = {};//map from group id to properties bag

	Info.__init__ = function(iId, inObj, objectGroupManager, elementDetector){
		//console.log(" init property manager ", objectGroupManager);
		this.m_iId = iId;
		this.m_ObjectGroupManager = objectGroupManager;
		this.m_ElementProperties = elementDetector.m_ElementProperties;
	}
	
	//get the properties by group id
	Info.getPropertyBag = function(iGroupId){
		if(this.m_mapGroupIdPropertyBag[iGroupId] == undefined)
			this.computeProperties(iGroupId);
		return this.m_mapGroupIdPropertyBag[iGroupId];
	}

	//analyse the informatics of attributes 
	Info.analyseAttributesOfGroups = function(liGroupId){
		var liPropertyName = [];
		for(var i = 0; i < liGroupId.length; i ++){				
			var propertyBag = this.getPropertyBag(liGroupId[i]);
			var liPropertyName_temp = propertyBag.getPropertyNames();
			for(var j = 0; j < liPropertyName_temp.length; j ++){
				if(liPropertyName.indexOf(liPropertyName_temp[j]) == -1)
					liPropertyName.push(liPropertyName_temp[j])
			}				
		}
		console.log(' property name = ', liPropertyName);
		return liPropertyName;
	}

	Info.analyseLayoutOfGroups = function(iGroupId){
		return 'linear';
	}

	//compute the properties of object groups
	Info.computeProperties = function(iGroupId){
		//console.log(" compute getPropertyBag ");
		var self = this;
		// //console.log('compute properties');
		var bOrigin = self.m_ObjectGroupManager.isOriginGroup(iGroupId);
		var type = self.m_ObjectGroupManager.getGroupType(iGroupId);
		var propertyBag = new PropertyBag(iGroupId, bOrigin, self.m_ObjectGroupManager);
		if(type == 'origin' || type == 'propertygroup' || type == 'logic'){
			//if origin
			var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
			//add each ele
			$.each(liEleId, function(index, iEleId){
				var visualpro = self.m_ElementProperties.getVisualElePropertiesbyId(iEleId);
				for (var protype in visualpro){
					// if(protype == 'g_x')
						//console.log(' g_x ', visualpro[protype] );
				 	propertyBag.addPro(iEleId, protype, visualpro[protype], 1);
				 	console.log(' add pro ', iEleId, protype, visualpro[protype]);
				}			
			});
			//compute the distri.
			propertyBag.computeDistri();
		}else if(type == 'compound' || type == 'default_compound' || type == 'logic_compound'){
			//if compound
			var liEleIds = self.m_ObjectGroupManager.getEleIdListsbyGroupId(iGroupId);
				
			for (var i = liEleIds.length - 1; i >= 0; i --) {
				var liEleId = liEleIds[i];
				for (var j = liEleId.length - 1; j >= 0; j --) {
					var iEleId = liEleId[j];
					var visualpro = self.m_ElementProperties.getVisualElePropertiesbyId(iEleId);
					for (var protype in visualpro){
					 	propertyBag.addPro(iEleId, protype, visualpro[protype], j);
					}	
				};
			};
			//compute the distri.
			propertyBag.computeDistri();
		}
		this.m_mapGroupIdPropertyBag[iGroupId] = propertyBag;
	}

	//create the derived property for group id
	Info.createADerivedProperty = function(iGroupId, propertyName, propertyDefinition){

		//console.log(' create a derived property ');

		var self = this;

		//check the group is origin/proerty or compound		
		var type = self.m_ObjectGroupManager.getGroupType(iGroupId);

		// if(type == 'compound'){
		// //only handle the origin/property case currently
		// 	return;
		// }

		var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);

		//set the propertybag
		var propertyBag = self.m_mapGroupIdPropertyBag[iGroupId];
		var iPropertyId = propertyBag.setADerivedPro(propertyName, propertyDefinition);

		//parse the para
		var parseResult = propertyBag.parseDefinition(iPropertyId, 'q');
		// //console.log(" parseResult: ", parseResult);
		var mapParaIndexName = parseResult['paramap'];
		var paraEquation = parseResult['definition'];

		//check for the compound or not
		// var mapPropertyIdCompoundIndex = {};
		var propertyCompoundIndex = undefined;

		// //console.log('Compound Index Map ', propertyBag.m_mapCompoundIndexPropertyIds);

		if(type == 'compound' || type == 'default_compound' || type == 'logic_compound'){
			//check for all the para are in the same compound index
			for(var iIndex in mapParaIndexName){
				var paraName = mapParaIndexName[iIndex];
				var paraId = propertyBag.getProertyidbyUniqName(paraName);
				var paraCompoundIndex = propertyBag.getCompoundIndexofProperty(parseInt(paraId));
				
				// //console.log(' 1111 paraCompoundIndex ', paraCompoundIndex, ' , ', paraId);
				if(propertyCompoundIndex == undefined)
					propertyCompoundIndex = paraCompoundIndex;
				else if(propertyCompoundIndex != paraCompoundIndex){
					// alert('Unsupported Definition');
					// propertyBag.removeADerivedPro(iPropertyId, propertyName);
					propertyCompoundIndex = propertyBag.getNextCompoundIndex();
					// return -1;
				}

				// mapPropertyIdCompoundIndex[paraId] = propertyCompoundIndex;
			}
		}else{
			propertyCompoundIndex = 1;
		}

		// //console.log("[0] q: ", q);
		//console.log("[1'] equation: ", paraEquation, ' , ', mapParaIndexName, ' propertyCompoundIndex ', propertyCompoundIndex);

		var mapPropertyNameId = {};
		for(var iIndex in mapParaIndexName){
			var paraName = mapParaIndexName[iIndex];
			var paraId = propertyBag.getProertyidbyUniqName(paraName);
			mapPropertyNameId[paraName] = paraId;
		}

		// //console.log(' 2 ');
		// //console.log(" map ProertyName ", mapPropertyNameId);

		try{
			// //console.log(' 3 ');

			for (var i = 0; i < liEleId.length; i++){
				var iEleId = liEleId[i];
				//console.log(iEleId.length);

			// };
			// $.each(liEleId, function(i, iEleId){				
			//get the paralist
			var q = {};
			var iFinalEleId;
			for (var iIndex in mapParaIndexName){
				var paraName = mapParaIndexName[iIndex];
				// //console.log(' 4 ', mapPropertyNameId[paraName]);
				var result = propertyBag.getPropertyValueFromCompoundEles(mapPropertyNameId[paraName], iEleId);
				// //console.log(' result ', result);
				q[iIndex] = result.value;
				// iEleId = result.eleid;
			};	

			if(iEleId.length == undefined)
				iFinalEleId = iEleId;
			else
				iFinalEleId = iEleId[0];

			//console.log(" q = ", q);
			
			// //console.log("[0] q: ", q);
			// //console.log("[1] equation: ", paraEquation);

			var PropertyValue;
			//compute the derived property of elements
			try{
			    PropertyValue = eval(paraEquation);	
			    //console.log(' PropertyValue ', PropertyValue, paraEquation);
			}catch(err){
				throw 'error !!';
			}
			// //console.log(" property value = ", PropertyValue);
			//update the property bag			
			var propertyType = propertyBag.getPropertyNamebyId(iPropertyId);

		 	propertyBag.addPro(iFinalEleId, propertyType, PropertyValue, propertyCompoundIndex, iPropertyId);	
			}//)
		}catch(err){
			alert('Unsupported Definition 2');
			propertyBag.removeADerivedPro(iPropertyId, propertyName);		
			return -1;
		};				

		//compute the distri
		propertyBag.computeADistri(iPropertyId);
		return iPropertyId;
	}	

	Info.createAScatterPlot = function(iGroupId, iXPropertyId, iYPropertyId){
		var propertyBag = this.getPropertyBag(iGroupId);
		//init a scatter plot
		var iSPId = propertyBag.setAScatterPlot(iXPropertyId, iYPropertyId);
		//compute the scatter plot
		propertyBag.computeScatterPlot(iSPId);
		return iSPId;
	}

	// Info.createAMDS = function(iGroupId, liPropertyId){
	// 	var propertyBag = this.getPropertyBag(iGroupId);
	// 	//init a mds
	// 	var iMDSId = propertyBag.setAMDS(liPropertyId);
	// 	//compute the mds
	// 	propertyBag.computeMDS(iMDSId);
	// 	return iMDSId;
	// }

	Info.removeAScatterPlot = function(iGroupId, iSPId){
		var propertyBag = this.getPropertyBag(iGroupId);
		propertyBag.removeScatterPlot(iSPId);
	}

	Info.getPropertyFunctionList = function(){
		var operationList = ['+', '-', '*', '/', '?', '&lt', '&gt', '(', ')', '==', '&quot'];
		return operationList;
	}
	Info.getNumberList = function(){
		var numberList = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Math.PI', 'true', 'false'];
		return numberList;
	}

	Info.addGroupPropertyBag = function(iGroupId, propertyBag){
		this.m_mapGroupIdPropertyBag[iGroupId] = propertyBag;
	}

	//clear
	Info.clear = function(){
		this.m_mapGroupIdPropertyBag = {};
	}

	Info.__init__(iId, inObj, objectGroupManager, elementDetector);

	return Info;
}

// var g_PropertyManager = new PropertyManager;

//Class: properties of a group
function PropertyBag(iGroupId, bOrigin, objectGroupManager){

	var Info = new Object;

	Info.__init__ = function(objectGroupManager){
		this.m_ObjectGroupManager = objectGroupManager;
	}

	Info.m_defaultInvisiblePropertyList = ["font-weight", "fill-opacity", "font-size", "dx", "dy", "text-anchor", "stroke-opacity", "stroke", "z-index"];
	
	/* group, property */
	Info.m_iGroupId = iGroupId;
	Info.m_bOrigin = bOrigin; // origin group or compound group
	Info.m_mapPropertyPropertyIds = {};	
	Info.m_mapPropertyIdPropertyName = {};
	Info.m_mapPropertyIdUniName = {}; //start from 'a0-a9', 'b0-b9'...
	Info.m_liPropertyId = [];//list of property ids

	//visible propertyids
	Info.m_liVisiblePropertyId = [];

	/* property */
	Info.m_mapPropertyIdValueList = {}; 
	/*
	{
		propertyid:
		value: []
	}
	*/
	Info.m_mapPropertyIdDistri = []//map from property id to its info, including name, distri etc.
	/* {
		propertyid;
		count: []
	}*/ 
	Info.m_mapPropertyIdInfo = {};
	//info includes {
		//propertyid{
			// [{eleid, value},]
		// }

	/* distribution configure  */
	Info.m_mapPropertyIdDisConfig = {};
	/*
	{
		propertyid:
		getBin: a function
	}
	*/
	// //cached some selection
	// Info.m_mapPropertyIdBinIndexRangeListEleId = {}
	// /*
	// 	{
	// 		propertyid:
	// 		{binindexrangelist: eleid}
	// 	}
	// */

	//set the xyscale
	Info.m_mapPropertyIdXY = {};
	//{
		// propertyId: [xscale, yscale]
	//}

	//filtered distri
	Info.m_mapPropertyIdFilterDistri = {};
	//{
		//propertyid:
		//count: []
	//}

	//FOR Compound type, the map from eleindex-types
	Info.m_mapCompoundIndexPropertyIds = {};
	//{
	// index: [propertyid]
	//}
	Info.m_mapCompoundIndexPropertyTypes = {};
	//{index: [propertytype]}
	
	/* derived property related */
	Info.m_mapPropertyIdDerivedDefinition = {};
	/*
	{
		propertyid:
		definition: string
	}
	*/

	/* scatter plot related */
	Info.m_mapSPIdXYPropertyId = {};
	/*
	{
		scatterplotId: {x: propertyid, y: propertyid}
	}
	*/
	Info.m_mapSPIdScatterPlotConfig = {}
	Info.m_mapSPIdFilterDis = {};

	//MDS
	// Info.m_mapMDSIdConfig = {};
	Info.m_mapMDSIdPropertyIds = {};

	Info.m_mapSPIdScale = {};

	//add a pro of ele
	Info.addPro = function(iEleId, PropertyType, PropertyValue, CompoundIndex, iPropertyId){
		// var iPropertyId = undefined;

		if(isNaN(PropertyValue) == false){
			// console.log(' Not PropertyValue ', PropertyValue);
			PropertyValue = Number(PropertyValue);
		}

		if(CompoundIndex != -1){
			//compound 
			var liProType = this.m_mapCompoundIndexPropertyTypes[CompoundIndex];
			if(liProType != undefined){			
				if(liProType.indexOf(PropertyType) != -1){
					//exist
					var iIndex = liProType.indexOf(PropertyType);
					var liProId = this.m_mapCompoundIndexPropertyIds[CompoundIndex];
					iPropertyId = liProId[iIndex];
				}
			}
		}else{
			var liProId = this.m_mapPropertyPropertyIds[PropertyType];
			if(liProId != undefined){
				//only one
				iPropertyId = liProId[0];
			}
		}

		//check if exist
		if(iPropertyId == undefined){
			//not exist, add a new propertyid
			iPropertyId = this.m_liPropertyId.length;
			this.m_liPropertyId.push(iPropertyId);
			var unitName = String.fromCharCode(('a'.charCodeAt(0) + parseInt(iPropertyId/10))) + iPropertyId%10;
			this.m_mapPropertyIdUniName[iPropertyId] = unitName;

			//console.log(" PropertyType ", PropertyType);
			if(this.m_defaultInvisiblePropertyList.indexOf(PropertyType) == -1){
				this.m_liVisiblePropertyId.push(iPropertyId);
			}

			// if(PropertyType == 'value'){
			// 	//console.log('Text Value ', PropertyValue);
			// }

			if(this.m_mapPropertyPropertyIds[PropertyType] == undefined)
				this.m_mapPropertyPropertyIds[PropertyType] = [iPropertyId];
			else
				this.m_mapPropertyPropertyIds[PropertyType].push(iPropertyId);
			var PropertyInfo = {};
			PropertyInfo = {'eleid': iEleId, 'provalue': PropertyValue};
			this.m_mapPropertyIdInfo[iPropertyId] = [PropertyInfo];
			this.m_mapPropertyIdValueList[iPropertyId] = [PropertyValue];

			if(CompoundIndex != -1){
				if(this.m_mapCompoundIndexPropertyTypes[CompoundIndex] == undefined)
					this.m_mapCompoundIndexPropertyTypes[CompoundIndex] = [PropertyType];
				else
					this.m_mapCompoundIndexPropertyTypes[CompoundIndex].push(PropertyType);
			}
		}else{
			//update the proper info
			var PropertyInfo = {};
			PropertyInfo = {'eleid': iEleId, 'provalue': PropertyValue};

			if(PropertyType == 'value'){
				//console.log('Text Value ', PropertyValue);
			}

			if(this.m_mapPropertyIdInfo[iPropertyId] == undefined)
				this.m_mapPropertyIdInfo[iPropertyId] = [PropertyInfo];
			else
				this.m_mapPropertyIdInfo[iPropertyId].push(PropertyInfo);
			if(this.m_mapPropertyIdValueList[iPropertyId] == undefined)
				this.m_mapPropertyIdValueList[iPropertyId] = [PropertyValue];
			else
				this.m_mapPropertyIdValueList[iPropertyId].push(PropertyValue);
		}

		//if compoundindex != -1
		if(CompoundIndex != -1){
			var ProIds = this.m_mapCompoundIndexPropertyIds[CompoundIndex];
			if(ProIds == undefined){
				ProIds = [iPropertyId];
			}else{
				if(ProIds.indexOf(iPropertyId) == -1)
					ProIds.push(iPropertyId);
			}
			this.m_mapCompoundIndexPropertyIds[CompoundIndex] = ProIds;
		}
	}	


	//set a new derived property
	Info.setADerivedPro = function(propertyName, propertyDefinition){
		var self = this;
		var propertyType = propertyName;
		var liProId = this.m_mapPropertyPropertyIds[propertyName];
		var iPropertyId = undefined;
		if(liProId != undefined){
			//only one
			iPropertyId = liProId[0];
		}
		if(iPropertyId == undefined){
			//new 
			iPropertyId = self.m_liPropertyId.length;
			self.m_liPropertyId.push(iPropertyId);			
			var unitName = String.fromCharCode(('a'.charCodeAt(0) + parseInt(iPropertyId/10))) + iPropertyId%10;
			this.m_mapPropertyIdUniName[iPropertyId] = unitName;
		
		}
		self.m_mapPropertyIdDerivedDefinition[iPropertyId] = propertyDefinition;
		self.m_mapPropertyPropertyIds[propertyName] = [iPropertyId];
		self.m_mapPropertyIdPropertyName[iPropertyId] = propertyName;
		self.m_liVisiblePropertyId.push(iPropertyId);
		// //console.log(" [1] ", self.m_mapPropertyIdDerivedDefinition);

		return iPropertyId;
	}

	//remove a derived property
	Info.removeADerivedPro = function(iPropertyId, propertyName){
		var self = this;
		delete self.m_mapPropertyIdDerivedDefinition[iPropertyId];
		var iIndex = -1;
		var liPropertyId = self.m_mapPropertyPropertyIds[propertyName];
		iIndex = liPropertyId.indexOf(iPropertyId);
		liPropertyId.splice(iIndex, 1);
		self.m_mapPropertyPropertyIds[propertyName] = liPropertyId;
		delete self.m_mapPropertyIdPropertyName[iPropertyId];
		iIndex = self.m_liVisiblePropertyId.indexOf(iPropertyId);
		self.m_liVisiblePropertyId.splice(iIndex, 1);
	}

	//set a scatter plot
	Info.setAScatterPlot = function(iXPropertyId, iYPropertyId){
		var self = this;
		//console.log(' iXP = ', iXPropertyId, ' , iYP = ', iYPropertyId);
		var iScatterPropertyId = Object.keys(self.m_mapSPIdXYPropertyId).length;
		self.m_mapSPIdXYPropertyId[iScatterPropertyId] = {'x': iXPropertyId, 'y': iYPropertyId};
		
		//scatter plot config
		var xConfig = self.getDisConfig(iXPropertyId);
		var yConfig = self.getDisConfig(iYPropertyId);
		var iXBinNum = xConfig.binNum;
		var iYBinNum = yConfig.binNum;

		var scatterPlotConfig = {};

		scatterPlotConfig['ixPropertyId'] = iXPropertyId;
		scatterPlotConfig['iyPropertyId'] = iYPropertyId;
		scatterPlotConfig['ixBinNum'] = iXBinNum;
		scatterPlotConfig['iyBinNum'] = iYBinNum;
		scatterPlotConfig['liPlotValue'] = [];

		scatterPlotConfig['getValueIndex'] = function(iXIndex, iYIndex){
			var iValueIndex = iXIndex * this.iyBinNum + iYIndex;
			return iValueIndex;
		}
		scatterPlotConfig['getXYIndex'] = function(iIndex){
			var x = parseInt(iIndex/(this.iyBinNum));
			var y = parseInt(iIndex%this.iyBinNum);
			return {'x': x, 'y': y};
		};
		scatterPlotConfig['getValue'] = function(iIndex){			
			return this.liPlotValue[iIndex];
		}
		//set the scatter plot config
		this.m_mapSPIdScatterPlotConfig[iScatterPropertyId] = scatterPlotConfig;
		return iScatterPropertyId;
	}

	//set a MDS
	Info.setAMDS = function(liPropertyId){
		var self = this;
		//console.log("set MDS");
		// liPropertyId ", liPropertyId);
		var iMDSId = Object.keys(self.m_mapMDSIdPropertyIds).length;
		var MDSConfig = {};
		MDSConfig['propertyList'] = liPropertyId;
		// this.m_mapMDSIdConfig[iMDSId] = MDSConfig;
		self.m_mapMDSIdPropertyIds[iMDSId] = liPropertyId;
		return iMDSId;
	}

	//parse the defniition 
	Info.parseDefinition = function(iPropertyId, substitute){
		var self = this;
		// //console.log(" [2] ", self.m_mapPropertyIdDerivedDefinition);
		
		var equation = self.m_mapPropertyIdDerivedDefinition[iPropertyId];
		
		if(equation == undefined) 
			return undefined;

		//remove the empty
		equation = equation.replace(/\s+/g,"");

		//get the property name list
		var liAllPropertyName = self.getPropertyNames();
		var liUniqName = self.getPropertyUniqNames();
		liAllPropertyName = liUniqName;
		// var liOperation = g_PropertyManager.getPropertyFunctionList();
		//console.log(' liPropertyName ', liAllPropertyName);
		//console.log(' liUniqName ', liUniqName);
		var mapWordIndex = {};
		var liRelatedPropertyName = [];

		for (var i = liAllPropertyName.length - 1; i >= 0; i--) {
			var propertyName = liAllPropertyName[i];
			var liIndex = self.getIndicesOf(propertyName, equation, false);
			if(liIndex.length != 0){
				for (var j = liIndex.length - 1; j >= 0; j--) {
					var iIndex = liIndex[j];
					mapWordIndex[iIndex] = propertyName;
					if(liRelatedPropertyName.indexOf(propertyName))
						liRelatedPropertyName.push(propertyName);
				};
			}
		};

		var parseResult = {};
		var mapParaIndexName = {};
		var paraDefition;

		//console.log('mapWordIndex ', mapWordIndex, ' involved properties: ', liRelatedPropertyName);
		//replace 
		for (var i = liRelatedPropertyName.length - 1; i >= 0; i--) {
			var propertyName = liRelatedPropertyName[i];
			var replacePropertyName = substitute + '[' + i + ']';
			mapParaIndexName[i] = propertyName;
			var replace_command = 'equation.replace(/'+propertyName+'/g, "'  + replacePropertyName + '");';
			//console.log(" equation ", equation, " replace command ", replace_command);
			equation = eval(replace_command);
		};
		paraDefition = equation;
		//console.log("substitute ", paraDefition);

		//get the defition
		parseResult['paramap'] = mapParaIndexName;
		parseResult['definition'] = paraDefition;
		return parseResult;
	}

	Info.getIndicesOf = function(searchStr, str, caseSensitive) {
	    var startIndex = 0, searchStrLen = searchStr.length;
	    var index, indices = [];
	    if (!caseSensitive) {
	        str = str.toLowerCase();
	        searchStr = searchStr.toLowerCase();
	    }
	    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
	        indices.push(index);
	        startIndex = index + searchStrLen;
	    }
	    return indices;
	}

	//get the ele id in the given eleidlist with given compoundindex
	Info.getEleIdByCompoundIndex = function(liEleId, CompoundIndex){

		var liPropertyId = this.m_mapCompoundIndexPropertyIds[CompoundIndex];



		for (var i = 0; i < liEleId.length; i++) {
			var iEleId = liEleId[i];
			if(liAllEleId.indexOf(iEleId) >= 0)
				return iEleId;
		};
		return -1;
	}

	//compute the distribution of all properties
	Info.computeDistri = function(){
		var self = this;
		$.each(self.m_liPropertyId, function(i, iPropertyId){
			var count = []; 

			var propertyType = self.getPropertyTypebyId(iPropertyId);
			//console.log(" compute Dis 0325", propertyType);
	
			var liValue = self.m_mapPropertyIdValueList[iPropertyId];
			var disConfig = self.getDisConfig(iPropertyId);

			if(propertyType == 'fill'){
				//console.log(" value list 0325", disConfig.valueList);
			}
			//init
			var iBinNum = disConfig.binNum;
			for (var i = 0; i < iBinNum; i++) {
				count.push(0);
			};

			for (var i = liValue.length - 1; i >= 0; i--) {
				var value = liValue[i];
			
				var binIndex = disConfig.getBinIndex(value);

				if(propertyType == 'fill'){
					//console.log(" bin index 0325 ", binIndex, ' value ', value);

					// if(this.minValue == this.maxValue){
					// 	return 0;
					// }
					// disConfig['getBinIndex'] = function(value){
					// var binIndex = this.valueList.indexOf(value);
					// // //console.log(' bin index !! ', binIndex, ' value ', value, ' valuelist ', this.valueList);					
					// return binIndex;
					console.log(' binIndex ', binIndex, count)
				}
				// if(isNaN(binIndex))
				count[binIndex] += 1;
				// //console.log(' Error ', binIndex);
			};
			// //console.log(' Dis of Property ', iPropertyId, 'value ', liValue, ' propertytype', self.getPropertyTypebyId(iPropertyId), ' : ', count);
			self.m_mapPropertyIdDistri[iPropertyId] = count;
		});
	}

	Info.computeADistri = function(iPropertyId){
		var self = this;
		var count = []; 

		var liValue = self.m_mapPropertyIdValueList[iPropertyId];
		var disConfig = self.getDisConfig(iPropertyId);
		//init
		var iBinNum = disConfig.binNum;
		for (var i = 0; i < iBinNum; i++) {
			count.push(0);
		};

		// //console.log(" count ", count);

		for (var i = liValue.length - 1; i >= 0; i--) {
			var value = liValue[i];
			var binIndex = disConfig.getBinIndex(value);
			// if(isNaN(binIndex))
			count[binIndex] += 1;
			// //console.log(' Error ', binIndex);
		};
		// //console.log(' Dis of Property ', iPropertyId, 'value ', liValue, ' propertytype', self.getPropertyTypebyId(iPropertyId), ' : ', count);
		self.m_mapPropertyIdDistri[iPropertyId] = count;
	}	
	//compute the scatter plot
	Info.computeScatterPlot = function(iScatterPlotId){
		var self = this;

		//go throught the eleids
		var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(self.m_iGroupId);
		var scatterPlotCount = self.computeScatterPlotDis(iScatterPlotId, liEleId);
		var scatterPlotConfig = self.m_mapSPIdScatterPlotConfig[iScatterPlotId];
		scatterPlotConfig['SPValueList'] = scatterPlotCount;  
		self.m_mapSPIdScatterPlotConfig[iScatterPlotId] = scatterPlotConfig;
	}

	//compute the mds
	Info.computeMDS = function(liEleId, liPropertyId){

		var self = this;
		var EleDataList = [];

		for (var i = 0; i < liEleId.length; i ++){
			var iEleId = liEleId[i];
			var EleData = self.getPropertyValueList(iEleId, liPropertyId);// getPro();
			// if(i == liEleId.length - 1)
			// 	//console.log('EEE', EleData);
			EleDataList.push(EleData);
		};

		function computeDis(vector1, vector2){
			var dis = 0;
			for (var i = 0; i < vector1.length; i ++) {
				var a = vector1[i], b = vector2[i];
				dis += (a - b) * (a - b);
			};
			dis = Math.sqrt(dis);
			return dis;
		}

		//compute disMatrix
		var disMatrix = [];
		for (var i = 0; i < liEleId.length; i ++) {
			var iEleId_this = liEleId[i];
			var EleData_this = EleDataList[i];
			var disArray = [];
			for (var j = 0; j < liEleId.length; j ++){
				var iEleId_that = liEleId[j];
				var EleData_that = EleDataList[j];
				var Dis = computeDis(EleData_this, EleData_that);
				disArray.push(Dis);
			};
			disMatrix.push(disArray);
		};

		// //console.log('EEE', EleDataList);

		// var selectionArray = dataCenter.global_variable.selection_array;
		var mdsByDistance = window["MDS"]["byDistance"];
		var coordinate = mdsByDistance(disMatrix);
		//console.log("EEEE ", coordinate);

		return coordinate;
	}

	//remove the scatter plot
	Info.removeScatterPlot = function(iScatterPlotId){
		var self = this;
		delete self.m_mapSPIdScale[iScatterPlotId];
		delete self.m_mapSPIdXYPropertyId[iScatterPlotId];
		delete self.m_mapSPIdFilterDis[iScatterPlotId];
	}

	Info.computeScatterPlotDis  = function(iScatterPlotId, liEleId){

		var self = this;
		var xyPropertyId = self.m_mapSPIdXYPropertyId[iScatterPlotId];

		// //console.log(" xyPropertyId ", xyPropertyId);
	
		var iXPropertyId = xyPropertyId['x'];
		var iYPropertyId = xyPropertyId['y'];

		var scatterPlotConfig = self.m_mapSPIdScatterPlotConfig[iScatterPlotId];

		// //console.log(' scatter plot config ', scatterPlotConfig);

		var xPropertyConfig = self.getDisConfig(iXPropertyId);
		var yPropertyConfig = self.getDisConfig(iYPropertyId);

		var iXBinNum = xPropertyConfig.binNum;
		var iYBinNum = yPropertyConfig.binNum;

		//init
		var liScatterPlotCount = [];
		for (var i = 0; i < iXBinNum; i++) {
			for (var j = 0; j < iYBinNum; j++) {
				liScatterPlotCount.push(0);
			};
		};

		// //console.log(" scatter plot count ", liScatterPlotCount);

		var scatterPlotCount = [];

		//go throught the eleids
		for (var i = 0; i < liEleId.length; i++) {
			var iEleId = liEleId[i];
			var xValue = self.getPropertyValue(iXPropertyId, iEleId);
			var yValue = self.getPropertyValue(iYPropertyId, iEleId);
			var iXBinIndex, iYBinIndex;
			iXBinIndex = xPropertyConfig.getBinIndex(xValue);
			iYBinIndex = yPropertyConfig.getBinIndex(yValue);
			var iValueIndex = scatterPlotConfig.getValueIndex(iXBinIndex, iYBinIndex);
			liScatterPlotCount[iValueIndex] += 1;
		};

		for (var i = 0; i < liScatterPlotCount.length; i++) {
			if(liScatterPlotCount[i] > 0) 
				scatterPlotCount.push({'index': i, 'count': liScatterPlotCount[i]});			
		};
		return scatterPlotCount;	
	}

	//set the x, y scale of property
	Info.setXYScaleofPropertyId = function(iPropertyId, xScale, yScale){
		this.m_mapPropertyIdXY[iPropertyId] = [xScale, yScale];
	}

	Info.setSPSizeScale = function(iSPId, xScale, yScale, xSizeScale){
		this.m_mapSPIdScale[iSPId] = {'xscale': xScale, 'yscale': yScale, 'sizescale': xSizeScale};
	}

	Info.getSizeScalebySPID = function(iSPId){
		return this.m_mapSPIdScale[iSPId].sizescale;
	}

	Info.getXScalebySPID = function(iSPId){
		return this.m_mapSPIdScale[iSPId].xscale;
	}

	Info.getYScalebySPID = function(iSPId){
		return this.m_mapSPIdScale[iSPId].yscale;
	}

	//set the filtered ele 
	Info.setFilterEldIds = function(liFilteredEleId){

		var self = this;

		this.m_mapPropertyIdFilterDistri = {};
		
		//update the property
		$.each(self.m_liPropertyId, function(i, iPropertyId){
			var count = []; 
	
			var disConfig = self.getDisConfig(iPropertyId);
			//init
			var iBinNum = disConfig.binNum;
			for (var i = 0; i < iBinNum; i++) {
				count.push(0);
			};
			
			var propertyType = self.getPropertyTypebyId(iPropertyId);
		
			for (var i = liFilteredEleId.length - 1; i >= 0; i--) {
				var value = self.getPropertyValue(iPropertyId, liFilteredEleId[i]);
				if(value == undefined)
					continue;
				var binIndex = disConfig.getBinIndex(value);
				count[binIndex] += 1;
			};
			self.m_mapPropertyIdFilterDistri[iPropertyId] = count;
			// //console.log(' Dis of Property ', iPropertyId, ", ", count, ' size ', count.length);
		});

		//update the scatter plot
		for(var iSPID in self.m_mapSPIdScatterPlotConfig){
			var spConfig = self.m_mapSPIdScatterPlotConfig[iSPID];
			
			var scatterPlotCount = self.computeScatterPlotDis(iSPID, liFilteredEleId);
			// var scatterPlotConfig = self.m_mapSPIdScatterPlotConfig[iScatterPlotId];
			self.m_mapSPIdFilterDis[iSPID] = scatterPlotCount;
		}
	}

	//
	Info.getPropertyIdFilteredEleDis = function(){
		return this.m_mapPropertyIdFilterDistri;
	}

	//set the property name
	Info.setPropertyName = function(iPropertyId, propertyName){
		this.m_mapPropertyIdPropertyName[iPropertyId] = propertyName;
	}

	//set property visible or not
	Info.setPropertyVisible = function(iPropertyId, bVisible){
		if(!bVisible && this.m_liVisiblePropertyId.indexOf(iPropertyId) != -1){
			//remove
			var index = this.m_liVisiblePropertyId.indexOf(iPropertyId);
			this.m_liVisiblePropertyId.splice(index, 1);
		}
		if(bVisible && this.m_liVisiblePropertyId.indexOf(iPropertyId) == -1){
			this.m_liVisiblePropertyId.push(iPropertyId);
		}
	}

	Info.getXScaleOfPropertyId = function(iPropertyId){
		var xyScale = this.m_mapPropertyIdXY[iPropertyId];
		if(xyScale != undefined)
			return xyScale[0];
		return undefined;
	}

	Info.getYScaleOfPropertyId = function(iPropertyId){
		var xyScale = this.m_mapPropertyIdXY[iPropertyId];
		if(xyScale != undefined)
			return xyScale[1];
		return undefined;
	}
	
	//get the distri configure given a property
	Info.getDisConfig = function(iPropertyId){
		var self = this;
		if(self.m_mapPropertyIdDisConfig[iPropertyId] == undefined){
			//be default
			var disConfig = {};
			var bNumber = this.isPropertyNumber(iPropertyId); //is number or not
			// //console.log(' is number ? ', bNumber, ' iprotyertt ', this.getPropertyTypebyId(iPropertyId));
			if(bNumber){
				//20 bins
				var defaultBinNum = DEFAULTBINNUM;
				// var propertyType = self.getPropertyTypebyId(iPropertyId); //, 'value ', m_mapPropertyIdValueList[iPropertyId]);
				var maxProValue = _.max(self.m_mapPropertyIdValueList[iPropertyId]);
				var minProValue = _.min(self.m_mapPropertyIdValueList[iPropertyId]);
				var binValue;
				if(maxProValue == minProValue){
					defaultBinNum = 1;
					binValue = 0;
				}else{
				 	binValue = (maxProValue - minProValue)/(defaultBinNum-1);					
				}
				//number
				disConfig['minValue'] = minProValue, disConfig['maxValue'] = maxProValue;
				disConfig['binNum'] = defaultBinNum;
				disConfig['binValueRange'] = binValue;
				disConfig['getBinIndex'] = function(value){
					if(this.minValue == this.maxValue){
						return 0;
					}
					var binIndex = parseInt((value - this.minValue)/(this.binValueRange));
					// //console.log('value', value, ' number binindex ', binIndex);
					return binIndex;
				};
				disConfig['getBinValue'] = function(iBinIndex){
					var thisBinValue = this.minValue + (iBinIndex * this.binValueRange);
					return thisBinValue;
				}
				// //console.log('propertyType ', propertyType, ' min ', minProValue, ' max ', maxProValue,
				// ' binvalue range ', binValue);
			}else{
				//categorical
				//count the value set
				var valueSet = new Set(self.m_mapPropertyIdValueList[iPropertyId]);

				disConfig['valueList'] = [];
				//check if the property is color				
				var propertyType = self.getPropertyTypebyId(iPropertyId);

				if(colorTypeStr.indexOf(propertyType) >= 0){
					//the color
					//sort the value list
					//console.log(' value set ', valueSet);
					var tempHSVRGBList = [];
					var bHex = false;
					var bUpCase = false;
					valueSet.forEach(function(value){	
						if(value[0] == '#')
							bHex = true;		
						if(value.toLowerCase() != value)
							bUpCase = true;			
						//convert value to RGB
						var tempRGB = d3.rgb(value);
						var tempHSV = self.rgb2hsv(tempRGB);
						// //console.log(" TEMP HSV ", tempHSV, ' value ', tempRGB);
						tempHSVRGBList.push({h: tempHSV.h, s: tempHSV.s, v: tempHSV.v, rgb: tempRGB});
					});		

					//sort the HSVList
					function hsvcompare(hsv1, hsv2){
						if(parseInt(hsv1.h) > parseInt(hsv2.h))
							return 1;
						else if(parseInt(hsv1.h) < parseInt(hsv2.h))
							return -1;
						else{
							if(parseInt(hsv1.s) > parseInt(hsv2.s))
								return 1;
							else if(parseInt(hsv1.s) < parseInt(hsv2.s))
								return -1;
							else{
								if(parseInt(hsv1.v) > parseInt(hsv2.v))
									return 1;
								else if(parseInt(hsv1.v) <= parseInt(hsv2.v))
									return -1;
								else
									return 0;
							}
						}
					}		

					tempHSVRGBList.sort(hsvcompare);

					$.each(tempHSVRGBList, function(i, HSVRGB){
						// //console.log(" HSVRGB ", i, ' H ', HSVRGB.h, ' S ', HSVRGB.s, ' V ', HSVRGB.v);
						var tempRGB = HSVRGB.rgb;
						var tempRGB_str;
						if(bHex){
							tempRGB_str = tempRGB.toString();
							if(bUpCase)
								tempRGB_str = tempRGB_str.toUpperCase();
						}else
							tempRGB_str = 'rgb(' + tempRGB.r + ', ' + tempRGB.g + ', ' + tempRGB.b + ')';

						disConfig['valueList'].push(tempRGB_str);
						// //console.log(' String RGB ', tempRGB_str);
					});
				}else{
					var bNumber = true;
					//check for number
					try{
						valueSet.forEach(function(value){
							var notNumber = isNaN(Number(value));
							//console.log(' value ??? ', value, ' Number(value) ', notNumber);
							// if(isNaN(Number(value)) == true){
							if(notNumber || value == true || value == false){
								//console.log(" here ");
								bNumber = false;
								throw 'return';
							}
						// disConfig['valueList'].push(value);
						});	
					}catch(err){}
					
					if(bNumber){
						var valueList = [];
						//number 
						//console.log("properytit", iPropertyId, " is Number ", bNumber);

						if(bNumber){
							valueSet.forEach(function(value){
								valueList.push(Number(value));
							});
							//console.log(' Before ', valueList);
							valueList.sort(function(a, b){
								a = Number(a), b = Number(b);
								if(a > b) return 1;
								else if(a == b) return 0;
								return -1;
							});
							//console.log(' After ', valueList);
							$.each(valueList, function(i, value){
								//console.log(' value ', value);
								disConfig['valueList'].push(value + '');		
							});
						}
					}else{
						//not number
						valueSet.forEach(function(value){
							disConfig['valueList'].push(value);
						});
					}
				}


				// //console.log(' value list size ', disConfig['valueList']);
				disConfig['binNum'] = disConfig['valueList'].length;
				// //console.log(' bin number ', disConfig.binNum);
				disConfig['getBinIndex'] = function(value){
					var binIndex = this.valueList.indexOf(value);
					// //console.log(' bin index !! ', binIndex, ' value ', value, ' valuelist ', this.valueList);					
					return binIndex;
				};
				disConfig['getBinValue'] = function(iBinIndex){
					return this.valueList[iBinIndex];
				}
			}
			self.m_mapPropertyIdDisConfig[iPropertyId] = disConfig;

		}
		return self.m_mapPropertyIdDisConfig[iPropertyId];
	}

	Info.rgb2hsv = function(color) {
	    var rr, gg, bb,
	        r = color.r / 255,
	        g = color.g / 255,
	        b = color.b / 255,
	        h, s,
	        v = Math.max(r, g, b),
	        diff = v - Math.min(r, g, b),
	        diffc = function(c){
	            return (v - c) / 6 / diff + 1 / 2;
	        };

	    if (diff == 0) {
	        h = s = 0;
	    } else {
	        s = diff / v;
	        rr = diffc(r);
	        gg = diffc(g);
	        bb = diffc(b);

	        if (r === v) {
	            h = bb - gg;
	        }else if (g === v) {
	            h = (1 / 3) + rr - bb;
	        }else if (b === v) {
	            h = (2 / 3) + gg - rr;
	        }
	        if (h < 0) {
	            h += 1;
	        }else if (h > 1) {
	            h -= 1;
	        }
	    }
	    return {
	        h: Math.round(h * 360),
	        s: Math.round(s * 100),
	        v: Math.round(v * 100)
	    };
	}


	Info.getGroupId = function(){
		//console.log('group id', this.m_iGroupId);
	}

	Info.getPropertyValueFromCompoundEles = function(iPropertyId, liEleId){

		if(liEleId.length == undefined){
			return {
				'value': this.getPropertyValue(iPropertyId, liEleId),
				'eleid': liEleId,};
		}
			// return undefined;

		var EleIdValueList = this.m_mapPropertyIdInfo[iPropertyId];
		for (var i = EleIdValueList.length - 1; i >= 0; i--) {
			var eleValue = EleIdValueList[i];
			var liTempEleValue = eleValue['eleid'];		
			if(liTempEleValue.length == undefined){
				if(liEleId.indexOf(liTempEleValue) >= 0){
					return {'value': eleValue['provalue'], 'eleid': liTempEleValue};					
				}
			}else{				
				for(var j = 0; j < liTempEleValue.length; j ++){
					if(liEleId.indexOf(liTempEleValue[j]) >= 0){
						return {'value': eleValue['provalue'], 'eleid': liTempEleValue[j]};
					}					
				}
			}
		};
		return undefined;
	}

	//get the property value list 
	Info.getPropertyValueList = function(iEleId, liPropertyId){
		var self = this;
		var liPropertyValue = [];
		for (var i = liPropertyId.length - 1; i >= 0; i--) {
			var iPropertyId = liPropertyId[i];
			var disConfig = self.getDisConfig(iPropertyId)
			liPropertyValue.push(disConfig.getBinIndex(self.getPropertyValue(iPropertyId, iEleId)));
			// liPropertyValue.push();
		};
		return liPropertyValue;
	}

	Info.getPropertyValue = function(iPropertyId, iEleId){

		var EleIdValueList = this.m_mapPropertyIdInfo[iPropertyId];
		// //console.log(" map PropertyIdInfo ", this.m_mapPropertyIdInfo);
		var liInEleId = [];
		if(iEleId.length == undefined){
			liInEleId.push(iEleId);
		}else{
			//compound group
			liInEleId = iEleId;
		}

		for (var i = EleIdValueList.length - 1; i >= 0; i--) {
			var eleValue = EleIdValueList[i];
			var liTempEleValue = eleValue['eleid'];
			if(liTempEleValue.length == undefined){
				if(liInEleId.indexOf(liTempEleValue) >= 0)
					return eleValue['provalue'];
			}else{
				for(var j = 0; j < liTempEleValue.length; j ++){
					if(liInEleId.indexOf(liTempEleValue[j]) >= 0)
						return eleValue['provalue'];
				}
			}
			// if(liInEleId.indexOf() >= 0)
			// 	return eleValue['provalue'];
		};
		return undefined;
	}

	Info.getBinValue = function(iPropertyId, iBinIndex){
		var DisConfig = this.m_mapPropertyIdDisConfig[iPropertyId];
		return DisConfig.getBinValue(iBinIndex);
	}

	//get the distri 
	Info.getDis = function(iPropertyId){
		return this.m_mapPropertyIdDistri[iPropertyId];
	}
	
	Info.getScatterPlotIds = function(){
		return Object.keys(this.m_mapSPIdScatterPlotConfig);
	}

	//get the scatter plot
	Info.getScatterPlotDis = function(iScatterPlotId){
		var scatterPlotDis = this.m_mapSPIdScatterPlotConfig[iScatterPlotId];
		return scatterPlotDis['SPValueList'];
	}

	Info.getScatterPlotConfig = function(iScatterPlotId){
		return this.m_mapSPIdScatterPlotConfig[iScatterPlotId];
	}

	//get the distri 
	Info.getFilteredDis = function(iPropertyId){
		return this.m_mapPropertyIdFilterDistri[iPropertyId];
	}

	Info.getFilteredSPDis = function(iSPID){
		return this.m_mapSPIdFilterDis[iSPID];
	}

	// //get the ele in a bin
	// Info.getEleinPropertyBin = function(iPropertyId, iBinIndex){
	// 	var liEle;
	// 	var BinValue = this.getBinPropertyValue(iPropertyId, iBinIndex);
	// 	var liEleValue = this.m_mapPropertyIdInfo[iPropertyId];
	// 	var disConfig = this.m_mapPropertyIdDisConfig[iPropertyId];
	// 	for (var i = liEleValue.length - 1; i >= 0; i--) {
	// 		var paEleValue = liEleValue[i];
	// 		disConfig.getBinIndex(paEleValue['provalue'])
	// 		paEleValue['eleid']
	// 		paEleValue['provalue'] 
	// 	};
	// 	return liEle;
	// }
	//get the property value of a given bin
	Info.getBinPropertyValue = function(iPropertyId, iBinIndex){
		var disConfig = this.m_mapPropertyIdDisConfig[iPropertyId];
		return disConfig.getBinValue(iBinIndex);
	}
	//get the name of the property 
	Info.getPropertyNamebyId = function(iPropertyId){
		var propertyName = this.m_mapPropertyIdPropertyName[iPropertyId];
		if(propertyName == undefined)
			return this.getPropertyTypebyId(iPropertyId);
		return propertyName;
	}

	Info.getPropertyUniqNamebyId = function(iPropertyId){
		var propertyUniName = this.m_mapPropertyIdUniName[iPropertyId];
		return propertyUniName;
	}

	Info.getPropertyIdbyUniqName = function(uniqName){
		for(var iPropertyId in this.m_mapPropertyIdUniName){
			if(this.m_mapPropertyIdUniName[iPropertyId] == uniqName)
				return iPropertyId;
		}
		return -1;
	}

	Info.getPropertyNames = function(){
		var self = this;
		var liPropertyName = [];
		for (var i = self.m_liPropertyId.length - 1; i >= 0; i--) {
			var iPropertyId = self.m_liPropertyId[i];
			var propertyName = self.getPropertyNamebyId(iPropertyId);
			if(propertyName == undefined)
				propertyName = self.getPropertyTypebyId(iPropertyId);
			liPropertyName.push(propertyName);
		};
		return liPropertyName;
	}

	Info.getPropertyUniqNames = function(){
		var self = this;
		var liUniqNames = [];
		for(var iPropertyId in self.m_mapPropertyIdUniName){
			liUniqNames.push(self.m_mapPropertyIdUniName[iPropertyId]);
		}
		return liUniqNames;
	}

	//get the property id by name
	Info.getPropertyIdbyName = function(propertyName){
		var self = this;		
		for(var iPropertyId in self.m_mapPropertyIdPropertyName){
			if(self.m_mapPropertyIdPropertyName[iPropertyId] == propertyName){
				return iPropertyId;
			}
		}
		var liPropertyId = self.m_mapPropertyPropertyIds[propertyName];
		if(liPropertyId == undefined)
			return undefined;
		return liPropertyId[0];
	}

	//get the proerty id by uniname
	Info.getProertyidbyUniqName = function(uniqName){
		var self = this;
		for(var iPropertyId in self.m_mapPropertyIdUniName){
			if(self.m_mapPropertyIdUniName[iPropertyId] == uniqName){
				return iPropertyId;
			}
		}
		return undefined;
	}

	//get the origin property type
	Info.getPropertyTypebyId = function(iPropertyId){
		iPropertyId = parseInt(iPropertyId);
		// //console.log(" zzz ", this.m_mapPropertyPropertyIds, ' iPropertyId ', iPropertyId);
		for( var proType in this.m_mapPropertyPropertyIds ) {
			// //console.log('xxx ', this.m_mapPropertyPropertyId.hasOwnProperty( prop ), ' ', this.m_mapPropertyPropertyId[ prop ], ' another ', iPropertyId);
             var liProId = this.m_mapPropertyPropertyIds[proType];
             if(liProId.indexOf(iPropertyId) != -1)
             	return proType;
    	}
    	return undefined;
	}
	//get the ids of properties 
	Info.getPropertyIds = function(){
		return this.m_liPropertyId;
	}

	//get the derived property ids
	Info.getDerivedPropertyIds = function(){
		var liDerivedPropertyId = [];
		for (var i = 0; i < this.m_liPropertyId.length; i++) {
			var proId = this.m_liPropertyId[i];
			if(this.m_mapPropertyIdDerivedDefinition[proId] == undefined)
				continue;
			liDerivedPropertyId.push(proId);
		};
		return liDerivedPropertyId;
	}

	//get the definition of derived property name
	Info.getDerivedPropertyDefinition = function(iDerivedPropertyId){
		return this.m_mapPropertyIdDerivedDefinition[iDerivedPropertyId];
	}

	//get the compound index of the property if compound
	Info.getCompoundIndexofProperty = function(iPropertyId){
		for( var compoundIndex in this.m_mapCompoundIndexPropertyIds ) {
			var liPropertyId = this.m_mapCompoundIndexPropertyIds[compoundIndex];
			if(liPropertyId.indexOf(iPropertyId) != -1)
				return compoundIndex;
    	}
    	return undefined;
	}

	//get the next unused compound index
	Info.getNextCompoundIndex = function(){
		return Object.keys(this.m_mapCompoundIndexPropertyIds).length + 1;
	}

	Info.getCompoundIndexPropertyIdsMap = function(){
		return this.m_mapCompoundIndexPropertyIds;
	}
	Info.getVisiblePropertyIds = function(){
		return this.m_liVisiblePropertyId;
	}
	Info.getInVisiblePropertyIds = function(){
		var self = this;
		var liInVisiblePropertyId = [];
		// //console.log(' getInVisible: ', self.m_liPropertyId, ' visible ', self.m_liVisiblePropertyId);
		for (var i = this.m_liPropertyId.length - 1; i >= 0; i--) {
			var ProId = this.m_liPropertyId[i];
			// //console.log(" index ", self.m_liVisiblePropertyId.indexOf(ProId));
			if(this.m_liVisiblePropertyId.indexOf(ProId) == -1)
				liInVisiblePropertyId.push(ProId);
		};
		// $(self.m_liPropertyId, function(i, iPId){
		// 	if(self.m_liVisiblePropertyId.indexOf(iPId) == -1)
		// 		liInVisiblePropertyId.push(iPId);
		// });
		// //console.log(' invisible ', liInVisiblePropertyId);
		return liInVisiblePropertyId;
	}
	//get the eleid list of property during given bin range list
	Info.getEleIdsbyPropertyIndexRangeList = function(iPropertyId, IndexRangeList){
		var liSeleEleIds = [];

		var liEleValue = this.m_mapPropertyIdInfo[iPropertyId];
		var disConfig = this.m_mapPropertyIdDisConfig[iPropertyId];	

		for (var i = liEleValue.length - 1; i >= 0; i--) {
			var paEleValue = liEleValue[i];
			var iBinIndex = disConfig.getBinIndex(paEleValue['provalue'])		
			//check if bin in bin range
			for (var j = IndexRangeList.length - 1; j >= 0; j--) {
				var IndexRange = IndexRangeList[j];
				if(iBinIndex >= IndexRange[0] && iBinIndex <= IndexRange[1])
					liSeleEleIds.push(paEleValue['eleid'])
			};
		}
		return liSeleEleIds;
	}

	Info.getEleIdsbyPropertyValueList = function(iPropertyId, valueList){
		var liSeleEleIds = [];

		var liEleValue = this.m_mapPropertyIdInfo[iPropertyId];
		if(liEleValue == undefined)
			return liSeleEleIds;

		var disConfig = this.m_mapPropertyIdDisConfig[iPropertyId];	
		for (var i = liEleValue.length - 1; i >= 0; i--) {
			var paEleValue = liEleValue[i];
			var value = paEleValue['provalue'];
			console.log(' select values ', valueList, value)
			if(valueList.indexOf(value) != -1){
				liSeleEleIds.push(paEleValue['eleid'])
			}
			// var iBinIndex = disConfig.getBinIndex()		
			// //check if bin in bin range
			// for (var j = IndexRangeList.length - 1; j >= 0; j--) {
			// 	var IndexRange = IndexRangeList[j];
			// 	if(iBinIndex >= IndexRange[0] && iBinIndex <= IndexRange[1])
			// 		liSeleEleIds.push(paEleValue['eleid'])
			// };
		}
		return liSeleEleIds;
	}

	//get the eleid list by top range
	Info.getEleIdsbyTopRange = function(iPropertyId, TopRange){
		var self = this;
		var liSeleEleIds = [];


		//console.log(" getEleIdsbyTopRange !! Range before ", TopRange['left'], TopRange['right']);

		if(self.m_mapPropertyIdSortValueList == undefined){
			//compute the valuelist
			var liSortValue = [];
			var liEleValue = self.m_mapPropertyIdInfo[iPropertyId];
			var disConfig = self.m_mapPropertyIdDisConfig[iPropertyId];				
			for (var i = liEleValue.length - 1; i >= 0; i--) {
				var paEleValue = liEleValue[i];
				var EleValue = Number(paEleValue['provalue']);
				liSortValue.push(EleValue);
				// var iBinIndex = disConfig.getBinIndex(paEleValue['provalue'])		
			}
			liSortValue.sort(function(a, b) {
			  return a - b;
			});
			//console.log(" getEleIdsbyTopRange !! Sort ", liSortValue);
			//get the value range
			var leftValue, rightValue; 
			if(TopRange['left'] > TopRange['right']){
				var t = TopRange['right'];
				TopRange['right'] = TopRange['left'];
				TopRange['left'] = t;
			}

			//console.log(" getEleIdsbyTopRange !! Range ", TopRange['left'], TopRange['right']);

			if(TopRange['left'] <= 0)
				leftValue = liSortValue[0];
			else if(TopRange['left'] >= liSortValue.length - 1)
				leftValue = liSortValue[liSortValue.length - 1]; 
			else				
				leftValue = liSortValue[TopRange['left']];  //Math.floor(TopRange['left'] * liSortValue.length)];

			if(TopRange['right'] <= 0)
				rightValue = liSortValue[0];
			else if(TopRange['right'] >= liSortValue.length - 1)
				rightValue = liSortValue[liSortValue.length - 1]
			else				
				rightValue = liSortValue[TopRange['right']];//Math.floor(TopRange['right'] * liSortValue.length)];

			//get the eleid
			for (var i = liEleValue.length - 1; i >= 0; i--) {
				var paEleValue = liEleValue[i];
				var EleValue = Number(paEleValue['provalue']);
				var EleId = paEleValue['eleid'];
				if(EleValue >= leftValue && EleValue <= rightValue)
					liSeleEleIds.push(EleId);
			}
			//console.log(" getEleIdsbyTopRange !! ", leftValue, disConfig.getBinIndex(leftValue), disConfig.minValue, '; ', rightValue, disConfig.getBinIndex(rightValue), disConfig.maxValue);
			return {
				'liSelectEleIds': liSeleEleIds,
				'beginBinIndex': disConfig.getBinIndex(leftValue),
				'endBinIndex': disConfig.getBinIndex(rightValue),
			}
		}
		return {};
	}

	// //unfinished
	// Info.fatchFromCache(iPropertyId, IndexRange){
	// 	var liSeleEleIds = [];
	// 	var RangeListEleIds = this.m_mapPropertyIdBinIndexRangeListEleId[iPropertyId]
	// 	if(RangeListEleIds == undefined)
	// 		return undefined;
	// 		for(var caIndexRange in RangeListEleIds){
	// 			if(IndexRange[0] == caIndexRange[0] && IndexRange[1] == caIndexRange[1])
	// 				return RangeListEleIds[caIndexRange];
	// 		}
	// 	}
	// 	return liSeleEleIds;
	// }

	Info.getPropertyInfo = function(iPropertyId){
		return this.m_mapPropertyIdInfo[iPropertyId];
	}

	//judge whether the property is number or not
	Info.isPropertyNumber = function(iPropertyId){
		//get a property value
		var exampleProValue = this.m_mapPropertyIdInfo[iPropertyId][0]['provalue'];
		var isNum = _.isNumber(exampleProValue);
		var isString = _.isString(exampleProValue);

		// //console.log(' @@@ ', this.getPropertyTypebyId(iPropertyId), ' exampleProValue ', exampleProValue, 
		// 	'is ', isNum, ' isString' , isString);
		return (_.isNumber(exampleProValue));
	}

	Info.isPropertyColor = function(iPropertyId){
		var propertyType = this.getPropertyTypebyId(iPropertyId);
		if(propertyType == 'fill')
			return true;
		else
			return false;
	}

	Info.decodeProperty = function(iPropertyId, minValue, maxValue){
		var self = this;
		var liEleId = self.m_ObjectGroupManager.getEleIdsbyGroupId(iGroupId);
		var minPropertyValue, maxPropertyValue;
		var mapEleIdProperty = {};
		var mapEleIdDecodeProperty = {};
		//fetch the propertyvalue
		for (var i = liEleId.length - 1; i >= 0; i--) {		
			var iEleId = liEleId[i];
			var propertyValue = self.getPropertyValue(iPropertyId, iEleId);
			if(i == liEleId.length - 1){
				minPropertyValue = propertyValue;
				maxPropertyValue = propertyValue;
			}else{
				if(minPropertyValue > propertyValue)
					minPropertyValue = propertyValue;
				if(maxPropertyValue < propertyValue)
					maxPropertyValue = propertyValue;
			}
			mapEleIdProperty[iEleId] = propertyValue;
		};
		var delateValue = maxValue - minValue;
		var delatePropertyValue = maxPropertyValue - minPropertyValue;
		var delateRatio = delateValue/delatePropertyValue;

		// console.log(' max/minPropertyValue ', maxPropertyValue, minPropertyValue,
			// ' max/minValue ', maxValue, minValue, delateValue);

		for (var i = liEleId.length - 1; i >= 0; i--) {		
			var iEleId = liEleId[i];
			var propertyValue = mapEleIdProperty[iEleId];
			var decodeValue = minValue + delateRatio * (propertyValue - minPropertyValue);
			mapEleIdDecodeProperty[iEleId] = decodeValue;
		}

		self.getPropertyValue(iPropertyId, iEleId);

	}

	Info.__init__(objectGroupManager);
	
	return Info;
}