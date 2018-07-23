//deal with the cross filter

//class: cross filter info

function CrossFilter(iId, InObj, ObjectGroupManager, propertyManager){
    var Info = new Object;

    Info.__init__ = function(iId, InObj, ObjectGroupManager, propertyManager){
        this.m_iId = iId;
        this.m_ObjectGroupManager = ObjectGroupManager;
        this.m_ElementProperties = InObj.m_ElementDetector.m_ElementProperties;
        this.m_PropertyManager = propertyManager;
        this.m_CrossFilterInfo = new CrossFilterInfo(this.m_iId, this.m_ObjectGroupManager, this.m_ElementProperties, this.m_PropertyManager);
        //console.log(" CrossFilter Init ", this.m_iId);
    }

    //clear the filter
    Info.clearFilterToWhole = function(){
        var self = this;
        //recover the elements
         // var liElementId = g_ElementProperties.getElementIds();
         console.log(" clear filter all");
        self.m_CrossFilterInfo.reset();
        self.m_CrossFilterInfo.updateVisualRendering();

        var liAllSelectedEleId = self.m_ElementProperties.getElementIds();
      
        $.each(liAllSelectedEleId, function(i, iEleId){
            var element = self.m_ElementProperties.getElebyId(iEleId);
            element.style.opacity = 1;
        });
    }

    Info.getExploreInfo = function(){
            
        var ExploreInfo = {};

        //get the explored rect
        var defineRegionInfo = {
            left: Number($('#define_region_rect' + this.m_iId).attr('x')),
            top: Number($('#define_region_rect' + this.m_iId).attr('y')),
            height: Number($('#define_region_rect' + this.m_iId).attr('height')),
            width: Number($('#define_region_rect' + this.m_iId).attr('width')),
        };

        ExploreInfo['rect'] = defineRegionInfo;

        //all elements
        var liAllEleId = this.m_ElementProperties.getElementIds();
        ExploreInfo['alleleids'] = liAllEleId;
        
        //select elements   
        var liFilterEleid = this.m_CrossFilterInfo.getFilteredElement();

        ExploreInfo['eleids']  = liFilterEleid;

        return ExploreInfo;
    }


    Info.resetCrossFilter = function(){
        this.m_CrossFilterInfo.reset();
    }

    /* filter related */
    Info.filterElebyGroup = function(iGroupId){
        var liFilteredEleId = this.m_ObjectGroupManager.getAllEleIdsofGroup(iGroupId);
        //console.log(" liFilter Ele Number ", liFilteredEleId.length);
        this.m_CrossFilterInfo.setFilterEleIds(liFilteredEleId);
    }
    Info.__init__(iId, InObj, ObjectGroupManager, propertyManager);
    return Info;


    // Info.clearFilter = function(){

    //     //recover the elements
    //      // var liElementId = g_ElementProperties.getElementIds();
    //     var liFilterEle = this.m_CrossFilterInfo.getFilteredElement();
    //     $.each(liFilterEle, function(i, id){
    //       var ele = g_ElementProperties.getElebyId(id);
    //       $(ele).css('opacity', '0.3');
    //       $(ele).css('stroke', 'black');
    //     });

    //     this.m_CrossFilterInfo.clear();
    // }


    // Info.filterOnLegendBar = function(bar){
    //     var data = d3.select(bar).data()[0];
    //     var value = data['value'], property = data['property'], legendid = data['legendid'];
    //     // //console.log(data, ' click on ', value, ' pro ', property, ' legend ', legendid);
    //     var liProperties = [];
    //     liProperties.push(property);
    //     g_CrossFilterInfo.addAnFilterConstraint(legendid, liProperties);

    //     var liFilterEle = g_CrossFilterInfo.getFilteredElement();
    //     // //console.log('select elements ', liFilterEle.length);

    //     //update the ele
    //     $.each(liFilterEle, function(i, item){
    //         var element = g_ElementProperties.getElebyId(item);
    //         if(element != undefined){
    //             $(element).css('opacity', '1')
    //             .css('stroke', 'red');
    //         }
    //     });
    // }
}

function clearFilter(){

    //recover the elements
     // var liElementId = g_ElementProperties.getElementIds();
    var liFilterEle = g_CrossFilterInfo.getFilteredElement();
    $.each(liFilterEle, function(i, id){
      var ele = g_ElementProperties.getElebyId(id);
      $(ele).css('opacity', '0.3');
      $(ele).css('stroke', 'black');
    });

    g_CrossFilterInfo.clear();
}

