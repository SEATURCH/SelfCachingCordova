var Swipe = require('swipejs');

ko.bindingHandlers.swipableTabs = {
  init: function (element, valueAccessor, allBindings, data, bindingContext) {
      var data = valueAccessor();
      var swipeTemplate = allBindings().templateId;
      $(element).addClass("swipe");
      $(element).attr("id", swipeTemplate);
      var template = "#" + swipeTemplate;
      $(element).append($('script' + template).html());
      var lastItem = data.length? data[data.length - 1]: null;
      
      var childBindingContext = bindingContext.createChildContext({
        items: data,
        afterRender: function(array, item) {
          if(item == lastItem) {
              window.mySwipe = new Swipe(element, {
                startSlide: 0,
                speed:150,
                // auto: 3000,
                draggable: true,
                autoRestart: false,
                continuous: false,
                // disableScroll: true,
                stopPropagation: true,
                callback: function(index, element) {},
                transitionEnd: function(index, element) {}
              });
          }
        }
      });
      ko.applyBindingsToDescendants(childBindingContext, element);
      
      return { controlsDescendantBindings: true };

  }
}
