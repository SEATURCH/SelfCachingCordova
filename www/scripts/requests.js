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

var sampleData = function () {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Sample", {}); });
};

var dynamicLookups = function(param) {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Lookups", param ); });
}

var deviceAuthenticate = function(param) {
    return netCheck().then(function(){ return powertech.post(domain + "/Template/Lookups", param ); });
}

var postTo = function (url, data) {
    return netCheck().then(function(){ return powertech.post(domain + url, data); });
};

var getFrom = function (url, data) {
    return netCheck().then(function(){ return powertech.getJSON(domain + url); });
};

module.exports = {
	getTemplates: getTemplates,
	getVersion: getVersion,
	dynamicLookups: dynamicLookups,
	sample: sampleData,
	getFrom: getFrom,
	postTo: postTo
}