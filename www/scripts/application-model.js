var ko = require('knockout');
require('knockout-mapping');
var $ = require('jquery');

var powertech = require('./helper/_powertech.js');
var defModels = require('./default-model-mapping.js');
var requests = require('./requests.js');


function viewModel(initialData) {
    var self = this;
    self.data = ko.observable();
    self.config = null;
    self.orientation = null;
}

powertech.appendPrototype(viewModel, {
    getInit: function (data) {
        var self = this;
        return requests.sample()
            .then(function(res){
                var mapping = defModels.parseMap(res.config, res.orientation);
                var mapped = new ApplicationDataModel(res, mapping);
                self.config = res.config;
                self.orientation = res.orientation;
                self.data(mapped);
        });
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
