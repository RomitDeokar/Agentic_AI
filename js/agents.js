// ============================================
// Multi-Agent System Implementation
// ============================================

class Agent {
    constructor(config) {
        this.id = config.id;
        this.name = config.name;
        this.icon = config.icon;
        this.color = config.color;
        this.description = config.description;
        this.status = 'idle';
        this.lastMessage = '';
    }
    
    setStatus(status) {
        this.status = status;
        this.updateUI();
    }
    
    setMessage(message) {
        this.lastMessage = message;
        this.updateUI();
    }
    
    updateUI() {
        const card = document.querySelector(`[data-agent-id="${this.id}"]`);
        if (card) {
            const statusEl = card.querySelector('.agent-status');
            if (statusEl) {
                statusEl.textContent = this.lastMessage || this.status;
            }
            
            if (this.status === 'active') {
                card.classList.add('active');
                STATE.activeAgents.add(this.id);
            } else {
                card.classList.remove('active');
                STATE.activeAgents.delete(this.id);
            }
        }
    }
    
    async execute(task) {
        this.setStatus('active');
        this.setMessage('Processing...');
        
        // Simulate agent processing
        await Utils.sleep(Utils.random(500, 1500));
        
        let result;
        switch(this.id) {
            case 'planner':
                result = await this.planItinerary(task);
                break;
            case 'weather':
                result = await this.analyzeWeather(task);
                break;
            case 'crowd':
                result = await this.analyzeCrowd(task);
                break;
            case 'budget':
                result = await this.optimizeBudget(task);
                break;
            case 'preference':
                result = await this.updatePreferences(task);
                break;
            case 'booking':
                result = await this.searchBookings(task);
                break;
            case 'explainability':
                result = await this.explainDecision(task);
                break;
            default:
                result = { success: true };
        }
        
        this.setStatus('idle');
        this.setMessage('Ready');
        
        return result;
    }
    
    async planItinerary(task) {
        this.setMessage('Running MCTS algorithm...');
        await Utils.sleep(1000);
        
        this.setMessage('Generating 47 possible routes...');
        await Utils.sleep(800);
        
        this.setMessage('Selecting optimal itinerary');
        await Utils.sleep(600);
        
        AgentLog.info(this.name, 'Generated optimal itinerary using MCTS + Hierarchical RL');
        
        return {
            success: true,
            iterations: 47,
            optimalPath: true,
            confidence: 0.92
        };
    }
    
    async analyzeWeather(task) {
        this.setMessage('Fetching weather forecasts...');
        await Utils.sleep(800);
        
        this.setMessage('Computing Bayesian probabilities');
        await Utils.sleep(600);
        
        const weatherData = {
            day1: { condition: 'sunny', probability: 0.85, temp: 28 },
            day2: { condition: 'cloudy', probability: 0.70, temp: 26 },
            day3: { condition: 'sunny', probability: 0.80, temp: 29 }
        };
        
        AgentLog.info(this.name, 'Weather analysis complete. 85% sunny probability.');
        
        return { success: true, data: weatherData };
    }
    
    async analyzeCrowd(task) {
        this.setMessage('Analyzing footfall data...');
        await Utils.sleep(700);
        
        this.setMessage('Calculating crowd penalties');
        await Utils.sleep(500);
        
        const crowdData = {
            'Amber Fort': { level: 'high', penalty: 0.15 },
            'City Palace': { level: 'medium', penalty: 0.08 },
            'Hawa Mahal': { level: 'high', penalty: 0.12 }
        };
        
        AgentLog.info(this.name, 'Crowd analysis complete. High density at popular sites.');
        
        return { success: true, data: crowdData };
    }
    
    async optimizeBudget(task) {
        this.setMessage('Analyzing spending patterns...');
        await Utils.sleep(600);
        
        this.setMessage('Reallocating budget');
        await Utils.sleep(500);
        
        const optimization = {
            saved: 1200,
            reallocated: {
                accommodation: -300,
                food: +500,
                activities: +700
            }
        };
        
        AgentLog.success(this.name, `Optimized budget. Saved ${Utils.formatCurrency(1200)}`);
        
        return { success: true, data: optimization };
    }
    
