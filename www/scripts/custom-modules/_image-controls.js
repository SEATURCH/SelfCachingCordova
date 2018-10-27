var picturesManager = require('../helper/pictureManager.js');

ko.bindingHandlers.pictureControl = {
  init: function (element, valueAccessor, allBindings, data, bindingContext) {
    var imgs = valueAccessor() || [];
    var camButton = $(`<div class="btn">
      <h5><i class="fas fa-camera p-3"></i></h5>
    </div>`);
    var attButton = $(`<div class="btn">
        <h5><i class="far fa-copy p-3"></i></h5>
    </div>`);
    var takeImage = function(source){
      return picturesManager.addImage(source).then(function(newimg){
        imgs.push(newimg);
      });
    }
    $(camButton).on('click', function(){ takeImage(Camera.PictureSourceType.CAMERA); });
    $(attButton).on('click', function(){ takeImage(Camera.PictureSourceType.SAVEDPHOTOALBUM); });
    $(element).append(camButton);
    $(element).append(attButton);
  }
}

ko.bindingHandlers.pictureURL = {
  init: function (element, valueAccessor, allBindings, data, bindingContext) {
    var fileEntry = valueAccessor();
    picturesManager.getImagePath(fileEntry.Id || fileEntry.Url).then(function(uri){
      element.src = uri;
    });
  }
}