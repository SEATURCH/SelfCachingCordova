var req = require('../requests.js');

var db = null;
var cachedLkps = {};

var resolveDatabase = function() {
	var name = BuildInfo.basePackageName + ".db" ;
	var dbLocation = rootLocation + "db";

	// var openConfig = window.cordova.platformId == 'android' ?
	// 	{ name: name, location: dbLocation } : { name: name, iosDatabaseLocation: 'default' };

	return new Promise(function(res, rej) {
		if(db) res(db);
		else
			window.sqlitePlugin.openDatabase({ name: name, location: 'default' }, function(result){
				db = result;
				window.db = db;
				res(db);
			});
	});
}

// sqlQueries can be a single entry or an array of sql queries and values
// ex: sqlQueries = { query: 'INSERT INTO MyTable VALUES ?', values: ['test-value'] }
// ex: sqlQueries = [{ query: 'INSERT INTO MyTable VALUES ?', values: ['test-value'] }] 
var executeQuery = function(args) {
	var args = Array.isArray(args)? args : [args];
	return new Promise(function(re, rj){
		resolveDatabase().then(function(db){
			if(!args.length) re();
			db.transaction(function(tx){
				var execute = [];
				args.forEach(function(arg){
					execute.push(new Promise(function(res, rej) {
						tx.executeSql(arg.query, arg.values || [], function(tr, rs) {
					    	res({ tr: tr, rs: rs });
					    }, function(s, h){
					    	if(VERBOSE) console.log(h.message)
					    	rej(new Error(h.message));
					    });
					}));
				});
				Promise.all(execute).then(function(result){
					re(result);
				});
			});
			
		});
	});
}

var databaseQueries = function(query) {
	var q = {
		version_create: "CREATE TABLE IF NOT EXISTS Versions (Key integer primary key, Date text)",
		version_check: "SELECT Date from Versions where Key = 1",
		version_replace: "INSERT OR REPLACE INTO Versions(Key, Date) Values (1, ?)",
		createTable: function(tableName) {
			return "CREATE TABLE IF NOT EXISTS " + tableName + ` (
				Key integer primary key,
			    Value text,
			    Code text,
			    Data text
			);`
		},
		dropTable: function(tableName){
			return "DROP TABLE IF EXISTS " + tableName ;
		},
		upsert: function(table, columns) {
			var valParams = "(" + Array.from(new Array(columns.length)).map(function(i) {return "?";}).join(',') + ")";
			return "INSERT OR REPLACE INTO " + table + "(" + columns.join(',') +") VALUES " + valParams;
		},
		delete: function(tableName){
			return "DELETE FROM " + tableName + " WHERE Id = ?;"
		},
		getEnum: function(tableName){
			return "SELECT * FROM " + tableName;
		}
	}
	return q[query];
}

// tables can be a single entry or an array of tables to create
// ex: name
// ex: [name, name1]	
var createTable = function (tables) {
	var queryParam = function(tableName){
		var query = databaseQueries('createTable')(tableName);
		return { query: query };
	}
	tables = (Array.isArray(tables)) ? tables : [tables];
	var params = tables.map(function(table){ return queryParam(table); });

	return executeQuery(params).then(function(res) {
		if(VERBOSE) console.log("Created tables: " + tables);
  		return res;
	})
}

// tables can be a single string entry of table name or an array of names of tables to drop
// ex: "DropThisTable"
// ex: ["DropThisTable", "DropThatTable"]
var dropTable = function (tables) {
	var queryParam = function(tableName){
		var query = databaseQueries("dropTable")(tableName);
		return { query: query };
	}
	var params = [];
	tables = (Array.isArray(tables)) ? tables : [tables];
	params = tables.map(function(table){ return queryParam(table); });

	return executeQuery(params).then(function(res) {
		if(VERBOSE) console.log("Dropped table: " + tables);
  		return res;
	});
}

