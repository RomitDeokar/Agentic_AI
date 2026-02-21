// ============================================
// MDP (Markov Decision Process) Implementation
// ============================================

class MDP {
    constructor() {
        this.states = [];
        this.actions = CONFIG.MDP.ACTION_SPACE;
        this.transitionHistory = [];
        this.currentState = Utils.deepClone(STATE.mdpState);
    }
    
    // Calculate reward based on current state
    calculateReward(state, action) {
        const params = CONFIG.MDP.REWARD_PARAMS;
        
        // Normalize components
        const userRating = state.userSatisfaction / 5.0;
        const budgetAdherence = 1 - Math.abs(state.remainingBudget - STATE.budget.total * 0.5) / (STATE.budget.total * 0.5);
        const weatherMatch = state.weatherProbability;
        const crowdPenalty = state.crowdLevel / 100.0;
        
        const reward = 
            params.alpha * userRating +
            params.beta * budgetAdherence +
            params.gamma * weatherMatch -
            params.delta * crowdPenalty;
        
        return Utils.clamp(reward, -1, 1);
    }
    
    // Get next state based on action
    getNextState(state, action) {
        const nextState = Utils.deepClone(state);
        
        switch(action) {
            case 'keep_plan':
                // State progresses normally
                nextState.currentDay += 1;
                break;
                
            case 'swap_activity':
                // Improve satisfaction slightly
                nextState.userSatisfaction = Utils.clamp(nextState.userSatisfaction + 0.2, 0, 5);
                break;
                
            case 'change_transport':
                // Reduce budget, improve satisfaction
                nextState.remainingBudget -= 500;
                nextState.userSatisfaction = Utils.clamp(nextState.userSatisfaction + 0.1, 0, 5);
                break;
                
            case 'reorder_destinations':
                // Improve weather match
                nextState.weatherProbability = Utils.clamp(nextState.weatherProbability + 0.1, 0, 1);
                break;
                
            case 'adjust_budget':
                // Optimize budget allocation
                nextState.remainingBudget += 200;
                break;
                
            case 'add_contingency':
                // Reduce crowd level
                nextState.crowdLevel = Utils.clamp(nextState.crowdLevel - 10, 0, 100);
                nextState.remainingBudget -= 300;
                break;
                
            case 'remove_activity':
                // Save budget but reduce satisfaction
                nextState.remainingBudget += 400;
                nextState.userSatisfaction = Utils.clamp(nextState.userSatisfaction - 0.3, 0, 5);
                break;
        }
        
        // Add some randomness (stochasticity)
        nextState.weatherProbability = Utils.clamp(
            nextState.weatherProbability + Utils.random(-0.05, 0.05), 0, 1
        );
        nextState.crowdLevel = Utils.clamp(
            nextState.crowdLevel + Utils.random(-5, 5), 0, 100
        );
        
        return nextState;
    }
    
    // Simulate a transition
    transition(action) {
        const previousState = Utils.deepClone(this.currentState);
        this.currentState = this.getNextState(this.currentState, action);
        const reward = this.calculateReward(this.currentState, action);
        
        const transition = {
            state: previousState,
            action,
            nextState: this.currentState,
            reward,
            timestamp: Date.now()
        };
        
        this.transitionHistory.push(transition);
        STATE.mdpState = this.currentState;
        
        return transition;
    }
    
    // Get best action using policy
    getBestAction(state, policy) {
        // In a real RL implementation, this would query the learned policy
        // For demo, we use a simple heuristic
        
        if (state.remainingBudget < STATE.budget.total * 0.2) {
            return 'adjust_budget';
        }
        
        if (state.weatherProbability < 0.5) {
            return 'reorder_destinations';
        }
        
        if (state.crowdLevel > 80) {
            return 'add_contingency';
        }
        
        if (state.userSatisfaction < 3.5) {
            return 'swap_activity';
        }
        
        return 'keep_plan';
    }
    
