// Assume only need 1 file of each, concat all incoming of type;
var req = require('../requests.js');

var defaultFileName = "app";
var itemExtMimes = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json"
};
var versionFile = "version.txt";

var writeFile = function (fs, fileName, contentBlob) {
    return new Promise(function (res, rej) {
        fs.getFile(fileName, { create: true, exclusive: false }, function (fe) {
            console.log("fileEntry is file?" + fe.isFile.toString());
            fe.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    res("Successful write");
                };
                fileWriter.onerror = function (e) {
                    console.log("Failed file write: " + e.toString());
                    rej(new Error(e));
                };
                fileWriter.write(contentBlob);
            });
        }, function(err){
            rej(new Error(err));
        });
    });
}

var readFile = function (fs, fileName) {
    return new Promise(function (res, rej) {
        fs.getFile(fileName, { create: true, exclusive: false }, function (fe) {
            fe.file(function (file) {
                var reader = new FileReader();
                reader.onload = function (e) {
                    var data = e.target.result;
                    res(data);
                };
                reader.readAsText(file);
            }, function(err){
                console.log("Unable to read File");
                rej(new Error(err));
            });
        }, function(err){
            rej(new Error(err));
        });
    });
}

var fs = null;
var resolveFSHandle = function(){
    var cacheLocation = cordova.file.externalApplicationStorageDirectory; //(window.cordova.platformId == 'android') ? cordova.file.dataDirectory : cordova.file.documentsDirectory;
    return new Promise(function (res, rej) {
        if(fs) resolve(fs);
        window.resolveLocalFileSystemURL(cacheLocation, function (fs) {
            console.log('file system open: ' + fs.name);
            res(fs);
        }, function(err){
            console.log("Unable to resolve Local File System");
            rej(new Error(err));
        });
    })

}

var readCachedResources = function () {
    return resolveFSHandle().then(function(fs) {
        var promiseCache = [];
        Object.keys(itemExtMimes).forEach(function (key) {
            var fileName = defaultFileName + '.' + key;
            promiseCache.push(readFile(fs, fileName).then(function(res){
                return {type: key, value: res};
            }));
        })
        return Promise.all(promiseCache).then(function(values){
            return values.reduce(function(result, item) {
                result[item.type] = item.value;
                return result;
            }, {});
        });
    }).catch(function (d) {
        console.log("Cannot read applciation from cache");
        throw d;
    });
}

var readVersion = function () {
    return resolveFSHandle().then(function (fs) {
        return readFile(fs, versionFile);
    }).catch(function (d) {
        console.log("Cannot read applciation version");
        return "No Version";
    });
}
var saveVersion = function (newVersion) {
    return resolveFSHandle().then(function (fs) {
        var dataObj = new Blob([newVersion.toString()], { type: "text/plain" });
        return writeFile(fs, versionFile, dataObj);
    }).catch(function (d) {
        console.log("Cannot cache applciation version");
        throw d;
    });
}

var clearCache = function () {
    return resolveFSHandle().then(function (fs) {
        var promiseCache = [];
        Object.keys(itemExtMimes).forEach(function (key) {
            var fileName = defaultFileName + '.' + key;
            var dataObj = new Blob([''], { type: itemExtMimes[key] });
            promiseCache.push(writeFile(fs, fileName, dataObj));
        });
        return Promise.all(promiseCache).then(function(values){ return values; });
    }).catch(function (d) {
        console.log("Cannot read applciation version");
        throw d;
    });
}

// Save's 
var saveCache = function (fileType, contentString) {
    return resolveFSHandle().then(function (fs) {
        var fileName = defaultFileName + '.' + fileType;
        var dataObj = new Blob([contentString], { type: itemExtMimes[fileType] });
        return writeFile(fs, fileName, dataObj);
    }).catch(function (d) {
        console.log("Cannot cache "+ fileType +" file");
        throw d;
    });
}

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

var retrieveResources = function() {
    if(checkConnection()){
        return Promise.all([readVersion(), req.getVersion() ])
        .catch(function(){
            return readCachedResources();
        })
        .then(function(values){
            var newVersion = values[1];
            if(values[0] == values[1]) return readCachedResources();
            else
                return req.getTemplates().then(function(retrieved){
                    var savePromises = Object.keys(retrieved).map(function(key){
                        return saveCache(key, retrieved[key]);
                    });
                    savePromises.push(saveVersion(newVersion))
                    return Promise.all(savePromises).then(function(d){
                        return retrieved;
                    });
                }); 
        })
    } else {
        return readCachedResources();
    }
}

var getCachedData = function() {

}

var saveCachedData = function() {

}

module.exports = {
    retrieveResources: retrieveResources,
    getCachedData: getCachedData,
    saveCachedData: saveCachedData
}