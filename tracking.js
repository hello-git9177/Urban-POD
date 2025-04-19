// assets/tracking.js

// Initialize the map
const map = L.map('map').setView([17.7253, 78.2572], 13); // Initial coordinates for BVRIT College

// Add a tile layer to the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define geofences
var geofences = [
    L.circle([17.7253, 78.2572], { radius: 500, color: 'red' }).addTo(map), // Geofence around BVRIT College
    L.circle([17.4948, 78.3578], { radius: 500, color: 'red' }).addTo(map), // Geofence around Miyapur
    L.circle([17.5402, 78.4583], { radius: 500, color: 'red' }).addTo(map), // Geofence around Gandimaisamma
    L.circle([17.6248, 78.0820], { radius: 500, color: 'red' }).addTo(map), // Geofence around Sangareddy
    L.circle([17.6311, 78.4828], { radius: 500, color: 'red' }).addTo(map)  // Geofence around Medchal
];

// Define the number 8-shaped railway line
var railwayLine = [
    [17.7253, 78.2572],
    [17.73, 78.25],
    [17.735, 78.2572],
    [17.73, 78.2644],
    [17.7253, 78.2572],
    [17.72, 78.25],
    [17.715, 78.2572],
    [17.72, 78.2644],
    [17.7253, 78.2572]
];

// Add the railway line to the map
var railwayPolyline = L.polyline(railwayLine, {color: 'blue'}).addTo(map);

// Define the destination points
var destinations = [
    {name: 'Miyapur', coords: [17.4948, 78.3578]},
    {name: 'Gandimaisamma', coords: [17.5402, 78.4583]},
    {name: 'Sangareddy', coords: [17.6248, 78.0820]},
    {name: 'Medchal', coords: [17.6311, 78.4828]}
];

// Add destination points to the map
destinations.forEach(function(destination) {
    L.marker(destination.coords).addTo(map)
        .bindPopup(destination.name)
        .openPopup();
});

