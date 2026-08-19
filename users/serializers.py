from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "role",
        ]

    def create(self, validated_data):

        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )

        Profile.objects.create(user=user)

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):

        token = super().get_token(user)

        token["role"] = user.role
        token["username"] = user.username

        return token

    def validate(self, attrs):

        data = super().validate(attrs)

        data["role"] = self.user.role
        data["username"] = self.user.username
        data["email"] = self.user.email

        return data


class ProfileSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source="user.username",
        read_only=True
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True
    )

    resume = serializers.FileField(
        required=False,
        allow_null=True
    )

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
            "resume",
            "resume_text",
        ]

        read_only_fields = [
            "username",
            "email",
            "resume_text",
        ]