ko.bindingHandlers.drawer = {
	init: function (element, valueAccessor, allBindings, viewModel, context) { 
		// Enabled is a function returning a boolean that is evalutated on event. Drawer actions only occur if enabled evalutates true;
		var enabled = valueAccessor();
		var firstTouch = null;
		var extended = {
			showDrawer: ko.observable(false)
		}

		element.addEventListener('touchend', function(a){
			if(firstTouch != null) {
				var endTouch = a.changedTouches[0];
				if(!extended.showDrawer()){
					if(firstTouch.clientX < 15 && (endTouch.clientX - firstTouch.clientX) > 25) extended.showDrawer(true)
				} else {
					if(firstTouch.clientX - endTouch.clientX > 30) extended.showDrawer(false);
				}
				firstTouch = null;
			}
		});
		element.addEventListener('touchstart', function(a){
			if(enabled && enabled())
				firstTouch = a.touches[0];
		} );

		
        var innerBindingContext = context.extend(extended);
        ko.applyBindingsToDescendants(innerBindingContext, element);
        return { controlsDescendantBindings: true };
	}
}
ko.virtualElements.allowedBindings.drawer = true;
