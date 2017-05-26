//current creating InObj Id
var f_CurrentInObjId;
var f_bRectCreating = false;
var f_Timer = {};

var g_StaticRectCount = 0;
var g_DragRect = {};
var g_PreviousDragRect = {};

var g_LiTempCurrentEleId = [];
var g_TempEleIdStroke = {};

// console.log(" g_ElementDetector [1] ");
var g_ElementDetector = new ElementDetetor(-1);
// console.log(" g_ElementDetector ", g_ElementDetector == undefined);

function handleMouseUp() {

   if(f_bRectCreating){

      $('.function_button-clicked').removeClass('function_button-clicked');
       f_bRectCreating = false;

       g_InObjManager.finishSelectRectOfInObj(f_CurrentInObjId);       
       g_ToolBarManager.setSelectEnable(false);

       clearTimeout(f_Timer);

       //recover the highlight
      for (var i = g_LiTempCurrentEleId.length - 1; i >= 0; i--) {
          var iEleId = g_LiTempCurrentEleId[i];

          var strokeInfo = g_TempEleIdStroke[iEleId];
          var ele = g_ElementDetector.m_ElementProperties.getElebyId(iEleId);         
          ele.style.stroke = strokeInfo['stroke'];
          ele.style['stroke-width'] = strokeInfo['stroke-width'];
       }

       g_LiTempCurrentEleId = [];
       g_TempEleIdStroke = {};

       //detect the stroke
       var tempEleStroke = {};
       var iInObj = g_InObjManager.getCurrentInObj();
       var liEleId = iInObj.m_ElementDetector.m_ElementProperties.getElementIds();
       console.log(" liDetect Ele ", liEleId.length);
       for (var i = liEleId.length - 1; i >= 0; i--) {
         var iID = liEleId[i];
         var ele = iInObj.m_ElementDetector.m_ElementProperties.getElebyId(iID);
         var strokeInfo = {
          'stroke': ele.style.stroke,
          'stroke-width': ele.style['stroke-width']
         };
         tempEleStroke[iID] = strokeInfo;
       };
       iInObj.m_ElementDetector.m_ElementProperties.setStrokeMap(tempEleStroke);
       // iInObj.m_ElementDetector.m_ElementProperties.storeStrokeMap();
   } 
}

function handleMouseMove(pos, addOnSvg){
  if(f_bRectCreating){
      g_MouseEnd['x'] = pos.x;
      g_MouseEnd['y'] = pos.y;
      mouseMoveToDefineRegion(addOnSvg);
  }
}

var g_CircleButtonRadius = 10;

function handleMouseDown(pos, addOnSvg){
  var self = this;

  if(g_ToolBarManager.isSelectEnable()){
      f_bRectCreating = true;
      g_MouseBegin['x'] = pos.x;//getPosInAddonSvg(e)['x'];//parseInt(e.clientX);//pageX);
      g_MouseBegin['y'] = pos.y;//getPosInAddonSvg(e)['y'];//parseInt(e.clientY);//pageY);
      // console.log(" MMMM ", g_ToolBarManager.getMaskType(), g_ToolBarManager.isMaskEnable());
      f_CurrentInObjId = g_InObjManager.addInObj(g_ToolBarManager.isMaskEnable(), g_ToolBarManager.getMaskType());
      g_InObjManager.setCurrentObjId(f_CurrentInObjId);

      //reset the timer and related 
      f_Timer = window.setInterval(myTimer, 200);
      g_StaticRectCount = 0;
      g_PreviousDragRect = {};
  }
}

