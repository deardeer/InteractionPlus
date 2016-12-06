//build up the tree structure among elements

function EleTree(){

	var Info = new Object;

	//structure
	Info.liEle = [];
	Info.mapPareEleChildEle = {};
	Info.mapChildElePareEle = {};

	//insert a ele
	Info.insertEle = function(ele){		
		var iIndex = this.mapIndexEle.length;
		this.mapIndexEle.push(ele);
		return iIndex;
	}

	//insert a ele in the tree
	Info.insertEleToTree = function(ele, parentele){
		//get parent ele 
		// var parentele = ele.parentElement;
		//update the parent 
		var childlist = [];
		if(this.mapPareEleChildEle[parentele] != undefined){
			childlist = this.mapPareEleChildEle[parentele];
		}
		childlist.push(ele);
		this.mapPareEleChildEle[parentele] = childlist;
		//update the child
		this.mapChildElePareEle[ele] = parentele;
		//console.log('INSERT ELE ', ele, 'parent ele', parentele, 'mapPareEleChildEle', this.mapPareEleChildEle);
	}

	Info.printTree = function(){
		//console.log("mapPareEleChildEle!!", this.mapPareEleChildEle);
		// var pareEles = Object.keys(this.mapPareEleChildEle);
		for(pareEle in this.mapPareEleChildEle){
			//console.log('PP', pareEle, "ChildList", this.mapPareEleChildEle[pareEle]);
		}
	}

	Info.getParentEle = function(childEle){
		return pareEle;
	}
	Info.getChildEles = function(pareEle){
		return childEles;
	}

	Info.clear = function(){
		this.mapIndexEle = {};
		this.mapPareEleChildEle = {};
		this.mapChildElePareEle = {};
	}

	return Info;
}

var g_EleTree = new EleTree;

//build up the tree given elements
// function buildupTree(elements){

// 	var tree = new EleTree;	
	
// 	//


// 	return tree;
// }