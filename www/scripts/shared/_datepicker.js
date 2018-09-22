// Assume that passed in value from valueAccssor is an ISOString
ko.bindingHandlers.dateTimePicker = {
 	init: function (element, valueAccessor, allBindings, viewModel, context) {    
        var initDate = valueAccessor();
        var mode = allBindings().mode || "date";

        // Picker tool
        var dateTimePicker = function (options) {
            // Mobile
            if (cordova)
                cordova.plugins.DateTimePicker.show(options);
        }

        var opts = {
		    mode: mode,
		    date: ko.unwrap(initDate) || new Date(),
		    locale: "EN",
		    okText: "Select",
		    cancelText: "Cancel",
		    android: {
		        theme: 16974126, // Theme_DeviceDefault_Dialog
		        calendar: false,
		        is24HourView: true
		    },
		    success: function(nd) {
		        var utcDayOf = moment.utc([nd.getFullYear(), nd.getMonth() + 1, nd.getDate()].join(), "YYYY,M,DD").toISOString();
                initDate(utcDayOf);
                viewModel.validate();
		    },
		    cancel: function() {
		        console.info("Cancelled");
		    },
		    error: function (err) {
		        console.error(err);
		    }
		};
		var pickDate = function(o){
			return function() {
				dateTimePicker(o);
			}
		}(opts);

		element.addEventListener("click", pickDate);
		// Set value
		ko.computed(function(){
            var nd = ko.unwrap(initDate);
            if(nd) element.innerHTML = moment.utc(nd).format('MMM D, YYYY');
		});
		
    }
}

