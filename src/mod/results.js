var Widget = require("wdg");
var Detail = require("detail");
var Data = require("data");



/**
 * @param {array} results  - Chaque élément de `results`  est un objet
 * décrivant une aire pour CampingCar. Les attributs sont les suivants
 * :
 * * __name__ : Nom de l'aire ou du lieu où elle se trouve.
 */
exports.display = function(results) {
    var div = new Widget({id: "results"});
    div.clear(Widget.tag("center").text("( cliquez sur les icônes pour plus de détails )"));
    results.forEach(function (result) {
        appendArea(result, div);
    });
};


function appendArea(area, div) {
    var table = Widget.div("result");
    var row = Widget.div();
    var url = 'url(css/main/' + Data.getType(area.type) + '.gif)';
    var icon = Widget.div('icon').attr("title", url).css('backgroundImage', url);
    icon.addEvent('touchstart', function() {
        Detail.display(area);
    });
    row.append(
        icon,
        Widget.div().append(
            Widget.div("name").text(area.name).append(
                Widget.tag("span", "km").text(Math.ceil(area.$dis / 1000) + " km")
            ),
            Widget.div("address").text(area.adresse)
        )
    );
    table.append(row);
    div.append(table);
}
