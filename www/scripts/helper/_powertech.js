var Promise = require('bluebird');
var $ = require('jquery');

var defaultTimeout = 60000;


var getJSON = function (url, data, cache) {
    if (cache === null || cache === undefined)
        cache = false;
    return new Promise(function (resolve, reject) {
        $.ajax({
            dataType: "json",
            cache: cache,
            url: url,
            data: data,
            timeout: self.defaultTimeout,
            success: function (data) {
                resolve(data);
            },
            error: function (err) {
                reject(err);
            }
        });
    })
};

var post = function (url, data, blocking) {
    return new Promise(function (resolve, reject) {
        // var securityToken = document.getElementById("RequestValidationToken") ? document.getElementById("RequestValidationToken").value : null;
        $.ajax({
            type: "POST",
            url: url,
            data: data,
            // headers: { 'X-request-validation-token': securityToken },
            timeout: this.defaultTimeout,
            success: function (data) {
                resolve(data);
            },
            error: function (errorData) {
            	reject(errorData)
            }
        });
    });
}

var appendPrototype = function(constructor, properties) {
    for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
            constructor.prototype[prop] = properties[prop];
        }
    }
}


module.exports = {
	post: post,
	getJSON: getJSON,
	appendPrototype: appendPrototype
}