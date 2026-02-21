"""Booking Assistant Agent"""

from typing import Dict


class BookingAgent:
    def __init__(self):
        self.name = "Booking Assistant Agent"
        self.status = "idle"
    
    async def search(self, destination: str, dates: str, budget: float) -> Dict:
        self.status = "active"
        result = {
            "flights": {"available": 12, "best_price": 4500},
            "hotels": {"available": 23, "best_price": 1800}
        }
        self.status = "idle"
        return result
    
    def get_status(self) -> Dict:
        return {"name": self.name, "status": self.status}
