/*
	detect elements and properties
*/

function ElementDetetor(iId){
	var Info = {};
	Info.__init__ = function(iId){
		this.m_iId = iId;
		this.m_ElementProperties = new ElementPropoerties();
		//console.log(" ElementDetetor ", this.m_iId);
	}

	//detect the elements: is the define region a circle
	Info.detectElement = function(detectRect, circleBool){
		//clear 
		this.m_ElementProperties.clear();
		//detect
		this.updateInsideElements(detectRect, circleBool);

	}

	// Info.updateInsideElementsInCircle = function(definedCircle){
	// 	var self = this;
	// 	var selectElement = [];



	// 	//update g_elementpros
	// 	$(selectElement).each(function(){
	// 		var properties = getAttributesofElement(this);
	// 		var style = getOriginStyleofElement(this);
	// 		var iframe = mapEleIFrame[this];
	// 		// //console.log('this ', this, ' properties ', properties, ' style !', style);
	// 		self.m_ElementProperties.addElemenet(this, properties, style, iframe);
	// 	})

	// 	return selectElement;
	// }

	//detect and update the elements inside the rect in the elepro-object
	Info.updateInsideElements = function(definedRect, circleBool){

		var self = this;

		//clear
		var selectElement = [];
		// var selGlobalCenPos = [];
		var selGlobalRect = [];
		// var selectElementGlobalRect = [];
		var mapEleIFrame = {};

		//initiate the children
		var children = $("body").children();
		children = $(children).filter(function(){
			var class_temp = $(this).attr('class');
			var ignore_class = $(this).attr('ignore_class');
			//console.log('AAA tagName ', $(this).prop('tagName') ,' class_temp 1 ', ignore_class, ignore_class == 'detect_ignore');
			if(class_temp == 'addonsvg' || ignore_class == 'detect_ignore'){
				//console.log('ignore children2 ', $(this));
				return false;
			}else{
				return true;
			}
		});

		//remove the addonsvg one
		var shiftpos = {'x': 0, 'y': 0};
		var withinResult = getWithinEles(children, definedRect, shiftpos);
		var withinEleList = withinResult['withinele'];
		var iframeEle = withinResult['iframeele'];
		// var globalRectList = withinResult['globalrect'];

		for (var i = withinEleList.length - 1; i >= 0; i--) {
			selectElement.push(withinEleList[i]);
			// var tempRect = getRectofElement(selectElement, '0');
			// var globalCenPos = {
			// 	'x': parseInt((tempRect['x1'] + tempRect['x2']) * 0.5),
			// 	'y': parseInt((tempRect['y1'] + tempRect['y2']) * 0.5)
			// }
			// // //console.log(" globalCenPos 1 ", globalCenPos);
			// selGlobalCenPos.push(globalCenPos);
			// mapEleGlobalCenPos[withinEleList[i]] = globalCenPos;
			// selectElementGlobalRect.push(globalRectList[i]);
		};	
		// //console.log('after detect select ele ', selectElement.length);
		
		//deal with iframe
		while(iframeEle.length > 0){
			// //console.log('loop ', iframeEle.length);
			var iframe = iframeEle.pop();
			var iframedoc = $(iframe)[0].contentWindow.document;
			// //console.log('iframe ', iframedoc);

			var iframebody = iframedoc.getElementsByTagName("body");
			var iframechildren = $(iframebody).children();
			var shiftpos = {};
			shiftpos['x'] = $(iframe).offset().left;
			shiftpos['y'] = $(iframe).offset().top;
			// //console.log(' shiftpos ', shiftpos);
			var iframewithinresult = getWithinEles(iframechildren, definedRect, shiftpos);
			var iframewithinEleList = iframewithinresult['withinele'];
			var iframeCurrentEle = iframewithinresult['iframeele'];
			// var iframeGlocalRect = iframewithinresult['globalrect'];
			for (var i = iframewithinEleList.length - 1; i >= 0; i--) {
				// //console.log(' iframe within ele ', $(iframewithinEleList[i]));
				selectElement.push(iframewithinEleList[i]);

				// var tempRect = getRectofElement(iframewithinEleList[i], '1');
				// tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
				// tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];
				// var globalCenPos = {
				// 	'x': parseInt((tempRect['x1'] + tempRect['x2']) * 0.5),
				// 	'y': parseInt((tempRect['y1'] + tempRect['y2']) * 0.5),
				// }
				// //console.log(" globalCenPos 2", globalCenPos);
				// selGlobalCenPos.push(globalCenPos);

				// mapEleGlobalCenPos[iframewithinEleList[i]] = globalCenPos;
				// selectElementGlobalRect.push(iframeGlocalRect[i]);
				mapEleIFrame[iframewithinEleList[i]] = iframe;
			};
			for (var i = iframeCurrentEle.length - 1; i >= 0; i--) {
				iframeEle.push(iframeCurrentEle[i]);
			};
		}

		// //console.log("filter children.length ", selectElement.length);//, ", ", selectElement);
		//todo: remove unnecessay eles


		if(circleBool != undefined){
			//filter the circle
			var newSelectElement = [];
			// var newGlobalPos = [];

			var center_circle = {}; 
			var center_radius = 0; 

			if(circleBool != undefined){
				center_circle = {
					'x': (definedRect['x1'] + definedRect['x2']) * 0.5,
					'y': (definedRect['y1'] + definedRect['y2']) * 0.5
				};
				center_radius = (definedRect['x2'] - definedRect['x1'])/2.;
				//console.log(" getWithinEles ", center_radius, center_circle);
			}
			
			for (var i = selectElement.length - 1; i >= 0; i--) {
				var Ele = selectElement[i];		

				// var globalXY = selGlobalCenPos[i];
				
				var tempRect = getRectofElement(Ele);
				var tempFrame = mapEleIFrame[Ele];
				var shiftpos = {'x': 0, 'y': 0};
				if(tempFrame != undefined){
					shiftpos['x'] = $(tempFrame).offset().left;
					shiftpos['y'] = $(tempFrame).offset().top;		
				}
				tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
				tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];

				var center_temp = {
					'x': (tempRect['x1'] + tempRect['x2']) * 0.5, 
					'y': (tempRect['y1'] + tempRect['y2']) * 0.5
				};
				
				//console.log(" YYY [1]", center_temp, center_circle, center_radius, Math.sqrt( (center_temp.x - center_circle.x) * (center_temp.x - center_circle.x) + (center_temp.y - center_circle.y) * (center_temp.y - center_circle.y)));
				if(Math.sqrt( (center_temp.x - center_circle.x) * (center_temp.x - center_circle.x) + (center_temp.y - center_circle.y) * (center_temp.y - center_circle.y)) <= center_radius){
					newSelectElement.push(Ele);
					// newGlobalPos.push(center_temp);
					// return true;
				}
			};
			selectElement = newSelectElement;
			// selGlobalCenPos = newGlobalPos;
			// console.log('YYY ', selectElement.length, " new Sele Ele ", newSelectElement.length);
		}
		
		//update g_elementpros
		// //console.log(' mapEleGlobalCenPos ', selGlobalCenPos);

		for (var i = selectElement.length - 1; i >= 0; i--) {
			var selEle = selectElement[i];

			//get the global rect
			var tempRect = getRectofElement(selEle);
			var tempFrame = mapEleIFrame[selEle];
			var shiftpos = {'x': 0, 'y': 0};
			if(tempFrame != undefined){
				shiftpos['x'] = $(tempFrame).offset().left;
				shiftpos['y'] = $(tempFrame).offset().top;		
			}
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];

			var globalCenPos = {
				'x': (tempRect['x1'] + tempRect['x2']) * 0.5, 
				'y': (tempRect['y1'] + tempRect['y2']) * 0.5
			};

			// var globalCenPos = //selGlobalCenPos[i];

			var properties = getAttributesofElement(selEle);
			var style = getOriginStyleofElement(selEle);
			var iframe = mapEleIFrame[selEle];
			properties['g_x'] = globalCenPos['x'];
			properties['g_y'] = globalCenPos['y'];
			properties['g_box'] = tempRect;

			// console.log('globalCenPos 333 ', selEle, globalCenPos);
			self.m_ElementProperties.addElemenet(selEle, properties, style, iframe);
		};

		// $(selectElement).each(function(){
		// 	var properties = getAttributesofElement(this);
		// 	var style = getOriginStyleofElement(this);
		// 	var globalCenPos = mapEleGlobalCenPos[this];
		// 	var iframe = mapEleIFrame[this];
		// 	properties['g_x'] = globalCenPos['x'];
		// 	properties['g_y'] = globalCenPos['y'];

		// 	//console.log('globalCenPos 333 ', this, globalCenPos);
		// 	self.m_ElementProperties.addElemenet(this, properties, style, iframe);
		// })

		// //console.log(" updateInsideElements !!", self.m_ElementProperties);
	}	

	Info.isGivenElementInRect = function(iEleId, detectRect){
		var self = this;
		var definedRect = detectRect;

		var Ele = self.m_ElementProperties.getElebyId(iEleId);
		var tempRect = getRectofElement(Ele);
		//shift if iframe by offset
		var shiftpos = {x: 0, y: 0};
		var iFrame = self.m_ElementProperties.getIFramebyId(iEleId);
		if(iFrame != undefined){
			shiftpos['x'] = $(iFrame).offset().left;
			shiftpos['y'] = $(iFrame).offset().top;
		}
		tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
		tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];
		var bIntersect = isIntersect(definedRect, tempRect);
		var bIntersect2 = isIntersect(tempRect, definedRect);			
		if(bIntersect || bIntersect2){
			return true;
		}
		return false;
	}

	//given the liEleId, return the elelist in detectRect
	Info.detectGivenElementsInRect = function(liEleId, detectRect){
		
		var self = this;
		var definedRect = detectRect;

		// {
		// 	'x1': detectRect.x1,
		// 	'x2': detectRect.x2,//parseInt(lassoDefinedRect.attr('width')) + lassoOffSet.left,
		// 	'y1': detectRect.y1,//lassoOffSet.top,
		// 	'y2': detectRect.y2,//lassoOffSet.top + parseInt(lassoDefinedRect.attr('height'))
		// }

		//go through the detected ele
		var selectEleId = [];
		// var liEleId = self.m_ElementProperties.getElementIds();

		// //console.log('before filter ', liEleId.length);
		$.each(liEleId, function(i, iEleId){
			var Ele = self.m_ElementProperties.getElebyId(iEleId);
			var tempRect = getRectofElement(Ele);
			//shift if iframe by offset
			var shiftpos = {x: 0, y: 0};
			var iFrame = self.m_ElementProperties.getIFramebyId(iEleId);
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
			}
		});
		return selectEleId;
	}

	//detect the ele in given rect, return the other elements in the coverline

	//self.m_liFilterEleId, coverPos, coverLine);
	Info.detectGivenElementsInRectLine = function(liEleId, coverPos, lineDir, coverLine){
		var self = this;

		var radius = 3;
		var coverRect = {
              'x1': coverPos.x - radius, 
              'x2': coverPos.x + radius, 
              'y1': coverPos.y - radius,
              'y2': coverPos.y + radius,
         }      
        var iHoeverEleId = -1;
        var HoverEleRect = {};
        var liLineUpEleInfo = [];

		$.each(liEleId, function(i, iEleId){
			
			var Ele = self.m_ElementProperties.getElebyId(iEleId);
			var tempRect = getRectofElement(Ele);
			//shift if iframe by offset
			var shiftpos = {x: 0, y: 0};
			var iFrame = self.m_ElementProperties.getIFramebyId(iEleId);
			if(iFrame != undefined){
				shiftpos['x'] = $(iFrame).offset().left;
				shiftpos['y'] = $(iFrame).offset().top;
			}
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];

			// var center_tempRect = {
			// 	'x': (tempRect['x1'] + tempRect['x2']) * 0.5,
			// 	'y': (tempRect['y1'] + tempRect['y2']) * 0.5,
			// };
			// console.log(" temprect ", tempRect, coverRect);

			var bIntersect = isIntersect(coverRect, tempRect);
			var bIntersect2 = isIntersect(tempRect, coverRect);	

			if(bIntersect || bIntersect2){
				//the hover ele
				iHoeverEleId = iEleId;
				HoverEleRect = tempRect;
				// selectEleId.push(iEleId);		
			}else{
				//check for line-up
				//console.log(" XXXXX ", lineDir, 
						// tempRect['y1'], coverLine['y1'], tempRect['y2']);

				if(lineDir == 'horizontal'){
					//----					
					if(tempRect['y1'] <= coverLine['y1'] && tempRect['y2'] >= coverLine['y1']){
						liLineUpEleInfo.push({
							'eleid': iEleId,
							'absinfo': tempRect,
						});						
					}
				}else if(lineDir == "vertical"){
					//|
					if(tempRect['x1'] <= coverLine['x1'] && tempRect['x2'] >= coverLine['x1']){
						liLineUpEleInfo.push({
							'eleid': iEleId,
							'absinfo': tempRect,
						});
					}	
				}
			}
		});		
		return {
			'hovereleid': iHoeverEleId,
			'hoverrect': HoverEleRect,
			'lineupEleInfoList': liLineUpEleInfo,
			// var iHoeverEleId = hoverResult['hovereleid'], licompareEleId = hoverResult['lineupeleid']
          
		}
	}


	//given the liEleId, return the elelist in detectRect
	Info.detectGivenElementsInFan = function(liEleId, Fan){
		var self = this;
		// var beginArc = beginendArc.beginArc, endArc = beginendArc.endArc;

		// {
		// 	'x1': detectRect.x1,
		// 	'x2': detectRect.x2,//parseInt(lassoDefinedRect.attr('width')) + lassoOffSet.left,
		// 	'y1': detectRect.y1,//lassoOffSet.top,
		// 	'y2': detectRect.y2,//lassoOffSet.top + parseInt(lassoDefinedRect.attr('height'))
		// }

		//go through the detected ele
		var selectEleId = [];
		// var liEleId = self.m_ElementProperties.getElementIds();

		console.log('Fan Number before filter ', liEleId.length);
		$.each(liEleId, function(i, iEleId){
			var Ele = self.m_ElementProperties.getElebyId(iEleId);
			var tempRect = getRectofElement(Ele);
			//shift if iframe by offset
			var shiftpos = {x: 0, y: 0};
			var iFrame = self.m_ElementProperties.getIFramebyId(iEleId);
			if(iFrame != undefined){
				shiftpos['x'] = $(iFrame).offset().left;
				shiftpos['y'] = $(iFrame).offset().top;
			}
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];
			Pos = {
				'x': 0.5 * (tempRect['x1'] + tempRect['x2']),
				'y': 0.5 * (tempRect['y1'] + tempRect['y2']),
			}
 			var bIntersect = isInFan(Pos, Fan);		
			if(bIntersect){
				selectEleId.push(iEleId);		
			}
		});
		return selectEleId;
	}

	//delete the eleids 
	Info.detectElementsInRect = function(detectRect){

		// var lassoDefinedRect = $('#lasso_rect');
		// var lassoOffSet = lassoDefinedRect.offset();
		//detect the elements
		var self = this;
		var definedRect = detectRect;

		// {
		// 	'x1': detectRect.x1,
		// 	'x2': detectRect.x2,//parseInt(lassoDefinedRect.attr('width')) + lassoOffSet.left,
		// 	'y1': detectRect.y1,//lassoOffSet.top,
		// 	'y2': detectRect.y2,//lassoOffSet.top + parseInt(lassoDefinedRect.attr('height'))
		// }

		//go through the detected ele
		var selectEleId = [];
		var liEleId = self.m_ElementProperties.getElementIds();

		// //console.log('before filter ', liEleId.length);
		$.each(liEleId, function(i, iEleId){
			var Ele = self.m_ElementProperties.getElebyId(iEleId);
			var tempRect = getRectofElement(Ele);
			//shift if iframe by offset
			var shiftpos = {x: 0, y: 0};
			var iFrame = self.m_ElementProperties.getIFramebyId(iEleId);
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
			}
		});
		return selectEleId;
	}

	Info.__init__(iId);
	return Info;
}

