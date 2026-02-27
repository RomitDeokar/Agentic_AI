// ============================================
// Perfect Itinerary Display with Multimedia
// ============================================

function displayItinerary(itinerary) {
    console.log('📅 Displaying itinerary with multimedia:', itinerary);
    
    const timeline = document.getElementById('timelineContent');
    if (!timeline || !itinerary || !itinerary.days) {
        console.error('Cannot display itinerary');
        return;
    }
    
    timeline.innerHTML = '';
    
    itinerary.days.forEach(day => {
        if (!day.activities) return;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        
        const dayCost = day.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
        
        dayElement.innerHTML = `
            <div class="day-header">
                <h4>Day ${day.day} ${day.date ? `- ${new Date(day.date).toLocaleDateString('en-US', {weekday: 'short', month: 'short', day: 'numeric'})}` : ''}</h4>
                <span class="day-cost">₹${dayCost.toLocaleString()}</span>
            </div>
            <div class="day-activities">
                ${day.activities.map((act, idx) => createActivityCard(act, day.day, idx)).join('')}
            </div>
        `;
        
        timeline.appendChild(dayElement);
    });
    
    // Update map
    if (typeof updateMapWithItinerary === 'function') {
        updateMapWithItinerary(itinerary);
    }
}

function createActivityCard(activity, day, index) {
    const media = activity.media || {};
    const wiki = activity.wikipedia || {};
    
    return `
        <div class="activity-card" data-category="${activity.category || 'default'}">
            <div class="activity-time">${activity.time || '00:00'}</div>
            <div class="activity-details">
                <h5>${activity.name || activity.activity || 'Activity'}</h5>
                <p><i class="fas fa-map-marker-alt"></i> ${activity.location || 'Location'}</p>
                <p class="activity-description">${activity.description || ''}</p>
                <div class="activity-meta">
                    <span><i class="fas fa-clock"></i> ${activity.duration || 'N/A'}</span>
                    <span><i class="fas fa-rupee-sign"></i> ${activity.cost || 0}</span>
                    <span><i class="fas fa-star"></i> ${activity.rating || 4.5}</span>
                </div>
            </div>
            
            ${createMediaSection(activity.name, media, wiki)}
        </div>
    `;
}

function createMediaSection(placeName, media, wiki) {
    if (!media || Object.keys(media).length === 0) return '';
    
    return `
        <div class="activity-media">
            <div class="media-buttons">
                ${media.photos && media.photos[0] ? `
                    <a href="${media.photos[0]}" target="_blank" class="media-btn">
                        <i class="fas fa-camera"></i> Photos
                    </a>
                ` : ''}
                
                ${media.videos && media.videos.youtube_search ? `
                    <a href="${media.videos.youtube_search}" target="_blank" class="media-btn">
                        <i class="fab fa-youtube"></i> Videos
                    </a>
                ` : ''}
                
                ${media.reviews && media.reviews.tripadvisor ? `
                    <a href="${media.reviews.tripadvisor}" target="_blank" class="media-btn">
                        <i class="fas fa-star"></i> Reviews
                    </a>
                ` : ''}
                
                ${media.maps && media.maps.google_maps ? `
                    <a href="${media.maps.google_maps}" target="_blank" class="media-btn">
                        <i class="fas fa-map"></i> Maps
                    </a>
                ` : ''}
                
                ${wiki && wiki.url ? `
                    <a href="${wiki.url}" target="_blank" class="media-btn">
                        <i class="fab fa-wikipedia-w"></i> Wikipedia
                    </a>
                ` : ''}
            </div>
            
            ${media.photos && media.photos[0] ? `
                <img src="${media.photos[0]}" alt="${placeName}" class="activity-photo" 
                     onclick="window.open('${media.photos[0]}', '_blank')"
                     onerror="this.style.display='none'">
            ` : ''}
        </div>
    `;
}

