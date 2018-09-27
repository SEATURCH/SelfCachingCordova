// Add methods into constructor
var appendPrototype = function(constructor, properties) {
    for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
            constructor.prototype[prop] = properties[prop];
        }
    }
}

var defaultBinding = function(self, data, mapping) {
    ko.mapping.fromJS(data, mapping, self);
    var relevantDetails = mapping.relevantDetails;
    if (relevantDetails.length) { 
        editable.call(self, relevantDetails, data);
    }
}

function DefaultEditableModel(data, parent, mapping) {
    var self = this;
    self.parent = parent;
    defaultBinding(self, data, mapping);
    if (mapping.validation)
        self.validation = new ValidationModel(self, mapping.validation);
}

appendPrototype(DefaultEditableModel, {
    // 'Saves' the editable object and any nested members with functionality in editable.js where it moves
    // _editValue into the model property observable. 
    deepSave: function () {
        var self = this;
        self.__ko_mapping__.nested.forEach(function(nest){
            var content = self[nest];
            if (Array.isArray(content)) {
               content.forEach(function (s) { return s.completeSave(); });
            } else {
               content.completeSave();
            }
        });
        var saveObject = self.completeSave();
    },

    // Returns number of invalid properties in the model and it's nested memebers
    isValid: function(){
        var self = this;
        var valid = true;
        var counter = 0;

        // validate self
        counter = self.validation.validateAll();
        
        // validate nested objects
        self.__ko_mapping__.nested.forEach(function(nest){
            var content = self[nest];
            var nestedCount = 0;
            if (Array.isArray(content)) {
                content.forEach(function (s) { counter += s.isValid(); });

                content.isValid();
                valid = valid && (content.length == 0 || content.filter(function (s) { return s.isValid(); }).length != 0);
            } else {
                valid = valid && content.isValid();
            }
            valid = valid && nestedCount == 0;
        }) 
        return counter;
    }
})

var parse = function(baseConfig, baseOrientation) {
    var mapping = function (config, orientation){
        var self = this;
        self.copy = ['CanEdit'];
        self.relevantDetails = [];
        self.nested = [];
        self.validation = [];

        config.forEach(function(prop){
            var type = prop.type;
            if(prop.validation)
            {
                self.validation.push({
                    property: prop.property,
                    validation: prop.validation
                });
            }            

            if (allTypes[type])
            {
                self.nested.push(prop.property);
                self[prop.property] = new mapping(allTypes[type], allOrientation[type]);
            }
            else 
            {
                self.relevantDetails.push(prop.property);
            }
            
            if(allTypes[prop.nestedType]){
                self[prop.property] = new mapping(allTypes[prop.nestedType], allOrientation[type]);
            }
        });
        
        self.create = function(options){
            var vm = new DefaultEditableModel(options.data, options.parent, self);
            vm.config = config;
            vm.orientation = orientation;
            return vm;
        }
    }

    var allTypes = baseConfig;
    var allOrientation = baseOrientation;
    var map = new mapping(baseConfig);
    return map;
}



function ValidationModel(data, validation) {
    
    var self = this;
    var data = data;
    var validation = validation;

    // Repalce with JSON.Query notation check 
    var validateFor = {
        range: function (targetVal, arg) {
            if (isNaN(ko.unwrap(targetVal)))
                return false;
            if (!isNaN(arg.top) && arg.top < Number(ko.unwrap(targetVal)))
                return false;
            if (!isNaN(arg.bot) && arg.bot > Number(ko.unwrap(targetVal)))
                return false;
            return true;
        },
        hasValue: function (targetVal) {
            var succ = (ko.unwrap(targetVal)) ? true : false;
            return succ;
        },
        isValue: function (targetVal, arg) {
            var succ = (ko.unwrap(targetVal) == arg) ? true : false;
            return succ;
        },
        isNumber: function (targetVal) {
            var succ = isNaN(ko.unwrap(targetVal)) ? false : true;
            return succ;
        },
        isPattern: function (targetVal, arg) {
            var succ = (typeof (ko.unwrap(targetVal)) == 'string' && ko.unwrap(targetVal).match(arg)) ? true : false;
            return succ;
        },
        GISValidate: function (targetVal) {
            if (ko.unwrap(targetVal) == null || ko.unwrap(targetVal) == " " || ko.unwrap(targetVal) == "")
                return true;
            var split = ko.unwrap(targetVal).split(" ");
            if (split.length != 2)
                return false;
            var Longitude = split[0];
            if (isNaN(Longitude) || Longitude < -180 || Longitude > 180)
                return false;
            var Latitude = split[1];
            if (isNaN(Latitude) || Latitude < -90 || Latitude > 90)
                return false;
            return true;
        }
    }

    var process = function (propertyVal) {
        var success = true;
        var error = "Error - invalid value";
        self.validationErrors[propertyVal.property](null);

        propertyVal.validation.every(function (valOn) {
            var conditionMet = true;
            if (valOn.conditions instanceof Array) {
                valOn.conditions.every(function (condition) {
                    var conditionTarget = data[condition.target + editable.extension];
                    conditionMet = conditionMet && validateFor[condition.type].call(self, conditionTarget, condition.args);
                    return conditionMet; // if conditionMet == false, breaks out of every
                });
            }
            if (conditionMet) {
                valOn.rules.every(function (rule) {
                    error = rule.error;
                    success = success && validateFor[rule.type].call(self, data[propertyVal.property + editable.extension], rule.args);
                    return success;
                });
            }
            return success;
        });

        if (!success) self.validationErrors[propertyVal.property](error);
        return success;
    }

    self.validateAll = function () {
        var success = true;
        var counter = 0;
        var allErrors = {};
        if (validation instanceof Array) {
            validation.forEach(function (propertyVal) {
                var res = process(propertyVal);
                if (res) counter++;
            });
        }
        return counter;
    };

    self.validateProperty = function (property) {
        return process(validation.find(function (val) { return val.property == property; }));
    }

    self.validationErrors = function () {
        var valErrs = {};
        validation.forEach(function (propertyVal) {
            valErrs[propertyVal.property] = ko.observable(null);
        });
        return valErrs;
    }();

    self.dismiss = function () {
        Object.keys(self.validationErrors).forEach(function (key) {
            self.validationErrors[key](null);
        });
    }
}
