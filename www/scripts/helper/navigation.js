// Navigation library
// Intercepts link clicks and handle's navigating to a new page on local site
// Passes in the pathname and link parameteres to defined handler;

var pageHandler;

var init = function(handler) {
	pageHandler = handler;
	// Start Listening
	$('html a[href]').filter(function(ind, dom){
		return $(dom).attr('href') != "#";
	}).on("click", function(e) {
		// Is local navigation
		if(e.currentTarget.host == window.location.host) {
			e.preventDefault();
			return pageHandler(e.currentTarget.pathname, getParams(e.currentTarget));
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

module.exports = {
	init: init
}