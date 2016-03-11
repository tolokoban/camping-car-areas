var Gps = require("gps");
var Data = require("data");
var Widget = require("wdg");
var Results = require("results");
var Config = require("$").config;


var firstGpsCoords = true;


var $ = function(path) {
    var e = document.querySelector(path);
    return new Widget({element: e});
};


exports.start = function() {
    // Attacher un événement  au bouton qui permet  d'afficher les aires
    // les plus proches d'un point GPS donné.
    $('#btnTrouver').addEvent('touchstart', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        refreshAreas(evt);
    });

    Data.init(
        function() {
            $("#init-btn").removeClass('hide');
            $("#init-msg").clear().html(
                "L'application <b>" + Config.name + "</b> est en version <b>"
                    + Config.version + "</b>.<br/><br/><br/>"
                    + "Les données trouvées sur la carte SD datent du <b>"
                    + Data.getDate() + "</b> et possèdent "
                    + "<b>" + Data.countAreas() + "</b> aires de camping-car et "
                    + "<b>" + Data.countPhotos() + "</b> photos."
            );
            console.log("Ok!");
            //location.hash = "/book/main";
        },
        function(err) {
            console.log("ERROR #" + err);
            location.hash = "/book/err-" + err;
        }
    );

    Gps.init(function() {
        var statusBar = $("#gps");
        var pos = Gps.getPosition();
        switch (Gps.getStatus()) {
            case 0: // Not Started.
            case 10: // Waiting for first point.
                statusBar.text("Recherche GPS...");
                break;
            case 1: // Permission Denied.
                statusBar.text("GPS non autorisé !");
                location.hash = "/book/err-gps";
                break;
            case 9: // No antenna.
                statusBar.text("Pas d'antenne GPS !");
                break;
            default:
                if (firstGpsCoords) {
                    firstGpsCoords = false;
                    refreshAreas();
                }
                statusBar.text(pos.coords.latitude.toFixed(6) + " ; " + pos.coords.longitude.toFixed(6));
                break;
        }
    });
};


function refreshAreas() {
        $('#results').clear("Chargement en cours...");
        Data.find(Gps.getPosition() || {lat: 46.15, lng: 6.2}, function(areas) {
            console.info("[main] areas=...", areas);
            Results.display(areas);
        });
}
