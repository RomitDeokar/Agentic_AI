"""
Beta Distribution for Binary Preference Modeling
"""

import numpy as np
from scipy.stats import beta
from typing import Dict, Tuple


class BetaPreferenceModel:
    """
    Bayesian preference learning using Beta distribution
    P(θ | data) = Beta(α, β)
    """
    
    def __init__(self):
        # Initialize priors for each preference category
        self.preferences = {
            "adventure": {"alpha": 2, "beta": 2},      # Uniform prior
            "cultural": {"alpha": 2, "beta": 2},
            "nature": {"alpha": 2, "beta": 2},
            "relaxation": {"alpha": 2, "beta": 2},
            "food": {"alpha": 2, "beta": 2},
            "nightlife": {"alpha": 1, "beta": 3},      # Weak prior
            "shopping": {"alpha": 1, "beta": 3}
        }
    
    def update(self, category: str, rating: int) -> Dict[str, float]:
        """
        Update preference based on user rating (1-5 stars)
        
        Rating >= 4 → success (α += 1)
        Rating < 4 → failure (β += 1)
        """
        
        if category not in self.preferences:
            self.preferences[category] = {"alpha": 2, "beta": 2}
        
        # Convert rating to success/failure
        success = rating >= 4
        
        if success:
            self.preferences[category]["alpha"] += 1
        else:
            self.preferences[category]["beta"] += 1
        
        # Return updated probabilities
        return self.get_probabilities()
    
    def get_probabilities(self) -> Dict[str, float]:
        """
        Get mean probabilities for all categories
        E[θ] = α / (α + β)
        """
        
        probs = {}
        for category, params in self.preferences.items():
            alpha = params["alpha"]
            beta_param = params["beta"]
            probs[category] = alpha / (alpha + beta_param)
        
        return probs
    
    def get_confidence_intervals(self, confidence: float = 0.95) -> Dict[str, Tuple[float, float]]:
        """
        Get confidence intervals for each preference
        """
        
        intervals = {}
        alpha_level = (1 - confidence) / 2
        
        for category, params in self.preferences.items():
            alpha = params["alpha"]
            beta_param = params["beta"]
            
            # Beta distribution quantiles
            lower = beta.ppf(alpha_level, alpha, beta_param)
            upper = beta.ppf(1 - alpha_level, alpha, beta_param)
            
            intervals[category] = (lower, upper)
        
        return intervals
    
    def sample(self, category: str, n_samples: int = 1000) -> np.ndarray:
        """
        Sample from posterior distribution
        """
        
        params = self.preferences.get(category, {"alpha": 2, "beta": 2})
        return np.random.beta(params["alpha"], params["beta"], n_samples)
    
    def probability_greater_than(self, category: str, threshold: float = 0.5) -> float:
        """
        P(θ > threshold | data)
        """
        
        params = self.preferences.get(category, {"alpha": 2, "beta": 2})
        return 1 - beta.cdf(threshold, params["alpha"], params["beta"])
    
    def compare_categories(self, cat1: str, cat2: str, n_samples: int = 10000) -> float:
        """
        P(θ1 > θ2 | data)
        
        Probability that category 1 is preferred over category 2
        """
        
        samples1 = self.sample(cat1, n_samples)
        samples2 = self.sample(cat2, n_samples)
        
        return np.mean(samples1 > samples2)
    
    def get_stats(self) -> Dict:
        """Get model statistics"""
        
        return {
            "preferences": self.preferences,
            "probabilities": self.get_probabilities(),
            "confidence_intervals": self.get_confidence_intervals()
        }
