var Request = require('request');
var Crypto = require("crypto");
var Path = require("path");
var FS = require("fs");

/**
 * Requête sur le site `campingcar-infos` pour récupérer les données des aires de parking.
 * La seule protection de ce site est qu'il s'attend à avoir l'en-tête HTTP suivant :
 *  `Referer=http://www.campingcar-infos.com/Francais/ccib.php`
 */
function download(url, caption) {
    return new Promise(function (resolve, reject) {
        // The file must be downloaded from internet.
        if (typeof caption !== 'undefined') {
            console.log(caption);
        }
        Request(
            {
                url: url,
                headers: {
                    Referer: 'http://www.campingcar-infos.com/Francais/ccib.php'  // ?pays=FRANCE'
                }
            },
            function (error, response, body) {
                if (error) {
                    reject(error);
                } else {
                    //FS.writeFileSync(hash, body);
                    resolve(body);
                }
            });
    });
}


var path = "./CampingCarAreas/photos/";

if (!FS.existsSync(path)) {
    FS.mkdirSync(path);
}


var images = [];

// Rechercher les noms des photos dans les ficihers JSON précédemment générés par `getdata.js`.
var files = FS.readdirSync("./CampingCarAreas/");
files.forEach(function (file) {
    if (file == 'index.json') return;
    try {
        var obj = JSON.parse(FS.readFileSync('./CampingCarAreas/' + file).toString());
        obj.photos.forEach(function (package) {
            package.forEach(function (photo) {
                images.push(photo);
            });
        });

    } catch (ex) {
        // On ignore allègrement les fichiers qui ne correspondent pas à ce qu'on attend.
    }
});

// Les variables `count` et `cursor` sont utilisées pour afficher un pourcentage de progression.
var count = images.length;
var cursor = 0;

var index = JSON.parse(FS.readFileSync('./CampingCarAreas/index.json').toString());
index.photos = count;
FS.writeFileSync('./CampingCarAreas/index.json', JSON.stringify(index));
console.log(count + " photos a charger.");

function next() {
    if (images.length > 0) {
        var name;
        // Cette boucle sert à ignorer les fichiers qui existent déjà.
        for(;;) {
            cursor++;
            name = images.pop();
            if (!FS.existsSync(path + name + '.jpg')) break;
        }
        Request('http://www.campingcar-infos.com/Francais/photos_copyright/' + name + '.jpg')
            .on('response', function() {
                console.log((100 * cursor / count).toFixed(1) + " %       " + name);
                next();
            })
            .pipe(FS.createWriteStream(path + name + '.jpg'));
    } else {
        console.log("Fini.");
    }
}

next();
