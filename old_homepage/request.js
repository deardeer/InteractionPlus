
function updateCaseStats(){

	var casedivlist = $('.use_case_div');

	//get the related url list
	var caseurllist = [];
	for (var i = 0; i < casedivlist.length; i++) {
		var casediv = casedivlist[i];
		var use_case_url = casediv.getAttribute('caseurl');
		// console.log(' url ', use_case_url);
		if(isUrlSpecial(use_case_url))
			use_case_url = getFakeUrlbyRealUrl(use_case_url);
		caseurllist.push(use_case_url);
	}

	fetchCaseStatistics(caseurllist);	
}

//function: fetch the statisics of the given case list 
function fetchCaseStatistics(caseurllist){

	//communicate with server
	console.log(' case url list', caseurllist);

	//for flagid lists
	var url = 'http://vis.pku.edu.cn/addonfilter_server/fetchCaseStatistics';
    var data = {
    	caseurllist: caseurllist,
    };

	$.ajax({
	  	url:url, 
	  	data:JSON.stringify(data), 
	  	type:"GET", 
	  	dataType: "jsonp",
	  	complete: function(jqXHR, textStatus, error){
	  		console.log('error  ', error, jqXHR , textStatus );
	  	},
	    jsonpCallback: "feedbackofFetchCaseStats",
	  	"crossDomain":true
    });
}

function feedbackofFetchCaseStats(response){

	console.log(' response ', response.exploreArray.length, ' , userArray ', response.userArray.length);

	//update user, submission number
	
	var casedivlist = $('.use_case_div');
	for (var i = 0; i < response.exploreArray.length; i++) {
		var countUrl = response.exploreArray[i];
		var exploreCount = countUrl.num;
		var exploreUrl = countUrl.url;
		if(isfakeUrlSpecial(exploreUrl)){
			exploreUrl = getRealUrlbyFakeUrl(exploreUrl);
		}
		$('.case_submission_num','[caseurl="'+ exploreUrl + '"]').text(exploreCount);
	};

	for (var i = 0; i < response.userArray.length; i++) {
		var countUrl = response.userArray[i];
		var userCount = countUrl.num;
		var exploreUrl = countUrl.url;
		if(isfakeUrlSpecial(exploreUrl)){
			exploreUrl = getRealUrlbyFakeUrl(exploreUrl);
		}
		$('.case_user_num','[caseurl="'+ exploreUrl + '"]').text(userCount);
	};

	// var caseurllist = [];
	// for (var i = 0; i < casedivlist.length; i++) {
	// 	var casediv = casedivlist[i];
	// 	var use_case_url = casediv.getAttribute('caseurl');

	// 	// console.log(' url ', use_case_url);
	// 	if(isUrlSpecial(use_case_url))
	// 		use_case_url = getFakeUrlbyRealUrl(use_case_url);
	// 	caseurllist.push(use_case_url);
	// }

	// var flagInfoList = response.info;
	// var caseurl = response.caseurl;

 // 	if(isfakeUrlSpecial(caseurl))
 // 		caseurl = getRealUrlbyFakeUrl(caseurl);

 	// console.log('success case url ', caseurl);

 	// var submitSpan = ;
 	// $('.case_submission_num', '[caseurl="' + caseurl + '"]')[0].textContent = response.info.length;
	
}


