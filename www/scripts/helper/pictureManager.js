// PicturesManager
// Managees dto fileEntry to physical file location
var cache = require('./cached.js');
var uuidv4 = require('uuid/v4');
var requests = require('../requests.js');

function ImageInfo(path, id) {
	var self = this;
	self.Url = path;
	self.Id = id;
}

var mapPath = '/Pictures/map.json';

var picturesCache = null;
var map = function() {
	if (!picturesCache) {
		return cache.readFrom(mapPath).then(function(res){
			picturesCache = res;
			return picturesCache;
		});
	}
	return Promise.resolve(picturesCache);
}


var getImagePath = function(identifier) {
	return map().then(function(cachedPics){
		var found = picturesCache.find(function(entries){
			if(entries.Id) return entries.Id == identifier;
			return entries.Url == identifier;
		});
		return (found || {}).Url;
	});
}

// source: Camera.PictureSourceType[PHOTOLIBRARY, CAMERA, SAVEDPHOTOALBUM]
var addImage = function(source) {
	return new Promise(function(res, rej){
		var imgPromises = [ map() ];
		navigator.camera.getPicture(function(uri){
			var pathname = '/Pictures/' + uuidv4() + '.jpeg';
			imgPromises.push(cache.moveTo(uri, pathname));

			return Promise.all(imgPromises).then(function(result) {
				var newImage = new ImageInfo(result[1], null);
				result[0].push(newImage);
				res(newImage);
			});
		}, function(err){
			if(!(err == "Selection cancelled." || err == "Camera cancelled.")) rej(new Error(err));
		}, {
			sourceType:source,
			correctOrientation: true
		})
	});
}

var uploadImages = function(ImgDefs){
    var imagePaths = allImages.map(function(img){ return img.Path });
	return map().then(function(cachedPics) {
		var newPicsInfo = picturesCache.filter(function(c){ return targetPaths.indexOf(c.Url) >= 0 });
		if(newPicsInfo.length != imagePaths.length) throw new Error("Error!	Image does not exist in pictures cache");

		return Promise.all(newPicsInfo.map(function(info) { return cache.getFile(info.Path); })).then(function(files) {
			return requests.postFiles({files: files });
		}).then(function(added){
			newPicsInfo.forEach(function(item, idx) {
				newPicsInfo.Id = added[idx].FileDataId;
				ImgDefs.FileDataId(added[idx].FileDataId);
			});
			return "("+added.length+") Pictures Uploaded"
		}); 
	});
}

var cleanUp = function(saveOnly) {
	if(picturesCache)
	return cache.saveTo(picturesCache || [], mapPath);
}


module.exports = {
	getImagePath: getImagePath,
	addImage: addImage,
	uploadImages: uploadImages,
	cleanUp: cleanUp
}