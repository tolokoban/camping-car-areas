var Request = require('request');
var Crypto = require("crypto");
var Path = require("path");
var FS = require("fs");

var Parser = require("./parser");


/**
 * Requête sur le site `campingcar-infos` pour récupérer les données des aires de parking.
 * La seule protection de ce site est qu'il s'attend à avoir l'en-tête HTTP suivant :
 *  `Referer=http://www.campingcar-infos.com/Francais/ccib.php`
 */
function download(url, caption) {
    return new Promise(function (resolve, reject) {
        var sha1 = Crypto.createHash('sha1');
        sha1.update(url);
        var hash = sha1.digest('hex') + '.tmp';
        if (FS.existsSync(hash)) {
            // A cache file already exists, don't download it again.
            resolve(FS.readFileSync(hash).toString());
        } else {
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
        }
    });
}


function purify(text) {
    [
        ['&#xB0;','°'],['&#xB1;','±'],['&#xB2;','²'],['&#xB3;','³'],['&#xB4;','´'],['&#xB5;','µ'],
        ['&#xB6;','¶'],['&#xB7;','·'],['&#xB8;','¸'],['&#xB9;','¹'],['&#xBA;','º'],['&#xBB;','»'],
        ['&#xBC;','¼'],['&#xBD;','½'],['&#xBE;','¾'],['&#xBF;','¿'],['&#xC0;','À'],['&#xC1;','Á'],
        ['&#xC2;','Â'],['&#xC3;','Ã'],['&#xC4;','Ä'],['&#xC5;','Å'],['&#xC6;','Æ'],['&#xC7;','Ç'],
        ['&#xC8;','È'],['&#xC9;','É'],['&#xCA;','Ê'],['&#xCB;','Ë'],['&#xCC;','Ì'],['&#xCD;','Í'],
        ['&#xCE;','Î'],['&#xCF;','Ï'],['&#xD0;','Ð'],['&#xD1;','Ñ'],['&#xD2;','Ò'],['&#xD3;','Ó'],
        ['&#xD4;','Ô'],['&#xD5;','Õ'],['&#xD6;','Ö'],['&#xD7;','×'],['&#xD8;','Ø'],['&#xD9;','Ù'],
        ['&#xDA;','Ú'],['&#xDB;','Û'],['&#xDC;','Ü'],['&#xDD;','Ý'],['&#xDE;','Þ'],['&#xDF;','ß'],
        ['&#xE0;','à'],['&#xE1;','á'],['&#xE2;','â'],['&#xE3;','ã'],['&#xE4;','ä'],['&#xE5;','å'],
        ['&#xE6;','æ'],['&#xE7;','ç'],['&#xE8;','è'],['&#xE9;','é'],['&#xEA;','ê'],['&#xEB;','ë'],
        ['&#xEC;','ì'],['&#xED;','í'],['&#xEE;','î'],['&#xEF;','ï'],['&#xF0;','ð'],['&#xF1;','ñ'],
        ['&#xF2;','ò'],['&#xF3;','ó'],['&#xF4;','ô'],['&#xF5;','õ'],['&#xF6;','ö'],['&#xF7;','÷'],
        ['&#xF8;','ø'],['&#xF9;','ù'],['&#xFA;','ú'],['&#xFB;','û'],['&#xFC;','ü'],['&#xFD;','ý'],
        ['&#xFE;', 'þ'],
        ['&#xFF;', 'ÿ'],
        ['&#8364;', '€'],
        ['&lt;/br&gt;', ''],
        ['&#9;', ' '],
        ['&#10;', '\n'],
        ['&lt;', '<'],
        ['&gt;', '>'],
        ['&amp;', '&']
    ].forEach(function (item) {
        var index = 0,
            pos,
            find = item[0],
            repl = item[1];
        while ((pos = text.indexOf(find, index)) > -1) {
            text = text.substr(0, pos) + repl + text.substr(pos + find.length);
            index = pos + repl.length;
        }
    });

    text = text.trim();
    if (!isNaN(parseFloat(text))) {
        if (text.length == ("" + parseFloat(text)).length) {
            return parseFloat(text);
        }
    }
    return text;
}



