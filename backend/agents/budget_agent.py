"""Budget Optimizer Agent"""

from typing import Dict
from utils.config import settings


class BudgetAgent:
    def __init__(self):
        self.name = "Budget Optimizer Agent"
        self.status = "idle"
    
    async def optimize(self, budget: float, duration: int) -> Dict:
        self.status = "active"
        per_day = budget / duration
        result = {
            "total": budget,
            "per_day": per_day,
            "breakdown": {
                "accommodation": per_day * 0.35,
                "food": per_day * 0.30,
                "transport": per_day * 0.20,
                "activities": per_day * 0.15
            }
        }
        self.status = "idle"
        return result
    
    def get_status(self) -> Dict:
        return {"name": self.name, "status": self.status}
