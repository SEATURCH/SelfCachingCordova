ko.bindingHandlers.editableField = {
    init: function (element, valueAccessor, allBindings, viewModel, context) {    
        var config = valueAccessor();
        var parentVm = allBindings().vm; 
        if (allBindings().vm.constructor.name == "DefaultEditableModel")
            var sss = 1;
        
        
        var templateId = ko.unwrap(allBindings().templateId) || "default-property-template";
        var data = allBindings().data || ko.observable();
        
        var template = "#" + templateId + "Template";
        $(element).append($('script'+template).html());
        
        var newScope =  new selectListPropertyModel(
            data,
            parentVm,
            config
        );
        
        var innerBindingContext = context.createChildContext(newScope);
        ko.applyBindingsToDescendants(innerBindingContext, element);
        return { controlsDescendantBindings: true };
    }
}

function selectListPropertyModel(editValue, parent, config) {
    var self = this;
    var property = config.property;
    var type = config.nestedType || config.type;
    var title = config.title;
    var listOptions = config.options;

    self.title = title
    self.editValue = editValue;
    self.parent = parent;
    self.listOptions = listOptions;
    self.type = type;
    self.validationErrorMsg = ko.unwrap(self.parent.validation) ? self.parent.validation.validationErrors[property]: null;
    self.dismiss = function () {
        if (self.validationErrorMsg) self.validationErrorMsg(null);
    }
    self.validate = function() {
        if (self.validationErrorMsg) ko.unwrap(self.parent.validation).validateProperty(property);
    }
    
}