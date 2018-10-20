var vm;
var knockoutScripts = {};
var pageViewModels = {};
var framework;
$(function () {
    var initialData;
    initDtoTemplate();
    window.powertech = new networkCall();
    var $dataQuery = $('#initial-data');
    if ($dataQuery && $dataQuery.length > 0) {
        var dataElement = $dataQuery[0];
        var data = dataElement.innerHTML;
        initialData = JSON.parse(data);
        setup(initialData);
    } else {
        //TODO: what happens if we're on mobile?
    }
  
});


function setup(initialData) {
    vm = new masterViewModel(initialData);
    var key = Object.keys(pageViewModels).find(function (key) { return key.toLowerCase() == initialData.PageScriptName.toLowerCase(); });
    var pageVm = pageViewModels[key];
    if ($.isFunction(pageVm)) pageVm(vm);
    ko.applyBindings(vm);

}

function masterViewModel(initialData) {
    var self = this;
    self.framework = new pagesDataManager(initialData.Pages,initialData.Action);
    self.definitions = ko.observable(initialData.Definitions);
    self.lookups = initialData.Lookups;
   // self.pages = initialData.Pages;
    initMappings(initialData.Definitions,initialData.Lookups);
    var mapped = ko.unwrap(defaultMap(initialData.Data, initialData.VMName));
    if (mapped && mapped.constructor === Array)
        self.data = ko.observableArray(mapped);
    else
        self.data = ko.observable(mapped);

}