// Existing code for marker and tracking
var customIcon = L.icon({
    iconUrl: 'assets/images/marker-icon.png', // Correct relative path
    shadowUrl: 'assets/images/marker-shadow.png', // Correct relative path
    iconSize: [25, 41], // Default size
    iconAnchor: [12, 41], // Positioning the icon properly
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const marker = L.marker([17.7253, 78.2572]).addTo(map); // Initial marker position for BVRIT College
let trackingInterval;

// Coordinates for the locations
const locations = {
    bvrit: [17.7253, 78.2572],
    miyapur: [17.4948, 78.3578],
    gandimaisamma: [17.5402, 78.4583],
    medchal: [17.6311, 78.4828],
    sangareddy: [17.6248, 78.0820]
};

// Function to generate the route based on the selected destination
function generateRoute(start, destination) {
    const route = [start, destination];
    const remainingLocations = Object.values(locations).filter(loc => loc !== start && loc !== destination);
    while (remainingLocations.length) {
        route.push(remainingLocations.shift());
    }
    route.push(start); // Close the loop
    return route;
}

// Get the selected destination from the first window
const selectedDestination = localStorage.getItem('selectedDestination') || 'miyapur';
let route = generateRoute(locations.bvrit, locations[selectedDestination]);

// Add the route to the map
let routePolyline = L.polyline(route, {color: 'green'}).addTo(map);

let index = 0; // Define the index variable in the correct scope
let lastUpdateTime = Date.now();
let lastLatLng = L.latLng(locations.bvrit);

// Function to check if the marker is within any geofence
function isWithinGeofence(latlng) {
    return geofences.some(geofence => geofence.getBounds().contains(latlng));
}

// Function to update marker position based on the generated route
function updateMarker() {
    const [lat, lng] = route[index]; // Correct order: [latitude, longitude]
    const latlng = L.latLng(lat, lng);
    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 13);
    index = (index + 1) % route.length; // Cycle through coordinates

    // Calculate speed
    const currentTime = Date.now();
    const timeDiff = (currentTime - lastUpdateTime) / 1000; // Time difference in seconds
    const distance = map.distance(lastLatLng, latlng) / 1000; // Distance in kilometers
    const speed = (distance / timeDiff) * 3600; // Speed in km/h
    document.getElementById('trackingSpeed').innerText = speed.toFixed(2);

    lastUpdateTime = currentTime;
    lastLatLng = latlng;

    // Update track location
    document.getElementById('trackLocation').innerText = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

    // Generate a random track health percentage between 90% and 100%
    const trackHealth = (Math.random() * 10 + 90).toFixed(2);
    document.getElementById('trackHealth').innerText = `${trackHealth}%`;

    // Check if the marker is within any geofence
    if (isWithinGeofence(latlng)) {
        console.log('Marker is within a geofence');
    } else {
        console.log('Marker is outside of geofences');
    }
}

// Update marker position every 5 seconds
trackingInterval = setInterval(updateMarker, 5000);

document.getElementById('emergencyStopButton').addEventListener('click', () => {
    clearInterval(trackingInterval);
    map.removeLayer(marker);
    document.getElementById('trackingSpeed').innerText = '0';
    setTimeout(() => {
        window.close();
    }, 2000); // Close the app after 2 seconds
});

// Function to update track health and location
async function updateTrackHealth() {
    try {
        const response = await fetch('http://localhost:5000/track_health');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const trackHealthInfo = await response.json();
        document.getElementById('trackHealth').innerText = `${trackHealthInfo.health}%`;
        document.getElementById('trackLocation').innerText = trackHealthInfo.location;
    } catch (error) {
        console.error('Failed to fetch track health:', error);
    }
}

// Set up WebSocket connection
const socket = new WebSocket('ws://localhost:8080');

socket.onmessage = function(event) {
    const locationUpdate = JSON.parse(event.data);

    // Check if locationUpdate contains valid lat and lng properties
    if (locationUpdate.lat !== undefined && locationUpdate.lng !== undefined) {
        const latlng = L.latLng(locationUpdate.lat, locationUpdate.lng);
        marker.setLatLng(latlng);
        map.setView(latlng, 13);

        // Check if the marker is within any geofence
        if (isWithinGeofence(latlng)) {
            console.log('Marker is within a geofence');
        } else {
            console.log('Marker is outside of geofences');
        }
    } else {
        console.error('Invalid location update received:', locationUpdate);
    }
};

// Add event listener for the Optimize Route button

// assets/tracking.js

// assets/tracking.js

document.getElementById('routeOptimizeButton').addEventListener('click', async () => {
    try {
        const selectedDestination = localStorage.getItem('selectedDestination') || 'Miyapur';
        const response = await fetch('http://localhost:5001/optimize_route', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ start: 'BVRIT College', end: selectedDestination })
        });
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const { optimizedRoute } = await response.json();

        // Remove the existing route and live tracking from the map
        if (routePolyline) {
            map.removeLayer(routePolyline);
        }
        clearInterval(trackingInterval);
        map.removeLayer(marker);

        // Highlight the optimized route
        const optimizedLatLngRoute = optimizedRoute.map(point => point.coords);
        routePolyline = L.polyline(optimizedLatLngRoute, { color: 'green' }).addTo(map);

        // Add markers for the start and end points of the optimized route
        if (optimizedLatLngRoute.length > 0) {
            const [startLat, startLng] = optimizedLatLngRoute[0];
            const [endLat, endLng] = optimizedLatLngRoute[optimizedLatLngRoute.length - 1];
            L.marker([startLat, startLng]).addTo(map).bindPopup('Start').openPopup();
            L.marker([endLat, endLng]).addTo(map).bindPopup('Destination').openPopup();
            map.setView([startLat, startLng], 13);
        }
    } catch (error) {
        console.error('Failed to fetch optimized route:', error);
        alert(`Failed to fetch optimized route: ${error.message}. Please try again later.`);
    }
});

