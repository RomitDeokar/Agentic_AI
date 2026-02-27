// ============================================
// SmartRoute v5.0 - Main UI Controller
// ============================================

const API_BASE_URL = 'http://localhost:8000';

let currentItinerary = null;

// ============================================
// Initialize Application
// ============================================

function initializeApp() {
    console.log('🚀 Initializing SmartRoute v5.0...');
    
    // Initialize map
    if (typeof initMap === 'function') {
        initMap();
    }
    
    // Set default date to today
    const dateInput = document.getElementById('startDate');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }
    
    // Check backend health
    checkBackendHealth();
    
    // Setup event listeners
    setupEventListeners();
    
    console.log('✅ Application initialized');
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Generate trip button
    const generateBtn = document.getElementById('generateTripBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', handleGenerateTrip);
    }
    
    // Modal close button
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeMediaModal);
    }
    
    // Close modal on outside click
    const modalOverlay = document.getElementById('mediaModal');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeMediaModal();
            }
        });
    }
    
    console.log('✅ Event listeners setup complete');
}

// ============================================
// Backend Communication
// ============================================

async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        
        console.log('🏥 Backend health:', data);
        
        if (data.status === 'healthy') {
            showToast('Connected to SmartRoute backend', 'success');
        } else {
            showToast('Backend connection issues', 'warning');
        }
    } catch (error) {
        console.error('❌ Backend health check failed:', error);
        showToast('Backend not available - using offline mode', 'warning');
    }
}

