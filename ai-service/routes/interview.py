
import requests
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter()

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "llama3.2:3b"


class InterviewRequest(BaseModel):
    topic: str
    difficulty: str = "Intermediate"
    count: int = Field(default=5, ge=1, le=10)


class EvaluationRequest(BaseModel):
    topic: str
    question: str
    answer: str


def ask_ollama(prompt: str):
    """Send a prompt to the local Llama model."""

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
        return json.loads(result["response"])

    except requests.exceptions.RequestException as error:
        raise HTTPException(
            status_code=503,
            detail=f"Unable to connect to Ollama: {str(error)}"
        )

    except (ValueError, KeyError):
        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid response. Please try again."
        )


@router.post("/generate")
def generate_questions(data: InterviewRequest):

    prompt = f"""
    You are an experienced IT technical interviewer.

    Generate exactly {data.count} unique interview questions.

    Subject: {data.topic}
    Difficulty: {data.difficulty}

    Requirements:
    1. Questions must be relevant to IT job interviews.
    2. Questions must match the selected difficulty.
    3. Avoid duplicate questions.
    4. Use clear and simple English.
    5. Include a mixture of conceptual and practical questions.
    6. Do not provide answers.

    Return valid JSON in this exact structure:

    {{
        "topic": "{data.topic}",
        "difficulty": "{data.difficulty}",
        "questions": [
            {{
                "id": 1,
                "question": "Question text"
            }}
        ]
    }}
    """

    result = ask_ollama(prompt)

    questions = result.get("questions")

    if not isinstance(questions, list) or len(questions) == 0:
        raise HTTPException(
            status_code=500,
            detail="AI could not generate questions. Please try again."
        )

    return {
        "success": True,
        "topic": data.topic,
        "difficulty": data.difficulty,
        "questions": questions
    }


@router.post("/evaluate")
def evaluate_answer(data: EvaluationRequest):

    if not data.answer.strip():
        raise HTTPException(
            status_code=400,
            detail="Please submit an answer for evaluation."
        )

    prompt = f"""
    You are an experienced IT technical interviewer.

    Evaluate the candidate's answer honestly and fairly.

    Subject: {data.topic}
    Interview Question: {data.question}
    Candidate Answer: {data.answer}

    Evaluation requirements:
    1. Evaluate technical correctness.
    2. Check whether the answer addresses the question.
    3. Consider important missing points.
    4. Give a score from 0 to 10.
    5. Give simple and constructive feedback.
    6. Provide a correct sample answer.
    7. Suggest specific improvements.
    8. Do not give a high score for an incorrect answer.
    9. Give partial marks when the answer is partly correct.

    Return valid JSON in this exact structure:

    {{
        "score": 7,
        "verdict": "Good",
        "correctness": "Explanation of how correct the answer is",
        "feedback": "Feedback for the candidate",
        "ideal_answer": "A clear and technically correct sample answer",
        "improvement_tips": [
            "First improvement suggestion",
            "Second improvement suggestion"
        ]
    }}
    """

    result = ask_ollama(prompt)

    required_fields = [
        "score",
        "verdict",
        "correctness",
        "feedback",
        "ideal_answer",
        "improvement_tips"
    ]

    if not all(field in result for field in required_fields):
        raise HTTPException(
            status_code=500,
            detail="AI returned incomplete evaluation. Please try again."
        )

    try:
        score = float(result["score"])

        if not 0 <= score <= 10:
            raise ValueError("Score must be between 0 and 10.")

        result["score"] = score

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=500,
            detail="AI returned an invalid evaluation score."
        )

    return {
        "success": True,
        "evaluation": result
    }
