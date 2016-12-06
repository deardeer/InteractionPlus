var printNum = 0;
function monitorAnimation(){

	var MutationObserver = window.MutationObserver ||
	        window.WebKitMutationObserver || 
	        window.MozMutationObserver;

	var mutationObserverSupport = !!MutationObserver;

	var callback = function(records){
	    //console.log('MutationObserver callback');
	    records.map(function(record){
	    	switch(record.type){
	    		case 'attributes':
	    		var temp = {};
	    		temp['object'] = record.target;
	    		temp['attrName'] = record.attributeName;
	    		temp['oldValue'] = record.oldValue;
	    		
	    		if(printNum < 50){
	    			//console.log(" object ", temp['object'], ' attrName ', temp['attrName'], ' oldValue ', temp['oldValue']);
	    			printNum += 1;
	    		}
	    		
	    			// //console.log(' type: ' + record.type, ' attributeName ' + record.attributeName, ' oldValue ' + record.oldValue);
	    			break;
    			case 'childList':
	    			// //console.log(' type: ' + record.type, ' target: ' + record.target.nodeName);
	    			// var nodelist = record.addedNodes;
					// for (var i = 0; i < nodelist.length; ++i) {
					// 	var item = nodelist[i];  // Calling myNodeList.item(i) isn't necessary in JavaScript
					// 	//console.log(' add item ', item);
					// }
	    			break;
	    	}
	        // //console.log('Mutation type: '+ 
	        // 	record.type, ', target: ', record.target.nodeName);	        
	        	// , ', addedNodes: ' + record.addedNodes.length
	        	// , ', removeNodes: ' + record.removedNodes.length);
	    });
	};

	var mo = new MutationObserver(callback);

	var option = {
	    'childList': true, 
	    'attributes': true,
	    'attributeOldValue': true,
	    'subtree': true
	};

	// mo.observe(document.body, option);
	var liEleId = g_ElementProperties.getElementIds();
	var invalidEle = ['div', 'section'];
	$.each(liEleId, function(i, item){
		var ele = g_ElementProperties.getElebyId(item);
		var eleTag = ele.tagName.toLowerCase();
		if(invalidEle.indexOf(eleTag) < 0){	
			//console.log(' monitor ele type ', eleTag);
			mo.observe($(ele)[0], option);
		}
		// //console.log('ele ', ele, 'tag ', ele.tagName);
	});
	// mo.observe($('body')[0], option);

}

// var g_MutationObserver = {};
// var g_MonitorOption = {
// 	// 'childList': true, 
// 	// 'subtree': true,
// 	'attributes': true
// };

// function initMonitor(){
// 	//console.log(' init monitor ');

// 	var MutationObserver = window.MutationObserver ||
//     window.WebKitMutationObserver || 
//     window.MozMutationObserver;

// 	var mutationObserverSupport = !!MutationObserver;
// 	//console.log(' monitor support : ', mutationObserverSupport);

// 	if (!mutationObserverSupport) {
// 		g_MutationObserver = undefined;
//         return;
//     }

// 	g_MutationObserver = new MutationObserver(callback);
// }
