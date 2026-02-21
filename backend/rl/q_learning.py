"""
Q-Learning Implementation for Travel Planning
"""

import numpy as np
from typing import Dict, Tuple
from collections import defaultdict

from .mdp import MDPState, MDPEnvironment


class QLearningAgent:
    """
    Q-Learning Agent with epsilon-greedy exploration
    Q(s,a) ← Q(s,a) + η[r + γ max Q(s',a') - Q(s,a)]
    """
    
    def __init__(
        self,
        learning_rate: float = 0.1,
        discount_factor: float = 0.95,
        epsilon: float = 0.3,
        epsilon_decay: float = 0.995,
        min_epsilon: float = 0.05
    ):
        self.learning_rate = learning_rate  # η
        self.discount_factor = discount_factor  # γ
        self.epsilon = epsilon  # Exploration rate
        self.epsilon_decay = epsilon_decay
        self.min_epsilon = min_epsilon
        
        # Q-table: (state, action) → Q-value
        self.q_table = defaultdict(lambda: 0.0)
        
        # Training stats
        self.episodes = 0
        self.total_reward = 0
        self.reward_history = []
        
        # Environment
        self.env = MDPEnvironment()
    
    def get_q_value(self, state: MDPState, action: str) -> float:
        """Get Q-value for state-action pair"""
        key = (state.to_tuple(), action)
        return self.q_table[key]
    
    def set_q_value(self, state: MDPState, action: str, value: float):
        """Set Q-value for state-action pair"""
        key = (state.to_tuple(), action)
        self.q_table[key] = value
    
    def select_action(self, state: MDPState, scenario_type: str = None) -> str:
        """
        Epsilon-greedy action selection
        """
        
        # Exploration: random action
        if np.random.random() < self.epsilon:
            return np.random.choice(self.env.actions)
        
        # Exploitation: best known action
        return self.get_best_action(state)
    
    def get_best_action(self, state: MDPState) -> str:
        """Get action with highest Q-value"""
        
        q_values = [
            (action, self.get_q_value(state, action))
            for action in self.env.actions
        ]
        
        # Return action with max Q-value
        best_action = max(q_values, key=lambda x: x[1])[0]
        return best_action
    
    def update(
        self,
        state: MDPState,
        action: str,
        reward: float,
        next_state: MDPState
    ):
        """
        Q-Learning update rule:
        Q(s,a) ← Q(s,a) + η[r + γ max Q(s',a') - Q(s,a)]
        """
        
        # Current Q-value
        current_q = self.get_q_value(state, action)
        
        # Max Q-value for next state
        next_q_values = [
            self.get_q_value(next_state, a)
            for a in self.env.actions
        ]
        max_next_q = max(next_q_values)
        
        # TD target
        td_target = reward + self.discount_factor * max_next_q
        
        # TD error
        td_error = td_target - current_q
        
        # Update Q-value
        new_q = current_q + self.learning_rate * td_error
        self.set_q_value(state, action, new_q)
        
        return new_q
    
    async def train_episode(self, preferences: Dict) -> float:
        """
        Train for one episode
        """
        
        # Initialize state
        state = MDPState(
            current_day=1,
            current_location="Jaipur",
            remaining_budget=15000,
            weather_probability=0.8,
            crowd_level=50,
            user_satisfaction=3.5
        )
        
        episode_reward = 0
        steps = 0
        max_steps = 50
        
        while steps < max_steps:
            # Select action
            action = self.select_action(state)
            
            # Take action
            next_state = self.env.transition(state, action)
            reward = self.env.calculate_reward(state, action, {})
            
            # Update Q-table
            self.update(state, action, reward, next_state)
            
            # Accumulate reward
            episode_reward += reward
            
            # Move to next state
            state = next_state
            steps += 1
            
            # Terminal condition
            if state.current_day >= 3:
                break
        
        # Update epsilon
        self.epsilon = max(self.min_epsilon, self.epsilon * self.epsilon_decay)
        
        # Track statistics
        self.episodes += 1
        self.reward_history.append(episode_reward)
        
        return episode_reward
    
    def get_policy(self) -> Dict:
        """Extract learned policy"""
        
        policy = {}
        for (state_tuple, action), q_value in self.q_table.items():
            if state_tuple not in policy or q_value > policy[state_tuple][1]:
                policy[state_tuple] = (action, q_value)
        
        return policy
    
    def get_stats(self) -> Dict:
        """Get training statistics"""
        
        return {
            "episodes": self.episodes,
            "epsilon": self.epsilon,
            "q_table_size": len(self.q_table),
            "avg_reward": np.mean(self.reward_history[-100:]) if self.reward_history else 0,
            "reward_history": self.reward_history
        }
