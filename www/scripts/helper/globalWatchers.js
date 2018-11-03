var processing =  {
    count: ko.observable(0),
    add: function() { 
        var newCount = this.count();
        this.count(++newCount);
    },
    end: function() { 
        if(this.count() > 0){
            var newCount = this.count();
            this.count(--newCount);
        }
    }
}

module.exports = {
	processing: processing
}
