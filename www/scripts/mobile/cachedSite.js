var Promise = require('bluebird');
var $ = require('jquery');

// Assume only need 1 file of each, concat all incoming of type;
var defaultFileName = "app";
var itemExtMimes = {
    html: "app.html",
    js: "app.js",
    css: "app.css",
    json: "app.json"
};
var versionFile = "version.txt";

var writeFile = function (fs, fileName, contentBlob, isReplace) {
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
    var cacheLocation = 'd';//(window.cordova.platformId == 'android') ? cordova.file.dataDirectory : cordova.file.documentsDirectory;
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
    return new Promise(function(res, rej){
        return resolveFSHandle().then(function(fs) {
            res(Object.keys(itemExtMimes).forEach(function (key) {
                var fileName = defaultFileName + '.' + key;
                readFile(fs, fileName);
            }));
        })
    }).catch(function (d) {
        console.log("Cannot read applciation from cache");
        rej(d);
    });
}

var readVersion = function () {
    return new Promise(function(res, rej){
        return resolveFSHandle().then(function (fs) {
            res(readFile(fs, versionFile));
        });
    }).catch(function (d) {
        console.log("Cannot read applciation version");
        rej(d);
    });
}

var clearCache = function () {
    return new Promise(function (res, rej) {
        return resolveFSHandle().then(function (fs) {
            res(Object.keys(itemExtMimes).forEach(function (key) {
                var fileName = defaultFileName + '.' + key;
                dataObj = new Blob([''], { type: itemExtMimes[key] });
                writeFile(fs, fileName, dataObj, false);
            }));
        });
    }).catch(function (d) {
        console.log("Cannot read applciation version");
        rej(d);
    });
}

// Save's 
var saveCache = function (fileType, contentString) {
    return new Promise(function (res, rej) {
        return resolveFSHandle().then(function (fs) {
            var fileName = defaultFileName + '.' + fileType;
            var dataObj = new Blob([contentString], { type: itemExtMimes[fileType] });
            res(writeFile(fs, fileName, dataObj, true));
        })
    }).catch(function (d) {
        console.log("Cannot cache "+ fileType +" file");
        rej(d);
    });
}

module.exports = {
    readCached: readCached,
    readVersion: readVersion,
    saveCache: saveCache
}