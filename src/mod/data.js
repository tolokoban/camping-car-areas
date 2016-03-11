/***********************************************
 L'accès aux données de l'application se fait par ce module.

 Ces données sont stoquées sur la SDCard. L'accès se fait comme ceci :
 [https://developer.mozilla.org/en-US/docs/Web/API/Device_Storage_API]

 ***********************************************/

// Constante : nombre maximal d'aires à afficher pour chaque recherche.
var MAX_NB_RESULTS = 30;


exports.ERR_NO_NAVIGATOR = 1;
exports.ERR_NO_DEVICE_STORAGE = 2;
exports.ERR_UNAVAILABLE_DEVICE = 3;
exports.ERR_SHARED_DEVICE = 4;
exports.ERR_INDEX_NOT_FOUND = 5;
exports.ERR_INVALID_INDEX = 6;


// Detected SD Card where the DB is stored.
var SDCARD = null;
// Parsed content of "CampingCarAreas/index.json".
var INDEX;
// Path of the DB: for instance `/sdcard/CampingCarAreas/`.
var PATH;


/**
 * @return Nombre d'aires dans la base de donnée.
 */
exports.countAreas = function() {
    return INDEX.latlng.length / 2;
};

/**
 * @return Nombre de photos dans la base de données.
 */
exports.countPhotos = function() {
    return INDEX.photos;
};

/**
 * @return Date de dernière mise à jour des données.
 */
exports.getDate = function() {
    return INDEX.date;
};

/**
 * @return Un Promise avec le Data URI d'une photo.
 */
exports.loadPhotoDataURI = function(path) {
    return new Promise(function (resolve, reject) {
        if (typeof reject !== 'function') {
            reject = function(err) {
                console.log(Error(err));
            };
        }

        var request = SDCARD.get(PATH + path);
            request.onsuccess = function() {
                var file = this.result;
                var reader = new FileReader();
                reader.onload = function() {
                    var dataURL = reader.result;
                    resolve(dataURL);
                };
                reader.readAsDataURL(file);
            };
            request.onerror = function(e) {
                reject(this.error);
            };
    });
};

/**
 * Charger en mémoire le fichiers `sdcard://CampingCarAreas/index.json`.
 * C'est un objet possédant ces attributs :
 * * __latlng__  :  tableau de  doubles.  Chaque  élément pair  est  une
 latitude, chaque élément impair est une longitude.
 * * __types__ : types d'aires ("APCC", "AA", "AC", ...).
 * * __countries__ : pays. Certains  pays sont découpés en départements,
 dans ce  cas, le nom  du pays  est suivi d'un  "/" et du  numéro du
 département. Par exemple : `FRANCE/74`.
 */
exports.init = function(resolve, reject) {
    if (!navigator) {
        console.log('ERR_NO_NAVIGATOR');
        reject(exports.ERR_NO_NAVIGATOR);
    }
    else if (typeof navigator.getDeviceStorage === 'function') {
        var sdcards = navigator.getDeviceStorages("sdcard");
        var lastError = 0;

        function nextTask() {
            if (sdcards.length > 0 && lastError == 0) {
                var sdcard = sdcards.pop();
                checkAvailability(sdcard);
            } else {
                // Il n'y a plus de tâche asynchrone à réaliser, alors on doit appeler `resolve` ou `reject`.
                if (lastError) {
                    reject(lastError);
                } else {
                    resolve();
                }
            }
        }

        function checkAvailability(sdcard) {
            var request = sdcard.available();
            request.onsuccess = function() {
                var status = this.result;
                switch (status) {
                case "available":
                    CheckForIndexJson(sdcard);
                    break;
                case "unavailable":
                    reject(exports.ERR_UNAVAILABLE_DEVICE);
                    break;
                case "shared":
                    reject(exports.ERR_SHARED_DEVICE);
                    break;
                }
            };
            request.onerror = function() {
                console.error(this.error);
            };
        }

        function CheckForIndexJson(sdcard) {
            PATH = "/" + sdcard.storageName + "/CampingCarAreas/";
            var filename = PATH + "index.json";
            var request = sdcard.get(filename);
            request.onsuccess = function() {
                var file = this.result;
                var reader = new FileReader();
                reader.onload = function() {
                    var content = reader.result;
                    try {
                        INDEX = JSON.parse(content);
                    } catch (ex) {
                        console.error(ex);
                        reject(exports.ERR_INVALID_INDEX);
                    }
                    SDCARD = sdcard;
                    resolve();
                };
                reader.readAsText(file);
            };
            request.onerror = function() {
                console.error("Unable to get file \"" + filename + "\"!");
                console.error(this.error);
            };
        }

        nextTask();
    }
    else {
        console.log('ERR_NO_DEVICE_STORAGE');
        reject(exports.ERR_NO_DEVICE_STORAGE);
    }
};

