var vm;
var knockoutScripts = {};
var pageViewModel;
$(function () {
    var initialData;
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
    if ($.isFunction(pageViewModel)) pageViewModel(vm);
    ko.applyBindings(vm);

}

function masterViewModel(initialData) {
    var self = this;
    var mapped = baseMap(initialData.Data,initialData.Definitions);


    self.data = ko.observable(mapped);
    self.definitions = ko.observable(initialData.Definitions);
}