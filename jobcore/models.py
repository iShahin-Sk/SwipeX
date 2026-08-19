from django.db import models
from django.conf import settings


# ===========================================
# COMPANY
# ===========================================

class Company(models.Model):

    name = models.CharField(max_length=200)

    description = models.TextField()

    website = models.URLField(
        blank=True
    )

    location = models.CharField(
        max_length=100
    )

    logo = models.URLField(
        blank=True
    )

    is_startup = models.BooleanField(
        default=False
    )

    def __str__(self):
        return self.name


# ===========================================
# JOB
# ===========================================

class Job(models.Model):

    JOB_TYPES = [
        ("Full-Time", "Full-Time"),
        ("Part-Time", "Part-Time"),
        ("Internship", "Internship"),
        ("Remote", "Remote"),
    ]

    recruiter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posted_jobs"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="jobs"
    )

    title = models.CharField(
        max_length=200
    )

    description = models.TextField()

    location = models.CharField(
        max_length=100
    )

    salary = models.CharField(
        max_length=50
    )

    experience = models.CharField(
        max_length=50
    )

    skills = models.CharField(
        max_length=255
    )

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPES
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title


# ===========================================
# SWIPE ACTION
# ===========================================

class SwipeAction(models.Model):

    ACTIONS = [
        ("LIKE", "Like"),
        ("DISLIKE", "Dislike"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE
    )

    action = models.CharField(
        max_length=10,
        choices=ACTIONS
    )

    swiped_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "user",
            "job"
        )

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.job} - "
            f"{self.action}"
        )


# ===========================================
# JOB APPLICATION
# ===========================================

class Application(models.Model):

    STATUS_CHOICES = [
        ("Applied", "Applied"),
        ("Shortlisted", "Shortlisted"),
        ("Interview", "Interview"),
        ("Rejected", "Rejected"),
        ("Selected", "Selected"),
    ]

    applicant = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Applied"
    )

    applied_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = (
            "applicant",
            "job"
        )

        ordering = [
            "-applied_at"
        ]

    def __str__(self):
        return (
            f"{self.applicant} "
            f"applied for "
            f"{self.job.title}"
        )


# ===========================================
# AI ATS ANALYSIS CACHE
# ===========================================

class AIAnalysis(models.Model):

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="ai_analyses"
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="ai_analyses"
    )

    resume = models.ForeignKey(
        "users.Profile",
        on_delete=models.CASCADE,
        related_name="ai_analyses"
    )

    # AI-generated score
    ai_score = models.PositiveIntegerField(
        default=0
    )

    # ===========================================
    # BASIC ATS METRICS
    # ===========================================

    skill_match = models.FloatField(
        default=0
    )

    keyword_match = models.FloatField(
        default=0
    )

    resume_completeness = models.FloatField(
        default=0
    )

    summary = models.TextField(
        blank=True
    )

    strengths = models.JSONField(
        default=list,
        blank=True
    )

    missing_skills = models.JSONField(
        default=list,
        blank=True
    )

    suggestions = models.JSONField(
        default=list,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        unique_together = (
            "user",
            "job",
            "resume"
        )

    def __str__(self):
        return (
            f"AI Analysis - "
            f"{self.user} - "
            f"{self.job.title}"
        )


# ===========================================
# NOTIFICATIONS
# ===========================================

class Notification(models.Model):

    NOTIFICATION_TYPES = [

        (
            "INSTANT_JOB",
            "Instant Job Notification"
        ),

        (
            "STARTUP_HIRING",
            "Startup Hiring Alert"
        ),

        (
            "PERSONALIZED",
            "Personalized Recommendation Alert"
        ),

        (
            "HIGH_MATCH",
            "High Match Opportunity"
        ),

        (
            "LOW_COMPETITION",
            "Low Competition Opportunity"
        ),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    notification_type = models.CharField(
        max_length=30,
        choices=NOTIFICATION_TYPES
    )

    title = models.CharField(
        max_length=255
    )

    message = models.TextField()

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="notifications",
        null=True,
        blank=True
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def __str__(self):
        return (
            f"{self.user} - "
            f"{self.notification_type} - "
            f"{self.title}"
        )