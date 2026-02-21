// ============================================
// Reinforcement Learning Implementation
// ============================================

class ReinforcementLearning {
    constructor() {
        this.qTable = new Map();
        this.episodes = [];
        this.learningRate = CONFIG.RL.LEARNING_RATE;
        this.discountFactor = CONFIG.RL.DISCOUNT_FACTOR;
        this.epsilon = CONFIG.RL.EPSILON;
        this.episodeCount = 0;
        this.rewardHistory = [];
    }
    
    // Q-Learning: Get Q-value for state-action pair
    getQValue(state, action) {
        const key = this.stateActionKey(state, action);
        return this.qTable.get(key) || 0;
    }
    
    // Set Q-value
    setQValue(state, action, value) {
        const key = this.stateActionKey(state, action);
        this.qTable.set(key, value);
    }
    
    // Create unique key for state-action pair
    stateActionKey(state, action) {
        return JSON.stringify({ state, action });
    }
    
    // Epsilon-greedy action selection
    selectAction(state) {
        if (Math.random() < this.epsilon) {
            // Exploration: random action
            const actions = CONFIG.MDP.ACTION_SPACE;
            return actions[Math.floor(Math.random() * actions.length)];
        } else {
            // Exploitation: best known action
            return this.getBestAction(state);
        }
    }
    
    // Get best action for state
    getBestAction(state) {
        let bestAction = null;
        let bestValue = -Infinity;
        
        for (const action of CONFIG.MDP.ACTION_SPACE) {
            const value = this.getQValue(state, action);
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        }
        
        return bestAction || CONFIG.MDP.ACTION_SPACE[0];
    }
    
    // Q-Learning update
    update(state, action, reward, nextState) {
        const currentQ = this.getQValue(state, action);
        
        // Find max Q-value for next state
        let maxNextQ = -Infinity;
        for (const nextAction of CONFIG.MDP.ACTION_SPACE) {
            const q = this.getQValue(nextState, nextAction);
            if (q > maxNextQ) {
                maxNextQ = q;
            }
        }
        
        // Q-Learning update rule
        const newQ = currentQ + this.learningRate * (
            reward + this.discountFactor * maxNextQ - currentQ
        );
        
        this.setQValue(state, action, newQ);
        
        return newQ;
    }
    
    // Run training episode
    async runEpisode() {
        const episode = {
            steps: [],
            totalReward: 0,
            number: this.episodeCount
        };
        
        // Reset to initial state
        if (!mdp) mdp = new MDP();
        let state = Utils.deepClone(STATE.mdpState);
        
        for (let step = 0; step < CONFIG.RL.MAX_STEPS; step++) {
            // Select action
            const action = this.selectAction(state);
            
            // Take action and observe reward
            mdp.currentState = state;
            const transition = mdp.transition(action);
            const reward = transition.reward;
            const nextState = transition.nextState;
            
            // Update Q-table
            const qValue = this.update(state, action, reward, nextState);
            
            episode.steps.push({
                state,
                action,
                reward,
                nextState,
                qValue
            });
            
            episode.totalReward += reward;
            state = nextState;
            
            // Terminal condition
            if (state.currentDay >= 3 || state.remainingBudget <= 0) {
                break;
            }
        }
        
        this.episodes.push(episode);
        this.episodeCount++;
        this.rewardHistory.push(episode.totalReward);
        
        // Update reward history in STATE
        STATE.rewardHistory = this.rewardHistory;
        
        return episode;
    }
    
    // Train for multiple episodes
    async train(numEpisodes = 10) {
        AgentLog.info('RL System', `Starting training for ${numEpisodes} episodes`);
        
        for (let i = 0; i < numEpisodes; i++) {
            await this.runEpisode();
            
            // Decay epsilon
            this.epsilon = Math.max(0.01, this.epsilon * 0.995);
            
            // Small delay for visualization
            if (i % 5 === 0) {
                updateRLChart();
                await Utils.sleep(100);
            }
        }
        
        AgentLog.success('RL System', `Training complete. Final epsilon: ${this.epsilon.toFixed(3)}`);
        updateRLChart();
    }
    
