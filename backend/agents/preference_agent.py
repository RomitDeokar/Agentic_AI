"""Preference Agent - Bayesian user modeling"""

from typing import Dict
from bayesian.beta_model import BetaPreferenceModel


class PreferenceAgent:
    def __init__(self):
        self.name = "Preference Agent"
        self.status = "idle"
        self.model = BetaPreferenceModel()
    
    async def analyze(self, preferences: list, persona: str) -> Dict:
        self.status = "active"
        
        # Map persona to preferences
        persona_prefs = {
            "solo": {"cultural": 0.85, "adventure": 0.72, "relaxation": 0.45},
            "family": {"cultural": 0.70, "relaxation": 0.75, "food": 0.80},
            "luxury": {"relaxation": 0.90, "food": 0.95, "shopping": 0.85}
        }
        
        result = persona_prefs.get(persona, {})
        self.status = "idle"
        return result
    
    def get_status(self) -> Dict:
        return {"name": self.name, "status": self.status}
