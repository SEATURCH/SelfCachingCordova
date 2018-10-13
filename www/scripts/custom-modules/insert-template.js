// Helper ko custom binding that does add any functionality but only inserts a template and limit scope parameteres

ko.bindingHandlers.insertTemplate = {
 	init: function (element, valueAccessor, allBindings, viewModel, context) {    
        var templateId  = valueAccessor();
        var viewModel = allBindings().viewmodel;
      	$(element).append($('#'+templateId).html());

      	if(viewModel) {
	      	var innerBindingContext = context.createChildContext(viewModel);
	        ko.applyBindingsToDescendants(innerBindingContext, element);
	        return { controlsDescendantBindings: true };
        }
        else
        	return { controlsDescendantBindings: false };
    }
}