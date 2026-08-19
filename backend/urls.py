"""
URL configuration for backend project.
"""

from django.contrib import admin
from django.urls import path, include

# NEW
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [

    path("admin/", admin.site.urls),

    # ==========================
    # User APIs
    # ==========================

    path(
        "api/",
        include("users.urls")
    ),

    # ==========================
    # Job APIs
    # ==========================

    path(
        "api/",
        include("jobcore.urls")
    ),

]

# ==========================================
# Serve uploaded resume files
# ==========================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )