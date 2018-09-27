var cache = require('./helper/cached.js');

var applicationMapping = require('./application-model.js');
var vm = new applicationMapping.viewModel();

window.viewModel = vm;
window.pageviewmodel = {};
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
        window.powertech = new networkCall();
        initDtoTemplate();
        cache.retrieveResources().then(function(rsrc){
            $('body').append(rsrc.html);
            $('body').append('<script>' + (rsrc.js|| '') + '</script>');
            $('body').append('<style>' + (rsrc.css || '')  + '</style>');
        }).catch(function() {
            // alert("Application not initialized. Please make sure the app is loaded at least once with access to internet");
            console.log("Application not initialized. Please make sure the app is loaded at least once with access to internet");
        });
        ko.applyBindings(viewModel);
        viewModel.getInit();
        console.log('Received Event: ' + id);
    }
};

app.initialize();