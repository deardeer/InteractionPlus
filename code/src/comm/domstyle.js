// var parse = require('svg-path-parser');
// var Path = require('svg-path-generator');

var DomStyleProcessor = function(){
	this.PathCode = {
		'M': ['x', 'y'], //moveTo(x, y)
		'm': ['x', 'y'], //moveTo(x, y)
		'L': ['x', 'y'], //lineTo(x, y)
		'l': ['x', 'y'], //lineTo(x, y)
		'H': ['x'], //horizontalLineTo(x)
		'h': ['x'], //horizontalLineTo(x)
		'V': ['y'], //verticalLineTo(y)
		'v': ['y'], //verticalLineTo(y)
		'C': ['x', 'x1', 'x2', 'y', 'y1', 'y2'], //curveTo(x1, y1, x2, y2, x, y)
		'c': ['x', 'x1', 'x2', 'y', 'y1', 'y2'], //curveTo(x1, y1, x2, y2, x, y)
		'S': ['x', 'y', 'x2', 'y2'], //smoothCurveTo(x2, y2, x, y)
		's': ['x', 'y', 'x2', 'y2'], //smoothCurveTo(x2, y2, x, y)
		'Q': ['x', 'y', 'x2', 'y2'], //bezierCurveTo(x1, y1, x, y)
		'q': ['x', 'y', 'x2', 'y2'], //bezierCurveTo(x1, y1, x, y)
		'T': ['x', 'y'], //smoothBezierCurveTo(x, y)
		't': ['x', 'y'], //smoothBezierCurveTo(x, y)
		'A': ['rx', 'ry'], //ellipticalArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)
		'a': ['rx', 'ry', 'xAxisRotation', 'largeArcFlag', 'sweepFlag', 'x', 'y'], //ellipticalArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)
		'Z': [], //close()
		'z': []	//close()		
	};

	this.SimilarCode = ['s', 'S', 'C', 'c'];

	this.m_liNoStyleCopyAttr = ['x1', 'x2', 'y1', 'y2', 'x', 'y', 'width', 'height', 'transform']
}


