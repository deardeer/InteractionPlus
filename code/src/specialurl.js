var g_specialUrlMap = {}

initSpecialUrlMap();

function initSpecialUrlMap(){
	//console.log(' init SpecialUrlMap ');

	g_specialUrlMap = {
		"http://www.nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html": 
		"http://www.1nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html",
		"http://www.nytimes.com/interactive/2012/02/13/us/politics/2013-budget-proposal-graphic.html?_r=2&":
		"1",		
	}
}

function isUrlSpecial(realUrl){	
	if(Object.keys(g_specialUrlMap).indexOf(realUrl) == -1)
		return false;
	return true;
}

function isfakeUrlSpecial(fakeUrl){
	for(var realUrl in g_specialUrlMap){
		if(g_specialUrlMap[realUrl] == fakeUrl)
			return true;
	}
	return false;
}	

function getFakeUrlbyRealUrl(realUrl){
	return g_specialUrlMap[realUrl];
}

function getRealUrlbyFakeUrl(fakeUrl){
	for(var realUrl in g_specialUrlMap){
		if(g_specialUrlMap[realUrl] == fakeUrl)
			return realUrl;
	}
	return undefined;
}

function testUrlSpecialtoServer(url){
	var url_submission = 'http://vis.pku.edu.cn/addonfilter_server/testUrlRecieved';
    var data = {
    	caseurl: url,
    };

	$.ajax({
	  	url:url_submission, 
	  	data:JSON.stringify(data), 
	  	type:"POST", 
	  	// contentType: "application/json",
	  	dataType: "jsonp",
	    jsonpCallback: function(response){
	    	//console.log(' specital ', !response.received);
	    },
	    // contentType: "application/json;charset=utf-8",
	  	"crossDomain":true
    });
}