async function handleGenerateTrip() {
    console.log('🎯 Generating trip...');
    
    // Get form values
    const destination = document.getElementById('destination')?.value;
    const duration = parseInt(document.getElementById('duration')?.value || '3');
    const budget = parseFloat(document.getElementById('budget')?.value || '15000');
    const startDate = document.getElementById('startDate')?.value;
    const persona = document.getElementById('personaSelect')?.value || 'solo';
    
    // Get selected preferences
    const preferences = [];
    document.querySelectorAll('.preference-tag.active').forEach(tag => {
        preferences.push(tag.dataset.preference);
    });
    
    // Validation
    if (!destination || destination.trim() === '') {
        showToast('Please enter a destination', 'error');
        return;
    }
    
    if (!startDate) {
        showToast('Please select a start date', 'error');
        return;
    }
    
    const tripRequest = {
        destination: destination.trim(),
        duration,
        budget,
        start_date: startDate,
        preferences: preferences.length > 0 ? preferences : ['cultural', 'adventure', 'food'],
        persona
    };
    
    console.log('📝 Trip request:', tripRequest);
    
    // Show loading
    showLoading(true);
    
    try {
        const response = await fetch(`${API_BASE_URL}/generate-trip`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(tripRequest)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.itinerary) {
            console.log('✅ Itinerary generated:', data.itinerary);
            currentItinerary = data.itinerary;
            
            // Display itinerary
            displayItinerary(data.itinerary);
            
            // Update map
            if (typeof updateMapWithItinerary === 'function') {
                updateMapWithItinerary(data.itinerary);
            }
            
            // Update budget tracker
            updateBudgetTracker(data.itinerary);
            
            showToast('Trip generated successfully!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('❌ Error generating trip:', error);
        showToast(`Error: ${error.message}`, 'error');
        
        // Fallback to demo itinerary
        console.log('📝 Using fallback demo itinerary');
        generateDemoItinerary(tripRequest);
        
    } finally {
        showLoading(false);
    }
}

// ============================================
// Display Functions
// ============================================

function displayItinerary(itinerary) {
    const container = document.getElementById('itineraryContainer');
    if (!container) {
        console.error('❌ Itinerary container not found');
        return;
    }
    
    if (!itinerary || !itinerary.days || itinerary.days.length === 0) {
        container.innerHTML = '<p class="text-center">No itinerary to display</p>';
        return;
    }
    
    let html = '';
    
    itinerary.days.forEach((day, index) => {
        const dayDate = new Date(day.date || Date.now());
        const formattedDate = dayDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        html += `
            <div class="day-card" data-day="${day.day}">
                <div class="day-header">
                    <div>
                        <div class="day-title">Day ${day.day} - ${day.city || 'Unknown City'}</div>
                        <div class="day-date">${formattedDate}</div>
                    </div>
                    <div class="day-cost">₹${(day.daily_cost || 0).toLocaleString()}</div>
                </div>
                <div class="activities-container">
                    ${(day.activities || []).map((activity, actIndex) => `
                        <div class="activity-card type-${activity.type || 'default'}" 
                             data-activity-index="${actIndex}"
                             onclick="showActivityDetails(${index}, ${actIndex})">
                            <div class="activity-header">
                                <div class="activity-name">${activity.name || 'Activity'}</div>
                                <div class="activity-time">⏰ ${activity.time || 'TBD'}</div>
                            </div>
                            <div class="activity-details">
                                <span>⏱️ ${activity.duration || 'N/A'}</span>
                                <span>💰 ₹${(activity.cost || 0).toLocaleString()}</span>
                                <span>📍 ${activity.type || 'Activity'}</span>
                            </div>
                            ${activity.description ? `
                                <div class="activity-description">${activity.description}</div>
                            ` : ''}
                            ${activity.media ? `
                                <button class="activity-media-btn" onclick="event.stopPropagation(); showActivityMedia('${activity.name}', ${JSON.stringify(activity.media).replace(/"/g, '&quot;')})">
                                    📸 View Photos & Videos
                                </button>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });
    
    // Add summary
    const totalCost = itinerary.total_cost || itinerary.days.reduce((sum, day) => sum + (day.daily_cost || 0), 0);
    html += `
        <div class="itinerary-summary">
            <h3>Trip Summary</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-label">Total Days</div>
                    <div class="stat-value">${itinerary.days.length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Total Cost</div>
                    <div class="stat-value">₹${totalCost.toLocaleString()}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Cities</div>
                    <div class="stat-value">${(itinerary.cities || ['1']).length}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">Activities</div>
                    <div class="stat-value">${itinerary.days.reduce((sum, day) => sum + (day.activities?.length || 0), 0)}</div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    // Add CSS for summary if not exists
    if (!document.getElementById('itinerary-summary-style')) {
        const style = document.createElement('style');
        style.id = 'itinerary-summary-style';
        style.textContent = `
            .itinerary-summary {
                background: rgba(255, 255, 255, 0.03);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 24px;
                margin-top: 24px;
            }
            .itinerary-summary h3 {
                font-size: 24px;
                font-weight: 800;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                margin-bottom: 20px;
            }
            .summary-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 16px;
            }
            .stat-item {
                text-align: center;
                padding: 16px;
                background: rgba(102, 126, 234, 0.1);
                border-radius: 12px;
            }
            .stat-label {
                font-size: 14px;
                color: #a0a0b2;
                margin-bottom: 8px;
            }
            .stat-value {
                font-size: 24px;
                font-weight: 700;
                color: #667eea;
            }
            .activity-description {
                margin-top: 8px;
                font-size: 14px;
                color: #a0a0b2;
                line-height: 1.5;
            }
        `;
        document.head.appendChild(style);
    }
    
    console.log('✅ Itinerary displayed');
}

function updateBudgetTracker(itinerary) {
    if (!itinerary) return;
    
    const totalCost = itinerary.total_cost || 0;
    const budgetUsedEl = document.querySelector('.budget-used');
    const budgetFillEl = document.querySelector('.budget-fill');
    
    if (budgetUsedEl) {
        budgetUsedEl.textContent = `₹${totalCost.toLocaleString()}`;
    }
    
    if (budgetFillEl) {
        const budgetTotal = parseFloat(document.getElementById('budget')?.value || 15000);
        const percentage = Math.min((totalCost / budgetTotal) * 100, 100);
        budgetFillEl.style.width = `${percentage}%`;
    }
}

// ============================================
// Demo Fallback
// ============================================

function generateDemoItinerary(request) {
    const demoItinerary = {
        days: [
            {
                day: 1,
                date: request.start_date,
                city: request.destination,
                activities: [
                    {
                        name: `${request.destination} City Tour`,
                        time: '09:00',
                        duration: '3 hours',
                        cost: 1000,
                        type: 'cultural',
                        description: 'Explore the beautiful city landmarks',
                        lat: 28.6139 + Math.random() * 0.1,
                        lon: 77.2090 + Math.random() * 0.1,
                        media: {
                            photos: [
                                `https://source.unsplash.com/800x600/?${request.destination},city`,
                                `https://source.unsplash.com/800x600/?${request.destination},landmark`
                            ],
                            videos: {
                                youtube_search: `https://www.youtube.com/results?search_query=${request.destination}+travel+guide`
                            },
                            reviews: {
                                google: `https://www.google.com/search?q=${request.destination}+reviews`,
                                tripadvisor: `https://www.tripadvisor.com/Search?q=${request.destination}`
                            },
                            maps: {
                                google: `https://www.google.com/maps/search/?api=1&query=${request.destination}`,
                                osm: `https://www.openstreetmap.org/search?query=${request.destination}`
                            }
                        }
                    },
                    {
                        name: 'Local Food Market',
                        time: '13:00',
                        duration: '2 hours',
                        cost: 800,
                        type: 'food',
                        description: 'Taste authentic local cuisine',
                        lat: 28.6139 + Math.random() * 0.1,
                        lon: 77.2090 + Math.random() * 0.1,
                        media: {
                            photos: [
                                `https://source.unsplash.com/800x600/?${request.destination},food`
                            ],
                            videos: {
                                youtube_search: `https://www.youtube.com/results?search_query=${request.destination}+food`
                            },
                            reviews: {
                                google: `https://www.google.com/search?q=${request.destination}+food+reviews`
                            }
                        }
                    }
                ],
                daily_cost: 1800
            }
        ],
        total_cost: 1800,
        cities: [request.destination]
    };
    
    currentItinerary = demoItinerary;
    displayItinerary(demoItinerary);
    
    if (typeof updateMapWithItinerary === 'function') {
        updateMapWithItinerary(demoItinerary);
    }
    
    showToast('Demo itinerary loaded (backend unavailable)', 'info');
}

// ============================================
// UI Helpers
// ============================================

function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        if (show) {
            overlay.classList.add('active');
        } else {
            overlay.classList.remove('active');
        }
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) {
        console.warn('Toast container not found');
        return;
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

window.showActivityDetails = function(dayIndex, activityIndex) {
    if (!currentItinerary) return;
    
    const activity = currentItinerary.days[dayIndex]?.activities[activityIndex];
    if (!activity) return;
    
    console.log('Activity details:', activity);
    
    if (activity.media) {
        showActivityMedia(activity.name, activity.media);
    }
};

// ============================================
// Theme Toggle
// ============================================

window.toggleTheme = function() {
    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    showToast('Theme toggled', 'info');
};

// ============================================
// Demo Mode
// ============================================

window.startAutoDemo = function() {
    showToast('Starting demo mode...', 'info');
    
    // Set demo values
    document.getElementById('destination').value = 'Paris';
    document.getElementById('duration').value = '3';
    document.getElementById('budget').value = '50000';
    
    setTimeout(() => {
        handleGenerateTrip();
    }, 500);
};

// ============================================
// Initialize on Load
// ============================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

console.log('✅ Main UI module loaded');
