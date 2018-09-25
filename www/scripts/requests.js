// Requests Api Page
var powertech = require("./helper/_powertech.js");

var domain = "http://10.21.10.104:1260";
domain = "https://jsonplaceholder.typicode.com/todos/1";


var initData = function () {
    return powertech.post(domain + "/Init", {});
};

var sampleConfig = require('./sampleConfig.json');
var sampleData = require('./sampleData.json');
var sampelOrientation = require('./sampleOrientation.json');
var sample = function () {
    console.log(1111);
	return new Promise(function(res, rej){
		powertech.getJSON(domain)
	    .finally(function(result) {
            res({
                orientation:sampelOrientation,
	            config:sampleConfig,
	            data: sampleData
	        });
	    });	
	});
    
};

module.exports = {
	sample: sample
}