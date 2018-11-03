// Navigation library
// Intercepts link clicks and handle's navigating to a new page on local site
// Passes in the pathname and link parameteres to defined handler;
var pageMeta = require('../app/initializers.js');
var watch = require('./globalWatchers.js');

var history = [];

var pageHandler;
var init = function(handler) {
	pageHandler = handler;
	var url, params;
	// Start Listening
	$( "body" ).on( "click", "a[href]", function(e) {
		if($(e.currentTarget).attr("href") != "#" && e.currentTarget.host == window.location.host) {
			e.preventDefault();
			url = e.currentTarget.pathname;
			params = e.currentTarget;
			navigate(url)
		}
	});

	var ori = $(".navigation-transitions").attr('class');
	$(".navigation-transitions").find(".helper, .main").on('webkitAnimationStart onanimationstart msAnimationStart animationstart', function(e) {
		watch.processing.add();
    });
    $(".navigation-transitions").find(".helper, .main").on('webkitAnimationEnd onanimationend msAnimationEnd animationend', function(e) {
		watch.processing.end();
		pageHandler(url, getParams(params));
   		$(".navigation-transitions").attr('class', ori);
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

var navigate = function(url) {
	var naviEle = $('.navigation-transitions');
	var targetRoot = pageMeta.isRoot(url);
	var curPage = history[history.length - 1];
	if (targetRoot) {
		if(!curPage || pageMeta.isRoot(curPage)) {
			// new roots
			naviEle.addClass('animate newRoot');
		} else {
			//Backspaced
			naviEle.addClass('animate backspace');
		}
		history = [url];
	} else {
		if (!pageMeta.isRoot(curPage)) {
			// Replace child
			history[history.length - 1] = url;
			naviEle.addClass('animate replaceChild');
		} else {
			// AddChild
			history.push(url);
			naviEle.addClass('animate addChild');
		}	
	}
}

var backButton = function() {
	if(history.length > 1) {
		helpers.linkNavigation(history[history.length - 2]);
	}
}


module.exports = {
	init: init,
	backButton: backButton
}