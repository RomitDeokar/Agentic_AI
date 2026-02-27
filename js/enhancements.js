// ============================================
// SmartRoute UI Enhancements
// ============================================

// Toggle Bottom Panel
function toggleBottomPanel() {
    const panel = document.getElementById('bottomPanel');
    const btn = document.getElementById('panelMinimizeBtn');
    
    if (panel && btn) {
        panel.classList.toggle('minimized');
        const icon = btn.querySelector('i');
        if (icon) {
            icon.className = panel.classList.contains('minimized') ? 
                'fas fa-chevron-up' : 'fas fa-chevron-down';
        }
    }
}

// MDP Settings Functions
function toggleMDPSettings() {
    const panel = document.getElementById('mdpSettingsPanel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}

function resetMDPView() {
    // Reset MDP visualization to default state
    if (window.mdpVisualization) {
        window.mdpVisualization.reset();
    }
    showNotification('MDP view reset to default', 'info');
}

function exportMDPData() {
    // Export MDP data as JSON
    const mdpData = {
        state: STATE.mdpState,
        transitions: window.mdpTransitions || [],
        rewards: STATE.rewardHistory || [],
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(mdpData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `smartroute-mdp-${Date.now()}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('MDP data exported successfully', 'success');
}

// Apply MDP Settings
function applyMDPSettings() {
    const settings = {
        showStateLabels: document.getElementById('showStateLabels')?.checked ?? true,
        showTransitionProbs: document.getElementById('showTransitionProbs')?.checked ?? true,
        showRewards: document.getElementById('showRewards')?.checked ?? true,
        animateTransitions: document.getElementById('animateTransitions')?.checked ?? true,
        nodeSize: parseInt(document.getElementById('nodeSize')?.value ?? 25),
        animSpeed: parseInt(document.getElementById('animSpeed')?.value ?? 5)
    };
    
    // Apply settings to MDP visualization
    if (window.mdpVisualization) {
        window.mdpVisualization.updateSettings(settings);
    }
}

// Listen for settings changes
document.addEventListener('DOMContentLoaded', () => {
    const settingsInputs = [
        'showStateLabels',
        'showTransitionProbs',
        'showRewards',
        'animateTransitions',
        'nodeSize',
        'animSpeed'
    ];
    
    settingsInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', applyMDPSettings);
        }
    });
});

// Persona Dropdown Handler
function initPersonaDropdown() {
    const personaSelect = document.getElementById('personaSelect');
    if (personaSelect) {
        personaSelect.addEventListener('change', (e) => {
            STATE.persona = e.target.value;
            updatePersonaUI(e.target.value);
            logAction('Persona Changed', `Switched to ${e.target.value} persona`);
        });
    }
}

function updatePersonaUI(persona) {
    // Update budget and preferences based on persona
    const personaConfigs = {
        solo: {
            budgetMultiplier: 1.0,
            preferences: { cultural: 0.9, adventure: 0.8, relaxation: 0.4 }
        },
        family: {
            budgetMultiplier: 2.5,
            preferences: { cultural: 0.7, adventure: 0.5, relaxation: 0.8 }
        },
        luxury: {
            budgetMultiplier: 4.0,
            preferences: { cultural: 0.8, relaxation: 0.9, food: 0.9 }
        },
        business: {
            budgetMultiplier: 2.0,
            preferences: { cultural: 0.6, food: 0.7, relaxation: 0.5 }
        },
        adventure: {
            budgetMultiplier: 1.3,
            preferences: { adventure: 0.95, cultural: 0.6, relaxation: 0.3 }
        },
        cultural: {
            budgetMultiplier: 1.2,
            preferences: { cultural: 0.95, food: 0.8, relaxation: 0.6 }
        }
    };
    
    const config = personaConfigs[persona] || personaConfigs.solo;
    
    // Update preferences
    Object.assign(STATE.preferences, config.preferences);
    updatePreferenceBars();
    
    showNotification(`Switched to ${persona} persona`, 'info');
}

function updatePreferenceBars() {
    Object.entries(STATE.preferences).forEach(([category, value]) => {
        const bar = document.querySelector(`[data-pref="${category}"] .pref-fill`);
        const prob = document.querySelector(`[data-pref="${category}"] .pref-prob`);
        
        if (bar) {
            bar.style.width = `${value * 100}%`;
        }
        if (prob) {
            prob.textContent = `${Math.round(value * 100)}%`;
        }
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${icons[type] || icons.info}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Enhanced Trip Form Handler
function initTripForm() {
    const form = document.getElementById('tripForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tripData = {
            destination: document.getElementById('destination').value,
            duration: parseInt(document.getElementById('duration').value),
            budget: parseFloat(document.getElementById('budget').value),
            start_date: document.getElementById('startDate').value,
            preferences: getSelectedPreferences(),
            persona: STATE.persona
        };
        
        // Validate
        if (!tripData.destination || !tripData.duration || !tripData.budget) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Show loading
        showLoading('Generating your intelligent itinerary...');
        
        try {
            // Call backend API
            const result = await api.planTrip(tripData);
            
            // Update UI with result
            displayItinerary(result.itinerary);
            updateWeatherCards(result.weather);
            updateBudgetBreakdown(result.budget);
            updateExplanation(result.explanation);
            
            // Log communication
            if (result.communication_log) {
                result.communication_log.forEach(log => {
                    api.addLog(log.message, log.from);
                });
            }
            
            hideLoading();
            showNotification('Itinerary generated successfully!', 'success');
            
            // Trigger collaboration graph animation
            if (collaborationGraph) {
                collaborationGraph.simulateCollaboration();
            }
            
        } catch (error) {
            hideLoading();
            showNotification('Error generating itinerary', 'error');
            console.error(error);
        }
    });
}

function getSelectedPreferences() {
    const tags = document.querySelectorAll('.preference-tags .tag.active');
    return Array.from(tags).map(tag => tag.getAttribute('data-pref'));
}

function displayItinerary(itinerary) {
    const timeline = document.getElementById('timelineContent');
    if (!timeline || !itinerary || !itinerary.days) {
        console.error('❌ Cannot display itinerary:', { timeline, itinerary });
        return;
    }
    
    console.log('📅 Displaying itinerary:', itinerary);
    
    timeline.innerHTML = '';
    
    itinerary.days.forEach(day => {
        if (!day || !day.activities) return;
        
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        
        const dayCost = day.activities.reduce((sum, act) => sum + (act.cost || 0), 0);
        
        dayElement.innerHTML = `
            <div class="day-header">
                <h4>Day ${day.day || '?'}</h4>
                <span class="day-cost">${Utils.formatCurrency(dayCost)}</span>
            </div>
            <div class="day-activities">
                ${day.activities.map(act => `
                    <div class="activity-card" data-category="${act.category || 'default'}">
                        <div class="activity-time">${act.time || '00:00'}</div>
                        <div class="activity-details">
                            <h5>${act.activity || 'Activity'}</h5>
                            <p><i class="fas fa-map-marker-alt"></i> ${act.location || 'Location'}</p>
                            <div class="activity-meta">
                                <span><i class="fas fa-clock"></i> ${act.duration || 'N/A'}</span>
                                <span><i class="fas fa-rupee-sign"></i> ${act.cost || 0}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        timeline.appendChild(dayElement);
    });
    
    // Update map with itinerary
    if (typeof updateMapWithItinerary === 'function') {
        updateMapWithItinerary(itinerary);
    }
}

function updateWeatherCards(weather) {
    const container = document.getElementById('weatherCards');
    if (!container || !weather || !weather.forecasts) {
        console.error('❌ Cannot update weather cards');
        return;
    }
    
    console.log('🌤️  Updating weather cards:', weather);
    
    container.innerHTML = weather.forecasts.map(forecast => {
        const date = new Date(forecast.date || Date.now());
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
        <div class="weather-card">
            <div class="weather-date">${dateStr}</div>
            <div class="weather-icon">
                <i class="fas ${getWeatherIcon(forecast.condition || 'Sunny')}"></i>
            </div>
            <div class="weather-temp">${forecast.temp || 25}°C</div>
            <div class="weather-condition">${forecast.condition || 'Sunny'}</div>
            <div class="weather-precip">${forecast.precipitation_prob || 0}% rain</div>
        </div>
    `}).join('');
}

function getWeatherIcon(condition) {
    const icons = {
        'Sunny': 'fa-sun',
        'Partly Cloudy': 'fa-cloud-sun',
        'Cloudy': 'fa-cloud',
        'Rainy': 'fa-cloud-rain',
        'Stormy': 'fa-bolt'
    };
    return icons[condition] || 'fa-cloud';
}

function updateBudgetBreakdown(budget) {
    if (!budget || !budget.breakdown) {
        console.error('❌ Cannot update budget breakdown');
        return;
    }
    
    console.log('💰 Updating budget:', budget);
    
    // Update budget meter
    const breakdown = budget.breakdown;
    const total = Object.values(breakdown).reduce((sum, val) => sum + (val || 0), 0);
    
    STATE.budget.used = total;
    
    const budgetFill = document.querySelector('.budget-fill');
    const budgetUsed = document.querySelector('.budget-used');
    
    if (budgetFill) {
        const percentage = (total / (STATE.budget.total || 15000)) * 100;
        budgetFill.style.width = `${Math.min(percentage, 100)}%`;
    }
    
    if (budgetUsed) {
        budgetUsed.textContent = Utils.formatCurrency(Math.round(total));
    }
    
    // Update breakdown categories
    const categories = {
        accommodation: breakdown.accommodation || 0,
        food: breakdown.food || 0,
        transport: breakdown.transport || 0,
        activities: breakdown.activities || 0
    };
    
    Object.entries(categories).forEach(([cat, amount]) => {
        const el = document.querySelector(`.budget-cat[data-category="${cat}"] .amount`);
        if (el) {
            el.textContent = Utils.formatCurrency(Math.round(amount));
        }
    });
}

function updateExplanation(explanation) {
    const panel = document.getElementById('explainabilityPanel');
    if (!panel || !explanation) return;
    
    panel.innerHTML = `
        <div class="explanation-card">
            <div class="explanation-header">
                <i class="fas fa-lightbulb agent-icon"></i>
                <span>AI Explanation</span>
            </div>
            <p>${explanation}</p>
        </div>
    `;
}

// Loading Overlay
function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay) {
        overlay.style.display = 'flex';
    }
    if (loadingText) {
        loadingText.textContent = text;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Log Action
function logAction(agent, message) {
    if (api) {
        api.addLog(message, agent);
    }
}

// Initialize all enhancements
document.addEventListener('DOMContentLoaded', () => {
    initPersonaDropdown();
    initTripForm();
    
    // Set default start date
    const startDateInput = document.getElementById('startDate');
    if (startDateInput && !startDateInput.value) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Initialize preference tag toggles
    document.querySelectorAll('.preference-tags .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    console.log('✓ SmartRoute UI Enhancements Loaded');
});
