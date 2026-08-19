from django.urls import path

from .views import (
    CompanyListAPIView,
    JobListAPIView,
    JobDetailAPIView,
    SwipeAPIView,
    SavedJobsAPIView,
    RecommendedJobsAPIView,
    HiringTrendsAPIView,

    ApplyJobAPIView,
    MyApplicationsAPIView,

    ATSScoreAPIView,
    ResumeAnalyticsAPIView,
    ResumeSuitableJobsAPIView,

    NotificationListAPIView,
    NotificationUnreadCountAPIView,
    NotificationReadAPIView,
    NotificationMarkAllReadAPIView,

    RecruiterJobCreateAPIView,
    RecruiterJobListAPIView,
    RecruiterJobDetailAPIView,
    RecruiterJobUpdateAPIView,
    RecruiterJobDeleteAPIView,

    RecruiterApplicantsAPIView,
    RecruiterApplicationStatusAPIView,
    RecruiterAnalyticsAPIView,
)


urlpatterns = [
    path("companies/", CompanyListAPIView.as_view(), name="company-list"),
    path("jobs/", JobListAPIView.as_view(), name="job-list"),
    path("jobs/<int:pk>/", JobDetailAPIView.as_view(), name="job-detail"),
    path("swipe/", SwipeAPIView.as_view(), name="swipe-job"),
    path("saved-jobs/", SavedJobsAPIView.as_view(), name="saved-jobs"),

    path("recommended-jobs/", RecommendedJobsAPIView.as_view(), name="recommended-jobs"),

    path("jobs/<int:pk>/ats-score/", ATSScoreAPIView.as_view(), name="ats-score"),
    path("resume-analytics/", ResumeAnalyticsAPIView.as_view(), name="resume-analytics"),
    path(
        "resume-suitable-jobs/",
        ResumeSuitableJobsAPIView.as_view(),
        name="resume-suitable-jobs",
    ),

    path("apply/", ApplyJobAPIView.as_view(), name="apply-job"),
    path("my-applications/", MyApplicationsAPIView.as_view(), name="my-applications"),

    path("notifications/", NotificationListAPIView.as_view(), name="notifications"),
    path(
        "notifications/unread-count/",
        NotificationUnreadCountAPIView.as_view(),
        name="notification-unread-count",
    ),
    path(
        "notifications/<int:pk>/read/",
        NotificationReadAPIView.as_view(),
        name="notification-read",
    ),
    path(
        "notifications/mark-all-read/",
        NotificationMarkAllReadAPIView.as_view(),
        name="notification-mark-all-read",
    ),

    path("recruiter/jobs/", RecruiterJobListAPIView.as_view(), name="recruiter-job-list"),
    path(
        "recruiter/jobs/create/",
        RecruiterJobCreateAPIView.as_view(),
        name="recruiter-job-create",
    ),
    path(
        "recruiter/jobs/<int:pk>/",
        RecruiterJobDetailAPIView.as_view(),
        name="recruiter-job-detail",
    ),
    path(
        "recruiter/jobs/<int:pk>/update/",
        RecruiterJobUpdateAPIView.as_view(),
        name="recruiter-job-update",
    ),
    path(
        "recruiter/jobs/<int:pk>/delete/",
        RecruiterJobDeleteAPIView.as_view(),
        name="recruiter-job-delete",
    ),

    path(
        "recruiter/applicants/",
        RecruiterApplicantsAPIView.as_view(),
        name="recruiter-applicants",
    ),
    path(
        "recruiter/applications/<int:pk>/status/",
        RecruiterApplicationStatusAPIView.as_view(),
        name="application-status",
    ),

    path(
    "hiring-trends/",
    HiringTrendsAPIView.as_view(),
    name="hiring-trends",
    ),
    
    path(
    "recruiter/analytics/",
    RecruiterAnalyticsAPIView.as_view(),
    name="recruiter-analytics",
    ),
]
