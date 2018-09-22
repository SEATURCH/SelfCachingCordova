var Promise = require('bluebird');
var $ = require('jquery');
var defaultTimeout = 60000;

var domain = "http://10.21.10.104:1260";

var post = function (url, param) {
    return new Promise(function (resolve, reject) {
        // var securityToken = document.getElementById("RequestValidationToken") ? document.getElementById("RequestValidationToken").value : null;
        $.ajax({
            type: "POST",
            url: url,
            data: param,
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
};

var initData = function () {
    return post(domain, {});
};
var getVersion = function () {
    return post(domain + "/Version", {});
};

function checkConnection() {
    var networkState = navigator.connection.type;

    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    if (Connection.NONE == networkState) return false;

    return true;
}

module.exports = {
    initData: initData,
    getVersion: getVersion,
    checkConnection: checkConnection
}