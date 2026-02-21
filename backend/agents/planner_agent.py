"""
Planner Agent - Master orchestrator using MCTS + Hierarchical RL
Uses LangChain for reasoning and planning
"""

import asyncio
from typing import Dict, List, Optional
from datetime import datetime, timedelta

from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.tools import Tool
from langchain.schema import SystemMessage, HumanMessage

from rl.mcts import MCTSPlanner
from utils.config import settings


class PlannerAgent:
    """
    Planner Agent - Master orchestrator
    - Uses MCTS for exploration
    - Hierarchical RL for decision-making
    - LangChain for natural language reasoning
    """
    
    def __init__(self):
        self.name = "Planner Agent"
        self.status = "idle"
        self.last_plan = None
        
        # Initialize LangChain LLM
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY
        )
        
        # Initialize MCTS planner
        self.mcts = MCTSPlanner(
            iterations=47,
            exploration_constant=1.41
        )
        
        # Activity database
        self.activities = self._load_activities()
        
    def _load_activities(self) -> Dict:
        """Load activity database"""
        return {
            "Jaipur": [
                {
                    "name": "Amber Fort",
                    "type": "cultural",
                    "duration": 3.0,
                    "cost": 500,
                    "rating": 4.8,
                    "crowd_level": "high",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Majestic hilltop fort with stunning architecture"
                },
                {
                    "name": "City Palace",
                    "type": "cultural",
                    "duration": 2.5,
                    "cost": 400,
                    "rating": 4.7,
                    "crowd_level": "medium",
                    "weather_suitable": ["sunny", "cloudy", "rainy"],
                    "description": "Royal residence with museums and courtyards"
                },
                {
                    "name": "Hawa Mahal",
                    "type": "cultural",
                    "duration": 1.5,
                    "cost": 200,
                    "rating": 4.6,
                    "crowd_level": "high",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Iconic palace with intricate lattice windows"
                },
                {
                    "name": "Jaigarh Fort",
                    "type": "adventure",
                    "duration": 2.5,
                    "cost": 300,
                    "rating": 4.5,
                    "crowd_level": "low",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Hill fort with world's largest cannon"
                },
                {
                    "name": "Local Food Tour",
                    "type": "food",
                    "duration": 3.0,
                    "cost": 800,
                    "rating": 4.9,
                    "crowd_level": "medium",
                    "weather_suitable": ["sunny", "cloudy", "rainy"],
                    "description": "Explore authentic Rajasthani cuisine"
                }
            ],
            "Udaipur": [
                {
                    "name": "Lake Pichola Boat Ride",
                    "type": "relaxation",
                    "duration": 2.0,
                    "cost": 600,
                    "rating": 4.9,
                    "crowd_level": "medium",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Romantic boat ride on scenic lake"
                },
                {
                    "name": "City Palace Udaipur",
                    "type": "cultural",
                    "duration": 2.5,
                    "cost": 500,
                    "rating": 4.8,
                    "crowd_level": "high",
                    "weather_suitable": ["sunny", "cloudy", "rainy"],
                    "description": "Palatial complex overlooking the lake"
                }
            ],
            "Jodhpur": [
                {
                    "name": "Mehrangarh Fort",
                    "type": "cultural",
                    "duration": 3.0,
                    "cost": 600,
                    "rating": 4.9,
                    "crowd_level": "high",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Magnificent fort with panoramic views"
                },
                {
                    "name": "Blue City Walk",
                    "type": "adventure",
                    "duration": 2.0,
                    "cost": 300,
                    "rating": 4.7,
                    "crowd_level": "medium",
                    "weather_suitable": ["sunny", "cloudy"],
                    "description": "Walk through iconic blue-painted streets"
                },
                {
                    "name": "Zip Lining",
                    "type": "adventure",
                    "duration": 1.5,
                    "cost": 1200,
                    "rating": 4.8,
                    "crowd_level": "low",
                    "weather_suitable": ["sunny"],
                    "description": "Thrilling zip line across the fort"
                }
            ]
        }
    
    async def plan_with_mcts(
        self,
        destination: str,
        duration: int,
        preferences: Dict,
        weather: Dict,
        crowd: Dict,
        budget: Dict
    ) -> Dict:
        """Generate itinerary using MCTS + LangChain"""
        
        self.status = "active"
        
        # Step 1: Use LangChain to understand user preferences
        preference_analysis = await self._analyze_preferences_with_llm(
            preferences, duration, budget
        )
        
        # Step 2: MCTS exploration
        best_plan = self.mcts.search(
            destination=destination,
            duration=duration,
            activities=self.activities,
            preferences=preference_analysis,
            weather=weather,
            crowd=crowd,
            budget=budget
        )
        
        # Step 3: LangChain refinement
        refined_plan = await self._refine_plan_with_llm(
            best_plan, preference_analysis
        )
        
        self.status = "idle"
        self.last_plan = refined_plan
        
        return refined_plan
    
    async def _analyze_preferences_with_llm(
        self,
        preferences: Dict,
        duration: int,
        budget: Dict
    ) -> Dict:
        """Use LLM to deeply analyze user preferences"""
        
        prompt = f"""
        Analyze these user travel preferences and provide detailed insights:
        
        Preferences: {preferences}
        Trip Duration: {duration} days
        Budget: {budget}
        
        Provide:
        1. Priority ranking of activity types
        2. Suggested pace (relaxed/moderate/intense)
        3. Morning vs evening preferences
        4. Cultural immersion level
        5. Adventure tolerance
        
        Return as structured JSON.
        """
        
        messages = [
            SystemMessage(content="You are an expert travel preference analyst."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # Parse LLM response
        # In production, use structured output
        return {
            "analyzed": True,
            "preferences": preferences,
            "llm_insights": response.content
        }
    
    async def _refine_plan_with_llm(
        self,
        plan: Dict,
        preferences: Dict
    ) -> Dict:
        """Use LLM to refine and optimize the plan"""
        
        prompt = f"""
        Refine this travel itinerary to better match user preferences:
        
        Current Plan: {plan}
        User Preferences: {preferences}
        
        Suggestions for:
        1. Activity sequencing
        2. Time optimization
        3. Experience flow
        4. Hidden gems to add
        5. Things to avoid
        
        Return improved itinerary with reasoning.
        """
        
        messages = [
            SystemMessage(content="You are an expert travel planner."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # Merge LLM suggestions with MCTS plan
        plan["llm_refinements"] = response.content
        plan["confidence"] = 0.92
        
        return plan
    
    async def replan(
        self,
        current: Dict,
        scenario: 'EmergencyScenario',
        action: str
    ) -> Dict:
        """Emergency replanning using LangChain reasoning"""
        
        self.status = "active"
        
        prompt = f"""
        EMERGENCY REPLANNING REQUIRED
        
        Current Itinerary: {current}
        Emergency Scenario: {scenario.dict()}
        Recommended Action: {action}
        
        Generate alternative itinerary that:
        1. Addresses the emergency scenario
        2. Minimizes disruption
        3. Maintains user satisfaction
        4. Stays within budget
        5. Provides compelling alternatives
        
        Return complete replanned itinerary with explanations.
        """
        
        messages = [
            SystemMessage(content="You are an expert crisis management travel planner."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # Parse and structure the replanned itinerary
        # In production, use function calling for structured output
        new_plan = {
            "replanned": True,
            "original": current,
            "scenario": scenario.dict(),
            "action": action,
            "new_itinerary": "... parsed from LLM ...",
            "reasoning": response.content
        }
        
        self.status = "idle"
        return new_plan
    
    def get_status(self) -> Dict:
        """Get agent status"""
        return {
            "name": self.name,
            "status": self.status,
            "last_plan_time": self.last_plan.get("timestamp") if self.last_plan else None,
            "capabilities": [
                "MCTS Planning",
                "Hierarchical RL",
                "LangChain Reasoning",
                "Emergency Replanning"
            ]
        }
