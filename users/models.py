from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):

    class Role(models.TextChoices):
        JOB_SEEKER = "job_seeker", "Job Seeker"
        RECRUITER = "recruiter", "Recruiter"
        ADMIN = "admin", "Admin"

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.JOB_SEEKER
    )

    email = models.EmailField(unique=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class Profile(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile"
    )

    full_name = models.CharField(
        max_length=150,
        blank=True
    )

    headline = models.CharField(
        max_length=255,
        blank=True
    )

    location = models.CharField(
        max_length=150,
        blank=True
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    skills = models.JSONField(
        default=list,
        blank=True
    )

    # ======================================
    # Resume Upload
    # ======================================

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True
    )

    # ======================================
    # Resume Parsing
    # ======================================

    resume_text = models.TextField(
        blank=True,
        default=""
    )

    def __str__(self):
        return self.user.username