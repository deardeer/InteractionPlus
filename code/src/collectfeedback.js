var g_Feedback = {};

function FeedBackInfo(){
  var Info = new Object;
  Info.basicinfolist = [
    'Name',
    'Field',
    // 'Background',
    "Estimate your experience level in information visualization / visual data analysis (1~7)",
    // 'Title',
    'Affiation'];

  Info.questionlist = [
    "Dragging abitrary rectangles supports me to explore regions flexibily.", //flexible_rect 
    "It is helpful that visual properties is quantized by histograms (for example, the color histogram shows the distribution of color).", //quantization
    "I am able to derive some meaningful properties based on the original visual properties.", //flexible_property
    "I am able to compose the visual objects by giving example", //compose objects
    "I found it is easy to get the visual object satifying multiple criteria by cross filtering",
    "I found it is easy to compose the group by logic operations, e.g. AND, XOR, OR",
    "Add-on Filter helps me target at the interested visual elements easily.", //facilitation
    "Add-on Filter fully supports me to filter the objects I wanted", //supportness
    "The interface of Add-on Filter is easy to use.", //friendly
    "I would like to recommend Add-on Filter to others.", //willingness
  ];

  Info.subjectlist = [
    'What does Add-on Filter impress your the most?', //best
    'If there were one thing we could improve Add-on Filter, what would that be?', //improve
    // 'How can we improve the Add-on Filter?',
    'General comments', //general
  ];  

  Info.getBasicUserInfoList = function(){
    return this.basicinfolist;
  }

  Info.getSatisfyQuestionList = function(){      
      return this.questionlist;
  }

  Info.getSubjectQuestionList = function(){
    return this.subjectlist;
  }

  Info.getQuestionbyIndex = function(iIndex){
    if(iIndex <= this.basicinfolist.length - 1)
      return this.basicinfolist[iIndex];
    else if(iIndex <= this.basicinfolist.length + this.questionlist.length - 1)
      return this.questionlist[iIndex];
    else if(iIndex <= this.basicinfolist.length + this.questionlist.length + this.subjectlist.length - 1)
      return this.subjectlist[iIndex];
  }

  Info.getQuestionType = function(iIndex){
     if(iIndex <= this.basicinfolist.length - 1)
      return "basicinfo";
    else if(iIndex <= this.basicinfolist.length + this.questionlist.length - 1)
      return "radioquestion";
    else if(iIndex <= this.basicinfolist.length + this.questionlist.length + this.subjectlist.length - 1)
      return "subjectquestion";
  }

  Info.getQuestionShortName = function(iIndex){
    if(iIndex <= this.basicinfolist.length - 1)
      return this.basicinfolist[iIndex];
    else{
      return iIndex + '';
      // switch(iIndex){
      //   case 5: 
      //     return 'flexible_rect';
      //   case 6: 
      //     return 'quantization';
      //   case 7:
      //     return 'flexible_property';
      //   case 8:
      //     return 'facilitation';
      //   case 9: 
      //     return 'supportness';
      //   case 10:
      //     return 'friendly';
      //   case 11:
      //     return 'willingness';
      //   case 12:
      //     return 'best';
      //   case 13:
      //     return 'improve';
      //   case 14:
      //     return 'general';
      // }
    }
    return 'wrong';
  }

  Info.getQuestionNum = function(){
    return this.basicinfolist.length + this.questionlist.length + this.subjectlist.length;
  }

  Info.clearFeedback = function(){
    g_Feedback = {};
  }
  return Info;
}

var g_FeedBackInfo = new FeedBackInfo();

function collectFeedback(){

  if($('#feedback_div').length != 0)
    return;

	// alert('Collect Feedback');
 var feedback_div = document.createElement('div');
  feedback_div.id = 'feedback_div';
  $('body')[0].appendChild(feedback_div);

  $('#feedback_div').css({   
      background: 'rgba(0, 0, 0, 0.8)',
      left: '0px',
      top: '0px',
      width: '100%',
      height: '100%',
      position: 'fixed',
      'padding-top': '30px',
      'z-index': g_FrontZIndex + 3,
  });

  $('#feedback_div').on('click', function(){
    $(this).remove();
  })

  //add the questionaire
  showQuestionaire();
}

