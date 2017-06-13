
/*
	the share annotation panel
*/
function SharePanelManager(){
	var Info = {};

	Info.__init__ = function(){		
		Info.m_mapShareRecordInfo = {};
		Info.m_iCurrentPreviewRecordId = -1;

		// self.m_SelectText = "";
		// self.m_SelectRectonAddDiv = {};
		self.m_hoverRecordId = -1;
		self.m_hoverText = "";
		self.m_hoverTextRect = {};
	}

	Info.getShareRecordInfobyId = function(iShareRecord){
		return this.m_mapShareRecordInfo[iShareRecord];
	}

	//draw the annotation render
	Info.selectText = function(selectText){
		var self = this;

		var r =window.getSelection().getRangeAt(0).getBoundingClientRect();
		var relative = $('#addondiv')[0].getBoundingClientRect();

		var selectRectonAddDiv = {
			'x': r.left - relative.left - HIGHLIGHTPAD,
			'y': r.top - relative.top - HIGHLIGHTPAD,
			'width': r.right - r.left + HIGHLIGHTPAD * 2,
			'height': r.bottom - r.top + HIGHLIGHTPAD * 2, 
		};		
		
		self.drawAnnotationRect('share-annotation-frame-temp', selectText, selectRectonAddDiv, -1);		
	}


	Info.drawAnnotationRectbyRecordId = function(iSharedRecordId){

		var recordInfo = g_SharePanelManager.getShareRecordInfobyId(iSharedRecordId);
		var textRect = recordInfo.textrect;
		var text = recordInfo.text;
		if(textRect == undefined)
			return;
		var DomId = 'share-annotation-frame-' + iSharedRecordId;
		this.drawAnnotationRect(DomId, text, textRect, iSharedRecordId);		
	}

	Info.drawAnnotationRect = function(DomId, ShareText, Rect, ShareReocrdId){	

		var self = this;

		if(d3.select('#' + DomId).empty() == false)
			d3.select('#' + DomId).remove();

		var annotateGroup = d3.select('#addondiv svg')
		.append('g')
		.attr('id', DomId)
		.attr('recordId', ShareReocrdId);
		
		var textAnnotateRect = annotateGroup
		.append('rect')
		.attr("class", 'share-rect')
		.attr('recordText', ShareText)
		.attr('x', Rect['x'])
		.attr('y', Rect['y'])
		.attr('width', Rect['width'])
		.attr('height', Rect['height'])
		.style('stroke', '#4CAF50')
		.style('stroke-width', '1px')
		.style('pointer-events', 'all')
		.style('fill', 'rgba(205, 220, 57, 0.31)')
		.on('mouseover', function(){
			var iShareRecordId = d3.select(this.parentNode).attr('recordId');
			d3.select(this).style('stroke-width', '3px');

			var Pos = {
				'x': Rect['x'] + Rect['width'],
				'y': Rect['y'],
			};
			console.log('mouse over 111 ', iShareRecordId, Pos);

			self.m_hoverRecordId = iShareRecordId;
			self.m_hoverText = d3.select(this).attr('recordText');
			self.m_hoverTextRect = Rect;

			//add the panel		
			self.drawAnnotationPanel(Pos, 'visible');				
		})
		.on('mouseout', function(){
			var iShareRecordId = d3.select(this.parentNode).attr('recordId');
			console.log(' mouse out 111 ', iShareRecordId);
			d3.select(this).style('stroke-width', '1px');
			var Pos = {
				'x': Rect['x'] + Rect['width'],
				'y': Rect['y'],
			};
			self.drawAnnotationPanel(Pos, 'hidden');		
		});	

	}

	Info.drawAnnotationPanel = function(pos, hidden){

		var self = this;
		var annotationPanelDomId = "share-annotation-button-panel";
		var annotationPanel = {};

		if(d3.select('#' + annotationPanelDomId).empty() == true){
			console.log(' not exist ');
			//not exist
			annotationPanel = d3.select('#addondiv')
				.append('div')
				.attr('id', annotationPanelDomId)
				.style('position', 'absolute')
				.style('pointer-events', 'visiblePainted')
				.style('left', pos['x'] + 'px')
				.style('top', pos['y'] + 'px')
				.style('visibility', hidden)
				.on('mouseover', function(){
					d3.select(this)
					.style('visibility', 'visible');
				})
				.on('mouseout', function(){
					d3.select(this)
					.style('visibility', 'hidden');					
				});
			//add buttons
			var buttonhtml = 
			// '<div style="float: left; width: 30%; height: 100%; padding: 3px">'+
				'<button class="btn btn-warning btn-xs function_button" id="share-note">Share</button>' +
				'<button class="btn btn-warning btn-xs function_button" id="delete-note">Delete</button>';

			var object_div = document.getElementById(annotationPanelDomId);
			var compiled = _.template(buttonhtml);	
			object_div.innerHTML = object_div.innerHTML + compiled({});

			//share the note
			d3.select('#share-note')
			.on('click', function(){
				console.log(" click jump button ");

				var caseurl = window.location.href;
				if(isUrlSpecial(caseurl))
					caseurl = getFakeUrlbyRealUrl(caseurl);
				// console.log(" case url ", caseurl);
				var time = getFormattedDate();
				var exploreinfo = g_InObjManager.getCurrentObj().m_CrossFilter.getExploreInfo();
				var data = {  	
			  		type: 'context',
				  	caseurl: caseurl, //g_FilterSetting,
				  	time: time,
				  	exploreinfo: exploreinfo,
				  	title: "",
				  	annotation: "",
				  	textrect: self.m_hoverTextRect,
				  	contexttext: self.m_hoverText,			
				};

    			g_ShareRecordComm.submitShareRecord(data, self, self.FBofsubmitShareRecordfromNote);	    		
	          
			});

			d3.select('#delete-note')
			.on('click', function(){
				console.log(" click delete note button ");
				if(self.m_hoverRecordId == -1){
					//not submit 
					d3.select('#share-annotation-frame-temp').remove();
					self.drawAnnotationPanel({'x': 0, 'y': 0}, 'hidden');	
				}else
					g_ShareRecordComm.deleteShareRecord(self.m_hoverRecordId, self, self.FBofdeleteShareRecordfromNote);
				// self.deleteShareRecord(self.m_iCurrentPreviewRecord);
			})
		}

		d3.select('#' + annotationPanelDomId)
		.style('left', pos['x'] + 'px')
		.style('top', pos['y'] + 'px')
		.style('visibility', hidden);
	}

	Info.FBofsubmitShareRecordfromNote = function(self, response){
		console.log(' success submit context record ', self.m_hoverRecordId, response.id, JSON.parse(response.textrect), response.contexttext);
		if(self.m_hoverRecordId == -1){
			//remove 
			d3.select('#share-annotation-frame-temp')
			.remove();
			//add new
			var DomId = 'share-annotation-frame-' + response.id;
			self.drawAnnotationRect(DomId, response.contexttext, JSON.parse(response.textrect), response.id);

			self.m_hoverRecordId = response.id;
			console.log(' hover record !! ', self.m_hoverRecordId);
		}
	}

	Info.FBofdeleteShareRecordfromNote = function(self){
		//remove the rect
		console.log(' delete note ', self.m_hoverRecordId);
		d3.select('#share-annotation-frame-' + self.m_hoverRecordId).remove();
		//hide the panel
		self.drawAnnotationPanel({'x': 0, 'y': 0}, 'hidden');	
		//drawAnnotationPanel
	}

	Info.addFlagPanel = function(show){

		if(!show){
			$("#flagpaneldiv").remove();
			return;
		}
		//show
		//add the div
		var flagpanelDiv = document.createElement('div');

		flagpanelDiv.id = 'flagpaneldiv';
		flagpanelDiv.className = 'detect_ignore';	
		flagpanelDiv.setAttribute("ignore_class", 'detect_ignore');
		// floatpanelDiv.class = 'background_panel';
		$('body')[0].appendChild(flagpanelDiv);
		var top = $('#floatpaneldiv').outerHeight();
		// var width = $('#floatpaneldiv').outerWidth();
		$('#flagpaneldiv').css({
			right: '2px',
			top: top,
			width: '200px',
			bottom: '2px',
			position: 'fixed',
			'padding': '0px',
			'margin-top' : '2px',
			'overflow': 'auto',
			'z-index': g_FrontZIndex + 3,
		})
		.addClass('background_panel');

		//fetch the annotations
		this.addSharedRecords();
	}

		//a shared record: descript + connection + ele_on_web
	Info.addSharedRecords = function(){
		console.log(' add share records ');
		this.fetchSharedRecordsfromServer();
	}

	// Info.updateShareRecords = function(){
		//TODO
		// this.addSharedRecords();
	// }

	Info.fetchSharedRecordsfromServer = function(){

		var self = this;

		var url = 'http://vis.pku.edu.cn/addonfilter_server/fetchSharedRecord';
		
		var caseurl = window.location.href;
		
		if(isUrlSpecial(caseurl))
			caseurl = getFakeUrlbyRealUrl(caseurl);

	    var data = {
	    	caseurl: caseurl,
	    	// topnumber: topNumber,
	    };

		$.ajax({
		  	url:url, 
		  	data:JSON.stringify(data), 
		  	type:"POST", 
		  	// contentType: "application/json",
		  	dataType: "jsonp",
		    success: function(response){
		    	self.successGetSharedRecord(response);
		    },
		    // contentType: "application/json;charset=utf-8",
		  	"crossDomain":true
	    });
	}

	Info.successGetSharedRecord = function(response){

		var self = this;

		//clear records
		d3.selectAll('.sharerecord').remove();

		console.log(" successGetSharedRecord ");
		var liRecordInfo = response.info;
		var sharePanelDiv = document.getElementById("flagpaneldiv");

		//add shared records
		this.m_mapShareRecordInfo = {};
		for (var i = liRecordInfo.length - 1; i >= 0; i--) {
			var record = liRecordInfo[i];
			self.m_mapShareRecordInfo[record.id] = record;
			if(record.type == 'dialog'){
				console.log(' draw dialog ', record.id);
				var html = '<div class="sharerecord" id=<%=shareId%> recordid=<%=recordid%> style="position:relative">' +							
							'<i class="fa fa-times delete_icon_right hidden" divid=<%=shareId%> recordid=<%=recordid%>></i>'+				
							'<p style="margin:2px"><b><%=title%></b> <%=desp%></p>' +
							'<p style="font-size: 8px;margin: 2px;"><%=time%></p>' +
					   '</div>';
				// var html = '<p><%=desp%></p>' +
				// 		   '<p><small><%=time%></small></p>';
				var compiled = _.template(html);
				sharePanelDiv.innerHTML += compiled({
					recordid: record['id'],
					shareId: 'sharerecord_' + i,
					title: record['title'],
					desp: record['des'],
					time: record['time'],
				});
			}else if(record.type == 'context'){
				self.drawAnnotationRectbyRecordId(record.id);
			}			
		};

		d3.selectAll('.sharerecord')
		.on('mouseover', function(){
			d3.select(this)
			.style('border', 'solid red 1px');			
			$(this).find('.delete_icon_right').removeClass('hidden');
		})
		.on('mouseout', function(){		
			d3.select(this)
			.style('border', 'solid black 1px');
			$(this).find('.delete_icon_right').addClass('hidden');
		})
		.on('click', function(){
			console.log('click record ', d3.select(this).attr('recordid'), 
				self.m_mapShareRecordInfo[d3.select(this).attr('recordid')]);			
			self.previewShareRecord(d3.select(this).attr('recordid'));
		});

		d3.selectAll('.delete_icon_right')
		.on('click', function(){
			var recordid = d3.select(this).attr('recordid');
			var parentdivid = d3.select(this).attr('divid');
			console.log(' delete ', recordid, parentdivid);
			//remove the record
			g_ShareRecordComm.deleteShareRecord(recordid, self, self.deleteShareRecord);
			d3.select('#' + parentdivid).remove();		
			if(self.m_iCurrentPreviewRecordId == recordid){
				//remove the preview 
				self.annotationElesbyRecordId(self.m_iCurrentPreviewRecordId, false);
			}	
			d3.event.stopPropagation();
		})
	}

	Info.deleteShareRecord = function(self){
		console.log(' delete share record ');
	}

	//preview the shared record
	Info.previewShareRecord = function(recordId){
		
		var self = this;
		var previewDOM = d3.select('#preview_rect');

		var rect = self.m_mapShareRecordInfo[recordId]['rect'];
	
		if(previewDOM.empty() == true){
			console.log(" add share rect ");
			//add
			d3.select('#addonsvg_here')
			.append('rect')
	        .attr('class', 'define_region')
	        .attr('id', 'preview_rect') //'define_region_rect')      
			.attr('previewid', recordId)
	        .attr("width", rect.width)
	        .attr("height", rect.height)
	        .style('opacity', '0.7')
	        .attr("x", rect.left)
	        .attr("y", rect.top); 

    		window.scrollTo(rect.left - 100, rect.top - 100);
	        
	        self.annotationElesbyRecordId(recordId, true);	 
			// $('body')[0].appendChild(flagpanelDiv);			
		}else{
			//false
			if(previewDOM.attr('previewid') == recordId){
				previewDOM.remove();				
	        	self.annotationElesbyRecordId(recordId, false);
    			// window.scrollTo(0, 0);
			}else{				
				previewDOM
				.attr('previewid', recordId)
		        .attr("width", rect.width)
		        .attr("height", rect.height)
		        .attr("x", rect.left)
		        .attr("y", rect.top); 

    			window.scrollTo(rect.left - 100, rect.top - 100);

		        self.annotationElesbyRecordId(recordId, true);
			}
		}
	}

	Info.annotationElesbyRecordId = function(recordId, highlight){

		console.log(" annotation element ids ", liEleId);
		
		var self = this;
		var liEleId = self.m_mapShareRecordInfo[recordId]['eleids'];

		if(highlight == false){
			console.log('remove share group ');
			//remove
			d3.select('.share-annotation-group')
			.remove();

	        self.m_iCurrentPreviewRecordId = -1;
		}else{
			if(self.m_iCurrentPreviewRecordId == recordId)
				return;
			else{
				d3.select('.share-annotation-group')
				.remove();
			}
			console.log('add share group ');
			//add the border 	
			var sharegroup = d3.select('#addondiv svg')
			.append('g')
			.attr('class', 'share-annotation-group');

			for (var i = liEleId.length - 1; i >= 0; i--) {
				var iEleId = liEleId[i];
				var Rect = g_GlobalElementIdManager.getGlobalRectbyEleId(iEleId);
				console.log(" rect = ", i, Rect);
			    sharegroup
			    .append('rect')    
			    .attr('class', 'share-annotation-rect')
			    // .attr("filter", "url(#glow)")
			    .attr('id', 'share-annotation-rect-' + iEleId)
			    .attr('x', Rect['x1'])
			    .attr('y', Rect['y1'])
			    .attr('width', Rect['x2'] - Rect['x1'])
			    .attr('height', Rect['y2'] - Rect['y1']);
			}
		    self.m_iCurrentPreviewRecordId = recordId;
		}
	}

	Info.__init__();
	return Info;
}



