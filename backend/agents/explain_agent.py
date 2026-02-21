"""Explainability Agent - Plain-language decision explanations"""

from typing import Dict
from langchain_openai import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from utils.config import settings


class ExplainAgent:
    def __init__(self):
        self.name = "Explainability Agent"
        self.status = "idle"
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7,
            api_key=settings.OPENAI_API_KEY
        )
    
    async def explain_decisions(self, plan: Dict) -> list:
        self.status = "active"
        
        prompt = f"""
        Explain the key decisions in this travel itinerary in plain language:
        
        Plan: {plan}
        
        Provide 3-5 clear explanations covering:
        1. Why these activities were selected
        2. How the schedule was optimized
        3. Budget allocation reasoning
        4. Weather/crowd considerations
        5. Overall strategy
        
        Each explanation should be 1-2 sentences, clear and actionable.
        """
        
        messages = [
            SystemMessage(content="You are an expert at explaining AI decisions clearly."),
            HumanMessage(content=prompt)
        ]
        
        response = await self.llm.ainvoke(messages)
        
        # Parse into structured explanations
        explanations = [
            {
                "agent": "Planner Agent",
                "reasoning": response.content,
                "confidence": 0.92
            }
        ]
        
        self.status = "idle"
        return explanations
    
    def get_status(self) -> Dict:
        return {"name": self.name, "status": self.status}
