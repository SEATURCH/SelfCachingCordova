var authentication = require('./authentication.js');
var dm = require('./dataManager.js');
var pm = require('./pictureManager.js');
var navi = require('./navigation.js');
var pageInits = require('../app/initializers.js');
var watch = require('./globalWatchers.js');

function viewModel() {
    var self = this;
    self.authentication = authentication;

    self.definitions = null;
    self.lookups = null;
    self.pageConfig = null;
    self.pageFramework = null;

    self.pageData = ko.observable(null);
    self.navi = navi;
    self.navi.init(function(pathname, params) {
        self.pageData({});
        var parts = pathname.split('/').filter(function(part) { return part; });
        var currentPage = {
            Key: parts[0],
            Value: parts[1] || "Index"
        };
        return self.initPage(currentPage).then(function(currentPageDef) {
            return pageInits.initPage(pathname, params).then(function(initData){
                return {initData:initData, currentPageDef:currentPageDef };
            });
        }).then(function(res){
            var sample = new ApplicationDataModel(res.initData, self.pageFramework.getDataManager(currentPage), res.currentPageDef);
            sample.isRoot = pageInits.isRoot(pathname);
            pageInits.postAttach(pathname, sample);
            self.pageData(sample);
        });
    });

    self.processing = watch.processing.count;
}

appendPrototype(viewModel, {
    logout: function(data) {
        return authentication.unauthenticate.then(function() {
        });
    },
    upload: function() {
        var self = this;
        return self.pageData().save();
    },
    download: function(endpnt) {
        // var self = this;
        // return req.getFrom(endpnt);
    },
    initPage: function(page) {
        var self = this;
        return new Promise(function(res, rej) {
            var controller = self.pageConfig.find(function(pg){ return pg.Name == page.Key; });
            var currentPage = controller.PageDefinitions.find(function(pg){ return pg.Name == page.Value; });
            return dm.initializePage(controller.PageDefinitions).then(function(dynmLkps) {
                $.extend(self.lookups, dynmLkps);
                initMappings(self.definitions, self.lookups);
                res(currentPage)
            }).catch(function(s){
                if(VERBOSE) console.log(s);
                if(VERBOSE) console.log("Error in starting page - configurations missing or out of date. Please resrtart app with internet to re-initialize");
            });
        });
    }
});

function ApplicationDataModel(dataModel, dataManager, pageDef) {
    var self = this;
    self.framework = dataManager;
    self.PageId = dataManager.Action.Key + dataManager.Action.Value;
    
    // self.mobileData = dataModel;
    self.data = defaultMap(dataModel, (pageDef || {}).RootModel); //ApplicationDataModel.prototype.process(dataModel, pageDef);

    sessionScripts.run("pageViewModels", self.PageId, self);        
}

module.exports = {
    viewModel: viewModel
}