//add the flagbuttons, 
function addAllFlagButtons(){
	addTopFlagButtons(-1);
}


//add the top number flag buttons, if topNumber = -1, all
function addTopFlagButtons(topNumber){

	//console.log(' top number = ', topNumber);

	//communicate with server, get the flag id list
	var url = 'http://vis.pku.edu.cn/addonfilter_server/fetchFlagIds';
	var caseurl = window.location.href;
	
	if(isUrlSpecial(caseurl))
		caseurl = getFakeUrlbyRealUrl(caseurl);

    var data = {
    	caseurl: caseurl,
    	topnumber: topNumber,
    };

	$.ajax({
	  	url:url, 
	  	data:JSON.stringify(data), 
	  	type:"POST", 
	  	// contentType: "application/json",
	  	dataType: "jsonp",
	    jsonpCallback:"feedbackOfFetchFlagIds",
	    // contentType: "application/json;charset=utf-8",
	  	"crossDomain":true
    });
}


function feedbackOfFetchFlagIds(response){

	//console.log(" feedbackOfFetchFlagIds success ! ");
	var liFlagInfo = response.info;
	//console.log(' return flagIdList ', liFlagInfo);
	
	if(liFlagInfo.length == 0)
		return;
	drawFlagsInTree(liFlagInfo);

/*

	//add the flag id one by one
	var stepWidth = g_CircleButtonRadius * 7, stepHeight = g_CircleButtonRadius * 4;
	var viewWidth = $('#flagpaneldiv').outerWidth();//, viewHeight = $('#flagpaneldiv').outerHeight();
	var widthGap = 5, heightGap = 5;
	var columnNumber = viewWidth/(stepWidth + widthGap);

	for (var i = 0; i < liFlagIdComment.length; i++) {
		var iRowIndex = parseInt(i / columnNumber);
		var iColumnIndex = i - iRowIndex * columnNumber;

		var flagIdComment = liFlagIdComment[i];
		var flagId = flagIdComment.id;
		var commentText = flagIdComment.commentText;
		var buttonPos = {
			x: stepWidth * iColumnIndex + widthGap/2.,
			y: (stepHeight + heightGap) * iRowIndex + heightGap/2.,
		};
		// var commentText = response.;
		addFlagButton(flagId, buttonPos, commentText, 'flagpaneldiv');
	};

	//reset the height of flagpaneldiv
	var flagdivheight = (parseInt(liFlagIdComment.length/(columnNumber)) + 1) * (stepHeight + heightGap);
	$('#flagpaneldiv').css({
		height: flagdivheight,
	});
*/
}

