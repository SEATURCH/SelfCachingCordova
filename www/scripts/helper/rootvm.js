var req = require('../requests.js');
var authentication = require('./authentication.js');
var uuidv4 = require('uuid/v4');
var dm = require('./dataManager.js');
var navi = require('./navigation.js');
var pageInits = require('../app/initializers.js');

function viewModel(initialData) {
    var self = this;
    self.authentication = authentication;

    self.definitions = null;
    self.lookups = null;
    self.pageConfig = null;
    self.pageFramework = null;

    self.pageData = ko.observable(null);
    self.currentPage = ko.observable(null);
    navi.init(function(pathname, params){
        var parts = pathname.split('/').filter(function(part) { return part; });
        self.currentPage({
            Key: parts[0],
            Value: parts[1] || "Index"
        });
        window.communicationManager = {
            submitData: function(url, data) {
                this.data.deepComplete();
                dm.write(this.dto, )
            }
        }
        return self.initPage(self.currentPage()).then(function() {
            return pageInits.initPage(pathname, params)
        }).then(function(initialData) {
            var currentPage = controller.PageDefinitions.find(function(pg){ return pg.Name == page.Value; });
            if(currentPage) {
                var sample = new ApplicationDataModel(initialData, self.pageFramework.getDataManager(page), currentPage);
                self.pageData(sample);
            } else throw new Error("Page Definition not found")
        })
        
    });
}

appendPrototype(viewModel, {
    logout: function(data) {
        return authentication.unauthenticate.then(function() {
        });
    },
    upload: function(data, endpnt) {
        var self = this;
        return preq.postTo(endpnt, {data: data} );
    },
    download: function(endpnt) {
        var self = this;
        return req.getFrom(endpnt);
    },
    initPage: function(page) {
        var self = this;
        var controller = self.pageConfig.find(function(pg){ return pg.Name == page.Key; });
         if(controller) {
            return dm.initializePage(controller.PageDefinitions).then(function(dynmLkps) {
                $.extend(self.lookups, dynmLkps);
                initMappings(self.definitions, self.lookups);
            }).catch(function(s){
                if(VERBOSE) console.log(s);
                if(VERBOSE) console.log("Error in starting page - configurations missing or out of date. Please resrtart app with internet to re-initialize");
            });
        }
    }
});


function ApplicationDataModel(dataModel, dataManager, pageDef) {
    var self = this;
    self.framework = dataManager;
    self.PageId = dataManager.Action.Key + dataManager.Action.Value;
    
    $.extend(self, dataModel)
    self.AppUUID = self.AppUUID || uuidv4();
    self.data = defaultMap(self.data, pageDef.RootModel);
        
    sessionScripts.run("pageViewModels", self.PageId, self);
}


module.exports = {
    viewModel: viewModel
}