// Requests Api Page
var net = require('./helper/network.js');
var watch = require('./helper/globalWatchers.js');
var domain = "http://10.21.10.104:59360";

var checkWrapper = function(pro) {
    if (net.checkConnection()) {
        watch.processing.add();
        return pro.finally(function(){
            watch.processing.end();
        });
    }
    return Promise.reject().catch(function(){
        alert("No internet access.");
    });
}

var getTemplates = function () {
	return checkWrapper(powertech.post(domain + "/Template/Templates", {}) );
};
var getVersion = function () {
    return checkWrapper(powertech.post(domain + "/Template/Version", {}) );
};

var dynamicLookups = function(param) {
    return checkWrapper(powertech.post(domain + "/Template/Lookups", param ) );
}

var deviceAuthenticate = function(param) {
    return checkWrapper(powertech.post(domain + "/Template/Lookups", param ) );
}

// data= {files: [File, File, ..] }
var postFiles = function (data) {
    return checkWrapper(powertech.postFile(domain + "/Files/UploadFiles", data ) );
};
var postFile = function (data) {
    return checkWrapper(powertech.postFile(domain + "/Files/Upload", data ) );
};

var postTo = function (url, data) {
    return checkWrapper(powertech.post(domain + url, data) );
};

var getFrom = function (url, data) {
    return checkWrapper(powertech.getJSON(domain + url) );
};

module.exports = {
	getTemplates: getTemplates,
	getVersion: getVersion,
	dynamicLookups: dynamicLookups,
	getFrom: getFrom,
	postTo: postTo,
	postFiles: postFiles
}