var cache = require('./helper/cached.js');

var appModel = require('./application-model.js');

window.viewmodel = new appModel.viewModel();
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
            window.config = rsrc.json;
            if(window.config) window.configMapping = parse(window.config);
            return viewmodel.initPageVM();
        }).then(function(){
            ko.applyBindings(viewmodel);
        }).catch(function() {
            console.log("Application not initialized. Please make sure the app is loaded at least once with internet access");            
            // alert("Application not initialized. Please make sure the app is loaded at least once with internet access");            
        });
        console.log('Received Event: ' + id);
    }
};

app.initialize();