
import requests

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Dict

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


class MentorRequest(BaseModel):
    question: str
    careerGoal: str = "Not specified"
    skills: List[str] = Field(default_factory=list)
    experienceLevel: str = "Beginner"
    history: List[Dict[str, str]] = Field(default_factory=list)


@router.post("/chat")
def chat_with_mentor(request: MentorRequest):

    if not request.question.strip():
        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )

    conversation = ""

    for message in request.history[-6:]:
        role = message.get("role", "user")
        content = message.get("content", "")

        if role in ["user", "assistant"] and content:
            conversation += f"{role}: {content}\n"

    prompt = f"""
You are SkillBridge AI, a friendly and knowledgeable
personalized AI career mentor for IT students and job seekers.

USER PROFILE:
Career Goal: {request.careerGoal}
Current Skills: {request.skills}
Experience Level: {request.experienceLevel}

CONVERSATION HISTORY:
{conversation}

CURRENT QUESTION:
{request.question}

INSTRUCTIONS:
1. Give accurate and practical answers.
2. Personalize answers according to the user's career goal and skills.
3. Explain technical concepts in simple English.
4. Use examples and code when useful.
5. For interview preparation, give answers suitable for speaking in an interview.
6. If the user asks for a learning plan, provide clear steps.
7. Do not invent the user's skills or experience.
8. Be supportive, professional and concise.
9. If you do not know something, say so honestly.

Now answer the user's current question.
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7
                }
            },
            timeout=180
        )

        response.raise_for_status()

        result = response.json()
        answer = result.get("response", "").strip()

        if not answer:
            raise ValueError("Empty response from AI model.")

        return {
            "success": True,
            "answer": answer
        }

    except requests.exceptions.ConnectionError:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Please start Ollama."
        )

    except requests.exceptions.Timeout:
        raise HTTPException(
            status_code=504,
            detail="AI response took too long. Please try again."
        )

    except (requests.exceptions.RequestException, ValueError) as error:
        print("AI Mentor Error:", str(error))

        raise HTTPException(
            status_code=500,
            detail="Failed to generate an AI response."
        )