//add the flag button: if ParentDivId == undefined, add to the body
function addFlagButton(FlagId, buttonPos, commentText, parentDivId){

	if(parentDivId == undefined)
		parentDivId = 'body';
	else
		parentDivId = '#' + parentDivId;

	//console.log(' button Pos ', buttonPos, ' parent div ', parentDivId);

	var radius = g_CircleButtonRadius;
	var expandWidth = radius * 2.2;

	// commentText = "Filter: test filter";
	var visibleText = commentText;
	if(commentText.length > 13){
		visibleText = commentText.substring(0, 10);
		visibleText += "...";
	}
	var font = '12px arial';
	var labelTextSize = getTextSize(visibleText, font);

	var divHeight = expandWidth + labelTextSize.h * 1.5;
	var divWidth = expandWidth < labelTextSize.w * 1.3 ? labelTextSize.w * 1.3: expandWidth;

	var flagdiv = document.createElement('div');
	flagdiv.id = 'div_flag_' + FlagId;
	flagdiv.className = 'pku-vis-add-on';
	$(parentDivId)[0].appendChild(flagdiv);
	$('#div_flag_' + FlagId).css({
		width: divWidth,
		height: divHeight,
		top: buttonPos.y,
		left: buttonPos.x,
		position: 'absolute',
		'z-index': g_FrontZIndex
	});

	var flagsvg = d3.select('#div_flag_' + FlagId).append("svg")
	.attr('id', function(){
		return 'svg_flag_' + FlagId;
	})
    .attr("width", divWidth)
    .attr("height", divHeight);

    var flagGroup = flagsvg.append('g')
    .attr('class', 'flag')
    .attr('id', function(){
    	return 'flag_'+ FlagId;
    })

    flagGroup.append('circle')
    .attr("fill", "#74c476")
    .attr("stroke-width", '1px')
    .attr('stroke', 'black')
    .attr("transform", function(){return "translate(" + (radius * 1.1) + "," + (radius * 1.1)+ ")";})
    .attr("r", g_CircleButtonRadius); 

    flagGroup.append('text')
    .attr('font-family', 'FontAwesome')  
    .attr("dy", ".3em") 
    .attr('flagId', FlagId)
    .style("text-anchor", "middle")
    .attr('font-size', function(d) { return '15px'; })
    .style('cursor', 'pointer')
    .attr("transform", function(){return "translate(" + (radius * 1.1) + "," + (radius * 1.1)+ ")";})
 	.text(function(d){ return '\uf024'; })  
    .on("mouseover", function(){

      // alert("delete");
      $(this).siblings('circle')
      .css('stroke-width', '2px');  

      //show the whole text
      var commentText = $(this).siblings('.comment_text')[0].getAttribute('commentText');
      // //console.log(' comment text ', commentText);

      var labelTextSize = getTextSize(commentText, font);

	  var divHeight = expandWidth + labelTextSize.h * 1.5;
	  var divWidth = expandWidth < labelTextSize.w * 1.3 ? labelTextSize.w * 1.3: expandWidth;

	  //set the div and svg
	  $(this).parents('svg')
	  .attr('width', divWidth)
	  .attr('height', divHeight);

	  //border the text
	  //border the text
	  var text = $(this).siblings('.comment_text')[0];
	  d3.select(text)
	  .text(commentText)
	  .attr("transform", function(){return "translate(" + labelTextSize.w/2. + "," + expandWidth * 1.4 + ")";})
 	  .style('font-weight', 'bolder');
      // 
      // .value()
      //triggle the 
      // $(this).tooltip();
    })
    .on('mouseout', function(){
      $(this).siblings('circle')
      .css('stroke-width', '1px'); 

      //set back the text
      var commentText = $(this).siblings('.comment_text')[0].getAttribute('commentText');
      var visibleText = commentText;
      if(commentText.length > 13){
		visibleText = commentText.substring(0, 10);
		visibleText += "...";
	  }
      var labelTextSize = getTextSize(visibleText, font);

	  var divHeight = expandWidth + labelTextSize.h * 1.5;
	  var divWidth = expandWidth < labelTextSize.w * 1.3 ? labelTextSize.w * 1.3: expandWidth;

	  //set the div and svg
	  $(this).parents('svg')
	  .attr('width', divWidth)
	  .attr('height', divHeight);
	  
	  //border the text
	  var commenttext = $(this).siblings('.comment_text')[0];
	  d3.select(commenttext)
	  .text(visibleText)
	  .attr("transform", function(){return "translate(" + labelTextSize.w/2. + "," + expandWidth * 1.4 + ")";})
 	  .style('font-weight', 'normal');

      // d3.select(this)
      // .attr('stroke', 'none');
    })
    .on('click', function(){
    	var tempFlagId = $(this)[0].getAttribute('flagId');
    	//console.log(' temp Flag id ', tempFlagId);
        self.openSubmitExploration(tempFlagId);
    });

    $('#flag_'+ FlagId).on('mousedown', function (e) {
    	//console.log(' mouse down !! ');
	  // //console.log('mousedown', e.pageX, ', ', e.pageY); 
 	  event.stopPropagation(); 
	  // handleMouseDown(e, addOnSvg);
	}).on('mouseup', function(e) {
	  event.stopPropagation(); 
	}).on('mousemove', function(e) {
	  event.stopPropagation(); 
	});

	//add the comment text
   	
	flagGroup.append('text')
	.attr('text-align', 'middle')
	.attr('class', 'comment_text')
	.attr('commentText', commentText)
	.attr('font-family', 'arial')  
    .attr("dy", ".3em") 
    .attr('flagId', FlagId)
    .style("text-anchor", "middle")
   	.style('font', font)
    .style('cursor', 'pointer')
    .attr("transform", function(){return "translate(" + labelTextSize.w * 0.5 + "," + expandWidth * 1.4 + ")";})
 	.text(visibleText);

}

