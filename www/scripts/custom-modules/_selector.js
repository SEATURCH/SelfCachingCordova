// Item Selector
// Params - 2 equal length arrays of header and content matched by index
// Virtual binding that wraps a content and selection. When a given selection is chosen, selects corresponding content data

var ko = require('knockout');

ko.bindingHandlers.selector = {
	init: function (element, valueAccessor, allBindings, viewModel, context) { 
		var self = {};
		self.headers = valueAccessor();
		self.contents = allBindings().content;
		self.selectedIdx = ko.observable(0);
		// var map = {};
		// headers.forEach(function(header, idx){
		// 	map[JSON.stringify(ko.mapping.toJS(header))] = self.content[idx];
		// })
		// self.selectedContent = ko.observable();
		// self.selectedHeader = ko.observable();
		// ko.computed(function(){
		// 	self.selectedContent( map[JSON.stringify(ko.mapping.toJS(self.selectedHeader))] );
		// });
		
        var innerBindingContext = context.createChildContext(self);
        ko.applyBindingsToDescendants(innerBindingContext, element);
        return { controlsDescendantBindings: true };
	}
}
ko.virtualElements.allowedBindings.selector = true;
