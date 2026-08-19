import json
import os

from dotenv import load_dotenv
from google import genai


# ===================================================
# Load .env
# ===================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

ENV_PATH = os.path.join(
    BASE_DIR,
    ".env"
)

load_dotenv(
    ENV_PATH,
    override=True
)


# ===================================================
# Gemini AI Resume Analysis
# ===================================================

def analyze_resume_with_ai(resume_text, job):
    """
    Analyze resume compatibility with a specific job.

    Returns:
        {
            "success": True/False,
            "ai_score": int,
            "summary": str,
            "strengths": list,
            "missing_skills": list,
            "suggestions": list,
        }
    """

    # -----------------------------------------------
    # Check resume
    # -----------------------------------------------

    if not resume_text:
        return {
            "success": False,
            "ai_score": 0,
            "summary": "No resume text available.",
            "strengths": [],
            "missing_skills": [],
            "suggestions": [],
        }

    # -----------------------------------------------
    # Get API key
    # -----------------------------------------------

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {
            "success": False,
            "ai_score": 0,
            "summary": "Gemini API key is not configured.",
            "strengths": [],
            "missing_skills": [],
            "suggestions": [],
        }

    # -----------------------------------------------
    # Limit text to reduce token usage
    # -----------------------------------------------

    resume_text = resume_text[:12000]
    job_description = (job.description or "")[:6000]
    job_skills = (job.skills or "")[:2000]

    # -----------------------------------------------
    # Create Gemini client
    # -----------------------------------------------

    client = genai.Client(
        api_key=api_key
    )

    # -----------------------------------------------
    # Compact AI prompt
    # -----------------------------------------------

    prompt = f"""
You are SwipeX, an AI career assistant.

Compare this candidate resume with this job.

JOB TITLE:
{job.title}

JOB DESCRIPTION:
{job_description}

REQUIRED SKILLS:
{job_skills}

RESUME:
{resume_text}

Use only evidence present in the resume.
Do not invent skills, experience, education, or achievements.

Return ONLY valid JSON:

{{
  "ai_score": 0,
  "summary": "short compatibility explanation",
  "strengths": ["strength 1", "strength 2"],
  "missing_skills": ["skill 1", "skill 2"],
  "suggestions": ["suggestion 1", "suggestion 2"]
}}

Rules:
- ai_score must be an integer from 0 to 100.
- Score based on resume-job compatibility.
- Strengths must be supported by the resume.
- Missing skills should come from the job requirements.
- Keep everything concise.
"""

    # -----------------------------------------------
    # Call Gemini
    # -----------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt,
            config={
                "response_mime_type": "application/json",
            },
        )

        result = json.loads(
            response.text
        )

        return {
            "success": True,
            "ai_score": int(
                result.get("ai_score", 0)
            ),
            "summary": result.get(
                "summary",
                ""
            ),
            "strengths": result.get(
                "strengths",
                []
            ),
            "missing_skills": result.get(
                "missing_skills",
                []
            ),
            "suggestions": result.get(
                "suggestions",
                []
            ),
        }

    except Exception as e:

        print(
            "Gemini AI error:",
            e
        )

        # IMPORTANT:
        # Failed Gemini requests are NOT
        # considered valid AI results.

        return {
            "success": False,
            "ai_score": 0,
            "summary": "AI analysis is temporarily unavailable.",
            "strengths": [],
            "missing_skills": [],
            "suggestions": [],
        }