// var g_FilterSetting = {};
// var g_CurrentParentFlagId = -1;

//submit the exploration
// function submitExploration(){

//   //console.log(' submit exploration ');

//   // var OffSet = $('#submit_button').offset();   
  
//   //generate the filter setting
//   g_FilterSetting = g_FilterSettingInfo.generateFilterSetting();

//   //add the flag button, pos
//   // //console.log(' comment text ', commentText);

//   //upload to db in server
//   var url = 'http://vis.pku.edu.cn/addonfilter_server/submitFS';

//   g_FilterSetting.commentText = $('#submit_comment_input').val();
//   g_FilterSetting.detailText = $('#submit_description_input').val();

//   if(g_CurrentParentFlagId != -1){
//   	//console.log(" g_FilterSetting.parentid ", g_FilterSetting.parentid, ' , ', g_CurrentParentFlagId);
//   	g_FilterSetting.parentid = g_CurrentParentFlagId;
//   }

//   var data = {  	
//   	filtersetting: g_FilterSetting,
//   };

//   $.ajax({
//   	url:url, 
//   	data:JSON.stringify(data), 
//   	type:"POST", 
//   	success: function(response){
//   		//console.log(' success !', response);
//   	},
//   	// contentType: "application/json",
//   	dataType: "jsonp",
//     jsonpCallback:"feedbackOfFSSubmission",
//     // contentType: "application/json;charset=utf-8",
//   	"crossDomain":true
//   });