var countries = [
    'ALBANIE', 
    'ALLEMAGNE/16', 'ALLEMAGNE/19', 'ALLEMAGNE/8', 'ALLEMAGNE/12', 
    'ALLEMAGNE/5', 'ALLEMAGNE/6', 'ALLEMAGNE/11', 'ALLEMAGNE/15', 
    'ALLEMAGNE/7', 'ALLEMAGNE/14', 'ALLEMAGNE/1', 'ALLEMAGNE/13', 
    'ANDORRE', 'AUTRICHE', 'BELGIQUE',
    'BIELORUSSIE', 'BOSNIE', 'BULGARIE', 'CROATIE', 'DANEMARK',
    'ESPAGNE', 'ESTONIE', 'FINLANDE',
    'FRANCE/01', 'FRANCE/02', 'FRANCE/03', 'FRANCE/04', 'FRANCE/05', 'FRANCE/06', 
    'FRANCE/07', 'FRANCE/08', 'FRANCE/09', 'FRANCE/10', 'FRANCE/11', 'FRANCE/12', 
    'FRANCE/13', 'FRANCE/14', 'FRANCE/15', 'FRANCE/16', 'FRANCE/17', 'FRANCE/18', 
    'FRANCE/19', 'FRANCE/2A', 'FRANCE/2B', 'FRANCE/21', 'FRANCE/22', 'FRANCE/23', 
    'FRANCE/24', 'FRANCE/25', 'FRANCE/26', 'FRANCE/27', 'FRANCE/28', 'FRANCE/29', 
    'FRANCE/30', 'FRANCE/31', 'FRANCE/32', 'FRANCE/33', 'FRANCE/34', 'FRANCE/35', 
    'FRANCE/36', 'FRANCE/37', 'FRANCE/38', 'FRANCE/39', 'FRANCE/40', 'FRANCE/41', 
    'FRANCE/42', 'FRANCE/43', 'FRANCE/44', 'FRANCE/45', 'FRANCE/46', 'FRANCE/47', 
    'FRANCE/48', 'FRANCE/49', 'FRANCE/50', 'FRANCE/51', 'FRANCE/52', 'FRANCE/53', 
    'FRANCE/54', 'FRANCE/55', 'FRANCE/56', 'FRANCE/57', 'FRANCE/58', 'FRANCE/59', 
    'FRANCE/60', 'FRANCE/61', 'FRANCE/62', 'FRANCE/63', 'FRANCE/64', 'FRANCE/65', 
    'FRANCE/66', 'FRANCE/67', 'FRANCE/68', 'FRANCE/69', 'FRANCE/70', 'FRANCE/71', 
    'FRANCE/72', 'FRANCE/73', 'FRANCE/74', 'FRANCE/75', 'FRANCE/76', 'FRANCE/77', 
    'FRANCE/78', 'FRANCE/79', 'FRANCE/80', 'FRANCE/81', 'FRANCE/82', 'FRANCE/83', 
    'FRANCE/84', 'FRANCE/85', 'FRANCE/86', 'FRANCE/87', 'FRANCE/88', 'FRANCE/89', 
    'FRANCE/90', 'FRANCE/91', 'FRANCE/92', 'FRANCE/93', 'FRANCE/94', 'FRANCE/95', 
    'FRANCE/221', 'FRANCE/222',
    'GRANDE-BRETAGNE',
    'GRECE', 'HONGRIE', 'IRLANDE', 'ISLANDE', 
    "ITALIE/20", "ITALIE/23", "ITALIE/24", "ITALIE/25", "ITALIE/26", "ITALIE/27",
    "ITALIE/28", "ITALIE/29", "ITALIE/30", "ITALIE/31", "ITALIE/32", "ITALIE/33",
    "ITALIE/22", "ITALIE/34", "ITALIE/35", "ITALIE/36", "ITALIE/37", "ITALIE/38",
    "ITALIE/21", "ITALIE/40",
    'LETTONIE', 'LIECHTENSTEIN', 'LITUANIE', 'LUXEMBOURG', 'MACEDOINE',
    'MAROC', 'MAURITANIE', 'NORVEGE', 'PAYS-BAS', 'POLOGNE',
    'PORTUGAL', 'ROUMANIE', 'RUSSIE', 'SERBIE_MONTENEGRO', 'SLOVAQUIE',
    'SLOVENIE', 'SUEDE', 'SUISSE', 'TCHEQUIE', 'TUNISIE',
    'TURQUIE',
    'UKRAINE'
];


var areas = {
    'name': [],
    'adresse': [],
    'lat': [],
    'lng': [],
    'type': [],
    'pays': [],
    'dept': [],
    'tarif': [],
    'typeborne': [],
    'ep': [],
    'veu': [],
    'vWC': [],
    'be': [],
    'wc': [],
    'wifi': [],
    'vu': [],
    'services': [],
    'infos': [],
    'comments': [],
    'photos': []
};
var keys = {};
var types = ['APCC', 'AA', 'AC', 'ACS', 'APN', 'ASN', 'AS', 'ACF'];
var fields = ['name', 'adresse', 'lat', 'lng', 'type', 'pays', 'dept', 'tarif', 'typeborne', 'ep', 'veu', 'vWC', 'be', 'wc', 'wifi', 'vu', 'services', 'infos'];


var countriesCount = countries.length;


