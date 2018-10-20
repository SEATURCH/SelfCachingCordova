var req = require('../requests.js');
var cache = require('./cached.js');
var authentication = require('./authentication.js');
var uuidv4 = require('uuid/v4');
var db = require('./lookupDB.js');


function viewModel(initialData) {
    var self = this;
    self.authentication = authentication;

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
    upload: function(data, endpnt) {
        var self = this;
        return preq.postTo(endpnt, {data: data} );
    },
    download: function(endpnt) {
        var self = this;
        return req.getFrom(endpnt);
    },
    getDataFromCache: function (pathName) {
        var self = this;
        return cache.readFrom(pathName);
    },
    saveDataToCache: function(data){
        var self = this;
        return cache.saveto(d);
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


module.exports = {
    viewModel: viewModel
}