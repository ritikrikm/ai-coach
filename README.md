# RoleSim : Job-Aware Multi-Agent Interview System

A production-grade **Generative-AI mock-interview platform** built with **Next.js + Supabase + OpenAI**.  
RoleSim automatically generates interview questions from real-world job descriptions, evaluates your answers, and provides tutor-style feedback.

---

## Tech Stack

```json
{
  "frontend": "Next.js 13 App Router + TailwindCSS",
  "backend":  "Next.js API routes (Node runtime)",
  "database": "Supabase (PostgreSQL + pgvector)",
  "llm":      "OpenAI GPT-4o for interviewer, evaluator & tutor agents",
  "vector":   "pgvector for semantic similarity search",
  "hosting":  "Vercel (frontend + API) & Supabase (DB + vector store)"
}

HighLevelArch:
{
  "client": {
    "landing_page": "Upload Job Description (JD) and select role",
    "session_page": "Interactive interview UI with live question streaming, answer input and feedback display"
  },
  "server": {
    "api/competency": "Parses JD -> builds competency graph (skills & subskills)",
    "api/ingest":     "Google Custom Search -> embed titles/snippets -> store in docs table",
    "api/ask": {
      "next-question": "RAG: embed topicHint -> vector search docs -> interviewer LLM streams next question + citations",
      "evaluate":      "Evaluator LLM grades answer -> stores score -> Tutor LLM returns micro-lessons"
    },
    "api/turns":      "Create a new 'turn' (one question/answer pair) and return turnId for evaluation"
  },
  "database": {
    "sessions": "One row per mock-interview session",
    "turns":    "One row per question/answer turn, linked to sessions",
    "scores":   "Evaluator’s rubric per turn",
    "docs":     "Embedded source material for retrieval (RAG)"
  }
}

EndToEndFlow

{
  "1. Job Description Analysis": {
    "step": "User pastes JD on landing page",
    "api":  "POST /api/competency",
    "result": "Competency graph of skills & subskills"
  },
  "2. Question Bank Ingestion (admin)": {
    "step": "Admin runs a search query",
    "api":  "POST /api/ingest",
    "result": "Relevant docs embedded and saved in 'docs' table"
  },
  "3. Start Interview Session": {
    "step": "User clicks Start Interview",
    "api":  "POST /api/sessions",
    "result": "New session id returned"
  },
  "4. Ask Next Question": {
    "step": "Session page requests next question",
    "api":  "POST /api/ask {action:'next-question'}",
    "process": [
      "Embed topicHint",
      "Vector search docs in pgvector",
      "Interviewer LLM streams question text (SSE)",
      "Response header contains citations"
    ],
    "after_stream": "POST /api/turns to create a new turn and receive turnId"
  },
  "5. User Answers": {
    "step": "User types answer and submits",
    "api":  "POST /api/ask {action:'evaluate', turnId}",
    "process": [
      "Evaluator LLM scores correctness, clarity, tradeoffs",
      "Score stored in 'scores' table",
      "Tutor LLM generates micro-lessons for weak subskills"
    ],
    "result": "Scores and tutor feedback shown to user"
  },
  "6. Loop": "User clicks 'Next Question' and steps 4–5 repeat for each turn"
}

Key Concepts
RAG (Retrieval-Augmented Generation) :  ensures questions are grounded in real job-related material.
Multi-Agent Design : three LLM agents:
Interviewer : asks questions
Evaluator : grades answers
Tutor :  provides personalised learning resources
Competency Graph :  guides question coverage to all critical skills in the JD.
```
