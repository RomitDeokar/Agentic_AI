"""
Monte Carlo Tree Search (MCTS) for itinerary planning
"""

import math
import random
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class MCTSNode:
    """Node in MCTS tree"""
    state: Dict
    parent: Optional['MCTSNode'] = None
    action: Optional[str] = None
    children: List['MCTSNode'] = None
    visits: int = 0
    value: float = 0.0
    
    def __post_init__(self):
        if self.children is None:
            self.children = []
    
    def is_fully_expanded(self, possible_actions: List) -> bool:
        return len(self.children) >= len(possible_actions)
    
    def best_child(self, exploration_constant: float = 1.41) -> 'MCTSNode':
        """UCB1 selection"""
        return max(
            self.children,
            key=lambda c: c.ucb1_score(exploration_constant)
        )
    
    def ucb1_score(self, c: float = 1.41) -> float:
        """
        UCB1: exploitation + exploration
        """
        if self.visits == 0:
            return float('inf')
        
        exploitation = self.value / self.visits
        exploration = c * math.sqrt(math.log(self.parent.visits) / self.visits)
        
        return exploitation + exploration


class MCTSPlanner:
    """
    Monte Carlo Tree Search for travel planning
    """
    
    def __init__(self, iterations: int = 47, exploration_constant: float = 1.41):
        self.iterations = iterations
        self.exploration_constant = exploration_constant
    
    def search(
        self,
        destination: str,
        duration: int,
        activities: Dict,
        preferences: Dict,
        weather: Dict,
        crowd: Dict,
        budget: Dict
    ) -> Dict:
        """
        Run MCTS to find best itinerary
        """
        
        # Initialize root node
        initial_state = {
            "destination": destination,
            "duration": duration,
            "days": [],
            "total_cost": 0,
            "preferences": preferences
        }
        
        root = MCTSNode(state=initial_state)
        
        # Run MCTS iterations
        for i in range(self.iterations):
            # 1. Selection
            node = self._select(root)
            
            # 2. Expansion
            if not node.is_fully_expanded(self._get_possible_actions(node.state)):
                node = self._expand(node, activities, weather, crowd, budget)
            
            # 3. Simulation (rollout)
            reward = self._simulate(node, activities, preferences)
            
            # 4. Backpropagation
            self._backpropagate(node, reward)
        
        # Return best plan
        best_child = root.best_child(exploration_constant=0)  # Pure exploitation
        
        return {
            "days": best_child.state.get("days", []),
            "total_cost": best_child.state.get("total_cost", 0),
            "confidence": best_child.value / best_child.visits if best_child.visits > 0 else 0,
            "iterations": self.iterations,
            "timestamp": "2024-01-01T00:00:00"
        }
    
    def _select(self, node: MCTSNode) -> MCTSNode:
        """Selection phase: traverse tree using UCB1"""
        
        while node.children:
            if not node.is_fully_expanded(self._get_possible_actions(node.state)):
                return node
            node = node.best_child(self.exploration_constant)
        
        return node
    
    def _expand(
        self,
        node: MCTSNode,
        activities: Dict,
        weather: Dict,
        crowd: Dict,
        budget: Dict
    ) -> MCTSNode:
        """Expansion phase: add new child node"""
        
        possible_actions = self._get_possible_actions(node.state)
        tried_actions = [child.action for child in node.children]
        untried_actions = [a for a in possible_actions if a not in tried_actions]
        
        if not untried_actions:
            return node
        
        # Choose random untried action
        action = random.choice(untried_actions)
        
        # Create new state
        new_state = self._apply_action(node.state, action, activities)
        
        # Create child node
        child = MCTSNode(
            state=new_state,
            parent=node,
            action=action
        )
        
        node.children.append(child)
        return child
    
    def _simulate(
        self,
        node: MCTSNode,
        activities: Dict,
        preferences: Dict
    ) -> float:
        """Simulation phase: random rollout"""
        
        state = node.state.copy()
        reward = 0
        
        # Simulate random actions
        for _ in range(5):
            actions = self._get_possible_actions(state)
            if not actions:
                break
            
            action = random.choice(actions)
            state = self._apply_action(state, action, activities)
            reward += self._evaluate_state(state, preferences)
        
        return reward
    
    def _backpropagate(self, node: MCTSNode, reward: float):
        """Backpropagation phase: update values"""
        
        while node:
            node.visits += 1
            node.value += reward
            node = node.parent
    
    def _get_possible_actions(self, state: Dict) -> List[str]:
        """Get possible actions from state"""
        
        actions = [
            "add_cultural_activity",
            "add_adventure_activity",
            "add_food_activity",
            "optimize_timing",
            "adjust_budget"
        ]
        
        return actions
    
    def _apply_action(
        self,
        state: Dict,
        action: str,
        activities: Dict
    ) -> Dict:
        """Apply action to create new state"""
        
        new_state = state.copy()
        
        # Simulate action effects
        if "add_" in action:
            activity_type = action.replace("add_", "").replace("_activity", "")
            # Add a random activity of this type
            new_state["days"] = new_state.get("days", [])
            new_state["total_cost"] = new_state.get("total_cost", 0) + 500
        
        return new_state
    
    def _evaluate_state(self, state: Dict, preferences: Dict) -> float:
        """Evaluate state quality"""
        
        # Simple heuristic evaluation
        score = 0
        
        # Reward based on number of days
        score += len(state.get("days", [])) * 0.1
        
        # Penalty for high cost
        cost = state.get("total_cost", 0)
        score -= (cost / 10000) * 0.1
        
        return score
