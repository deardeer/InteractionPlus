/*
  Define and configure mask:
*/

function RegionMask(){
  //LMTODO

  var Info = {};
  Info.m_maskType = {};
  ///normal, grid, table, radial
  Info.setMaskType = function(MaskType){
    var definedMask = {"normal": 1, "table": 2, "radial": 3, "grid": 4};
    this.m_maskType = definedMask[MaskType];
  }

  //get the defined mask type
  Info.getDefinedMask = function(){
    return this.m_maskType;
  }

  return Info;
}

var g_regionMask = new RegionMask();