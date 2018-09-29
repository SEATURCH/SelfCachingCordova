var req = require('./requests.js');
var cache = require('./helper/cached.js');
var authentication = require('./helper/authentication.js');
var uuidv4 = require('uuid/v4');


function viewModel(initialData) {
    var self = this;
    self.dataList = ko.observable();
    self.previewItem = ko.observable(null);
    self.openedItem = ko.observable(null);
    self.config = window.config;
}

appendPrototype(viewModel, {
    logout: function(data) {
        return authentication.unauthenticate.then(function() {
        });
    },
    upload: function(data) {
        return req.upload(data).then(function() {
        });
    },
    download: function() {
        var self = this;
        return req.download().then(function(res) {
            var mappedList = [];
            res.forEach(function(dataModel){
                mappedList.push(new ApplicationDataModel(dataModel, configMapping[dataModel.DtoTypeName]));
            });
            self.dataList(mappedList);
        });
    },
    addNew: function() {

    },
    dataFromCache: function () {
        var self = this;
        var uId = authentication.currentUserId;
        return cache.readData().then(function(cached) {
            var mappedList = [];
            cached.forEach(function(dataModel){
                mappedList.push(new ApplicationDataModel(dataModel, configMapping[dataModel.DtoTypeName]));fdo
            });
            self.dataList(mappedList);
        });
    },
    sortList: function(sortParams) {

    },
    initPageVM: function() {
        var self = this;
        self.config = window.config;
        self.mapping = window.mapping
        return self.dataFromCache();
    }
});

module.exports = {
    viewModel: viewModel
}

function ApplicationDataModel(data, map) {
    var self = this;
    $.extend(self, ko.mapping.fromJS(data, map));
    self.AppUUID = self.AppUUID || uuidv4();
}