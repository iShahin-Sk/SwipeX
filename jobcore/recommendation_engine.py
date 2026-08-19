from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# SKILL NORMALIZATION
# ============================================================

SKILL_ALIASES = {
    "ml": "machine learning",
    "machine-learning": "machine learning",

    "ai": "artificial intelligence",
    "artificial-intelligence": "artificial intelligence",

    "js": "javascript",
    "javascript.js": "javascript",

    "ts": "typescript",

    "reactjs": "react",
    "react.js": "react",

    "nodejs": "node",
    "node.js": "node",

    "postgres": "postgresql",
    "postgres db": "postgresql",

    "restful api": "rest api",
    "restful apis": "rest api",
    "rest apis": "rest api",

    "django framework": "django",

    "spring framework": "spring",
    "springboot": "spring boot",

    "k8s": "kubernetes",

    "amazon web services": "aws",
    "aws cloud": "aws",

    "google cloud platform": "gcp",

    "microsoft azure": "azure",

    "sklearn": "scikit learn",
    "scikit-learn": "scikit learn",
}


def normalize_skill(skill):
    """
    Convert common skill variations/aliases
    into a standard skill name.
    """

    skill = str(skill).strip().lower()

    return SKILL_ALIASES.get(
        skill,
        skill
    )


# ============================================================
# BUILD JOB TEXT
# ============================================================

def build_job_text(job):
    return f"""
    {job.title}
    {job.description}
    {job.skills}
    {job.experience}
    {job.location}
    {job.job_type}
    """


# ============================================================
# TF-IDF + COSINE SIMILARITY
# ============================================================

def calculate_semantic_score(
    resume_text,
    job
):
    """
    Calculate similarity between the user's
    resume and the job using:

    TF-IDF + Cosine Similarity
    """

    if (
        not resume_text
        or not resume_text.strip()
    ):
        return 0.0

    job_text = build_job_text(job)

    vectorizer = TfidfVectorizer(
        stop_words="english"
    )

    vectors = vectorizer.fit_transform([
        resume_text,
        job_text
    ])

    similarity = cosine_similarity(
        vectors[0:1],
        vectors[1:2]
    )[0][0]

    return float(similarity)


# ============================================================
# SKILL MATCH SCORE
# ============================================================

def calculate_skill_score(
    user_skills,
    job_skills
):
    """
    Compare normalized user skills
    with normalized job skills.

    Profile.skills:
        JSON list

    Job.skills:
        comma-separated string
    """

    if (
        not user_skills
        or not job_skills
    ):
        return 0.0

    # -----------------------------------------
    # Normalize USER skills
    # -----------------------------------------

    user_skill_set = {
        normalize_skill(skill)
        for skill in user_skills
        if str(skill).strip()
    }

    # -----------------------------------------
    # Normalize JOB skills
    # -----------------------------------------

    job_skill_set = {
        normalize_skill(skill)
        for skill in job_skills.split(",")
        if skill.strip()
    }

    if not job_skill_set:
        return 0.0

    # -----------------------------------------
    # Find matching skills
    # -----------------------------------------

    matched_skills = (
        user_skill_set.intersection(
            job_skill_set
        )
    )

    return (
        len(matched_skills)
        / len(job_skill_set)
    )


# ============================================================
# EXPERIENCE SCORE
# ============================================================

def calculate_experience_score(
    user_experience_years,
    job_experience
):
    """
    Compare user's experience_years
    with the job's experience requirement.
    """

    if not job_experience:
        return 0.5

    user_years = (
        user_experience_years
        or 0
    )

    import re

    numbers = re.findall(
        r"\d+",
        job_experience
    )

    # -----------------------------------------
    # Example: 0-2 years
    # -----------------------------------------

    if len(numbers) >= 2:

        minimum = int(numbers[0])
        maximum = int(numbers[1])

        if (
            minimum
            <= user_years
            <= maximum
        ):
            return 1.0

        if user_years < minimum:
            return 0.3

        return 0.7

    # -----------------------------------------
    # Example: 2 years
    # -----------------------------------------

    if len(numbers) == 1:

        required = int(numbers[0])

        if user_years >= required:
            return 1.0

        return 0.3

    # -----------------------------------------
    # Example: Fresher
    # -----------------------------------------

    if (
        "fresher"
        in job_experience.lower()
    ):

        if user_years == 0:
            return 1.0

        return 0.7

    return 0.5


