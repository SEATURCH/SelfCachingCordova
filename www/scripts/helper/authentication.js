var cache = require('./cached.js');
var req = require('../requests.js');

module.exports = {
    currentUserId: currentUserId,
    unauthenticate: unauthenticate,
    authenticate: authenticate
}


var currentUserId = 1;

var deviceId = 1;

var authenticate = function(){
	return 1;
}

var unauthenticate = function(){
	return 1;
}