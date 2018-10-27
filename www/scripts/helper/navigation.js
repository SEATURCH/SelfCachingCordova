// Navigation library
// Intercepts link clicks and handle's navigating to a new page on local site
// Passes in the pathname and link parameteres to defined handler;
var pageMeta = require('../app/initializers.js');

var history = [];

var pageHandler;
var init = function(handler) {
	pageHandler = handler;
	// Start Listening
	$( "body" ).on( "click", "a[href]", function(e) {
		if($(e.currentTarget).attr("href") != "#" && e.currentTarget.host == window.location.host) {
			e.preventDefault();
			var url = e.currentTarget.pathname;
			return Promise.all([
				navigate(url),
				pageHandler(url, getParams(e.currentTarget)) ]);
		}
	});
}

var getParams = function (anchorDom) {
	var params = {};
	var query = anchorDom.search.substring(1);
	var vars = query.split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

var navigate = function(isroot, url) {
	return new Promise(function(res, rej) {
		var targetRoot = pageMeta.isRoot(url);

		var curPage = history[history.length - 1];
		if(targetRoot){
			if(curPage == url) {
				//Backspaced

			} else { 
				// new roots
			}
			history = [url];
		} else {
			if (!pageMeta.isRoot(curPage)) {
				history[history.length - 1] = url;
				// Replace child
			} else {
				history.push(url);
				// Backspace
			}	
		}
	})
}

var backButton = function() {
	if(history.length > 1) {
		history.pop();
		helpers.linkNavigation(history[history.length -1]);
	}
}


module.exports = {
	init: init
}