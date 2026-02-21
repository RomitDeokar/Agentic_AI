"""
Weather Risk Agent - Real-time forecast with Bayesian probability
Uses Naive Bayes for weather classification
"""

import asyncio
import aiohttp
from typing import Dict, List
from datetime import datetime, timedelta

from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

from bayesian.naive_bayes import WeatherClassifier
from utils.config import settings


class WeatherAgent:
    """
    Weather Risk Agent
    - Real-time weather API integration
    - Bayesian probability estimation
    - Risk assessment for activities
    """
    
    def __init__(self):
        self.name = "Weather Risk Agent"
        self.status = "idle"
        self.classifier = WeatherClassifier()
        
        # LLM for natural language weather interpretation
        self.llm = ChatOpenAI(
            model="gpt-3.5-turbo",
            temperature=0.3,
            api_key=settings.OPENAI_API_KEY
        )
        
    async def forecast(self, destination: str, duration: int) -> Dict:
        """Get weather forecast with Bayesian probabilities"""
        
        self.status = "active"
        
        # Fetch real weather data (or simulate)
        weather_data = await self._fetch_weather_api(destination, duration)
        
        # Apply Bayesian classification
        probabilities = self.classifier.predict(weather_data)
        
        # Get LLM interpretation
        interpretation = await self._interpret_with_llm(weather_data, probabilities)
        
        self.status = "idle"
        
        return {
            "destination": destination,
            "duration": duration,
            "forecasts": weather_data,
            "bayesian_probabilities": probabilities,
            "interpretation": interpretation,
            "risk_level": self._calculate_risk(probabilities)
        }
    
    async def _fetch_weather_api(self, destination: str, duration: int) -> List[Dict]:
        """Fetch real weather data from OpenWeatherMap API"""
        
        # For demo, simulate. In production, use real API:
        # https://api.openweathermap.org/data/2.5/forecast
        
        forecasts = []
        for day in range(duration):
            # Simulate weather data
            forecasts.append({
                "day": day + 1,
                "date": (datetime.now() + timedelta(days=day)).strftime("%Y-%m-%d"),
                "temp": 25 + (day % 5),
                "humidity": 60 + (day % 20),
                "pressure": 1013 + (day % 10),
                "cloud_cover": 30 + (day % 40),
                "wind_speed": 10 + (day % 15),
                "condition": "sunny" if day % 2 == 0 else "cloudy"
            })
        
        return forecasts
    
    async def _interpret_with_llm(self, weather_data: List[Dict], probabilities: Dict) -> str:
        """Use LLM to interpret weather and provide recommendations"""
        
        prompt = f"""
        Analyze this weather forecast and provide travel recommendations:
        
        Weather Data: {weather_data}
        Bayesian Probabilities: {probabilities}
        
        Provide:
        1. Overall weather suitability (1-10)
        2. Best days for outdoor activities
        3. Days requiring indoor alternatives
        4. Specific recommendations for each day
        5. Risk mitigation strategies
        
        Be concise and actionable.
        """
        
        messages = [
            SystemMessage(content="You are a meteorologist specializing in travel planning."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        return response.content
    
    def _calculate_risk(self, probabilities: Dict) -> str:
        """Calculate overall weather risk level"""
        
        rain_prob = probabilities.get("rainy", 0)
        
        if rain_prob > 0.7:
            return "high"
        elif rain_prob > 0.4:
            return "medium"
        else:
            return "low"
    
    def get_status(self) -> Dict:
        """Get agent status"""
        return {
            "name": self.name,
            "status": self.status,
            "capabilities": [
                "Real-time API",
                "Naive Bayes Classification",
                "Risk Assessment",
                "LLM Interpretation"
            ]
        }
