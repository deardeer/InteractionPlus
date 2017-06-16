/*
	ToolBarRender: render the toolbar
*/

function ToolBarRender(){
	var Info = {};

	Info.addFloatPanel = function(){

		var self = this;

		if($('#floatpaneldiv').length != 0)
			return;

		var svgwidth = 20;
		var svgheight = 40;

		var floatpanelDiv = document.createElement('div');
		floatpanelDiv.id = 'floatpaneldiv';
		floatpanelDiv.setAttribute("ignore_class", 'detect_ignore');
		// floatpanelDiv.className = 'detect_ignore';
		// floatpanelDiv.class = 'background_panel';
		$('body')[0].appendChild(floatpanelDiv);
		$('#floatpaneldiv').css({
			'z-index': g_FrontZIndex + 3,
		})
		.addClass('background_panel');

		var show_explore_str = "Show Annotation", hide_explore_str = 'Hide Annotation';

		//keep "show exploration"
		// var buttonpanelhtml = '<div class="container-fluid"><div class="row"><div class="col-md-12"><span class="label label-default">Filter+</span><span class="label label-default" style="float:right">Welcome! <%=userName%></span><div class="btn-group" style="margin-top:5px"><button class="btn btn-warning btn-xs function_button" type="button" id="show_manual_button"> Manual</button><button class="btn btn-warning btn-xs function_button" type="button" id="feedback_button"> Feedback</button><button class="btn btn-warning btn-xs function_button" type="button" id="exit_2_button"> Exit</button></div></div></div></div>';	
		var buttonpanelhtml = 
		'<div class="container-fluid">' + 
			'<div class="row">' + 
				// '<div class="col-md-12"><span class="label label-default">Filter+</span>' + 
					//'<span class="label label-default" style="float:right">Welcome! <%=userName%></span>' + 
				'<img src=<%=imgsrc%> style="height: 25px; margin-top: 3px; margin-right: 10px; margin-left: 10px; float: left;"></img>' + 
				// '<span class="label label-default" style="display: inline-block; float: left;">Filter+</span>' + 
				'<div class="btn-group" style="margin:5px; float: left;">' + 
				    '<button class="btn btn-warning btn-xs function_button" type="button" id="rectselect_button"><img class="btn_img" src=<%=selectimgsrc%>></img> Selection</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="radialmask_button"><img class="btn_img" src=<%=radialimgsrc%>></img> Radial</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="vparallelmask_button"><img class="btn_img" src=<%=vparallelimgsrc%>></img> V-Parallel</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="hparallelmask_button"><img class="btn_img" src=<%=hparallelimgsrc%>></img> H-Parallel</button>' + 
				'</div>' + 
				//'<div class="btn-group" style="margin:5px; float: left;">' + 
				//'</div>' + 			
				'<div class="btn-group" style="margin:5px; float: left;">' + 
				    '<button class="btn btn-warning btn-xs function_button" type="button" id="textselect_button"><img class="btn_img" src=<%=renameimgsrc%>></img> Rename</button>' + 
				    '<button class="btn btn-warning btn-xs function_button" type="button" id="vlineup_button"><img class="btn_img" src=<%=vlineupimgsrc%>></img> V-Line</button>' + 
				    '<button class="btn btn-warning btn-xs function_button" type="button" id="hlineup_button"><img class="btn_img" src=<%=hlineupimgsrc%>></img> H-Line</button>' + 
				'</div>' + 		
				'<div class="btn-group" style="margin:5px; float: left;">' + 
				    '<button class="btn btn-warning btn-xs function_button" type="button" id="annotate_button"><img class="btn_img" src=<%=annotateimgsrc%>></img> Annotate</button>' + 				
				'</div>' +
				//'<div class="btn-group" style="margin:5px; float: left;">' + 
					// '<button class="btn btn-warning btn-xs function_button" type="button" id="tablemask_button"><img class="btn_img" src=<%=tabularimgsrc%>></img> Tabluar Mask</button>' + 
					//'<button class="btn btn-warning btn-xs function_button" type="button" id="networkmask_button"><img class="btn_img" src=<%=networkimgsrc%>></img> Network</button>' + 
				//'</div>' + 
				// '</div>' + 
				 '<div class="btn-group" style="margin:5px; display: inline-block; float: right;">' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="show_other_button" showhide="show"><img class="btn_img" src=<%=networksrc%>></img> Show Annotation</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="show_manual_button"><img class="btn_img" src=<%=manualimgsrc%>></img> Manual</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="feedback_button"><img class="btn_img" src=<%=feedbackimgsrc%>></img> Feedback</button>' + 
					'<button class="btn btn-warning btn-xs function_button" type="button" id="exit_2_button"><img class="btn_img" src=<%=exitimgsrc%>></img> Exit</button>' + 
				'</div>' + 
			'</div>' + 
		'</div>';	

		var compiled = _.template(buttonpanelhtml);
		//show_other_button, , feedback_button, exit_2_button

		floatpanelDiv = document.getElementById('floatpaneldiv');

		$('#floatpaneldiv').html($('#floatpaneldiv').html() + compiled({
			userName: USER,
			showtext: show_explore_str,
			imgsrc: serverIp + "rc/logo2.png",
			renameimgsrc: serverIp + 'rc/rename.png',
			annotateimgsrc: serverIp + 'rc/brush-note.png',
			vlineupimgsrc: serverIp + 'rc/v_lineup.png',
			hlineupimgsrc: serverIp + 'rc/h_lineup.png',
			selectimgsrc: serverIp + "rc/rect_select.png",
			tabularimgsrc: serverIp + "rc/tabular.png",
			radialimgsrc: serverIp + "rc/radial.png",
			vparallelimgsrc: serverIp + "rc/vparallel.png",
			hparallelimgsrc: serverIp + "rc/hparallel.png",
			networksrc: serverIp + 'rc/network.png',
			manualimgsrc: serverIp + "rc/manual.png",
			feedbackimgsrc: serverIp + "rc/feedback.png",
			exitimgsrc: serverIp + "rc/exit.png",
			networkimgsrc: serverIp + 'rc/network.png',
		}));

		$('#floatpaneldiv button').css({
			color: 'white',
		});

		$('#show_manual_button').on('click', function(){
			//console.log(' show manual 22');
			showOnlyManual();
		});

		//bind event
		$('#show_other_button').on('click', function(){			
			var buttontext = $(this).text();
			var showhide = $(this).attr('showhide');
			var newbuttontext = "";
			var show = true;			
			// if(buttontext == show_explore_str){
			if(showhide == 'show'){
				newbuttontext = hide_explore_str;
				$(this).attr('showhide', 'hide');
				// $(this).text(hide_explore_str);
			}else{
				newbuttontext = show_explore_str;
				$(this).attr('showhide', 'show');
				show = false;
			}

			console.log(' new button ', showhide, newbuttontext);
			var buttonstring = '<img class="btn_img" src=<%=networksrc%>></img> <%=buttonstring%>';
			var compiled = _.template(buttonstring);
			$(this).html(
				compiled({
					networksrc: serverIp + 'rc/network.png',
					buttonstring: newbuttontext,
			}));
			g_SharePanelManager.addFlagPanel(show);
		});

		$('#feedback_button').on('click', function(){
			// //console.log(' feedback ');
			collectFeedback();
		});

		$('#exit_2_button').on('click', function(){
			//console.log(' exit addonfilter! ');
			exitAddOn();
			// exit();
		});

		$('#rectselect_button').on('click', function(event){

			//console.log(" rect selection button clicked ");
			event.stopPropagation();

			$('#addondiv').css("pointer-events", "all"); 			
			g_ToolBarManager.setRectMaskEnable(true);		
				
			$('.function_button-clicked').removeClass('function_button-clicked');
			$(this).addClass('function_button-clicked');
		});

		$('#textselect_button').on('click', function(){
			//TODO if no inobj
			//check it clicked or not
			var classList = $(this)[0].classList;
			if(classList.contains("function_button-clicked") == true){
				//clicked
				$('.function_button-clicked').removeClass('function_button-clicked');
				//set unclick
				$('#addondiv').css('pointer-events', 'all');
				g_NameRender.clearSelectText();
				document.onmouseup = "";
				document.onkeyup = "";
				return ;
			}else{
				$('.function_button-clicked').removeClass('function_button-clicked');
				$(this).addClass('function_button-clicked');
			}
			
			//console.log(" name button clicked ");

			function getSelectedText() {
				var text = "";
				if (typeof window.getSelection != "undefined") {
				    text = window.getSelection().toString();
				} else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
				    text = document.selection.createRange().text;
				}
				return text;
			}

			function doSomethingWithSelectedText() {
				var selectedText = getSelectedText();

				// //console.log(" SESE ", selectedText, selectedText==undefined);
				
				if (selectedText) {
				    // alert("Got selected text " + selectedText);	
				    // var relative=document.body.parentNode.getBoundingClientRect();
					g_NameRender.selectText(selectedText);
				}
				// else{
				// 	//clear
				// 	//console.log('SEESE2');
				// 	g_NameRender.clearSelectText();
				// }
			}

			//set the svg mouse function disable
			$('#addondiv').css("pointer-events", "none"); 

			document.onmouseup = doSomethingWithSelectedText;
			document.onkeyup = doSomethingWithSelectedText;
		});

		d3.select('#annotate_button').on('click', function(){
			//TODO if no inobj

			d3.event.stopPropagation();

			//check it clicked or not
			var classList = $(this)[0].classList;
			if(classList.contains("function_button-clicked") == true){
				//clicked
				$('.function_button-clicked').removeClass('function_button-clicked');
				//set unclick
				$('#addondiv').css('pointer-events', 'all');

				// g_NameRender.clearSelectText();
				document.onmouseup = "";
				document.onkeyup = "";
				return ;
			}else{
				$('.function_button-clicked').removeClass('function_button-clicked');
				$(this).addClass('function_button-clicked');
			}
			
			//console.log(" name button clicked ");

			function getSelectedText() {
				var text = "";
				if (typeof window.getSelection != "undefined") {
				    text = window.getSelection().toString();
				} else if (typeof document.selection != "undefined" && document.selection.type == "Text") {
				    text = document.selection.createRange().text;
				}
				return text;
			}

			function doSomethingWithSelectedText() {
				var selectedText = getSelectedText();

				// //console.log(" SESE ", selectedText, selectedText==undefined);
				if (selectedText) {
				    // alert("Got selected text " + selectedText);	
				    // var relative=document.body.parentNode.getBoundingClientRect();
				    console.log(" annotate text ", selectedText);
				    g_SharePanelManager.selectText(selectedText);

					if(typeof window.getSelection != "undefined"){
						window.getSelection().removeAllRanges();
					} 
					// g_NameRender.selectText(selectedText);
				}
				// else{
				// 	//clear
				// 	//console.log('SEESE2');
				// 	g_NameRender.clearSelectText();
				// }
			}

			//set the svg mouse function disable
			$('#addondiv').css("pointer-events", "none"); 

			document.onmouseup = doSomethingWithSelectedText;
			document.onkeyup = doSomethingWithSelectedText;


			console.log(' stop propagate');
		});

		$('#vlineup_button').on('click', function(){
			var classList = $(this)[0].classList;
			if(classList.contains("function_button-clicked") == true){
				//clicked
				$('.function_button-clicked').removeClass('function_button-clicked');
				g_ToolBarManager.setVLineupEnable(false);
				//set unclick				
				return ;
			}else{
				$('.function_button-clicked').removeClass('function_button-clicked');
				$(this).addClass('function_button-clicked');	

				$('#addondiv').css('pointer-events', 'all');
				// g_NameRender.clearSelectText();
				document.onmouseup = "";
				document.onkeyup = "";			
				self.clickVLineUpButton();
			}
		});

		$('#hlineup_button').on('click', function(){
			var classList = $(this)[0].classList;
			if(classList.contains("function_button-clicked") == true){
				//clicked
				$('.function_button-clicked').removeClass('function_button-clicked');
				g_ToolBarManager.setHLineupEnable(false);
				//set unclick				
				return ;
			}else{
				$('.function_button-clicked').removeClass('function_button-clicked');
				$(this).addClass('function_button-clicked');	

				$('#addondiv').css('pointer-events', 'all');
				// g_NameRender.clearSelectText();
				document.onmouseup = "";
				document.onkeyup = "";		
				g_ToolBarManager.setHLineupEnable(true);	
				// self.clickHLineUpButton();
			}
		});

		$('#tablemask_button').on('click', function(){	
			self.clickRectMaskSelectButton();

			$('#addondiv').css("pointer-events", "all"); 			
			// g_ToolBarManager.setRectMaskEnable(true);		
				
			$('.function_button-clicked').removeClass('function_button-clicked');
			$(this).addClass('function_button-clicked');
		});

		$('#vparallelmask_button').on('click', function(){	
			self.clickVParallelMaskButton();

			$('#addondiv').css("pointer-events", "all"); 	
				
			$('.function_button-clicked').removeClass('function_button-clicked');
			$(this).addClass('function_button-clicked');
		});

		$('#hparallelmask_button').on('click', function(){
			self.clickHParallelMaskButton();

			$('#addondiv').css("pointer-events", "all"); 		
				
			$('.function_button-clicked').removeClass('function_button-clicked');
			$(this).addClass('function_button-clicked');
		});


		$('#radialmask_button').on('click', function(){	
			self.clickRadialMaskButton();

			$('#addondiv').css("pointer-events", "all"); 		
				
			$('.function_button-clicked').removeClass('function_button-clicked');
			$(this).addClass('function_button-clicked');
		});
	}

	//click Line-up 
	Info.clickVLineUpButton = function(){
		//console.log(" click v line - up button ");
		g_ToolBarManager.setVLineupEnable(true);
	}

	//click Rect Select
	Info.clickRectMaskSelectButton = function(){
		//console.log( ' rect selection region selection pressed !' );
		// g_ToolBarManager.setSelectEnable(true);
		g_ToolBarManager.setRectMaskEnable(true);
	}

	//click Vertical Parallel Mask Button
	Info.clickVParallelMaskButton = function(){
		//console.log( " v-parallel button pressed ! ");
		// g_ToolBarManager.setSelectEnable(true);
		g_ToolBarManager.setVParallelMaskEnable(true);
	}

	Info.clickHParallelMaskButton = function(){
		//console.log( " h-parallel button pressed ! ");
		// g_ToolBarManager.setSelectEnable(true);
		g_ToolBarManager.setHParallelMaskEnable(true);
	}

	//click radial button
	Info.clickRadialMaskButton = function(){
		//console.log( " radial-parallel button pressed ! ");
		g_ToolBarManager.setRadialMaskEnable(true);
	}

	return Info;

}