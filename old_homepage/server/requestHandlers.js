var exec = require("child_process").exec;//非阻塞操作
var querystring = require("querystring");
var fs = require("fs");
var mongoose = require('mongoose');
var formidable = require('formidable');
var password = require('password-hash-and-salt');
var Schema = mongoose.Schema;

mongoose.connect('mongodb://192.168.10.9:27017/AddOnFilter',function(err){
		if (!err)
		{
			console.log('connected to MongoDB');
		}
		else
		{
			throw err;
		}
});

imgSchema = new Schema ({
		username : String,
		releaseTime : String,
		title : String,
		content : String,
		visit : Boolean,
		img : String
	});
var imgModel = mongoose.model('Image',imgSchema);

userinfoSchema = new Schema({
		id : String,
		// uncomment last line if do not want to use auto allocate id
		username : String,
		nickname : String,
		password : String,
		sex : Boolean, // 0 for female and 1 for male
		birthday : String,
		registerDate : String,
		image : String
	});
var userinfoModel = mongoose.model('userinfo',userinfoSchema);

//interaction 
interactioninfoSchema = new Schema({
		id : String,
		// uncomment last line if do not want to use auto allocate id
		username : String,
		url : String,
		begintime : Number,
		endtime : Number, 
		timeduration : Number,
		interactionbag: String,
	});
var interactioninfoModel = mongoose.model('interactioninfo',interactioninfoSchema);


//feedback
feedbackinfoSchema = new Schema({
		id : String,
		// uncomment last line if do not want to use auto allocate id
		username : String,
		feedback: String,
	});
var feedbackinfoModel = mongoose.model('feedbackinfo', feedbackinfoSchema);

exploreSchema = new Schema({
		id : String,
		parentid : String,
		depth : Number,
		username : String,
		createDate : String,
		jsondata : String,
		commentText : String,
		detailText: String,
		url : String
	});
var exploreModel = mongoose.model('explore',exploreSchema);

userbasicinfoSchema = new Schema({
		id : String,
		username : String,
		url: String,
		time : String,
});
var userbasicinfoModel = mongoose.model('userbasicinfo',userbasicinfoSchema);



Date.prototype.Format = function (fmt) {
	var o = {
	    "M+": this.getMonth() + 1, //月份
	    "d+": this.getDate(), //日
	    "h+": this.getHours(), //小时
	    "m+": this.getMinutes(), //分
	    "s+": this.getSeconds(), //秒
	    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
	    "S": this.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) 
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;}
function createimg(name,callback){
	var path = "server/images/"+name;
	var img = new imgModel({
		img : path,
		visit : 0
	});
	img.releaseTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
	//console.log(img);
	callback(img);
}

function sharing(response,imgData){

	console.log("Request handler 'sharing' was called.");
	//console.log(request);
	   // var form = new formidable.IncomingForm();
	    //form.uploadDir='/var/www/html/addonpage/server/';
	    //form.parse(request,function(error,fields,files){
	///		    console.log(files);
		    
	//	    fs.renameSync(files.upload.path,"./images/"+files.upload.name);
 	var tmp =JSON.parse(imgData);	

	//console.log("111"+tmp['img']+"hahahahahahahah");
	base64Data = tmp['img'].replace(/^data:image\/png;base64,/,""),
 	binaryData = new Buffer(base64Data, 'base64').toString('binary');
	//binaryData = new Buffer(tmp['img'], 'base64').toString('binary');
	fs.writeFile("./images/out.png", binaryData, "binary", function(err) {
 	//	console.log(err); // writes out file without error, but it's not a valid image
	});		 
	fs.writeFile("./images/out.txt",base64Data, "utf8", function(err) {
        //       console.log(err); // writes out file without error, but it's not a valid image
        });	
	createimg("out.png",function(img){
		saveimg(img,function(){
			response.writeHead(200,
			{"Content-Type":"text/html"});
			response.write("Recieved Image: <br/>");
			response.end(); 			    	
		});
	});
}



