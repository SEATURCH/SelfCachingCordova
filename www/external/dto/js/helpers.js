var helpers = {
    groupBy: function (data, key) {
        if (data == null) return [];
        var groups = [];
        if ($.isFunction(key)) {
            var hashes = data.reduce(function (result, current) {
                var keyValueObj = key(current);
                var keyValue = JSON.stringify(keyValueObj);
                result[keyValue] = result[keyValue] || [];
                result[keyValue].push(current);
                return result;
            }, {});
            $.each(hashes, function (key, value) {
                groups.push({ Key: JSON.parse(key), Items: value });
            });
        } else {
            return data.reduce(function (result, current) {
                var keyValue = ko.unwrap(current[key]);
                result[keyValue] = result[keyValue] || [];
                result[keyValue].push(current);
                return result;
            }, {});
            $.each(hashes, function (key, value) {
                groups.push({ Key: key, Items: value });
            })
        }
        return groups;



        //var groups = [];

        //data.forEach(function (item) {
        //    var keyValue = ko.unwrap(item[key]);
        //    var relevantGroup = null;
        //    groups.forEach(function (groupItem) {
        //        if (groupItem.Key == keyValue) relevantGroup = groupItem;
        //    });
        //    if (relevantGroup == null) {
        //        relevantGroup = { Key: keyValue, Items: [] };
        //        groups.push(relevantGroup);
        //    }
        //    relevantGroup.Items.push(item);

        //});
        //return groups;
    },
    orderBy: function (data, key) {
        if (data == null || data.length == 0) return [];
        return data.sort(function (a, b) {
            var aKey = ko.unwrap(a[key]);
            var bKey = ko.unwrap(b[key]);
            if (aKey < bKey)
                return -1
            if (aKey > bKey)
                return 1
            return 0;
        });
    },
    linkNavigation: function (url) {
        var parser = $('#linkNav').length ? $('#linkNav')[0] : $('<a id="linkNav" class="d-none"></a>').appendTo('body')[0];
        parser.href = url;
        parser.click();
    }

};