function myTimer() {

  if(g_ElementDetector == undefined){
    console.log(" undefined ", g_ElementDetector);
    return;
  }

  if(g_PreviousDragRect == g_DragRect && g_DragRect != {}){
      g_StaticRectCount += 1;
  }else{
      g_StaticRectCount = 0;
      g_PreviousDragRect = g_DragRect;
  }

  if(g_StaticRectCount > 3){
      g_StaticRectCount = 0;
      //detect current elements

      var circleMask;
      if(g_ToolBarManager.isRadialMaskEnable() == true)
          circleMask = true;

      var currentInObj = g_InObjManager.getCurrentInObj();
      if(currentInObj != {}){
        var globalRect = currentInObj.m_Render.getSelectGlobalRect();

        g_ElementDetector.detectElement(globalRect, circleMask);
        var liNewEleId = g_ElementDetector.m_ElementProperties.getElementIds();

        //recover
        for (var i = g_LiTempCurrentEleId.length - 1; i >= 0; i--) {
          var iEleId = g_LiTempCurrentEleId[i];
          if(liNewEleId.indexOf(iEleId) != -1){
            //exist
            continue;
          }else{
            var strokeInfo = g_TempEleIdStroke[iEleId];
            var ele = g_ElementDetector.m_ElementProperties.getElebyId(iEleId);         
            ele.style.stroke = strokeInfo['stroke'];
            ele.style['stroke-width'] = strokeInfo['stroke-width'];
          }            
        };

        for (var i = liNewEleId.length - 1; i >= 0; i--) {
          var iEleId = liNewEleId[i];
          if(g_LiTempCurrentEleId.indexOf(iEleId) == -1){
            //new highlight
            var newEle = g_ElementDetector.m_ElementProperties.getElebyId(iEleId);
            var strokeInfo = {
                'stroke': newEle.style.stroke,
                'stroke-width': newEle.style['stroke-width']
              };
              //save
              g_TempEleIdStroke[iEleId] = strokeInfo;
              //change to new 
              newEle.style.stroke = 'black';
              newEle.style['stroke-width'] = "2px";
          }
        };
        g_LiTempCurrentEleId = liNewEleId;
        ////console.log(" check element rect ", g_LiTempCurrentEleId.length, g_TempEleIdStroke);//g_StaticRectCount, g_ElementDetector.m_ElementProperties.getElementIds().length);
      
      }
  }
  // g_InObjManager.checkDefineRegionMove(f_CurrentInObjId);
}

function mouseMoveToDefineRegion(addOnSvg){//e, 

  var rectLX = (g_MouseBegin['x'] < g_MouseEnd['x'])? g_MouseBegin['x'] : g_MouseEnd['x'];
  var rectTY = (g_MouseBegin['y'] < g_MouseEnd['y'])? g_MouseBegin['y'] : g_MouseEnd['y'];
  var rectWidth = g_MouseEnd['x'] - g_MouseBegin['x'];
  var rectHeight = g_MouseEnd['y'] - g_MouseBegin['y'];
  if(rectWidth < 0)
    rectWidth = -rectWidth;
  if(rectHeight < 0)
    rectHeight = -rectHeight;

  var rect = {'x': rectLX, 'y': rectTY, 'width': rectWidth, 'height': rectHeight,
              'x1': rectLX, 'y1': rectTY, 'x2': rectLX + rectWidth, 'y2': rectTY + rectHeight};

  g_DragRect = rect;
  
  if(g_ToolBarManager.isMaskEnable() == true){
    if(g_ToolBarManager.getMaskType() == 'radial'){
      rectHeight = rectWidth;
      rect = {'x': rectLX, 'y': rectTY, 'width': rectWidth, 'height': rectHeight,
              'x1': rectLX, 'y1': rectTY, 'x2': rectLX + rectWidth, 'y2': rectTY + rectHeight};
    }
  }

  g_InObjManager.dragSelectRectOfInObj(f_CurrentInObjId, rect);
}

function removeDefineRegion(){
  // //console.log('remove region', selectElement.length);
  // bCreateOne = false;
  defineRegionRect = undefined;
  //remove overlays
  clearOverlays();
  //remove define panel
  clearDefinePanel();
  //remove the dialogs
  clearDialogs();
  //remove filter panel related
  clearFilterRelated();
  //remove the object group manager
  g_ObjectGroupManager.clear();

  //recover the selected elems
  var liElementId = g_ElementProperties.getElementIds();
  $.each(liElementId, function(i, id){
      var ele = g_ElementProperties.getElebyId(id);
      ele.style.opacity = '';
      // //console.log(' g_ElementProperties.getEleOrigincssTextbyId(id); ', g_ElementProperties.getEleOrigincssTextbyId(id));
      ele.cssText += g_ElementProperties.getEleOrigincssTextbyId(id);
  });
  g_ElementProperties.clear();

  //hide the add on div
  // //console.log(' add class !!!!!!!!');
  // $('#addondiv').css('z-index', -1);
}

function clearDialogs(){
  $("[aria-describedby='scatterplot_dialog']").remove();
  $("[aria-describedby='rename_property_dialog']").remove();
  $("[aria-describedby='rename_object_dialog']").remove();
  $("[aria-describedby='derive_property_dialog']").remove();  
  $("[aria-describedby='compose_object_dialog']").remove();
  $("[aria-describedby='comment_submit_dialog']").remove();
  // $("[aria-describedby='derive_property_dialog']").remove();
}

