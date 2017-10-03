/**
 * Created by country on 8/6/17.
 */
var locout = null;

var location_success = function(position) {
    clear(locout);
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    locout.appendChild(document.createTextNode("Longitude: "+longitude+", Latitude: "+latitude));

    var img = new Image();
    img.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + latitude + "," + longitude + "&zoom=13&size=300x300&sensor=false";
    locout.appendChild(img);
};


var location_error = function(error) {
    clear(locout);
    locout.appendChild(document.createTextNode('ERROR(' + error.code + '): ' + error.message));
};

function get_location(success,error) {
    if ("geolocation" in navigator) {
        var geo_options = {
            enableHighAccuracy: true,
            maximumAge        : 30000,
            timeout           : 27000
        };
        navigator.geolocation.getCurrentPosition(success, error, geo_options);
    } else {
        return {
            success: false,
            message: "Sorry Geo-Location service not available"
        };
    }
    return {
        success: true,
        message: "Locating..."
    };
}

