//require('./helper/reqs.js');
var ko =  require('knockout');
var applicationMapping = require('./application-model.js');

var vm = new applicationMapping.viewModel();
window.viewModel = vm;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        ko.applyBindings(viewModel);
        viewModel.getInit();
        console.log('Received Event: ' + id);
    }
};

app.initialize();