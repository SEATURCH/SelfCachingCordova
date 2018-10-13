var cache = require('./helper/cached.js');
var db = require('./helper/lookupDB.js');

var appModel = require('./application-model.js');
window.viewmodel = new appModel.viewModel();
window.VERBOSE = false;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("pause",  this.onDevicePause, false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    // Cleanup - save data to file and close db handle
    onDevicePause: function() {
        var cleanup = [db.close(), viewmodel.saveDataToCache()];
        return Promise.all(cleanup);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        window.rootLocation =cordova.file.externalApplicationStorageDirectory; // (window.cordova.platformId == 'android') ? cordova.file.dataDirectory : cordova.file.documentsDirectory;
        window.powertech = new networkCall();
        initDtoTemplate();

        Promise.all([cache.retrieveResources(), db.updateDB()]).then(function(result){
            var rsrc = result[0];
            $('body').append(rsrc.html);
            $('body').append('<style>' + (rsrc.css || '')  + '</style>');

            // $('body').append('<script>' + (rsrc.scripts|| '') + '</script>');
            var pageViewModels = {}, knockoutScripts= {};
            eval(rsrc.scripts);
            Object.keys(pageViewModels).forEach(function(page){ sessionScripts.add('pageViewModels', page, pageViewModels[page]); })
            Object.keys(knockoutScripts).forEach(function(knock){ sessionScripts.add('knockoutScripts', knock, knockoutScripts[knock]); })

            viewmodel.pageConfig = rsrc.pages;
            viewmodel.pageFramework = new pagesDataManager(rsrc.pages);
            viewmodel.definitions = rsrc.config;
            viewmodel.lookups = rsrc.enumLookups;
            
            window.communicationManager = appModel.InitComMngr(viewmodel);
            ko.applyBindings(viewmodel);

            // Physically pick Inspections/Create
            return viewmodel.selectedController("Inspections");
        }).catch(function(err) {
            if(VERBOSE) console.log(err);
            console.log("Error in initialization. Please make sure the app is loaded at least once with internet access");
            // alert("Application not initialized. Please make sure the app is loaded at least once with internet access");
        });;
    }
};

app.initialize();