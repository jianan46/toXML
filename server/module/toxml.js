const _ = require("lodash");
const XmlHelper = require("./xmlhelper");
const xmlhelper = new XmlHelper()
const os = require('os');

module.exports = {
  toXML: function (content) {
    const formated = format(content);
    const transformed = transform(formated);
    return transformed;
  },
};

function format(raw) {
  return _.trim(_.trim(raw, os.EOL));
}

function transform(formated) {
  const items = formated.split(os.EOL);
  let res = "";
  for (let item of items) {
    res += itemHandler(item);
  }
  return res;
}

function itemHandler(item) {

  const details = item.replace(/\s/g,' ').split(" ");
  const mapMapping = {
    enabled: details[0],
    sourceLocation: locationHandler(details[1]),
    destLocation: locationHandler(details[2]),
    preserveHostHeader: false,
  };
  return xmlhelper.parseToXML(mapMapping, "mapMapping");
}

function locationHandler(location) {
  const obj = {};
  const isHttps = location.slice(4).startsWith("s");
  obj.protocol = isHttps ? "https" : "http";
  let step = isHttps ? 8 : 7;
  location = advance(location, step); //'127.0.0.1'
  step = location.indexOf(":");
  if (step > -1) {
    obj.host = location.substring(0, step);
    location = advance(location, step + 1); //'8080'
  }
  step = location.indexOf("/");
  if(step < 0){
    obj.host = location;
    return obj
  }

  if (obj.host) {
    obj.port = location.substring(0, step);
    location = advance(location, step);
    obj.path = location;
    return obj;
  }
  obj.host = location.substring(0, step);
  location = advance(location, step);
  obj.path = location;
  return obj;
}

function advance(string, n) {
  return string.substring(n);
}


