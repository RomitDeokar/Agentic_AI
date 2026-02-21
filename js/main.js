// ============================================
// Main Application Entry Point
// ============================================

// Application State Manager
class AppStateManager {
    constructor() {
        this.listeners = new Map();
    }
    
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, []);
        }
        this.listeners.get(key).push(callback);
    }
    
    notify(key, data) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(callback => callback(data));
        }
    }
    
    updateState(key, value) {
        STATE[key] = value;
        this.notify(key, value);
    }
}

const appStateManager = new AppStateManager();

// Initialize Application
async function initializeApp() {
    AgentLog.info('System', 'Initializing Multi-Agent Travel Intelligence System...');
    
    try {
        // Initialize all subsystems
        await Promise.all([
            initializeAgents(),
            initializeMDP(),
            initializeBayesian(),
            initializeRL(),
            initializeMap(),
            initializeUI()
        ]);
        
        AgentLog.success('System', 'All systems initialized successfully');
        
        // Generate initial sample itinerary
        setTimeout(() => {
            generateSampleItinerary();
        }, 1500);
        
    } catch (error) {
        console.error('Initialization error:', error);
        AgentLog.error('System', 'Initialization failed: ' + error.message);
        showToast('System initialization error', 'error');
    }
}

// Initialize Agents
async function initializeAgents() {
    // Already initialized in agents.js
    return Promise.resolve();
}

// Initialize MDP
async function initializeMDP() {
    // Already initialized in mdp.js
    return Promise.resolve();
}

// Initialize Bayesian
async function initializeBayesian() {
    // Already initialized in bayesian.js
    return Promise.resolve();
}

// Initialize RL
async function initializeRL() {
    // Already initialized in rl.js
    return Promise.resolve();
}

// Initialize Map
async function initializeMap() {
    // Already initialized in map.js
    return Promise.resolve();
}

// Initialize UI
async function initializeUI() {
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Initialize visualizations
    setTimeout(() => {
        if (mdp) mdp.visualize();
        visualizeAgentCommunication();
    }, 1000);
    
    return Promise.resolve();
}

// Setup Global Event Listeners
function setupGlobalEventListeners() {
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + D for demo
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            startAutoDemo();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
                modal.style.display = 'none';
            });
        }
    });
    
    // Window resize handler
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (mdp) mdp.visualize();
            if (rewardChart) rewardChart.resize();
            if (communicationChart) communicationChart.resize();
        }, 250);
    });
    
    // Visibility change (pause animations when tab not visible)
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            AgentLog.info('System', 'Tab hidden - pausing animations');
        } else {
            AgentLog.info('System', 'Tab visible - resuming');
        }
    });
}

// Generate Sample Itinerary
async function generateSampleItinerary() {
    AgentLog.info('System', 'Generating sample itinerary for demonstration');
    
    const sampleParams = {
        destination: 'Rajasthan, India',
        duration: 3,
        budget: 15000,
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        preferences: ['cultural', 'adventure']
    };
    
    try {
        const itinerary = await agentSystem.generateItinerary(sampleParams);
        displayItinerary(itinerary);
        visualizeRoute(itinerary);
        
        AgentLog.success('System', 'Sample itinerary generated');
    } catch (error) {
        console.error('Sample generation error:', error);
    }
}

// Periodic Updates
function startPeriodicUpdates() {
    // Update weather every 30 seconds
    setInterval(() => {
        if (!STATE.isDemo) {
            updateWeatherCards();
        }
    }, 30000);
    
    // Update crowd data every 45 seconds
    setInterval(() => {
        if (!STATE.isDemo) {
            updateCrowdData();
        }
    }, 45000);
    
    // Simulate agent activity every 10 seconds
    setInterval(() => {
        if (!STATE.isDemo && STATE.currentItinerary) {
            simulateAgentActivity();
        }
    }, 10000);
}

// Simulate Agent Activity
function simulateAgentActivity() {
    const agents = CONFIG.AGENTS;
    const randomAgent = agents[Math.floor(Math.random() * agents.length)];
    
    const activities = [
        'Monitoring conditions',
        'Analyzing data',
        'Optimizing plan',
        'Checking updates',
        'Ready for action'
    ];
    
    const activity = activities[Math.floor(Math.random() * activities.length)];
    
    AgentLog.info(randomAgent.name, activity);
}

