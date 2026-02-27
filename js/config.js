// ============================================
// Configuration and Constants
// ============================================

const CONFIG = {
    // Backend Configuration
    API_BASE_URL: 'http://localhost:8000',
    WS_URL: 'ws://localhost:8000/ws',
    
    // Map Configuration (FREE OpenStreetMap via Leaflet)
    MAP_CENTER: [26.9124, 75.7873], // Jaipur, India
    MAP_ZOOM: 6,
    
    // Agent Configuration
    AGENTS: [
        {
            id: 'planner',
            name: 'Planner Agent',
            icon: '🧠',
            color: '#4F46E5',
            description: 'Master orchestrator using MCTS + Hierarchical RL'
        },
        {
            id: 'weather',
            name: 'Weather Risk Agent',
            icon: '🌤️',
            color: '#3B82F6',
            description: 'Real-time forecast monitoring with Bayesian probability'
        },
        {
            id: 'crowd',
            name: 'Crowd Analyzer Agent',
            icon: '👥',
            color: '#8B5CF6',
            description: 'Footfall analysis with crowd penalty integration'
        },
        {
            id: 'budget',
            name: 'Budget Optimizer Agent',
            icon: '💰',
            color: '#10B981',
            description: 'Dynamic budget reallocation across categories'
        },
        {
            id: 'preference',
            name: 'Preference Agent',
            icon: '❤️',
            color: '#EC4899',
            description: 'Bayesian user modeling with Beta/Dirichlet distributions'
        },
        {
            id: 'booking',
            name: 'Booking Assistant Agent',
            icon: '✈️',
            color: '#F59E0B',
            description: 'Live API integration for flights/hotels'
        },
        {
            id: 'explainability',
            name: 'Explainability Agent',
            icon: '💡',
            color: '#6366F1',
            description: 'Plain-language decision explanations'
        }
    ],
    
    // MDP Configuration
    MDP: {
        // State Space Components
        STATE_SPACE: {
            currentDay: { min: 1, max: 30 },
            currentLocation: [],
            remainingBudget: { min: 0, max: 1000000 },
            weatherProbability: { min: 0, max: 1 },
            crowdLevel: { min: 0, max: 100 },
            userSatisfaction: { min: 0, max: 5 }
        },
        
        // Action Space
        ACTION_SPACE: [
            'keep_plan',
            'swap_activity',
            'change_transport',
            'reorder_destinations',
            'adjust_budget',
            'add_contingency',
            'remove_activity'
        ],
        
        // Reward Function Parameters
        REWARD_PARAMS: {
            alpha: 0.4,  // User rating weight
            beta: 0.3,   // Budget adherence weight
            gamma: 0.2,  // Weather match weight
            delta: 0.1   // Crowd penalty weight
        }
    },
    
    // Bayesian Configuration
    BAYESIAN: {
        PRIORS: {
            cultural: { alpha: 2, beta: 2 },
            adventure: { alpha: 2, beta: 2 },
            relaxation: { alpha: 1, beta: 3 },
            food: { alpha: 2, beta: 2 },
            nightlife: { alpha: 1, beta: 4 },
            shopping: { alpha: 1, beta: 3 }
        },
        UPDATE_RATE: 0.1
    },
    
    // RL Configuration
    RL: {
        LEARNING_RATE: 0.001,
        DISCOUNT_FACTOR: 0.99,
        EPSILON: 0.1,
        EPISODES: 100,
        MAX_STEPS: 50
    },
    
    // Sample Destinations
    DESTINATIONS: {
        'Rajasthan, India': {
            center: [74.2179, 27.0238],
            cities: [
                { name: 'Jaipur', coords: [75.7873, 26.9124] },
                { name: 'Udaipur', coords: [73.7125, 24.5854] },
                { name: 'Jodhpur', coords: [73.0243, 26.2389] },
                { name: 'Jaisalmer', coords: [70.9083, 26.9157] }
            ]
        },
        'Kerala, India': {
            center: [76.2711, 10.8505],
            cities: [
                { name: 'Kochi', coords: [76.2673, 9.9312] },
                { name: 'Munnar', coords: [77.0593, 10.0889] },
                { name: 'Alleppey', coords: [76.3389, 9.4981] }
            ]
        }
    },
    
    // Sample Activities Database
    ACTIVITIES: {
        'Jaipur': [
            {
                name: 'Amber Fort',
                type: 'cultural',
                duration: 3,
                cost: 500,
                rating: 4.8,
                crowdLevel: 'high',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'City Palace',
                type: 'cultural',
                duration: 2,
                cost: 400,
                rating: 4.7,
                crowdLevel: 'medium',
                weather: ['sunny', 'cloudy', 'rainy']
            },
            {
                name: 'Hawa Mahal',
                type: 'cultural',
                duration: 1,
                cost: 200,
                rating: 4.6,
                crowdLevel: 'high',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'Jaigarh Fort',
                type: 'adventure',
                duration: 2.5,
                cost: 300,
                rating: 4.5,
                crowdLevel: 'low',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'Local Food Tour',
                type: 'food',
                duration: 3,
                cost: 800,
                rating: 4.9,
                crowdLevel: 'medium',
                weather: ['sunny', 'cloudy', 'rainy']
            }
        ],
        'Udaipur': [
            {
                name: 'Lake Pichola Boat Ride',
                type: 'relaxation',
                duration: 2,
                cost: 600,
                rating: 4.9,
                crowdLevel: 'medium',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'City Palace',
                type: 'cultural',
                duration: 2.5,
                cost: 500,
                rating: 4.8,
                crowdLevel: 'high',
                weather: ['sunny', 'cloudy', 'rainy']
            },
            {
                name: 'Monsoon Palace',
                type: 'cultural',
                duration: 1.5,
                cost: 300,
                rating: 4.6,
                crowdLevel: 'low',
                weather: ['sunny', 'cloudy']
            }
        ],
        'Jodhpur': [
            {
                name: 'Mehrangarh Fort',
                type: 'cultural',
                duration: 3,
                cost: 600,
                rating: 4.9,
                crowdLevel: 'high',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'Blue City Walk',
                type: 'adventure',
                duration: 2,
                cost: 300,
                rating: 4.7,
                crowdLevel: 'medium',
                weather: ['sunny', 'cloudy']
            },
            {
                name: 'Zip Lining',
                type: 'adventure',
                duration: 1.5,
                cost: 1200,
                rating: 4.8,
                crowdLevel: 'low',
                weather: ['sunny']
            }
        ]
    }
};

