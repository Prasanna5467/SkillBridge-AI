# SkillBridge AI – Personalized AI Career Mentor

## About the Project
SkillBridge AI is an AI-powered career guidance platform designed to help students prepare for IT placements. It analyzes a user's skills, career goals, and experience level to provide personalized career guidance.

## Key Features
- **User Authentication:** Secure registration and login using JWT and bcrypt.
- **User Profile:** Manage education, skills, career goals, and experience level.
- **AI Career Roadmap:** Generate personalized learning roadmaps.
- **AI Career Mentor:** Ask career-related questions and receive AI-powered guidance.
- **Interview Preparation:** Generate interview questions and evaluate answers using AI.
- **Skill Gap Analyzer:** Identify missing skills for a target job role and suggest improvements.
- **Learning Progress Tracker:** Add learning tasks and track completion.
- **Dark/Light Mode:** Switch between themes.

## Technology Stack

**Frontend**
- React.js
- Vite
- Tailwind CSS

**Backend**
- Node.js
- Express.js
- MongoDB Atlas

**AI Service**
- Python
- FastAPI
- Ollama
- Llama 3.2 (3B)

**Authentication**
- JSON Web Token (JWT)
- bcrypt

## System Architecture

React Frontend → Node.js / Express Backend → MongoDB Atlas

Node.js Backend → Python / FastAPI AI Service → Ollama / Llama 3.2

## Project Structure

```text
SkillBridge-AI/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── services/
│       └── App.jsx
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
│
└── ai-service/
    ├── routes/
    └── main.py
```

## How to Run the Project

### 1. Start the AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Ensure Ollama is installed and the model is available:

```bash
ollama pull llama3.2:3b
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

Configure the required environment variables in `.env`.

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Project Objective
To provide students with a centralized AI-powered platform for career planning, skill improvement, and IT placement preparation.

## Future Scope
- Resume analysis and improvement suggestions
- Job recommendation system
- Integration with external job platforms
- Learning analytics and personalized recommendations

## Developer
Developed as an individual academic and placement-focused project.