function createExplore(data,callback){
	var exploreEntity = new exploreModel({
		username : data.username,
		jsondata : JSON.stringify(data),
		url : data.caseUrl,
		commentText: data.commentText,
		detailText: data.detailText,
	});

	exploreEntity.id = exploreEntity._id.valueOf();
	exploreEntity.createDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
	if(data.parentid)
	{ 
		exploreEntity.parentid = data.parentid;
		console.log(' explore entity ', exploreEntity);
		getDepthById(exploreEntity,function(entity){
			console.log("child depth ",entity.depth);
			callback(entity);
			}
		);
	}
	else
	{
		exploreEntity.depth=0;
		callback(exploreEntity);
	}
}

function createUserInfo(data,callback){

	var userBasicEntity = new userbasicinfoModel({
		username : data.username,
		url: data.caseurl,
		time : data.time,	
	});

	userBasicEntity.id = userBasicEntity._id.valueOf();

	callback(userBasicEntity);
}


function saveExplore(exploreEntity, callback){
	exploreEntity.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save info for "+
				exploreEntity.username + " failed");
			throw err;
		}
	});
}

function saveUserBasicInfo(basicEntity, callback){
	basicEntity.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save user basic info for "+
				basicEntity.username + " failed");
			throw err;
		}
	});
}

function getDepthById(entity,callback){
	exploreModel.findOne({id:entity.parentid},function(err,exploreInfo){
		if(exploreInfo != null)
		{
			var depth = exploreInfo.depth+1;
			entity.depth = depth;
			console.log("getDepthById "+ depth);
			callback(entity);
		}
		else
		{
			console.log('Can\'t find the id!');
			entity.depth = 0;
			callback(entity);   
		}
	});

}

function submitFS(response, request){
    	var callback = request.callback; 
	var requestinfo = request.info;
	
	var filtersetting = requestinfo.filtersetting;

	console.log("Request handler 'submit a filtering setting' was called.");
	console.log(' filter setting: selected id ', filtersetting.selectedGroupId);
	console.log(' case url ', filtersetting.caseUrl);
	console.log(' comment ', filtersetting.commentText);
	console.log(' detail text ', filtersetting.detailText);
	console.log(' parent id ', filtersetting.parentid);
		    
	createExplore(filtersetting,function(entity){
		saveExplore(entity,function(){			
	//			var feedback = "{flagId: '1',id:";
	//			feedback+=entity.id;
			console.log(' entity id', entity.id);
			var feedback = {flagId: entity.id};
			response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
		    response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		});
	});	    
}

function submitUserInfo(response, request){
	var callback = request.callback; 
	var requestinfo = request.info;
	
	var username = requestinfo.username;
	var caseurl = requestinfo.caseurl;
	var time = requestinfo.time;

	console.log("Request handler 'submit a user info' was called.");
	console.log(' user name ', username);
	console.log(' case url ', caseurl);
	console.log(' time ', time);

	createUserInfo(requestinfo,function(entity){
		saveUserBasicInfo(entity,function(){			
			console.log(' entity id', entity.id);
			var feedback = {username: entity.username};
			response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
	    	response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		});
	});	
}

function submitInteractInfo(response, request){

	console.log(" submitInteractInfo enter ");
	var callback = request.callback; 
	var requestinfo = request.info;

	console.log(" requestinfo.timeduration ", requestinfo.timeduration);

	createInteractionInfo(requestinfo,function(entity){
		saveInteractionInfo(entity,function(){		
			
			var feedback = {flagId: entity.id};
			response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
		    response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		});
	});	 
}

function submitFeedback(response, request){

	console.log(" submitFeedback enter ");
	var callback = request.callback; 
	var requestinfo = request.info;

	console.log(" feedback ", requestinfo.feedback);

	createFeedbackInfo(requestinfo,function(entity){
		saveFeedbackInfo(entity,function(){		
			
			var feedback = {flagId: entity.id};
			response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
		    response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		});
	});	 
}

