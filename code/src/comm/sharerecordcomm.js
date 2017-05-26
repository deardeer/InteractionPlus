
	
var ShareRecordComm = function(){

	var Info = {};

	Info.submitShareRecord = function(shareRecord, client, callback){

		var self = this;
	  	var url = 'http://vis.pku.edu.cn/addonfilter_server/submitShareRecord';

	  	var data = shareRecord;

		$.ajax({
			url:url, 
			data:JSON.stringify(data), 
			type:"POST", 
			dataType: "jsonp",
			success: function(response){
				callback(client, response);
				// self.feedbackOfShareRecordSubmission(response);
				//update the left panel

			},
			"crossDomain":true
		});
	}

	//delete a info from server
	Info.deleteShareRecord = function(recordid, client, feedback){

		var self = this;
	  	var url = 'http://vis.pku.edu.cn/addonfilter_server/deleteShareRecord';
	  	
	  	var data = {
	  		shareid: recordid,
	  	}

		$.ajax({
			url:url, 
			data:JSON.stringify(data), 
			type:"POST", 
			dataType: "jsonp",
			success: function(response){
				feedback(client, response);
				// self.feedbackOfDeleteRecordSubmission(response);
				//update the left panel

			},
			"crossDomain":true
		});
	}

	return Info;
}