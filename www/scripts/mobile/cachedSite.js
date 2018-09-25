var Promise = require('bluebird');
var $ = require('jquery');

// Assume only need 1 file of each, concat all incoming of type;
var defaultFileName = "app";
var itemExtMimes = {
    html: "text/html",
    js: "application/javascript",
    css: "text/css",
    json: "application/json"
};
var versionFile = "version.txt";

var writeFile = function (fs, fileName, contentBlob, isAppend) {
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

                if (isAppend) {
                    try {
                        fileWriter.seek(fileWriter.length);
                    }
                    catch (e) {
                        console.log("file doesn't exist!");
                    }
                }
                fileWriter.write(contentBlob);
            });
        }, function(err){
            rej(new Error(err));
        });
    });
}

var readFile = function (fs, fileName) {
    return new Promise(function (res, rej) {
        fs.getFile(fileName, { create: false, exclusive: false }, function (fe) {
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

var readCached = function () {
    return resolveFSHandle().then(function(fs) {
        return new Promise(function(res, rej) {
            var promiseCache = [];
            Object.keys(itemExtMimes).forEach(function (key) {
                var fileName = defaultFileName + '.' + key;
                promiseCache.push(readFile(fs, fileName));
            })
            res(Promise.all(promiseCache).then(function(values){ return values; }));
        })
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
        throw d;
    });
}
var saveVersion = function (newVersion) {
    return resolveFSHandle().then(function (fs) {
        var dataObj = new Blob([newVersion.toString()], { type: "text/plain" });
        return writeFile(fs, versionFile, dataObj, false);
    }).catch(function (d) {
        console.log("Cannot cache applciation version");
        throw d;
    });
}

var clearCache = function () {
    return resolveFSHandle().then(function (fs) {
        return new Promise(function (res, rej) {
            var promiseCache = [];
            Object.keys(itemExtMimes).forEach(function (key) {
                var fileName = defaultFileName + '.' + key;
                var dataObj = new Blob([''], { type: itemExtMimes[key] });
                promiseCache.push(writeFile(fs, fileName, dataObj, false));
            });
            res(Promise.all(promiseCache).then(function(values){ return values; }));
        });
    }).catch(function (d) {
        console.log("Cannot read applciation version");
        throw d;
    });
}

// Save's 
var saveCache = function (fileType, contentString) {
    return new Promise(function (res, rej) {
        return resolveFSHandle().then(function (fs) {
            var fileName = defaultFileName + '.' + fileType;
            var dataObj = new Blob([contentString], { type: itemExtMimes[fileType] });
            return writeFile(fs, fileName, dataObj, true);
        });
    }).catch(function (d) {
        console.log("Cannot cache "+ fileType +" file");
        throw d;
    });
}

module.exports = {
    readCached: readCached,
    readVersion: readVersion,
    saveCache: saveCache,
    saveVersion: saveVersion
}