//Class: elements and corresponding properties
function ElementPropoerties(){

	var Info = new Object;
	Info.m_liElements = [];
	Info.m_liId = [];
	Info.m_mapIdElement = {};
	Info.m_mapIdProperties = {};
	Info.m_mapIdcssText = {};

	//iframe record
	Info.m_mapIdIFrame = {};

	//group ele id
	Info.m_liGroupEleId = [];
	Info.m_mapGroupEleIdEleIds = {};

	Info.m_mapIdStroke = {};
 	//{
 		// eleid: iFrame
 	// }
	// the mape from id to origin style str
	//console.log('initiate ElementPropoerties');
	Info.clear = function(){
		this.m_liElements = [];
		this.m_liId = [];
		this.m_mapIdElement = {};
		this.m_mapIdProperties = {};
		this.m_mapIdcssText = {};
		this.m_mapIdIFrame = {};

		this.m_liGroupEleId = [];
		this.m_mapGroupEleIdEleIds = {};
	}

	Info.addElemenet = function(element, properties, originStyle, iframe){//m_mapIdcssText
		var iId = this.m_liId.length + 1;
		this.m_liId.push(iId);
		this.m_liElements.push(element);
		this.m_mapIdElement[iId] = element;
		this.m_mapIdProperties[iId] = properties;
		this.m_mapIdcssText[iId] = originStyle;
		this.m_mapIdIFrame[iId] = iframe;
	}

	Info.setStrokeMap = function(strokeMap){
		this.m_mapIdStroke = strokeMap;
		// console.log(" stroke ", Object.keys(this.m_mapIdStroke));
	}

	Info.getEleStrokeInfo = function(iId){
		return this.m_mapIdStroke[iId];
	}

	Info.addGroupEle = function(liEleId){
		var iGroupEleId = this.m_liGroupEleId.length + 1;
		this.m_liGroupEleId.push(iGroupEleId);
		this.m_mapGroupEleIdEleIds[iGroupEleId] = liEleId;
		return iGroupEleId;
	}

	Info.getElementIds = function(){
		return this.m_liId;
	}

	Info.getElementIdsofEleGroup = function(iEleGroupId){
		return this.m_mapGroupEleIdEleIds[iEleGroupId];
	}

	//find the groupid which iEleId in from the candidate
	Info.getEleGroupIdwithEleId = function(iEleId, liEleGroupCandidate){
		if(liEleGroupCandidate == undefined)
			liEleGroupCandidate = Object.keys(this.m_mapGroupEleIdEleIds);
		for(var i = 0; i < liEleGroupCandidate.length; i ++){
			var iGroupEleId  = liEleGroupCandidate[i];
			var liTempEleId = this.m_mapGroupEleIdEleIds[iGroupEleId];
			if(liTempEleId.indexOf(iEleId) != -1)
				return iGroupEleId;
		}
		return -1;
	}

	Info.getEleGroupIdbyEleIds = function(liEleId){
		var iGroupId = -1;
		for(var iGroupEleId in this.m_mapGroupEleIdEleIds){
			var liTempEleId = this.m_mapGroupEleIdEleIds[iGroupEleId];
			var bExist = true;
			for (var i = 0; i < liTempEleId.length; i++) {
				var iTemEleId = liTempEleId[i];
				if(liEleId.indexOf(iTemEleId) == -1){
					bExist = false;
					break;
				}
			};
			if(bExist){
				iGroupId = iGroupEleId;
				return iGroupId;
			}
		}
		return iGroupId;
	}

	Info.getElePropertiesbyId = function(iId){
		var ElePros = {};
		var ele = this.m_mapIdElement[iId];
		ElePros['ele'] = ele;
		var pros = this.m_mapIdProperties[iId];
		// console.log(" xxx ", this.m_mapIdProperties);
		ElePros['pros'] = pros;
		return ElePros;
	}
	Info.getIFramebyId = function(iId){
		var iFrame = this.m_mapIdIFrame[iId];
		return iFrame;
	}
	Info.getEleOrigincssTextbyId = function(iId){
		return this.m_mapIdcssText[iId];
	}
	//get the properties of ele, excluding 'type'
	//return {color: red, ...}
	Info.getVisualElePropertiesbyId = function(iId){
		var VisElePro = {};
		var Pros = this.m_mapIdProperties[iId];
		for(var Pro in Pros){
			if(Pro != 'type'){
				VisElePro[Pro] = Pros[Pro];
			}
		}
		return VisElePro;
	}
	
	Info.getElebyId = function(iId){
		return this.m_mapIdElement[iId];
	}
	
	Info.getElements = function(){
		return this.m_liElements;
	}

	Info.getEleIdByElement = function(Element){
		var iEleId = -1;
		var iIndex = this.m_liElements.indexOf(Element);
		if(iIndex >= 0)
			iEleId = this.m_liId[iIndex];
		return iEleId;
	}

	Info.getGlobalRectofElement = function(iEleId){
		var self = this;
		var shiftpos = {
			'x': 0,
			'y': 0,
		};
		var ele = self.getElebyId(iEleId);
		var tempRect = getRectofElement(ele);
		var iFrame = self.getIFramebyId(iEleId);
		if(iFrame != undefined){
			shiftpos['x'] = $(iFrame).offset().left;
			shiftpos['y'] = $(iFrame).offset().top;
		}
		tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
		tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];
		return tempRect;
	}

	return Info;
}

