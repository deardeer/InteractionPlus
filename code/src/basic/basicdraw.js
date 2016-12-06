//get text size
function getTextSize(text, font) {
  var f = font || '12px arial',
  o = $('<div>' + text + '</div>')
        .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
        .appendTo($('body')),
  w = o.width();
  h = o.height();
  o.remove();
  return {'w': w, 'h': h};
}

//add the rect in group with rect style
//style ['fill', 'stroke', ...s]
function addRect(g, left, top, width, height, rectStyle){	
	var Rect = g.append('rect')
	.attr('x', left)
	.attr('y', top)
	.attr('width', width)
	.attr('height', height)
	.attr('fill', function(){
		if(rectStyle['fill'] == undefined)
			return 'gray';
		return rectStyle['fill'];
	})
	.attr('stroke', function(){
		if(rectStyle['stroke'] == undefined)
			return 'gray';
		return rectStyle['stroke'];
	});
	return Rect;
}

//add a group
function addGroup(ParentItem, groupId, groupTransform){
	var gGroup = ParentItem.append('g')
	.attr('id', groupId)
	.attr('transform', function(){
		if(groupTransform == undefined)
			return '';
		return groupTransform;
	});
	return gGroup;
}

//add rect in group 
function addText(g, textContent, fontSize, textStyle){
	var Text = g.append('text')
	.style("text-anchor", "middle")
	.attr('fill', function(){
		if(textStyle['fill'] == undefined)
			return 'black';
		return textStyle['fill'];
	})
	.attr('font-size', fontSize + "px")
    .text(textContent);
    return Text;
}