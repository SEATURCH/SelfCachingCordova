//require('./helper/reqs.js');
var caching = require('./mobile/cachedSite.js')
var network = require('./mobile/network.js')

var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
        OnStart();
        console.log('Received Event: ' + id);
    }
};

app.initialize();

var OnStart = function () {
    caching.readVersion().then(function (result) {
        // At this point cached data or resovled data should ahve inserted the neede scripts to instantiated
        // ko and the vase viewmodel, vm
        //ko.applyBindings(vm);
        console.log(result);
    }).catch(function (s) {
        console.log("Error: cannot read or retrieve application");
        throw s;
    });
    //return new Promise(function (res, rej) {
    //    var hasWifi = network.checkConnection();
    //    if (hasWifi) {
    //        Promise.all([caching.readVersion, network.getVersion]).then(function (values) {
    //            if (values[0] == values[1])
    //                res(caching.readCached());
    //            else
    //                res(network.initData());
    //        }).catch(function (d) {
    //            res(caching.readCached());
    //        });
    //    } else {
    //        res(caching.readCached());
    //    }
    //}).then(function (result) {
    //    // At this point cached data or resovled data should ahve inserted the neede scripts to instantiated
    //    // ko and the vase viewmodel, vm
    //    ko.applyBindings(vm);
    //}).catch(function (s) {
    //    console.log("Error: cannot read or retrieve application");
    //    console.log(s);
    //});

}