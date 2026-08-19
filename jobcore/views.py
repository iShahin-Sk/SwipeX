from datetime import timedelta

from django.utils import timezone
from django.db.models import Count

from rest_framework import (
    generics,
    filters,
    status,
)

from django_filters.rest_framework import (
    DjangoFilterBackend
)

from rest_framework.permissions import (
    IsAuthenticated
)

from rest_framework.response import (
    Response
)

from users.models import Profile

from .models import (
    Company,
    Job,
    SwipeAction,
    Application,
    AIAnalysis,
    Notification,
)

from .serializers import (
    CompanySerializer,
    JobSerializer,
    SwipeActionSerializer,
    ApplicationSerializer,
    NotificationSerializer,
)

from .permissions import IsRecruiter

from .ats_engine import (
    calculate_ats_score
)

from .ai_service import (
    analyze_resume_with_ai
)

from .recommendation_engine import (
    recommend_jobs_for_user
)


from collections import Counter
from django.db.models.functions import TruncMonth

# ============================================================
# COMPANY APIs
# ============================================================

class CompanyListAPIView(
    generics.ListAPIView
):

    queryset = Company.objects.all()

    serializer_class = CompanySerializer


# ============================================================
# JOB LIST API
# ============================================================

class JobListAPIView(
    generics.ListAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated
    ]

    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]

    filterset_fields = [
        "location",
        "job_type",
        "experience",
        "company",
    ]

    search_fields = [
        "title",
        "description",
        "skills",
        "company__name",
    ]

    ordering_fields = [
        "created_at",
        "salary",
    ]

    def get_queryset(self):

        disliked_jobs = (
            SwipeAction.objects
            .filter(
                user=self.request.user,
                action="DISLIKE"
            )
            .values_list(
                "job_id",
                flat=True
            )
        )

        return (
            Job.objects
            .exclude(
                id__in=disliked_jobs
            )
            .select_related(
                "company"
            )
        )


# ============================================================
# JOB DETAIL API
# ============================================================

class JobDetailAPIView(
    generics.RetrieveAPIView
):

    queryset = Job.objects.all()

    serializer_class = JobSerializer


# ============================================================
# SWIPE API
# ============================================================

