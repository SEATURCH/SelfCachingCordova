// Assume only need 1 file of each, concat all incoming of type;
var req = require('../requests.js');
var authentication = require('./authentication.js');
var net = require('./network.js');

var templateFileName = "app";
var itemExtMimes = {
    html: {ext: "html", mime: "text/html"},
    scripts: {ext: "js", mime: "application/javascript"},
    css: {ext: "css", mime: "text/css"},
    config: {ext: "json", mime: "application/json"},
    pages: {ext: "json", mime: "application/json"},
    enumLookups: {ext: "json", mime: "application/json"}
};
var versionFile = "version.txt";
var authFile = "auth.txt";
var dataFileName = "data.json";

var writeFile = function (fs, fileName, contentBlob) {
    return new Promise(function (res, rej) {
        fs.getFile(fileName, { create: true, exclusive: false }, function (fe) {
            fe.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function () {
                    res("Successful write");
                };
                fileWriter.onerror = function (e) {
                    if(VERBOSE) console.log("Failed file write: " + e.toString());
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
                if(VERBOSE) console.log("Unable to read File");
                rej(new Error(err));
            });
        }, function(err){
            rej(new Error(err));
        });
    });
}

var FileSys = {};
var resolveFSHandle = function(subdir){
    var children = subdir? subdir.split('/') : [];
    var cacheLocation = rootLocation + subdir;

    var getDir = function(currentFS, childrenDir){
        if(childrenDir.length == 0 ) return currentFS;
        else {
            return new Promise(function(res, rej) {
                var nextDir = childrenDir[0];
                currentFS.getDirectory(nextDir, { create: true }, function (dirEntry) {
                    childrenDir.shift();
                    res({dirEntry: dirEntry, childrenDir: childrenDir});
                }, function(err){
                    if(VERBOSE) console.log("Unable to resolve Local File System: " + nextDir);
                    rej(new Error(err));
                });
            }).then(function(fs){
                return getDir(fs.dirEntry, fs.childrenDir);
            });
        }
    }

    return new Promise(function (res, rej) {
        if(FileSys[cacheLocation]) res(FileSys[cacheLocation]);
        window.resolveLocalFileSystemURL(rootLocation, function (root) {
            res(root);
        }, function(err){
            if(VERBOSE) console.log("Unable to root File System. Set as: " + rootLocation);
            rej(new Error(err));
        });
    }).then(function(rootfs){
        return getDir(rootfs, children);
    }).then(function(targetfs){
        FileSys[cacheLocation] = targetfs;
        return targetfs;
    })

}


var readVersion = function () {
    return resolveFSHandle().then(function (fs) {
        return readFile(fs, versionFile);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot read applciation version");
        return "No Version";
    });
}
var saveVersion = function (newVersion) {
    return resolveFSHandle().then(function (fs) {
        var dataObj = new Blob([newVersion.toString()], { type: "text/plain" });
        return writeFile(fs, versionFile, dataObj);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot cache applciation version");
        throw d;
    });
}

var clearCache = function () {
    return resolveFSHandle().then(function (fs) {
        var promiseCache = [];
        Object.keys(itemExtMimes).forEach(function (key) {
            var fileName =  key + '.' + itemExtMimes[key].ext;
            var dataObj = new Blob([''], { type: itemExtMimes[key].mime });
            promiseCache.push(writeFile(fs, fileName, dataObj));
        });
        return Promise.all(promiseCache).then(function(values){ return values; });
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot read applciation version");
        throw d;
    });
}

// Save's 
var saveTemplates = function (retrieved) {
    return resolveFSHandle().then(function (fs) {
        var savePromises = Object.keys(retrieved).map(function(key){
            var fileName = key + '.' + itemExtMimes[key].ext;
            var dataObj = new Blob([JSON.stringify(retrieved[key])], { type: itemExtMimes[key].mime });
            return writeFile(fs, fileName, dataObj);
        });
        return Promise.all(savePromises);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot cache templates files");
        throw d;
    });
}

var readTemplates = function () {
    return resolveFSHandle().then(function(fs) {
        var promiseCache = [];
        Object.keys(itemExtMimes).forEach(function (key) {
            var fileName = key + '.' + itemExtMimes[key].ext;
            promiseCache.push(readFile(fs, fileName).then(function(res){
                return {type: key, value: res};
            }));
        })
        return Promise.all(promiseCache).then(function(values){
            return values.reduce(function(result, item) {
                result[item.type] = item.value? JSON.parse(item.value): "";
                return result;
            }, {});
        });
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot read applciation from cache");
        throw d;
    });
}


var retrieveResources = function() {
    if(net.checkConnection()) {
        return Promise.all([Math.random(), req.getVersion() ])
        // return Promise.all([readVersion(), req.getVersion() ])
        .catch(function(){
            return readTemplates();
        })
        .then(function(values){
            var newVersion = values[1];
            if(values[0] == values[1]) return readTemplates();
            else return req.getTemplates().then(function(retrieved) {
                return saveTemplates(retrieved).then(function() {
                    return saveVersion(newVersion);
                }).then(function(afterVersion){
                    return retrieved;
                });
            });
        });
    } else {
        return readTemplates();
    }
}

var readFrom = function(pathName) {
    var subdir = authentication.currentUserId;
    return resolveFSHandle(subdir).then(function(fs) {
        return readFile(fs, pathName);
    }).then(function(res) {
        return JSON.parse(res || "[]");
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot read " + pathName +" from '" + subdir + "' from cache");
        throw d;
    });
};

var saveTo = function(pathName, data) {
    var subdir = authentication.currentUserId;
    return resolveFSHandle(subdir).then(function (fs) {
        var dataObj = new Blob([JSON.stringify(data)], { type: "application/json" });
        return writeFile(fs, pathName, dataObj);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot save data '" + pathName + "' into '" + subdir + "' in cache");
        throw d;
    });
};


module.exports = {
    retrieveResources: retrieveResources,
    readFrom: readFrom,
    saveTo: saveTo
}
