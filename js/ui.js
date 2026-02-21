// ============================================
// UI Interactions and Helper Functions
// ============================================

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.classList.remove(`${currentTheme}-mode`);
    body.classList.add(`${newTheme}-mode`);
    
    STATE.theme = newTheme;
    
    const icon = document.querySelector('.btn-icon i');
    if (icon) {
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    
    showToast(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`, 'info');
}

// Show/Hide Modals
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
    }
}

// Show onboarding
function showOnboarding() {
    showModal('onboardingModal');
}

// Tab switching
function switchTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Add active class to clicked tab and corresponding content
    const clickedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (clickedTab) {
        clickedTab.classList.add('active');
    }
    
    const content = document.getElementById(tabName);
    if (content) {
        content.classList.add('active');
    }
    
    // Trigger visualizations if needed
    if (tabName === 'mdp' && mdp) {
        setTimeout(() => mdp.visualize(), 100);
    } else if (tabName === 'communication') {
        setTimeout(() => visualizeAgentCommunication(), 100);
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
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
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Loading Overlay
function showLoading(text = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    
    if (overlay) {
        overlay.classList.add('show');
        overlay.style.display = 'flex';
    }
    
    if (loadingText) {
        loadingText.textContent = text;
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        overlay.style.display = 'none';
    }
}

// Persona Selection
function selectPersona(persona) {
    STATE.persona = persona;
    
    document.querySelectorAll('.persona-card').forEach(card => {
        card.classList.remove('active');
    });
    
    const selectedCard = document.querySelector(`[data-persona="${persona}"]`);
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    // Update preferences based on persona
    const personaPreferences = {
        solo: {
            cultural: 0.85,
            adventure: 0.72,
            relaxation: 0.45,
            food: 0.60,
            nightlife: 0.30,
            shopping: 0.40
        },
        family: {
            cultural: 0.70,
            adventure: 0.50,
            relaxation: 0.75,
            food: 0.80,
            nightlife: 0.20,
            shopping: 0.60
        },
        luxury: {
            cultural: 0.65,
            adventure: 0.40,
            relaxation: 0.90,
            food: 0.95,
            nightlife: 0.70,
            shopping: 0.85
        }
    };
    
    if (personaPreferences[persona]) {
        STATE.preferences = personaPreferences[persona];
        updatePreferenceBars();
    }
    
    AgentLog.info('Preference Agent', `Persona changed to: ${persona}`);
    showToast(`${persona.charAt(0).toUpperCase() + persona.slice(1)} persona selected`, 'info');
}

// Display Itinerary
function displayItinerary(itinerary) {
    const container = document.getElementById('timelineContent');
    if (!container || !itinerary) return;
    
    container.innerHTML = '';
    
    itinerary.days.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'timeline-day';
        dayElement.innerHTML = `
            <div class="day-header">
                <div class="day-number">${day.day}</div>
                <div>
                    <div class="day-title">${day.city}</div>
                    <div style="font-size: 14px; color: var(--text-secondary);">${day.date}</div>
                </div>
            </div>
            <div class="day-activities">
                ${day.activities.map(activity => `
                    <div class="activity-card" draggable="true" data-activity-id="${activity.id}">
                        <div class="activity-header">
                            <span class="activity-time">${activity.time}</span>
                            <div class="activity-rating">
                                ${Array(5).fill(0).map((_, i) => 
                                    `<i class="fas fa-star${i < Math.floor(activity.rating || 0) ? '' : '-o'}"></i>`
                                ).join('')}
                            </div>
                        </div>
                        <div class="activity-title">${activity.name}</div>
                        <div class="activity-description">
                            ${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} experience
                        </div>
                        <div class="activity-meta">
                            <span class="meta-tag">
                                <i class="fas fa-clock"></i>
                                ${Utils.formatTime(activity.duration)}
                            </span>
                            <span class="meta-tag">
                                <i class="fas fa-rupee-sign"></i>
                                ${Utils.formatCurrency(activity.cost)}
                            </span>
                            <span class="meta-tag">
                                <i class="fas fa-users"></i>
                                ${activity.crowdLevel || 'medium'}
                            </span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(dayElement);
    });
    
    // Update budget display
    updateBudgetDisplay(itinerary.totalCost);
}

// Update Budget Display
function updateBudgetDisplay(used) {
    STATE.budget.used = used;
    
    const usedEl = document.querySelector('.budget-used');
    const fillEl = document.querySelector('.budget-fill');
    
    if (usedEl) {
        usedEl.textContent = Utils.formatCurrency(used);
    }
    
    if (fillEl) {
        const percentage = (used / STATE.budget.total) * 100;
        fillEl.style.width = percentage + '%';
    }
}

// Add Explanation
function addExplanation(explanation) {
    const container = document.getElementById('explainabilityPanel');
    if (!container) return;
    
    const card = document.createElement('div');
    card.className = 'explanation-card';
    card.innerHTML = `
        <div class="explanation-header">
            <i class="fas fa-robot agent-icon"></i>
            <span>${explanation.agent}</span>
        </div>
        <p>${explanation.reasoning}</p>
        ${explanation.confidence ? 
            `<div style="margin-top: 8px; font-size: 12px; color: var(--text-tertiary);">
                Confidence: ${(explanation.confidence * 100).toFixed(0)}%
            </div>` : ''
        }
    `;
    
    container.insertBefore(card, container.firstChild);
    
    // Keep only last 5 explanations
    while (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
}

// Visualize Agent Communication
let communicationChart;

function visualizeAgentCommunication() {
    const canvas = document.getElementById('communicationGraph');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (communicationChart) {
        communicationChart.destroy();
    }
    
    // Sample communication data
    const agents = ['Planner', 'Weather', 'Crowd', 'Budget', 'Preference', 'Booking', 'Explain'];
    const communicationData = agents.map(() => 
        agents.map(() => Math.floor(Math.random() * 10))
    );
    
    communicationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: agents,
            datasets: agents.map((agent, idx) => ({
                label: agent,
                data: communicationData[idx],
                backgroundColor: `hsla(${idx * 50}, 70%, 60%, 0.6)`,
                borderColor: `hsla(${idx * 50}, 70%, 50%, 1)`,
                borderWidth: 2
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                title: {
                    display: true,
                    text: 'Multi-Agent Communication Matrix',
                    font: {
                        family: 'Inter',
                        size: 16,
                        weight: 'bold'
                    }
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    title: {
                        display: true,
                        text: 'Messages Sent'
                    }
                }
            }
        }
    });
}

// Form Submission
async function handleTripFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        destination: document.getElementById('destination').value,
        duration: document.getElementById('duration').value,
        budget: parseInt(document.getElementById('budget').value),
        startDate: document.getElementById('startDate').value,
        preferences: Array.from(document.querySelectorAll('.preference-tags .tag.active'))
            .map(tag => tag.getAttribute('data-pref'))
    };
    
    showLoading('Generating intelligent itinerary...');
    
    try {
        // Generate itinerary using multi-agent system
        const itinerary = await agentSystem.generateItinerary(formData);
        
        // Display itinerary
        displayItinerary(itinerary);
        
        // Update map
        visualizeRoute(itinerary);
        
        hideLoading();
        showToast('Itinerary generated successfully!', 'success');
        
        // Scroll to itinerary
        document.getElementById('itineraryTimeline').scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        console.error('Error generating itinerary:', error);
        hideLoading();
        showToast('Error generating itinerary', 'error');
    }
}

// Initialize Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Persona cards
    document.querySelectorAll('.persona-card').forEach(card => {
        card.addEventListener('click', () => {
            const persona = card.getAttribute('data-persona');
            selectPersona(persona);
        });
    });
    
    // Preference tags
    document.querySelectorAll('.preference-tags .tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
        });
    });
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            switchTab(tab);
        });
    });
    
    // Form submission
    const tripForm = document.getElementById('tripForm');
    if (tripForm) {
        tripForm.addEventListener('submit', handleTripFormSubmit);
    }
    
    // Close modals on click outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
            }
        });
    });
    
    // Set default start date
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        startDateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Show onboarding on first load
    setTimeout(() => {
        if (!localStorage.getItem('travelai_onboarding_seen')) {
            showOnboarding();
            localStorage.setItem('travelai_onboarding_seen', 'true');
        }
    }, 1000);
});

// Regenerate Itinerary
async function regenerateItinerary() {
    if (!STATE.currentItinerary) {
        showToast('No itinerary to regenerate', 'warning');
        return;
    }
    
    showLoading('Regenerating with updated preferences...');
    
    await Utils.sleep(2000);
    
    // Trigger replanning
    await agentSystem.replanItinerary('user requested regeneration');
    
    hideLoading();
}
