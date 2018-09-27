﻿var vm;
var powertech;

$(function () {
    var initialData;
    var $dataQuery = $('#initial-data');
    powertech = new network();
    initDtoTemplate();
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
    ko.applyBindings(vm);


    //$.getScript(initialData.ScriptsPath, function (data) {
    //    var viewModelDefinition = window.viewModel;
    //    if (viewModelDefinition) {

    //        vm = new viewModelDefinition(initialData);
    //        ko.applyBindings(vm);
    //    }
    //});

   
}

function masterViewModel(initialData) {
    var self = this;
    var mapping = parse(initialData.Definitions);


    self.data = ko.observable(initialData.Data);
    self.definitions = ko.observable(initialData.Definitions);
}