//   /*
// 	type: "POST",
//     url: siteRoot + "api/SpaceGame/AddPlayer",
//     async: false,
//     data: JSON.stringify({ Name: playersShip.name, Credits: playersShip.credits }),
//     contentType: "application/json",
//     complete: function (data) {
//     //console.log(data);
//     wait = false;
//   */
// }

// function feedbackOfFSSubmission(response){
// 	var flagId = response.flagId;
// 	console.log(' success FS submission ');
// 	//console.log(' return flagId = ', flagId);

// 	//to be deleted
// 	// var flagButtonPos = {
// 	//   	x: d3.transform(d3.select('#submit_button').attr('transform')).translate[0],// + OffSet.left, 
//  //  		y: d3.transform(d3.select('#submit_button').attr('transform')).translate[1],// + OffSet.top,
//  //    };
   
//  //    var commentText = $('#submit_comment_input').val();

//     //update inter
//     g_InteractionRecorder.addShareExploreCount();
// }

//open an submitted exploration
function openSubmitExploration(flagId){

  //console.log(' open submited exploration ', flagId);
  //stop the click event 
   event.stopPropagation();

   //remove the flag related
   // var iFlagId = g_FilterSetting.flagId;
   // $('#div_flag_' + flagId).remove();
   g_CurrentParentFlagId = flagId;

   //fetch from to db in server
   var url = 'http://vis.pku.edu.cn/addonfilter_server/fetchFS';
   // var data = {"info": {flagId: flagId}};
   var data = {flagId: flagId};
   // //console.log('')
   $.ajax({
  	url:url, 
  	data:JSON.stringify(data), 
  	type:"POST", 
  	// success: function(response){
  	// 	// //console.log(' success !', response);
  	// },
  	// contentType: "application/json",
  	dataType: "jsonp",
    jsonpCallback:"feedbackOfFSFetch",
    // contentType: "application/json;charset=utf-8",
  	"crossDomain":true
  });
   
}

