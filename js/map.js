// ============================================
// SmartRoute v5.0 - Map Integration
// FREE OpenStreetMap with Leaflet.js
// ============================================

let map = null;
let markers = [];
let routePolyline = null;
let markerCluster = null;

// Color scheme for activity types
const ACTIVITY_COLORS = {
    cultural: '#f59e0b',
    adventure: '#10b981',
    food: '#ef4444',
    shopping: '#8b5cf6',
    relaxation: '#06b6d4',
    nightlife: '#ec4899',
    default: '#667eea'
};

// Custom marker icons
const createCustomIcon = (color, dayNumber) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <div style="
                background: linear-gradient(135deg, ${color} 0%, ${adjustColor(color, -20)} 100%);
                width: 40px;
                height: 40px;
                border-radius: 50% 50% 50% 0;
                border: 3px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 14px;
                transform: rotate(-45deg);
                position: relative;
            ">
                <span style="transform: rotate(45deg);">${dayNumber}</span>
            </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [12, 40],
        popupAnchor: [8, -40]
    });
};

// Adjust color brightness
function adjustColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255))
        .toString(16).slice(1);
}

// Initialize map
function initMap() {
    console.log('🗺️  Initializing OpenStreetMap with Leaflet...');
    
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
        console.error('❌ Map container #map not found');
        return;
    }

    try {
        // Create Leaflet map centered on world
        map = L.map('map', {
            center: [20, 0],
            zoom: 2,
            zoomControl: true,
            attributionControl: true
        });

        // Add beautiful tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
            minZoom: 2
        }).addTo(map);

        // Add custom CSS for markers
        const style = document.createElement('style');
        style.textContent = `
            .custom-marker {
                background: transparent !important;
                border: none !important;
            }
            .leaflet-popup-content-wrapper {
                background: rgba(15, 17, 23, 0.95);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(102, 126, 234, 0.3);
                border-radius: 12px;
                padding: 0;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            }
            .leaflet-popup-content {
                margin: 0;
                padding: 16px;
                color: white;
                font-family: 'Inter', sans-serif;
            }
            .leaflet-popup-tip {
                background: rgba(15, 17, 23, 0.95);
                border: 1px solid rgba(102, 126, 234, 0.3);
            }
            .popup-title {
                font-size: 18px;
                font-weight: 700;
                margin-bottom: 8px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            .popup-info {
                font-size: 14px;
                color: #a0a0b2;
                margin-bottom: 4px;
            }
            .popup-cost {
                font-size: 16px;
                font-weight: 600;
                color: #4facfe;
                margin-top: 8px;
            }
            .popup-media-btn {
                margin-top: 12px;
                padding: 8px 16px;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: white;
                border: none;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                width: 100%;
                transition: transform 0.2s;
            }
            .popup-media-btn:hover {
                transform: translateY(-2px);
            }
        `;
        document.head.appendChild(style);

        console.log('✅ Map initialized successfully!');
        
        // Show success toast
        showToast('Map loaded successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Map initialization failed:', error);
        showToast('Map initialization failed', 'error');
    }
}

// Clear all markers from map
function clearMarkers() {
    if (markers && markers.length > 0) {
        markers.forEach(marker => {
            if (marker && map) {
                map.removeLayer(marker);
            }
        });
        markers = [];
    }
    
    if (routePolyline && map) {
        map.removeLayer(routePolyline);
        routePolyline = null;
    }
    
    console.log('🗺️  Cleared all markers');
}

