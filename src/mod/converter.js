exports.toHexagesimal = function( value ) {
    var x, xMin, xSec;
    if (value < 0) {
        // Négatif.
        value = -value;
        x = Math.floor( value );
        xMin = Math.floor( (value - x) * 60 );
        xSec = Math.ceil( (value - x) * 3600 ) % 60;
        return -x + "°" + xMin + "'" + xSec + "''";
        
    } else {
        // Positif.
        x = Math.floor( value );
        xMin = Math.floor( (value - x) * 60 );
        xSec = Math.floor( (value - x) * 3600 ) % 60;
        return x + "°" + xMin + "'" + xSec + "''";
    }
};