function feedbackOfFSFetch(response){

   //console.log(' feeback of FS Fetching ', response);

   //close current add-on filter
   d3.select('g.region_index_circle').remove();
   removeDefineRegion();

   //recover
   g_FilterSetting = {};   
   g_FilterSetting = JSON.parse(response);

   //console.log(' filter setting ', g_FilterSetting);

   recover1byDedindRect();
   recover2byCreateNewGroups();
   recover1_5byOriginGroupName();
   recover3byVisibleGroups();
   recover3_5bySelectedGroup();
   recover4byProperties();
   recover5byVisibleProperties();

   //update inter
   g_InteractionRecorder.addExploreOtherCount();
}



//1. recover the defined rect 
//recover the define rect: mimic the drag-move
function recover1byDedindRect(){
	//console.log(' recover 1 begin ');
  var defineRegionInfo = g_FilterSetting.defineRegionInfo;
  var beginPos = {x: defineRegionInfo.left, y: defineRegionInfo.top};
  var endPos = {x: defineRegionInfo.left + (defineRegionInfo.width), y: (defineRegionInfo.top) + (defineRegionInfo.height)}
  //console.log(' begin pos ', beginPos, ' end pos ', endPos);
  // enterAddOn();
  handleMouseDown(beginPos, addOnSvg);
  handleMouseMove(endPos, addOnSvg);
  handleMouseUp();
	//console.log(' recover 1 end ');
}

//1.5 recover the origin group names 
function recover1_5byOriginGroupName(){

	//console.log(' recover 1_5 begin ');
	var defaultGroupIdNameMap = g_FilterSetting.defaultGroupInfoMap;
	for(var iGroupId in defaultGroupIdNameMap){
		var sGroupName = defaultGroupIdNameMap[iGroupId];
		g_ObjectGroupManager.setGroupNamebyId(iGroupId, sGroupName);
	}
	drawObjectButtons();

	//console.log(' recover 1_5 end ');
}

//2. recover the created new groups
function recover2byCreateNewGroups(){

	//console.log(' recover 2 begin ');
	//travesal the new group list
	var newGroupInfoList = g_FilterSetting.newGroupInfoList;
	for (var i = 0; i < newGroupInfoList.length; i++) {
		var newGroupInfo = newGroupInfoList[i];
		var liEleId = newGroupInfo.liEleId;
		var attr = newGroupInfo.attr;
		g_ObjectGroupManager.addNewGroup(liEleId, attr);
	};

	//console.log(' recover 2 end ');
	// drawObjectButtons();
}

//3. recover the visible/invisible groups 
function recover3byVisibleGroups(){

	//console.log(' recover 3 begin ');

	var liInVisibleGroupId = g_FilterSetting.invisibleGroupIdList;
	for (var i = 0; i < liInVisibleGroupId.length; i++) {
		var iGroupId = liInVisibleGroupId[i];
		deleteGroup(iGroupId);   		
	};

	//console.log(' recover 3 end ');
}

function recover3_5bySelectedGroup(){

	//console.log(' recover 3_5 begin ');

	var iSelectedGroupId = g_FilterSetting.selectedGroupId;
	if(iSelectedGroupId == -1)
		return;
	$('#object_span_' + iSelectedGroupId).addClass('active');
	clickGroup(iSelectedGroupId);

	//console.log(' recover 3_5 end ');
	//check the outlooking
}

//4. recover the derived property of selected group
function recover4byProperties(){


	//console.log(' recover 4 begin ');

	var iSelectedGroupId = g_FilterSetting.selectedGroupId;
	if(iSelectedGroupId == -1)
		return;

	//create the derived property
	var mapGroupDerivedPropertyNameDefinition = g_FilterSetting.mapGroupDerivedPropertyNameDefinition;
	for(var iGroupId in mapGroupDerivedPropertyNameDefinition){
		if(iGroupId != g_FilterSetting.selectedGroupId)
			continue;
		var liDerivedProperties = mapGroupDerivedPropertyNameDefinition[iGroupId];
		for(var i = 0; i < liDerivedProperties.length; i ++){
			var pronameDefinition = liDerivedProperties[i];
			var proName = pronameDefinition.proName, proDefinition = pronameDefinition.proDefinition;
			g_PropertyManager.createADerivedProperty(iGroupId, proName, proDefinition);
		}
	}

	//rename the property name
	var mapGroupIdProNameList = g_FilterSetting.mapGroupIdProNameList;
	for(var iGroupId in mapGroupIdProNameList){
		if(iGroupId == g_FilterSetting.selectedGroupId){
			var ProIdNameList = mapGroupIdProNameList[iGroupId];
			for (var i = 0; i < ProIdNameList.length; i++) {
				var ProIdName = ProIdNameList[i];
				var iProId = ProIdName.propertyId;
				var newName = ProIdName.propertyName;
				var propertyBag = g_PropertyManager.getPropertyBag(iGroupId);
				propertyBag.setPropertyName(iProId, newName);
				// renamePropertyOfGroup(iGroupId, iProId, newName);
			};
		}
	}
	//redraw
	drawProperties(g_FilterSetting.selectedGroupId);


	//console.log(' recover 4 end ');
}