// Update map with itinerary data
function updateMapWithItinerary(itinerary) {
    if (!map) {
        console.error('❌ Map not initialized');
        initMap();
        setTimeout(() => updateMapWithItinerary(itinerary), 1000);
        return;
    }

    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        console.error('❌ Invalid itinerary data');
        return;
    }

    console.log('🗺️  Updating map with itinerary:', itinerary);

    clearMarkers();

    const allCoordinates = [];
    let activityCounter = 1;

    // Process each day
    itinerary.days.forEach((day, dayIndex) => {
        if (!day.activities || day.activities.length === 0) {
            console.warn(`⚠️  Day ${day.day} has no activities`);
            return;
        }

        // Process each activity
        day.activities.forEach((activity, actIndex) => {
            const lat = parseFloat(activity.lat);
            const lon = parseFloat(activity.lon);

            // Validate coordinates
            if (isNaN(lat) || isNaN(lon)) {
                console.warn(`⚠️  Invalid coordinates for ${activity.name}:`, activity);
                return;
            }

            // Add to coordinates array
            allCoordinates.push([lat, lon]);

            // Get color for activity type
            const activityColor = ACTIVITY_COLORS[activity.type] || ACTIVITY_COLORS.default;

            // Create custom marker
            const markerIcon = createCustomIcon(activityColor, activityCounter++);
            
            const marker = L.marker([lat, lon], { icon: markerIcon })
                .addTo(map);

            // Create popup content
            const popupContent = `
                <div class="popup-title">${activity.name}</div>
                <div class="popup-info">⏰ ${activity.time || 'N/A'} • ${activity.duration || 'N/A'}</div>
                <div class="popup-info">📍 Day ${day.day} • ${activity.type || 'Activity'}</div>
                <div class="popup-cost">💰 ₹${activity.cost || 0}</div>
                ${activity.media ? `<button class="popup-media-btn" onclick="showActivityMedia('${activity.name}', ${JSON.stringify(activity.media).replace(/"/g, '&quot;')})">
                    📸 View Photos & Videos
                </button>` : ''}
            `;

            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            markers.push(marker);

            console.log(`✅ Added marker for ${activity.name} at [${lat}, ${lon}]`);
        });
    });

    // Draw route line
    if (allCoordinates.length > 1) {
        routePolyline = L.polyline(allCoordinates, {
            color: '#667eea',
            weight: 3,
            opacity: 0.7,
            smoothFactor: 1,
            dashArray: '10, 10'
        }).addTo(map);

        // Animate the route
        let offset = 0;
        setInterval(() => {
            offset = (offset + 1) % 20;
            if (routePolyline) {
                routePolyline.setStyle({ dashOffset: offset });
            }
        }, 100);
    }

    // Fit map bounds to show all markers
    if (allCoordinates.length > 0) {
        const bounds = L.latLngBounds(allCoordinates);
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 13,
            animate: true,
            duration: 1.0
        });
        
        console.log(`✅ Map updated with ${allCoordinates.length} locations`);
        showToast(`Showing ${allCoordinates.length} destinations on map`, 'success');
    } else {
        console.warn('⚠️  No valid coordinates to display');
        showToast('No valid locations to display', 'warning');
    }
}

// Show activity media modal
window.showActivityMedia = function(activityName, media) {
    if (!media) {
        console.warn('No media data for:', activityName);
        return;
    }

    const modal = document.getElementById('mediaModal');
    if (!modal) {
        console.error('Media modal not found');
        return;
    }

    // Update modal content
    document.getElementById('modalActivityName').textContent = activityName;

    // Update photos
    const photoGrid = document.getElementById('modalPhotoGrid');
    if (photoGrid && media.photos) {
        photoGrid.innerHTML = media.photos.map(url => `
            <div class="photo-item">
                <img src="${url}" alt="${activityName}" loading="lazy" 
                     onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
            </div>
        `).join('');
    }

    // Update video links
    const videoLinks = document.getElementById('modalVideoLinks');
    if (videoLinks && media.videos) {
        videoLinks.innerHTML = `
            <a href="${media.videos.youtube_search}" target="_blank" class="link-btn">
                <i class="fab fa-youtube"></i> Watch on YouTube
            </a>
        `;
    }

    // Update review links
    const reviewLinks = document.getElementById('modalReviewLinks');
    if (reviewLinks && media.reviews) {
        reviewLinks.innerHTML = `
            <a href="${media.reviews.google}" target="_blank" class="link-btn">
                <i class="fab fa-google"></i> Google Reviews
            </a>
            <a href="${media.reviews.tripadvisor}" target="_blank" class="link-btn">
                <i class="fab fa-tripadvisor"></i> TripAdvisor
            </a>
        `;
    }

    // Update map links
    const mapLinks = document.getElementById('modalMapLinks');
    if (mapLinks && media.maps) {
        mapLinks.innerHTML = `
            <a href="${media.maps.google}" target="_blank" class="link-btn">
                <i class="fas fa-map-marked-alt"></i> Google Maps
            </a>
            <a href="${media.maps.osm}" target="_blank" class="link-btn">
                <i class="fas fa-map"></i> OpenStreetMap
            </a>
        `;
    }

    // Show modal
    modal.classList.add('active');
};

// Close media modal
window.closeMediaModal = function() {
    const modal = document.getElementById('mediaModal');
    if (modal) {
        modal.classList.remove('active');
    }
};

// Toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toastContainer');
    if (container) {
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize map on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMap);
} else {
    initMap();
}

// Export functions
window.initMap = initMap;
window.updateMapWithItinerary = updateMapWithItinerary;
window.clearMarkers = clearMarkers;

console.log('✅ Map module loaded successfully');
