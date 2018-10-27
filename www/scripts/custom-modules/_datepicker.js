var dateTimePicker = function (options) {
    // Mobile
    if(cordova) 
	    cordova.plugins.DateTimePicker.show(options);
}

// Assume that passed in value from valueAccssor is an ISOString
ko.bindingHandlers.dateTimePicker = {
 	init: function (element, valueAccessor, allBindings, viewModel, context) {    
        var initDate = valueAccessor();
        var mode = allBindings().mode || "date";
    
		var pickDate = function(){
			var d = ko.unwrap(initDate)? new Date(ko.unwrap(initDate)) : new Date();
			var options = {
			    type: mode,         // 'date' or 'time', required
			    date: d
			};
			window.DateTimePicker.pick(options, function(timestamp) {
		        var utcDayOf = moment.utc(timestamp).toISOString();
	            initDate(utcDayOf);
	            viewModel.validate();
		    });
		};

		element.addEventListener("click", pickDate);
		// Set value
		ko.computed(function(){
            var nd = ko.unwrap(initDate);
            if(nd) element.innerHTML = moment.utc(nd).format('MMM D, YYYY');
		});
		
    }
}