//var g_ElementProperties = new ElementPropoerties;

//detect the elements in the defined region
function detectElements(){

	g_ElementProperties.clear();

	//console.log('detect rect', defineRegionRect);
	if(defineRegionRect == undefined) return;

	var setRect = getDefinedRegionRect();
	updateInsideElements(setRect);	
}

function getInsideElements(definedRect){

	//clear
	var selectElement = [];
	//initiate the children
	var children = $("body").children();
	children = $(children).filter(function(){
		var class_temp = $(this).attr('class');
		if(class_temp == 'addonsvg')
			return false;
		else
			return true;
	});

	//remove the addonsvg one
	var shiftpos = {'x': 0, 'y': 0};
	// //console.log(' within result ', definedRect);
	// //console.log(' before detect element ');
	var withinResult = getWithinEles(children, definedRect, shiftpos);
	var withinEleList = withinResult['withinele'];
	var iframeEle = withinResult['iframeele'];
	for (var i = withinEleList.length - 1; i >= 0; i--) {
		selectElement.push(withinEleList[i]);
	};	
	// //console.log('after detect select ele ', selectElement.length);
	
	//deal with iframe
	while(iframeEle.length > 0){
		// //console.log('loop ', iframeEle.length);
		var iframe = iframeEle.pop();
		var iframedoc = $(iframe)[0].contentWindow.document;
		// //console.log('iframe ', iframedoc);

		var iframebody = iframedoc.getElementsByTagName("body");
		var iframechildren = $(iframebody).children();
		var shiftpos = {};
		shiftpos['x'] = $(iframe).offset().left;
		shiftpos['y'] = $(iframe).offset().top;
		// //console.log(' shiftpos ', shiftpos);
		var iframewithinresult = getWithinEles(iframechildren, definedRect, shiftpos);
		var iframewithinEleList = iframewithinresult['withinele'];
		var iframeCurrentEle = iframewithinresult['iframeele'];
		for (var i = iframewithinEleList.length - 1; i >= 0; i--) {
			// //console.log(' iframe within ele ', $(iframewithinEleList[i]));
			selectElement.push(iframewithinEleList[i]);
		};
		for (var i = iframeCurrentEle.length - 1; i >= 0; i--) {
			iframeEle.push(iframeCurrentEle[i]);
		};
	}
	return selectElement;
}



