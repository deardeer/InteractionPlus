/*
  InObjRender: manage the rendering issue of inobj, 
  1) selection rect, left buttons
  2) ...
*/

function InObjRender(iId, inObj){
  var Info = {};

  //geometric related
  Info.m_DragRect = {};

  Info.__init__ = function(iId, inObj){

    //console.log(" InObjRender init ");
    this.m_iId = iId;
    this.m_InObj = inObj;

    //drag rect related 
    this.m_DragRectGName = "g_defined_region" + this.m_iId;
    this.m_DragRectId = "define_region_rect" + this.m_iId;
    // this.m_DragRectCircleId = "define_region_rect_circle" + this.m_iId;
    this.m_RectRegionGroup  = {};//DOM 
   
    //tool bar related
    this.m_ToolButtonId = {};
    this.m_ExpandDivId; //

    this.m_mouseHoverCurrentEleId = -1;
    this.m_Annotation = false;
    // this.m_mouseHoverCurrentEleId = [];
    this.m_mouseHoverEleOriginStyle = {};

    //geometric related
    this.m_CircleButtonRadius = 10;
  }

  Info.setElementDetectorCrossFilter = function(elementDetector, crossFilter){
    this.m_ElementDetector = elementDetector;
    this.m_ElementProperties = this.m_ElementDetector.m_ElementProperties;
    this.m_CrossFilter = crossFilter;
    this.m_CrossFilterInfo = crossFilter.m_CrossFilterInfo;
    this.m_liFilterEleId = this.m_ElementProperties.getElementIds();
    //console.log(' XXX YYY ', this.m_liFilterEleId.length);
  }

  Info.addToolBar = function(){
    this.createLeftButtons();
  }

  //create left-side buttons
  Info.createLeftButtons = function(){

    var self = this;

    var dragIdName = self.m_DragRectGName;
    var circle_r = self.m_CircleButtonRadius;

    var x = self.m_DragRect.x;
    var y = self.m_DragRect.y;

    var gDefineRegion = self.m_RectRegionGroup;//d3.select(self.m_DragRectGName);

    // var liButtonCircle = ['delete_circlebutton', 'shrink_button', 'share_button', 'submit_button', 'exit_button'];
    var liButtonCircle = ['delete_circlebutton', 'shrink_button',  'submit_button'];

    var place = 'left';
    if(g_ToolBarManager.isHMaskEnable())
      place = 'top';

    var liTransXY = [];

    for (var i = 0; i < liButtonCircle.length; i++) {
        var sButtonClass = liButtonCircle[i];
        self.m_ToolButtonId[sButtonClass] = sButtonClass + self.m_iId;
        
        var translate_x, translate_y;
        if(place == 'left'){
          translate_x = x - circle_r;
          translate_y = y + (circle_r * 2 + 2) * i;
        }else if(place == 'top'){
          translate_x = x + (circle_r * 2 + 2) * i;
          translate_y = y - circle_r;
        }
        liTransXY.push([translate_x, translate_y]);

        gDefineRegion.append("circle")
        .attr("fill", "#91dc5a")
        .attr('class', sButtonClass)
        .attr('id', self.m_ToolButtonId[sButtonClass])
        .attr("stroke-width", '1px')
        .attr('stroke', 'black')
        .attr("transform", function(){return "translate(" + translate_x + "," + translate_y + ")";})
        // .attr("transform", function(){return "translate(" + (x - circle_r) + "," + (y +  (circle_r * 2 + 2) * i)+ ")";})
        .attr("r", circle_r); 

        
    };

    self.m_RectRegionGroup.select(".submit_button")
    .style('visibility', 'hidden');

    self.m_RectRegionGroup.select('.shrink_button')
    .style('visibility', 'hidden');

    //close
    self.m_RectRegionGroup.append('text')
      .attr('font-family', 'FontAwesome')  
      .attr("dy", ".3em") 
      .attr('data-toggle', "tooltip")
      .attr('data-placement', "left")
      .attr('title', 'Close defined region')
      // .attr("dx", "-.3em")
      .style('cursor', 'pointer')
      .style("text-anchor", "middle")
      .attr('font-size', function(d) { return '15px'; })
      .attr('transform', function(){return "translate(" + liTransXY[0][0]+ "," + liTransXY[0][1] + ")";})
      .text(function(d){ return '\uf00d'; })
      .on('mouseover', function(){    //highlight circle      
          // d3.select('#' + self.m_ToolButtonId["delete_circlebutton"])
          self.m_RectRegionGroup.select(".delete_circlebutton")
          .attr('stroke-width', '2px');

          self.m_RectRegionGroup.selectAll('.define_region')
          .style('fill', 'none')
          .attr('stroke-width', '5px');
      })
      .on('mouseout', function(){
          // d3.select('#delete_circlebutton')
          self.m_RectRegionGroup.select(".delete_circlebutton")
          .attr('stroke-width', '1px');

          // d3.selectAll('.define_region')
          self.m_RectRegionGroup.select(".define_region")
          .style('fill', 'none')
          .attr('stroke-width', '2px');
      })
      .on("click", function(){
          //console.log("Close!");
          // d3.select('g.region_index_circle').remove();
          self.m_RectRegionGroup.remove();          
          self.m_InObj.clickCloseButton();
      });

    //shrink
    self.m_RectRegionGroup.append('text')
      .attr('font-family', 'FontAwesome')  
      .attr("dy", ".3em") 
      .attr('data-toggle', "tooltip")
      .attr('data-placement', "left")
      .attr('title', 'Shrink defined region')
      .style('visibility', 'hidden')
      // .attr("dx", "-.3em")
      .style('z-index', 100)
      .style('cursor', 'pointer')
      .style("text-anchor", "middle")
      .attr('font-size', function(d) { return '15px'; })
      .attr('transform', function(){return "translate(" + (x - circle_r)+ "," + (y  + (circle_r * 2 + 2) )+ ")";})
      .text(function(d){ return '\uf068'; })
      .on('mouseover', function(){    //highlight circle      
          self.m_RectRegionGroup.select('.shrink_button')
          .attr('stroke-width', '2px');
      })
      .on('mouseout', function(){
          self.m_RectRegionGroup.select('.shrink_button')
          .attr('stroke-width', '1px');
      })
      .on("click", function(){
          self.shrink();  
      });

    /*
    //share
    gDefineRegion.append('text')
    .attr('font-family', 'FontAwesome')  
    .attr("dy", ".3em") 
    .attr('data-toggle', "tooltip")
    .attr('data-placement', "left")
    .attr('title', 'Share exploration')
    // .attr("dx", "-.3em")
    .style("text-anchor", "middle")
    .attr('font-size', function(d) { return '15px'; })
    .style('cursor', 'pointer')
    .attr('transform', function(){return "translate(" + (mouseBegin['x'] - circle_r)+ "," + (mouseBegin['y'] + (circle_r * 2 + 2) * 2 ) + ")";})
    .text(function(d){ return '\uf1e0'; })  
    .on("mouseover", function(){
    // alert("delete");
    d3.select('#share_button')
    .attr('stroke-width', '2px');    
    //triggle the 
    // $(this).tooltip();
    })
    .on('mouseout', function(){
    d3.select('#share_button')
    .attr('stroke-width', '1px');
    // d3.select(this)
    // .attr('stroke', 'none');
    })
    .on('click', function(){
    //console.log("Share!");
    self.share();
    });
    */

    //submit
    self.m_RectRegionGroup.append('text')
      .attr('font-family', 'FontAwesome')  
      .attr("dy", ".3em") 
      .attr('data-toggle', "tooltip")
      .attr('data-placement', "left")
      .attr('title', 'Submit exploration')
      .style('visibility', 'hidden')
      // .attr("dx", "-.3em")
      .style("text-anchor", "middle")
      .attr('font-size', function(d) { return '15px'; })
      .style('cursor', 'pointer')
      .attr('transform', function(){return "translate(" + (x - circle_r)+ "," + (y + (circle_r * 2 + 2) * 2 ) + ")";})
      .text(function(d){ return '\uf005'; })  
      .on("mouseover", function(){
          // alert("delete");
          self.m_RectRegionGroup.select('.submit_button')
          .attr('stroke-width', '2px');    
          //triggle the 
          // $(this).tooltip();
      })
      .on('mouseout', function(){
          self.m_RectRegionGroup.select('.submit_button')
          .attr('stroke-width', '1px');
          // d3.select(this)
          // .attr('stroke', 'none');
      })
      .on('click', function(){    
          $('#comment_submit_dialog').dialog('open');  
      })
  }

  Info.initHoverinSelectRect = function(){
    
    var self = this;
    console.log(" draw Rect Name ", this.m_DragRectGName);
    var rectSel = addOnSvg.select('#' + this.m_DragRectGName).select(".define_region");
    // var modifySel = addOnSvg.select('#' + this.)
    var radius = 3;

    var absAddonDivPos = $('#addondiv').offset();

    rectSel
         .on('dblclick', function(event){
            self.m_Annotation = true;
            console.log(" click ", self.m_mouseHoverCurrentEleId);

            var newEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
            self.m_mouseHoverEleOriginStyle['stroke'] = newEle.style.stroke;   
            self.m_mouseHoverEleOriginStyle['stroke-width'] = newEle.style['stroke-width'];
            // //console.log(" new style ! ", self.m_mouseHoverEleOriginSxtyle, newEle.style);           
            newEle.style.stroke = 'black';
            newEle.style['stroke-width'] = "2px";
            //get the position
            // var pos = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);

            //get the modify group
            // var modifyGroup = addOnSvg.select('.modifygroup');
            // if(modifyGroup.empty() == true){
            //   modifyGroup = addOnSvg.append('g')
            //   .attr('class', 'modifygroup');
            // }

            // var globalEleRect = self.m_ElementProperties.getGlobalRectofElement(self.m_mouseHoverCurrentEleId);
            // var width = globalEleRect['x2'] - globalEleRect['x1'], height = globalEleRect['y2'] - globalEleRect['y1'];
            
            // console.log(' width ', width, 'height', height);
      
            // modifyGroup.selectAll('.modify_rect')
            // .remove();

            //add the rect
            // modifyGroup
            // .append('rect')
            // .attr('class', 'modify_rect')
            // .attr('id', 'modify_' + self.m_mouseHoverCurrentEleId)
            // .attr('x', globalEleRect['x1'] - absAddonDivPos.left)
            // .attr('y', globalEleRect['y1'] - absAddonDivPos.top)
            // .attr('width', width)
            // .attr('height', height)
            // .style('stroke', 'black')
            // .style('fill', 'none');

            //pop out the dialog
            self.m_InObj.clickAnnotation();

         })
         .on('mousemove', function(event){

            if(self.m_Annotation == true)
              return;
            
            if(self.m_ElementDetector == undefined)
              return ;

            var coverPos = {
              'x': d3.event.pageX, 
              'y': d3.event.pageY,
            }

            var coverRect = {
              'x1': d3.event.pageX - radius, 
              'x2': d3.event.pageX + radius, 
              'y1': d3.event.pageY - radius,
              'y2': d3.event.pageY + radius,
            }    

            var coverLine = {}, coverDir = 'none';
            if(g_ToolBarManager.isVLineUpEnable() == true){
              //|
              coverDir = 'vertical';
              coverLine = {
                'x1': coverPos.x,
                'y1': $('#' + self.m_DragRectId).offset().top,
                'x2': coverPos.y,
                'y2': $('#' + self.m_DragRectId).offset().top + Number($('#' + self.m_DragRectId).attr('height')),
              }
            }else if(g_ToolBarManager.isHLineUpEnable() == true){
              //--
              coverDir = 'horizontal';
              coverLine = {
                'x1': $('#' + self.m_DragRectId).offset().left,
                'y1': coverPos.y,
                'x2': $('#' + self.m_DragRectId).offset().left + Number($('#' + self.m_DragRectId).attr('width')),
                'y2': coverPos.y,
              }
            }       

            // console.log('d3 evnet pagexy', d3.event.pageX, d3.event.pageY, coverLine);

            // if(self.m_mouseHoverCurrentEleId != -1 && g_ToolBarManager.isLineUpEnable() == true){
            //   //check current hover function

            //   if(self.m_ElementDetector.isGivenElementInRect(self.m_mouseHoverCurrentEleId, coverRect)){

            //       var newEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
                 
            //       var posinAddonDiv = {
            //         'x': d3.event.pageX - absAddonDivPos.left,
            //         'y': d3.event.pageY - absAddonDivPos.top, 
            //       } 

            //       //todo
            //       self.addLineUp(posinAddonDiv, absAddonDivPos, [);          
            //       return;
            //    }
            // }

            // var liHoverEleId = self.m_ElementDetector.detectGivenElementsInRect(self.m_liFilterEleId, coverRect);
            var liFilteredEleId = self.m_CrossFilterInfo.getFilterEleIds();
            var hoverResult = self.m_ElementDetector.detectGivenElementsInRectLine(liFilteredEleId, coverPos, coverDir, coverLine);
            var iHoeverEleId = hoverResult['hovereleid'], hoverEleRect = hoverResult['hoverrect'], licompareAbsEleInfo = hoverResult['lineupEleInfoList'];

            // console.log(" licompareAbsEleInfo  [3] ", iHoeverEleId, hoverEleRect);
          
            if(iHoeverEleId != -1){

              var iNewHoverEleId = iHoeverEleId;//liHoverEleId[0];

              if(iNewHoverEleId == self.m_mouseHoverCurrentEleId){

                  if(g_ToolBarManager.isLineUpEnable() == true){     

                    var posinAddonDiv = {
                      'x': d3.event.pageX +  - absAddonDivPos.left,
                      'y': d3.event.pageY - absAddonDivPos.top, 
                    } 

                    //console.log(" licompareAbsEleInfo  [1] ", licompareAbsEleInfo);
                    self.addLineUp(posinAddonDiv, absAddonDivPos, hoverEleRect, licompareAbsEleInfo);
                  }
                  return;
              }

              var liSelectedEleId = self.m_CrossFilterInfo.getFilterEleIds();

              //remove line-up
              d3.select('.line-up-g').remove();

              if(liSelectedEleId.indexOf(iNewHoverEleId) == -1){   
                   if(self.m_mouseHoverCurrentEleId != -1){
                        //recover
                          var oldEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
                          var liAttr = Object.keys(self.m_mouseHoverEleOriginStyle);
                          for (var i = liAttr.length - 1; i >= 0; i--) {
                            var attr = liAttr[i];
                            oldEle.style[attr] = self.m_mouseHoverEleOriginStyle[attr];
                          };           
                          self.m_InObj.hoverEleId(-1);
                  }
                  self.m_mouseHoverCurrentEleId = -1;
                  self.m_mouseHoverEleOriginStyle = {};
                  return;
              }
              //change                            
              if(self.m_mouseHoverCurrentEleId != -1){
                //recover
                  var oldEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
                   var liAttr = Object.keys(self.m_mouseHoverEleOriginStyle);
                  for (var i = liAttr.length - 1; i >= 0; i--) {
                    var attr = liAttr[i];
                    oldEle.style[attr] = self.m_mouseHoverEleOriginStyle[attr];
                  };          
              }

              self.m_mouseHoverCurrentEleId = Number(iNewHoverEleId);
              var newEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
              self.m_mouseHoverEleOriginStyle['stroke'] = newEle.style.stroke;   
              self.m_mouseHoverEleOriginStyle['stroke-width'] = newEle.style['stroke-width'];
              // //console.log(" new style ! ", self.m_mouseHoverEleOriginSxtyle, newEle.style);           
              newEle.style.stroke = 'black';
              newEle.style['stroke-width'] = "2px";
            
              ////add the new line-up
              if(g_ToolBarManager.isLineUpEnable() == true){

                // //console.log(" line up 1 ", self.m_mouseHoverCurrentEleId);
                var posinAddonDiv = {
                  'x': d3.event.pageX +  - absAddonDivPos.left,
                  'y': d3.event.pageY - absAddonDivPos.top, 
                } 
                //console.log(" licompareAbsEleInfo  [0] ", licompareAbsEleInfo);
                self.addLineUp(posinAddonDiv, absAddonDivPos, hoverEleRect, licompareAbsEleInfo);
              }

              //notify the info 
              self.m_InObj.hoverEleId(self.m_mouseHoverCurrentEleId); 

            }else{
              //remove
              d3.select('.line-up-g').remove();
              if(self.m_mouseHoverCurrentEleId != -1){
                  //recover
                  var oldEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
                  var liAttr = Object.keys(self.m_mouseHoverEleOriginStyle);
                  for (var i = liAttr.length - 1; i >= 0; i--) {
                    var attr = liAttr[i];
                    oldEle.style[attr] = self.m_mouseHoverEleOriginStyle[attr];
                  };           
                  self.m_InObj.hoverEleId(-1);
              }
              self.m_mouseHoverCurrentEleId = -1;
              self.m_mouseHoverEleOriginStyle = {};
            } 
        });
    
  }

  Info.addAnnotation = function(bAnnotation, annotationText, annotationId, annotationHighlight){

    var self = this;
    console.log(' add annotation 3');
    
    self.m_Annotation = false;

    if(bAnnotation == false)
      return;

    var absAddonDivPos = $('#addondiv').offset();
    var globalEleRect = self.m_ElementProperties.getGlobalRectofElement(self.m_mouseHoverCurrentEleId);
  
    var width = globalEleRect['x2'] - globalEleRect['x1'], height = globalEleRect['y2'] - globalEleRect['y1'];

    var eleRect = {
      'left': globalEleRect['x1'] - absAddonDivPos.left,
      'top': globalEleRect['y1'] - absAddonDivPos.top,
      'width': width,
      'height': height,
      'cx': globalEleRect['x1'] + width/2. - absAddonDivPos.left,
      'cy': globalEleRect['y1'] + height/2. - absAddonDivPos.top,
    }

    console.log(' globalEleRect ', globalEleRect, self.m_mouseHoverCurrentEleId, absAddonDivPos);
    var rectLeft = globalEleRect['x2'] - absAddonDivPos.left + 10, rectTop = globalEleRect['y1'] - absAddonDivPos.top - 30;

    var font = '15px Papyrus, fantasy';

    var textSize = getTextSize(annotationText, font);
    var rectSize = {
      'w': textSize.w + 5,
      'h': textSize.h + 5,
    }
    // textSize.w += 10;

   var annotationgroup = d3.select('#addondiv svg')
    .append('g')
    .attr('class', 'annotation-group cursor-pointer')
    .attr('id', 'annotation-group-' + annotationId)
    .attr('width', rectSize.w)
    .attr('height', rectSize.h)
    .attr('textWidth', textSize.w)
    .attr('textHeight', textSize.h);

    //add the rect
    // annotationgroup
    // .append('rect')
    // .attr('x', eleRect.left)
    // .attr('y', eleRect.top)
    // .attr('width', eleRect.width)
    // .attr('height', eleRect.height)
    // .style('stroke', 'red')
    // .style('fill', 'none');


    annotationgroup
    .append('rect')    
    // .attr("filter", "url(#glow)")
    .attr('id', 'annotation-rect-' + annotationId)
    .attr('x', rectLeft)
    .attr('y', rectTop)
    .attr('width', rectSize.w)
    .attr('height', rectSize.h)
    .style('visibility', 'hidden')
    // .style('border-style', 'outset')
    // .style('stroke', 'black')
    // .style('stroke-width', '2px')
    .style('fill', 'white');

    var drag = d3.behavior.drag();

    d3.select('#annotation-group-' +  annotationId).call(drag);

    d3.select('#annotation-group-' +  annotationId).on("click", function() {
      console.log(" group click ", annotationId);
      if (d3.event.defaultPrevented) return; // click suppressed
      //console.log("clicked!");
    });

    drag.on("dragstart", function() {
      // //console.log(' drag start ', d);
      console.log(" drag start ");
      d3.event.sourceEvent.stopPropagation(); // silence other listeners
    });

    drag.on("drag", function(){

      // //console.log(' draging ', d3.event.x, ', ', d3.event.y);

      var offset = $('#annotation-rect-' + annotationId).offset();

      var rectSize = {
        'w': Number(d3.select(this).attr('width')),
        'h': Number(d3.select(this).attr('height'))
      };
      var textSize = {
        'w': Number(d3.select(this).attr('textWidth')),
        'h': Number(d3.select(this).attr('textHeight'))
      };      

      // var addOnDivOffset = $('#addondiv').offset();

      var rectLeft = d3.event.x, rectTop = d3.event.y;

      // console.log(" dragging ", textLeft, textTop);

      $('#annotation-rect-' + annotationId).css({
        x: rectLeft,
        y: rectTop,
      });

      d3.select('#annotation-text-' + annotationId)
      .attr('transform', function(){
        return "translate(" + (rectLeft + rectSize.w/2. - textSize.w/2.) + ',' + (rectTop + rectSize.h/2. + textSize.h/2.)  + ')'
      });

      d3.select('#annotation-line-' + annotationId)
      .attr('x2', rectLeft)
      .attr('y2', rectTop + rectSize.h)

    });

    annotationgroup.append('text')
    .text(annotationText)
    .attr('id', 'annotation-text-' + annotationId)
    .style('font', font)
    .attr('transform', function(){
      return "translate(" + (rectLeft + rectSize.w/2. - textSize.w/2.) + ',' + (rectTop + rectSize.h/2. + textSize.h/2.)  + ')';
    });

    if(annotationHighlight == true){

      var frameLine = [];
      var step = 2;
      var randomRange = 3;

        //left-vertical
      for(var i = 0; i < eleRect.height/step; i ++){
        var point = {};
        var r1 = 1; //(Math.floor((Math.random() * 10))%2 == 1)? -1: 1;
        var r2 = (Math.random() * randomRange);
        point.x = eleRect.left + r1 * r2;
        point.y = eleRect.top + eleRect.height - i * step;
        frameLine.push(point);
      }

      //top-horizontal
      for(var i = 0; i < eleRect.width/step; i ++){
        var point = {};
        var r1 = 1;//(Math.floor((Math.random() * 10))%2 == 1)? -1: 1;
        var r2 = (Math.random() * randomRange);
        point.x = eleRect.left + i * step;
        point.y = eleRect.top + r1 * r2;
        frameLine.push(point);
      }

      //right-vertical
      for(var i = 0; i < eleRect.height/step; i ++){
        var point = {};
        var r1 = 1;//(Math.floor((Math.random() * 10))%2 == 1)? -1: 1;
        var r2 = (Math.random() * randomRange);
        point.x = eleRect.left + eleRect.width + r1 * r2;
        point.y = eleRect.top + i * step;
        frameLine.push(point);
      }

      //bottom-horizontal
      for(var i = 0; i < eleRect.width/step; i ++){
        var point = {};
        var r1 = 1;//(Math.floor((Math.random() * 10))%2 == 1)? -1: 1;
        var r2 = (Math.random() * randomRange);
        point.x = eleRect.left + eleRect.width - i * step;
        point.y = eleRect.top + eleRect.height + r1 * r2;
        frameLine.push(point);
      }

      frameLine.push(frameLine[0]);

      var line = d3.svg.line()
      .x(function(d){return d.x;})
      .y(function(d){return d.y;})
      .interpolate("linear");

      annotationgroup.append('path')
      // .attr("filter", "url(#glow)")
      .attr('d', line(frameLine))
      .attr('stroke', 'black')
      .attr('stroke-width', '2px')
      .attr('fill', 'none');

       annotationgroup.append('line')
      // .attr("filter", "url(#glow)")
      .attr('id', 'annotation-line-' + annotationId)
      .attr('x1', eleRect.left + eleRect.width)
      .attr('y1', eleRect.top)
      // .attr('x1', eleRect['cx'])
      // .attr('y1', eleRect['cy'])
      .attr('x2', rectLeft)
      .attr('y2', rectTop + rectSize.h)
      .style('stroke', 'black');

       annotationgroup.append('circle')
        // .attr("filter", "url(#glow)")      
        // .attr('cx', eleRect['cx'])
        // .attr('cy', eleRect['cy'])      
      .attr('cx', eleRect.left + eleRect.width)
      .attr('cy', eleRect.top)
        .attr('r', 3)
        .style('fill', 'black');
    }else{
       annotationgroup.append('line')
      // .attr("filter", "url(#glow)")
      .attr('id', 'annotation-line-' + annotationId)
      .attr('x1', eleRect['cx'])
      .attr('y1', eleRect['cy'])
      .attr('x2', rectLeft)
      .attr('y2', rectTop + rectSize.h)
      .style('stroke', 'black');

       annotationgroup.append('circle')
        // .attr("filter", "url(#glow)")      
        .attr('cx', eleRect['cx'])
        .attr('cy', eleRect['cy'])    
        .attr('r', 3)
        .style('fill', 'black');
    }

   
  }

  Info.addLineUp = function(posInAddOnDiv, absAddonDivPos, hoverEleRect, liLineAbsEleInfo){

    var self = this;

    if(self.m_mouseHoverCurrentEleId == -1)
      return;

    // console.log(" HEHH ", liLineAbsEleInfo);
    
    d3.select('.line-up-g').remove();

    // var newEle = self.m_ElementProperties.getElebyId(self.m_mouseHoverCurrentEleId);
    var left_dragRect = $('#' + self.m_DragRectId).offset().left - absAddonDivPos.left;
    var right_dragRect = left_dragRect + Number($('#' + self.m_DragRectId).attr('width'));
    var top_dragRect = $('#' + self.m_DragRectId).offset().top - absAddonDivPos.top;
    var bottom_dragRect = top_dragRect + Number($('#' + self.m_DragRectId).attr('height'));


    var x1 = left_dragRect, x2 = right_dragRect, y1 = posInAddOnDiv['y'], y2 = posInAddOnDiv['y'];
    var lineWidth = 30, lineLength = 20;
    var line1 = {
      'x1': posInAddOnDiv['x'], 'x2': posInAddOnDiv['x'], 'y1': posInAddOnDiv['y'] - lineWidth/2., 'y2': posInAddOnDiv['y'] - lineWidth/2. + lineLength/2.
    };
    var line2 = {
      'x1': posInAddOnDiv['x'], 'x2': posInAddOnDiv['x'], 'y1': posInAddOnDiv['y'] + lineWidth/2., 'y2': posInAddOnDiv['y'] + lineWidth/2. - lineLength/2. 
    };
    // var 
    if(g_ToolBarManager.isVLineUpEnable()){
      x1 = posInAddOnDiv['x'];
      x2 = posInAddOnDiv['x']
      y1 = top_dragRect; y2 = bottom_dragRect;
      line1 = {
        'x1': posInAddOnDiv['x'] - lineWidth/2., 'x2': posInAddOnDiv['x'] - lineWidth/2. + lineLength/2., 'y1': posInAddOnDiv['y'], 'y2': posInAddOnDiv['y'] 
      };
      line2 = {
        'x1': posInAddOnDiv['x'] + lineWidth/2., 'x2': posInAddOnDiv['x'] + lineWidth/2. - lineLength/2., 'y1': posInAddOnDiv['y'], 'y2': posInAddOnDiv['y'] 
      };
    }

    var iCurrentEleId = self.m_mouseHoverCurrentEleId;
    var CurrentEle = self.m_ElementProperties.getElebyId(iCurrentEleId);
    var CurrentEleAbsRect = hoverEleRect; //self.m_ElementProperties.getGlobalRectofElement(iCurrentEleId);
    var CurrentEleHeight = CurrentEleAbsRect['y2'] - CurrentEleAbsRect['y1'], CurrentEleWidth = CurrentEleAbsRect['x2'] - CurrentEleAbsRect['x1'];
    var currentTagName = $(CurrentEle).prop('tagName').toLowerCase();

    //console.log(" tagName ", currentTagName);

    //get comparable ele and propertytype
    var liSameHoverEleInfo = [];

    for (var i = liLineAbsEleInfo.length - 1; i >= 0; i--) {

      var iEleId = liLineAbsEleInfo[i]['eleid'];
      var OtherEle = self.m_ElementProperties.getElebyId(iEleId);
      var OtherEleTagName = $(OtherEle).prop('tagName').toLowerCase();   

      if(OtherEleTagName == currentTagName){
        var eleAbsRect = liLineAbsEleInfo[i]['absinfo'];
        var eleWidth = eleAbsRect['x2'] - eleAbsRect['x1'], eleHeight = eleAbsRect['y2'] - eleAbsRect['y1'];
        var diff = 0;
        if(g_ToolBarManager.isVLineUpEnable()){
          // console.log(" HEHH ", eleAbsRect, CurrentEleAbsRect, eleWidth - CurrentEleWidth);
          if(eleWidth > CurrentEleWidth){
            diff = 1;
          }else if(eleWidth < CurrentEleWidth){
            diff = -1;
          }
        }else{
          // console.log(" HEHH ", eleHeight - CurrentEleHeight);
          if(eleHeight > CurrentEleHeight){
            diff = 1;
          }else if(eleHeight < CurrentEleHeight){
            diff = -1;
          }
        }

        liSameHoverEleInfo.push(
        {
          'eleid': iEleId,
          'absinfo': liLineAbsEleInfo[i]['absinfo'],
          'diff': diff,
        });
      }
    };

    var lineupgroup = d3.select('#addondiv svg')
        .append('g')
        .attr('class', 'line-up-g');

        //the line
        lineupgroup
        .append('line')
        .attr("x1", x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2)
        .style('stroke', 'black')//'#0b92d9')
        .style('stroke-width', '3px');

        lineupgroup
        .append('line')
        .attr("x1", line1.x1)
        .attr('y1', line1.y1)
        .attr('x2', line1.x2)
        .attr('y2', line1.y2)
        .style('stroke', 'black')//'#0b92d9')
        .style('stroke-width', '3px');

        //arrow
        lineupgroup
        .append('line')
        .attr("x1", line2.x1)
        .attr('y1', line2.y1)
        .attr('x2', line2.x2)
        .attr('y2', line2.y2)
        .style('stroke', 'black')//'#0b92d9')
        .style('stroke-width', '3px');
        
          
        //test: add the boundary box
        // var boxgroup = lineupgroup.select('.testboxgroup')
        // .append("g")
        // .attr('class', 'testboxgroup');
        // d3.select('.hoverbox_rect').remove();


        // lineupgroup
        // .append('rect')
        // .attr("class", 'hoverbox_rect')
        // .style('stroke', 'red')
        // .style('fill', 'none')
        // .style('stroke-width', '2px')
        // .attr('x', function(){
        //   // console.log(" TTT 1 ", hoverEleRect['x1'] - absAddonDivPos.left);
        //   return hoverEleRect['x1'] - absAddonDivPos.left;
        // })
        // .attr('y', function(d){          
        //   // console.log(" TTT 2", hoverEleRect['y1'] - absAddonDivPos.top);
        //   return hoverEleRect['y1'] - absAddonDivPos.top;
        // })
        // .attr('width', function(d){
        //   // console.log(" TTT 3", hoverEleRect['x2'] - hoverEleRect['x1']);
        //   return hoverEleRect['x2'] - hoverEleRect['x1'];
        // })
        // .attr('height', function(d){
        //   // console.log(" TTT 4", hoverEleRect['y2'] - hoverEleRect['y1']);
        //   return hoverEleRect['y2'] - hoverEleRect['y1'];
        // });

        // var update_boxrect = lineupgroup
        // .selectAll('.textbox_rect')
        // .data(liLineAbsEleInfo);

        // var enter_boxrect = update_boxrect.enter(), exit_boxrect = update_boxrect.exit();

        // enter_boxrect
        // .append("rect")
        // .attr('class', 'textbox_rect')
        // .style('stroke', 'black')
        // .style('fill', 'none')
        // .style('stroke-width', '2px')
        // .attr('x', function(d){
        //   return d['absinfo']['x1'] - absAddonDivPos.left;
        // })
        // .attr('y', function(d){          
        //   return d['absinfo']['y1'] - absAddonDivPos.top;
        // })
        // .attr('width', function(d){
        //   return d['absinfo']['x2'] - d['absinfo']['x1'];
        // })
        // .attr('height', function(d){
        //   return d['absinfo']['y2'] - d['absinfo']['y1'];
        // });

        // update_boxrect
        // .attr('x', function(d){
        //   return d['absinfo']['x1'] - absAddonDivPos.left;
        // })
        // .attr('y', function(d){          
        //   return d['absinfo']['y1'] - absAddonDivPos.top;
        // })

        // exit_boxrect.remove();


        var update = lineupgroup
        .selectAll('.diff-marker')
        .data(liSameHoverEleInfo);

        var enter = update.enter();
        var exit =update.exit();

        if(g_ToolBarManager.isVLineUpEnable()){           

          update
          .style('cx', x1)
          .style('cy', function(d, i){
            var absRect = d['absinfo'];
            return (absRect['y1'] + absRect['y2']) * 0.5 - absAddonDivPos.top;
          });

          enter
          .append('circle')
          .attr('class', 'diff-marker')      
          .style('cx', x1)
          .style('cy', function(d, i){
            var absRect = d['absinfo'];
            return (absRect['y1'] + absRect['y2']) * 0.5 - absAddonDivPos.top;
          })
          .style('r', '5px')
          .style('stroke', 'black')
          .style('stroke-width', '1px')
          .style('fill', function(d, i){
            if(d['diff'] == -1)
              return '#E53935';
            if(d['diff'] == 1)
              return '#43A047';
            return 'white';
          });

        }else if(g_ToolBarManager.isHLineUpEnable()){

          update
          .style('cx', function(d, i){
            var absRect = d['absinfo'];
            return (absRect['x1'] + absRect['x2']) * 0.5 - absAddonDivPos.left;
          })
          .style('cy', y1);

          enter
          .append('circle')  
          .attr('class', 'diff-marker')      
          .style('cx', function(d, i){
            var absRect = d['absinfo'];
            return (absRect['x1'] + absRect['x2']) * 0.5 - absAddonDivPos.left;
          })
          .style('cy', y1)
          .style('r', '5px')
          .style('stroke', 'black')
          .style('stroke-width', '1px')
          .style('fill', function(d, i){
            if(d['diff'] == -1)
              return '#E53935';
            if(d['diff'] == 1)
              return '#43A047';
            return 'white';
          });
        }

        exit.remove();
  }

  Info.updateSelectRect = function(rect){

    var self = this;
    this.m_DragRect = rect;
    var rectSel = addOnSvg.select('#' + this.m_DragRectGName).select(".define_region");

    if(rectSel.empty()){

      //add if not exist
      this.m_RectRegionGroup = addOnSvg.append('g')
      .attr("class", 'region_index_circle')
      .attr("id", this.m_DragRectGName);

      if(g_ToolBarManager.isRadialMaskEnable() == true){

        //enable the radial circle
        this.m_RectRegionGroup
        .append('circle')
        .attr("class", 'define_circle_region')
        .attr("filter", "url(#glow)")
        .attr('fill', 'none')
        .attr('stroke', '#006064')
        .attr('stroke-width', '3px')
        .attr("stroke-dasharray", "3px 3px")

        // .attr('id', this.m_DragRectCircleId)
        .attr('r', rect.width/2.)
        .attr('cx', rect.x + rect.width/2.)
        .attr('cy', rect.y + rect.height/2.);

        this.m_RectRegionGroup
        .append("rect")
        .attr('class', 'define_region')
        .attr('id', this.m_DragRectId) //'define_region_rect')      
        .attr("width", rect.width)
        .attr("height", rect.height)
        .style('opacity', '0.2')
        .attr("x", rect.x)
        .attr("y", rect.y); 

      }else{
        this.m_RectRegionGroup
        .append("rect")
        .attr('class', 'define_region')
        .attr('id', this.m_DragRectId) //'define_region_rect')      
        .attr("filter", "url(#glow)")
        .attr("width", rect.width)
        .attr("height", rect.height)
        .attr("x", rect.x)
        .attr("y", rect.y); 
    
      }
         d3.select('#addondiv svg')
          .append('rect')
          .attr('class', 'mouse-hover-rect')
          .attr('width', 0)
          .attr('height', 0)
          .attr("x", 0)
          .attr('y', 0)
          .attr('fill', 'none')
          .attr('stroke', '')
          // .attr('stroke', 'black')
          // .attr('stroke-width', "1px");
      
    }else{     

      if(g_ToolBarManager.isRadialMaskEnable() == true){

        //enable the radial circle
        var circleSel = addOnSvg.select('#' + this.m_DragRectGName).select(".define_circle_region");
        circleSel
        .attr('r', rect.width/2.)
        .attr('cx', rect.x + rect.width/2.)
        .attr('cy', rect.y + rect.height/2.);
      }

      rectSel
        .attr("width", rect.width)
        .attr("height", rect.height)
        .attr("x", rect.x)
        .attr("y", rect.y);        
    }
  }

  //get the global rect information of the selecte rect region
  Info.getSelectGlobalRect = function(){
    var self = this;
    var defineRegionRect = d3.select('#' + self.m_DragRectId);

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

  Info.shrink = function(){
    //console.log(" shrink ");
  }


  //shrink
  Info.shrink = function(){
    var self = this;

    //console.log("Shrink!");
    //put the addondiv back
    $('#addondiv').children().css({
        'visibility': 'hidden',
        'z-index': -1,
     });
    $('#addondiv').css({      
        'z-index': -1,
    });
    //put the overlay back
    $('.overlay_div').css({
        'visibility':'hidden',
        'z-index': -2
     });

    //add the expand button
    var OffSet = $('#' + self.m_ToolButtonId['shrink_button']).offset();
    // OffSet.top = 10, OffSet.left = 10;
    var radius = $('#' + self.m_ToolButtonId['shrink_button']).attr('r');
    var expandWidth = radius * 2.5;
    var expandDiv = document.createElement('div');

    self.m_ExpandDivId = 'expanddiv' + self.m_iId;

    expandDiv.id = self.m_ExpandDivId;

    $('body')[0].appendChild(expandDiv);
    $('#' + self.m_ExpandDivId).css({
      width: expandWidth,
      height: expandWidth,
      top: OffSet.top,
      left: OffSet.left,
      position: 'absolute',
      'z-index': g_FrontZIndex
    });

    var expandSvg = d3.select('#' + self.m_ExpandDivId).append("svg")
    .attr("width", expandWidth)
    .attr("height", expandWidth)
    .attr("x", 0)
    .attr("y", 0)
    .style({
      "position": "absolute",
      "left": 0,
      "top": 0
    });

    self.m_ToolButtonId['expand_button'] = "expand_button" + self.m_iId;

    expandSvg.append('circle')
    .attr('id', self.m_ToolButtonId['expand_button'])
    .attr("fill", "#74c476")
    .attr("stroke-width", '1px')
    .attr('stroke', 'black')
    // .attr('transform', 'translate(, 0)')
    .attr("transform", function(){return "translate(" + (self.m_CircleButtonRadius * 1.1) + "," + (self.m_CircleButtonRadius * 1.1)+ ")";})
    .attr("r", self.m_CircleButtonRadius); 

    //text
     expandSvg.append('text')
    .attr('font-family', 'FontAwesome')  
    .attr("dy", ".3em") 
    .attr('data-toggle', "tooltip")
    .attr('data-placement', "left")
    .attr('title', 'Expand exploration')
    // .attr("dx", "-.3em")
    .style("text-anchor", "middle")
    .attr('font-size', function(d) { return '15px'; })
    .style('cursor', 'pointer')
    .attr("transform", function(){return "translate(" + (self.m_CircleButtonRadius * 1.1) + "," + (self.m_CircleButtonRadius * 1.1)+ ")";})
    .text(function(d){ return '\uf065'; })  
    .on("mouseover", function(){
      // alert("delete");
      d3.select('#' + self.m_ToolButtonId['expand_button'])
      .attr('stroke-width', '2px');    
      //triggle the 
      // $(this).tooltip();
    })
    .on('mouseout', function(){
      d3.select('#' + self.m_ToolButtonId['expand_button'])
      .attr('stroke-width', '1px');
      // d3.select(this)
      // .attr('stroke', 'none');
    })
    .on('click', function(){
      self.expand();
    });
  }

  //expand 
  Info.expand = function(){
    var self = this;
    //console.log(" expand ");

    //set the add-on filter back
        //put the addondiv front
      $('#addondiv').children().css({
          'visibility': 'visible',
          'z-index': g_FrontZIndex,
       });
      $('.filter_panel').css({
        'z-index': g_FrontZIndex,
      })
      $('#addondiv').css({      
          'z-index': g_FrontZIndex,
      });
       //put the overlay back
      $('.overlay_div').css({
          'visibility':'visible',
          'z-index': g_FrontZIndex - 1
       });
      //put the overlay back
      $('.overlay_div').css({
          'visibility':'visibility',
          'z-index': g_FrontZIndex-1,
       });

      //remove the expand button
      $('#' + self.m_ExpandDivId).remove();
  }

  Info.__init__(iId, inObj);
  return Info;
}

 		
  