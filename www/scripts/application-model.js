var req = require('./requests.js');
var cache = require('./helper/cached.js');
var authentication = require('./helper/authentication.js');
var uuidv4 = require('uuid/v4');
var db = require('./helper/lookupDB.js');


function viewModel(initialData) {
    var self = this;
    self.authentication = authentication;

    self.dataList = ko.observableArray();
    self.previewItem = ko.observable(null);
    self.openedItem = ko.observable(null);

    self.definitions = null;
    self.lookups = null;
    self.pageConfig = null;
    self.pageFramework = null;

    self.selectedController = ko.observable();
    self.selectedController.subscribe(function(value) {
        self.initPage(value);
    });
}

appendPrototype(viewModel, {
    logout: function(data) {
        return authentication.unauthenticate.then(function() {
        });
    },
    upload: function(dat) {
        var self = this;
        var postProm = [];
        var dataList = ko.mapping.toJS(self.dataList);
        var endpnts = dataList.reduce(function(col, cur){
            if(col.indexOf(cur.framework.Submit) == -1) col.push(cur.framework.Submit);
            return col;
        }, []);        
        endpnts.forEach(function(url){
            var data = dataList.filter(function(d){ return d.framework.Submit == url; })
                .map(function(d){ return d.data; });
            postProm.push(req.postTo(url, {data: data} ));
        });
        return Promise.all(postProm).then(function(res) {
            console.log("Successful Upload");
        });
    },
    download: function() {
        var self = this;
        return req.download().then(function(res) {
            var mappedList = [];
            res.forEach(function(dataModel){
                mappedList.push(new ApplicationDataModel(dataModel.data, self.pageFramework.getDataManager(dataModel.action)));
            });
            self.dataList(mappedList);
        });
    },
    addNew: function() {

    },
    sortList: function(sortParams) {

    },
    getDataFromCache: function () {
        var self = this;
        var uId = authentication.currentUserId;
        return cache.readData().then(function(cached) {
            var mappedList = cached.map(function(dataModel){
                return new ApplicationDataModel(dataModel.data, self.pageFramework.getDataManager(dataModel.Action), dataModel.AppUUID);
            });
            self.dataList(mappedList);
        }).then(function(){
            var dataModel = {
                "DtoTypeName": "Inspection",
                "Id": 0,
                "VehicleId": 1,
                "Date": "0001-01-01T00:00:00",
                "Location": null,
                "intd": 0,
                "ProjectNumber": null,
                "Vehicle": {
                    "DtoTypeName": "Vehicle",
                    "Id": 1,
                    "Name": "Test Truck",
                    "ManufactureModel": null,
                    "VehicleNumber": null,
                    "SerialNumber": null,
                    "Hours": 15,
                    "VehicleType": 1,
                    "DateModified": "2018-10-05T20:22:47.523"
                },
                "ComponentInspections": null
            };
            var sample = new ApplicationDataModel(dataModel, self.pageFramework.getDataManager({Key: "Inspections", Value: "Create"}));
            self.dataList([sample]);
            
        })
    },
    saveDataToCache: function(){
        var self = this;
        var uId = authentication.currentUserId;
        var data = ko.mapping.toJS(self.dataList());
        if(!data.length) return;
        return cache.saveData(
            data.map(function(item){ return {
                AppUUID: item.AppUUID,
                Action: item.framework.Action,
                data: item.data
            }
        }));
    },
    initPage: function(container) {
        var self = this;
        var controller = self.pageConfig.find(function(pg){ return pg.Name == container; });
        if(controller) {
            return dataManager.getAllEnums(controller.PageDefinitions).then(function(dynmLkps) {
                $.extend(self.lookups, dynmLkps);
                initMappings(self.definitions, self.lookups);
                return self.getDataFromCache();
            }).catch(function(s){
                if(VERBOSE) console.log(s);
                if(VERBOSE) console.log("Error in starting page - configurations missing or out of date. Please resrtart app with internet to re-initialize");
            });
        }
    }
});


function ApplicationDataModel(data, dataManager, AppUUID) {
    var self = this;
    self.AppUUID = AppUUID || uuidv4();
    self.framework = dataManager;
    self.PageId = dataManager.Action.Key + dataManager.Action.Value;
    self.data = defaultMap(data);
        
    sessionScripts.run("pageViewModels", self.PageId, self);
}


// CommunicationsManager - window level definition used in by library /dto/dtoFramework.js
// Required for all root level viewmodels
var InitComMngr = function(vm) {
    return {
        submitData: function(url, data) {
            // this is the current applicationDataModle (dataManager target) that is saving
            this.data.deepComplete();
            return vm.saveDataToCache();
        }
    }
}

module.exports = {
    viewModel: viewModel,
    InitComMngr: InitComMngr
}