//check for the within elements: given the children and defined rect, return the within ele and the frameeles
function getWithinEles(children, definedRect, shiftpos){
	
	var withinResult = {};
	var selectElement = [];
	var iframeEle = [];
	var selectElementGlobalRect = [];

	var childParentMap = {};

	while(children.length > 0){

		// //console.log(" PPPP [0] ", children);

		//get the children intersecting with define rect
		var childrenGlobalRect = {};
		var children_selected = $(children).filter(function(i){

			//check the class is 'addonsvg'
			var class_temp = $(this).attr('class');

			// //console.log(" PPPP [0.1] ", class_temp);

			if(class_temp == 'pku-vis-add-on'){
				// //console.log(" PPPP [0.1] ", class_temp);
				// //console.log('1');
				return false;
			}
			//check the tag
			if($(this).hasClass('ui-widget')){
				// //console.log(" PPPP [0.2] ", class_temp);
				// //console.log('2');
				return false;
			}
			//get the rect of ele
			var tempRect = getRectofElement(this);
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];

			var tag_temp = $(this).prop('tagName');	
				
			//skip [div] without width or height
			if(tempRect['x2'] - tempRect['x1'] == 0 || tempRect['y2'] - tempRect['y1'] == 0){
				if(tag_temp.toLowerCase() == 'div' || tag_temp.toLowerCase() == 'g'){
					childrenGlobalRect[this] = tempRect;
					return true;
				}
			}
			//iframe
			if(tag_temp.toLowerCase() == 'iframe'){		
				//console.log('3');
				// //console.log('iframe');
				iframeEle.push(this);
				return false;
			}

			var bIntersect = isIntersect(definedRect, tempRect);
			var bIntersect2 = isIntersect(tempRect, definedRect);	
			if(bIntersect || bIntersect2){
				childrenGlobalRect[this] = tempRect;
				return true;		
			}

			// //console.log(" PPPP [0.3] ", bIntersect, bIntersect2, definedRect, tempRect);
			return false;		
		});	


		//update the children
		children = [];
		for (var i = children_selected.length - 1; i >= 0; i--){

			var element_temp = children_selected[i];

			// //console.log(" PPP [1] ", i , element_temp);

			var subchild = $(element_temp).children();
			var subNEChild = $(subchild).filter(function(){
				return !checkforNETag(this);
			});

			// //console.log(" PPPP [2] ", element_temp, subNEChild.length);

			if(subNEChild.length > 0){
				//if there are children of this element
				for (var j = subchild.length - 1; j >= 0; j--){
					children.push(subchild[j]);

					//update the parent node
					// var iParentIndex = g_EleTree.insertEle(element_temp);
					// childParentMap[children.length - 1] = iParentIndex;
				};
			}else{
				if(!checkforNETag($(element_temp))){					
					selectElement.push(element_temp);
					selectElementGlobalRect.push(childrenGlobalRect[element_temp]);
				}
			}
		};		
	}	

	withinResult['withinele'] = selectElement;
	withinResult['iframeele'] = iframeEle;	
	withinResult['globalrect'] = selectElementGlobalRect;

	// g_EleTree.printTree();

	return withinResult;
}