function centerImage(img){
    var container = img.parentNode;
    if (img.offsetHeight > container.clientHeight &&
        img.offsetWidth > container.clientWidth) {
        img.style.minHeight = "0";
        img.style.minWidth = "0";
        img.style.height = "100%";
        if (img.offsetWidth < container.clientWidth) {
            img.style.height = "";
            img.style.width = "100%";
        }
    }
    img.style.top = ((container.offsetHeight - img.offsetHeight) / 2) + "px";
    img.style.left = ((container.offsetWidth - img.offsetWidth) / 2) + "px";
}

function addShareDialog(){
  
  var self = this;

  //console.log(" share USER ", USER);
  
  //console.log('before add share dialog ');

  if($('#share_dialog').length != 0) return;

  //console.log(' add share dialog ');

  var dialoghtml = '<div id="share_dialog" title="Share" hidden="hidden"><div><img id="share_image_div"></img></div><div><label for="name" style="float:left">Comments </label><input type="text" class="form-control" id="share_comment" placeholder=""></div></div>'
 
  var compiled = _.template(dialoghtml);

  //console.log(' add share dialog, ', compiled({}));

  testDiv = document.getElementById('property_p');
  testDiv.innerHTML = testDiv.innerHTML + compiled({}); 

  $("#share_dialog" ).dialog({
    autoOpen: false,
    dialogClass: 'background_panel',
      buttons: {
          "Submit": function() {
            self.submitSharing();
              $(this).dialog("close");
           },
          "Cancel": function(){
            $(this).dialog('close');
          }
      }
  });
}

var g_ImageData;

//share 
function share(){

  var self = this;
  //console.log(" share image ");

  addShareDialog();  

  html2canvas(document.body, {
    onrendered: function(canvas){
        // var png = canvas.toDataURL("image/png");
        // var png = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
        // var x = '<img src="'+png+'"/>';
        // //console.log(' x ', x);
        // $('#test_canvas').html($('#test_canvas').html() + x);

        g_ImageData = canvas.toDataURL('image/png');
        // //console.log("!!!!", data);

        // var image = new Image();
        // image.src = data;
        // image.css = {'width':'auto', 'height':'100%'};

        // var css;
        // var ratio=image.width() / image.height();
        // var pratio= $('#share_image_div').width() / $('#share_image_div').parent().height();
        // if (ratio<pratio) css=
        // else css={width:'100%', height:'auto'};
        // document.getElementById('share_image_div').removeChild();
        var img = document.getElementById('share_image_div');

        img.src = g_ImageData;
        img.width = 500;
        // img.width = $('#share_dialog').width();

        // self.centerImage(image);

        // document.body.appendChild(canvas);
        // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
        // window.location.href=image; // it will save locally
     }
  });

  //open the share dialog
  $('#share_dialog').dialog('open');
}

//exit the add-on filter mode
function exit(){  

  d3.select('g.region_index_circle').remove();
  removeDefineRegion();
  $('#floatpaneldiv').remove();
  $('#flagpaneldiv').remove();
  $('#addondiv').remove();

  //end time  
  submitInteractInfo();
}

//get the user info to server 
function submitInteractInfo(){

  //console.log('submit interaction info ');

  //time duration
  g_EndTime = new Date().getTime();
  var time = g_EndTime - g_StartTime; //ms

  var caseurl = window.location.href;

  if(isUrlSpecial(caseurl))
    caseurl = getFakeUrlbyRealUrl(caseurl);

  //post to server
  var url = 'http://vis.pku.edu.cn/addonfilter_server/submitInteractInfo';
    var data = {
      username:USER,
      caseurl: caseurl,
      begintime:g_StartTime,
      endtime:g_EndTime,
      timeduration: time,
      interactionbag: g_InteractionInfo,
    };
  //clear the interaction info
  g_InteractionRecorder.clear();

  $.ajax({
      url:url, 
      data:JSON.stringify(data), 
      type:"POST", 
      // contentType: "application/json",
      dataType: "jsonp",
      jsonpCallback:"feedbackOfSubmitInteractInfo",
      // contentType: "application/json;charset=utf-8",
      "crossDomain":true
    });
}

function feedbackOfSubmitInteractInfo(response){
  // //console.log(' return timeduration = ', response.timeduration);
  //console.log(' success save interaction id = ', response.flagId);
}

function submitSharing(){
  //communicate with server

  //console.log(' submit a sharing ');
  // $.post(url, {'img': g_ImageData});

  var url = 'http://vis.pku.edu.cn/addonfilter_server/sharing';
  var data = {img: g_ImageData};
  $.ajax({url:url, 
          data:JSON.stringify(data), 
          type:"POST", 
          success: function(data, textStatus, jqXHR){
            //console.log(" success sharing !", data);
          },
          "crossDomain":true})
}

