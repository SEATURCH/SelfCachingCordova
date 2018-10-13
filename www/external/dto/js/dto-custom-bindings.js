function initDtoTemplate() {

	ko.bindingHandlers.dtoTemplate = {
	    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var observable = valueAccessor();
	        var data = ko.unwrap(observable);
	        var template = "#" + ko.unwrap(data.DtoTypeName) + "Template";
	        $(element).append($(template).html());

	        var childBindingContext = bindingContext.createChildContext(data);
	        ko.applyBindingsToDescendants(childBindingContext, element);
	        
	        return { controlsDescendantBindings: true };
	    }
	}

	ko.bindingHandlers.editControl = {
	    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var observable = valueAccessor();
	        var propertyName = ko.unwrap(observable);
	        var definitions = ko.unwrap(bindingContext.$root.definitions);
	        var type = viewModel.DtoTypeName;
	        var lookups = bindingContext.$root.lookups;

	        var controlVm = {
	            value: viewModel[propertyName + editable.extension],
	            parent: viewModel,
	            validationErrorMsg: ko.unwrap(viewModel.validation) ? viewModel.validation.validationErrors[propertyName] : null
	        };
	        controlVm.dismiss = function () { if (this.validationErrorMsg) this.validationErrorMsg(null); };
	        controlVm.validate = function () { if (this.validationErrorMsg) ko.unwrap(this.parent.validation).validateProperty(propertyName); };

	        //var matchingDefinition;
	        //$.each(definitions, function (index, item) {
	        //    if (item.Name == type) matchingDefinition = item;
	        //});

	        var property;
	        $.each(viewModel.info.config, function (index, item) {
	            if (item.Name == propertyName) property = item;
	        });
	        var templateId;
	        if (lookups[property.Type]) {
	            //select
	            templateId = 'dropdown-template';
	            controlVm.optionsValue = ko.unwrap(allBindings().optionsValue) || 'Key';
	            controlVm.optionsText = ko.unwrap(allBindings().optionsText) || 'Value';
	            controlVm.optionsDisplayText = ko.unwrap(allBindings().optionsDisplayText) || controlVm.optionsText;
	            controlVm.optionsCaption = ko.unwrap(allBindings().optionsCaption);
	            controlVm.options = lookups[property.Type];
	        } else if (property.Type == 'String') {
	            templateId = 'text-template';
	        } else if (property.Type == 'DateTime') {
	            templateId = 'date-template';
	        } else {
	            templateId = 'number-template';
	        }

	        $(element).append(document.getElementById(templateId).innerHTML);

	        var childBindingContext = bindingContext.createChildContext(controlVm);
	        ko.applyBindingsToDescendants(childBindingContext, element);

	        return { controlsDescendantBindings: true };
	    }
	}

	ko.bindingHandlers.btnOptions = {
	    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
	        var observable = valueAccessor();
	        var options = ko.unwrap(observable);
	        var value = ko.unwrap(allBindings().value);
	        var displayText = null;
	        $(element).attr('data-toggle', 'dropdown');
	        var menu = $(document.getElementById('dropdown-menu-template').innerHTML);

	        $(element).append('<div class="dropdown-toggle-content" data-bind="text: ko.utils.getDropdownDisplay($data),css: {\'dropdown-unselected\': ko.unwrap(value) == null}"></div>')

	        ko.applyBindings(viewModel, menu.get(0));

	        $(menu).insertAfter(element);
	        $(element).dropdown();
	    }
	};

	ko.bindingHandlers.displayControl = {
	    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {

	    }
	};

	ko.utils.optionsText = function (item, viewModel, isDisplay) {
	    var text = isDisplay ? ko.unwrap(viewModel.optionsDisplayText) : ko.unwrap(viewModel.optionsText);
	    if ($.isFunction(text)) return text(item);
	    else return item[text];
	}


	ko.utils.getDropdownDisplay = function (viewModel) {
	    var options = ko.unwrap(viewModel.options);
	    var selectedItem = null;
	    var value =  ko.unwrap(viewModel.value)
        if (value == null) return ko.unwrap(viewModel.optionsCaption)
        options.forEach(function (item) {
            if (ko.utils.optionsValue(item, viewModel) == value) selectedItem = item;
	    });
        return ko.utils.optionsText(selectedItem, viewModel,true);
	}

	ko.utils.setOptionsValue = function (item, viewModel) {
	    if (item == null)
	        viewModel.value(null);
	    else
	        viewModel.value(ko.utils.optionsValue(item,viewModel));
	}

	ko.utils.optionsValue = function(item,viewModel){
	    var optionsValue = ko.unwrap(viewModel.optionsValue);
	    if (optionsValue == null) return item;
	    else return item[optionsValue];
	}
};