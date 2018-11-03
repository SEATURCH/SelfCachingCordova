// Pageinitializers -- any "page" initailization/functionality required or specifc to mobile 
// Defines 2 functions init, postAttach that prepares the page onload and declares metadata to interact with top-leve controls (drawer/actionbar) or navigation after specific actions
// -- init: Web form requies initial data to run. Creates these on through JS and return to use in mapping
// -- postAttach: metadata and additional functions to bind against mapped viewmodel, essentailly mobile onlyt PageViewModel scripts 
var dm = require('../helper/dataManager.js');
var pm = require('../helper/pictureManager.js');
var req = require('../requests.js');

var endpts = {
	"/Inspections/Index": { 
		IsRoot: true,
		init: function() {
			return dm.get('Inspection');
		},
		postAttach: function(vm) {
			vm.UploadUrl = vm.framework.Controller.create.Post;
			vm.save = stdFormListSubmit;
			ko.unwrap(vm.data).forEach(function (insp) {
				var newUrl = '/Inspections/Edit?Id=' + (ko.unwrap(insp.Id) || ko.unwrap(insp.AppUUID) );
		        insp.naviLink(newUrl);
		    })
		}
	},
	"/Inspections/Edit": { 
		init: function(param) {
			return dm.get('Inspection').then(function(allInsp) {
				return allInsp.find(function(insp) {
					return param.Id == insp.Id || param.Id == insp.AppUUID;
				});
			});
		},
		postAttach: function(vm) {
		}
	},
	"/Inspections/Create": { 
		init: function(param) {
			stdFormSubmit();
			return dm.get("Vehicles").then(function(res){
				var newInsp = defaultMap(null, "Inspection");
				var targetVehicle = $.extend({}, res.Vehicles.find(function(veh) { return veh.Key == param.vehicleId }));
				newInsp.Vehicle = defaultMap(targetVehicle.Data);
				newInsp.VehicleId =  param.vehicleId;
				return new dm.DataModel(null, ko.mapping.toJS(newInsp));
			});
		},
		postAttach: function(vm) {
			var baseSave = vm.save;
			vm.save = function() {
				baseSave().then(function(s) {
					helpers.linkNavigation("/Inspections/Index");
				});
			}
		}
	}
}


// Assumes the page is a single form with submitting data through .save defined on PageViewmodels script
var stdFormSubmit = function() {
	window.communicationManager = {
	    submitData: function(url, data) {
	        this.data.deepComplete();
	        return dm.write(ko.unwrap(this.data.DtoTypeName), ko.mapping.toJS(this.data), ko.unwrap(this.data.AppUUID));
	    }
	}
}

// Standard DefaultEditablemodel list submission 
var stdFormListSubmit = function() {
	var self = this;
    var dataList = ko.unwrap(self.data);
    if(!Array.isArray(dataList)) dataList = [dataList];
    var allImages = dataList.reduce(function(col, cur){ return col.concat(cur.crawlType('FileData')); }, [])
        .filter(function(imgDef){ return !ko.unwrap(imgDef.Id) });

    return pm.uploadImages(allImages).then(function(newPicsInfo) {
    	newPicsInfo.forEach(function(info, idx){
    		allImages[idx].Id(info.Id);
    	});
        dataList = ko.mapping.toJS(dataList);
        return req.postTo(self.UploadUrl, {data: dataList} )
    }).then(function(res) {
        console.log("Successful Upload");
    	var saveProm = [];
    	dataList.forEach(function(up){
        	saveProm.push(dm.write(ko.unwrap(up.DtoTypeName), ko.mapping.toJS(up), ko.unwrap(up.AppUUID)));
    	});
    	return Promise.all(saveProm);
    });
}

module.exports = {
	initPage: function(url, param) {
		return endpts[url].init(param);
	},
	postAttach: function(url, vm) {
		return endpts[url].postAttach(vm);
	},
	isRoot: function(url) {
		var rt = (endpts[url] || {}).IsRoot ? true: false ;
		return rt;
	}
}