function CrossFilterInfo(iId, objectGroupManager, elementProperties, propertyManager){

	var Info = new Object;

    //the final filtered element ids
	Info.m_liFilteredElementId = []; 

    Info.m_liFilteredConstraint = []; 
    Info.m_mapFitlerIdElementIdList = {};

    Info.m_mapPropertyIdFilterEleIds = {};

    Info.m_mapScatterPlotFilterEleIds = {};

    Info.m_liMDSFilterEleIds = [];

    Info.__init__ = function(iId, objectGroupManager, elementProperties, propertyManager){
        this.m_iId = iId;
        this.m_ObjectGroupManager = objectGroupManager;
        this.m_ElementProperties = elementProperties;
        this.m_PropertyManager = propertyManager;
    }
   
    //reset: heavey the element to detected element, and reset the property id and correspoinding eles
    //but not change the outlooking of the elements
    Info.reset = function(){
        var liSelectGroupId = this.m_ObjectGroupManager.getSelectedGroupIds(); 
        this.m_liFilteredElementId = [];
        this.m_mapPropertyIdFilterEleIds = {};
        this.m_mapScatterPlotFilterEleIds = {};
        this.m_liMDSFilterEleIds = [];
        for(var i = 0; i < liSelectGroupId.length; i ++){
            var iSelectGroupId = liSelectGroupId[i];
            this.m_liFilteredElementId = this.m_liFilteredElementId.concat(this.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId));
        }
        // if(liSelectGroupId.length == 0){
        // // if(iSelectGroupId == -1){
        //     //no selection
        //     this.m_liFilteredElementId = [];
        //     this.m_mapPropertyIdFilterEleIds = {};
        //     this.m_mapScatterPlotFilterEleIds = {};
        //     this.m_liMDSFilterEleIds = [];
        // }else{          

        //     this.m_liFilteredElementId = this.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);
        //     this.m_mapPropertyIdFilterEleIds = {};  
        //     this.m_mapScatterPlotFilterEleIds = {};  
        //     this.m_liMDSFilterEleIds = [];      
        // }
    }
    //filter the eles
    Info.setFilterEleIds = function(liFilteredElementId){
        //recovery origin
        this.m_liFilteredElementId = liFilteredElementId;
        this.updateVisualRendering();
    }
    //set the filtered ele of property
    Info.setFilterEleIdsofPropertyId = function(iPropertyId, liFilteredElementId){
        this.m_mapPropertyIdFilterEleIds[iPropertyId] = liFilteredElementId;
        //console.log(' m_mapPropertyIdFilterEleIds ', this.m_mapPropertyIdFilterEleIds);
        // this.updateFilterEleIds();
        this.updateFilterEleIds_new();
    }
    Info.setFilterEleIdsofMDS = function(liFilteredElementId){

        //console.log(" XXXX [0]", liFilteredElementId.length);
        this.m_liMDSFilterEleIds = liFilteredElementId;
        this.updateFilterEleIds();
    }
    Info.setFilterEleIdsofScatterPlotId = function(iSPId, liFilteredElementId){
        this.m_mapScatterPlotFilterEleIds[iSPId] = liFilteredElementId;
        this.updateFilterEleIds();
    }
    Info.isScatterPlotSetFilterConstraint = function(iSPId){
        return this.m_mapScatterPlotFilterEleIds[iSPId];
    }
    //release the filtered ele of property
    Info.releaseFilterEleIdsofPropertyId = function(iPropertyId){
        delete this.m_mapPropertyIdFilterEleIds[iPropertyId];
        this.updateFilterEleIds();
    }

    Info.releaseFilterEleIdsofScatterPlotId = function(iSPId){
        delete this.m_mapScatterPlotFilterEleIds[iSPId];
        this.updateFilterEleIds();
    }

    Info.releaseFilterEleIdsofMDS = function(){
        this.m_liMDSFilterEleIds = [];
        this.updateFilterEleIds();
    }

    Info.getFilterEleIds = function(){      
       var self = this;
       // console.log("dis result 1 get Filter ELE ", this.m_liFilteredElementId, Object.keys(this.m_mapPropertyIdFilterEleIds).length == 0, Object.keys(this.m_mapScatterPlotFilterEleIds).length == 0, this.m_liMDSFilterEleIds.length == 0)
       if(Object.keys(this.m_mapPropertyIdFilterEleIds).length == 0 && Object.keys(this.m_mapScatterPlotFilterEleIds).length == 0 && this.m_liMDSFilterEleIds.length == 0){
              var liGroupId = self.m_ObjectGroupManager.getSelectedGroupIds();  
              var liNewFilterEleId = [];
              for(var i = 0; i < liGroupId.length; i ++){
                var iSelectGroupId = liGroupId[i];
                if(iSelectGroupId == -1)
                  liNewFilterEleId = liNewFilterEleId.concat(self.m_ElementProperties.getElementIds());
                else
                  liNewFilterEleId = liNewFilterEleId.concat(self.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId));    
              }        
              // console.log("dis result 1 get Filter ELE 222 ", liNewFilterEleId);     
              return liNewFilterEleId;          
       }  
       return this.m_liFilteredElementId;
    }

    Info.updateFilterEleIds_new = function(){      
        var self = this; 
        var liNewFilterEleId = [];
        if(Object.keys(this.m_mapPropertyIdFilterEleIds).length == 0){
              var liSelectedGroupId = self.m_ObjectGroupManager.getSelectedGroupIds(); 
              for(var i = 0; i < liSelectedGroupId.length; i ++){
                var iSelectGroupId = liSelectedGroupId[i]
                liNewFilterEleId = self.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);   
              }                  
        }else{   
            var first = true;
            for(var p = 0; p < Object.keys(self.m_mapPropertyIdFilterEleIds).length; p ++){
                    var iPId = Object.keys(self.m_mapPropertyIdFilterEleIds)[p];
                    var liThisEle = self.m_mapPropertyIdFilterEleIds[iPId];
                    if(liThisEle != undefined){                   
                        if(first){
                            first = false;
                            liNewFilterEleId = liThisEle;
                        }else{
                            var liAfterNewFilterEleId = [];
                            for (var i = liThisEle.length - 1; i >= 0; i--) {
                                var eleId = liThisEle[i];
                                //console.log(" liFilteredEleId.indexOf(eleId) ", eleId, liFilteredEleId.indexOf(eleId));
                                if(liNewFilterEleId.indexOf(eleId)>=0){
                                    liAfterNewFilterEleId.push(eleId);
                                }
                            };
                            liNewFilterEleId = liAfterNewFilterEleId;
                        }
                    }
             }
        }

            // if(Object.keys(this.m_mapScatterPlotFilterEleIds).length != 0){
            //     for(var iSPId in this.m_mapScatterPlotFilterEleIds){
            //         var liThisFilterId = this.m_mapScatterPlotFilterEleIds[iSPId];
            //         var liAfterNewFilterEleId = [];
            //         for (var i = liThisFilterId.length - 1; i >= 0; i--) {
            //             var eleId = liThisFilterId[i];
            //             if(liNewFilterEleId.indexOf(eleId)>=0){
            //                 liAfterNewFilterEleId.push(eleId);
            //             }
            //         };
            //         liNewFilterEleId = liAfterNewFilterEleId;
            //     }
            // }

            // //mds
            // //console.log("XXXX [3]", liNewFilterEleId, this.m_liMDSFilterEleIds);
            // //console.log("????", liNewFilterEleId.length, this.m_liMDSFilterEleIds);
            // if(this.m_liMDSFilterEleIds.length != 0){
            //     //console.log("XXXX [5]", this.m_liMDSFilterEleIds.length);
            //     var liAfterNewFilterEleId = [];
            //     for (var i = this.m_liMDSFilterEleIds.length - 1; i >= 0; i--) {
            //         var eleId = this.m_liMDSFilterEleIds[i];
            //         if(liNewFilterEleId.indexOf(eleId)>=0){
            //             liAfterNewFilterEleId.push(eleId);
            //         }
            //     };
            //     liNewFilterEleId = liAfterNewFilterEleId;
            // }
            //console.log("XXXX [4]", liNewFilterEleId.length);
        
        this.setFilterEleIds(liNewFilterEleId);
    }

    //update the eleids by filter property
    Info.updateFilterEleIds = function(){        
        var self = this; 
        var liNewFilterEleId = [];

        // //console.log(" FILTER *** ", this.m_mapPropertyIdFilterEleIds, ' , ', this.m_mapScatterPlotFilterEleIds);
        if(Object.keys(this.m_mapPropertyIdFilterEleIds).length == 0 && Object.keys(this.m_mapScatterPlotFilterEleIds).length == 0 && this.m_liMDSFilterEleIds.length == 0){
              var iSelectGroupId = self.m_ObjectGroupManager.getSelectedGroupId();        
              liNewFilterEleId = self.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);              
        }else{    
            var iGroupId = self.m_ObjectGroupManager.getSelectedGroupId();
            var propertyBag = self.m_PropertyManager.getPropertyBag(iGroupId);

            var bCompound = self.m_ObjectGroupManager.getSelectedGroupType() == 'compound' || self.m_ObjectGroupManager.getSelectedGroupType() == 'default_compound' || self.m_ObjectGroupManager.getSelectedGroupType() == 'logic_compound'
            var liEleGroupId = [];
            if(bCompound){
                liEleGroupId = self.m_ObjectGroupManager.getEleGroupIdsbyGroupId(iGroupId);
            }
            var liFilterGroupEleId = [];//used when compound
            var mapFilterGroupEleIdReEleId = {}; //map from groupeleid to represent eleid

            if(Object.keys(this.m_mapPropertyIdFilterEleIds).length != 0){

                var compoundIndexProIdsMap = propertyBag.getCompoundIndexPropertyIdsMap();
                var filterSetCompoundIndex = [];
                var FirstIntersect = true;

                for(var compoundIndex in compoundIndexProIdsMap){

                    var ProIds = compoundIndexProIdsMap[compoundIndex];
                    var liFilteredEleId = [];
                    var first = true;
                    // //console.log(" pro ids ", ProIds);

                    $.each(ProIds, function(i, iPId){                        
                        var liThisEle = self.m_mapPropertyIdFilterEleIds[iPId];
                        if(liThisEle != undefined){
                            //console.log(" connected filter ids ", liThisEle);
                            if(filterSetCompoundIndex.indexOf(compoundIndex) == -1)
                                filterSetCompoundIndex.push(compoundIndex);
                            if(first){
                                first = false;
                                liFilteredEleId = liThisEle;
                            }else{
                                var liAfterNewFilterEleId = [];
                                for (var i = liThisEle.length - 1; i >= 0; i--) {
                                    var eleId = liThisEle[i];
                                    //console.log(" liFilteredEleId.indexOf(eleId) ", eleId, liFilteredEleId.indexOf(eleId));
                                    if(liFilteredEleId.indexOf(eleId)>=0){
                                        liAfterNewFilterEleId.push(eleId);
                                    }
                                };
                                liFilteredEleId = liAfterNewFilterEleId;
                            }
                        }
                    });

                    //console.log(" compoundIndex ", compoundIndex , " liFilteredEleId ", liFilteredEleId); 

                    //intersect 
                    if(!first){
                        if(FirstIntersect){
                            //for the first compound index with setting
                            liNewFilterEleId = liFilteredEleId;
                            FirstIntersect = false;
                            //console.log(" [1] ", liNewFilterEleId); 
                            if(bCompound){
                                //compute the  liFilterGroupEleId
                                for (var i = 0; i < liNewFilterEleId.length; i++) {
                                    var temp = liNewFilterEleId[i];
                                    var tempGroupEleId = self.m_ElementProperties.getEleGroupIdwithEleId(temp, liEleGroupId);
                                    if(liFilterGroupEleId.indexOf(tempGroupEleId) == -1){
                                        liFilterGroupEleId.push(tempGroupEleId);
                                        mapFilterGroupEleIdReEleId[tempGroupEleId] = temp;
                                    }
                                };
                            }
                        }else{
                            //for >= 2 compound index with setting, it should be compound  
                            var liNewFilterGroupEleId = [];      
                            var liIntersectFilterEleId = [];            
                            for (var i = 0; i < liFilteredEleId.length; i++) {
                                var iTempEleId = liFilteredEleId[i];
                                var iTempEleGroupId = self.m_ElementProperties.getEleGroupIdwithEleId(iTempEleId, liEleGroupId);
                                if(liFilterGroupEleId.indexOf(iTempEleGroupId) >= 0){
                                    //interact
                                    liNewFilterGroupEleId.push(iTempEleGroupId);
                                    liIntersectFilterEleId.push(mapFilterGroupEleIdReEleId[iTempEleGroupId]);
                                }
                            };
                            liNewFilterEleId = liIntersectFilterEleId;
                            liFilterGroupEleId = liNewFilterGroupEleId;
                        }
                    }                                
                }

               //console.log("bCompound ", bCompound, " All Result liFilterGroupEleId = ", liFilterGroupEleId); 


                if(bCompound){
                    for (var i = 0; i < liFilterGroupEleId.length; i++) {
                        var iEleGroupId = liFilterGroupEleId[i];
                        var liTempEleId = self.m_ElementProperties.getElementIdsofEleGroup(iEleGroupId);
                        liNewFilterEleId = liNewFilterEleId.concat(liTempEleId);
                    };
                }

                //console.log(" liNewFilterEleId ", liNewFilterEleId);
            }else{
              var iSelectGroupId = self.m_ObjectGroupManager.getSelectedGroupId();        
              liNewFilterEleId = self.m_ObjectGroupManager.getAllEleIdsofGroup(iSelectGroupId);
            }

            if(Object.keys(this.m_mapScatterPlotFilterEleIds).length != 0){
                for(var iSPId in this.m_mapScatterPlotFilterEleIds){
                    var liThisFilterId = this.m_mapScatterPlotFilterEleIds[iSPId];
                    var liAfterNewFilterEleId = [];
                    for (var i = liThisFilterId.length - 1; i >= 0; i--) {
                        var eleId = liThisFilterId[i];
                        if(liNewFilterEleId.indexOf(eleId)>=0){
                            liAfterNewFilterEleId.push(eleId);
                        }
                    };
                    liNewFilterEleId = liAfterNewFilterEleId;
                }
            }

            //mds
            //console.log("XXXX [3]", liNewFilterEleId, this.m_liMDSFilterEleIds);
            //console.log("????", liNewFilterEleId.length, this.m_liMDSFilterEleIds);
            if(this.m_liMDSFilterEleIds.length != 0){
                //console.log("XXXX [5]", this.m_liMDSFilterEleIds.length);
                var liAfterNewFilterEleId = [];
                for (var i = this.m_liMDSFilterEleIds.length - 1; i >= 0; i--) {
                    var eleId = this.m_liMDSFilterEleIds[i];
                    if(liNewFilterEleId.indexOf(eleId)>=0){
                        liAfterNewFilterEleId.push(eleId);
                    }
                };
                liNewFilterEleId = liAfterNewFilterEleId;
            }
            //console.log("XXXX [4]", liNewFilterEleId.length);
        }
        this.setFilterEleIds(liNewFilterEleId);
    }

    //update the visual rendering of selected eles
    Info.updateVisualRendering = function(){
        var self = this;
        console.log(' update rendering ', this.m_liFilteredElementId.length);
     
        //set filtered
        var liAllSelectedEleId = self.m_ElementProperties.getElementIds();

        $.each(liAllSelectedEleId, function(i, iEleId){
            var element = self.m_ElementProperties.getElebyId(iEleId);
           
            // //console.log('update Visual Rendering');
            //recover
            if(self.m_liFilteredElementId.indexOf(iEleId) >= 0){
                //choose
                // $(element).removeClass('alpha-3');
                // $(element).addClass('alpha-10');
                element.style.opacity = 1;

                //recover the element's stroke
                element.style['stroke'] = 'gray';
                // element.style['stroke-opacity'] = 1;
                element.style['stroke-width'] = '3px';
            }else{
                var stroke = self.m_ElementProperties.getEleStrokeInfo(iEleId);
                if(stroke != undefined){
                     element.style['stroke'] = stroke['stroke'];
                    // element.style['stroke-opacity'] = 0;
                    element.style['stroke-width'] = stroke['stroke-width'];                    
                }
                element.style.opacity = 0.3;   
            }
        });
    }

    Info.addAnFilterConstraint = function(iLegendId, liFilterProperty){
    	var filterConstraint = {};
    	filterConstraint['legendid'] = iLegendId;
    	filterConstraint['properties'] = liFilterProperty;
    	var iFilterId = this.m_liFilteredConstraint.length;

    	// //console.log('addAnFilterConstraint ', filterConstraint, ' filter ', liFilterProperty);
    	this.m_liFilteredConstraint.push(filterConstraint);
    	
    	// var liProperties = g_LegendInfo.getPropertiesofLegendId(iLegendId);
    	var liEle = [];    	
    	$.each(liFilterProperty, function(i, item){
    		var liEle_Temp = g_LegendInfo.getDistriofLegendIdProperty(iLegendId, item);
    		if(liEle_Temp != undefined)
    			liEle.push(liEle_Temp);
    	});

    	var liFilterEle = [];
    	for (var i = liEle.length - 1; i >= 0; i--) {
    		var Eles = liEle[i];
    		for (var j = Eles.length - 1; j >= 0; j--) {
    			liFilterEle.push(Eles[j]);	
    		}    		
    	};

    	// //console.log('filter ele ', liFilterEle);

    	this.m_mapFitlerIdElementIdList[iFilterId] = liFilterEle;
    	this.updateFilterResult();
    }
    Info.updateFilterResult = function(){
    	this.m_liFilteredElementId = g_ElementProperties.getElementIds();
    	// //console.log('1 ', this.m_liFilteredElementId);
    	// //console.log('11 ', this.m_mapFitlerIdElementIdList);
    	if(this.m_liFilteredConstraint.length != 0){
    		//set filter constraints
    		for(var filterid in this.m_mapFitlerIdElementIdList){
    			var eacheleidlist = this.m_mapFitlerIdElementIdList[filterid];
    			// //console.log('filterid' , filterid , '2 ', eacheleidlist);
    			this.m_liFilteredElementId = intersection_destructive(eacheleidlist, this.m_liFilteredElementId);
    			// //console.log('X ', this.m_liFilteredElementId);
    		}
    	}
    }
    //if any filtering constraint on the properties?
    Info.isSetFiltering = function(){
        return Object.keys(this.m_mapPropertyIdFilterEleIds).length != 0;
    }
    Info.isSetConstraintOnProperty = function(iPropertyId){
        return (this.m_mapPropertyIdFilterEleIds[iPropertyId] != undefined);
    }
    Info.getFilteredElement = function(){
		return this.m_liFilteredElementId;		    	
    }
    Info.clear = function(){
    	this.m_liFilteredElementId = [];
		this.m_liFilteredConstraint = [];
	    this.m_mapFitlerIdElementIdList = {};
    }
    Info.__init__(iId, objectGroupManager, elementProperties, propertyManager);
	return Info;
}