function updateWeatherCards(weather) {
    const container = document.getElementById('weatherCards');
    if (!container || !weather || !weather.forecasts) return;
    
    console.log('🌤️  Updating weather cards');
    
    container.innerHTML = weather.forecasts.map(forecast => {
        const date = new Date(forecast.date);
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
        
        const iconMap = {
            'Sunny': 'fa-sun',
            'Partly Cloudy': 'fa-cloud-sun',
            'Cloudy': 'fa-cloud',
            'Rainy': 'fa-cloud-rain',
            'Stormy': 'fa-bolt'
        };
        
        const icon = iconMap[forecast.condition] || 'fa-cloud';
        
        return `
            <div class="weather-card">
                <div class="weather-date">${dateStr}</div>
                <div class="weather-icon">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="weather-temp">${forecast.temp}°C</div>
                <div class="weather-condition">${forecast.condition}</div>
                <div class="weather-precip">${forecast.precipitation || 0}% rain</div>
            </div>
        `;
    }).join('');
}

function updateBudgetBreakdown(budget) {
    if (!budget) return;
    
    console.log('💰 Updating budget');
    
    const budgetFill = document.querySelector('.budget-fill');
    const budgetUsed = document.querySelector('.budget-used');
    const budgetTotal = document.querySelector('.budget-total');
    
    if (budgetFill && budget.total) {
        const percentage = (budget.used / budget.total) * 100;
        budgetFill.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    if (budgetUsed) {
        budgetUsed.textContent = `₹${Math.round(budget.used).toLocaleString()}`;
    }
    
    if (budgetTotal) {
        budgetTotal.textContent = `/ ₹${Math.round(budget.total).toLocaleString()}`;
    }
}

function updateExplanation(explanation) {
    const panel = document.getElementById('explainabilityPanel');
    if (!panel) return;
    
    panel.innerHTML = `
        <div class="explanation-card">
            <div class="explanation-header">
                <i class="fas fa-lightbulb agent-icon"></i>
                <span>AI Explanation</span>
            </div>
            <p>${explanation || 'Itinerary generated successfully with real locations and multimedia content.'}</p>
        </div>
    `;
}

// Enhanced trip form handler
function initTripForm() {
    const form = document.getElementById('tripForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const destination = document.getElementById('destination').value.trim();
        const duration = parseInt(document.getElementById('duration').value);
        const budget = parseFloat(document.getElementById('budget').value);
        const startDate = document.getElementById('startDate').value;
        
        if (!destination || !duration || !budget || !startDate) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        const tripData = {
            destination,
            duration,
            budget,
            start_date: startDate,
            preferences: getSelectedPreferences(),
            persona: STATE.persona || 'solo'
        };
        
        console.log('🚀 Generating itinerary for:', tripData);
        
        showLoading('Creating your perfect itinerary with photos, videos & reviews...');
        
        try {
            const response = await fetch('http://localhost:8000/api/plan-trip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tripData)
            });
            
            if (!response.ok) throw new Error('API request failed');
            
            const result = await response.json();
            
            console.log('✅ Itinerary received:', result);
            
            // Display itinerary
            displayItinerary(result);
            
            // Update weather
            if (result.weather) {
                updateWeatherCards(result.weather);
            }
            
            // Update budget
            if (result.budget) {
                updateBudgetBreakdown(result.budget);
            }
            
            // Update explanation
            updateExplanation(result.summary || result.explanation);
            
            hideLoading();
            showNotification('✨ Perfect itinerary created with multimedia content!', 'success');
            
        } catch (error) {
            console.error('❌ Error:', error);
            hideLoading();
            showNotification('Error generating itinerary. Please try again.', 'error');
        }
    });
}

function getSelectedPreferences() {
    const tags = document.querySelectorAll('.preference-tags .tag.active');
    return Array.from(tags).map(tag => tag.getAttribute('data-pref'));
}

function showLoading(text) {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay) overlay.style.display = 'flex';
    if (loadingText) loadingText.textContent = text;
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.style.display = 'none';
}

function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTripForm();
    
    // Set default start date
    const startDateInput = document.getElementById('startDate');
    if (startDateInput && !startDateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Preference tag toggles
    document.querySelectorAll('.preference-tags .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    console.log('✅ Perfect UI loaded with multimedia support!');
});
