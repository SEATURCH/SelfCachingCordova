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

var getFileHandle = function(fs, fname) {
    return new Promise(function (res, rej) {
        fs.getFile(fileName, { create: true, exclusive: false }, function (fe) {
            res(fe);
        }, function(err){
            rej(new Error(err));
        });
    });
}

var moveFile = function(destFs, fname, uri) {
    return new Promise(function (res, rej) {
        window.resolveLocalFileSystemURL(uri, function (fe) {
            fe.moveTo(destFs, fname, function(result) {
                res(result.nativeURL);
                // res("Successful file move");
            })
        }, function(err){
            rej(new Error(err));
        })
    });
}

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
    var cacheLocation = rootLocation
    if(subdir) cacheLocation += subdir.join('/');

    var getDir = function(currentFS, childrenDir){
        if(!childrenDir || childrenDir.length == 0 ) return currentFS;
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

    if(FileSys[cacheLocation]) return Promise.resolve(FileSys[cacheLocation]);
    else 
        return new Promise(function (res, rej) {
            if(FileSys[rootLocation]) res(FileSys[rootLocation]);
            else {
                window.resolveLocalFileSystemURL(rootLocation, function (root) {
                    res(root);
                }, function(err){
                    if(VERBOSE) console.log("Unable to root File System. Set as: " + rootLocation);
                    rej(new Error(err));
                });
            }
        }).then(function(rootfs){
            return getDir(rootfs, subdir);
        }).then(function(targetfs){
            FileSys[cacheLocation] = targetfs;
            return targetfs;
        });
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
            var newVersion = values[1].Version;
            if(values[0] == newVersion) return readTemplates();
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
};

var FileSys = {};
var parsePath = function(pathname){
    var subdir = authentication.currentUserId()
    var route = pathname.split('/');
    route = [subdir].concat(route.filter(function(f) { return f; }));
    return {
        subdir: route.slice(0, route.length - 1),
        file: route[route.length - 1]
    };
}


// Data json handlers
var readFrom = function(pathString) {
    var pathing = parsePath(pathString);
    return resolveFSHandle(pathing.subdir).then(function(fs) {
        return readFile(fs, pathing.file);
    }).then(function(res) {
        return JSON.parse(res || "[]");
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot read " + pathing.file +" from '" + subdir + "' from cache");
        throw d;
    });
};

var saveTo = function(data, pathString) {
    var pathing = parsePath(pathString);
    return resolveFSHandle(pathing.subdir).then(function (fs) {
        var dataObj = new Blob([JSON.stringify(data)], { type: "application/json" });
        return writeFile(fs, pathing.file, dataObj);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot save data '" + pathing.file + "' into '" + subdir + "' in cache");
        throw d;
    });
};

var moveTo = function(uri, pathString) {
    var pathing = parsePath(pathString);
    return resolveFSHandle(pathing.subdir).then(function (fs) {
        return moveFile (fs, pathing.file, uri);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot save data '" + pathing.file + "' into '" + subdir + "' in cache");
        throw d;
    });
}

var getFile = function(pathString) {
    var pathing = parsePath(pathString);
    return resolveFSHandle(pathing.subdir).then(function (fs) {
        return getFile(fs, pathing.file);
    }).catch(function (d) {
        if(VERBOSE) console.log("Cannot get file handle for '" + pathing.file + "' in '" + subdir + "' in cache");
        throw d;
    });
}

module.exports = {
    retrieveResources: retrieveResources,
    readFrom: readFrom,
    saveTo: saveTo,
    moveTo: moveTo,
    getFile: getFile
}
