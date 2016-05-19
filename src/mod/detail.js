var Converter = require("converter");
var Photos = require("photos");
var Widget = require("wdg");
var T = Widget.tag;

exports.display = function(area) {
    Widget.create({id: "detail-name"}).text(area.name);
    var div = new Widget({id: "detail"});
    div.clear();
    if (area.photos.length > 0) {
        var btn = T("a").attr('href', '#/book/photos').addClass("button");
        btn.text("Voir " + (area.photos.length > 1 ? "les " + area.photos.length + " photos" : "la photo"));
        div.append(T("center").append(btn));
        Photos(area.photos);
    }
    div.append(
        P( Converter.toHexagesimal( area.lat ) + " ; " + Converter.toHexagesimal( area.lng ) + "\n"
           + area.lat + " ; " + area.lng ),
        H('Adresse'),
        P(area.adresse),
        H('Informations'),
        P(area.infos),
        H('Tarif'),
        P(area.tarif)
    );

    if (area.services.length > 0) {
        div.append(
            H('Service'),
            P(area.services)
        );
    }

    div.append(H('Commentaires'));
    if (area.comments.length > 0) {
        area.comments.forEach(function (comment) {
            div.append(
                T("blockquote").append(P(comment))
            );
        });
    } else {
        div.append(P("Aucun commentaire."));
    }

    location.hash = "/book/detail";
};

function H(title) {
    return T("h1").text(title);
}

function P(code) {
    if (!code) code = '';
    code = code.replace(/[\n\r]+/g, '<br/>');
    var e = T("p");
    e.html(code);
    return e;
}
