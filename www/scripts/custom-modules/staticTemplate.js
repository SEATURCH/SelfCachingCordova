var ko = require('knockout');
var Swipe = require('swipejs');
var $ = require('jquery');

ko.bindingHandlers.staticTemplate = {
  init: function (element, valueAccessor, allBindingsAccessor, data, context) {
      var templateId = valueAccessor();
      $(element).append(window.templates[templateId]);
      
  }
}
