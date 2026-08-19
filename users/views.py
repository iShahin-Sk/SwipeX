from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User, Profile
from .serializers import (
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    ProfileSerializer,
)
from .resume_parser import extract_resume_text


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = RegisterSerializer


class CustomTokenObtainPairView(TokenObtainPairView):

    serializer_class = CustomTokenObtainPairSerializer


class ProfileAPIView(generics.RetrieveUpdateAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def get_object(self):

        profile, created = Profile.objects.get_or_create(
            user=self.request.user
        )

        return profile

    def perform_update(self, serializer):

        profile = self.get_object()

        delete_resume = (
            self.request.data.get("delete_resume") == "true"
        )

        # ======================================
        # DELETE RESUME
        # ======================================

        if delete_resume:

            if profile.resume:
                profile.resume.delete(save=False)

            serializer.save(
                resume=None,
                resume_text=""
            )

            return

        # ======================================
        # NEW RESUME UPLOAD
        # ======================================

        new_resume = self.request.FILES.get("resume")

        if new_resume:

            # Save the new resume first
            profile = serializer.save()

            # Extract text from uploaded PDF
            if profile.resume:

                extracted_text = extract_resume_text(
                    profile.resume.path
                )

                profile.resume_text = extracted_text
                profile.save(
                    update_fields=["resume_text"]
                )

            return

        # ======================================
        # NORMAL PROFILE UPDATE
        # ======================================

        serializer.save()