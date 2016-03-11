var POSITION = null;
var STATUS = 0;
var STATUS_TEXT = {
    0: "Not started.",
    1: "PERMISSION DENIED",
    2: "UNAVAILABLE POSITION",
    3: "TIME OUT",
    9: "device without GPS antenna",
    10: "waiting for first point",
    20: "waiting for next point",
    30: "ok"
};


exports.getPosition = function() {
    return POSITION;
};

exports.getStatus = function() {
    return STATUS;
};

exports.getStatusText = function() {
    return STATUS_TEXT[STATUS];
};

exports.init = function(onchange) {
    if (typeof onchange === 'undefined') onchange = function() {};
    STATUS = 0;
    if ("geolocation" in navigator) {
        STATUS = 10;
        navigator.geolocation.getCurrentPosition(
            function(p) {
                POSITION = p;
                STATUS = 20;
                onchange();
                startWatch(onchange);
            },
            function(err) {
                console.info("[gps] err=...", err);
                if (err.code == 1) {
                    STATUS = 1;
                    onchange();
                }
            }
        );
    } else {
        STATUS = 9;
    }
    onchange();
};


function startWatch(onchange) {
    navigator.geolocation.watchPosition(
        function(p) {
            POSITION = p;
            STATUS = 30;
            onchange(self);
        },
        function(err) {
            console.info("[gps] err=...", err);
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0
        }
    );
}