// data is object of where key is the lookup property and value is the array of property entries
// ex: {
// 		Table; [
//			{
//		 		Key: (int),
//		 	    Value: (string),
//	 	    	Display: (string),
//	 		}, 
//	 		{...}
// 		],
//		Table2: [...]
// 	}
var upsertEntries = function (data){
	var queryParam = function(table, propertyEntry){
		var columns = Object.keys(propertyEntry);
		var pre = databaseQueries("upsert")(table, columns);
		var values = columns.map(function(i) {
			if(i == "Data") return JSON.stringify(propertyEntry[i]);
			return propertyEntry[i];
		});
		return { query: pre, values: values };
	}
	var params = [];
	var tables = Object.keys(data);
	tables.forEach(function(table){
		if(data[table].length) {
			var propertyEntries = data[table];
			params = params.concat(propertyEntries.map(function(prop){
				return queryParam(table, prop);
			}));	
		}
	});
	
	return executeQuery(params).then(function(res) {
		if(VERBOSE) console.log("Upserted tables: " + tables.join(', '));
		tables.forEach(function(tbl){ delete cachedLkps[tbl]; });
  		return res;
	});
}

// data can be a single entry or an array of entries
// ex: {tableName: name, Id: rowId }
// ex: [{...},{...}]
var removeEntries = function (data){
	var queryParam = function(item) {
		var query = databaseQueries("delete")(item.tableName);
		return { query: query, values: [item.Id] };
	}
	var params = [];
	data = (Array.isArray(data)) ? data : [data];
	params = data.forEach(function(item){ return queryParam(item); });
	
	return executeQuery(params).then(function(res) {
		if(VERBOSE) console.log("Upserted table: " + tables);
  		return res;
	});
}

var close = function(){
	if(db){
		return new Promise(function(res, rej) {
			db.close(function(s){
				db = null;
				res(s)
			}, rej);
		});	
	}
}

// data can be a single string of property or an array of strings
// ex: targetNum
// ex: [ targetNum, targetNum2 ]
var getEnums = function(data) {
	var queryParam = function(table) {
		var query = databaseQueries("getEnum")(table);
		return { query: query };
	}
	var params = [];
	var existing = {};
	var search = [];
	data = (Array.isArray(data)) ? data : [data];
	data.forEach(function(d) {
		if(cachedLkps.hasOwnProperty(d)) existing[d] = cachedLkps[d];
		else search.push(d);
	});
	params = data.map(function(item){ return queryParam(item); });
	
	if(search.length == 0) return Promise.resolve(existing);
	else 
		return executeQuery(params).then(function(pRes) {
	    	search.forEach(function(got, idx){
	    		existing[got] = [];
	    		var res = pRes[idx];
				for (var x = 0; x < res.rs.rows.length; x++) {
					var lkp = res.rs.rows.item(x);
					lkp.Data = JSON.parse(lkp.Data)
		           	existing[got].push(lkp);
		       	}
	    	});
	    	$.extend(cachedLkps, existing);
	        if(VERBOSE) console.log("Retrieved lookup for enum: " + search);
	        return existing;
		});
}

var updateDB = function() {
	var params = [ {query: databaseQueries('version_create')}, {query: databaseQueries("version_check")} ];
	return executeQuery(params).then(function(pRes) {
		return pRes[1].rs.rows.item(0);
	}).then(function(date) {
		if(VERBOSE) console.log("Retrieving udpates since date");
		return req.dynamicLookups({ lastUpdated: date ? date.Date : null });
	}).then(function(res){
		if(VERBOSE) console.log("Creating tables");
		return createTable(Object.keys(res.lookups)).then(function(){ return res.lookups; });
	}).then(function(res){
		if(VERBOSE) console.log("Updating properties");
		return upsertEntries(res);
	}).then(function(res) {
		if(VERBOSE) console.log("Updating version date");
		if(res) return executeQuery({query: databaseQueries('version_replace'), values: [(new Date).toISOString()]});
	}).catch(function(err){
		if(VERBOSE) console.log(err);
		return;
	});
}

module.exports = {
	executeQuery: executeQuery,
	createTable:createTable,
	dropTable:dropTable,
	removeEntries:removeEntries,
	
	upsertEntries:upsertEntries,
	getEnums: getEnums,
	updateDB: updateDB,
	close: close
}

window.dbQueries = {
	vehicleProps: "SELECT * FROM Vehicle",
	allTables: "SELECT name FROM sqlite_master"
}
window.checkTables = function(sss){
	return executeQuery({query: sss})
		.then(i => console.log(i))
}