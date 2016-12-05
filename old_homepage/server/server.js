var http = require("http");
var url = require("url");
var requestHandlers = require("./requestHandlers");

function start(route,handle){

  function onRequest(request, response){

    console.log(' request.url = ', request.url);

    var pathname = url.parse(request.url).pathname;

    console.log("Request for"+pathname+" received.");

   // route(handle,pathname,response,request); 

     if(pathname == "/sharing"){
        console.log('db', pathname);
     	imgData = ""
     	request.on("data", function(data){
        	imgData += data;
        	//console.log(' xx' , imgData)
    	  });
    	request.on("end", function(){
    		route(handle,pathname,response,imgData);  
    	});
     }
     else if(pathname == '/favicon.ico'){
	
     }
     else if(pathname == '/register'){ 
       var tempData = "";
       request.on("data", function(data){
               tempData += data;
       });
       request.on("end", function(){
	      console.log('temp data', tempData);
	       var requestInfo = JSON.parse(tempData);
	       console.log('request info', requestInfo);
    	       route(handle,pathname,response, requestInfo);    
       });
     }else if(pathname == '/show_svg'){
	//	case '/show_svg':
		//console.log(request);
	requestHandlers.show_svg(response,request);
     }
else if(pathname == '/pkuvis'||pathname == '/addoncss'){
   route(handle,pathname,response,request);
}
else{
     	console.log('[1]');

     	var requestBag = parseJSONP(request.url);
	console.log("[2]");

	switch(pathname){
	case '/submitFS': 
		requestHandlers.submitFS(response, requestBag);
		break;
	case '/fetchFS':	
		requestHandlers.fetchFS(response, requestBag);
		break;
	case '/fetchFlagIds':
		requestHandlers.fetchFlagIds(response, requestBag);
		break;
	case '/submitUserInfo':
		requestHandlers.submitUserInfo(response, requestBag);
		break;
	case '/fetchCaseStatistics':
		requestHandlers.fetchCaseStatistics(response, requestBag);
		break;
	case '/testUrlRecieved':
		requestHandlers.testUrlRecieved(response, requestBag);
		break;
	case '/submitInteractInfo':
		console.log(requestBag);
		requestHandlers.submitInteractInfo(response, requestBag);
		break;
	case '/submitFeedback':
		console.log(requestBag);
		requestHandlers.submitFeedback(response, requestBag);
		break;
	}

     } 
	
/*
	else if(pathname == '/submitFS'){
	var requestBag = parseJSONP(request.url);
	requestHandlers.submitFS(response, requestBag);
     }else if(pathname == '/fetchFS'){
	var requestBag = parseJSONP(request.url);
	requestHandlers.fetchFS(response, requestBag);
     }else if(pathname == '/fetchFlagIds'){
	var requestBag = parseJSONP(request.url);
	requestHandlers.fetchFlagIds(response, requestBag);
     }else if(pathname == '/submitUserInfo'){
	var requestBag = parseJSONP(request.url);
	requestHandlers.submitUserInfo(response, requestBag);
     }
*/
 }

  http.createServer(onRequest).listen(1124);
  console.log("Server has started.");

}

function parseJSONP(requesturl){
	var requestBag =  {};
	if(requesturl){
	//	console.log(' request url ', requesturl);
		var data = getDataFromJSONP(requesturl);
	//	console.log(' data 1 ', data);
		data = decodeURI(data);
//		console.log(' data 2 ', data);
		//var requestinfo = JSON.parse(data).info;
		var requestinfo = JSON.parse(data);
		var callback = getCallBackFromJSONP(requesturl);
		requestBag.info = requestinfo;
		requestBag.callback = callback;
//		console.log('call back ', callback);
//		console.log('request info !!! ', requestinfo);
	}
	return requestBag;
}

function getDataFromJSONP(query){
	//console.log(' query !');
	//console.log(query);
	var data;
	var beginIndex = query.indexOf('&');
	var endIndex = query.indexOf('&', beginIndex + 1);
	//console.log('begin index = ', beginIndex);
	//console.log('end index = ', endIndex);
	return query.substring(beginIndex + 1, endIndex);
}

function getCallBackFromJSONP(query){
	var beginIndex = query.indexOf('=');
	var endIndex = query.indexOf('&', beginIndex + 1);
	return query.substring(beginIndex + 1, endIndex);
}

exports.start = start;
