// ============================================
// Mapbox Integration and Visualization
// ============================================

let map;
let markers = [];
let routeLayer = null;
let heatmapVisible = false;

// Initialize Mapbox Map
function initializeMap() {
    mapboxgl.accessToken = CONFIG.MAPBOX_TOKEN;
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [74.2179, 27.0238], // Rajasthan center
        zoom: 6,
        pitch: 45,
        bearing: 0
    });
    
    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Add map load event
    map.on('load', () => {
        AgentLog.info('Map', 'Interactive map initialized');
        
        // Load initial route
        if (STATE.currentItinerary) {
            visualizeRoute(STATE.currentItinerary);
        } else {
            // Show default Rajasthan route
            visualizeDefaultRoute();
        }
    });
}

// Visualize default route
function visualizeDefaultRoute() {
    const destination = CONFIG.DESTINATIONS['Rajasthan, India'];
    if (!destination) return;
    
    // Clear existing markers
    clearMarkers();
    
    // Add city markers
    destination.cities.forEach((city, idx) => {
        const marker = new mapboxgl.Marker({
            color: '#9333EA'
        })
        .setLngLat(city.coords)
        .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="padding: 8px;">
                <h3 style="margin: 0 0 4px 0; font-size: 16px;">${city.name}</h3>
                <p style="margin: 0; font-size: 12px; color: #6B7280;">Day ${idx + 1}</p>
            </div>
        `))
        .addTo(map);
        
        markers.push(marker);
    });
    
    // Draw route line
    drawRoute(destination.cities.map(c => c.coords));
}

// Visualize itinerary route
function visualizeRoute(itinerary) {
    if (!map || !itinerary) return;
    
    clearMarkers();
    
    const coordinates = [];
    
    itinerary.days.forEach((day, idx) => {
        const destination = CONFIG.DESTINATIONS['Rajasthan, India'];
        const city = destination?.cities.find(c => c.name === day.city);
        
        if (city) {
            coordinates.push(city.coords);
            
            // Add marker
            const marker = new mapboxgl.Marker({
                color: idx === 0 ? '#4F46E5' : (idx === itinerary.days.length - 1 ? '#10B981' : '#9333EA')
            })
            .setLngLat(city.coords)
            .setPopup(new mapboxgl.Popup().setHTML(`
                <div style="padding: 12px; min-width: 200px;">
                    <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700;">${city.name}</h3>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">Day ${day.day} - ${day.date}</p>
                    <div style="margin-top: 8px; border-top: 1px solid #E5E7EB; padding-top: 8px;">
                        <p style="margin: 0; font-size: 11px; font-weight: 600;">Activities:</p>
                        ${day.activities.map(a => `
                            <p style="margin: 4px 0 0 0; font-size: 11px;">• ${a.name}</p>
                        `).join('')}
                    </div>
                </div>
            `))
            .addTo(map);
            
            markers.push(marker);
        }
    });
    
    // Draw route
    if (coordinates.length > 1) {
        drawRoute(coordinates);
        
        // Fit map to route
        const bounds = coordinates.reduce((bounds, coord) => {
            return bounds.extend(coord);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
        
        map.fitBounds(bounds, {
            padding: 50,
            duration: 1000
        });
    }
}

// Draw route line on map
function drawRoute(coordinates) {
    if (!map || coordinates.length < 2) return;
    
    // Remove existing route
    if (routeLayer && map.getLayer('route')) {
        map.removeLayer('route');
        map.removeSource('route');
    }
    
    // Add route source and layer
    map.addSource('route', {
        type: 'geojson',
        data: {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: coordinates
            }
        }
    });
    
    map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': '#9333EA',
            'line-width': 4,
            'line-opacity': 0.8
        }
    });
    
    routeLayer = 'route';
}

// Clear all markers
function clearMarkers() {
    markers.forEach(marker => marker.remove());
    markers = [];
}

// Zoom controls
function zoomIn() {
    if (map) {
        map.zoomIn({ duration: 500 });
    }
}

function zoomOut() {
    if (map) {
        map.zoomOut({ duration: 500 });
    }
}

// Toggle heatmap overlay
function toggleHeatmap() {
    heatmapVisible = !heatmapVisible;
    
    if (heatmapVisible) {
        addCrowdHeatmap();
        showToast('Crowd heatmap enabled', 'info');
    } else {
        removeCrowdHeatmap();
        showToast('Crowd heatmap disabled', 'info');
    }
}

// Add crowd density heatmap
function addCrowdHeatmap() {
    if (!map) return;
    
    // Simulate crowd data points
    const destination = CONFIG.DESTINATIONS['Rajasthan, India'];
    if (!destination) return;
    
    const heatmapData = {
        type: 'FeatureCollection',
        features: destination.cities.map(city => ({
            type: 'Feature',
            properties: {
                intensity: Utils.random(0.5, 1)
            },
            geometry: {
                type: 'Point',
                coordinates: city.coords
            }
        }))
    };
    
    map.addSource('crowd-heatmap', {
        type: 'geojson',
        data: heatmapData
    });
    
    map.addLayer({
        id: 'crowd-heatmap',
        type: 'heatmap',
        source: 'crowd-heatmap',
        paint: {
            'heatmap-weight': ['get', 'intensity'],
            'heatmap-intensity': 1,
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(33,102,172,0)',
                0.2, 'rgb(103,169,207)',
                0.4, 'rgb(209,229,240)',
                0.6, 'rgb(253,219,199)',
                0.8, 'rgb(239,138,98)',
                1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 50,
            'heatmap-opacity': 0.7
        }
    });
}

// Remove crowd heatmap
function removeCrowdHeatmap() {
    if (!map) return;
    
    if (map.getLayer('crowd-heatmap')) {
        map.removeLayer('crowd-heatmap');
    }
    if (map.getSource('crowd-heatmap')) {
        map.removeSource('crowd-heatmap');
    }
}

// Update weather cards
function updateWeatherCards() {
    const container = document.getElementById('weatherCards');
    if (!container) return;
    
    const days = ['Today', 'Tomorrow', 'Day 3'];
    const conditions = [
        { icon: '☀️', temp: 28, condition: 'Sunny', prob: 85 },
        { icon: '⛅', temp: 26, condition: 'Cloudy', prob: 70 },
        { icon: '☀️', temp: 29, condition: 'Sunny', prob: 80 }
    ];
    
    container.innerHTML = conditions.map((weather, idx) => `
        <div class="weather-card">
            <div class="weather-info">
                <h4>${days[idx]}</h4>
                <p>${weather.condition} - ${weather.temp}°C</p>
                <p style="font-size: 11px; color: var(--text-tertiary); margin-top: 4px;">
                    Probability: ${weather.prob}%
                </p>
            </div>
            <div class="weather-icon">${weather.icon}</div>
        </div>
    `).join('');
}

// Update crowd heatmap data
function updateCrowdData() {
    const container = document.getElementById('crowdHeatmap');
    if (!container) return;
    
    const locations = [
        { name: 'Amber Fort', level: 'high' },
        { name: 'City Palace', level: 'medium' },
        { name: 'Hawa Mahal', level: 'high' },
        { name: 'Jaigarh Fort', level: 'low' }
    ];
    
    container.innerHTML = locations.map(loc => `
        <div class="crowd-item">
            <span>${loc.name}</span>
            <span class="crowd-level ${loc.level}">${loc.level.toUpperCase()}</span>
        </div>
    `).join('');
}

// Initialize map and visualizations
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    updateWeatherCards();
    updateCrowdData();
});
