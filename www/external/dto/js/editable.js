function editable(properties, data) {
    var self = this;
    self.editableProperties = ko.observableArray(properties);
    //self.propertyKey = ko.observable(propertyKey);
    self.changes = ko.observableArray();

    self.createPropertyObservables = function (properties) {
        properties.forEach(function (property) {
            //if (!property.IsReadOnly) {
                var name = property.Name;
                var value = self.hasOwnProperty(name) ? self[name] : ko.observable();
                var copyValue = createCopy(ko.unwrap(value));
                self[name + editable.extension] = property.IsCollection? ko.observableArray(copyValue): ko.observable(copyValue);

                if (self[name] == null) {
                    var x = 1;
                }

                self[name].subscribe(function (newValue) {
                    self[name + editable.extension](createCopy(newValue));
                });

                self[name + editable.extension].subscribe(function (newValue) {
                    var value = ko.unwrap(self[name]);
                    if (nullEmptyEquals(newValue, value)) {
                        self.changes.remove(name);
                    } else {
                        if (self.changes.indexOf(name) < 0) {
                            self.changes.push(name);
                        }
                    }
                });
            //}
        });
    };

    self.updateEditableProperties = function (properties) {
        var oldProperties = self.editableProperties();
        var propertiesToAdd = []
        

        properties.forEach(function (property) {
            var name = property.Name;
            var propertyIndex = oldProperties.indexOf(name);
            if (propertyIndex == -1)
                propertiesToAdd.push(property);
            else
                oldProperties.splice(propertyIndex, 1);
        });
        self.createPropertyObservables(propertiesToAdd);
        self.editableProperties(properties);

        oldProperties.forEach(function (prop) {
            var name = prop.Name;
            delete self[name + editable.extension];
        });

    }

    self.createPropertyObservables(ko.unwrap(self.editableProperties));


    self.propertyIsDirty = function (name) {
        return self.changes.indexOf(name) >= 0;
    };

    self.isDirty = ko.pureComputed(function () {
        return ko.unwrap(self.changes).length > 0;
    });

    self.revert = function () {
        [].concat(self.changes()).forEach(function (name) {
            // if (name == "Images")
            //     self[name](ko.unwrap(self[name]).filter(function (im) { return ko.unwrap(im.Inspection_Id); }));
            // else { 
                var revertValue = ko.unwrap(self[name]);
                self[name + editable.extension](createCopy(revertValue));
            // }
        });
        self.changes([]);
    }

    self.save = function () {
        var saveObject = self.createSaveObject();
        if ($.isFunction(self.onSave)) {
            return self.onSave(saveObject);
        } else {
            self.completeSave();
            return saveObject;
        }

    };

    self.completeSave = function () {
        self.changes().forEach(function (name) {
            // if (name != "Images") { 
                var saveValue = createCopy(ko.unwrap(self[name + editable.extension]));
                if(typeof self[name].push =='function'){ // is ObsevableArray
                    var arrVal = self[name]();
                    arrVal.splice(0, arrVal.length);
                    saveValue.forEach(function(item){ arrVal.push(item); });
                } else self[name](saveValue);
            // }
        });
        self.changes([]);
    };

    var DateValues = ['InstallDate', 'RequestedCompletionDate'] 
    self.createSaveObject = function () {
        var jsObject = ko.mapping.toJS(self);
        ko.unwrap(self.editableProperties).forEach(function (property) {
            name = property.Name;
            if (DateValues.indexOf(name) >= 0)
                jsObject[name] = ko.unwrap(self[name + editable.extension]) != null && ko.unwrap(self[name + editable.extension]) != undefined ? moment(ko.unwrap(self[name + editable.extension])).format('YYYY-MM-DDTHH:mm:ss.sss') : null;
            else
                jsObject[name] = ko.unwrap(self[name + editable.extension]);
            if(jsObject[name] === "") jsObject[name] = null;

        });
        $.each(jsObject, function (prop) {
            if (jsObject[prop] && $.isFunction(jsObject[prop])) {
                jsObject[prop] = undefined;
            }
        })
        return jsObject;
    }



}

editable.extension = '_editValue';
function nullEmptyEquals(a, b) {
    if (a === '' && (b === null || b === undefined)) {
        return true;
    }
    if (b === '' && (a === null || a === undefined)) {
        return true;
    }

    if ($.isArray(a) && $.isArray(b))
        return a.sort().join('') == b.sort().join('');

    return a == b;
}

function createCopy(value) {
    if ($.isPlainObject(value))
        return $.extend({}, value);

    if ($.isArray(value))
        return $.extend([], value);

    return value;
}
