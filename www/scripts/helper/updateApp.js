// AutoUpdate of Android
var cached = require('./cached.js');
var req = require('../requests.js');

var runApk = function(localPath) {
	window.plugins.webintent.startActivity({
			action: window.plugins.webintent.ACTION_VIEW, 
			url: localPath, 
			type: 'application/vnd.android.package-archive' 
	 	}, 
	 	function () {}, 
	 	function (e) {
      		alert('Failed to open URL via Android Intent.');
	 	} 
	); 
}