# ============================================================
# SWIPE SCORE
# ============================================================

def calculate_swipe_score(
    job_id,
    swipe_history
):
    """
    Give a personalization score based
    on the user's previous swipe behavior.
    """

    action = swipe_history.get(
        job_id
    )

    if action == "LIKE":
        return 1.0

    if action == "DISLIKE":
        return 0.0

    return 0.5


# ============================================================
# FINAL RECOMMENDATION SCORE
# ============================================================

def calculate_final_score(
    semantic_score,
    skill_score,
    experience_score,
    swipe_score
):
    """
    Combine all recommendation signals.

    Resume similarity = 60%
    Skill match       = 25%
    Experience match  = 10%
    Swipe behavior    = 5%
    """

    final_score = (
        semantic_score * 0.60
        + skill_score * 0.25
        + experience_score * 0.10
        + swipe_score * 0.05
    )

    return round(
        final_score * 100,
        2
    )


# ============================================================
# RECOMMEND JOBS FOR USER
# ============================================================

def recommend_jobs_for_user(user):
    """
    Generate personalized job recommendations
    for one Django user.
    """

    from .models import (
        Job,
        SwipeAction
    )

    # -----------------------------------------
    # Get user profile safely
    # -----------------------------------------

    try:

        profile = user.profile

    except Exception:

        return []

    # -----------------------------------------
    # Get profile information
    # -----------------------------------------

    resume_text = (
        profile.resume_text
        or ""
    )

    user_skills = (
        profile.skills
        or []
    )

    user_experience = (
        profile.experience_years
        or 0
    )

    # -----------------------------------------
    # Get user's swipe history
    # -----------------------------------------

    swipe_history = {
        swipe.job_id: swipe.action
        for swipe in SwipeAction.objects.filter(
            user=user
        )
    }

    # -----------------------------------------
    # Get available jobs
    # -----------------------------------------

    jobs = Job.objects.all()

    recommendations = []

    # -----------------------------------------
    # Process every job
    # -----------------------------------------

    for job in jobs:

        # -------------------------------------
        # Do not recommend disliked jobs
        # -------------------------------------

        if (
            swipe_history.get(job.id)
            == "DISLIKE"
        ):
            continue

        # -------------------------------------
        # Resume similarity
        # -------------------------------------

        semantic_score = (
            calculate_semantic_score(
                resume_text,
                job
            )
        )

        # -------------------------------------
        # Skill matching
        # -------------------------------------

        skill_score = (
            calculate_skill_score(
                user_skills,
                job.skills
            )
        )

        # -------------------------------------
        # Experience matching
        # -------------------------------------

        experience_score = (
            calculate_experience_score(
                user_experience,
                job.experience
            )
        )

        # -------------------------------------
        # Swipe behavior
        # -------------------------------------

        swipe_score = (
            calculate_swipe_score(
                job.id,
                swipe_history
            )
        )

        # -------------------------------------
        # Final score
        # -------------------------------------

        final_score = (
            calculate_final_score(
                semantic_score,
                skill_score,
                experience_score,
                swipe_score
            )
        )

        # -------------------------------------
        # Store recommendation
        # -------------------------------------

        recommendations.append({

            "job_id": job.id,

            "title": job.title,

            "company": job.company.name,

            "location": job.location,

            "job_type": job.job_type,

            "match_percentage": final_score,

            "semantic_score": round(
                semantic_score * 100,
                2
            ),

            "skill_score": round(
                skill_score * 100,
                2
            ),

            "experience_score": round(
                experience_score * 100,
                2
            ),
        })


    # Highest match first
    

    recommendations.sort(
        key=lambda x: x[
            "match_percentage"
        ],
        reverse=True
    )

    return recommendations