class SwipeAPIView(
    generics.CreateAPIView
):

    serializer_class = SwipeActionSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request
    ):

        job_id = request.data.get(
            "job"
        )

        action = str(
            request.data.get(
                "action",
                ""
            )
        ).upper()

        if not job_id or not action:

            return Response(
                {
                    "error":
                    "Job and Action required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if action not in [
            "LIKE",
            "DISLIKE"
        ]:

            return Response(
                {
                    "error":
                    "Invalid action"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error":
                    "Job not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # SAVE / UPDATE SWIPE
        # ----------------------------------------------------

        swipe, created = (
            SwipeAction.objects.update_or_create(
                user=request.user,
                job=job,
                defaults={
                    "action": action
                }
            )
        )

        # ----------------------------------------------------
        # LIKE
        # Swipe Right:
        # Save job + Apply
        # ----------------------------------------------------

        application_created = False

        if action == "LIKE":

            application, application_created = (
                Application.objects.get_or_create(
                    applicant=request.user,
                    job=job
                )
            )

        # ----------------------------------------------------
        # DISLIKE
        # ----------------------------------------------------

        elif action == "DISLIKE":

            # If the user previously applied and
            # then dislikes the job, we do not delete
            # the application.
            #
            # The dislike only controls job discovery.
            pass

        return Response(
            {
                "message":
                "Swipe Saved",

                "action":
                swipe.action,

                "job":
                swipe.job.id,

                "application_created":
                application_created,

                "applied":
                Application.objects.filter(
                    applicant=request.user,
                    job=job
                ).exists(),
            },
            status=status.HTTP_201_CREATED
        )


# ============================================================
# SAVED JOBS
# ============================================================

class SavedJobsAPIView(
    generics.ListAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        liked_jobs = (
            SwipeAction.objects
            .filter(
                user=self.request.user,
                action="LIKE"
            )
            .values_list(
                "job_id",
                flat=True
            )
        )

        return (
            Job.objects
            .filter(
                id__in=liked_jobs
            )
            .select_related(
                "company"
            )
            .order_by(
                "-created_at"
            )
        )


# ============================================================
# PERSONALIZED JOB RECOMMENDATIONS
# ============================================================

class RecommendedJobsAPIView(
    generics.ListAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        # ----------------------------------------------------
        # CHECK PROFILE
        # ----------------------------------------------------

        try:

            Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error":
                    "Profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # GET RECOMMENDATIONS
        # ----------------------------------------------------

        try:

            recommendations = (
                recommend_jobs_for_user(
                    request.user
                )
            )

        except Exception as error:

            print(
                "Recommendation engine error:",
                error
            )

            recommendations = []

        # ----------------------------------------------------
        # NORMALIZE RESPONSE
        # ----------------------------------------------------

        if recommendations is None:

            recommendations = []

        return Response(
            recommendations,
            status=status.HTTP_200_OK
        )


# ============================================================
# APPLY FOR JOB
# ============================================================

class ApplyJobAPIView(
    generics.CreateAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request
    ):

        job_id = request.data.get(
            "job"
        )

        if not job_id:

            return Response(
                {
                    "error":
                    "Job ID is required"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error":
                    "Job not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK EXISTING APPLICATION
        # ----------------------------------------------------

        if Application.objects.filter(
            applicant=request.user,
            job=job
        ).exists():

            return Response(
                {
                    "message":
                    "Already Applied"
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CREATE APPLICATION
        # ----------------------------------------------------

        application = Application.objects.create(
            applicant=request.user,
            job=job
        )

        serializer = ApplicationSerializer(
            application
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


# ============================================================
# MY APPLICATIONS
# ============================================================

class MyApplicationsAPIView(
    generics.ListAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            Application.objects
            .filter(
                applicant=self.request.user
            )
            .select_related(
                "job",
                "job__company"
            )
            .order_by(
                "-applied_at"
            )
        )


# ============================================================
# ATS + AI RESUME-JOB COMPATIBILITY
# ============================================================

class ATSScoreAPIView(
    generics.RetrieveAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def retrieve(
        self,
        request,
        *args,
        **kwargs
    ):

        job_id = kwargs.get(
            "pk"
        )

        # ----------------------------------------------------
        # GET JOB
        # ----------------------------------------------------

        try:

            job = Job.objects.get(
                id=job_id
            )

        except Job.DoesNotExist:

            return Response(
                {
                    "error":
                    "Job not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # GET PROFILE
        # ----------------------------------------------------

        try:

            profile = Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error":
                    "Profile not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK RESUME
        # ----------------------------------------------------

        if not profile.resume_text:

            return Response(
                {
                    "error":
                    "Please upload your resume first."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # BASIC ATS ANALYSIS
        # ----------------------------------------------------

        result = calculate_ats_score(
            profile.resume_text,
            job
        )

        # ----------------------------------------------------
        # CHECK AI CACHE
        # ----------------------------------------------------

        cached_analysis = (
            AIAnalysis.objects
            .filter(
                user=request.user,
                job=job,
                resume=profile
            )
            .first()
        )

        # ----------------------------------------------------
        # CACHED AI ANALYSIS
        # ----------------------------------------------------

        if cached_analysis:

            cached_analysis.skill_match = (
                result.get(
                    "skill_match",
                    0
                )
            )

            cached_analysis.keyword_match = (
                result.get(
                    "keyword_match",
                    0
                )
            )

            cached_analysis.resume_completeness = (
                result.get(
                    "resume_completeness",
                    0
                )
            )

            cached_analysis.save(
                update_fields=[
                    "skill_match",
                    "keyword_match",
                    "resume_completeness",
                    "updated_at",
                ]
            )

            ai_result = {

                "ai_score":
                cached_analysis.ai_score,

                "summary":
                cached_analysis.summary,

                "strengths":
                cached_analysis.strengths,

                "missing_skills":
                cached_analysis.missing_skills,

                "suggestions":
                cached_analysis.suggestions,
            }

            print(
                "Using cached AI analysis:",
                request.user.username,
                "-",
                job.title
            )

        # ----------------------------------------------------
        # NEW AI ANALYSIS
        # ----------------------------------------------------

        else:

            print(
                "Generating new Gemini analysis:",
                request.user.username,
                "-",
                job.title
            )

            ai_result = (
                analyze_resume_with_ai(
                    profile.resume_text,
                    job
                )
            )

            # ------------------------------------------------
            # SAVE AI RESULT
            # ------------------------------------------------

            if ai_result.get(
                "success"
            ):

                AIAnalysis.objects.create(

                    user=request.user,

                    job=job,

                    resume=profile,

                    ai_score=ai_result.get(
                        "ai_score",
                        0
                    ),

                    skill_match=result.get(
                        "skill_match",
                        0
                    ),

                    keyword_match=result.get(
                        "keyword_match",
                        0
                    ),

                    resume_completeness=result.get(
                        "resume_completeness",
                        0
                    ),

                    summary=ai_result.get(
                        "summary",
                        ""
                    ),

                    strengths=ai_result.get(
                        "strengths",
                        []
                    ),

                    missing_skills=ai_result.get(
                        "missing_skills",
                        []
                    ),

                    suggestions=ai_result.get(
                        "suggestions",
                        []
                    ),
                )

                print(
                    "AI analysis cached successfully:",
                    request.user.username,
                    "-",
                    job.title
                )

            else:

                print(
                    "AI analysis failed - "
                    "result was NOT cached."
                )

        # ----------------------------------------------------
        # ADD AI RESULT
        # ----------------------------------------------------

        result["ai_analysis"] = {

            "ai_score":
            ai_result.get(
                "ai_score",
                0
            ),

            "summary":
            ai_result.get(
                "summary",
                ""
            ),

            "strengths":
            ai_result.get(
                "strengths",
                []
            ),

            "missing_skills":
            ai_result.get(
                "missing_skills",
                []
            ),

            "suggestions":
            ai_result.get(
                "suggestions",
                []
            ),
        }

        # ----------------------------------------------------
        # RETURN
        # ----------------------------------------------------

        return Response(
            {
                "job_id":
                job.id,

                "job_title":
                job.title,

                **result
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# RESUME SUITABLE JOBS
# ============================================================

class ResumeSuitableJobsAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        # ----------------------------------------------------
        # GET PROFILE
        # ----------------------------------------------------

        try:

            profile = Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "has_resume": False,

                    "total_jobs": 0,

                    "suitable_jobs": 0,

                    "suitable_percentage": 0,

                    "threshold": 60,

                    "jobs": [],

                    "message":
                    "Profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK RESUME
        # ----------------------------------------------------

        if not profile.resume_text:

            return Response(
                {
                    "has_resume": False,

                    "total_jobs": 0,

                    "suitable_jobs": 0,

                    "suitable_percentage": 0,

                    "threshold": 60,

                    "jobs": [],

                    "message":
                    "Please upload your resume first."
                },
                status=status.HTTP_200_OK
            )

        # ----------------------------------------------------
        # GET JOBS
        # ----------------------------------------------------

        jobs = (
            Job.objects
            .all()
            .select_related(
                "company"
            )
        )

        total_jobs = jobs.count()

        threshold = 60

        suitable_jobs_list = []

        # ----------------------------------------------------
        # CALCULATE ATS FOR EVERY JOB
        # ----------------------------------------------------

        for job in jobs:

            try:

                result = calculate_ats_score(
                    profile.resume_text,
                    job
                )

                ats_score = float(
                    result.get(
                        "ats_score",
                        0
                    )
                )

                if ats_score >= threshold:

                    suitable_jobs_list.append(
                        {
                            "id":
                            job.id,

                            "title":
                            job.title,

                            "description":
                            job.description,

                            "location":
                            job.location,

                            "salary":
                            job.salary,

                            "experience":
                            job.experience,

                            "skills":
                            job.skills,

                            "job_type":
                            job.job_type,

                            "ats_score":
                            round(
                                ats_score,
                                2
                            ),

                            "company":
                            (
                                job.company.name
                                if job.company
                                else ""
                            ),
                        }
                    )

            except Exception as error:

                print(
                    "Suitable-job ATS calculation "
                    f"failed for job {job.id}:",
                    error
                )

                continue

        # ----------------------------------------------------
        # SORT
        # ----------------------------------------------------

        suitable_jobs_list.sort(
            key=lambda job:
            job["ats_score"],
            reverse=True
        )

        suitable_jobs_count = len(
            suitable_jobs_list
        )

        # ----------------------------------------------------
        # PERCENTAGE
        # ----------------------------------------------------

        suitable_percentage = 0

        if total_jobs > 0:

            suitable_percentage = round(
                (
                    suitable_jobs_count /
                    total_jobs
                ) * 100,
                2
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "has_resume":
                True,

                "total_jobs":
                total_jobs,

                "suitable_jobs":
                suitable_jobs_count,

                "suitable_percentage":
                suitable_percentage,

                "threshold":
                threshold,

                "jobs":
                suitable_jobs_list,

                "message":
                "Resume suitable-job analytics "
                "loaded successfully."
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# RESUME PERFORMANCE ANALYTICS
# ============================================================

class ResumeAnalyticsAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        # ----------------------------------------------------
        # GET PROFILE
        # ----------------------------------------------------

        try:

            profile = Profile.objects.get(
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "has_resume":
                    False,

                    "analyses_count":
                    0,

                    "ats_score":
                    0,

                    "skill_match":
                    0,

                    "keyword_match":
                    0,

                    "resume_completeness":
                    0,

                    "matched_skills":
                    [],

                    "missing_skills":
                    [],

                    "message":
                    "Profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # ----------------------------------------------------
        # CHECK RESUME
        # ----------------------------------------------------

        if not profile.resume_text:

            return Response(
                {
                    "has_resume":
                    False,

                    "analyses_count":
                    0,

                    "ats_score":
                    0,

                    "skill_match":
                    0,

                    "keyword_match":
                    0,

                    "resume_completeness":
                    0,

                    "matched_skills":
                    [],

                    "missing_skills":
                    [],

                    "message":
                    "Please upload your resume first."
                },
                status=status.HTTP_200_OK
            )

        # ----------------------------------------------------
        # IMPORTANT:
        #
        # Calculate analytics directly against all jobs.
        #
        # This means the dashboard does NOT need the user
        # to manually open every job's ATS page first.
        # ----------------------------------------------------

        jobs = (
            Job.objects
            .all()
            .select_related(
                "company"
            )
        )

        total_jobs = jobs.count()

        # ----------------------------------------------------
        # RESUME COMPLETENESS
        #
        # This is independent of a particular job.
        # ----------------------------------------------------

        completeness_result = calculate_ats_score(
            profile.resume_text,
            jobs.first()
        ) if total_jobs > 0 else {
            "resume_completeness": 0
        }

        resume_completeness = float(
            completeness_result.get(
                "resume_completeness",
                0
            )
        )

        # ----------------------------------------------------
        # TOTALS
        # ----------------------------------------------------

        total_ats_score = 0

        total_skill_match = 0

        total_keyword_match = 0

        valid_job_count = 0

        matched_skills = []

        missing_skills = []

        # ----------------------------------------------------
        # ANALYZE ALL JOBS
        # ----------------------------------------------------

        for job in jobs:

            try:

                result = calculate_ats_score(
                    profile.resume_text,
                    job
                )

                total_ats_score += float(
                    result.get(
                        "ats_score",
                        0
                    )
                )

                total_skill_match += float(
                    result.get(
                        "skill_match",
                        0
                    )
                )

                total_keyword_match += float(
                    result.get(
                        "keyword_match",
                        0
                    )
                )

                # Use the job result for completeness too,
                # although it should be the same for every job.
                resume_completeness = float(
                    result.get(
                        "resume_completeness",
                        resume_completeness
                    )
                )

                matched_skills.extend(
                    result.get(
                        "matched_skills",
                        []
                    )
                )

                missing_skills.extend(
                    result.get(
                        "missing_skills",
                        []
                    )
                )

                valid_job_count += 1

            except Exception as error:

                print(
                    "Resume analytics calculation "
                    f"failed for job {job.id}:",
                    error
                )

                continue

        # ----------------------------------------------------
        # NO VALID JOBS
        # ----------------------------------------------------

        if valid_job_count == 0:

            return Response(
                {
                    "has_resume":
                    True,

                    "analyses_count":
                    0,

                    "ats_score":
                    0,

                    "skill_match":
                    0,

                    "keyword_match":
                    0,

                    "resume_completeness":
                    resume_completeness,

                    "matched_skills":
                    [],

                    "missing_skills":
                    [],

                    "message":
                    "No jobs available for ATS analysis."
                },
                status=status.HTTP_200_OK
            )

        # ----------------------------------------------------
        # AVERAGES
        # ----------------------------------------------------

        average_ats_score = round(
            total_ats_score /
            valid_job_count,
            2
        )

        average_skill_match = round(
            total_skill_match /
            valid_job_count,
            2
        )

        average_keyword_match = round(
            total_keyword_match /
            valid_job_count,
            2
        )

        # ----------------------------------------------------
        # REMOVE DUPLICATES
        # ----------------------------------------------------

        unique_matched_skills = list(
            dict.fromkeys(
                matched_skills
            )
        )

        unique_missing_skills = list(
            dict.fromkeys(
                missing_skills
            )
        )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "has_resume":
                True,

                "analyses_count":
                valid_job_count,

                "ats_score":
                average_ats_score,

                "skill_match":
                average_skill_match,

                "keyword_match":
                average_keyword_match,

                "resume_completeness":
                resume_completeness,

                "matched_skills":
                unique_matched_skills,

                "missing_skills":
                unique_missing_skills,

                "message":
                "Resume analytics loaded successfully."
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# NOTIFICATION HELPER
# ============================================================

def create_notification(
    user,
    notification_type,
    title,
    message,
    job=None
):

    filters = {
        "user":
        user,

        "notification_type":
        notification_type,

        "title":
        title,

        "message":
        message,
    }

    if job is not None:

        filters["job"] = job

    else:

        filters["job__isnull"] = True

    notification, created = (
        Notification.objects.get_or_create(
            **filters
        )
    )

    return notification, created


# ============================================================
# GENERATE SMART NOTIFICATIONS
# ============================================================

def generate_notifications_for_user(
    user
):

    recent_time = (
        timezone.now()
        - timedelta(hours=24)
    )

    # --------------------------------------------------------
    # RECENT JOBS
    # --------------------------------------------------------

    recent_jobs = (
        Job.objects
        .filter(
            created_at__gte=recent_time
        )
        .select_related(
            "company"
        )
        .order_by(
            "-created_at"
        )[:10]
    )

    # --------------------------------------------------------
    # 1. INSTANT JOB NOTIFICATIONS
    # --------------------------------------------------------

    for job in recent_jobs:

        company_name = (
            job.company.name
            if job.company
            else "a company"
        )

        create_notification(
            user=user,

            notification_type=
            "INSTANT_JOB",

            title=
            "New Job Posted",

            message=(
                f"New {job.title} opportunity "
                f"has been posted by "
                f"{company_name}."
            ),

            job=job
        )

    # --------------------------------------------------------
    # 2. STARTUP HIRING ALERTS
    # --------------------------------------------------------

    startup_jobs = (
        Job.objects
        .filter(
            created_at__gte=recent_time,
            company__is_startup=True
        )
        .select_related(
            "company"
        )
        .order_by(
            "-created_at"
        )[:10]
    )

    for job in startup_jobs:

        company_name = (
            job.company.name
            if job.company
            else "A startup"
        )

        create_notification(
            user=user,

            notification_type=
            "STARTUP_HIRING",

            title=
            "Startup Hiring Alert",

            message=(
                f"{company_name} is hiring "
                f"for {job.title}."
            ),

            job=job
        )

    # --------------------------------------------------------
    # 3 + 4. RECOMMENDATION / HIGH MATCH
    # --------------------------------------------------------

    try:

        recommendations = (
            recommend_jobs_for_user(
                user
            )
        )

    except Exception as error:

        print(
            "Recommendation notification "
            "generation failed:",
            error
        )

        recommendations = []

    if recommendations is None:

        recommendations = []

    for recommendation in recommendations[:10]:

        job_id = recommendation.get(
            "job_id"
        )

        try:

            match_percentage = float(
                recommendation.get(
                    "match_percentage",
                    0
                )
            )

        except (
            TypeError,
            ValueError
        ):

            match_percentage = 0

        if not job_id:
            continue

        try:

            job = (
                Job.objects
                .select_related(
                    "company"
                )
                .get(
                    id=job_id
                )
            )

        except Job.DoesNotExist:

            continue

        company_name = (
            job.company.name
            if job.company
            else "the company"
        )

        # ----------------------------------------------------
        # PERSONALIZED
        # ----------------------------------------------------

        if match_percentage >= 60:

            create_notification(
                user=user,

                notification_type=
                "PERSONALIZED",

                title=
                "Personalized Job Recommendation",

                message=(
                    f"{job.title} at "
                    f"{company_name} matches "
                    f"your profile by "
                    f"{match_percentage}%."
                ),

                job=job
            )

        # ----------------------------------------------------
        # HIGH MATCH
        # ----------------------------------------------------

        if match_percentage >= 80:

            create_notification(
                user=user,

                notification_type=
                "HIGH_MATCH",

                title=
                "High-Match Opportunity",

                message=(
                    f"Great match! "
                    f"{job.title} at "
                    f"{company_name} has a "
                    f"{match_percentage}% match "
                    f"with your profile."
                ),

                job=job
            )

    # --------------------------------------------------------
    # 5. LOW COMPETITION
    # --------------------------------------------------------

    competition_jobs = (
        Job.objects
        .annotate(
            applicant_count=Count(
                "applications"
            )
        )
        .filter(
            applicant_count__lte=5
        )
        .select_related(
            "company"
        )
        .order_by(
            "-created_at"
        )[:10]
    )

    for job in competition_jobs:

        company_name = (
            job.company.name
            if job.company
            else "the company"
        )

        applicant_count = (
            job.applicant_count
        )

        create_notification(
            user=user,

            notification_type=
            "LOW_COMPETITION",

            title=
            "Low-Competition Opportunity",

            message=(
                f"{job.title} at "
                f"{company_name} currently "
                f"has only "
                f"{applicant_count} "
                f"applicant(s)."
            ),

            job=job
        )


# ============================================================
# NOTIFICATION LIST API
# ============================================================

class NotificationListAPIView(
    generics.ListAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(
        self
    ):

        generate_notifications_for_user(
            self.request.user
        )

        return (
            Notification.objects
            .filter(
                user=self.request.user
            )
            .select_related(
                "job",
                "job__company"
            )
            .order_by(
                "-created_at"
            )
        )


# ============================================================
# UNREAD NOTIFICATION COUNT
# ============================================================

class NotificationUnreadCountAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        generate_notifications_for_user(
            request.user
        )

        count = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False
            )
            .count()
        )

        return Response(
            {
                "unread_count":
                count
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# MARK SINGLE NOTIFICATION AS READ
# ============================================================

class NotificationReadAPIView(
    generics.UpdateAPIView
):

    serializer_class = NotificationSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(
        self
    ):

        return Notification.objects.filter(
            user=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        notification = self.get_object()

        notification.is_read = True

        notification.save(
            update_fields=[
                "is_read"
            ]
        )

        return Response(
            NotificationSerializer(
                notification
            ).data,
            status=status.HTTP_200_OK
        )


# ============================================================
# MARK ALL NOTIFICATIONS AS READ
# ============================================================

class NotificationMarkAllReadAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def post(
        self,
        request
    ):

        updated = (
            Notification.objects
            .filter(
                user=request.user,
                is_read=False
            )
            .update(
                is_read=True
            )
        )

        return Response(
            {
                "message":
                "All notifications marked as read",

                "updated_count":
                updated
            },
            status=status.HTTP_200_OK
        )


# ============================================================
# RECRUITER - CREATE JOB
# ============================================================

class RecruiterJobCreateAPIView(
    generics.CreateAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def perform_create(
        self,
        serializer
    ):

        serializer.save(
            recruiter=self.request.user
        )


# ============================================================
# RECRUITER - MY JOBS
# ============================================================

class RecruiterJobListAPIView(
    generics.ListAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return (
            Job.objects
            .filter(
                recruiter=self.request.user
            )
            .select_related(
                "company"
            )
            .order_by(
                "-created_at"
            )
        )


# ============================================================
# RECRUITER - JOB DETAIL
# ============================================================

class RecruiterJobDetailAPIView(
    generics.RetrieveAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return Job.objects.filter(
            recruiter=self.request.user
        )


# ============================================================
# RECRUITER - UPDATE JOB
# ============================================================

class RecruiterJobUpdateAPIView(
    generics.UpdateAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return Job.objects.filter(
            recruiter=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        kwargs["partial"] = True

        return super().update(
            request,
            *args,
            **kwargs
        )


# ============================================================
# RECRUITER - DELETE JOB
# ============================================================

class RecruiterJobDeleteAPIView(
    generics.DestroyAPIView
):

    serializer_class = JobSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return Job.objects.filter(
            recruiter=self.request.user
        )


# ============================================================
# RECRUITER - APPLICANTS
# ============================================================

class RecruiterApplicantsAPIView(
    generics.ListAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return (
            Application.objects
            .filter(
                job__recruiter=self.request.user
            )
            .select_related(
                "job",
                "applicant"
            )
            .order_by(
                "-applied_at"
            )
        )


# ============================================================
# RECRUITER - APPLICATION STATUS
# ============================================================

class RecruiterApplicationStatusAPIView(
    generics.UpdateAPIView
):

    serializer_class = ApplicationSerializer

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get_queryset(
        self
    ):

        return Application.objects.filter(
            job__recruiter=self.request.user
        )

    def update(
        self,
        request,
        *args,
        **kwargs
    ):

        application = self.get_object()

        status_value = request.data.get(
            "status"
        )

        if status_value:

            application.status = (
                status_value
            )

            application.save()

        serializer = self.get_serializer(
            application
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )

# ============================================================
# HIRING TRENDS
# ============================================================

class HiringTrendsAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get(
        self,
        request
    ):

        # ----------------------------------------------------
        # GET ALL JOBS
        # ----------------------------------------------------

        jobs = (
            Job.objects
            .all()
            .select_related("company")
        )

        # ----------------------------------------------------
        # TOTAL JOBS
        # ----------------------------------------------------

        total_jobs = jobs.count()

        # ----------------------------------------------------
        # TOTAL COMPANIES
        # ----------------------------------------------------

        total_companies = (
            Company.objects
            .filter(
                jobs__isnull=False
            )
            .distinct()
            .count()
        )

        # ----------------------------------------------------
        # MONTHLY JOB POSTINGS
        # ----------------------------------------------------

        monthly_data = (
            jobs
            .annotate(
                month=TruncMonth("created_at")
            )
            .values("month")
            .annotate(
                count=Count("id")
            )
            .order_by("month")
        )

        monthly_job_postings = []

        for item in monthly_data:

            month = item["month"]

            monthly_job_postings.append(
                {
                    "month": month.strftime("%b %Y"),
                    "count": item["count"],
                }
            )

        # ----------------------------------------------------
        # TOP SKILLS
        # ----------------------------------------------------

        skill_counter = Counter()

        for job in jobs:

            if not job.skills:
                continue

            skills = job.skills.split(",")

            for skill in skills:

                skill = skill.strip()

                if skill:
                    skill_counter[
                        skill.lower()
                    ] += 1

        top_skills = [
            {
                "skill": skill.title(),
                "count": count,
            }
            for skill, count
            in skill_counter.most_common(10)
        ]

        # ----------------------------------------------------
        # JOB TYPE DISTRIBUTION
        # ----------------------------------------------------

        job_type_data = (
            jobs
            .values("job_type")
            .annotate(
                count=Count("id")
            )
            .order_by("-count")
        )

        job_type_distribution = []

        for item in job_type_data:

            job_type_distribution.append(
                {
                    "type": item["job_type"],
                    "count": item["count"],
                }
            )

        # ----------------------------------------------------
        # TOP LOCATIONS
        # ----------------------------------------------------

        location_data = (
            jobs
            .values("location")
            .annotate(
                count=Count("id")
            )
            .order_by("-count")[:10]
        )

        top_locations = []

        for item in location_data:

            top_locations.append(
                {
                    "location":
                    item["location"],

                    "count":
                    item["count"],
                }
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "total_jobs":
                total_jobs,

                "total_companies":
                total_companies,

                "monthly_job_postings":
                monthly_job_postings,

                "top_skills":
                top_skills,

                "job_type_distribution":
                job_type_distribution,

                "top_locations":
                top_locations,
            },
            status=status.HTTP_200_OK
        )    


# ============================================================
# RECRUITER - APPLICATION ANALYTICS
# ============================================================

class RecruiterAnalyticsAPIView(
    generics.GenericAPIView
):

    permission_classes = [
        IsAuthenticated,
        IsRecruiter
    ]

    def get(
        self,
        request
    ):

        # ----------------------------------------------------
        # GET APPLICATIONS FOR LOGGED-IN RECRUITER
        # ----------------------------------------------------

        applications = (
            Application.objects
            .filter(
                job__recruiter=request.user
            )
        )

        # ----------------------------------------------------
        # TOTAL APPLICATIONS
        # ----------------------------------------------------

        total_applications = applications.count()

        # ----------------------------------------------------
        # STATUS COUNTS
        # ----------------------------------------------------

        applied = applications.filter(
            status="Applied"
        ).count()

        shortlisted = applications.filter(
            status="Shortlisted"
        ).count()

        interview = applications.filter(
            status="Interview"
        ).count()

        selected = applications.filter(
            status="Selected"
        ).count()

        rejected = applications.filter(
            status="Rejected"
        ).count()

        # ----------------------------------------------------
        # MONTHLY APPLICATION TRENDS
        # ----------------------------------------------------

        monthly_data = (
            applications
            .annotate(
                month=TruncMonth("applied_at")
            )
            .values("month")
            .annotate(
                count=Count("id")
            )
            .order_by("month")
        )

        monthly_trends = []

        for item in monthly_data:

            month = item["month"]

            monthly_trends.append(
                {
                    "month": month.strftime("%b %Y"),
                    "count": item["count"],
                }
            )

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "total_applications":
                total_applications,

                "applied":
                applied,

                "shortlisted":
                shortlisted,

                "interview":
                interview,

                "selected":
                selected,

                "rejected":
                rejected,

                "monthly_trends":
                monthly_trends,
            },
            status=status.HTTP_200_OK
        )    