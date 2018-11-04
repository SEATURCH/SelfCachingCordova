var dm = require('./helper/dataManager.js');
var pm = require('./helper/pictureManager.js');
var updateApp = require('./helper/updateApp.js');
var navi = require('./helper/navigation.js');
var net = require('./network.js');
var req = require('../requests.js');

// var appModel = require('./application-model.js');
var appModel = require('./helper/rootvm.js');
window.viewmodel = new appModel.viewModel();
window.VERBOSE = false;

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        document.addEventListener("pause",  this.onDevicePause, false);
        document.addEventListener("backbutton", function(){
            if($("#webModal").hasClass('show')) $("#webModal").modal('hide');
            else  navi.backButton();
        }, false);
    },
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },
    // Cleanup - save data to file and close db handle
    onDevicePause: function() {
        return Promise.all([dm.cleanUp(), pm.cleanUp()]);
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        window.rootLocation = cordova.file.externalApplicationStorageDirectory; // (window.cordova.platformId == 'android') ? cordova.file.dataDirectory : cordova.file.documentsDirectory;
        window.powertech = new networkCall();
        initDtoTemplate();
        ko.applyBindings(viewmodel);

        versionCheck().then(function(version){
            return updateApp(version.BuildVersion).then(function(updated){
                return dm.startUp(version.Version).then(function(rsrc){
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
                    
                    // Physically pick default page
                    // return Promise.resolve($('#starterPage')[0].click());
                    // return viewmodel.selectedController("Inspections");
                    return Promise.resolve($('#starterPage')[0].click());
                }).catch(function(err) {
                    if(VERBOSE) console.log(err);
                    console.log("Error in initialization. Please make sure the app is loaded at least once with internet access");
                    // alert("Application not initialized. Please make sure the app is loaded at least once with internet access");
                })
            });
        });
    }
};

var versionCheck = function() {
    if(net.checkConnection()) 
        return req.getVersion(); 
    return Promise.resolve({});
}
app.initialize();