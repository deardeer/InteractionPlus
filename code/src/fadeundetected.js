function fadeUndetected(){
	//console.log('fade undetected');
	//compute overlays
	var liRect = computeOverlayRects();
	//add overlay divs
	$.each(liRect, function(i, Rect){
		var iDiv = document.createElement('div');
		iDiv.id = 'cover_' + i;
		iDiv.className = 'overlay_div';
		$('body')[0].appendChild(iDiv);
		$('#cover_' + i).css(
		{
			width: Rect['width'],
			height: Rect['height'],
			top: Rect['top'],
			left: Rect['left'],
			position: 'absolute',
			'z-index': g_FrontZIndex - 1
		});
	});
}

//clear the overlays
function clearOverlays(){
	$('.overlay_div').remove();
}

//compute the rect of the computeOverlay
function computeOverlayRects(){
	var liRect = [];
	var coverRect = $('.region_index_circle rect')[0].getBBox();
	liRect.push(
	{	
		top: 0,
		left: 0,
		width: coverRect.x + coverRect.width,
		height: coverRect.y
	});

	liRect.push({
		top: 0,
		left: coverRect.x + coverRect.width,
		width: addOnSvg.attr('width') - coverRect.x - coverRect.width,
		height: addOnSvg.attr('height')
	});

	liRect.push({
		top: coverRect.y,
		left: 0,
		width: coverRect.x,
		height: coverRect.height
	});

	liRect.push({
		top: coverRect.y + coverRect.height,
		left: 0,
		width: coverRect.x + coverRect.width,
		height: addOnSvg.attr('height') - coverRect.y - coverRect.height
	});
	return liRect;
}