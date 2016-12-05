   var xmlhttp;  
    // 创建XMLHTTPRequest对象  
    function createXMLHTTPRequest()  
    {  
         if(window.ActiveXObject)//②如果当前浏览器为IE  
         {  
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");  
         }  
         else if(window.XMLHttpRequest)//③如果是其他浏览器  
         {  
            xmlhttp = new XMLHttpRequest();  
         }else  
         {  
             alert("Your browser does not support XMLHTTP.");  
        }  
    }  
      
    function getInfo()  
    {  
      createXMLHTTPRequest();  
      console.log(' create HTTP');
     // xmlhttp.setHeader("Access-Control-Allow-Origin", "*");
      xmlhttp.open("get", "http://vis.pku.edu.cn/addonfilter_server/show", true);      console.log(xmlhttp.readyState);
   // xmlhttp.open("post", "http://localhost:8888/show",true);
      xmlhttp.onreadystatechange = returnInfo;  
      xmlhttp.send(null);  
    }  

    function login(info)
    {
      console.log('login');
      createXMLHTTPRequest();  
      var args = "username="+info.username+"&password="+info.password;
      xmlhttp.open("post", "http://vis.pku.edu.cn/addonfilter_server/login", true); 
xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8"); 
      xmlhttp.onreadystatechange = returnstate;  
      //var args = "{\"username\":\""+info.username+"\",\"password\":\""+info.password+"\"}";
	xmlhttp.send(args);  
    }

    function register(info){
      console.log(' info ', info);
      var url = 'http://vis.pku.edu.cn/addonfilter_server/register';
      var userinfo = {
	username: info.username,
        password: info.password,
        }
      $.ajax(
	{
         url:url, 
         data:JSON.stringify(userinfo), 
         type: "POST", 
	 success: function(data, textStatus, jqXHR){
		console.log(' success !');
   		console.log(' hello1 ', data);
	 },
	 dataType: "json",
         "crossDomain": true
       });
    }

    function register_b(info)
    {
      createXMLHTTPRequest();  
      console.log(' create HTTP');
     // xmlhttp.setHeader("Access-Control-Allow-Origin", "*");
      xmlhttp.open("get", "http://vis.pku.edu.cn/addonfilter_server/register", true);     
      console.log(xmlhttp.readyState);
      xmlhttp.setRequestHeader("Content-Type","application/json;charset=UTF-8"); 
      //xmlhttp.setRequestHeader(');
   // xmlhttp.open("post", "http://localhost:8888/show",true);
      xmlhttp.onreadystatechange = testYes;  

      var userinfo = {
        username: info.username,
        password: info.password,
      };

      var args = JSON.stringify(userinfo);
      console.log(' args: ', args);      
      xmlhttp.send(args);  

 /*
      console.log('register');
      createXMLHTTPRequest();  
      xmlhttp.open("post", "http://vis.pku.edu.cn/addonfilter_server/register", true); 
     // xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8"); 
      xmlhttp.onreadystatechange = testYes;  

      var userinfo = {
        username: info.username,
        password: info.password,
	};

      var args = JSON.stringify(userinfo);
     // var args = JSON.stringify("{username:\""+info.username+"\",\"password\":\""+info.password+"\"}");
      console.log('register1', args);

      xmlhttp.send(null);
       // xmlhttp.send(args);  

      console.log('register2');
*/
    }

function testYes(){
   console.log(' hello1 ', xmlhttp.responseText);
}
//显示缩略图
function DrawImage(ImgD,width_s,height_s){
  /*var width_s=139;
  var height_s=104;
  */
  var image=new Image();
  image.src=ImgD.src;
  if(image.width>0 && image.height>0)
  {
    flag=true;
    if(image.width/image.height>=width_s/height_s)
    {
        if(image.width>width_s)
        {
          ImgD.width=width_s;
          ImgD.height=(image.height*width_s)/image.width;
        }
        else
        {
          ImgD.width=image.width;
          ImgD.height=image.height;
        }
    }
    else
    {
        if(image.height>height_s)
        {
          ImgD.height=height_s;
          ImgD.width=(image.width*height_s)/image.height;
        }
        else
        {
          ImgD.width=image.width;
          ImgD.height=image.height;
        }
    }
  }
  /*else{
  ImgD.src="";
  ImgD.alt=""
  }*/
}
    function returnInfo()  
    {  
      if(xmlhttp.readyState == 4)  
      {  
       var info = xmlhttp.responseText;  
       console.log("info"+ info);
       eval("var json= " + info);
       // console.log(json+"in");
        var tmp = document.getElementById("try");
        // console.log(json.imglist.length);
        for(var i=0;i<json.imglist.length;i++){  
           message= json.imglist[i];
           tmp.innerHTML += "<div><p>User"+i+"</p><p>Title<p><p>Content</p><img src='"+message+"' ></img><br><a>sharing link</a></div>";
          }   
      }  
    }  
    function returnstate() 
    {  
      console.log("opening");
      if(xmlhttp.readyState == 4)  
      {  
       var info = xmlhttp.responseText;
       console.log(info+"responseText");
      console.log(xmlhttp); 
      eval("var json= " + info); 
      //console.log("xmlhttp"+xmlhttp);
      //   var tmp = infopart.document.getElementById("abc");
      //   // console.log(json.imglist.length);
      //   for(var i=0;i<json.length;i++){  
      //      message= json[i];
      //      console.log("in");
      //      console.log(tmp.innerHTML);
      //      tmp.innerHTML += "<div><p>User"+i+"</p><p>Title<p><p>Content</p><img src='"+message+"' ></img><br><a>sharing link</a></div>";
      //      console.log(tmp.innerHTML);}     
      window.location.href="login.html";
      }
    } 

