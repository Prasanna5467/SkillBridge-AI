
import requests
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


class SkillGapRequest(BaseModel):
    targetRole: str
    currentSkills: List[str] = Field(default_factory=list)
    experienceLevel: str = "Beginner"


@router.post("/analyze")
def analyze_skill_gap(data: SkillGapRequest):

    if not data.targetRole.strip():
        raise HTTPException(
            status_code=400,
            detail="Target role is required"
        )

    prompt = f"""
    You are an expert IT career advisor.

    Analyze the following user profile.

    Target Job Role: {data.targetRole}
    Current Skills: {data.currentSkills}
    Experience Level: {data.experienceLevel}

    Identify:
    1. Skills the user already has that match the role.
    2. Important missing skills.
    3. Priority of missing skills.
    4. Recommendations for learning.

    Return ONLY valid JSON in this structure:

    {{
        "targetRole": "{data.targetRole}",
        "matchedSkills": ["Java", "SQL"],
        "missingSkills": [
            {{
                "skill": "Spring Boot",
                "priority": "High",
                "reason": "Important for Java backend development"
            }}
        ],
        "recommendations": [
            "Learn Spring Boot",
            "Practice REST API development"
        ],
        "summary": "Short analysis of the user's skill gap"
    }}

    Use High, Medium or Low for priority.
    Do not mark a skill as matched unless it is in the user's current skills.
    """

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {"temperature": 0.3}
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()
        analysis = json.loads(result["response"])

        return {
            "success": True,
            "analysis": analysis
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Ollama service error: {str(e)}"
        )

    except (KeyError, json.JSONDecodeError):
        raise HTTPException(
            status_code=500,
            detail="Invalid AI response"
        )
