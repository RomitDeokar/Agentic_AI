"""
Multi-Agent Travel Intelligence System - Main Backend Server
FastAPI + LangChain + Reinforcement Learning
"""

import os
import asyncio
from typing import Dict, List, Optional
from datetime import datetime

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
import uvicorn

# Import our agents
from agents.planner_agent import PlannerAgent
from agents.weather_agent import WeatherAgent
from agents.crowd_agent import CrowdAgent
from agents.budget_agent import BudgetAgent
from agents.preference_agent import PreferenceAgent
from agents.booking_agent import BookingAgent
from agents.explain_agent import ExplainAgent

# Import RL components
from rl.mdp import MDPState, MDPEnvironment
from rl.q_learning import QLearningAgent
from rl.mcts import MCTSPlanner

# Import Bayesian components
from bayesian.beta_model import BetaPreferenceModel
from bayesian.naive_bayes import WeatherClassifier

# Configuration
from utils.config import settings
from utils.helpers import format_currency, calculate_distance

# Initialize FastAPI app
app = FastAPI(
    title="TRAVEL-AGENT API",
    description="Multi-Agent Autonomous Travel Intelligence System",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (frontend)
app.mount("/static", StaticFiles(directory="../frontend"), name="static")


# ============================================
# Pydantic Models
# ============================================

class TripRequest(BaseModel):
    destination: str
    duration: int  # days
    budget: float
    start_date: str
    preferences: List[str]
    persona: str = "solo"


class ActivityRating(BaseModel):
    activity_id: str
    category: str
    rating: int  # 1-5 stars


class EmergencyScenario(BaseModel):
    type: str  # "rainstorm", "budget_exceeded", "crowd_surge", "venue_closed"
    location: Optional[str] = None
    severity: Optional[float] = None


# ============================================
# Global State & Agent Initialization
# ============================================

class AgentSystem:
    """Multi-agent system coordinator"""
    
    def __init__(self):
        # Initialize 7 specialized agents
        self.planner = PlannerAgent()
        self.weather = WeatherAgent()
        self.crowd = CrowdAgent()
        self.budget = BudgetAgent()
        self.preference = PreferenceAgent()
        self.booking = BookingAgent()
        self.explainer = ExplainAgent()
        
        # Initialize RL components
        self.mdp_env = MDPEnvironment()
        self.q_agent = QLearningAgent()
        self.mcts = MCTSPlanner()
        
        # Initialize Bayesian models
        self.pref_model = BetaPreferenceModel()
        self.weather_classifier = WeatherClassifier()
        
        # State tracking
        self.current_itinerary = None
        self.episode_rewards = []
        self.active_agents = set()
        
    async def generate_itinerary(self, request: TripRequest) -> Dict:
        """Main itinerary generation using multi-agent collaboration"""
        
        # Step 1: Preference Analysis
        self.active_agents.add("preference")
        prefs = await self.preference.analyze(request.preferences, request.persona)
        
        # Step 2: Weather Forecast
        self.active_agents.add("weather")
        weather_data = await self.weather.forecast(request.destination, request.duration)
        
        # Step 3: Crowd Analysis
        self.active_agents.add("crowd")
        crowd_data = await self.crowd.analyze(request.destination)
        
        # Step 4: Budget Optimization
        self.active_agents.add("budget")
        budget_plan = await self.budget.optimize(request.budget, request.duration)
        
        # Step 5: MCTS Planning
        self.active_agents.add("planner")
        plan = await self.planner.plan_with_mcts(
            destination=request.destination,
            duration=request.duration,
            preferences=prefs,
            weather=weather_data,
            crowd=crowd_data,
            budget=budget_plan
        )
        
        # Step 6: Booking Search
        self.active_agents.add("booking")
        bookings = await self.booking.search(
            destination=request.destination,
            dates=request.start_date,
            budget=request.budget
        )
        
        # Step 7: Generate Explanations
        self.active_agents.add("explainer")
        explanations = await self.explainer.explain_decisions(plan)
        
        # Create itinerary
        itinerary = {
            "id": f"itin_{datetime.now().timestamp()}",
            "days": plan["days"],
            "total_cost": plan["total_cost"],
            "preferences": prefs,
            "weather": weather_data,
            "crowd": crowd_data,
            "budget_breakdown": budget_plan,
            "bookings": bookings,
            "explanations": explanations,
            "confidence": plan["confidence"]
        }
        
        self.current_itinerary = itinerary
        self.active_agents.clear()
        
        return itinerary
    
    async def replan(self, scenario: EmergencyScenario) -> Dict:
        """Emergency replanning using RL"""
        
        if not self.current_itinerary:
            raise ValueError("No active itinerary to replan")
        
        # Get current MDP state
        state = self.mdp_env.get_current_state(self.current_itinerary)
        
        # Use RL to select best action
        action = self.q_agent.select_action(state, scenario.type)
        
        # Execute action
        new_plan = await self.planner.replan(
            current=self.current_itinerary,
            scenario=scenario,
            action=action
        )
        
        # Update Q-values
        reward = self.mdp_env.calculate_reward(state, action, new_plan)
        next_state = self.mdp_env.get_current_state(new_plan)
        self.q_agent.update(state, action, reward, next_state)
        
        # Track reward
        self.episode_rewards.append(reward)
        
        return new_plan
    
    async def update_preferences(self, rating: ActivityRating) -> Dict:
        """Update Bayesian preference model from user rating"""
        
        # Update Beta distribution
        updated_probs = self.pref_model.update(
            category=rating.category,
            rating=rating.rating
        )
        
        # Retrain RL policy with new preferences
        await self.q_agent.train_episode(updated_probs)
        
        return {
            "preferences": updated_probs,
            "confidence_intervals": self.pref_model.get_confidence_intervals()
        }


# Initialize global agent system
agent_system = AgentSystem()


# ============================================
# WebSocket Manager for Real-Time Updates
# ============================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass


manager = ConnectionManager()


# ============================================
# API Endpoints
# ============================================

@app.get("/")
async def root():
    """Serve frontend"""
    return HTMLResponse(open("../frontend/index.html").read())


@app.post("/api/itinerary/generate")
async def generate_itinerary(request: TripRequest):
    """Generate intelligent itinerary using multi-agent system"""
    
    try:
        # Broadcast agent activity
        await manager.broadcast({
            "type": "agent_status",
            "message": "Starting multi-agent collaboration..."
        })
        
        # Generate itinerary
        itinerary = await agent_system.generate_itinerary(request)
        
        # Broadcast completion
        await manager.broadcast({
            "type": "itinerary_generated",
            "data": itinerary
        })
        
        return {
            "success": True,
            "itinerary": itinerary
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/itinerary/replan")
async def replan_itinerary(scenario: EmergencyScenario):
    """Emergency replanning with RL"""
    
    try:
        # Broadcast emergency
        await manager.broadcast({
            "type": "emergency",
            "scenario": scenario.dict()
        })
        
        # Replan
        new_plan = await agent_system.replan(scenario)
        
        return {
            "success": True,
            "new_plan": new_plan
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preferences/update")
async def update_preferences(rating: ActivityRating):
    """Update Bayesian preference model"""
    
    try:
        result = await agent_system.update_preferences(rating)
        
        # Broadcast preference update
        await manager.broadcast({
            "type": "preference_updated",
            "data": result
        })
        
        return {
            "success": True,
            "preferences": result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/rl/rewards")
async def get_rl_rewards():
    """Get RL reward history"""
    
    return {
        "episodes": len(agent_system.episode_rewards),
        "rewards": agent_system.episode_rewards,
        "cumulative": sum(agent_system.episode_rewards)
    }


@app.get("/api/agents/status")
async def get_agents_status():
    """Get status of all agents"""
    
    return {
        "active": list(agent_system.active_agents),
        "agents": {
            "planner": agent_system.planner.get_status(),
            "weather": agent_system.weather.get_status(),
            "crowd": agent_system.crowd.get_status(),
            "budget": agent_system.budget.get_status(),
            "preference": agent_system.preference.get_status(),
            "booking": agent_system.booking.get_status(),
            "explainer": agent_system.explainer.get_status()
        }
    }


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time agent updates"""
    
    await manager.connect(websocket)
    
    try:
        while True:
            # Receive messages from client
            data = await websocket.receive_text()
            
            # Echo back for testing
            await websocket.send_json({
                "type": "echo",
                "message": f"Received: {data}"
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    
    return {
        "status": "healthy",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }


# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║          TRAVEL-AGENT Backend Server Starting             ║
    ║   Multi-Agent Autonomous Travel Intelligence System       ║
    ║                                                           ║
    ║   FastAPI + LangChain + Reinforcement Learning           ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