function fetchFS(response, request){

	var callback = request.callback;
    	var requestinfo = request.info;
	var flagId = requestinfo.flagId;
    
	console.log(" fetch FS by flagId = ", flagId);

	exploreModel.findOne({"id": flagId}, function(err, exploreInfo){
		if (exploreInfo != null)
		{		
		   var feedback = exploreInfo.jsondata;	
	          console.log(" feedback: ", feedback);
		   response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
			response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		}
		else{
			// console.log("failed"+username+password);
			console.log('Can\'t find the id!');  
		   var feedback = {Flag : 0};	
			response.writeHead(200, 
			{
			'Content-Type': 'application/json', 
			'Access-Control-Allow-Origin': '*',
			});
			response.write(callback + '(' + JSON.stringify(feedback) + ')');
			response.end();
		}

	});
}

/* fetch the flags id in a depth */
function fetchTree(reponse, request){
	var callback = request.callback;
	var requestinfo = request.info;
	
	var caseurl = requestinfo.caseUrl;
	
	console.log('fetch flag id list in depth: ', requestinfo.depth);
	
	var feedback = [];
	exploreModel.find({"depth":requestinfo.depth,"url":caseurl},function(err,list){
		response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
				for(var i=0;i<list.length;i++){
					var obj = new Object();
					obj.id = list[i].id;
					obj.parentid = list[i].parentid;
					obj.depth = list[i].depth;
					feedback.push(obj); 
				}
				response.write(callback + '(' +JSON.stringify({flag : 'true', info: feedback}) + ')');
				response.end();
				console.log("Get id list success!");
	});
}

/* fetch the flag ids by given url and top number */
function fetchFlagIds(response, request){

	var callback = request.callback;
    	var requestinfo = request.info;

	var iTopNumber = requestinfo.topnumber;
	var caseUrl = requestinfo.caseurl;

	console.log(' fetch flags case ' , caseUrl, ' call back ', callback);
/*
		response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
		var feedback = {
			caseurl: caseUrl
		};
		//response.write(callback + '(' +JSON.stringify({flag : 'false'}) + ')'); 
		var writecontent = callback + '(' +JSON.stringify(feedback) + ');';
		console.log(writecontent);
		response.write(writecontent);//callback + '(' +JSON.stringify(feedback) + ');'); 
		response.end();
	
*/
	var explore_box=[];
	if(exploreModel.length!=0){
		exploreModel.find({"url":caseUrl}).sort({createDate:-1}).find(function (err, list) {
			response.writeHead(200, { 'Content-Type': 'application/jsonp', 'Access-Control-Allow-Origin': '*' });
				for(var i=0;i<list.length;i++){
					explore_box[i]=new Object();
					explore_box[i].id=list[i].id;
					explore_box[i].commentText=list[i].commentText;
					explore_box[i].detailText=list[i].detailText;
					explore_box[i].parentid = list[i].parentid;
					explore_box[i].depth = list[i].depth;
					//console.log( ' xx ' , list[i].commentText);
					if(iTopNumber!=-1&&iTopNumber==i+1)break;
				}
				var feedback = {
					info: explore_box,
				};
				var writecontent = callback + '(' +JSON.stringify(feedback) + ');';
				console.log('write1: ', writecontent);
				response.write(writecontent);//callback + '(' + JSON.stringify(feedback) + ');');
//{flag : 'true', info: explore_box, caseurl: caseUrl}
				response.end();

				console.log("Get id list success!", explore_box);
		});
	}
	else{

		response.writeHead(200, { 'Content-Type': 'application/jsonp', 'Access-Control-Allow-Origin': '*' });
		response.write(callback + '(' +JSON.stringify({flag : 'false'}) + ')'); 
		//var writecontent = callback + '(' +JSON.stringify(feedback) + ');';
		//console.log(writecontent);
		//response.write(writecontent);//callback + '(' +JSON.stringify(feedback) + ');'); 
		response.end();
		console.log("No id exists!");
	}
}

