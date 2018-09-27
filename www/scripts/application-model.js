var req = require('./requests.js');
var cache = require('./helper/cached.js');
var authentication = require('./helper/authentication.js');

function viewModel(initialData) {
    var self = this;
    self.dataList = ko.observable();
    self.previewItem = ko.observable(null);
    self.openedItem = ko.observable(null);
    self.config = null;
    self.orientation = null;
}

appendPrototype(viewModel, {
    logout: function(data) {
        return authentication.unauthenticate.then(function(){
        });
    },
    upload: function(data) {
        return req.upload(data).then(function(){
        });
    },
    download: function() {
        return req.download().then(function() {
        });
    },
    sortList: function(data) {

    },
    dataFromCache: function (data) {
        var self = this;
        var uId = authentication.currentUserId;
    }
});

module.exports = {
    viewModel: viewModel
}

function ApplicationDataModel(data, map) {
    var self = this;
    $.extend(self, ko.mapping.fromJS(data.data, map));
    self.status = ko.observable();
}
