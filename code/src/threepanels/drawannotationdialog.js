function AnnotationDialog(iId, InObj){
	var Info = new Object;

	Info.__init__ = function(iId, InObj){
		this.m_iId = iId;
		this.m_InObj = InObj;
		this.m_ObjectPanelDivId = "object_p_" + this.m_iId;
		this.m_AnnotationDiaId = 'annotationdia_' + this.m_iId;
		this.m_AnnotationInputId = "annotation_input_" + this.m_iId;
	}

	Info.addAnnotationDialog = function(){

		var self = this;

		var dialoghtml = 
		'<div id=<%=dialogId%> title="Annotation" hidden="hidden">'+
			'<div>'+
				'<input id=<%=annotationinput%> style="width:50%;"></input>'+
			'</div>'+
		'</div>';

		var compiled = _.template(dialoghtml);

		console.log(" object panel ", self.m_ObjectPanelDivId);

		testDiv = document.getElementById(self.m_ObjectPanelDivId);
		// //console.log("")
		
		testDiv.innerHTML = testDiv.innerHTML + compiled({
			dialogId: self.m_AnnotationDiaId,
			annotationinput: self.m_AnnotationInputId,			
		});	

		$("#" + self.m_AnnotationDiaId).dialog({
			autoOpen: false,
			dialogClass: 'dialog_panel',
		    buttons: {
		        "Ok": function(){
		        	self.annotate(true);
		            $(this).dialog("close");
		       		$('#' + self.m_AnnotationInputId)[0].value = "";
		       		self.clear();
		       	 },
		       	"Cancel": function(){
		       		self.annotate(false);
		       		//console.log(" [0] Cancel");
		       		$('#' + self.m_AnnotationInputId)[0].value = "";
		       		self.clear();
		       		$(this).dialog('close');
		       		//console.log(" [1] Cancel");
		       	}
	    	}
		});
	}

	Info.openAnnotationDialog = function(){	
		var self = this;
		self.clear();
		$('#' + self.m_AnnotationDiaId).dialog('open');
	}

	Info.clear = function(){
		//console.log(" clear !!! ");
	}

	Info.annotate = function(bAnnotation){
		var self = this;
		var annotationText = $('#' + self.m_AnnotationInputId)[0].value;
		console.log(" annotate !", annotationText);
		self.m_InObj.addAnnotation(bAnnotation, annotationText);
	}

	Info.__init__(iId, InObj);
	return Info;
}