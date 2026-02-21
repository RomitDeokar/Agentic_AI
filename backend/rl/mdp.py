"""
MDP (Markov Decision Process) Implementation
State space, action space, transition function, reward function
"""

from typing import Dict, List, Tuple
from dataclasses import dataclass
import numpy as np


@dataclass
class MDPState:
    """MDP State representation"""
    current_day: int
    current_location: str
    remaining_budget: float
    weather_probability: float  # 0-1, probability of good weather
    crowd_level: float  # 0-100
    user_satisfaction: float  # 0-5
    
    def to_tuple(self) -> Tuple:
        """Convert to hashable tuple for Q-table"""
        return (
            self.current_day,
            self.current_location,
            int(self.remaining_budget / 100),  # Discretize
            int(self.weather_probability * 10),
            int(self.crowd_level / 10),
            int(self.user_satisfaction)
        )


class MDPEnvironment:
    """
    MDP Environment for travel planning
    """
    
    def __init__(self):
        # Action space
        self.actions = [
            "keep_plan",
            "swap_activity",
            "change_transport",
            "reorder_destinations",
            "adjust_budget",
            "add_contingency",
            "remove_activity"
        ]
        
        # Reward function parameters
        self.alpha = 0.4  # User rating weight
        self.beta = 0.3   # Budget adherence weight
        self.gamma = 0.2  # Weather match weight
        self.delta = 0.1  # Crowd penalty weight
    
    def get_current_state(self, itinerary: Dict) -> MDPState:
        """Extract MDP state from itinerary"""
        
        if not itinerary:
            return MDPState(
                current_day=1,
                current_location="Unknown",
                remaining_budget=15000,
                weather_probability=0.8,
                crowd_level=50,
                user_satisfaction=3.5
            )
        
        # Extract state from itinerary
        return MDPState(
            current_day=itinerary.get("current_day", 1),
            current_location=itinerary.get("current_location", "Unknown"),
            remaining_budget=itinerary.get("remaining_budget", 15000),
            weather_probability=itinerary.get("weather_prob", 0.8),
            crowd_level=itinerary.get("crowd_level", 50),
            user_satisfaction=itinerary.get("satisfaction", 3.5)
        )
    
    def calculate_reward(
        self,
        state: MDPState,
        action: str,
        new_plan: Dict
    ) -> float:
        """
        Reward Function:
        R = α(user_rating) + β(budget_adherence) + γ(weather_match) - δ(crowd_penalty)
        """
        
        # Normalize user satisfaction (0-5 → 0-1)
        user_rating = state.user_satisfaction / 5.0
        
        # Budget adherence (1 = perfect, 0 = completely off)
        budget_target = 0.5  # Aim to use 50% of budget per day
        budget_used = 1 - (state.remaining_budget / 15000)
        budget_adherence = 1 - abs(budget_used - budget_target)
        
        # Weather match
        weather_match = state.weather_probability
        
        # Crowd penalty
        crowd_penalty = state.crowd_level / 100.0
        
        # Calculate total reward
        reward = (
            self.alpha * user_rating +
            self.beta * budget_adherence +
            self.gamma * weather_match -
            self.delta * crowd_penalty
        )
        
        # Clip to [-1, 1]
        return np.clip(reward, -1, 1)
    
    def transition(
        self,
        state: MDPState,
        action: str
    ) -> MDPState:
        """
        Transition function: P(s' | s, a)
        """
        
        next_state = MDPState(
            current_day=state.current_day,
            current_location=state.current_location,
            remaining_budget=state.remaining_budget,
            weather_probability=state.weather_probability,
            crowd_level=state.crowd_level,
            user_satisfaction=state.user_satisfaction
        )
        
        # Apply action effects
        if action == "keep_plan":
            next_state.current_day += 1
            
        elif action == "swap_activity":
            next_state.user_satisfaction = min(5.0, state.user_satisfaction + 0.2)
            next_state.remaining_budget -= 100
            
        elif action == "change_transport":
            next_state.remaining_budget -= 500
            next_state.user_satisfaction = min(5.0, state.user_satisfaction + 0.1)
            
        elif action == "reorder_destinations":
            next_state.weather_probability = min(1.0, state.weather_probability + 0.1)
            
        elif action == "adjust_budget":
            next_state.remaining_budget += 200
            
        elif action == "add_contingency":
            next_state.crowd_level = max(0, state.crowd_level - 10)
            next_state.remaining_budget -= 300
            
        elif action == "remove_activity":
            next_state.remaining_budget += 400
            next_state.user_satisfaction = max(0, state.user_satisfaction - 0.3)
        
        # Add stochasticity
        next_state.weather_probability += np.random.uniform(-0.05, 0.05)
        next_state.crowd_level += np.random.uniform(-5, 5)
        
        # Clip values
        next_state.weather_probability = np.clip(next_state.weather_probability, 0, 1)
        next_state.crowd_level = np.clip(next_state.crowd_level, 0, 100)
        next_state.user_satisfaction = np.clip(next_state.user_satisfaction, 0, 5)
        
        return next_state