//check for the tag which is not ele
function checkforNETag(element){
	var NETagList = ['script', 'title', 'style', 'audio', 'image']; //
	var tagname = $(element).prop('tagName').toLowerCase();
	if(NETagList.indexOf(tagname) >= 0)
		return true;

	// var NETagList_2 = ['section', 'style', 'div'];
	// if(NETagList_2.indexOf(tagname) >= 0 && $(element).inne)
	return false;
}


//get the boundingbox rect of ele locally, note add the iframe offset if in iframe
function getRectofElement(element, text){
	var rect;	
	var offset_t = {};
	var offsetWidth_t = 0, offsetHeight_t = 0;	

	// console.log(" svg ", element, element.tagName);
	var isSVG = $(element)[0] instanceof SVGElement;
	var error = element.tagName;
	// var isSVG2 = false;
	// if(error != undefined)
	try {
    	var isSVG2 = $(element.tagName.toLowerCase())[0] instanceof SVGElement; 
	}catch(err) {
		console.log("EOE", text, element);
		// return element;
	}

	// if(isSVG){
	if(isSVG || isSVG2){
		// if(this.getBBox == undefined){
		// 	rect = {
		// 		'x1': 0,
		// 		'x2': 0,
		// 		'y1': 0,
		// 		'y2': 0
		// 	};
		// 	return rect;
		// }
		//is an svg element

		// var bbox;
		$(element).each(function(){			
			bbox = this.getBBox();
			// console.log(this);
		    offsetWidth_t += this.getBBox().width;
		    offsetHeight_t += this.getBBox().height;	
		});

		var tag = element.tagName;
		// if(tag == 'svg'){
		if(false){
			offset_t['left'] = bbox.x;	
			offset_t['top'] = bbox.y;					
		}else{
			offset_t['left'] = $(element).offset().left;
			offset_t['top'] = $(element).offset().top;
		}
	}else{
		//is a html element
		offset_t['left'] = $(element).offset().left;
		offset_t['top'] = $(element).offset().top;
		offsetWidth_t = parseInt($(element).width()); offsetHeight_t = parseInt($(element).height());
		// //console.log("Not SVG", offsetWidth_t, ', ', offsetHeight_t);
	}
	// //console.log('bbox ', element, 'isSVG ', isSVG, ' width ', offsetWidth_t, 'height ', offsetHeight_t);
	var x1_t = offset_t['left'], x2_t = x1_t + offsetWidth_t;
	var y1_t = offset_t['top'], y2_t = y1_t + offsetHeight_t;
	rect = {
		'x1': x1_t,
		'x2': x2_t,
		'y1': y1_t,
		'y2': y2_t
	};
	// //console.log(' rect ', rect);
	return rect;
}

