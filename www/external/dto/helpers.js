﻿var helpers = {
    groupBy: function (data, key) {
        return data.reduce(function (result, current) {
            var keyValue = ko.unwrap(current[key]);
            result[keyValue] = result[keyValue] || [];
            result[keyValue].push(current);
            return result;
        }, {});
    }
};