    // Visualize MDP
    visualize() {
        const canvas = document.getElementById('mdpCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.clientWidth;
        const height = canvas.height = 300;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw state space
        const stateRadius = 40;
        const states = [
            { x: width * 0.2, y: height * 0.5, label: 'S₁' },
            { x: width * 0.4, y: height * 0.3, label: 'S₂' },
            { x: width * 0.4, y: height * 0.7, label: 'S₃' },
            { x: width * 0.6, y: height * 0.5, label: 'S₄' },
            { x: width * 0.8, y: height * 0.5, label: 'S*' }
        ];
        
        // Draw transitions
        ctx.strokeStyle = '#9333EA';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const connections = [
            [0, 1], [0, 2], [1, 3], [2, 3], [3, 4]
        ];
        
        connections.forEach(([i, j]) => {
            const s1 = states[i];
            const s2 = states[j];
            
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
            
            // Draw arrow
            const angle = Math.atan2(s2.y - s1.y, s2.x - s1.x);
            const arrowX = s2.x - stateRadius * Math.cos(angle);
            const arrowY = s2.y - stateRadius * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowY);
            ctx.lineTo(
                arrowX - 10 * Math.cos(angle - Math.PI / 6),
                arrowY - 10 * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
                arrowX - 10 * Math.cos(angle + Math.PI / 6),
                arrowY - 10 * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fillStyle = '#9333EA';
            ctx.fill();
        });
        
        ctx.setLineDash([]);
        
        // Draw states
        states.forEach((state, idx) => {
            // State circle
            ctx.beginPath();
            ctx.arc(state.x, state.y, stateRadius, 0, Math.PI * 2);
            ctx.fillStyle = idx === 4 ? '#10B981' : (idx === 0 ? '#4F46E5' : '#F3F4F6');
            ctx.fill();
            ctx.strokeStyle = '#9333EA';
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // State label
            ctx.fillStyle = idx === 4 || idx === 0 ? '#FFFFFF' : '#111827';
            ctx.font = 'bold 18px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(state.label, state.x, state.y);
        });
        
        // Draw legend
        ctx.fillStyle = '#6B7280';
        ctx.font = '14px Inter';
        ctx.textAlign = 'left';
        ctx.fillText('State Transition Graph', 10, 20);
        ctx.fillText('S₁: Initial | S*: Goal', 10, 40);
    }
}

// Monte Carlo Tree Search (MCTS) for planning
class MCTS {
    constructor(rootState) {
        this.root = {
            state: rootState,
            visits: 0,
            value: 0,
            children: [],
            parent: null
        };
        this.iterations = 0;
    }
    
    // UCB1 selection
    selectChild(node) {
        let best = null;
        let bestScore = -Infinity;
        
        for (const child of node.children) {
            const exploitation = child.value / (child.visits + 1);
            const exploration = Math.sqrt(2 * Math.log(node.visits + 1) / (child.visits + 1));
            const score = exploitation + exploration;
            
            if (score > bestScore) {
                bestScore = score;
                best = child;
            }
        }
        
        return best;
    }
    
    // Expand node
    expand(node) {
        const actions = CONFIG.MDP.ACTION_SPACE;
        
        actions.forEach(action => {
            const mdp = new MDP();
            mdp.currentState = node.state;
            const transition = mdp.transition(action);
            
            node.children.push({
                state: transition.nextState,
                action,
                visits: 0,
                value: transition.reward,
                children: [],
                parent: node
            });
        });
    }
    
    // Simulate rollout
    simulate(node) {
        let totalReward = 0;
        let currentState = Utils.deepClone(node.state);
        const mdp = new MDP();
        mdp.currentState = currentState;
        
        for (let i = 0; i < 5; i++) {
            const action = CONFIG.MDP.ACTION_SPACE[Math.floor(Math.random() * CONFIG.MDP.ACTION_SPACE.length)];
            const transition = mdp.transition(action);
            totalReward += transition.reward;
        }
        
        return totalReward;
    }
    
    // Backpropagate
    backpropagate(node, reward) {
        while (node) {
            node.visits += 1;
            node.value += reward;
            node = node.parent;
        }
    }
    
    // Run MCTS
    search(iterations = 100) {
        for (let i = 0; i < iterations; i++) {
            let node = this.root;
            
            // Selection
            while (node.children.length > 0) {
                node = this.selectChild(node);
            }
            
            // Expansion
            if (node.visits > 0) {
                this.expand(node);
                if (node.children.length > 0) {
                    node = node.children[0];
                }
            }
            
            // Simulation
            const reward = this.simulate(node);
            
            // Backpropagation
            this.backpropagate(node, reward);
            
            this.iterations++;
        }
        
        return this.getBestAction();
    }
    
    getBestAction() {
        let best = null;
        let bestVisits = -Infinity;
        
        for (const child of this.root.children) {
            if (child.visits > bestVisits) {
                bestVisits = child.visits;
                best = child;
            }
        }
        
        return best ? best.action : 'keep_plan';
    }
}

// Initialize MDP
let mdp;

document.addEventListener('DOMContentLoaded', () => {
    mdp = new MDP();
    
    // Visualize MDP on tab switch
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.getAttribute('data-tab') === 'mdp') {
                setTimeout(() => mdp.visualize(), 100);
            }
        });
    });
});