function fetchCaseStatistics(response, request){

	var callback = request.callback;
    	var requestinfo = request.info;
	
	//given the url list
	var caseurllist = requestinfo.caseurllist;
	
 	var explore_num_info = [];
	var user_num_info = [];
	var count = 0;	
	if(exploreModel.length!=0){
		for(var i = 0; i < caseurllist.length; i ++){
			var caseurl = caseurllist[i];
			console.log('case url', caseurl);
			exploreModel.find({"url":caseurl},function(err,list){
				if(list.length!=0){
				var obj = new Object();
				console.log("count "+count+" list"+list);
				obj.url = list[0].url;
				obj.num = list.length;
				explore_num_info.push(obj);
				}
				count++;	
				if(count == caseurllist.length)
				{
					count = 0;	
					for(var i = 0; i < caseurllist.length; i ++){
                        	var caseurl = caseurllist[i];
                       		console.log('case url', caseurl);
                        	userbasicinfoModel.find({"url":caseurl},function(err,list){
                                if(list.length!=0){
                                var obj = new Object();
                                console.log("count &&& "+count+" list"+list);
                                obj.url = list[0].url;
                                obj.num = list.length;
                                user_num_info.push(obj);
                                }
                                count++;
                                if(count == caseurllist.length)
                                {   
                                	var feedback = {
                                		exploreArray: explore_num_info,
                                		userArray: user_num_info
                                	}
                                	console.log(' feedback ', feedback);    
                                	var writecontent = callback + '(' +JSON.stringify(feedback) + ');'; //"{exploreArray:"+explore_num_info+",userArray:"+user_num_info+"}"
                                        response.writeHead(200, { 'Content-Type': 'application/jsonp', 'Access-Control-Allow-Origin': '*' });
                                        response.write(writecontent);
                                        response.end();
                                	}
                        	});
                	}
				}
			})
		}
	}
}


function testUrlRecieved(response, request){
	var callback = request.callback;
    	var requestinfo = request.info;
	var feedback = {
		received: true,
	};
	response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
	response.write(callback + '(' +JSON.stringify(feedback) + ')');
	response.end();
}

function saveimg(img,callback){
	img.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save info for "+
				img + " failed");
			throw err;
		}
	});
}
//enctype="multipart/form-data 传输文件需要的MIME编码"
function getimages(path,response,callback){
	fs.readFile(path,"binary",function(error,file){
				//console.log("count"+path);
					if(error){
				        response.write(error+"\n");
				      	response.end();
					}
					else{
			     	 	response.write(file,"binary");
						callback(file);
					}	
				});		
}
function createUser(request,callback){
	var userinfoEntity = new userinfoModel({
		username : request.username,
		nickname : request.nickname,
		sex : request.sex,
		birthday : request.birthday,
		image : request.image
	});
	userinfoEntity.id = userinfoEntity._id.valueOf();
	userinfoEntity.registerDate = new Date().Format("yyyy-MM-dd hh:mm:ss");
	password(request.password).hash(function(err,hash){
		if (err)
		{
			console.log('password hash error!');
			console.log(request);
			throw err;
		}
		// console.log(hash);
		userinfoEntity.password = hash;
		// console.log(request.body.password);
		// console.log(userinfoEntity.password);
		callback(userinfoEntity);
	});
	// and normally callback will call saveNewUser function
}

function saveUser(userinfoEntity, callback){
	userinfoEntity.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save info for "+
				userinfoEntity.username + " failed");
			throw err;
		}
	});
}

function createInteractionInfo(request,callback){
	var interactioninfoEntity = new interactioninfoModel({
		username : request.username,
		url : request.caseurl,
		begintime : request.begintime,
		endtime : request.endtime, 
		timeduration : request.timeduration,
		interactionbag: JSON.stringify(request.interactionbag),
	});
		
	interactioninfoEntity.id = interactioninfoEntity._id.valueOf();

	callback(interactioninfoEntity);
}