    // Get policy (best actions for all states)
    getPolicy() {
        const policy = new Map();
        const visitedStates = new Set();
        
        // Extract unique states from Q-table
        for (const [key] of this.qTable) {
            const { state } = JSON.parse(key);
            const stateKey = JSON.stringify(state);
            if (!visitedStates.has(stateKey)) {
                visitedStates.add(stateKey);
                policy.set(stateKey, this.getBestAction(state));
            }
        }
        
        return policy;
    }
    
    // Calculate cumulative reward
    getCumulativeRewards() {
        const cumulative = [];
        let sum = 0;
        
        this.rewardHistory.forEach(reward => {
            sum += reward;
            cumulative.push(sum);
        });
        
        return cumulative;
    }
}

// Deep Q-Network (simplified simulation)
class DQN {
    constructor() {
        this.network = null; // In real implementation, this would be a neural network
        this.replayBuffer = [];
        this.batchSize = 32;
        this.targetUpdateFreq = 10;
        this.steps = 0;
    }
    
    // Predict Q-values for state
    predict(state) {
        // Simulated neural network output
        const qValues = {};
        CONFIG.MDP.ACTION_SPACE.forEach(action => {
            qValues[action] = Utils.random(-1, 1);
        });
        return qValues;
    }
    
    // Store experience in replay buffer
    remember(state, action, reward, nextState, done) {
        this.replayBuffer.push({ state, action, reward, nextState, done });
        
        // Keep buffer size manageable
        if (this.replayBuffer.length > 10000) {
            this.replayBuffer.shift();
        }
    }
    
    // Train on batch of experiences
    replay() {
        if (this.replayBuffer.length < this.batchSize) {
            return;
        }
        
        // Sample random batch
        const batch = [];
        for (let i = 0; i < this.batchSize; i++) {
            const idx = Math.floor(Math.random() * this.replayBuffer.length);
            batch.push(this.replayBuffer[idx]);
        }
        
        // In real implementation, update network weights here
        this.steps++;
    }
}

// Proximal Policy Optimization (PPO) - simplified
class PPO {
    constructor() {
        this.policy = null;
        this.valueFunction = null;
        this.clipEpsilon = 0.2;
        this.epochs = 10;
    }
    
    // Collect trajectories
    collectTrajectories(numSteps) {
        const trajectories = [];
        // Implementation would collect state-action-reward sequences
        return trajectories;
    }
    
    // Compute advantages
    computeAdvantages(trajectories) {
        // GAE (Generalized Advantage Estimation) would be used here
        return trajectories.map(t => ({ ...t, advantage: 0 }));
    }
    
    // Update policy
    updatePolicy(trajectories) {
        // PPO policy update with clipped objective
        AgentLog.info('PPO', 'Policy updated using clipped surrogate objective');
    }
}

// Initialize RL Chart
let rewardChart;

function initializeRLChart() {
    const canvas = document.getElementById('rewardChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    rewardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Cumulative Reward',
                data: [],
                borderColor: '#9333EA',
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#9333EA'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        family: 'Inter',
                        size: 14
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 12
                    },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Episode',
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Cumulative Reward',
                        font: {
                            family: 'Inter',
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        }
    });
}

// Update RL Chart with new data
function updateRLChart() {
    if (!rewardChart || !rl) return;
    
    const cumulativeRewards = rl.getCumulativeRewards();
    const labels = cumulativeRewards.map((_, idx) => idx + 1);
    
    rewardChart.data.labels = labels;
    rewardChart.data.datasets[0].data = cumulativeRewards;
    rewardChart.update('none'); // Update without animation for smooth real-time updates
}

// Train RL model
async function trainRLModel(episodes = 20) {
    if (!rl) {
        rl = new ReinforcementLearning();
    }
    
    showLoading('Training RL model...');
    
    await rl.train(episodes);
    
    hideLoading();
    showToast(`RL training complete! ${episodes} episodes`, 'success');
}

// Initialize RL system
let rl;
let dqn;
let ppo;

document.addEventListener('DOMContentLoaded', () => {
    rl = new ReinforcementLearning();
    dqn = new DQN();
    ppo = new PPO();
    
    initializeRLChart();
    
    // Start with some initial training
    setTimeout(() => {
        trainRLModel(30);
    }, 2000);
});
