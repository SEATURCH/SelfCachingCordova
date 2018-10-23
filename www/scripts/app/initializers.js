// Pageinitializers
var dm = require('../helper/dataManager.js');

var endpts = {
	"/Inspections/Index": function() {
		return dm.get('Inspection');
	},
	"/Inspections/Create": function(param) {
		var newInsp = defaultMap(null, "Inspection");
		var targetVehicle = $.extend({}, dm.get("Vehicle").find(function(veh) { return veh.Id == param.vehicleId }));
		newInsp.Vehicle = defaultMap(targetVehicle.Data);
		return newInsp;
	}
}

module.exports = {
	initPage: function(url, param) {
		return Promise.resolve(endpts[url](param));
	}
}