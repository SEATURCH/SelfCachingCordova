var picturesManager = require('../helper/pictureManager.js');


ko.bindingHandlers.imagesUpload = {
  init: function (element, valueAccessor, allBindings, data, context) {
    var  imgs = valueAccessor() || [];
    var camButton = $(`<div class="btn">
      <h5><i class="fas fa-camera p-3"></i></h5>
    </div>`);
    var attButton = $(`<div class="btn">
        <h5><i class="far fa-copy p-3"></i></h5>
    </div>`);
    var takeImage = function(source){
      return picturesManager.addImage(source).then(function(newimg){
        var newMapped = defaultMap(null, "FileData");
        ko.mapping.fromJS(newimg, newMapped);
        imgs.push(newMapped);
      });
    }
    $(camButton).on('click', function(){ takeImage(Camera.PictureSourceType.CAMERA); });
    $(attButton).on('click', function(){ takeImage(Camera.PictureSourceType.SAVEDPHOTOALBUM); });
    $(element).append(camButton);
    $(element).append(attButton);
    $(element).append('<div class="m-0 position-static" data-bind="imageList: imgs"></div>');

    var innerBindingContext = context.createChildContext({ imgs: imgs });
    ko.applyBindingsToDescendants(innerBindingContext, element);
    return { controlsDescendantBindings: true };
  }
}

ko.bindingHandlers.pictureURL = {
  init: function (element, valueAccessor, allBindings, data, bindingContext) {
    var fileEntry = valueAccessor();
    picturesManager.getImagePath(ko.unwrap(fileEntry.Id) || ko.unwrap(fileEntry.Url)).then(function(uri){
      element.src = uri;
    });
  }
}