// Performance Monitoring
const performanceMonitor = {
    metrics: {
        agentResponseTime: [],
        renderTime: [],
        apiCallTime: []
    },
    
    recordMetric(type, value) {
        if (this.metrics[type]) {
            this.metrics[type].push(value);
            
            // Keep only last 100 entries
            if (this.metrics[type].length > 100) {
                this.metrics[type].shift();
            }
        }
    },
    
    getAverageMetric(type) {
        if (!this.metrics[type] || this.metrics[type].length === 0) {
            return 0;
        }
        
        const sum = this.metrics[type].reduce((a, b) => a + b, 0);
        return sum / this.metrics[type].length;
    },
    
    updateMonitoringDashboard() {
        // Update metric cards
        const avgResponse = this.getAverageMetric('agentResponseTime');
        const avgRender = this.getAverageMetric('renderTime');
        
        // These are displayed in the monitoring tab
        AgentLog.info('Performance', `Avg Response Time: ${avgResponse.toFixed(2)}ms`);
    }
};

// Error Handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    AgentLog.error('System', 'Error: ' + event.error?.message || 'Unknown error');
});

// Unhandled Promise Rejection Handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    AgentLog.error('System', 'Promise rejection: ' + event.reason);
});

// Save State to LocalStorage
function saveState() {
    try {
        const stateToSave = {
            preferences: STATE.preferences,
            budget: STATE.budget,
            persona: STATE.persona,
            theme: STATE.theme,
            currentItinerary: STATE.currentItinerary
        };
        
        localStorage.setItem('travelai_state', JSON.stringify(stateToSave));
        AgentLog.info('System', 'State saved to localStorage');
    } catch (error) {
        console.error('Save state error:', error);
    }
}

// Load State from LocalStorage
function loadState() {
    try {
        const saved = localStorage.getItem('travelai_state');
        if (saved) {
            const stateData = JSON.parse(saved);
            
            STATE.preferences = stateData.preferences || STATE.preferences;
            STATE.budget = stateData.budget || STATE.budget;
            STATE.persona = stateData.persona || STATE.persona;
            STATE.theme = stateData.theme || STATE.theme;
            STATE.currentItinerary = stateData.currentItinerary || null;
            
            // Apply theme
            if (STATE.theme === 'dark') {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            }
            
            AgentLog.info('System', 'State loaded from localStorage');
            return true;
        }
    } catch (error) {
        console.error('Load state error:', error);
    }
    
    return false;
}

// Save state periodically
setInterval(() => {
    saveState();
}, 60000); // Every minute

// Save state before page unload
window.addEventListener('beforeunload', () => {
    saveState();
});

// Application Analytics (simulated)
const analytics = {
    events: [],
    
    track(eventName, properties = {}) {
        const event = {
            name: eventName,
            properties,
            timestamp: Date.now()
        };
        
        this.events.push(event);
        
        // Log to console in development
        console.log('Analytics:', eventName, properties);
    },
    
    trackPageView() {
        this.track('page_view', {
            url: window.location.href,
            title: document.title
        });
    },
    
    trackItineraryGeneration(params) {
        this.track('itinerary_generated', params);
    },
    
    trackEmergencyScenario(scenario) {
        this.track('emergency_scenario', { type: scenario });
    }
};

// Initialize analytics
analytics.trackPageView();

// Export functions for global use
window.AppFunctions = {
    initializeApp,
    startAutoDemo,
    triggerRainstorm,
    triggerBudgetChange,
    triggerCrowdSurge,
    triggerClosedVenue,
    regenerateItinerary,
    exportPDF,
    shareItinerary,
    startVoiceInput,
    toggleTheme,
    showOnboarding,
    rateActivity,
    trainRLModel,
    selectPersona
};

// Main Application Initialization
document.addEventListener('DOMContentLoaded', async () => {
    AgentLog.info('System', '🚀 Starting TravelAI RL System...');
    
    // Show loading
    showLoading('Initializing Multi-Agent System...');
    
    // Load saved state
    loadState();
    
    // Initialize app
    await initializeApp();
    
    // Start periodic updates
    startPeriodicUpdates();
    
    // Hide loading
    setTimeout(() => {
        hideLoading();
        AgentLog.success('System', '✅ System ready!');
        showToast('🎉 System initialized successfully!', 'success');
    }, 2000);
});

// Console Welcome Message
console.log('%c🧠 TravelAI RL System', 'font-size: 24px; font-weight: bold; color: #9333EA;');
console.log('%cMulti-Agent Autonomous Travel Intelligence', 'font-size: 14px; color: #6B7280;');
console.log('%c\nFeatures:', 'font-size: 12px; font-weight: bold; color: #4F46E5;');
console.log('• 7 Specialized AI Agents');
console.log('• MDP + MCTS Planning');
console.log('• Bayesian Inference');
console.log('• Reinforcement Learning (Q-Learning, DQN, PPO)');
console.log('• Real-time Adaptation');
console.log('• Explainable AI');
console.log('\n%cKeyboard Shortcuts:', 'font-size: 12px; font-weight: bold; color: #4F46E5;');
console.log('• Ctrl/Cmd + D: Start Demo Mode');
console.log('• Esc: Close Modals');
console.log('\n%cType AppFunctions to see available methods', 'font-size: 11px; color: #9CA3AF;');
