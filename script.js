const pubnub = new PubNub({
    publishKey: "pub-c-b34ec225-e227-4a75-b8b7-45958644f07f",
    subscribeKey: "sub-c-1a48de9d-bfef-4c59-b911-5f400664dc60",
    uuid: "tracker-device"
});
const CHANNEL_NAME = "gps_tracking";

let map, marker, watchId;
let lastUpdate = 0;

function initMap(lat = 42.372330, lng = -71.133632) {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: lat, lng: lng },
        zoom: 15,
    });
    marker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: map,
    });
} 

function startTracking() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
    }
    if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                if (now - lastUpdate > 1000) { // Update every second
                    updateLocation(position.coords.latitude, position.coords.longitude);
                    lastUpdate = now;
                }
            },
            () => {
                alert("Geolocation failed.");
            },
            { enableHighAccuracy: true }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function updateLocation(lat, lng) {
    const newPosition = { lat: lat, lng: lng };
    map.setCenter(newPosition);
    marker.setPosition(newPosition);
    
    // Publish location to PubNub
    pubnub.publish({
        channel: CHANNEL_NAME,
        message: newPosition
    });
}

window.onload = () => initMap();
