var Widget = require("wdg");
var Data = require("data");


var PHOTOS = [];


module.exports = function(photos) {
    PHOTOS = photos.slice();
    var div = Widget.create({id: 'photos'});
    div.clear();

    function nextPhoto() {
        if (PHOTOS.length == 0) return;
        
        var photo = PHOTOS.pop();
        var src = "photos/" + photo + ".jpg";

        Data.loadPhotoDataURI(src).then(function (dataURL) {
            div.append(
                Widget.tag('img').attr("src", dataURL)
            );
            nextPhoto();
        }).catch(function (err) {
            div.append(
                Widget.tag('p').text("Impossible de trouver la photo " + photo + ".jpg !")
            );
            nextPhoto();
        });        
    }

    nextPhoto();
};
