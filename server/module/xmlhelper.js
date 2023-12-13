var XmlHelper = function () {
  var _arrayTypes = {};
  var _self = this;
  /*
   *转换对象为xml
   *@obj 目标对象
   *@rootname 节点名称
   *@arraytypes 配置数组字段子元素的节点名称
   */
  this.parseToXML = function (obj, rootname, arraytypes) {
    if (arraytypes) {
      _arrayTypes = arraytypes;
    }
    var xml = "";
    if (typeof obj !== "undefined") {
      if (Array.isArray(obj)) {
        xml += parseArrayToXML(obj, rootname);
      } else if (typeof obj === "object") {
        xml += parseObjectToXML(obj, rootname);
      } else {
        xml += parseGeneralTypeToXML(obj, rootname);
      }
    }
    return xml;
  };
  var parseObjectToXML = function (obj, rootname) {
    if (typeof rootname === "undefined" || !isNaN(Number(rootname))) {
      rootname = "Object";
    }
    var xml = "<" + rootname + ">";
    if (obj) {
      for (var field in obj) {
        var value = obj[field];
        if (typeof value !== "undefined") {
          if (Array.isArray(value)) {
            xml += parseArrayToXML(value, field);
          } else if (typeof value === "object") {
            xml += _self.parseToXML(value, field);
          } else {
            xml += parseGeneralTypeToXML(value, field);
          }
        }
      }
    }
    xml += "</" + rootname + ">";
    return xml;
  };
  var parseArrayToXML = function (array, rootname) {
    if (typeof rootname === "undefined" || !isNaN(Number(rootname))) {
      rootname = "Array";
    }
    var xml = "<" + rootname + ">";
    if (array) {
      var itemrootname = _arrayTypes[rootname];
      array.forEach(function (item) {
        xml += _self.parseToXML(item, itemrootname);
      });
    }
    xml += "</" + rootname + ">";
    return xml;
  };
  var parseGeneralTypeToXML = function (value, rootname) {
    if (typeof rootname === "undefined" || !isNaN(Number(rootname))) {
      rootname = typeof value;
    }
    var xml = "<" + rootname + ">" + value + "</" + rootname + ">";
    return xml;
  };
};
module.exports = XmlHelper