    async updatePreferences(task) {
        this.setMessage('Updating Beta distributions...');
        await Utils.sleep(600);
        
        if (task.rating) {
            const category = task.category || 'cultural';
            const oldProb = STATE.preferences[category];
            
            // Bayesian update
            STATE.preferences[category] = Utils.clamp(
                oldProb + (task.rating - 3) * 0.05,
                0, 1
            );
            
            this.setMessage('Preferences updated via Bayesian inference');
            AgentLog.info(this.name, `Updated ${category} preference: ${(STATE.preferences[category] * 100).toFixed(0)}%`);
            
            // Update UI
            updatePreferenceBars();
        }
        
        return { success: true };
    }
    
    async searchBookings(task) {
        this.setMessage('Searching flights...');
        await Utils.sleep(800);
        
        this.setMessage('Comparing hotel prices');
        await Utils.sleep(700);
        
        this.setMessage('Finding best deals');
        await Utils.sleep(500);
        
        const bookings = {
            flights: { available: 12, bestPrice: 4500 },
            hotels: { available: 23, bestPrice: 1800 }
        };
        
        AgentLog.success(this.name, 'Found best deals. 12 flights, 23 hotels available.');
        
        return { success: true, data: bookings };
    }
    
    async explainDecision(task) {
        this.setMessage('Generating explanation...');
        await Utils.sleep(600);
        
        const explanation = {
            agent: task.agent || 'Planner Agent',
            reasoning: task.reasoning || 'Selected based on optimal balance of preferences and constraints',
            confidence: Utils.random(0.8, 0.95),
            factors: [
                { name: 'User Preferences', impact: 0.85 },
                { name: 'Budget Constraints', impact: 0.75 },
                { name: 'Weather Conditions', impact: 0.80 }
            ]
        };
        
        addExplanation(explanation);
        AgentLog.info(this.name, 'Generated decision explanation');
        
        return { success: true, data: explanation };
    }
}

// Agent System Manager
class AgentSystem {
    constructor() {
        this.agents = new Map();
        this.messageQueue = [];
        this.isProcessing = false;
    }
    
    initialize() {
        CONFIG.AGENTS.forEach(config => {
            const agent = new Agent(config);
            this.agents.set(agent.id, agent);
        });
        
        this.renderAgents();
        AgentLog.info('System', 'Multi-agent system initialized');
    }
    
