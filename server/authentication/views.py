from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework_simplejwt.tokens import RefreshToken
from .models import BlacklistedToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
#     @classmethod
#     def get_token(cls, user):
#         token = super().get_token(user)

#         # 添加自定義數據到 token 本身
#         token['user_id'] = user.id

#         return token

#     def validate(self, attrs):
#         data = super().validate(attrs)
#         data['user_id'] = self.user.id  # 将 user_id 添加到响应中
#         return data

# class MyTokenObtainPairView(TokenObtainPairView):
#     serializer_class = MyTokenObtainPairSerializer

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



