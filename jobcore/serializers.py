from rest_framework import serializers

from .models import (
    Company,
    Job,
    SwipeAction,
    Application,
    Notification,
)

from users.models import Profile


# =====================================
# Company Serializer
# =====================================

class CompanySerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = "__all__"


# =====================================
# Job Serializer
# =====================================

class JobSerializer(serializers.ModelSerializer):

    company = CompanySerializer(
        read_only=True
    )

    company_id = serializers.PrimaryKeyRelatedField(
        queryset=Company.objects.all(),
        source="company",
        write_only=True
    )

    recruiter = serializers.StringRelatedField(
        read_only=True
    )

    class Meta:
        model = Job

        fields = [
            "id",
            "title",
            "description",
            "location",
            "salary",
            "experience",
            "skills",
            "job_type",
            "company",
            "company_id",
            "recruiter",
            "created_at",
        ]

        read_only_fields = [
            "recruiter",
            "created_at",
        ]


# =====================================
# Swipe Serializer
# =====================================

class SwipeActionSerializer(serializers.ModelSerializer):

    class Meta:
        model = SwipeAction

        fields = "__all__"

        read_only_fields = [
            "user"
        ]


# =====================================
# APPLICANT PROFILE SERIALIZER
# =====================================

class ApplicantProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    resume_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile

        fields = [
            "username",
            "email",
            "full_name",
            "headline",
            "location",
            "experience_years",
            "skills",
            "resume_url",
        ]

    def get_resume_url(self, obj):

        if not obj.resume:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                obj.resume.url
            )

        return obj.resume.url


# =====================================
# Application Serializer
# =====================================

class ApplicationSerializer(serializers.ModelSerializer):

    job = JobSerializer(
        read_only=True
    )

    job_id = serializers.PrimaryKeyRelatedField(
        queryset=Job.objects.all(),
        source="job",
        write_only=True,
        required=False
    )

    applicant = serializers.StringRelatedField(
        read_only=True
    )

    applicant_profile = serializers.SerializerMethodField()

    class Meta:
        model = Application

        fields = [
            "id",
            "job",
            "job_id",
            "applicant",
            "applicant_profile",
            "status",
            "applied_at",
        ]

        read_only_fields = [
            "applicant",
            "applied_at",
        ]

    def get_applicant_profile(self, obj):

        try:

            profile = Profile.objects.get(
                user=obj.applicant
            )

            return ApplicantProfileSerializer(
                profile,
                context=self.context
            ).data

        except Profile.DoesNotExist:

            return None


# =====================================
# Notification Serializer
# =====================================

class NotificationSerializer(
    serializers.ModelSerializer
):

    notification_type_display = (
        serializers.CharField(
            source="get_notification_type_display",
            read_only=True
        )
    )

    class Meta:
        model = Notification

        fields = [
            "id",
            "notification_type",
            "notification_type_display",
            "title",
            "message",
            "job",
            "is_read",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "notification_type_display",
            "created_at",
        ]