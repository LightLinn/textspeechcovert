from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from social_django.utils import psa
from .models import BlacklistedToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

@psa('social:complete')
def google_login(request):
    user = request.backend.do_auth(request.GET.get('access_token'))
    if user:
        refresh = RefreshToken.for_user(user)
        return JsonResponse({'refresh': str(refresh), 'access': str(refresh.access_token)})
    else:
        return JsonResponse({'error': 'Error with Google Authentication'}, status=400)

@api_view(['POST'])
def register(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')
    if not username or not password or not email:
        return Response({"error": "Missing information"}, status=status.HTTP_400_BAD_REQUEST)
    
    user = User.objects.create_user(username=username, password=password, email=email)
    refresh = RefreshToken.for_user(user)

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    })

@api_view(['POST'])
def logout(request):
    token = request.data.get('token')
    if token:
        BlacklistedToken.objects.create(token=token)
        return Response({"message": "登出成功"}, status=status.HTTP_200_OK)
    return Response({"error": "未提供 Token"}, status=status.HTTP_400_BAD_REQUEST)
