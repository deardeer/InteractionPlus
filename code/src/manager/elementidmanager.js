/*
	Global Element - Id Manager
*/

function ElementIdManager(){

	var Info = {};
	Info.__init__ = function(){
		console.log(' init element id manager');
		Info.m_isEleIdBuild = false;
		Info.m_ElementIdMap = new ElementIdMap();
	}

	Info.buildupEleIdMap = function(){	

		console.log(' build up ele id map ');

		this.m_isEleIdBuild = true;

		// this.m_globalElementDetector = new ElementDetetor(-2);	
		var svgwidth =  document.body.scrollWidth;
		var svgheight = document.body.scrollHeight;
		var top = 0;
		var left = 0;

		var globalRect = {
	      'x1': left,
	      'x2': left + svgwidth,
	      'y1': top,
	      'y2': top + svgheight,
	    };

	    this.detectElementsinRect(globalRect);

		// this.m_globalElementDetector.updateInsideElements(globalRect, false);
	}

	Info.detectElementsinRect = function(definedRect){

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

		for (var i = withinEleList.length - 1; i >= 0; i--) {
			selectElement.push(withinEleList[i]);
		};	
		// //console.log('after detect select ele ', selectElement.length);
		
		//deal with iframe
		while(iframeEle.length > 0){
			// //console.log('loop ', iframeEle.length);
			var iframe = iframeEle.pop();
			// //console.log('iframe ', iframedoc);
			try {	
				var iframedoc = $(iframe)[0].contentWindow.document;
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
					selectElement.push(iframewithinEleList[i]);
					mapEleIFrame[iframewithinEleList[i]] = iframe;
					console.log(' TEST 2 ', mapEleIFrame);
				};
				for (var i = iframeCurrentEle.length - 1; i >= 0; i--) {
					iframeEle.push(iframeCurrentEle[i]);
				};
			}
			catch(err) {
			    continue;
			}
		}
		this.m_ElementIdMap.buildupIds(selectElement, mapEleIFrame);
		console.log(' TEST ', mapEleIFrame);
	}

	Info.getElebyId = function(ElementId){
		return this.m_ElementIdMap.getElebyId(ElementId);
	}

	Info.getGlobalRectbyEleId = function(ElementId){
		return this.m_ElementIdMap.getGlobalRectbyEleId(ElementId);
	}

	Info.getIFramebyEleId = function(ElementId){
		return this.m_ElementIdMap.getIFramebyEleId(ElementId);
	}	

	Info.getCandiateElementIds = function(){
		return this.m_ElementIdMap.getCandiateElementIds();
	}

	Info.isEleIdBuild = function(){
		return this.m_isEleIdBuild;
	}

	Info.__init__();
	return Info;
}

function ElementIdMap(){
	var Info = {};
	Info.__init__ = function(){
		this.m_mapEleId = {};
		this.m_liEleId = [];
		this.m_liEle = [];
		this.m_mapIdEle = {};
		this.m_mapIdIFrame = {};
		this.m_mapIdGlobalRect = {}
	}
	Info.clear = function(){
		this.m_liEleId = [];
		this.m_liEle = [];
		this.m_mapIdEle = {};
		this.m_mapIdIFrame = {};
		this.m_mapIdGlobalRect = {}
	}
	Info.buildupIds = function(liElement, mapEleIFrame){
		this.clear();
		var iValidId = 0;
		var tagSet = new Set();
		console.log('[IDMap] #ele = ', liElement.length);		
		for (var i = liElement.length - 1; i >= 0; i--) {
			var Element = liElement[i];
			var iFrameEle = mapEleIFrame[Element];
			this.m_liEleId.push(iValidId);
			this.m_liEle.push(Element);
			this.m_mapIdEle[iValidId] = Element;
			this.m_mapIdIFrame[iValidId] = iFrameEle;
			
			if(Element.tagName.toLowerCase() == 'rect')
				console.log(' temp Rect ', i, tempRect);
			var tempRect = getRectofElement(Element);
			
			var shiftpos = {'x': 0, 'y': 0};
			if(iFrameEle != undefined){
				shiftpos['x'] = $(iFrameEle).offset().left;
				shiftpos['y'] = $(iFrameEle).offset().top;		
			}
			tempRect['x1'] += shiftpos['x']; tempRect['x2'] += shiftpos['x'];
			tempRect['y1'] += shiftpos['y']; tempRect['y2'] += shiftpos['y'];			
			tempRect['g_x']  = (tempRect['x1'] + tempRect['x2']) * 0.5;
			tempRect['g_y']  = (tempRect['y1'] + tempRect['y2']) * 0.5;
			this.m_mapIdGlobalRect[iValidId] = tempRect;	

			iValidId += 1;	
			tagSet.add(Element.tagName)		
		};
		console.log('[IDMap] #ele tag = ', tagSet);	

	}

	Info.getCandiateElementIds = function(){
		return this.m_liEleId;
	}

	Info.getGlobalRectbyEleId = function(Id){
		return this.m_mapIdGlobalRect[Id];
	}

	Info.getGlobalRectbyEleId = function(Id){
		return this.m_mapIdGlobalRect[Id];
	}

	Info.getElebyId = function(Id){
		return this.m_mapIdEle[Id];
	}
	Info.getIFramebyEleId = function(Id){
		return this.m_mapIdIFrame[Id];
	}
	Info.__init__();
	return Info;
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
	var NETagList = ['script', 'title', 'style', 'audio', 'image', 'use', 'clippath']; //
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
			try{				
				bbox = this.getBBox();
			// console.log(this);
		    	offsetWidth_t += this.getBBox().width;
		    	offsetHeight_t += this.getBBox().height;
			}catch(err){
		    	console.log(' !!!error ' , this);
		    }
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

