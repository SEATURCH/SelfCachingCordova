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

var get = function (url) {
    return new Promise(function (resolve, reject) {
        // var securityToken = document.getElementById("RequestValidationToken") ? document.getElementById("RequestValidationToken").value : null;
        $.ajax({
            type: "GET",
            url: url,
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
    var initCalls = ['/Templates']
    return get(domain).then(function(baseHTML) {
        var returnedHTML = $('<div>' + baseHTML + '</div>');
        // Intercept all ajax requests and replace local 
        returnedHTML.find('form').filter(function(i, item){
            var src = $(item).attr('action')
            return src && src.match(/^\//);
        }).map(function(d, item){
            var newAction = domain + $(item).attr('action');
            $(item).attr('action', newAction);
        })
        returnedHTML.ajaxSend(function(e, xhr, opt){
            opt.url =  "http://localhost:1260/"+ opt.url;
        });

        var siteJS = returnedHTML.find('script').filter(function( index, item ) {
            var src = $(item).attr('src');
            return src && src.match(/^\//);
        }).remove();
        var getJSPRomiseAll = Promise.all(siteJS.map(function(index, item) {
            return get(domain + $(item).attr('src'));
        }).toArray());

        var siteCSS = returnedHTML.find('link').filter(function( index, item ) {
            var src = $(item).attr('href');
            return $(item).attr('rel') == "stylesheet" && src && src.match(/^\//);
        }).remove();
        var getCSSPromiseAll = Promise.all(siteCSS.map(function(index, item) {
            return get(domain +  $(item).attr('href'));
        }).toArray());

        return Promise.all([getJSPRomiseAll, getCSSPromiseAll]).then(function(arrArr){
            var jsValues = arrArr[0].join('\n');
            var cssValues = arrArr[1].join('\n');

            return {
                html: returnedHTML.html(),
                js: jsValues,
                css: cssValues
            };
        })
    });
};

var getVersion = function () {
    return new Promise(function(r,j){
        r(Math.random());
    });
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