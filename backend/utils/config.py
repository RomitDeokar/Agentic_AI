"""
Application Configuration
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings"""
    
    # API Keys
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
    MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN", "")
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./travel_agent.db")
    REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # App Settings
    DEBUG = os.getenv("DEBUG", "True") == "True"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "8000"))
    
    # RL Settings
    RL_LEARNING_RATE = 0.1
    RL_DISCOUNT_FACTOR = 0.95
    RL_EPSILON = 0.3
    
    # MCTS Settings
    MCTS_ITERATIONS = 47
    MCTS_EXPLORATION = 1.41
    
    # MDP Reward Parameters
    REWARD_ALPHA = 0.4  # User rating weight
    REWARD_BETA = 0.3   # Budget adherence weight
    REWARD_GAMMA = 0.2  # Weather match weight
    REWARD_DELTA = 0.1  # Crowd penalty weight


settings = Settings()