// function saveAsLocalImage () {
//     var myCanvas = document.getElementById("thecanvas");
//     // here is the most important part because if you dont replace you will get a DOM 18 exception.
//     // var image = myCanvas.toDataURL("image/png").replace("image/png", "image/octet-stream;Content-Disposition: attachment;filename=foobar.png");
//     window.location.href=image; // it will save locally
// }

function getPosInAddonSvg(e){  
  var parentOffset = $('#addondiv').offset(); 
  //or $(this).offset(); if you really just want the current element's offset
  var relX = e.pageX - parentOffset.left;
  var relY = e.pageY - parentOffset.top;
  return {x: relX, y: relY};
}

function getPosInPage(e){
  return {x: e.pageX, y: e.pageY};
}
/*------------------ Grobal Configuration based on the Defined Region Rect -------------------*/


//get the absolute rect of defined region, to the LeftTop (0, 0)
function getDefinedRegionRect(){
  var setRect = {};
  var defineRegionTop = $(defineRegionRect[0]).offset().top;
  var defineRegionLeft = $(defineRegionRect[0]).offset().left;
  var defineRegionWidth = parseInt(defineRegionRect.attr('width')), defineRegionHeight = parseInt(defineRegionRect.attr('height'));
  setRect = {
  'x1': defineRegionLeft,
  'x2': defineRegionLeft + defineRegionWidth,
  'y1': defineRegionTop,
  'y2': defineRegionTop + defineRegionHeight
  };
  return setRect;
}

//get the relative rect of defined region in the 'addondiv'
function getDefinedRegionRect_inAddonDiv(){
  var setRect = {};
  var defineRegionTop = $(defineRegionRect[0]).offset().top - $('#addondiv').offset().top;
  var defineRegionLeft = $(defineRegionRect[0]).offset().left - $('#addondiv').offset().left;
  var defineRegionWidth = parseInt(defineRegionRect.attr('width')), defineRegionHeight = parseInt(defineRegionRect.attr('height'));
  setRect = {
    'x1': defineRegionLeft,
    'x2': defineRegionLeft + defineRegionWidth,
    'y1': defineRegionTop,
    'y2': defineRegionTop + defineRegionHeight
  };
  return setRect;
}


//get the drawing left-top point according to the dfrect
function getDefaultDrawLTPoint(){
  var defineRect = getDefinedRegionRect_inAddonDiv();
  var widthPad = 5;
  var rectLX = defineRect['x2'] + widthPad, rectLY = defineRect['y1']; 
  var LTPoint = {x: rectLX, y: rectLY} ;
  return LTPoint;

  // return getDefaultDrawLBPoint();
}

function getDefaultDrawLBPoint(){
  var defineRect = getDefinedRegionRect_inAddonDiv();
  var widthPad = 5;
  var rectLX = defineRect['x1'], rectLY = defineRect['y2'] + widthPad; 
  var LTPoint = {x: rectLX, y: rectLY} ;
  return LTPoint;
}


//welcome
function addModal(){

  var modal_div = document.createElement('div');
  modal_div.id = 'modal_div';
  $('body')[0].appendChild(modal_div);

  $('#modal_div').css({   
      background: 'rgba(0, 0, 0, 0.8)',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      position: 'fixed',
      'padding-top': '30px',
      'z-index': g_FrontZIndex + 3,
  });

  $('#modal_div').on('click', function(){
    //console.log(" MoDAL DIV Click !");
    // removeModal();    
    removeModal();
    exitAddOn();
  })
  /*
  modal_div.setAttribute('tabindex', '-1')
  .setAttribute('role', 'dialog')
  .setAttribute('aria-labelledby', 'myModalLabel')
  .setAttribute('aria-hidden', 'true');
    
  var modalhtml = '<div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h4 class="modal-title" id="myModalLabel">Manual</h4></div><div class="modal-body">Manul Figure</div><div class="modal-footer"><button type="button" class="btn btn-default"data-dismiss="modal">Next</button></div></div></div>';
  var compiled = _.template(modalhtml);
  modal_div.innerHTML = (compiled({}));
  */
}

function removeModal(){
  $('#modal_div').remove();
}

