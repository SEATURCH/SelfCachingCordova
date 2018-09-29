var cache = require('./cached.js');
var req = require('../requests.js');

var uuidv4 = require('uuid/v4');


var currentUserId = "S";

var deviceId = 1;

var authenticate = function(){
	return 1;
}

var unauthenticate = function(){
	return 1;
}

module.exports = {
    currentUserId: currentUserId,
    unauthenticate: unauthenticate,
    authenticate: authenticate
}