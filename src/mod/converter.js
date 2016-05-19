exports.toHexagesimal = function( value ) {
    var x = Math.floor( value );
    var xMin = Math.floor( (value - x) * 60 );
    var xSec = Math.floor( (value - x) * 3600 ) % 60;
    return x + "°" + xMin + "'" + xSec + "''";
};