/**
 * On passe  un entier et  on reçoit  une string: 'APCC',  'AA', 'AC',
 * 'ACS', 'APN', ...
 */
exports.getType = function(index) {
    return INDEX.types[index];
};


/**
 * Calcule la distance en mètres entre deux points
 * dont on donne les coordonnées latitude/longitude
 * en argument.
 */
exports.distance = function(lat1, lng1, lat2, lng2) {
    var R = 6371; // Rayon moyen de la terre en km.
    var dLat  = Math.PI*(lat2 - lat1)/180;
    var dLong = Math.PI*(lng2 - lng1)/180;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(Math.PI*(lat1)/180)
            * Math.cos(Math.PI*(lat2)/180)
            * Math.sin(dLong/2)
            * Math.sin(dLong/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = Math.floor((R * c)*1000);
    return d;
};


exports.find = function(args, resolve, reject) {
    if (args.coords) {
        args = {lat: args.coords.latitude, lng: args.coords.longitude};
    }

console.info("[data] args=...", args);
    var i,
        lat, lng,
        dis,
        distances = [],
        latC = args.lat,
        lngC = args.lng,
        radius = args.radius,
        latlng = INDEX.latlng;
    if (typeof radius === 'undefined') radius = 100000;

    for (i = 0; i < latlng.length; i += 2) {
        lat = latlng[i] / 1000000;
        lng = latlng[i + 1] / 1000000;
        dis = exports.distance(lat, lng, latC, lngC);
        if (dis < radius) {
            // Il faut diviser `i` par 2 car il y a la paire lat, lng.
            distances.push([i >> 1, dis]);  
        }
    }
    // Trier du plus proche au plus loin.
    distances.sort(function (a,b) {
        return a[1] - b[1];
    });
    // Tronquer à 12 résultats.
    if (distances.length > MAX_NB_RESULTS) {
        distances = distances.slice(0, MAX_NB_RESULTS);
    }
    var filesList = makeFilesList(distances);
    loadFilesAsJSON(filesList, function(blocks) {
        var areas = [];
        distances.forEach(function (item) {
            var idx = item[0],
                idxH = idx >> 8,
                idxL = idx & 255,
                block = blocks[idxH + ".json"],
                key, val,
                dis = item[1],
                // Je mets un  `$` devant les variables  pour être sûr
                // de  ne  pas  entrer  en conflit  avec  un  éventuel
                // nouveau futur champ pour les aires.
                area = {$idx: idx, $dis: dis};
            for (key in block) {
                val = block[key];
                area[key] = val[idxL];
            }
            areas.push(area);
        });
        resolve(areas);
    });
};


/**
 * Le premier nombre  de chaque élément de `distances`  est l'index de
 * l'aire. Les descriptions  de ces aires sont  regroupées par paquets
 * de 256.  Ainsi, l'aire  110 et  213 sont  dans le  paquet `0.json',
 * tandis que l'aire 300 est dans `1.json`.
 * Cette  fonction  retourne la  liste  des  fichiers qui  contiennent
 * toutes les aires contenues dans `distances`.
 */
function makeFilesList(distances) {
    var filesList = [];

    distances.forEach(function (item) {
        var index = item[0] >> 8;    // Diviser par 256, c'est la taille des paquets.
        var filename = index + ".json";
        if (filesList.indexOf(filename) < 0) {
            filesList.push(filename);
        }
    });

    return filesList;
}


/**
 * @param {array} filesList - Liste de noms de fichiers JSON à charger.
 * @param  {function} resolve  -  Fonction à  appeler  quand tous  les
 * fichiers  sont chargés  et parsés.  Si un  fichier n'existe  pas ou
 * n'est pas du JSON valide, sa valeur sera `null`.
 * L'unique argument de la fonction `resolve`est un dictionnaire du type
 * { <nom du fichier>: <valeur après parsing du JSON, ou `null`}.
 */
function loadFilesAsJSON(filesList, resolve) {
    var result = {};
    var tasks = filesList.slice();
    // Load the next file.
    function loadNext() {
        if (tasks.length == 0) {
            resolve(result);
        } else {
            var filename = tasks.pop();
            result[filename] = null;
            var request = SDCARD.get(PATH + filename);
            request.onsuccess = function() {
                var file = this.result;
                var reader = new FileReader();
                reader.onload = function() {
                    var content = reader.result;
                    try {
                        result[filename] = JSON.parse(content);
                    } catch (ex) {
                        console.error("Invalid JSON for file `" + file.name + "`!");
                        console.error(ex);
                    }
                    loadNext();
                };
                reader.readAsText(file);
            };
            request.onerror = function() {
                console.error("Unable to load file `" + PATH + filename + "`!");
                console.error(this.error);
                loadNext();
            };
        }
    }
    loadNext();
}