// Global State
const STATE = {
    currentItinerary: null,
    activeAgents: new Set(),
    logs: [],
    rewardHistory: [],
    preferences: {
        cultural: 0.85,
        adventure: 0.72,
        relaxation: 0.45,
        food: 0.60,
        nightlife: 0.30,
        shopping: 0.40
    },
    budget: {
        total: 15000,
        used: 5400,
        breakdown: {
            accommodation: 2100,
            food: 1800,
            transport: 1000,
            activities: 500
        }
    },
    mdpState: {
        currentDay: 1,
        currentLocation: 'Jaipur',
        remainingBudget: 15000,
        weatherProbability: 0.8,
        crowdLevel: 65,
        userSatisfaction: 4.2
    },
    persona: 'solo',
    theme: 'light',
    isDemo: false
};

// Utility Functions
const Utils = {
    // Generate unique ID
    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },
    
    // Format currency
    formatCurrency: (amount) => {
        return '₹' + amount.toLocaleString('en-IN');
    },
    
    // Format time
    formatTime: (hours) => {
        const h = Math.floor(hours);
        const m = Math.round((hours - h) * 60);
        return `${h}h ${m}m`;
    },
    
    // Get time of day
    getTimeOfDay: (hour) => {
        if (hour < 12) return 'Morning';
        if (hour < 17) return 'Afternoon';
        if (hour < 21) return 'Evening';
        return 'Night';
    },
    
    // Calculate distance between coordinates
    calculateDistance: (coord1, coord2) => {
        const R = 6371; // Earth's radius in km
        const dLat = (coord2[1] - coord1[1]) * Math.PI / 180;
        const dLon = (coord2[0] - coord1[0]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1[1] * Math.PI / 180) * Math.cos(coord2[1] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },
    
    // Random number between min and max
    random: (min, max) => {
        return Math.random() * (max - min) + min;
    },
    
    // Sleep function for animations
    sleep: (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    
    // Deep clone object
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },
    
    // Clamp number between min and max
    clamp: (num, min, max) => {
        return Math.min(Math.max(num, min), max);
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, STATE, Utils };
}