DomStyleProcessor.prototype.getAttrisofElement = function(element){
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

DomStyleProcessor.prototype.setAttrisofElement = function(element, visualattri){
	var liName = Object.keys(visualattri);
	for (var i = liName.length - 1; i >= 0; i --){
		var name = liName[i];
		var value = visualattri[name];
		if(this.m_liNoStyleCopyAttr.indexOf(name) >= 0) // name == 'x' || name == 'y' || name == 'width' || name == 'height' || name == 'transform')
			continue;
		var newstyle = document.createAttribute(name);
		newstyle.nodeValue = value;
		element.attributes.setNamedItem(newstyle);
	}
}


DomStyleProcessor.prototype.cleanDomPos = function(element){
	if(element.tagName == 'rect'){
		//x, y
		var xstyle = document.createAttribute('x');
		xstyle.nodeValue = 0;
		element.attributes.setNamedItem(xstyle);
		var ystyle = document.createAttribute('y');
		ystyle.nodeValue = 0;
		element.attributes.setNamedItem(ystyle);
		return;
	}	
	if(element.tagName == 'circle'){
		var xstyle = document.createAttribute('cx');
		xstyle.nodeValue = 0;
		element.attributes.setNamedItem(xstyle);
		var ystyle = document.createAttribute('cy');
		ystyle.nodeValue = 0;
		element.attributes.setNamedItem(ystyle);
	}
	if(element.tagName == 'line'){		
		//x1, y1, x2, y2		
		var x2style = document.createAttribute('x2');
		x2style.nodeValue = 20; //parseFloat(element.attributes.getNamedItem('x2').value - element.attributes.getNamedItem('x1').value);
		element.attributes.setNamedItem(x2style);

		var y2style = document.createAttribute('y2');
		y2style.nodeValue = 0; //parseFloat(element.attributes.getNamedItem('y2').value - element.attributes.getNamedItem('y1').value);
		element.attributes.setNamedItem(y2style);

		var x1style = document.createAttribute('x1');
		x1style.nodeValue = 0;
		element.attributes.setNamedItem(x1style);
		
		var y1style = document.createAttribute('y1');
		y1style.nodeValue = 0;
		element.attributes.setNamedItem(y1style);
		return;
	}
	if(element.tagName == 'polyline'){
		var pointstyle = document.createAttribute('points');
		pointstyle.nodeValue = '0, 0, 10, 0';
		element.attributes.setNamedItem(pointstyle);
		return;
	}
	// if(element.tagName == 'tspan'){
	// 	element.attributes.removeNamedItem('x');
	// 	element.attributes.removeNamedItem('y');
	// }
}

DomStyleProcessor.prototype.analysisPath = function(element){

	if(element.tagName == 'path'){

		var dstring = element.attributes.getNamedItem('d').value;
		var liD = SvgPathParser.parse(dstring);

		var pathcode = {
			'M': ['x', 'y'], //moveTo(x, y)
			'm': ['x', 'y'], //moveTo(x, y)
			'L': ['x', 'y'], //lineTo(x, y)
			'l': ['x', 'y'], //lineTo(x, y)
			'H': ['x'], //horizontalLineTo(x)
			'h': ['x'], //horizontalLineTo(x)
			'V': ['y'], //verticalLineTo(y)
			'v': ['y'], //verticalLineTo(y)
			'C': ['x', 'x1', 'x2', 'y', 'y1', 'y2'], //curveTo(x1, y1, x2, y2, x, y)
			'c': ['x', 'x1', 'x2', 'y', 'y1', 'y2'], //curveTo(x1, y1, x2, y2, x, y)
			'S': ['x', 'y', 'x2', 'y2'], //smoothCurveTo(x2, y2, x, y)
			's': ['x', 'y', 'x2', 'y2'], //smoothCurveTo(x2, y2, x, y)
			'Q': ['x', 'y', 'x2', 'y2'], //bezierCurveTo(x1, y1, x, y)
			'q': ['x', 'y', 'x2', 'y2'], //bezierCurveTo(x1, y1, x, y)
			'T': ['x', 'y'], //smoothBezierCurveTo(x, y)
			't': ['x', 'y'], //smoothBezierCurveTo(x, y)
			'A': ['rx', 'ry'], //ellipticalArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)
			'a': ['rx', 'ry', 'xAxisRotation', 'largeArcFlag', 'sweepFlag', 'x', 'y'], //ellipticalArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x, y)
			'Z': [], //close()
			'z': []	//close()		
		};


		var liAbsX = [];
		var liAbsY = [];
		//get the absolute X, Y pos list
		for (var i = 0; i < liD.length; i ++) {
			var d = liD[i];
			if(d.code == 'a' || d.code == 'A'){
				console.log(" A | a ", d);
			}
			if(d.code.toLowerCase() == 'z')
				continue;
			if(pathcode[d.code] == undefined){
				console.log(' ERROR ', d);
			}else{				
				if(d['relative'] == undefined){
					//abs
					// console.log(" push ", d.code, d['x'], d['y']);
					var x = d['x'];
					var y = d['y'];	
					liAbsX.push(x);
					liAbsY.push(y);
				}
			}
		};

		//boundary box
		if(liAbsX.length > 0 && liAbsY.length > 0){

			liAbsX.sort();
			liAbsY.sort();

			var left_x = liAbsX[0];
			var right_x = liAbsX[liAbsX.length - 1];
			var top_y = liAbsY[0];
			var bottom_y = liAbsY[liAbsY.length - 1];
			
			var origin_x = liAbsX[0];
			var origin_y = liAbsY[0];

			console.log(' shift pos ', origin_x, origin_y,
				left_x, right_x, top_y, bottom_y, liAbsX, liAbsY, liD);

			//translate to related (origin_x, origin_y)

			// var path = Path();
			this.shiftPathDom(element, origin_x, origin_y);
			// this.shiftPathDom(element, 0.5 * (left_x + right_x), 0.5 * (top_y + bottom_y));			
		}

		// console.log('path ', parse(dstring));

		// var path = Path();
		// path
  //           .moveTo(10, 25)
  //           .lineTo(10, 75)
  //           // .lineTo(60, 75)
  //           // .lineTo(10, 25)
  //           .end();

  //       path
  //           // .lineTo(10, 75)
  //           .lineTo(60, 75)
  //           .lineTo(10, 25)
  //           .end();

  //        path.close();
 
		// console.log('generate path ', path, path.currentPath);// M 10 25 L 10 75 L 60 75 L 10 25
	}
}

//is the two paths similar 
DomStyleProcessor.prototype.isPathSimilar = function(element1, element2){
	var bSimilar = true;
	var dstring1 = element1.attributes.getNamedItem('d').value;
	var liD1 = SvgPathParser.parse(dstring1);
	var dstring2 = element2.attributes.getNamedItem('d').value;
	var liD2 = SvgPathParser.parse(dstring2);

	if(liD1.length != liD2.length)
		return false;
	for (var i = 0; i < liD1.length; i ++) {
		var d1 = liD1[i];
		if(liD2.length - 1 < i)
			return false;
		var d2 = liD2[i];
		if(d2.code.toLowerCase() != d1.code.toLowerCase()){
			if(this.SimilarCode.indexOf(d2.code) >= 0 && this.SimilarCode.indexOf(d1.code) >= 0)
				continue;
			else
				return false;
		}
		//More Exact
		// if(d1.code != d2.code){
		// 	return false;
		// }else{
		// 	if(d1['relative'] == true && d2['relative'] == true){
		// 		var lixy1 = [];
		// 		var lixy2 = [];
		// 		var xynames = this.PathCode[d1.code];
		// 		for (var j = 0; j < xynames.length; j ++){					
		// 			var a1 = d1[xynames[j]];
		// 			var a2 = d2[xynames[j]];
		// 			if(Math.abs(a1 - a2) > 5e-2){
		// 				return false;
		// 			}
		// 		};
		// 	}
		// }
	};
	return true;
}

//shift path dom to (0, 0)
DomStyleProcessor.prototype.shiftPathDom = function(element, origin_x, origin_y){
	
	if(element.tagName != 'path')
		return;

	console.log(" shift path ", origin_x, origin_y);

	var dstring = element.attributes.getNamedItem('d').value;
	console.log(' shift before ', dstring);

	var liD = SvgPathParser.parse(dstring);
	var path = SvgPathGenerator();

	for(var i = 0; i < liD.length; i ++){
		var d = liD[i];
		var shiftx = origin_x;
		var shifty = origin_y;

		if(d['relative'] == true){
			shiftx = 0;
			shifty = 0;
		}   
		//relative
		if(d.code == 'M')
			path.moveTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'm')
			path.relative().moveTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'L')
			path.lineTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'l')
			path.relative().lineTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'H')
			path.horizontalLineTo(d.x - shiftx)
				.end();
		if(d.code == 'h')
			path.relative().horizontalLineTo(d.x - shiftx)
				.end();
		if(d.code == 'V')
			path.verticalLineTo(d.y - shifty)
				.end();
		if(d.code == 'v')
			path.relative().verticalLineTo(d.y - shifty)
				.end();
		if(d.code == 'C')
			path.curveTo(d.x1 - shiftx, d.y1 - shifty, d.x2 - shiftx, d.y2 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'c')
			path.relative().curveTo(d.x1 - shiftx, d.y1 - shifty, d.x2 - shiftx, d.y2 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'S')
			path.smoothCurveTo(d.x2 - shiftx, d.y2 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 's')
			path.relative().smoothCurveTo(d.x2 - shiftx, d.y2 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'Q')
			path.bezierCurveTo(d.x1 - shiftx, d.y1 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'q')
			path.relative().bezierCurveTo(d.x1 - shiftx, d.y1 - shifty, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'T')
			path.smoothBezierCurveTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 't')
			path.relative().smoothBezierCurveTo(d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'A')
			path.ellipticalArc(d.rx,  d.ry, d.xAxisRotation, d.largeArcFlag, d.sweepFlag, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code == 'a')
			path.relative().ellipticalArc(d.rx,  d.ry, d.xAxisRotation, d.largeArcFlag, d.sweepFlag, d.x - shiftx, d.y - shifty)
				.end();
		if(d.code.toLowerCase() == 'z')
			path.close()
				.end();
	};

	var dstyle = document.createAttribute('d');
	console.log(' shift after ', path.currentPath);
	dstyle.nodeValue = path.currentPath;
	element.attributes.setNamedItem(dstyle);
}

DomStyleProcessor.prototype.stylizeDomsbyExample = function(liTochangeDom, exampleDom){
	var exampleDomStyle = this.getAttrisofElement(exampleDom);
	for (var i = liTochangeDom.length - 1; i >= 0; i--) {
		var tochangeDom = liTochangeDom[i];
		this.setAttrisofElement(tochangeDom, exampleDomStyle);
	};
}

// module.exports = DomStyleProcessor;