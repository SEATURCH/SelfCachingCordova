// Add methods into constructor
var appendPrototype = function (constructor, properties) {
    for (prop in properties) {
        if (properties.hasOwnProperty(prop)) {
            constructor.prototype[prop] = properties[prop];
        }
    }
}

var sessionScripts = function () {
    var self = this;
    var scripts = {
        koScripts: {},
        pageScripts: {}
    };
    return {
        add: function(scriptyType, dtoTypeName, modelScript) {
            scripts[scriptyType] = scripts[scriptyType] || {};
            scripts[scriptyType][dtoTypeName] = modelScript;
        },
        run: function(scriptyType, dtoTypeName, model){
            var modelScript = (scripts[scriptyType] || window[scriptyType] || {})[dtoTypeName];
            if ($.isFunction(modelScript)) {
                modelScript(model);
            } else {
                console.log(scriptyType + '.' + dtoTypeName + ' is not a valid script. Run sessionScripts.allScripts to see all currently loaded scripts');
            }
        },
        allScripts: function () {
            return scripts;
        }
    }
}();



var defaultMap = function(){ console.log("Mapping not initilaized"); };
var initMappings = function(config, lookups){
    var configMapping = parse(config, lookups);
    defaultMap = function (data, dtoTypeName) {
        var mappingName = dtoTypeName || data.DtoTypeName;
        if (data)
            return ko.mapping.fromJS(data, configMapping[mappingName]);
        else if(dtoTypeName)
            return new DefaultEditableModel(configMapping[mappingName]); 
    }
};




function DefaultEditableModel(mapping, parent, data) {
    var self = this;
    self.info = JSON.parse(mapping.info);
    self.parent = parent;
    // Will never actually happen when running from a mappign persepective
    // Only time when data is null is when creating a new model from the client UI namely,
    // ex. new DefaultEditableModel(mapping[target])
    if (data == null) {
        data = {
            DtoTypeName: mapping.DtoTypeName,
            CanEdit: true
        };
        mapping.relevantDetails.map(function(d) {return d.Name}).concat(mapping.copyDetails).forEach(function (dets) { data[dets] = data[dets] || null; });
        mapping.nested.forEach(function (nested) { data[nested] = mapping[nested].isArray ? [] : null; })
    }

    ko.mapping.fromJS(data, mapping, self);
    if (mapping.relevantDetails.length)
        editable.call(self, mapping.relevantDetails, data);

    if (mapping.validation)
        self.validation = new ValidationModel(self, mapping.validation);

    sessionScripts.run('knockoutScripts', mapping.DtoTypeName, self);
}

appendPrototype(DefaultEditableModel, {
    // 'Save' function that utilizes editable.js saveObject functionality but throughout vm
    // Functions like save where returns to a specified 'OnSave' for the model or just a saveObject.
    deepSave: function () {
        var self = this;
        var saveObject = self.createSaveObject();
        self.__ko_mapping__.nested.forEach(function (nest) {
            var content = ko.unwrap(self[nest + editable.extension] || self[nest]);
            if (Array.isArray(content)) {
               saveObject[nest] = content.map(function (s) { return s.deepSave(); });
            } else if(content) {
               saveObject[nest] = content.deepSave();
            }
        });
        return saveObject;
    },
    deepComplete: function () {
        var self = this;
        self.__ko_mapping__.nested.forEach(function (nest) {
            var content = ko.unwrap(self[nest + editable.extension] || self[nest]);
            if (Array.isArray(content)) {
                content.forEach(function (s) { return s.completeSave(); });
            } else if (content) {
                content.completeSave();
            }
        });
        self.completeSave();
    },
    deepRevert: function () {
        var self = this;
        self.__ko_mapping__.nested.forEach(function (nest) {
            var content = ko.unwrap(self[nest + editable.extension]);
            if (Array.isArray(content)) {
                content.forEach(function (s) { return s.deepRevert(); });
            } else if (content) {
                content.deepRevert();
            }
        });
        self.revert();
    },
    crawlType: function (type) {
        var self = this;
        var imageDtos =Array.isArray(type)? type: [type];
        var imgs = imageDtos.indexOf(ko.unwrap(self.DtoTypeName)) >= 0? [self] : [];
        self.__ko_mapping__.nested.forEach(function (nest) {
            var content = ko.unwrap(self[nest + editable.extension]);
            if (Array.isArray(content)) {
                imgs = imgs.concat(content.reduce(function (col, cur) { return col.concat(cur.crawlType(type)) }, []));
            } else if (content) {
                imgs = imgs.concat(content.crawlType(type));
            }
        });
        return imgs;
    },
    GetLookupValue: function (propName, val) {
        var self = this;
        var modelConfig = self.info.config;
        
        var keyValue = val || ko.unwrap(self[propName]);
        var property = modelConfig.find(function (item) { return item.Name == propName;  });

        var lookup = self.info.lookups[property.Options];
        var value = lookup.find(function (item) {  return item.Key == keyValue;  });

        return value;
    },
    // Returns number of invalid properties in the model and it's nested memebers
    isValid: function () {
        var self = this;
        var valid = true;
        var counter = 0;

        // validate self
        counter = self.validation.validateAll();

        // validate nested objects
        self.__ko_mapping__.nested.forEach(function (nest) {
            var content = ko.unwrap(self[nest]);
            if (Array.isArray(content)) {
                content.forEach(function (s) { counter += s.isValid(); });

                //content.isValid();
                //nestedErr = content.filter(function (s) { return s.isValid(); }).length;
            } else {
                counter += content.isValid();
            }
        });
        return counter;
    }
});

