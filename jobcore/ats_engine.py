import re


def normalize_text(text):
    """
    Convert text into lowercase words.
    """

    if not text:
        return set()

    text = text.lower()

    words = re.findall(r"[a-zA-Z0-9+#.]+", text)

    return set(words)


def extract_skills(skill_text):
    """
    Convert a job's comma-separated skills
    into a clean set.
    """

    if not skill_text:
        return set()

    skills = skill_text.lower().split(",")

    return {
        skill.strip()
        for skill in skills
        if skill.strip()
    }


def calculate_skill_match(resume_text, job_skills):
    """
    Calculate percentage of required job skills
    found in the resume.
    """

    required_skills = extract_skills(job_skills)

    if not required_skills:
        return 0, [], []

    resume_words = normalize_text(resume_text)

    matched = []
    missing = []

    for skill in required_skills:

        skill_words = normalize_text(skill)

        if skill_words.issubset(resume_words):
            matched.append(skill)
        else:
            missing.append(skill)

    score = (
        len(matched) / len(required_skills)
    ) * 100

    return round(score, 2), matched, missing


def calculate_keyword_match(resume_text, job_description):
    """
    Compare important words in the job description
    with the resume.
    """

    resume_words = normalize_text(resume_text)
    job_words = normalize_text(job_description)

    if not job_words:
        return 0

    matched_words = resume_words.intersection(job_words)

    score = (
        len(matched_words) / len(job_words)
    ) * 100

    return round(min(score, 100), 2)


def calculate_resume_completeness(resume_text):
    """
    Basic resume completeness score.
    """

    if not resume_text:
        return 0

    score = 0

    text_lower = resume_text.lower()

    # Contact information
    if "@" in text_lower:
        score += 20

    # Education
    education_keywords = [
        "education",
        "degree",
        "b.tech",
        "bachelor",
        "master",
        "university",
        "college",
    ]

    if any(
        keyword in text_lower
        for keyword in education_keywords
    ):
        score += 20

    # Experience
    experience_keywords = [
        "experience",
        "internship",
        "intern",
        "worked",
        "developer",
        "engineer",
    ]

    if any(
        keyword in text_lower
        for keyword in experience_keywords
    ):
        score += 20

    # Projects
    if "project" in text_lower or "projects" in text_lower:
        score += 20

    # Skills
    if "skills" in text_lower:
        score += 20

    return score


def calculate_ats_score(resume_text, job):
    """
    Calculate the overall ATS score for a resume
    against a specific job.
    """

    if not resume_text:
        return {
            "ats_score": 0,
            "skill_match": 0,
            "keyword_match": 0,
            "resume_completeness": 0,
            "matched_skills": [],
            "missing_skills": [],
        }

    skill_score, matched_skills, missing_skills = (
        calculate_skill_match(
            resume_text,
            job.skills
        )
    )

    keyword_score = calculate_keyword_match(
        resume_text,
        job.description
    )

    completeness_score = calculate_resume_completeness(
        resume_text
    )

    # Weighted ATS score
    ats_score = (
        (skill_score * 0.50)
        + (keyword_score * 0.30)
        + (completeness_score * 0.20)
    )

    return {
        "ats_score": round(ats_score, 2),
        "skill_match": skill_score,
        "keyword_match": keyword_score,
        "resume_completeness": completeness_score,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
    }