function recover5byVisibleProperties(){

}

// var g_FlagTree = {};

//draw the tree flag panel
function drawFlagsInTree(liFlagInfo){

	//create the tree data from flagid list
	createTree(liFlagInfo);
	var treeData = g_TreeInfo.getTree();
	var iMaxDepth = g_TreeInfo.getMaxDepth();
	var font = '10px arial';
	// //console.log(' root ', treeData[0]);

	/*
	var node = {
		// "name": "Level 3: D",
    	"parent": "x"};

    var parnetnode = {
	            // "name": "Son of A",
	            "parent": "Level 2: A",
	            "children": [
	           		// parentnode,
	            	{"name": "Level 3: D",
	            	"parent": "Son of A ",},	            	
	            	{"name": "Level 3: D",
	            	"parent": "Son of A ",},
	            	node,
	            ],
	          };
	
	var treeData = [
	  {
	    "name": "Top Level",
	    "parent": "null",
	    "children": [
	      {
	        "name": "Level 2: A",
	        "parent": "Top Level",
	        "children": [
	          parnetnode,
	          {
	            "name": "Daughter of A",
	            "parent": "Level 2: A",
	          }
	        ]
	      },
	      {
	        "name": "Level 2: B",
	        "parent": "Top Level"
	      },
	      {
	        "name": "Level 2: C",
	        "parent": "Top Level"
	      },
	      {
	        "name": "Level 2: D",
	        "parent": "Top Level"
	      }
	    ]
	  }
	];
	*/

	var margin = {top: 0, right: 10, bottom: 0, left: 10};
	var width = 250 - margin.right - margin.left;
	var height = 300 - margin.top - margin.bottom;

	var nodeRadius = 10;

	var i = 0,
	duration = 750,
	root;

	var tree = d3.layout.tree()
	.size([width, height]);

	var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.x, d.y]; });

	var svg = d3.select("#flagpaneldiv").append("svg")
	.attr('class', 'tree_svg')
	.attr("width", "100%")//width + margin.right + margin.left)
	.attr('height', '100%')
	// .attr("height", height + margin.top + margin.bottom)
	.style('padding-top', '20px') //  translate(200,0) 
	.append("g")
	.attr('class', 'tree_g')
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	root = treeData[0];
	root.x0 = width / 2 - nodeRadius * 2.;
	root.y0 = 0;
	  
	update(root);

// d3.select(self.frameElement).style("height", "500px");

    function update(source){

	  // Compute the new tree layout.
	  var nodes = tree.nodes(root).reverse(),
	    links = tree.links(nodes);

	    //console.log(" nodes ", nodes);

	  // Normalize for fixed-depth.
	  nodes.forEach(function(d) { 
	  	d.y = d.depth * 35; 
	  });

	  // Update the nodes…
	  var node = svg.selectAll("g.node")
	    .data(nodes, function(d) { 
	    	return d.id || (d.id = ++i); 
	    });

	  // Enter any new nodes at the parent's previous position.
	  var nodeEnter = node.enter().append("g")
	    .attr("class", "node")
	    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
	    .on("click", click)
	    .on("mouseover", hover);

	  nodeEnter.append("circle")
	    .attr("stroke-width", '1px')
	    .attr('stroke', 'black')
	    .style('cursor', 'pointer')
	    .style('cursor', 'pointer')
	    .style("fill", function(d) { return d._children ? "#3C763D" : "#74c476"; })
	    .attr("r", 1e-6)
	    .append("svg:title")
   		.text(function(d) {  
   			//console.log(" d deatial text ", d.detailText);
   			return d.detailText;
   		});

	     nodeEnter.append('text')
		.attr('text-align', 'middle')
		.attr('class', 'comment_text')
		// .attr('commentText', commentText)
		.attr('font-family', 'arial')  
	    .attr("dy", ".3em") 
	    .style("text-anchor", "middle")
	   	.style('font', font)
	    .style('cursor', 'pointer')
	    .attr("transform", function(){return "translate(0,"  + g_CircleButtonRadius * 1.2 + ")";})
	 	.text(function(d){
	 		//console.log(" d ", d);
	 		return d.commentText;
	 	}); 

	  // nodeEnter.append("text")
	  //   .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
	  //   .attr("dy", ".35em")
	  //   .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
	  //   .text(function(d) { return d.name; })
	  //   .style("fill-opacity", 1e-6);

	  // Transition nodes to their new position.
	  var nodeUpdate = node.transition()
	    .duration(duration)
	    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

	   nodeUpdate.select("circle")
	    .attr("r", function(d){
	    	var tempMaxDepth = parseInt(iMaxDepth);
	    	var tempDepth = parseInt(d.depth);
	    	return g_CircleButtonRadius * 0.2 + (g_CircleButtonRadius * 0.8) * (tempMaxDepth - tempDepth + 1)/(1 + tempMaxDepth);
	    })
	    .style("fill", function(d) { return d._children ? "#3C763D" : "#74c476"; });

	  // nodeUpdate.select("text")
	  //   .style("fill-opacity", 1);

	  // Transition exiting nodes to the parent's new position.
	  var nodeExit = node.exit().transition()
	    .duration(duration)
	    .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
	    .remove();

	  nodeExit.select("circle")
      .attr("r", 1e-6);

	  // nodeExit.select("text")
	  //   .style("fill-opacity", 1e-6);

	  // Update the links…
	  var link = svg.selectAll("path.flag_link")
	    .data(links, function(d) { return d.target.id; });

	  // Enter any new links at the parent's previous position.
	  link.enter().insert("path", "g")
	    .attr("class", "flag_link")	    
	    .attr("d", function(d) {
		    var o = {x: source.x0, y: source.y0};
		    return diagonal({source: o, target: o});
		    });

		  // Transition links to their new position.
		  link.transition()
		    .duration(duration)
		    .attr("d", diagonal);

		  // Transition exiting nodes to the parent's new position.
		  link.exit().transition()
		    .duration(duration)
		    .attr("d", function(d) {
		    var o = {x: source.x, y: source.y};
		    return diagonal({source: o, target: o});
		    })
		    .remove();

		  // Stash the old positions for transition.
		  nodes.forEach(function(d) {
		  d.x0 = d.x;
		  d.y0 = d.y;
		  });

		  //update the tree_svg
		  // var heightGap = 10;
		  // var treegroupBox = $('.tree_g')[0].getBBox();
		  // d3.select('.tree_svg')
		  // .style('height', treegroupBox.height + heightGap);

		  // $('#flagpaneldiv').css({
		  // 	'height': treegroupBox.height + heightGap
		  // });		 
	}

	function hover(d){
		// //console.log(' mouse hover text ', d.commentText, this);
		$('.node circle').css({'stroke-width': '1px'});
		// $('.node circle').css({'stroke-width': '2px'});

		$(this).children('circle')
		.css({'stroke-width': '2px'});
		// $(this).children('text')
		// .style('font-weight', '700');
		// $('text')
		// .style('font-weight', '700');

	}

	// Toggle children on click.
	function click(d) {

	  // if (d.children) {
	  // d._children = d.children;
	  // d.children = null;
	  // } else {
	  // d.children = d._children;
	  // d._children = null;
	  // }

	  //console.log(' click flag id ', d.flagid);
	  if(d.flagid != -1){
	  	//not route
	  	openSubmitExploration(d.flagid);
	  }
	  update(d);
	}
}