function getCentroidOfEle(element){
	var centroidpos = {};
	var rect = getRectofElement(element);
	centroidpos['x'] = (rect['x1'] + rect['x2']) * 0.5;
	centroidpos['y'] = (rect['y1'] + rect['y2']) * 0.5;
	return centroidpos;
}

//get the attributes of ele
function getAttributesofElement(element){
	var attris = {};
	var tag = element.tagName.toLowerCase();
	//type
	attris['type'] = tag;
	//value
	var EleValueList = ['text', 'span'];
	if(EleValueList.indexOf(attris['type']) >= 0){
		attris['value'] = element.textContent;
	}
	//visual property
	// //console.log('ele 1', element);
	var visualattri = getAttrisofElement(element);
	for (var key in visualattri){
		attris[key] = visualattri[key];
	}
	// attris['visual'] = visualattri;
	// //console.log(' attris ', attris);
	return attris;
}

//get the origin style 
function getOriginStyleofElement(element){
	return element.style.cssText;
}

//get the visual attris of ele
function getAttrisofElement(element){
	// var isSVG = element instanceof SVGElement;
	// var tag = element.tagName.toLowerCase();
	var visualattri = {};

	//attri		
	for (var i = element.attributes.length - 1; i >= 0; i--){
		var namevalue = element.attributes[i];
		
		var name = namevalue.name, value = namevalue.value;
		// //console.log(' here ', namevalue);
		if(name == 'class'){
			name += '_obj';
		}

		if(name != 'style'){
			var numbervalue = parseFloat(value);
			if(isNaN(numbervalue))
				visualattri[name] = value;
			else
				visualattri[name] = numbervalue;
		}
	}
	//style
	$.each(element.style, function(i, attr){
		var value = element.style[attr]
		visualattri[attr] = value;
	})

	return visualattri;
}

