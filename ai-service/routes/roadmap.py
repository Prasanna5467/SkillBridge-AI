
import requests
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


class RoadmapRequest(BaseModel):
    careerGoal: str
    skills: List[str] = Field(default_factory=list)
    experienceLevel: str = "Beginner"


@router.post("/generate")
def generate_roadmap(request: RoadmapRequest):

    if not request.careerGoal.strip():
        raise HTTPException(
            status_code=400,
            detail="Please provide a career goal."
        )

    prompt = f"""
You are an expert AI career mentor who creates personalized
career roadmaps for IT students and job seekers.

Create a personalized learning roadmap using this profile:

Career Goal: {request.careerGoal}
Current Skills: {request.skills}
Experience Level: {request.experienceLevel}

Instructions:
1. Understand the exact career goal.
2. Consider the user's existing skills.
3. Do not recommend learning skills the user already knows
   unless revision is necessary.
4. Identify important missing skills for this career.
5. Create 6 to 8 practical learning steps in a logical order.
6. Include hands-on practice and real-world projects.
7. Make the roadmap suitable for the given experience level.
8. Give specific descriptions, not generic sentences.
9. Suggest projects relevant to the career goal.
10. Do not return the same roadmap for every career.

Return ONLY valid JSON in this exact structure:

{{
    "success": true,
    "careerGoal": "{request.careerGoal}",
    "matchedCareer": "Career role understood by you",
    "experienceLevel": "{request.experienceLevel}",
    "existingSkills": {json.dumps(request.skills)},
    "missingSkills": [
        "Skill 1",
        "Skill 2"
    ],
    "roadmap": [
        {{
            "step": 1,
            "topic": "Topic name",
            "description": "Detailed explanation of what to learn and practice.",
            "suggestedProject": "A practical project related to this topic."
        }}
    ]
}}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "format": "json",
                "options": {
                    "temperature": 0.7
                }
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()
        ai_response = json.loads(result["response"])

        required_fields = [
            "success",
            "careerGoal",
            "matchedCareer",
            "experienceLevel",
            "existingSkills",
            "missingSkills",
            "roadmap"
        ]

        if not all(field in ai_response for field in required_fields):
            raise ValueError("AI response is missing required fields.")

        if not isinstance(ai_response["roadmap"], list):
            raise ValueError("AI returned an invalid roadmap.")

        ai_response["success"] = True

        return ai_response

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Please start Ollama."
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="AI generation took too long. Please try again."
        )

    except (requests.exceptions.RequestException, ValueError, KeyError, json.JSONDecodeError) as error:
        print("AI Roadmap Error:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Failed to generate a valid AI roadmap. Please try again."
        )
