/*
	ToolBarManager: manage the function in toolbar
*/

function ToolBarManager(){
	var Info = {};

	Info.__init__ = function(){
		//console.log(" init toolbar manager ");
		this.m_bSelectEnable = false;
		this.m_bLineUp = false;
		this.m_bVLineUp = false; this.m_bHLineUp = false;
		this.m_bMask = false;  //the rectangluar select
		this.m_MaskTypeList = ["rect", "tabular", 'radial', 'vparalell', 'hparallel', "none"];
		this.m_bRectM = false; this.m_bTabularM = false; this.m_bRadialM = false; this.m_bVParaM = false; this.m_bHParaM = false;
		Info.m_ToolBarRender = new ToolBarRender();

		this.m_bLinearBrush = false;
	}

	Info.setMaskFalse = function(){
		this.m_bRectM = false; this.m_bTabularM = false; this.m_bRadialM = false; this.m_bVParaM = false; this.m_bHParaM = false;
	}

	Info.setLinearBrush = function(){
		this.m_bLinearBrush = true;
	}

	Info.setLineUpFalse = function(){
		this.m_bLineUp = false; this.m_bVLineUp = false; this.m_bHLineUp = false;
	}

	//~~~~~ API ~~~~~~~~//
	Info.addFloatPanel = function(){
		this.m_ToolBarRender.addFloatPanel();
	}

	Info.setSelectEnable = function(bEnable){
		this.setMaskFalse();
		this.m_bSelectEnable = bEnable;
	}

	Info.setVLineupEnable = function(bEnable){
		this.setLineUpFalse();
		this.m_bLineUp = bEnable;
		this.m_bVLineUp = bEnable;
	}

	Info.setHLineupEnable = function(bEnable){
		this.setLineUpFalse();
		this.m_bLineUp = bEnable;
		this.m_bHLineUp = bEnable;
	}

	Info.setVParallelMaskEnable = function(bEnable){
		this.setMaskFalse();
		this.m_bSelectEnable = bEnable;
		this.m_bMask = bEnable;
		this.m_bVParaM = bEnable;
	}

	Info.setHParallelMaskEnable = function(bEnable){
		this.setMaskFalse();
		this.m_bSelectEnable = bEnable;
		this.m_bMask = bEnable;
		this.m_bHParaM = bEnable;
	}

	Info.setRectMaskEnable = function(bEnable){
		this.setMaskFalse();
		this.m_bSelectEnable = bEnable;
		this.m_bMask = false;
		this.m_bRectM = bEnable;
	}

	Info.setRadialMaskEnable = function(bEnable){
		this.setMaskFalse();
		this.m_bSelectEnable = bEnable;
		this.m_bMask = bEnable;
		this.m_bRadialM = bEnable;
	}

	Info.isSelectEnable = function(){
		return this.m_bSelectEnable;
	}

	Info.isLineUpEnable = function(){
		return this.m_bLineUp;
	}

	Info.isVLineUpEnable = function(){
		return this.m_bVLineUp;
	}

	Info.isHLineUpEnable = function(){
		return this.m_bHLineUp;
	}

	Info.isMaskEnable = function(){
		return this.m_bMask;
	}

	Info.isRadialMaskEnable = function(){
		//console.log(" wwww 2 ", this.m_bMask, this.m_bRadialM);
		return this.m_bMask && this.m_bRadialM;
	}

	Info.isVMaskEnable = function(){
		return this.m_bMask && this.m_bVParaM;
	}

	Info.isHMaskEnable = function(){
		return this.m_bMask && this.m_bHParaM;
	}

	Info.isLinearBrush = function(){
		return this.m_bLinearBrush;
	}

	// Info.isMaskEnable = function(){
	// 	return this.m_bMask;
	// }

	Info.getMaskType = function(){
		if(this.m_bRectM)
			return this.m_MaskTypeList[0];
		if(this.m_bTabularM)
			return this.m_MaskTypeList[1];
		if(this.m_bRadialM)
			return this.m_MaskTypeList[2];
		if(this.m_bVParaM)
			return this.m_MaskTypeList[3];
		if(this.m_bHParaM)
			return this.m_MaskTypeList[4];
		return this.m_MaskTypeList[5];
	}

	Info.__init__();

	return Info;
}