//show the manual page
function showManual(){
  //add the img div
  var imghtml = '<div class="row" id="manual_panel_div">'+
                  '<div class="col-md-12" style="padding-bottom: 10px;">'+
                    '<div style="text-align: center;">'+
                      '<img src=<%=ImgSrc%> style="width:60%; border-radius: 5px;" id="manualimage"/>'+
                    '</div>' +
                    '<div style="text-align: center; margin-top: 5px">'+
                      '<button id="cancellogin_button" type="button" class="btn btn-success btn-lg btn-welcome" style="padding: 6px 50px; border-radius: 5px;background: #74C476;font-size: 15px; margin-right: 10px">Cancel</button>'+
                      '<button id="login_button" type="button" class="btn btn-success btn-lg btn-welcome" style="padding: 6px 50px; border-radius: 5px;background: #74C476;font-size: 15px;">Continue</button>'+
                    '</div>'+
                  '</div>'+
                 '</div>';

  var compiled = _.template(imghtml);
  //show_other_button, , feedback_button, exit_2_button

  var modaldiv = document.getElementById('modal_div');

  $('#modal_div').html(compiled({
    ImgSrc: serverIp + "rc/manual_addonfilter.png",
  }));

  $('#login_button').on('click', function(event){
    showLoginIn();
    event.stopPropagation();
  })

  $('#cancellogin_button').on('click', function(event){
    event.stopPropagation();
    removeModal();
    exitAddOn();
  })

  $('#manualimage').on('click', function(event){
    event.stopPropagation();
  });
  
}

//show user login page
function showLoginIn(){

  var loginhtml = '<div id="login_panel_div" style="width: 40%;text-align:center; border-radius: 5px; margin-top: 20px; padding-top: 10px; padding-bottom: 10px;background: #FFFFFF;margin-left: 30%;">'+
                    '<div class="form-group" style="padding-left: 30px; padding-right: 30px; padding-top:30px">'+
                      '<div class="row" style="margin:5px">'+
                        '<p style="text-align:left">Please enter your email address below to receive new update of Interaction+. Thank you :)</p>' +
                        // '<label style="font-size:20px; margin-right:20px; float:left;">E-mail</label>'+
                        '<input id="username_input" style="font-size:20px; background: #dff0d8; width:100%" placeholder="Email Address"/>'+
                      '</div>'+
                    // '<div class="row" style="margin:5px">'+
                    //   '<label style="font-size:20px; margin-right:20px; float:left;">Password</label>'+
                    //   '<input id="password_input" type="password" style="font-size:20px; background: #dff0d8; width:100%"/>'+
                    // '</div>'+
                  '</div>'+
                  '<div class="row" style="margin:5px">'+                 
                    '<button id="register_cancel_button" class="btn btn-success btn-lg btn-welcome" style="padding: 6px 50px;border-radius: 5px;background: #74C476;font-size: 15px; margin-top:20px; margin-right: 10px" >Cancel</button>'+
                    '<button id="register_confirm_button" class="btn btn-success btn-lg btn-welcome" style="padding: 6px 50px;border-radius: 5px;background: #74C476;font-size: 15px; margin-top:20px" >Start Explore!</button>'+
                  '</div>';

  var compiled = _.template(loginhtml);

  var modaldiv = document.getElementById('modal_div');

  $('#modal_div').html(compiled({ //loginhtml
    // ImgSrc: serverIp + "rc/teaser.png",
  }));

  $('#modal_div').on('click', function(event){

    removeModal();
    exitAddOn();    
  })

  $('#register_confirm_button').on('click', function(event){
    event.stopPropagation();
    var username = $('#username_input').val();
    if(username.length == 0)
      return;
    //console.log(' register user name ', username);
    userLogIn(username);
  });

  $('#login_panel_div').on('click', function(event){
    event.stopPropagation();    
  });

  $('#register_cancel_button').on('click', function(event){
    removeModal();
    exitAddOn();    
  })

}

//the user login 
function userLogIn(userName){
  //communicate with server, get the flag id list
  var url = 'http://vis.pku.edu.cn/addonfilter_server/submitUserInfo';
  
  var caseurl = window.location.href;
  
  if(isUrlSpecial(caseurl)){
    caseurl = getFakeUrlbyRealUrl(caseurl);
    //console.log('spa ', caseurl);
  }

  var data = {
      username: userName,
      caseurl: caseurl,
      time: (new Date()).toString(),
    };

  $.ajax({
      url:url, 
      data:JSON.stringify(data), 
      type:"GET", 
      // contentType: "application/json",
      dataType: "jsonp",
      jsonpCallback: 'feedbackOfSubmitUserInfo',
      // contentType: "application/json;charset=utf-8",
      "crossDomain":true
    });
}

function feedbackOfSubmitUserInfo(response){

  //save to cookie, for 7 days
  $.cookie('AddonFilter_User', response.username, { expires: 7 }, { path: "/"});
  USER = $.cookie('AddonFilter_User');

  //console.log(' success submit user info ', response.username);

  //remove the modal
  removeModal();
  

  g_ToolBarManager.addFloatPanel();
  // addFloatPanel();
  enterAddOn(); 
}