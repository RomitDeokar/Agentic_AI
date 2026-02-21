"""
Naive Bayes Classifier for Weather Prediction
"""

import numpy as np
from typing import Dict, List


class WeatherClassifier:
    """
    Naive Bayes classifier for weather conditions
    P(class | features) ∝ P(features | class) × P(class)
    """
    
    def __init__(self):
        # Prior probabilities
        self.priors = {
            "sunny": 0.5,
            "cloudy": 0.3,
            "rainy": 0.2
        }
        
        # Likelihood models (simplified)
        # P(feature | class)
        self.likelihoods = {
            "sunny": {
                "temp": (28, 5),      # (mean, std)
                "humidity": (50, 10),
                "pressure": (1015, 5),
                "cloud_cover": (20, 15),
                "wind_speed": (10, 5)
            },
            "cloudy": {
                "temp": (24, 4),
                "humidity": (65, 10),
                "pressure": (1012, 5),
                "cloud_cover": (60, 15),
                "wind_speed": (15, 7)
            },
            "rainy": {
                "temp": (20, 3),
                "humidity": (85, 8),
                "pressure": (1008, 4),
                "cloud_cover": (90, 10),
                "wind_speed": (20, 8)
            }
        }
    
    def predict(self, weather_data: List[Dict]) -> Dict[str, float]:
        """
        Predict weather probabilities using Naive Bayes
        """
        
        # Average predictions across all days
        all_predictions = []
        
        for day_data in weather_data:
            posteriors = self._calculate_posteriors(day_data)
            all_predictions.append(posteriors)
        
        # Average probabilities
        avg_posteriors = {}
        for weather in self.priors.keys():
            avg_posteriors[weather] = np.mean([p[weather] for p in all_predictions])
        
        return avg_posteriors
    
    def _calculate_posteriors(self, features: Dict) -> Dict[str, float]:
        """
        Calculate posterior probabilities for a single observation
        """
        
        posteriors = {}
        
        for weather_class in self.priors.keys():
            # Start with prior
            log_prob = np.log(self.priors[weather_class])
            
            # Multiply by likelihoods (add log-likelihoods)
            for feature, value in features.items():
                if feature in self.likelihoods[weather_class]:
                    log_prob += self._log_likelihood(
                        value,
                        weather_class,
                        feature
                    )
            
            posteriors[weather_class] = log_prob
        
        # Convert log probabilities to probabilities
        posteriors = self._normalize_log_probs(posteriors)
        
        return posteriors
    
    def _log_likelihood(
        self,
        value: float,
        weather_class: str,
        feature: str
    ) -> float:
        """
        Calculate log P(feature=value | class)
        Assuming Gaussian distribution
        """
        
        params = self.likelihoods[weather_class][feature]
        mean, std = params
        
        # Gaussian log-likelihood
        log_prob = -0.5 * np.log(2 * np.pi * std**2)
        log_prob -= 0.5 * ((value - mean) / std)**2
        
        return log_prob
    
    def _normalize_log_probs(self, log_probs: Dict[str, float]) -> Dict[str, float]:
        """
        Normalize log probabilities to probabilities
        """
        
        # Subtract max for numerical stability
        max_log_prob = max(log_probs.values())
        exp_probs = {k: np.exp(v - max_log_prob) for k, v in log_probs.items()}
        
        # Normalize
        total = sum(exp_probs.values())
        probs = {k: v / total for k, v in exp_probs.items()}
        
        return probs
    
    def train(self, training_data: List[Tuple[Dict, str]]):
        """
        Train the classifier (update likelihoods from data)
        """
        
        # Group by class
        class_data = {weather: [] for weather in self.priors.keys()}
        
        for features, label in training_data:
            if label in class_data:
                class_data[label].append(features)
        
        # Update likelihoods
        for weather_class, samples in class_data.items():
            if not samples:
                continue
            
            for feature in self.likelihoods[weather_class].keys():
                values = [s[feature] for s in samples if feature in s]
                if values:
                    mean = np.mean(values)
                    std = np.std(values)
                    self.likelihoods[weather_class][feature] = (mean, std)
        
        # Update priors
        total_samples = sum(len(samples) for samples in class_data.values())
        for weather_class, samples in class_data.items():
            self.priors[weather_class] = len(samples) / total_samples
