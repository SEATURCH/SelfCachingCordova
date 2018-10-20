var cache = require('./cached.js');
var req = require('../requests.js');

var uuidv4 = require('uuid/v4');

var curId = null;
var currentUserId = function(){
	if(curId != null) return Promise.resolve(curId);
	return cached.readAuth().then(function(res){
		curId = res;
		return curId;
	})
}

var authenticate = function(username, pwd){
	var deviceId = window.device.uuid;
	return cached.saveAuth("").then(function(res) {
		console.log("Unauthenticated successfully");
	});
	return 1;
}

var unauthenticate = function(){
	return cached.saveAuth("").then(function(res) {
		console.log("Unauthenticated successfully");
	});
}

module.exports = {
    currentUserId: currentUserId,
    unauthenticate: unauthenticate,
    authenticate: authenticate
}