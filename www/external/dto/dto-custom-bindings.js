function initDtoTemplate() {

	ko.bindingHandlers.dtoTemplate = {
	    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var observable = valueAccessor();
	        var data = ko.unwrap(observable);
	        var template = "#" + data.DtoTypeName + "Template";
	        $(element).append($(template).html());

	        var childBindingContext = bindingContext.createChildContext(data);
	        ko.applyBindingsToDescendants(childBindingContext, element);
	        
	        return { controlsDescendantBindings: true };
	    }
	}
};