function TreeInfo(){
	var Info = new Object;
	Info.m_mapFlagIdLeave = {};
	Info.m_iMaxDepth;

	//the tree info
	Info.m_tree = [];

	Info.setMaxDepth = function(iMaxDepth){
		this.m_iMaxDepth = iMaxDepth;
	}

	Info.createLeave = function(flagId, flagInfo){
		
		var depth = flagInfo.depth;
		var iflagId = flagInfo.id;
		var commentText = flagInfo.commentText;
		var parentFlagId = flagInfo.parentid;
		var leave = {
			"flagid": iflagId,
			"commentText": commentText,
			"detailText": flagInfo.detailText,
		};
		this.m_mapFlagIdLeave[iflagId] = leave;

		if(depth == 0){
			if(this.m_tree.length == 0){
				var tempchildlist = [leave];
				this.m_tree.push({
					"commentText": '',
					"detailText": '',
					"flagId": -1,
					"children": tempchildlist,
				});
			}else{				
				var tempchildlist = this.m_tree[0].children;
				tempchildlist.push(leave);
				this.m_tree[0].children = tempchildlist;
			}
			// this.m_tree['children'].push(leave);
		}else{
			var parentLeave = this.m_mapFlagIdLeave[parentFlagId];
			if(parentLeave['children'] == undefined)
				parentLeave['children'] = [leave];
			else
				parentLeave['children'].push(leave);
			this.m_mapFlagIdLeave[parentFlagId] = parentLeave;
		}
	}

	Info.getTree = function(){
		return this.m_tree;
	}
	Info.getMaxDepth = function(){
		return this.m_iMaxDepth;
	}

	Info.clearTreeInfo = function(){
		this.m_mapFlagIdLeave = {};
		this.m_tree = [];
		//clear
	}
	return Info;
}

var g_TreeInfo = new TreeInfo();

function createTree(liFlagInfo){
	g_TreeInfo.clearTreeInfo();
	//sort by depth
	var iMaxDepth = 0;
	var mapDepthFlagInfos = {};
	var iFlagCount = 0;
	while(iFlagCount < liFlagInfo.length){
		var flagInfo = liFlagInfo[iFlagCount];
		
		var depth = flagInfo.depth;
		iFlagCount += 1;
		if(mapDepthFlagInfos[depth] == undefined)
			mapDepthFlagInfos[depth] = [flagInfo];
		else
			mapDepthFlagInfos[depth].push(flagInfo);	
		if(iMaxDepth < depth)
			iMaxDepth = depth;	
	}

	g_TreeInfo.setMaxDepth(iMaxDepth);

	//build up the tree	
	for (var i = 0; i <= iMaxDepth; i++) {
		//from root + 1
		var flagInfoList = mapDepthFlagInfos[i];
		for(var j = 0; j < flagInfoList.length; j ++)
			g_TreeInfo.createLeave(i, flagInfoList[j]);
	};				
}

