// Requests Api Page
var net = require('./helper/network.js');
var domain = "http://10.21.10.104:59360";

var netCheck = function() {
	return new Promise(function(res, rej) {
		if(net.checkConnection()) res();
		else rej();
	}).catch(function(){
		alert("No internet access.");
	})
}
var getTemplates = function () {
	return netCheck().then(function(){ return powertech.post(domain + "/Template/Templates", {}); });
};
var getVersion = function () {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Version", {}); });
};

var postTo = function (url, data) {
    return netCheck().then(function(){ return powertech.post(domain + url, data); });
};

var download = function () {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/SampleData", {}); });
};

var sampleData = function () {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Sample", {}); });
};

var dynamicLookups = function(param) {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Lookups", param ); });
}

module.exports = {
	getTemplates: getTemplates,
	getVersion: getVersion,
	download: download,
	postTo: postTo,
	dynamicLookups: dynamicLookups,
	sample: sampleData
}