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

		if(g_GlobalElementIdManager.isEleIdBuild() == false)
			g_GlobalElementIdManager.buildupEleIdMap();
		//detect
		return this.updateInsideElements2(detectRect, circleBool);
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

	Info.updateInsideElements2 = function(definedRect, circleBool){

		var self = this;
		var left = 1e6, right = -1, top = 1e6, bottom = -1;

		var liElementIds = g_GlobalElementIdManager.getCandiateElementIds();

		var liSelectElement = [];
		var liSelectEleId = [];

		if(definedRect != undefined){
			//define the boundary rect
			var center_circle = {}; 
			var center_radius = 0; 
			if(circleBool != undefined){
				center_circle = {
					'x': (definedRect['x1'] + definedRect['x2']) * 0.5,
					'y': (definedRect['y1'] + definedRect['y2']) * 0.5
				};
				center_radius = (definedRect['x2'] - definedRect['x1'])/2.;	
			}

			for (var i = liElementIds.length - 1; i >= 0; i--) {

				var EleId = liElementIds[i];		
				var Ele = g_GlobalElementIdManager.getElebyId(EleId);
				var tempFrame = g_GlobalElementIdManager.getIFramebyEleId(EleId);
						
				tempRect = g_GlobalElementIdManager.getGlobalRectbyEleId(EleId);

				if(circleBool != undefined){
					//circle
					var center_temp = {
						'x': tempRect['g_x'],
						'y': tempRect['g_y'],
					};
					if(Math.sqrt( (center_temp.x - center_circle.x) * (center_temp.x - center_circle.x) + (center_temp.y - center_circle.y) * (center_temp.y - center_circle.y)) <= center_radius){
						liSelectEleId.push(EleId);
						liSelectElement.push(Ele);
					}
				}else{
					//rect
					var bIntersect = isIntersect(definedRect, tempRect);
					var bIntersect2 = isIntersect(tempRect, definedRect);	
					if(bIntersect || bIntersect2){	
						liSelectEleId.push(EleId);
						liSelectElement.push(Ele);
					}
				}
			};
		}else{
			for (var i = liElementIds.length - 1; i >= 0; i--) {
				var EleId = liElementIds[i];		
				var Ele = g_GlobalElementIdManager.getElebyId(EleId);
				liSelectEleId.push(EleId);
				liSelectElement.push(Ele);
			}
		}

		console.log(" New Detect ", liSelectEleId.length);

		for (var i = liSelectEleId.length - 1; i >= 0; i--) {
			var selEleId = liSelectEleId[i];
			var selEle = liSelectElement[i];
			var iframe = g_GlobalElementIdManager.getIFramebyEleId(EleId);
	
			//get the global rect
			var tempRect = g_GlobalElementIdManager.getGlobalRectbyEleId(selEleId);
			
			var globalCenPos = {
				'x': (tempRect['x1'] + tempRect['x2']) * 0.5, 
				'y': (tempRect['y1'] + tempRect['y2']) * 0.5
			};

			if(left > tempRect['x1'])
				left = tempRect['x1']
			if(right < tempRect['x2'])
				right = tempRect['x2']
			if(top > tempRect['y1'])
				top = tempRect['y1']
			if(bottom < tempRect['y2'])
				bottom = tempRect['y2']
			// var globalCenPos = //selGlobalCenPos[i];

			var properties = getAttributesofElement(selEle);
			var style = getOriginStyleofElement(selEle);
			// var iframe = mapEleIFrame[selEle];
			properties['g_x'] = tempRect['g_x'];
			properties['g_y'] = tempRect['g_y'];
			properties['g_box'] = {
				'x1': tempRect['x1'],'x2': tempRect['x2'],
				'y1': tempRect['y1'],'y2': tempRect['y2'],
			}
			properties['cen-x'] = 0.5 * (tempRect['x2'] + tempRect['x1'])
			properties['cen-y'] = 0.5 * (tempRect['y2'] + tempRect['y1'])
			properties['bwidth'] = tempRect['x2'] - tempRect['x1']
			properties['bheight'] = tempRect['y2'] - tempRect['y1'];
			// console.log('globalCenPos 333 ', selEle, globalCenPos);
			self.m_ElementProperties.addElemenet(selEle, selEleId, properties, style, iframe);
		};

		return {'x': left, 'y': top, 'width': right - left , 'height': bottom - top}
	}

	//detect and update the elements inside the rect/circle in the elepro-object
	Info.updateInsideElements = function(definedRect, circleBool){

		var self = this;

		//clear
		var selectElement = [];
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
			properties['cen-x'] = 0.5 * (tempRect['x2'] + tempRect['x1'])
			properties['cen-y'] = 0.5 * (tempRect['y2'] + tempRect['y1'])
			properties['bwidth'] = tempRect['x2'] - tempRect['x1']
			properties['bheight'] = tempRect['y2'] - tempRect['y1'];

			// console.log('globalCenPos 333 ', selEle, globalCenPos);
			self.m_ElementProperties.addElemenet(selEle, undefined, properties, style, iframe);
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

	Info.addElemenet = function(element, elementId, properties, originStyle, iframe){//m_mapIdcssText
		var iId = this.m_liId.length + 1;
		if(elementId != undefined)
			iId = elementId;
		// var iId = g_GlobalElementIdManager.getElementbyId(element);//this.m_liId.length + 1;
		// console.log('[test] element ', element.tagName, iId);
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