function generateOutputs() {
    // Répertoire destination.
    var path = "./CampingCarAreas/";

    console.log("Saving to `" + path + "`.");
    // Tout d'abord, on trie par longitude.
    var indexes = [];
    var indexes_for_sorting = [];
    var i;
    for (i = 0; i < areas.lng.length; i++) {
        indexes_for_sorting.push([i, areas.lng[i]]);
    }
    indexes_for_sorting.sort(function(a, b) {
        return a[1] - b[1];
    });
    indexes_for_sorting.forEach(function (itm) {
        indexes.push(itm[0]);
    });

    // Créer le fichier `index.json`.
    // C'est  un  tableau  dont  chaque élément  d'index  pair  est  une
    // __latitude__   et  chaque   élément   d'index   impair  est   une
    // __longitude__. Les  latitudes et longitudes sont  multipliées par
    // 1'000'000 et converties en nombres entiers avant stoquage.
    var data_latlng = [];
    indexes.forEach(function (index) {
        var lat = areas.lat[index];
        var lng = areas.lng[index];
        data_latlng.push(Math.floor(.5 + lat * 1000000));
        data_latlng.push(Math.floor(.5 + lng * 1000000));
    });
    var currentDate = new Date();
    var data_index = {
        latlng: data_latlng,
        types: types,
        countries: countries,
        date: currentDate.getDay() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getFullYear()
    };
    console.log("Writing `index.json`...");
    FS.writeFileSync(Path.join(path, 'index.json'), JSON.stringify(data_index));

    // On  va  maintenant découper  les  aires  par  blocs de  256  afin
    // d'alléger les besoins en mémoire vive de l'application.
    var blocNumber = 0;
    var blocSize = 256;
    function save(start) {
        var data = {};
        var key;
        var j;
        for (key in areas) {
            data[key] = [];
        }
        for (j = start; j < Math.min(start + 256, indexes.length); j++) {
            for (key in areas) {
                data[key].push(areas[key][indexes[j]]);
            }
        }
        FS.writeFileSync(
            Path.join(path, Math.floor(start / blocSize) + '.json'),
            JSON.stringify(data));
    }
    for (i = blocSize; i < indexes.length; i += blocSize) {
        save(i - blocSize);
        console.log("   " + (Math.floor(1000 * i / indexes.length) / 10) + " %");
    }
    save(i - blocSize);
    console.log("done.");
}


countries.forEach(function (country) {
    var parts = country.split("/");
    var query = "pays=" + country;
    if (parts.length > 1) {
        query = "pays=" + parts[0] + "&dept=" + parts[1];
    }

    download(
        'http://www.campingcar-infos.com/Francais/generexmla.php?' + query,
        country + ": areas..."
    ).then(
        function(body) {
            console.log(country + ": areas.   OK!");
            var area,
                attName, attValue,
                parser = new Parser(body);
            while (parser.findAndSkip('<aire ')) {
                area = {};
                while ((attName = parser.getAttributeName()) != null) {
                    attValue = parser.getAttributeValue();
                    if (attValue == null) break;
                    area[attName] = purify(attValue);
                }
                area.type = types.indexOf(area.type);
                keys[area.numid] = areas.name.length;
                areas.comments.push([]);
                areas.photos.push([]);
                fields.forEach(function (field) {
                    areas[field].push(area[field]);
                });
            }

            return download(
                'http://www.campingcar-infos.com/Francais/creexmlcomccia.php?' + query,
                country + ': comments...'
            );
        }
    ).then(
        function(body) {
            console.log(country + ": comments.   OK!");
            var comment,
                comments,
                numid,
                attName, attValue,
                parser = new Parser(body);
            while (parser.findAndSkip('<commentaire ')) {
                comment = {};
                while ((attName = parser.getAttributeName()) != null) {
                    attValue = parser.getAttributeValue();
                    if (attValue == null) break;
                    comment[attName] = purify(attValue);
                }
                numid = keys["" + comment.numid];
                if (numid) {
                    comments = areas.comments[numid];
                    comments.push(comment.date_saisie + "\n" + purify(comment.com));
                }
            }


            return download(
                'http://www.campingcar-infos.com/Francais/creexmlphotosccia.php?' + query,
                country + ': photos...'
            );
        }
    ).then(
        function(body) {
            console.log(country + ": photos.   OK!");
            var photo,
                photos,
                photoName,
                numid,
                attName, attValue,
                parser = new Parser(body);
            while (parser.findAndSkip('<photo ')) {
                photo = {};
                while ((attName = parser.getAttributeName()) != null) {
                    attValue = parser.getAttributeValue();
                    if (attValue == null) break;
                    photo[attName] = purify(attValue);
                }
                numid = keys["" + photo.numid];
                if (numid) {
                    photos = areas.photos[numid];
                    photoName = photo.url.substr(0, photo.url.length - 4);
                    if (photos.indexOf(photoName) < 0) {
                        // Inutile d'ajouter les photos en double.
                        photos.push(photoName);
                    }
                }
            }

            countriesCount--;
            if (countriesCount <= 0) {
                // On a tout téléchargé, on peut générer les fichiers de sortie.
                generateOutputs();
            }
        });


});


//download('http://www.campingcar-infos.com/Francais/creexmlphotosccia.php?pays=FRANCE').then(function(body) {
