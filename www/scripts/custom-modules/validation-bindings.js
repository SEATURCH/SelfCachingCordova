//var ko = require('knockout');
//var edit = require('../helper/editable.js');

//function ValidationModel(data, validation) {
//    // valTargets = [{
//    //     type: type,
//    //     error: "Error Msg",
//    //     args:{args}
//    // }]
//    var self = this;
//    var data = data;
//    var validation = validation;

//    var validateFor = {
//        range: function (targetVal, arg) {
//            if (isNaN(ko.unwrap(targetVal)))
//                return false;
//            if (!isNaN(arg.top) && arg.top < Number(ko.unwrap(targetVal)))
//                return false;
//            if (!isNaN(arg.bot) && arg.bot > Number(ko.unwrap(targetVal)))
//                return false;
//            return true;
//        },
//        hasValue: function (targetVal) {
//            var succ = (ko.unwrap(targetVal)) ? true : false;
//            return succ;
//        },
//        isValue: function (targetVal, arg) {
//            var succ = (ko.unwrap(targetVal) == arg) ? true : false;
//            return succ;
//        },
//        isNumber: function (targetVal) {
//            var succ = isNaN(ko.unwrap(targetVal)) ? false : true;
//            return succ;
//        },
//        isPattern: function (targetVal, arg) {
//            var succ = (typeof (ko.unwrap(targetVal)) == 'string' && ko.unwrap(targetVal).match(arg)) ? true : false;
//            return succ;
//        },
//        GISValidate: function (targetVal) {
//            if (ko.unwrap(targetVal) == null || ko.unwrap(targetVal) == " " || ko.unwrap(targetVal) == "")
//                return true;
//            var split = ko.unwrap(targetVal).split(" ");
//            if (split.length != 2)
//                return false;
//            var Longitude = split[0];
//            if (isNaN(Longitude) || Longitude < -180 || Longitude > 180)
//                return false;
//            var Latitude = split[1];
//            if (isNaN(Latitude) || Latitude < -90 || Latitude > 90)
//                return false;
//            return true;
//        }
//    }

//    self.validationError = ko.observable();
//    self.validate = function () {
//        var success = true;
//        var error = null;
//        if (validation instanceof Array) { 
//            validation.forEach(function (propertyVal) {
//                propertyVal.every(function (valOn) { 
//                    var conditionMet = true;
//                    if(valOn.conditions instanceof Array){
//                        valOn.conditions.every(function (condition) {
//                            var conditionTarget = data[condition.target + edit.extension];
//                            conditionMet = conditionMet && validateFor[condition.type].call(self, conditionTarget, condition.args);
//                            return conditionMet; // if conditionMet == false, breaks out of every
//                        });
//                    }
//                    if(conditionMet){
//                        valOn.rules.every(function (rule) {
//                            error = rule.error;
//                            success = success && validateFor[rule.type].call(self, valOn.args);
//                            return success;
//                        });
//                    }
//                    return success;
//                })
//            });
//        }
//        self.validationError(success? null : error)
//        return success;
//    };
    
//    self.dismiss = function () {
//        self.validationError(null);
//    }
//}

//// ko.bindingHandlers.singleFieldValidation = {
////     init: function (element, valueAccessor, allBindings, viewModel, context) {
////         var self = this;
////         var editValue = valueAccessor();
////         var validateOn = allBindings().validate;
////         var single = {
////             value: editValue
////         };
////         single.validation = validateOn ? new ValidationModel(editValue, validateOn) : null;
////         var innerBindingContext = context.createChildContext(single);
////         ko.applyBindingsToDescendants(innerBindingContext, element);
////         return { controlsDescendantBindings: true };
////     }
//// }
//// ko.virtualElements.allowedBindings.singleFieldValidation = true;


//ko.bindingHandlers.extendContext = {
//    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
//        var name = ko.unwrap(valueAccessor());
//        var obj = allBindings().object;
//        var skip = allBindings().skip;
//        if(name != null && skip == false && !bindingContext[name]) {
//            var data = {};
//            data[name] = obj;
//            var innerBindingContext = bindingContext.extend(data);
//            ko.applyBindingsToDescendants(innerBindingContext, element);
//            return { controlsDescendantBindings: true };   
//        }
//    }
//}
//ko.virtualElements.allowedBindings.extendContext = true;

//ko.bindingHandlers.validationOnEvent = {
//    init: function (element, valueAccessor, allBindings, viewModel, context) {
//        var callback = {}
//        callback.pos = allBindings().posBack; 
//        callback.neg = allBindings().negBack;
//        var data = {
//            pos: function () { click('pos'); },
//            neg: function () { click('neg'); },
//            counter: ko.observable()
//        };

//        function click(action) { 
//            var resultSuccess = true;
//            var count = 0;
//            if (context.validationContext) {
//                context.validationContext.forEach(function (inp) {
//                    if (action == 'neg'){
//                        inp.dismiss()
//                    } else if (inp.validate() == false) { 
//                        count++;
//                        resultSuccess = false;
//                    }
//                })
//            }
//            data.counter(count);
//            if (resultSuccess)
//                callback[action]();
//        }
//        var innerBindingContext = context.createChildContext(data);
//        ko.applyBindingsToDescendants(innerBindingContext, element);
//        return { controlsDescendantBindings: true };
//    }
//}
//ko.virtualElements.allowedBindings.validationOnEvent = true;


//ko.bindingHandlers.validationMessage = {
//    init: function (element, valueAccessor, allBindings, viewModel, context) {
//        if (context.validationContext && ko.unwrap(viewModel.validation)) {
//            var targetId = ko.unwrap(valueAccessor());
//            var validationObj = viewModel.validation;
//            var trigger = validationObj.validationError;

//            $(element).append($('#' + targetId).html());
//            context.validationContext.push(validationObj);
//            ko.computed(function () {
//                var val = ko.unwrap(trigger);
//                if (val)
//                    $(element).addClass("custom-invalid");
//                else
//                    $(element).removeClass("custom-invalid");
//            });
//            element.addEventListener('click', function () {
//                validationObj.dismiss();
//            })
//        }
//    }
//}
//ko.virtualElements.allowedBindings.validationMessage = true;

//module.exports = {
//    ValidationModel: ValidationModel
//}