function pagesDataManager(structure, action) {
    var self = this;

    function constructUrl(controller, action) {
        return '/' + controller + '/' + action;
    }

    structure.forEach(function (controllerDef) {
        var controller = {};
        controllerDef.EndpointDefinitions.forEach(function (endPointDef) {
            var endPoint = {};
            var url = constructUrl(controllerDef.Name, endPointDef.Name)
            if (endPointDef.Get) endPoint.Get = url;
            if (endPointDef.Post) endPoint.Post = url;

            controller[endPointDef.Name.toLowerCase()] = endPoint;
        });
        self[controllerDef.Name.toLowerCase()] = controller;
    });

    if (action) {
        return new dataManager(action);
    }

    self.getDataManager = function (action) {
        return new dataManager(action);
    }

    function dataManager(action) {
        var dmSelf = this;
        var pageActions = self[action.Key.toLowerCase()][action.Value.toLowerCase()] || {};
        dmSelf.Action = action;
        dmSelf.Controller = self[action.Key.toLowerCase()];
        dmSelf.Submit = pageActions.Post || "Page does not have defined submission URL";
        dmSelf.Get = pageActions.Get || "Page does not have defined retrieval URL";
    }
}