// var g_CrossFilterInfo = new CrossFilterInfo();

//reset the cross filter when new region is defined
function resetCrossFilter(){
    //console.log(' reset cross filter ');
    g_CrossFilterInfo.reset();
}

/* filter related */
function filterElebyGroup(iGroupId){
    var liFilteredEleId = g_ObjectGroupManager.getAllEleIdsofGroup(iGroupId);
    //console.log(" liFilter Ele Number ", liFilteredEleId.length);
    g_CrossFilterInfo.setFilterEleIds(liFilteredEleId);
}

function filterOnLegendBar(bar){
	var data = d3.select(bar).data()[0];
	var value = data['value'], property = data['property'], legendid = data['legendid'];
	// //console.log(data, ' click on ', value, ' pro ', property, ' legend ', legendid);
	var liProperties = [];
	liProperties.push(property);
	g_CrossFilterInfo.addAnFilterConstraint(legendid, liProperties);

	var liFilterEle = g_CrossFilterInfo.getFilteredElement();
	// //console.log('select elements ', liFilterEle.length);

	//update the ele
	$.each(liFilterEle, function(i, item){
		var element = g_ElementProperties.getElebyId(item);
		if(element != undefined){
			$(element).css('opacity', '1')
			.css('stroke', 'red');
		}
	});
}

function clearFilter(){

	//recover the elements
	 // var liElementId = g_ElementProperties.getElementIds();
	var liFilterEle = g_CrossFilterInfo.getFilteredElement();
  	$.each(liFilterEle, function(i, id){
      var ele = g_ElementProperties.getElebyId(id);
      $(ele).css('opacity', '0.3');
      // $(ele).css('stroke-opacity', '0');
      $(ele).css('stroke', 'black');
  	});

	g_CrossFilterInfo.clear();
}

//get the intersection of two lists
function intersection_destructive(a, b)
{
	// //console.log('a,', a, ' b ', b);
	var resultlist = [];
	$.each(a, function(i, item){                
		if(b.indexOf(item) >= 0)
			resultlist.push(item);
	});
  	return resultlist;
}