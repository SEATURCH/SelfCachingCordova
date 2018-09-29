// Add methods into constructor
var appendPrototype = function(constructor, properties) {
    for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
            constructor.prototype[prop] = properties[prop];
        }
    }
}

function DefaultEditableModel(mapping, parent, data) {
    var self = this;
    self.parent = parent;
    // Will never actually happen when running from a mappign persepective
    // Only time when data is null is when creating a new model from the client UI namely,
    // ex. new DefaultEditableModel(mapping[target])
    if(data == null) {
        data = {};
        data.DtoTypeName = mapping.DtoTypeName;
        mapping.relevantDetails.forEach(function(dets) { data[dets] = null; });
        mapping.nested.forEach(function(nested) { data[nested] = mapping[nested].isArray? [] : null; })
    }
    
    ko.mapping.fromJS(data, mapping, self);
    if (mapping.relevantDetails.length)
        editable.call(self, mapping.relevantDetails, data);
    
    if (mapping.validation)
        self.validation = new ValidationModel(self, mapping.validation);
}

appendPrototype(DefaultEditableModel, {
    // 'Save' function that utilizes editable.js saveObject functionality but throughout vm
    // Functions like save where returns to a specified 'OnSave' for the model or just a saveObject.
    deepSave: function () {
        var self = this;
        var saveObject = self.createSaveObject();
        self.__ko_mapping__.nested.forEach(function(nest){
            var content = ko.unwrap(self[nest + editable.extension] || self[nest]);
            if (Array.isArray(content)) {
               saveObject[nest] = content.map(function (s) { return s.deepSave(); });
            } else if(content) {
               saveObject[nest] = content.deepSave();
            }
        });
        if ($.isFunction(self.onSave)) {
            return self.onSave(saveObject);
        }
        return saveObject;
    },
    deepRevert: function() {
        var self = this;
        self.__ko_mapping__.nested.forEach(function(nest){
            var content = ko.unwrap(self[nest]);
            if (Array.isArray(content)) {
               content.forEach(function (s) { return s.deepRevert(); });
            } else if(content) {
               content.deepRevert();
            }
        });
        self.revert();
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

// public string Name { get; set; }
// public string Type { get; set; }
// public string Title { get; set; }
// public List<KeyValuePair<string, string>> Options { get; set; }
// public List<string> ValidationRules { get; set; }
// public bool IsHidden { get; set; }
// public List<string> Attributes { get; set; }
// public bool IsCollection { get; set; }

var parse = function(baseConfig, baseOrientation) {
    var mapping = function (type, config, isArray){
        var self = this;
        self.copy = ['CanEdit', 'DtoTypeName'];
        self.relevantDetails = [];
        self.nested = [];
        self.validation = [];
        self.isArray = isArray;
        self.DtoTypeName = type;

        config.forEach(function(prop){
            var type = prop.Type;
            if(prop.ValidationRules)
            {
                var valRules = prop.ValidationRules.map(function(stringRules){
                    if(stringRules.indexOf("rule") > -1 && stringRules.indexOf("condition") > -1)
                        return JSON.parse(stringRules);
                    return stringRules;
                });
                self.validation.push({
                    property: prop.Name,
                    validation: valRules
                });
            }            

            if (allTypes[type])
            {
                self.nested.push(prop.Name);
                self[prop.Name] = new mapping(type, allTypes[type], prop.IsCollection);
                // To revert additiosn or deletions to array not just item changes
                if(prop.IsCollection)self.relevantDetails.push(prop.Name);
            }
            else 
            {
                self.relevantDetails.push(prop.Name);
            }
           // if(allTypes[prop.nestedType]){
           //     self[prop.property] = new mapping(allTypes[prop.nestedType], allOrientation[type]);
           // }
        });
        
        self.create = function(options){
            if(options.data == null) return null;
            // Cleans properties b/c complex array properties need to have empty collection initialized 
            self.nested.forEach(function(nestedProp){
                if (options.data[nestedProp] == null && self[nestedProp].isArray) 
                    options.data[nestedProp] = [];
            });
            var vm = new DefaultEditableModel(self, options.parent, options.data);
            vm.config = config;
            return vm;
        }
    }

    var allTypes = {};
    baseConfig.forEach(function (model) { allTypes[model.Name] = model.Properties });
    var allOrientation = baseOrientation;
    var map = {};
    baseConfig.forEach(function(config){
        map[config.Name] = new mapping(config.Name, allTypes[config.Name]);
    })
    return map;
}

function mapModel(data, baseConfig) {
    var model = {};
    model.DtoTypeName = data.DtoTypeName;
    var properties = baseConfig[data.DtoTypeName];

    properties.forEach(function (prop) {
        var propValue = data[prop.Name];
        var dtoTypeName = getDtoName(propValue);
        if (baseConfig[dtoTypeName]) {
            if (Array.isArray(propValue)) {
                model[prop.Name] = $.map(propValue, function (item) {
                    return mapModel(item, baseConfig);
                });
            } else {
                model[prop.Name] = mapModel(propValue, baseConfig);
            }
        }
        else
            model[prop.Name] = ko.observable(propValue);
    });

    var modelScript = knockoutScripts[model.DtoTypeName];
    if ($.isFunction(modelScript)) {
        modelScript(model);
    }


    return model;
}

function getDtoName(obj){
    if (!obj) return null;
    if (Array.isArray(obj) && obj.length) {
        obj = obj[0];
    }
    return obj.DtoTypeName;
}

function baseMap(data, configuration) {
    var baseConfig = {};
    configuration.forEach(function (config) {
        baseConfig[config.Name] = config.Properties;
    });
    var mapped = mapModel(data,baseConfig);
    
    return mapped;
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
