// PicturesManager
// Managees dto fileEntry to physical file location
var cache = require('./cached.js');
var uuidv4 = require('uuid/v4');
var requests = require('../requests.js');

function ImageInfo(path, id, name, type) {
	var self = this;
	self.Url = path;
	self.Id = id;
	self.FileName = name;
	self.FileType = type;
}

var mapPath = '/Pictures/map.json';

var picturesCache = null;
var map = function() {
	if (!picturesCache) {
		return cache.readFrom(mapPath).then(function(data){
    		data = JSON.parse(data || "[]");
			picturesCache = data;
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
			var fname = uuidv4() + '.jpeg';
			var ftype = 'JPEG';
			var pathname = '/Pictures/' + fname;
			imgPromises.push(cache.moveTo(uri, pathname));

			return Promise.all(imgPromises).then(function(result) {
				var newImage = new ImageInfo(result[1], null, fname, ftype);
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
	if (!ImgDefs.length) return Promise.resolve([]);
    var imagePaths = ImgDefs.map(function(img){ return ko.unwrap(img.Url) });
    return map().then(function(cachedPics) {
		var newPicsInfo = picturesCache.filter(function(c){ return imagePaths.indexOf(c.Url) >= 0 });
		if(newPicsInfo.length != imagePaths.length) throw new Error("Error!	An target image does not exist in pictures cache");

		return Promise.all(newPicsInfo.map(function(info) { return cache.readFrom(info.Url, "ArrayBuffer"); })).then(function(fileABs) {
			var filesBlob = fileABs.map(function(ab){ return new Blob([ab], {type: "image/jpeg"}); })
			var formData = new FormData();
	        filesBlob.forEach(function (blob, idx) { formData.append('files', blob, newPicsInfo[idx].FileName); });
        	// formData.append('files', files);
			return requests.postFiles(formData);
		}).then(function(added){
			newPicsInfo.forEach(function(item, idx) {
				item.Id = added[idx].Id;
			});
			return newPicsInfo;
			// return "("+added.length+") Pictures Uploaded"
		}); 
	});
}

var cleanUp = function(saveOnly) {
	if(picturesCache)
	return cache.saveTo(JSON.stringify(picturesCache || []), mapPath, "application/json");
}


module.exports = {
	getImagePath: getImagePath,
	addImage: addImage,
	uploadImages: uploadImages,
	cleanUp: cleanUp
}