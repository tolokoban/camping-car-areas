exports.config={
    name:"CampingCarAreas",
    description:"Offline application finding the nearest camping-cars areas with comments and photos.",
    author:"Tolokoban",
    version:"0.2.1",
    major:0,
    minor:2,
    revision:1,
    date:new Date(2016,9,17,10,40,44)
};
var currentLang = null;
exports.lang = function(lang) {
    if (lang === undefined) {
        if (window.localStorage) {
            lang = window.localStorage.getItem("Language");
        }
        if (!lang) {
            lang = window.navigator.language;
            if (!lang) {
                lang = window.navigator.browserLanguage;
                if (!lang) {
                    lang = "fr";
                }
            }
        }
        lang = lang.substr(0, 2).toLowerCase();
    }
    currentLang = lang;
    if (window.localStorage) {
        window.localStorage.setItem("Language", lang);
    }
    return lang;
};
exports.intl = function(words, params) {
    var dic = words[exports.lang()],
    k = params[0],
    txt, newTxt, i, c, lastIdx, pos;
    if (!dic) {
        //console.error("Missing internationalization for language : \"" + exports.lang() + "\"!");
        return k;
    }
    txt = dic[k];
    if (!txt) {
        //console.error("Missing internationalization [" + exports.lang() + "]: \"" + k + "\"!");
        return k;
    }
    if (params.length > 1) {
        newTxt = "";
        lastIdx = 0;
        for (i = 0 ; i < txt.length ; i++) {
            c = txt.charAt(i);
            if (c === '$') {
                newTxt += txt.substring(lastIdx, i);
                i++;
                pos = txt.charCodeAt(i) - 48;
                if (pos < 0 || pos >= params.length) {
                    newTxt += "$" + txt.charAt(i);
                } else {
                    newTxt += params[pos];
                }
                lastIdx = i + 1;
            } else if (c === '\\') {
                newTxt += txt.substring(lastIdx, i);
                i++;
                newTxt += txt.charAt(i);
                lastIdx = i + 1;
            }
        }
        newTxt += txt.substr(lastIdx);
        txt = newTxt;
    }
    return txt;
};