function createFeedbackInfo(request,callback){
	var feedbackinfoEntity = new feedbackinfoModel({
		username : request['Name'],
		feedback: JSON.stringify(request),
	});
		
	feedbackinfoEntity.id = feedbackinfoEntity._id.valueOf();

	callback(feedbackinfoEntity);
}


function saveInteractionInfo(interactioninfoEntity, callback){
	interactioninfoEntity.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save interaction info for "+
				interactioninfoEntity.username + " failed");
			throw err;
		}
	});
}


function saveFeedbackInfo(feedbackinfoEntity, callback){
	feedbackinfoEntity.save(function(err){
		if (!err)
		{
			callback();
		}
		else
		{
			console.log("save feedback info for "+
				feedbackinfoEntity.username + " failed");
			throw err;
		}
	});
}

function register(response, request){

	var tmp = request;
	var success=0;
	/* success example 
	*/
	var userInfo = request;
/*	console.log(' user info ', userInfo.username);
        console.log(' register1 ', userInfo.password);*/
	console.log(userInfo);
	userinfoModel.findOne({username: tmp.username},
		function(err,userinfoRef){
			if (err)
			{
				console.log('findOne for register error');
				throw err;
			}
			if (userinfoRef == null)// username acquired
			{
				createUser(tmp,function(userinfo){
					saveUser(userinfo,function(){
						console.log("save infomation for "+
						tmp.username+" successful");
	/*	response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
//						response.writeHead(200, {'Content-Type': 'application/json'});
						//response.end(JSON.stringify(userInfo));
		response.end(JSON.stringify({flag : 'true', user: userinfo.username}));
	response.end(JSON.stringify(userInfo));
	*/success=1;				});
				});

			}
			else
			{

//				response.writeHead(200, {'Content-Type': 'application/json'});
				response.end(JSON.stringify({flag : 'false', err_msg : '用户名已注册'}));
				console.log("invalid username : "+ tmp.username);
			}
	});

	if(success==0){
	response.writeHead(200, {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'});
        response.end(JSON.stringify(userInfo));
	}
}

function userLogIn(username, passwd, callback){
	userinfoModel.findOne({"username": username}, function(err, userinfo){
		if (userinfo != null)
		{
			password(passwd).verifyAgainst(userinfo.password,function(err,verified){
				if (err)
				{
					console.log('verify password error');
					throw err;
				}
				if (!verified)
				{
					console.log('password not match');
					callback(null,false);
				}
				else
				{
					console.log('password matched');
					callback(userinfo,true);
				}
			});
		}
		else{
			// console.log("failed"+username+password);
			console.log('Can\'t find the user or wrong password!');
			callback(null,false);
		}

	});
}
function login(response,request){
	var tmp1=request.substr(1);
	console.log("raw"+tmp1);
	var tmp = JSON.parse(tmp1);
	//console.log("hhihihihihih"+tmp.username);
	userLogIn(tmp.username, tmp.password, function(userinfo,flag){
		if (flag)
		{
			response.writeHead(200, {'Content-Type': 'application/json','Access-Control-Allow-Origin': '*' });
			response.end(JSON.stringify({flag : 'true', id:userinfo.id.valueOf(),username:userinfo.username}));
	//		console.log(JSON.stringify({flag : 'true', id:userinfo.id.valueOf(),username:userinfo.username}));
//			console.log("Login successfully!"+userinfo.id);
			/* write something for successfully logged in*/
			saveUser(userinfo,function(){
				console.log("save infomation for "+
				tmp.username+" successful");
			});
		}
		else
		{
			response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({flag : 'false', err_msg : '用户名或密码错误'}));

			console.log("Login failed!");
			/* write something for failed to login */
		}
	});
}
function show(response,request){
	var a=[];
        console.log("Request handler 'show' was called.");
	if(imgModel.length!=0)
	{
		imgModel.find().sort({releaseTime:-1}).find(function (err, docs) {
			//response.writeHead("Access-Control-Allow-Origin", "*");
    			//response.writeHead("Access-Control-Allow-Headers", "X-Requested-With");
    			//response.writeHead("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
		response.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
			//console.log(docs);
			//response.writeHead(200, { 'Content-Type': 'image/jpg', 'Access-Control-Allow-Origin': '*' }); 
			for(var i=0;i<docs.length;i++){
				a.push(docs[i].img);
			}
			console.log(a);
			//response.writeHead(200, {'Content-Type': 'application/json'});
			response.end(JSON.stringify({username:'abc',flag : 'true', imglist: a}));
			// docs.forEach(function(x){
			// 	if(x.visit==0){
			// 		getimages(x.img,response,function(img){
			// 			if(img){
			// 				if(docs.indexOf(x)==docs.length-1)
			// 					console.log("last one !");
			// 				else
			// 					console.log("not end yet");
			// 				// 	response.end();	
			// 			}
			// 			else{console.log("not end yet");}
			// 		});	
			// 		x.visit=1;
			// 		saveimg(x,function(){console.log("saving for "+docs.indexOf(x));});
			// 		return;
			// 	}
			// });
		});
	}
	else
	{
		console.log("no Topics by now");
	}
		
}
util = require('util');
function show_svg(response, request){
  console.log("Request handler 'upload' was called.");
  
  var form =new formidable.IncomingForm();
  console.log("about to parse ");
  form.parse(request,function(error, fields, files){
    console.log("parsing done");
var readStream = fs.createReadStream(files.upload.path)
var writeStream = fs.createWriteStream("/var/www/html/addonpage/test.svg");
util.pump(readStream, writeStream, function() {
    fs.unlinkSync(files.upload.path);
});
      response.writeHead(200,{"Content-Type":"text/html",'Access-Control-Allow-Origin': '*'});
       fs.readFile(files.upload.path,"binary",function(error, file){
        var tmp ='<html lang="en">'+
'<head>'+
        '<meta charset="UTF-8">'+
        '<title>TEST</title>'+
'<link rel="stylesheet" href="/addoncss"'+'</head>'+
'<body>'+
                       ' <div class="row panel intro_row">'+
        '<div class="col-md-12" style="margin-bottom:10px;">'+

   ' <div style="position: absolute; left: 10px; top: 10px;">'+
            '<img src="/pkuvis" width="100px">'+
            '<a href="http://vis.pku.edu.cn" target="blank" style="margin-left:10px">http://vis.pku.edu.cn</a>'+
    '</div>'+

    '<div style="margin-top:20px">'+
            '<h1 style="text-align:center" style="font-weight:700">'+
                    'Now Enjoy Your Trip!'+
            '</h1>'+
    '</div>'+
'<div class="row" id="show_area">'+file+
'</div>'+
'</div>'+'</div>'+
'</body>'+
'</html>'; 
	response.write(tmp);
         response.end();
    });
  });
}
function pkuvis(response,request){
	fs.readFile("images/pkuvis.jpg","binary",function(error, file){
	response.writeHead(200,{"Content-Type":"image/jpeg",'Access-Control-Allow-Origin': '*'});
 	response.write(file,"binary");
         response.end();	

	});
}
function addoncss(response,request){
        fs.readFile("../assets/css/addon_style.css","binary",function(error, file){
        response.writeHead(200,{"Content-Type":"text/css",'Access-Control-Allow-Origin': '*'});
        response.write(file,"binary");
         response.end();

        });
}
exports.show_svg = show_svg;
exports.pkuvis = pkuvis;
exports.addoncss = addoncss;

exports.submitFS = submitFS;
exports.submitUserInfo = submitUserInfo;
exports.fetchFS = fetchFS;
exports.sharing = sharing;
exports.show = show;
exports.login = login;
//exports.register = register;
exports.fetchFlagIds = fetchFlagIds;
exports.fetchTree = fetchTree;
exports.fetchCaseStatistics = fetchCaseStatistics;

exports.testUrlRecieved = testUrlRecieved;

//interaction related
exports.submitInteractInfo = submitInteractInfo;
exports.submitFeedback = submitFeedback;
