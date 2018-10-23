// Datamanager for mobile
// Abstraction level for lookup data stored insdie the db and static data stored in file system.
// Static data are any root level dto items that any given page may display
// Retrieves and stores statics in cache and coordinates with lookups cache
// NOTE: not the same dataManager used to coordinate page adn endpoint definitions

var db = require('./lookupDB.js');
var cached = require('./cached.js');
var staticCache = {};

function DataModel(AppUUID, dto, data) {
	var self = this;
	self.dto = dto;
    self.AppUUID = AppUUID || uuidv4();
    self.data = data;
}

var get = function(table) {
	if (allEnums.indexOf(table) >= 0) {
		db.getEnums(table);
	} else {
		if (staticCache.hasOwnProperty(table)) {
			return Promise.resolve(staticCache[table]);
		} else {
			return cached.readFrom(table).then(function(data){
				staticCache[table] = data;
				return data;
			});
		}
	}
}

var write = function(table, AppUUID, data) {
	if (allEnums.indexOf(table) >= 0) {
		var upsert = {};
		upsert[table] = [data];
		db.upsertEntries(upsert);
	} else {
		var currentSet = get(table);
		var existingIndex = currentSet.findIndex(function(cur) { return cur.AppUUID == AppUUID; });
		if (existingIndex != -1) currentSet.splice(existing, 1, data);
		else currentSet.push(data);
	}
}

var allEnums = [];
var initializePage = function(currentPgDef){
	var dynmEnums = currentPgDef.reduce(function(collect, current) {
        var newLkp = current.LookupProperties.filter(function(d){ return allEnums.indexOf(d) >= 0 && collect.indexOf(d) == -1; });
        return collect.concat(newLkp);
    }, []);
	return db.getEnums(dynmEnums);
}

var startUp = function(){
	return Promise.all([cached.retrieveResources(), db.updateDB()]).then(function(result){
        var rsrc = result[0];
        var pgConfig = rsrc.pages;
        if(pgConfig) {
			var allpages = pgConfig.map(function(pg) { return pg.PageDefinitions; })
				.reduce(function(collect, current) { return collect.concat(current); }, []);
			allEnums = allpages.reduce(function(collect, current) {
		        var newLkp = current.LookupProperties.filter(function(d){ return !rsrc.enumLookups.hasOwnProperty(d) && collect.indexOf(d) == -1; });
		        return collect.concat(newLkp);
		    }, []);
	    }
        return rsrc;
	});
}

// Only save the staticCache items since on write of db items, it is already an upsert. 
var cleanUp = function(saveOnly) {
	if(!saveOnly) var promiseAll = [db.close()];
	Object.keys(staticCache).forEach(function(table){
		promiseAll.push(cached.saveTo(table, staticCache[table]));
	});
	return Promise.all(promiseAll);
}

module.exports = {
	get: get,
	write: write,
	initializePage: initializePage,
	startUp: startUp,
	cleanUp: cleanUp
}