function showQuestionaire(){
 var queshtml = '<div class="col-md-12" id="ques_panel_div"></div>';
  var compiled = _.template(queshtml);
  //show_other_button, , feedback_button, exit_2_button

  var feedback_div = document.getElementById('feedback_div');
  var basesize = 0;

  $('#feedback_div').html(compiled());
  $('#ques_panel_div').css({   
        width: '80%',
	    background: 'white',
	    height: '80%',
	    'margin-left': '10%',
	    'border-radius': '5px',
	    'overflow-y': 'scroll',
  });

  $('#ques_panel_div').on('click', function(event){    
      event.stopPropagation();
  })


  //title
  var testDiv = document.getElementById('ques_panel_div');  

  var titlehtml = '<div class="row" style=" font-size: 20px; text-align: center; font-weight: 700;"><p>Feedback of Interaction+</p></div>';
  //</p><p style="margin:0px"> 
  var titlecom = _.template(titlehtml);
  testDiv.innerHTML = testDiv.innerHTML + titlecom({}); 


  //add question
  var basicinfolist = g_FeedBackInfo.getBasicUserInfoList();
  // [
  // 'Name',
  // 'Field',
  // 'Background',
  // 'Title',
  // 'Affiation'];

  var basicoptionlist = {
    0: USER,
    1: 'Academe/Industry',
    2: 'VIS/CHI/...',
    3: 'Faculty/Student/...',
  };


  for (var i = 0; i < basicinfolist.length; i++) {
  	var question = basicinfolist[i];
    var options = basicoptionlist[i];
    if(options == undefined)
      options = '';

    var questionhtml = '<div class="row question_radio_row"><label id=<%=questionid%> class="label_feedback"><%=question%></label><input style="width: 200px" id=<%=inputid%> placeholder=<%=inputhint%>></div>';
  	var quescom = _.template(questionhtml);
  	testDiv.innerHTML = testDiv.innerHTML + quescom({
  		questionid: 'question_' + i,
  		question: question,
      inputid: 'answer_' + i,
      inputhint: options,
  	});	
  };

  basesize += basicinfolist.length;

  // var intro= "Please indicate your level of satisfaction: 4 - Excellent, 3 - Good, 2 - Satisfactory, 1 - Poor";
  var temphtml = '<div class="row question_radio_row" style="font-size:14px"><p style="margin:0px">Please indicate your level of agreement:  1 - strongly agree, 2 - agree, 3 - neutral, 4 - disagree, 5 - strongly disagree, </p></div>';
  //</p><p style="margin:0px"> 
  var tempcom = _.template(temphtml);
  testDiv.innerHTML = testDiv.innerHTML + tempcom({}); 

  //subjective question
  var questionlist = g_FeedBackInfo.getSatisfyQuestionList();
  // [    
  //   "The visual interface of dd-on Filter is friendly.",
  //   "Add-on Filter facilitates the data exploration.",
  //   "I would like to recommend Add-on Filter to others.",
  // ];

  for (var i = 0; i < questionlist.length; i++) {
  	var question = questionlist[i];
  	var questionhtml = '<div class="row question_radio_row"><div class="col-md-6 question_row_subject" id=<%=questionid%> ><%=question%></div><div class="col-md-6"><div class="btn-group" data-toggle="buttons" id=<%=answerid%>><label class="btn btn-default question_radio" agree="1" ><input type="radio" class="like1” value="1" name=<%=quality%> > 1</label><label class="btn btn-default question_radio" agree="2" ><input type="radio" class="like2” value="2" name=<%=quality%> > 2</label><label class="btn btn-default question_radio" agree="3" ><input type="radio" class="like3” value="3" name=<%=quality%> > 3</label><label class="btn btn-default question_radio" agree="4" ><input type="radio" class="like4” value="4" name=<%=quality%> > 4</label><label class="btn btn-default question_radio" agree="5" ><input type="radio" class="like5” value="5" name=<%=quality%> > 5</label></div></div></div>';
  	// var questionhtml = '<div class="row question_radio_row"><div class="col-md-6 question_row_subject" id=<%=questionid%> ><%=question%></div><div class="col-md-6"><div class="btn-group" data-toggle="buttons" id=<%=answerid%>><label class="btn btn-default question_radio" agree="1" ><input type="radio" class="like1” value="1" name=<%=quality%>/> 1</label><label class="btn btn-default question_radio" agree="2" ><input type="radio" class="like2” value="2" name=<%=quality%>/> 2</label><label class="btn btn-default question_radio" agree="3" ><input type="radio" class="like3” value="3" name=<%=quality%>/> 3</label><label class="btn btn-default question_radio" agree="4" ><input type="radio" class="like4” value="4" name=<%=quality%>/> 4</label><label class="btn btn-default question_radio" agree="5" ><input type="radio" class="like5” value="5" name=<%=quality%>/> 5</label></div></div></div>';
    
    var quescom = _.template(questionhtml);
    var testDiv = document.getElementById('ques_panel_div');	
	  testDiv.innerHTML = testDiv.innerHTML + quescom({
  		questionid: 'question_' + (basesize + i),
  		question: question,
  		quality: "quality_" + (basesize + i),
      answerid: 'answer_' + (basesize + i),
  	});	
  };

  basesize += questionlist.length;

  //textarea
  var subjectlist = g_FeedBackInfo.getSubjectQuestionList();
  // [
  // 'What does Add-on Filter impress your the most?',
  // 'If there were one thing we could improve Add-on Filter, what would that be?',
  // // 'How can we improve the Add-on Filter?',
  // 'General comments',
  // ];

  for (var i = 0; i < subjectlist.length; i++) {
    var question = subjectlist[i];
    var questionhtml = '<div class="row question_radio_row"><div class="col-md-6 question_row_subject" id=<%=questionid%> ><%=question%></div><div class="col-md-6"><textarea id=<%=answerid%> style="font-size:10px; width:95%; height:50px; margin-top:5px"></textarea></div></div>';
    var quescom = _.template(questionhtml);
    var testDiv = document.getElementById('ques_panel_div');  
    testDiv.innerHTML = testDiv.innerHTML + quescom({
      questionid: 'question_' + (basesize + i),
      question: question,
      answerid: 'answer_' + (basesize + i),
      // quality: "quality_" + (basesize + i),
    }); 
  };

  basesize += subjectlist.length;

  //submit button
  var buttonhtml = '<div class="row question_radio_row"><button type="button" id = "submit_feedback" class="btn btn-default">Submit</button></div>';
  var buttoncom = _.template(buttonhtml);
  // var testDiv = document.getElementById('ques_panel_div');	
  testDiv.innerHTML = testDiv.innerHTML + buttoncom();
  $('#submit_feedback').on('click', function(){
  	submitFeedback();
  	$('#feedback_div').remove();
  });
}