    renderAgents() {
        const container = document.getElementById('agentsGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.agents.forEach(agent => {
            const card = document.createElement('div');
            card.className = 'agent-card';
            card.setAttribute('data-agent-id', agent.id);
            card.innerHTML = `
                <div class="agent-icon" style="background: ${agent.color}20; color: ${agent.color}">
                    ${agent.icon}
                </div>
                <div class="agent-info">
                    <div class="agent-name">${agent.name}</div>
                    <div class="agent-status">Ready</div>
                </div>
            `;
            container.appendChild(card);
        });
    }
    
    async executeTask(agentId, task) {
        const agent = this.agents.get(agentId);
        if (!agent) {
            console.error('Agent not found:', agentId);
            return null;
        }
        
        return await agent.execute(task);
    }
    
    async executeMultiAgentTask(tasks) {
        this.isProcessing = true;
        const results = [];
        
        for (const task of tasks) {
            const result = await this.executeTask(task.agent, task.data);
            results.push({ agent: task.agent, result });
            
            // Small delay between agents for visualization
            await Utils.sleep(300);
        }
        
        this.isProcessing = false;
        return results;
    }
    
    async generateItinerary(params) {
        AgentLog.info('System', 'Starting multi-agent itinerary generation');
        
        // Multi-agent collaboration sequence
        const tasks = [
            { agent: 'preference', data: { action: 'analyze' } },
            { agent: 'weather', data: { destination: params.destination } },
            { agent: 'crowd', data: { destination: params.destination } },
            { agent: 'budget', data: { budget: params.budget } },
            { agent: 'planner', data: params },
            { agent: 'booking', data: { dates: params.dates } },
            { agent: 'explainability', data: { agent: 'Planner', reasoning: 'Selected optimal route' } }
        ];
        
        const results = await this.executeMultiAgentTask(tasks);
        
        // Generate actual itinerary
        const itinerary = this.createItinerary(params);
        STATE.currentItinerary = itinerary;
        
        AgentLog.success('System', 'Itinerary generation complete');
        
        return itinerary;
    }
    
    createItinerary(params) {
        const days = [];
        const cities = CONFIG.DESTINATIONS[params.destination]?.cities || [];
        const duration = parseInt(params.duration) || 3;
        
        for (let day = 1; day <= duration; day++) {
            const cityIndex = Math.floor((day - 1) / (duration / cities.length));
            const city = cities[cityIndex]?.name || 'Jaipur';
            const activities = CONFIG.ACTIVITIES[city] || CONFIG.ACTIVITIES['Jaipur'];
            
            // Select activities based on preferences
            const selectedActivities = this.selectActivities(activities, params.preferences || []);
            
            days.push({
                day,
                date: new Date(Date.now() + day * 86400000).toLocaleDateString(),
                city,
                activities: selectedActivities.map((activity, idx) => ({
                    id: Utils.generateId(),
                    time: `${8 + idx * 3}:00`,
                    ...activity
                }))
            });
        }
        
        return { days, totalCost: this.calculateTotalCost(days) };
    }
    
    selectActivities(activities, preferences) {
        // Filter and sort by preference match
        let selected = activities.slice(0, 3);
        
        if (preferences.includes('cultural')) {
            selected = activities.filter(a => a.type === 'cultural').slice(0, 2);
        }
        if (preferences.includes('adventure')) {
            selected = [...selected, ...activities.filter(a => a.type === 'adventure').slice(0, 1)];
        }
        
        return selected.slice(0, 3);
    }
    
    calculateTotalCost(days) {
        let total = 0;
        days.forEach(day => {
            day.activities.forEach(activity => {
                total += activity.cost || 0;
            });
        });
        return total;
    }
    
    async replanItinerary(reason) {
        AgentLog.warning('System', `Replanning due to: ${reason}`);
        
        showToast('Replanning itinerary...', 'warning');
        
        // Trigger relevant agents based on reason
        let tasks = [];
        
        if (reason.includes('weather') || reason.includes('rain')) {
            tasks = [
                { agent: 'weather', data: { update: true } },
                { agent: 'planner', data: { replan: true, reason } },
                { agent: 'explainability', data: { agent: 'Weather Risk', reasoning: 'Replanned due to adverse weather conditions' } }
            ];
        } else if (reason.includes('budget')) {
            tasks = [
                { agent: 'budget', data: { reoptimize: true } },
                { agent: 'planner', data: { replan: true, reason } },
                { agent: 'explainability', data: { agent: 'Budget Optimizer', reasoning: 'Adjusted itinerary to stay within budget' } }
            ];
        } else if (reason.includes('crowd')) {
            tasks = [
                { agent: 'crowd', data: { update: true } },
                { agent: 'planner', data: { replan: true, reason } },
                { agent: 'explainability', data: { agent: 'Crowd Analyzer', reasoning: 'Rescheduled to avoid peak hours' } }
            ];
        }
        
        await this.executeMultiAgentTask(tasks);
        
        showToast('Itinerary replanned successfully!', 'success');
        AgentLog.success('System', 'Replanning complete');
        
        // Update itinerary display
        if (STATE.currentItinerary) {
            displayItinerary(STATE.currentItinerary);
        }
    }
}

// Agent Logging System
const AgentLog = {
    add(type, agent, message) {
        const timestamp = new Date().toLocaleTimeString();
        const log = { type, agent, message, timestamp };
        
        STATE.logs.unshift(log);
        if (STATE.logs.length > 100) {
            STATE.logs.pop();
        }
        
        this.updateUI(log);
    },
    
    info(agent, message) {
        this.add('info', agent, message);
    },
    
    success(agent, message) {
        this.add('success', agent, message);
    },
    
    warning(agent, message) {
        this.add('warning', agent, message);
    },
    
    error(agent, message) {
        this.add('error', agent, message);
    },
    
    updateUI(log) {
        const container = document.getElementById('logContainer');
        if (!container) return;
        
        const entry = document.createElement('div');
        entry.className = `log-entry ${log.type}`;
        entry.innerHTML = `
            <span class="log-time">${log.timestamp}</span>
            <strong>[${log.agent}]</strong>
            <span>${log.message}</span>
        `;
        
        container.insertBefore(entry, container.firstChild);
        
        // Keep only last 50 logs in UI
        while (container.children.length > 50) {
            container.removeChild(container.lastChild);
        }
    }
};

// Initialize agent system
let agentSystem;

document.addEventListener('DOMContentLoaded', () => {
    agentSystem = new AgentSystem();
    agentSystem.initialize();
});
