
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
if(Array.prototype.contains)
	console.warn("Overriding existing Array.prototype.contains. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

//this array contains the input array
Array.prototype.contains = function(array){
}

// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});


//the elements which don't counted 
g_ExcludeEleTagNames = ['path', 'section', 'div', 'audio'];

function ExampleGroupRule(){

	var Info = new Object;

	Info.m_maxGroupMaxSearchRadius;
	Info.m_rules = [];
	Info.m_mapEleIdRuleCode = {};
	//set the max searching radius
	Info.setMaxGroupSearchRadius = function(maxGroupMaxSearchRadius){
		this.m_maxGroupMaxSearchRadius = maxGroupMaxSearchRadius;
	}
	Info.getMaxGroupSearchRadius = function(){
		return this.m_maxGroupMaxSearchRadius;
	}
	//set the rules
	Info.setRules = function(rules){
		this.m_rules = rules;
	}
	Info.setEleIdRuleCodeMap = function(mapEleIdRuleCode){
		this.m_mapEleIdRuleCode = mapEleIdRuleCode;
	}
	//get the rules
	Info.getRules = function(){
		return this.m_rules;
	}
	Info.getEleidRuleCodeMap = function(){
		return this.m_mapEleIdRuleCode;
	}
	Info.getRuleCodeofEleId = function(iEleId){
		return this.m_mapEleIdRuleCode[iEleId];
	}
	Info.getEleIdsofRuleCode = function(RuleCode){
		var liEleId = [];
		for(var iEleId in this.m_mapEleIdRuleCode){
			var thisRuleCode = this.m_mapEleIdRuleCode[iEleId];
			// //console.log(' is rule code equal ', this.isRuleContains(thisRuleCode, RuleCode), ' ', thisRuleCode, ' , ', RuleCode)
			if(this.isRuleContains(thisRuleCode, RuleCode)){//_.isEqual(thisRuleCode, RuleCode)){
				var iNumEleId = parseInt(iEleId);
				liEleId.push(iNumEleId);
			}
		}
		return liEleId;
	}
	//equal or larger than given rule
	Info.isRuleContains = function(thisRuleCode, thatRuleCode){
		for(var iRuleId in thatRuleCode){
			var iThatRuleNum = thatRuleCode[iRuleId];
			var iThisRuleNum = thisRuleCode[iRuleId];
			if(iThisRuleNum == undefined)
				return false;
			var iThisRuleNum_N = parseInt(iThisRuleNum);
			var iThatRuleNum_N = parseInt(iThatRuleNum);
			if(iThisRuleNum_N < iThatRuleNum_N)
				return false;
		}
		return true;
	}
	//if rules equal
	Info.equalTo = function(other){

		var otherRules = other.getRules();

		if(this.m_rules.length != otherRules.length)
			return false;

		for(var rulename in this.m_rules){
			var rules = this.m_rules[rulename];
			var otherRule = otherRules[rulename];
			if(otherRule == undefined){
				//console.log(' rule not exist ', rulename, ' , ', Object.keys(otherRules));
				return false;
			}
			var livisited = [];
			for(var p = rules.length - 1; p >= 0; p --){
				var rule = rules[p];
				var types_rule = rule['types'];
				// //console.log(' this rule ', rule, 'this type rule ', types_rule);
				var bExist = false;
				for(var q = otherRule.length - 1; q >= 0; q --){
					if(livisited.indexOf(q) >= 0)
						continue;
					livisited.push(q);
					var otherrule = otherRule[q];						
					var types_otherrule = otherrule['types'];
						// //console.log( 'otherrule, ' , otherrule, 'other type rule ', types_otherrule);
					if(types_rule.equals(types_otherrule)){
						bExist = true;
						break;
					}
				}
				if(!bExist){
					//console.log(' rule unequal ', rulename);
					return false;
				}
			}	
		}
		return true;
	}
	//return the eleid list which obey example group rules, with the begin ele id
	Info.meetGroupRule = function(exampleGroupRule){
		var liDesireEleId = [];
		//get the eleid-code map
		var example_eleidcodemap = exampleGroupRule.getEleidRuleCodeMap();

		var example_codeelecountmap = {};
		var this_codethiseleids = {};

		var liExistCode = [];

		var mapEleIdFailEleId = {};
		for(var iEleId in example_eleidcodemap){
			var code = example_eleidcodemap[iEleId];

			//check if the code exist
			var iCodeIndex = -1;
			$.each(liExistCode, function(i, obj){
   				if(_.isEqual(code, obj)){
   					iCodeIndex = i;
   					return false;
				}
			});

			//if not exist
			if(iCodeIndex == -1){
				liExistCode.push(code);
				iCodeIndex = liExistCode.length - 1;				
				//get the eleids in this rule meets the code
				var lithiseleid = this.getEleIdsofRuleCode(code);				
				if(lithiseleid.length == 0)
					return [];
				this_codethiseleids[iCodeIndex] = lithiseleid;
			}

			if(example_codeelecountmap[iCodeIndex] == undefined){
				example_codeelecountmap[iCodeIndex] = 1;
			}else
				example_codeelecountmap[iCodeIndex] += 1;
		}

		//go over the example_code_count, to extract the eleids from this rule randomly
		for(var iCodeIndex in example_codeelecountmap){
			var elecount = example_codeelecountmap[iCodeIndex];
			var thiseleidlist = this_codethiseleids[iCodeIndex];
			if(thiseleidlist.length < elecount)
				return [];
			//fetch the first N eles
			var liSubDesireEleId = thiseleidlist.slice(0, elecount);
			if(liDesireEleId.length == 0)
				liDesireEleId = liSubDesireEleId;
			else
				liDesireEleId = liDesireEleId.concat(liSubDesireEleId);
		}
		return liDesireEleId;
	}
	return Info;
}
	


//detect the compound eles
function detectCompoundEles(liExampleEleIds){
	var bPrintFalse = false, bPrintTrue = false;

	//compute the example rule
	var exampleGroupRule = extractRules(liExampleEleIds);

	var exampleRuleNames = Object.keys(exampleGroupRule.m_rules);
	//console.log(" example group rule!! ", exampleGroupRule.m_mapEleIdRuleCode);
	//console.log(" example rules ", exampleGroupRule.m_rules);

	var liEleId = getInterestedEleIds(liExampleEleIds);

	//get the interested types
	var mapEleIdCentroidPos = {};
	$.each(liEleId, function(i, iEleId){
		var ele = g_ElementProperties.getElebyId(iEleId);
		var tagName = ele.tagName.toLowerCase();
			//compute the centroids of the ele
			var centroidPos = getCentroidOfEle(ele);
			mapEleIdCentroidPos[iEleId] = (centroidPos);
	});

	var liCompoundEleIds = [];

	//[[eleid1, eleid2, ...], [eleid3, eleid4, ...]]		

	var liVisitedEleId = [];

	//search for elegroups obey the rules
	for (var i = liEleId.length - 1; i >= 0; i--) {
		var thisEleId = liEleId[i];
		var thisElePos = mapEleIdCentroidPos[thisEleId];
		if(liVisitedEleId.indexOf(thisEleId) >= 0) continue;
		//get the neighbour EleIds
		var neighbourEleIds = [];
		for (var j = liEleId.length - 1; j >= 0; j--) {
			var otherEleId = liEleId[j];
			if(liVisitedEleId.indexOf(otherEleId) >= 0) continue;
			var otherElePos = mapEleIdCentroidPos[otherEleId];
			var distance = getLineLength(thisElePos['x'], thisElePos['y'], otherElePos['x'], otherElePos['y']);
			if(distance < exampleGroupRule.getMaxGroupSearchRadius())
				neighbourEleIds.push(otherEleId);
		};
		//generate the rules
		var thisGroupRule = extractRules(neighbourEleIds);

		// if(!_.isEqual(exampleRuleNames, thisGroupRuleNames))
		// 	continue;

		//get the matched eleids
		var liDesireEleId = thisGroupRule.meetGroupRule(exampleGroupRule);

		if(liDesireEleId.length > 0){
			//exist
			liVisitedEleId = liVisitedEleId.concat(liDesireEleId);
			liCompoundEleIds.push(liDesireEleId);

			if(!bPrintTrue){
				//console.log(' YES liDesire EleId Num = ', liDesireEleId.length);
				//console.log(' group begin ****** ');
				//console.log(' Ele Rule Codes map ', thisGroupRule.m_mapEleIdRuleCode);

				// var liDesireEleId2= thisGroupRule.meetGroupRule(exampleGroupRule);

				//console.log(" This Rules ", thisGroupRule.m_rules);
				$.each(liDesireEleId, function(i, iEleId){
					var ele = g_ElementProperties.getElebyId(iEleId);
					//console.log(' ele id ', iEleId, ' ele', ele)
				});
				//console.log(' group end ******* ');
				// bPrintTrue = true;
			}

		}else if(!bPrintFalse){

			//console.log(' NO liDesire EleId Num = ', liDesireEleId.length);
			// var thisGroupRuleNames = Object.keys(thisGroupRule.m_rules);
			//console.log(" This Group Rule!! ", thisGroupRule.m_mapEleIdRuleCode);
			//console.log(" This Rules ", thisGroupRule.m_rules);

			// bPrintFalse = true;
		}
	};

	return liCompoundEleIds;
}


//get the interested ele ids from all detected eles
function getInterestedEleIds(liExampleEleIds){

	//get the interested tags
	var liExampeEleTagName = [];
	$.each(liExampleEleIds, function(i, iEleId){
		var ele = g_ElementProperties.getElebyId(iEleId);
		var tagName = ele.tagName.toLowerCase();
		if(liExampeEleTagName.indexOf(tagName) == -1)
			liExampeEleTagName.push(tagName);
	});

	// //console.log(' TTTTYPE ', liExampeEleTagName);

	var liEleId = g_ElementProperties.getElementIds();
	//exclude the un-address version
	var liNewEleId = [];
	$.each(liEleId, function(i, iEleId){
		var ele = g_ElementProperties.getElebyId(iEleId);
		var tagName = ele.tagName.toLowerCase();
		if(g_ExcludeEleTagNames.indexOf(tagName) < 0 && liExampeEleTagName.indexOf(tagName) >= 0){			
			liNewEleId.push(iEleId);
			// //console.log(' TTTag Name ', tagName);
		}
	});
	liEleId = liNewEleId;
	return liEleId;
}


function extractRules(liExampleEleIds){
	//exclude some ele types	
	var liNewExampleEleIds = [];

	$.each(liExampleEleIds, function(i, iEleId){
		var ele = g_ElementProperties.getElebyId(iEleId);
		var tagName = ele.tagName.toLowerCase();
		if(g_ExcludeEleTagNames.indexOf(tagName) < 0){
			// //console.log(' example id ', iEleId, ' tagName ', ele.tagName, ' example' , ele);
			liNewExampleEleIds.push(iEleId);
		}
	});

	liExampleEleIds = liNewExampleEleIds;

	var groupRule = new ExampleGroupRule;

	//compute the centroid of the eles
	var liCentroidPos = [];
	var liBoundBox = [];
	$.each(liExampleEleIds, function(i, iEleId){
		var ele = g_ElementProperties.getElebyId(iEleId);
		var centroidPos = getCentroidOfEle(ele);
		var boundbox = getRectofElement(ele);
		liCentroidPos.push(centroidPos);
		liBoundBox.push(boundbox);
	});

	//compute the max search radius
	var maxSearchRadius = computeMaxSearchRadius(liCentroidPos);	
	//extract the rules
	var result = extractRules_byRules(liExampleEleIds, liCentroidPos, liBoundBox);
	var rules = result['rules'];
	var eleidrulecodemap = result['eleidcodemap'];
	
	groupRule.setMaxGroupSearchRadius(maxSearchRadius);
	groupRule.setEleIdRuleCodeMap(eleidrulecodemap);
	groupRule.setRules(rules);

	// //console.log(' extract group rule ', groupRule);
	return groupRule;
}

function computeMaxSearchRadius(liCentroidPos){
	var maxSearchRadius = 0;
	for (var i = liCentroidPos.length - 1; i >= 0; i--) {
		var Pos1 = liCentroidPos[i];
		for (var j = i - 1; j >= 0; j--) {
			var Pos2 = liCentroidPos[j];
			var dis = getLineLength(Pos1['x'], Pos1['y'], 
				Pos2['x'], Pos2['y']);
			if(dis > maxSearchRadius)
				maxSearchRadius = dis;
		};
	};
	//magnify
	maxSearchRadius *= 1.5;
	return maxSearchRadius;
}

//extract the rules
function extractRules_byRules(liEleIds, liCentroidPos, liBoundBox){
	var result = {};
	var eleRuleCodesmap = {};
	var rules = {};
	
	/*
	{xx (eleid): {
	 1: 0,
	 2: 3,
	 3: 2,
	 4: 2
	 ...
	 }}
	*/

	var rulemap_centroid = {
		1: obeyRule_Center_VerticalAligned,
		2: obeyRule_Center_HorizontalAligned
	};
	var rulemap_boundbox = {		
		3: obeyRule_Connected_VerticalAligned,
		4: obeyRule_Connected_HorizontalAligned,
		5: obeyRule_Top_VerticalAligned,
		6: obeyRule_Bottom_VerticalAligned,
		7: obeyRule_Left_HorizontalAligned,
		8: obeyRule_Right_HorizontalAligned
	}

	//check rules by centroid 
	for(var iRuleIndex in rulemap_centroid){
		var obeyRule = rulemap_centroid[iRuleIndex];
		var liEleIdTypesList_obeyRule = getEleIdsObeyRules(liEleIds, liCentroidPos, obeyRule);
		if(liEleIdTypesList_obeyRule.length > 0)
			rules[iRuleIndex] = (liEleIdTypesList_obeyRule);	
		for (var i = liEleIdTypesList_obeyRule.length - 1; i >= 0; i--){
			var liEleId = liEleIdTypesList_obeyRule[i]['ids'];
			for (var j = liEleId.length - 1; j >= 0; j--) {
				var iEleId = liEleId[j];
				var rulecode = {};
				if(eleRuleCodesmap[iEleId] != undefined){
					rulecode = eleRuleCodesmap[iEleId];
				}
				rulecode[iRuleIndex] = liEleId.length;	
				eleRuleCodesmap[iEleId] = rulecode;
			};
		};
	}

	//check rules by boundbox
	for(var iRuleIndex in rulemap_boundbox){
		var obeyRule = rulemap_boundbox[iRuleIndex];
		var liEleIdTypesList_obeyRule = getEleIdsObeyRules(liEleIds, liBoundBox, obeyRule_Connected_VerticalAligned);
		if(liEleIdTypesList_obeyRule.length > 0)
			rules[iRuleIndex] = (liEleIdTypesList_obeyRule);
		for (var i = liEleIdTypesList_obeyRule.length - 1; i >= 0; i--) {
			var liEleId = liEleIdTypesList_obeyRule[i]['ids'];
			for (var j = liEleId.length - 1; j >= 0; j--) {
				var iEleId = liEleId[j];
				var rulecode = {};
				if(eleRuleCodesmap[iEleId] != undefined){
					rulecode = eleRuleCodesmap[iEleId];
				}
				rulecode[iRuleIndex] = liEleId.length;	
				eleRuleCodesmap[iEleId] = rulecode;
			};
		};
	}

/*
	//rule1
	var liEleIdTypesList_obeyRule = getEleIdsObeyRules(liEleIds, liCentroidPos, obeyRule_Center_VerticalAligned);
	if(liEleIdTypesList_obeyRule.length > 0)
		rules['Center_VerticalAligned'] = (liEleIdTypesList_obeyRule);	
	for (var i = liEleIdTypesList_obeyRule.length - 1; i >= 0; i--) {
		var liEleId = liEleIdTypesList_obeyRule[i]['ids'];
		for (var j = liEleId.length - 1; j >= 0; j--) {
			var iEleId = liEleId[j];
			var rulecode = {};
			if(eleRuleCodesmap[iEleId] != undefined){
				rulecode = eleRuleCodesmap[iEleId];
			}
			rulecode['1'] = liEleId.length;	
			eleRuleCodesmap[iEleId] = rulecode;
		};
	};
	//rule2
	liEleIdTypesList_obeyRule = getEleIdsObeyRules(liEleIds, liCentroidPos, obeyRule_Center_HorizontalAligned);
	if(liEleIdTypesList_obeyRule.length > 0)
		rules['Center_HorizontalAligned'] = (liEleIdTypesList_obeyRule);	
	for (var i = liEleIdTypesList_obeyRule.length - 1; i >= 0; i--) {
		var liEleId = liEleIdTypesList_obeyRule[i]['ids'];
		for (var j = liEleId.length - 1; j >= 0; j--) {
			var iEleId = liEleId[j];
			var rulecode = {};
			if(eleRuleCodesmap[iEleId] != undefined){
				rulecode = eleRuleCodesmap[iEleId];
			}
			rulecode['2'] = liEleId.length;	
			eleRuleCodesmap[iEleId] = rulecode;
		};
	};
	//rule3 
	liEleIdTypesList_obeyRule = getEleIdsObeyRules(liEleIds, liBoundBox, obeyRule_Connected_VerticalAligned);
	if(liEleIdTypesList_obeyRule.length > 0)
		rules['Connected_VerticalAligned'] = (liEleIdTypesList_obeyRule);
	for (var i = liEleIdTypesList_obeyRule.length - 1; i >= 0; i--) {
		var liEleId = liEleIdTypesList_obeyRule[i]['ids'];
		for (var j = liEleId.length - 1; j >= 0; j--) {
			var iEleId = liEleId[j];
			var rulecode = {};
			if(eleRuleCodesmap[iEleId] != undefined){
				rulecode = eleRuleCodesmap[iEleId];
			}
			rulecode['3'] = liEleId.length;	
			eleRuleCodesmap[iEleId] = rulecode;
		};
	};
	//rule4...
*/
	result['rules'] = rules;
	result['eleidcodemap'] = eleRuleCodesmap;
	return result;
}

function getLineLength(x, y, x0, y0){
    return Math.sqrt((x -= x0) * x + (y -= y0) * y);
};

/* get the list of eleidlists obey the rule and corresponding ele types */
function getEleIdsObeyRules(liEleIds, liObject, rule){

	//find the vertical aligned elements
	//[{types: [], ids: []}, {}] 
	var liEleIdTypes_ObeyRule = [];

	var liEleIds_ObeyRule = [];
	var liVisitedEleId = [];

	//[[], [], ]
	for (var i = liEleIds.length - 1; i >= 0; i--) {
		var eleId1 = liEleIds[i];
		var object1 = liObject[i];
		var liThisEleId_ObeyRule= [];
		liThisEleId_ObeyRule.push(eleId1);
		
		if(liVisitedEleId.indexOf(eleId1) >= 0)
			continue;

		for (var j = i - 1; j >= 0; j--) {
			var eleId2 = liEleIds[j];
			var object2 = liObject[j];
			var obayRule = rule(object1, object2);
			if(obayRule){
				liThisEleId_ObeyRule.push(eleId2);
				liVisitedEleId.push(eleId2);
			}
		};
		liVisitedEleId.push(eleId1);

		//update the vertical eles
		if(liThisEleId_ObeyRule.length > 1){			
			liEleIds_ObeyRule.push(liThisEleId_ObeyRule);

			var eleidtypes_obeyrule = {};
			liThisEleId_ObeyRule.sort();
			eleidtypes_obeyrule['ids'] = liThisEleId_ObeyRule;
			var liThisEleType_ObeyRule = [];
			for (var j = liThisEleId_ObeyRule.length - 1; j >= 0; j --) {
				var eleId = liThisEleId_ObeyRule[j];
				var ele = g_ElementProperties.getElebyId(eleId);
				var eleType = ele.tagName;
				liThisEleType_ObeyRule.push(eleType);
			};
			liThisEleType_ObeyRule.sort();
			eleidtypes_obeyrule['types'] = liThisEleType_ObeyRule;

			liEleIdTypes_ObeyRule.push(eleidtypes_obeyrule);
		}
		
	}
	return liEleIdTypes_ObeyRule;
}

var fError = 3;

/* rule1: center vertical aligned */
function obeyRule_Center_VerticalAligned(centroidPos1, centroidPos2){
	var verticalY = Math.abs(centroidPos1['x'] - centroidPos2['x']);	
	if(verticalY < fError)
		return true;
	return false;
}

/* rule2: horizontal aligned */
function obeyRule_Center_HorizontalAligned(centroidPos1, centroidPos2){
	var verticalX = Math.abs(centroidPos1['y'] - centroidPos2['y']);	
	// //console.log(' HORZ ALIGN ', verticalX);
	if(verticalX < fError)
		return true;
	return false;
}

/* rule3: connected vertical aligned */ 
function obeyRule_Connected_VerticalAligned(boundbox1, boundbox2){
	//
	var dis1 = Math.abs(boundbox1['y1'] - boundbox2['y2']);
	var dis2 = Math.abs(boundbox1['y2'] - boundbox2['y1']);
	if(dis1 < fError || dis2 < fError)
		return true;
	return false;
}

/* rule4: connected horizontal aligned */
function obeyRule_Connected_HorizontalAligned(boundbox1, boundbox2){
	var dis1 = Math.abs(boundbox1['x1'] - boundbox2['x2']);
	var dis2 = Math.abs(boundbox1['x2'] - boundbox2['x1']);
	if(dis1 < fError || dis2 < fError)
		return true;
	return false; 
}

/* rule 5: top vertical aligned */
function obeyRule_Top_VerticalAligned(boundbox1, boundbox2){
	var dis1 = Math.abs(boundbox1['y1'] - boundbox2['y1']);
	if(dis1 < fError)
		return true;
	return false;
}

/* rule 6: bottom vertical aligned */
function obeyRule_Bottom_VerticalAligned(boundbox1, boundbox2){
	var dis1 = Math.abs(boundbox1['y2'] - boundbox2['y2']);
	if(dis1 < fError)
		return true;
	return false;
}

/* rule 7: left horizontal aligned */
function obeyRule_Left_HorizontalAligned(boundbox1, boundbox2){
	var dis1 = Math.abs(boundbox1['x1'] - boundbox2['x1']);
	if(dis1 < fError)
		return true;
	return false;
}

/* rule 8: left horizontal aligned */
function obeyRule_Right_HorizontalAligned(boundbox1, boundbox2){
	var dis1 = Math.abs(boundbox1['x2'] - boundbox2['x2']);
	if(dis1 < fError)
		return true;
	return false;
}
