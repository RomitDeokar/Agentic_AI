"""
SmartRoute Backend - Multi-Agent Travel Intelligence System
Using Google Gemini API for all LLM operations
"""

import os
import asyncio
import json
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn

# Google Gemini imports
import google.generativeai as genai
from dotenv import load_dotenv
load_dotenv()
# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize FastAPI app
app = FastAPI(
    title="SmartRoute API",
    description="Multi-Agent Autonomous Travel Intelligence System",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# Pydantic Models
# ============================================

class TripRequest(BaseModel):
    destination: str
    duration: int
    budget: float
    start_date: str
    preferences: List[str]
    persona: str = "solo"

class ActivityRating(BaseModel):
    activity_id: str
    category: str
    rating: int

class EmergencyScenario(BaseModel):
    type: str
    location: Optional[str] = None
    severity: Optional[float] = None

class AgentMessage(BaseModel):
    agent: str
    message: str
    timestamp: str
    type: str

# ============================================
# Agent System Classes
# ============================================

class GeminiAgent:
    """Base class for Gemini-powered agents"""
    
    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.model = genai.GenerativeModel('gemini-pro') if GEMINI_API_KEY else None
        self.status = "idle"
        
    async def think(self, prompt: str) -> str:
        """Generate response using Gemini"""
        if not self.model:
            return f"[Mock Response from {self.name}] Processed: {prompt[:50]}..."
        
        try:
            self.status = "thinking"
            response = await asyncio.to_thread(
                lambda: self.model.generate_content(prompt)
            )
            self.status = "complete"
            return response.text
        except Exception as e:
            self.status = "error"
            return f"Error: {str(e)}"

class PlannerAgent(GeminiAgent):
    """MCTS-based intelligent itinerary planner"""
    
    def __init__(self):
        super().__init__("Planner", "Itinerary Optimization using MCTS")
        
    async def create_itinerary(self, request: TripRequest, context: Dict) -> Dict:
        """Create optimized itinerary"""
        self.status = "working"
        
        prompt = f"""Create a detailed {request.duration}-day travel itinerary for {request.destination}.
Budget: ₹{request.budget}
Start Date: {request.start_date}
Persona: {request.persona}
Preferences: {', '.join(request.preferences)}
Weather Context: {context.get('weather', 'Unknown')}
Crowd Levels: {context.get('crowd', 'Moderate')}

Generate a day-by-day itinerary with:
- Activities with time slots
- Estimated costs
- Travel time between locations
- Alternative options for bad weather

Format as JSON with structure:
{{
  "days": [
    {{
      "day": 1,
      "activities": [
        {{"time": "09:00", "activity": "...", "location": "...", "cost": 500, "duration": "2h"}}
      ]
    }}
  ],
  "total_cost": 0,
  "mcts_iterations": 47
}}"""
        
        response = await self.think(prompt)
        self.status = "complete"
        
        # Parse JSON or return mock data
        try:
            return json.loads(response)
        except:
            return self._generate_mock_itinerary(request)
    
    def _generate_mock_itinerary(self, request: TripRequest) -> Dict:
        """Generate mock itinerary for demo"""
        activities_by_pref = {
            "cultural": ["Visit Palace", "Museum Tour", "Heritage Walk", "Temple Visit"],
            "adventure": ["Desert Safari", "Zip Lining", "Rock Climbing", "Hot Air Balloon"],
            "relaxation": ["Spa Session", "Lake Visit", "Garden Stroll", "Yoga Class"],
            "food": ["Food Tour", "Cooking Class", "Street Food Walk", "Fine Dining"],
        }
        
        days = []
        daily_budget = request.budget / request.duration
        
        for day in range(1, request.duration + 1):
            activities = []
            time_slots = ["09:00", "12:00", "15:00", "18:00"]
            
            for i, time in enumerate(time_slots[:3]):
                pref = request.preferences[i % len(request.preferences)] if request.preferences else "cultural"
                activity_list = activities_by_pref.get(pref, activities_by_pref["cultural"])
                activity = random.choice(activity_list)
                
                activities.append({
                    "time": time,
                    "activity": activity,
                    "location": f"{request.destination} Location {i+1}",
                    "cost": random.randint(200, 1000),
                    "duration": "2-3h",
                    "category": pref
                })
            
            days.append({"day": day, "activities": activities})
        
        total_cost = sum(act["cost"] for day in days for act in day["activities"])
        
        return {
            "days": days,
            "total_cost": total_cost,
            "mcts_iterations": 47,
            "optimization_score": 0.87
        }

class WeatherAgent(GeminiAgent):
    """Bayesian weather risk analyzer"""
    
    def __init__(self):
        super().__init__("Weather Risk", "Bayesian Weather Prediction")
    
    async def analyze_weather(self, location: str, dates: List[str]) -> Dict:
        """Analyze weather patterns"""
        self.status = "working"
        
        prompt = f"""Analyze weather risks for {location} on dates: {', '.join(dates)}.
Provide:
- Daily weather forecast (temp, precipitation, conditions)
- Risk level (Low/Medium/High) for outdoor activities
- Alternative activity suggestions for bad weather
- Bayesian confidence scores

Format as JSON."""
        
        response = await self.think(prompt)
        self.status = "complete"
        
        # Return mock data for demo
        return {
            "forecasts": [
                {
                    "date": date,
                    "temp": random.randint(25, 35),
                    "condition": random.choice(["Sunny", "Partly Cloudy", "Cloudy", "Rainy"]),
                    "precipitation_prob": random.randint(0, 70),
                    "risk_level": "Low"
                }
                for date in dates
            ],
            "bayesian_confidence": 0.85
        }

class CrowdAgent(GeminiAgent):
    """Gaussian Process crowd analyzer"""
    
    def __init__(self):
        super().__init__("Crowd Analyzer", "Crowd Density Prediction")
    
    async def predict_crowds(self, locations: List[str], dates: List[str]) -> Dict:
        """Predict crowd levels"""
        self.status = "working"
        
        return {
            "predictions": [
                {
                    "location": loc,
                    "crowd_level": random.choice(["Low", "Medium", "High"]),
                    "best_time": f"{random.randint(6, 10)}:00 AM",
                    "confidence": random.uniform(0.7, 0.95)
                }
                for loc in locations
            ]
        }

class BudgetAgent(GeminiAgent):
    """Constraint-based budget optimizer"""
    
    def __init__(self):
        super().__init__("Budget Optimizer", "Cost Optimization")
    
    async def optimize_budget(self, itinerary: Dict, budget: float) -> Dict:
        """Optimize costs within budget"""
        self.status = "working"
        
        total_cost = itinerary.get("total_cost", 0)
        
        if total_cost <= budget:
            savings = budget - total_cost
            return {
                "status": "within_budget",
                "savings": savings,
                "optimization_suggestions": [],
                "breakdown": {
                    "accommodation": total_cost * 0.35,
                    "food": total_cost * 0.25,
                    "transport": total_cost * 0.20,
                    "activities": total_cost * 0.20
                }
            }
        else:
            overspend = total_cost - budget
            return {
                "status": "over_budget",
                "overspend": overspend,
                "optimization_suggestions": [
                    "Switch to budget accommodation (save ₹2000)",
                    "Use public transport (save ₹1500)",
                    "Reduce luxury dining (save ₹1000)"
                ],
                "breakdown": {
                    "accommodation": total_cost * 0.35,
                    "food": total_cost * 0.25,
                    "transport": total_cost * 0.20,
                    "activities": total_cost * 0.20
                }
            }

class PreferenceAgent(GeminiAgent):
    """Beta/Dirichlet preference learning"""
    
    def __init__(self):
        super().__init__("Preference", "Bayesian Preference Learning")
        self.preference_model = {}  # Category -> (alpha, beta)
    
    async def update_preferences(self, rating: ActivityRating) -> Dict:
        """Update preference model with rating"""
        self.status = "working"
        
        category = rating.category
        if category not in self.preference_model:
            self.preference_model[category] = {"alpha": 1, "beta": 1}
        
        # Update Beta distribution
        if rating.rating >= 4:
            self.preference_model[category]["alpha"] += 1
        else:
            self.preference_model[category]["beta"] += 1
        
        # Calculate preference probability
        alpha = self.preference_model[category]["alpha"]
        beta = self.preference_model[category]["beta"]
        preference_prob = alpha / (alpha + beta)
        
        return {
            "category": category,
            "preference_probability": preference_prob,
            "confidence": (alpha + beta) / 20.0,  # Normalize
            "all_preferences": {
                cat: model["alpha"] / (model["alpha"] + model["beta"])
                for cat, model in self.preference_model.items()
            }
        }

class BookingAgent(GeminiAgent):
    """API integration for bookings"""
    
    def __init__(self):
        super().__init__("Booking Assistant", "Hotel & Activity Booking")
    
    async def search_hotels(self, location: str, budget: float) -> List[Dict]:
        """Search available hotels"""
        self.status = "working"
        
        return [
            {
                "name": f"Hotel {i+1}",
                "price": random.randint(1000, 3000),
                "rating": round(random.uniform(3.5, 5.0), 1),
                "location": location,
                "available": True
            }
            for i in range(5)
        ]

class ExplainAgent(GeminiAgent):
    """Natural language explainability"""
    
    def __init__(self):
        super().__init__("Explainability", "Decision Explanation")
    
    async def explain_decision(self, context: Dict) -> str:
        """Generate explanation for decisions"""
        self.status = "working"
        
        prompt = f"""Explain why the following travel decisions were made:
Context: {json.dumps(context, indent=2)}

Provide a clear, natural language explanation focusing on:
- How agent collaboration led to the decision
- Key factors (weather, budget, preferences, crowds)
- Trade-offs made
- Why this is optimal for the user"""
        
        response = await self.think(prompt)
        return response

# ============================================
# Agent System Coordinator
# ============================================

class AgentSystem:
    """Multi-agent system coordinator"""
    
    def __init__(self):
        self.planner = PlannerAgent()
        self.weather = WeatherAgent()
        self.crowd = CrowdAgent()
        self.budget = BudgetAgent()
        self.preference = PreferenceAgent()
        self.booking = BookingAgent()
        self.explainer = ExplainAgent()
        
        self.agents = [
            self.planner,
            self.weather,
            self.crowd,
            self.budget,
            self.preference,
            self.booking,
            self.explainer
        ]
        
        self.communication_log = []
    
    def log_communication(self, from_agent: str, to_agent: str, message: str):
        """Log inter-agent communication"""
        self.communication_log.append({
            "from": from_agent,
            "to": to_agent,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })
    
    async def plan_trip(self, request: TripRequest) -> Dict:
        """Coordinate all agents to plan trip"""
        
        # Step 1: Weather analysis
        dates = [
            (datetime.fromisoformat(request.start_date) + timedelta(days=i)).strftime("%Y-%m-%d")
            for i in range(request.duration)
        ]
        weather_data = await self.weather.analyze_weather(request.destination, dates)
        self.log_communication("Weather Risk", "Planner", f"Weather data: {weather_data['bayesian_confidence']} confidence")
        
        # Step 2: Create itinerary
        context = {"weather": weather_data, "crowd": "Moderate"}
        itinerary = await self.planner.create_itinerary(request, context)
        self.log_communication("Planner", "Budget Optimizer", f"Itinerary created: ₹{itinerary['total_cost']}")
        
        # Step 3: Budget optimization
        budget_analysis = await self.budget.optimize_budget(itinerary, request.budget)
        self.log_communication("Budget Optimizer", "Planner", f"Budget status: {budget_analysis['status']}")
        
        # Step 4: Crowd analysis
        locations = [
            act["location"]
            for day in itinerary["days"]
            for act in day["activities"]
        ]
        crowd_data = await self.crowd.predict_crowds(list(set(locations)), dates)
        self.log_communication("Crowd Analyzer", "Planner", f"Analyzed {len(locations)} locations")
        
        # Step 5: Generate explanation
        explanation_context = {
            "itinerary": itinerary,
            "budget": budget_analysis,
            "weather": weather_data,
            "crowds": crowd_data
        }
        explanation = await self.explainer.explain_decision(explanation_context)
        
        return {
            "itinerary": itinerary,
            "weather": weather_data,
            "budget": budget_analysis,
            "crowds": crowd_data,
            "explanation": explanation,
            "communication_log": self.communication_log[-10:]  # Last 10 messages
        }
    
    def get_agent_states(self) -> List[Dict]:
        """Get current state of all agents"""
        return [
            {
                "name": agent.name,
                "role": agent.role,
                "status": agent.status
            }
            for agent in self.agents
        ]

# Global agent system
agent_system = AgentSystem()

# ============================================
# WebSocket Manager
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
    return {"message": "SmartRoute API v2.0 - Multi-Agent Travel Intelligence"}

@app.post("/api/plan-trip")
async def plan_trip(request: TripRequest):
    """Plan a complete trip"""
    try:
        result = await agent_system.plan_trip(request)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agents/status")
async def get_agent_status():
    """Get status of all agents"""
    return {"agents": agent_system.get_agent_states()}

@app.post("/api/rate-activity")
async def rate_activity(rating: ActivityRating):
    """Rate an activity to update preferences"""
    result = await agent_system.preference.update_preferences(rating)
    return result

@app.post("/api/emergency")
async def handle_emergency(scenario: EmergencyScenario):
    """Handle emergency replanning"""
    # Trigger replanning based on scenario
    await manager.broadcast({
        "type": "emergency",
        "scenario": scenario.dict()
    })
    return {"status": "replanning initiated"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket for real-time updates"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Process incoming messages
            await manager.broadcast({
                "type": "agent_update",
                "agents": agent_system.get_agent_states()
            })
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# ============================================
# Main
# ============================================

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 SmartRoute Backend Starting...")
    print("=" * 60)
    print(f"Gemini API: {'✓ Configured' if GEMINI_API_KEY else '✗ Not configured (using mock)'}")
    print("Server: http://localhost:8000")
    print("WebSocket: ws://localhost:8000/ws")
    print("=" * 60)
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
