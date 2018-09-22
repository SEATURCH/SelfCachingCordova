// Default-form binding 
// Should include Arrays formatting and recusively calling itself with 'level' passed in.
// The root level sshould have validation trigger.

ko.bindingHandlers.editableForm = {
    init: function (element, valueAccessor, allBindings, viewModel, context) {    
        var data = valueAccessor() || {};
        var orientation = allBindings().orientation
        var propertyList =  allBindings().config;
        var level = allBindings().level;
        var templateId = allBindings().templateId || "default-form-template";
        
        $(element).append(window.templates[templateId]);

        var orientatedProperties = [];
      	orientation.forEach(function(or){
        	var props = [];
    	 	or.content.forEach(function(propString){
	 			props.push(new orientatedObj(propString, propertyList, data));
        	});

			var header = null;
    	 	if(or.header)
	 	 		header = allBindings().indexItem ? or.header + ' - ' +allBindings().indexItem: or.header;
			orientatedProperties.push({
				header: header,
				content: props
			});
        });

        var newScope =  {
    		model: data,
    		level: level,
    		orientatedProperties: orientatedProperties
        }

        var innerBindingContext = context.createChildContext(newScope);
        ko.applyBindingsToDescendants(innerBindingContext, element);
        return { controlsDescendantBindings: true };
    }
}

function orientatedObj(propString, propertyList, data){
	var self = this;
    if (typeof propString != "string") {
        self.typeConfig = propertyList;
        self.orientation = propString;
		self.property = data;
		self.type = "Defined";
		return;
	}

	var propItem = propertyList.find(function(p){ return propString == p.property});
	var propType = propItem.type;
	self.isArray = (propType === "Array");
	if(self.isArray) propType = propItem.nestedType;
	
    self.typeConfig = window.viewModel.config[propType];
	self.type = window.viewModel.config[propType]? "Defined":"Primitive";
	var dataPropString =(self.type =="Primitive" || self.isArray)?  propString + editable.extension : propString;
	self.property = data[dataPropString];
    self.config = propItem;
    self.orientation = window.viewModel.orientation[propType];
}