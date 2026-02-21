"""Utility helper functions"""

from typing import Tuple
import math


def format_currency(amount: float, currency: str = "₹") -> str:
    """Format currency with symbol"""
    return f"{currency}{amount:,.0f}"


def calculate_distance(coord1: Tuple[float, float], coord2: Tuple[float, float]) -> float:
    """
    Calculate distance between two coordinates (Haversine formula)
    Returns distance in kilometers
    """
    lat1, lon1 = coord1
    lat2, lon2 = coord2
    
    R = 6371  # Earth's radius in km
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat/2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon/2) ** 2)
    
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c


def format_time(hours: float) -> str:
    """Format hours to h:mm format"""
    h = int(hours)
    m = int((hours - h) * 60)
    return f"{h}h {m}m"