//expand the rect 
function expandRect(Rect, expandPixle){
	Rect['x1'] -= expandPixle;
	Rect['x2'] += expandPixle;
	Rect['y1'] -= expandPixle;
	Rect['y2'] += expandPixle;
	return Rect;
}

//two rects intersect or not 
function isIntersect(Rect1, Rect2){
    if(Rect1['x1'] > Rect2['x2'] || Rect1['x2'] < Rect2['x1'] || Rect1['y1'] > Rect2['y2'] || Rect1['y2'] < Rect2['y1'])
    	return false;
    return true;
}

function isInFan(Pos, Fan){
	var centerPos = Fan.centerPos;
	var radius = Fan.radius;
	// if((centerPos.x - Pos.x) * (centerPos.x - Pos.x) + (centerPos.y - Pos.y) * (centerPos.y - Pos.x) > radius * radius){
	// 	console.log(" XXXX ", centerPos, Pos, (centerPos.x - Pos.x) * (centerPos.x - Pos.x) + (centerPos.y - Pos.y) * (centerPos.y - Pos.x), " RRRR ", radius * radius);
	// 	return false;
	// }
	var arc;
	if(centerPos.y == Pos.y){
		if(Pos.x <= centerPos.x){
			//270
			arc = Math.PI * 3/2;
		}else
			arc = Math.PI * 1/2;
	}else{
		if(centerPos.y < Pos.y){
			//2/3
			if(centerPos.x > Pos.x){
				//3:180~270
				arc = Math.atan((centerPos.x - Pos.x)/(Pos.y - centerPos.y)) + Math.PI;
			}else{
				//2: 90~180
				if(Pos.x == centerPos.x)
					arc = Math.PI;
				else
					arc = Math.atan((Pos.y - centerPos.y)/(Pos.x - centerPos.x)) + Math.PI/2.;
			}
		}else{
			//1/4
			if(centerPos.x > Pos.x){
				//4: 270~360
				if(Pos.x == centerPos.x)
					arc = Math.PI * 2;
				else
					arc = Math.atan((centerPos.y - Pos.y)/(centerPos.x - Pos.x)) + Math.PI * 3/2;
			}else{
				//1: 0~90
				arc = Math.atan((Pos.x - centerPos.x)/(centerPos.y - Pos.y));
			}
		}
	}

	var beginArc = Fan.beginArc, endArc = Fan.endArc;
	console.log(" Fan Number ", arc);
	if(arc >= beginArc && arc < endArc)
		return true;
	return false;
}

function isWithinRect(Rect, X, Y){
	var isIn = false;
	if(X <= Rect['x2'] && X >= Rect['x1'] && Y <= Rect['y2'] && Y >= Rect['y1'])
		isIn = true;
	return isIn;
}
