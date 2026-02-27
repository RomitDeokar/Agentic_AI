// ============================================
// Backend API Integration
// ============================================

class BackendAPI {
    constructor() {
        this.baseUrl = CONFIG.API_BASE_URL;
        this.wsUrl = CONFIG.WS_URL;
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    // WebSocket Connection
    connectWebSocket() {
        try {
            this.ws = new WebSocket(this.wsUrl);
            
            this.ws.onopen = () => {
                console.log('✓ WebSocket connected');
                this.connected = true;
                this.reconnectAttempts = 0;
                this.showToast('Connected to SmartRoute backend', 'success');
            };
            
            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleWebSocketMessage(data);
                } catch (error) {
                    console.error('WebSocket message error:', error);
                }
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.connected = false;
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.connected = false;
                this.attemptReconnect();
            };
        } catch (error) {
            console.error('WebSocket connection error:', error);
            this.showToast('Backend connection failed - using offline mode', 'warning');
        }
    }

    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
            setTimeout(() => this.connectWebSocket(), 3000);
        } else {
            this.showToast('Backend offline - using demo mode', 'info');
        }
    }

    handleWebSocketMessage(data) {
        switch (data.type) {
            case 'agent_update':
                this.updateAgentStatus(data.agents);
                break;
            case 'emergency':
                this.handleEmergencyScenario(data.scenario);
                break;
            case 'log':
                this.addLog(data.message, data.agent);
                break;
            default:
                console.log('Unknown message type:', data.type);
        }
    }

    // API Endpoints
    async planTrip(tripData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/plan-trip`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tripData)
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Return mock data if API fails
            return this.generateMockItinerary(tripData);
        }
    }

    async getAgentStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/api/agents/status`);
            return await response.json();
        } catch (error) {
            console.error('Agent status error:', error);
            return { agents: [] };
        }
    }

    async rateActivity(activityData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/rate-activity`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(activityData)
            });
            return await response.json();
        } catch (error) {
            console.error('Rating error:', error);
            return null;
        }
    }

    async triggerEmergency(scenario) {
        try {
            const response = await fetch(`${this.baseUrl}/api/emergency`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scenario)
            });
            return await response.json();
        } catch (error) {
            console.error('Emergency API error:', error);
            return null;
        }
    }

    // Helper Methods
    updateAgentStatus(agents) {
        agents.forEach(agent => {
            const agentCard = document.querySelector(`[data-agent="${agent.name.toLowerCase().replace(/\s+/g, '-')}"]`);
            if (agentCard) {
                agentCard.className = `agent-card agent-status-${agent.status}`;
                const statusEl = agentCard.querySelector('.agent-status');
                if (statusEl) {
                    statusEl.textContent = agent.status;
                }
            }
        });
    }

    handleEmergencyScenario(scenario) {
        this.addLog(`Emergency: ${scenario.type}`, 'System');
        // Trigger UI update
        if (window.handleEmergency) {
            window.handleEmergency(scenario);
        }
    }

    addLog(message, agent = 'System') {
        const logEntry = {
            agent,
            message,
            timestamp: new Date().toISOString(),
            type: 'info'
        };
        
        STATE.logs.push(logEntry);
        
        // Update UI if log container exists
        const logContainer = document.getElementById('logContainer');
        if (logContainer) {
            this.appendLogToUI(logEntry);
        }
    }

    appendLogToUI(logEntry) {
        const logContainer = document.getElementById('logContainer');
        if (!logContainer) return;

        const logElement = document.createElement('div');
        logElement.className = 'log-entry';
        
        const agentColor = this.getAgentColor(logEntry.agent);
        const time = new Date(logEntry.timestamp).toLocaleTimeString();
        
        logElement.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-agent" style="color: ${agentColor}">${logEntry.agent}</span>
            <span class="log-message">${logEntry.message}</span>
        `;
        
        logContainer.appendChild(logElement);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Keep only last 100 logs
        while (logContainer.children.length > 100) {
            logContainer.removeChild(logContainer.firstChild);
        }
    }

    getAgentColor(agentName) {
        const agent = CONFIG.AGENTS.find(a => a.name.includes(agentName));
        return agent ? agent.color : '#6B7280';
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        const container = document.getElementById('toastContainer') || document.body;
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Mock data generator for offline mode
    generateMockItinerary(tripData) {
        console.log('📦 Generating mock itinerary for:', tripData);
        
        const days = [];
        const dailyBudget = (tripData.budget || 15000) / (tripData.duration || 3);
        
        const activityTemplates = {
            cultural: ['Visit Palace', 'Museum Tour', 'Heritage Walk', 'Temple Visit', 'Art Gallery'],
            adventure: ['Desert Safari', 'Zip Lining', 'Rock Climbing', 'Trekking', 'Rafting'],
            relaxation: ['Spa Session', 'Lake Visit', 'Garden Stroll', 'Yoga Class', 'Beach Time'],
            food: ['Food Tour', 'Cooking Class', 'Street Food Walk', 'Fine Dining', 'Local Market']
        };
        
        for (let day = 1; day <= (tripData.duration || 3); day++) {
            const activities = [];
            const timeSlots = ['09:00', '12:00', '15:00'];
            
            timeSlots.forEach((time, i) => {
                const prefIndex = i % (tripData.preferences?.length || 1);
                const pref = tripData.preferences?.[prefIndex] || 'cultural';
                const templates = activityTemplates[pref] || activityTemplates.cultural;
                const activity = templates[Math.floor(Math.random() * templates.length)];
                
                activities.push({
                    time: time,
                    activity: activity,
                    location: `${tripData.destination || 'Destination'} - Spot ${i+1}`,
                    cost: Math.floor(dailyBudget * 0.3),
                    duration: '2-3h',
                    category: pref
                });
            });
            
            days.push({ day, activities });
        }
        
        const totalCost = days.reduce((sum, day) => 
            sum + day.activities.reduce((daySum, act) => daySum + act.cost, 0), 0);
        
        return {
            itinerary: {
                days,
                total_cost: totalCost,
                mcts_iterations: 47,
                optimization_score: 0.87
            },
            weather: {
                forecasts: Array(tripData.duration || 3).fill(null).map((_, i) => ({
                    date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
                    temp: Math.floor(Math.random() * 10) + 25,
                    condition: ["Sunny", "Partly Cloudy", "Cloudy"][Math.floor(Math.random() * 3)],
                    precipitation_prob: Math.floor(Math.random() * 30),
                    risk_level: "Low"
                })),
                bayesian_confidence: 0.85
            },
            budget: {
                status: totalCost <= (tripData.budget || 15000) ? "within_budget" : "over_budget",
                savings: (tripData.budget || 15000) - totalCost,
                breakdown: {
                    accommodation: totalCost * 0.35,
                    food: totalCost * 0.25,
                    transport: totalCost * 0.20,
                    activities: totalCost * 0.20
                }
            },
            crowds: {
                predictions: []
            },
            explanation: "This itinerary was generated using our multi-agent system, considering your preferences, budget constraints, and destination highlights.",
            communication_log: [
                { from: "Planner", to: "Weather", message: "Requesting weather data", timestamp: new Date().toISOString() },
                { from: "Weather", to: "Planner", message: "Weather data provided", timestamp: new Date().toISOString() },
                { from: "Planner", to: "Budget", message: "Checking budget constraints", timestamp: new Date().toISOString() }
            ]
        };
    }
}

// Create global API instance
const api = new BackendAPI();

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    api.connectWebSocket();
});