// public string Name { get; set; }
// public string Type { get; set; }
// public string Title { get; set; }
// public List<KeyValuePair<string, string>> Options { get; set; }
// public List<string> ValidationRules { get; set; }
// public bool IsHidden { get; set; }
// public List<string> Attributes { get; set; }
// public bool IsCollection { get; set; }

var parse = function (baseConfig, lookups) {
    var mapping = function (type, config, isArray) {
        var self = this;
        self.copyDetails = ['CanEdit', 'DtoTypeName'];
        self.relevantDetails = [];
        self.nested = [];
        self.validation = [];
        self.isArray = isArray;
        self.info = JSON.stringify({ config: config, lookups: lookups }); // B/c kncokout mapping removes all object arrays past first item
        self.DtoTypeName = type;

        config.forEach(function (prop) {
            var type = prop.Type;
            if (prop.ValidationRules && !prop.IsReadOnly) {
                var valRules = prop.ValidationRules.map(function (stringRules) {
                    if (stringRules.indexOf("rule") > -1 && stringRules.indexOf("condition") > -1)
                        return JSON.parse(stringRules);
                    return stringRules;
                });
                self.validation.push({
                    property: prop.Name,
                    validation: valRules
                });
            }

            if (allTypes[type]) {
                self.nested.push(prop.Name);
                self[prop.Name] = new mapping(type, allTypes[type], prop.IsCollection);
            }
            if (prop.IsReadOnly)
                self.copyDetails.push(prop.Name);
            else if (!allTypes[type] || (allTypes[type] && prop.IsCollection))
                self.relevantDetails.push(prop);

            // if(allTypes[prop.nestedType]){
            //     self[prop.property] = new mapping(allTypes[prop.nestedType], allOrientation[type]);
            // }
        });

        self.create = function (options) {
            if (options.data == null) return null;
            // Cleans properties b/c complex array properties need to have empty collection initialized 
            self.nested.forEach(function (nestedProp) {
                if (options.data[nestedProp] == null && self[nestedProp].isArray)
                    options.data[nestedProp] = [];
            });
            var vm = new DefaultEditableModel(self, options.parent, options.data);
            return vm;
        }
    }

    var allTypes = {};
    baseConfig.forEach(function (model) { allTypes[model.Name] = model.Properties });
    var map = {};
    baseConfig.forEach(function (config) {
        map[config.Name] = new mapping(config.Name, allTypes[config.Name]);
    })
    return map;
}


function getDtoName(obj) {
    if (!obj) return null;
    if (Array.isArray(obj) && obj.length) {
        obj = obj[0];
    }
    return obj.DtoTypeName;
}

function baseMap(data, configuration, lookups) {
    var baseConfig = {};
    configuration.forEach(function (config) {
        baseConfig[config.Name] = config.Properties;
    });
    var mapped = mapModel(data, baseConfig, lookups);

    return mapped;
}


function ValidationModel(data, validation) {

    var self = this;
    var data = data;
    var validation = validation;

    // Evalutation of complex validation
    //  ex. jp.query([DefaultEditableModel], "$[?(@.ManufactureModel.s!=null)]")
    // Returns true if valid or if condition fails
    var complexEval = function(rule) {
        function queryString(exp) {
            return "$[?(" + exp +")]";
        }
        var currentData = data.deepSave(true);
        data.info.config.forEach(function (conf) {
            if (conf.Options) {
                var val = data.GetLookupValue(conf.Name, currentData[conf.Name]);
                currentData[conf.Name] = (val || {}).Key || currentData[conf.Name];
            }
        })

        var condEval = jsonpath.query([currentData], queryString(rule.condition));
        if(condEval.length) {
            var ruleEval = jsonpath.query([currentData], queryString(rule.rule));
            return ruleEval.length != 0;
        }
        return true;
    }

    // Evalutation of default attribute validation
    // Returns true if valid
    var simpleEval = {
        Required: function (targetVal) {
            var succ = (ko.unwrap(targetVal)) ? true : false;
            return succ;
        },
        Number: function (targetVal) {
            var val = ko.unwrap(targetVal);
            var succ = (isNaN(val)) ? false : true;
            return succ;
        }
    }

    var process = function (propertyVal) {
        var success = true;
        var error = null;
        self.validationErrors[propertyVal.property](null);

        propertyVal.validation.every(function (valOn) {
            if(typeof(valOn) == "string") {
                var currentProp = data[propertyVal.property + editable.extension];
                error = "Error - invalid value";
                success = simpleEval[valOn].call(self, currentProp);
            } else {
                error = valOn.error;
                success = complexEval(valOn);
            }
            // if (valOn.conditions instanceof Array) {
            //     valOn.conditions.every(function (condition) {
            //         var conditionTarget = data[condition.target + editable.extension];
            //         conditionMet = conditionMet && validateFor[condition.type].call(conditionTarget, condition.args);
            //         return conditionMet; // if conditionMet == false, breaks out of every
            //     });
            // }
            // if (conditionMet) {
            //     valOn.rules.every(function (rule) {
            //         error = rule.error;
            //         success = success && validateFor[rule.type].call(self, data[propertyVal.property + editable.extension], rule.args);
            //         return success;
            //     });
            // }
            return success;
        });

        if (!success) self.validationErrors[propertyVal.property](error);
        return success;
    }

    // Returns number of properties fail validation.
    self.validateAll = function () {
        var counter = 0;
        var allErrors = {};
        if (validation instanceof Array) {
            validation.forEach(function (propertyVal) {
                var valid = process(propertyVal);
                if (!valid) counter++;
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