function submitFeedback(){
	//todo
  g_FeedBackInfo.clearFeedback();

  //collect the answers
  var iQuestionNum = g_FeedBackInfo.getQuestionNum();
  for (var i = 0; i < iQuestionNum; i++) {
    var question = g_FeedBackInfo.getQuestionbyIndex(i);
    var shortquestion = g_FeedBackInfo.getQuestionShortName(i);
    var answer = getAnswer(i);
    g_Feedback[shortquestion] = answer;
    // //console.log(' question ', question, ' answer ', answer);
  };
  // //console.log(' g_Feedback ', g_Feedback);


  //save to db
  var url = 'http://vis.pku.edu.cn/addonfilter_server/submitFeedback';

  var data = {    
    feedback: g_Feedback,
  };

  $.ajax({
    url:url, 
    data:JSON.stringify(data), 
    type:"POST", 
    success: function(response){
      //console.log(' success !', response);
    },
    // contentType: "application/json",
    dataType: "jsonp",
    jsonpCallback:"feedbackOfFeedbackSubmission",
    // contentType: "application/json;charset=utf-8",
    "crossDomain":true
  });
}

function feedbackOfFeedbackSubmission(){
  //console.log(" submit feedback success !");
}

function getAnswer(iIndex){
  var answer = "";
  var questiontype = g_FeedBackInfo.getQuestionType(iIndex);
  var answerid = 'answer_' + iIndex;
  switch(questiontype){
    case 'basicinfo':   
    case 'subjectquestion':
      answer = $('#' + answerid).val();
      // answer = $('#' + answerid).val();
      break;
    case 'radioquestion':
      var checkradio = $(':checked', $('#' + answerid).children());
      //console.log(" check radio ", checkradio);
      if(checkradio.length > 0){
        answer = $(':checked', $('#' + answerid).children()).parent('label')[0].getAttribute('agree');
      }
        // answer = checkradio[0].getAttribute('name');
      //console.log(' answer ', answerid, answer);
      // var checklabel = $('.active', '#' + answerid)[0];
      // if(checklabel != undefined)
      //   answer = checklabel.getAttribute('agree')
      break;
  }
  //console.log(' answer ', iIndex, answer);
  return answer;
}



