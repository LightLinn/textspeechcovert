"""
URL configuration for TextSpeechConversion project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from drf_spectacular.views import SpectacularJSONAPIView, SpectacularRedocView, SpectacularSwaggerView, SpectacularAPIView
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView, TokenObtainPairView
from rest_framework.routers import DefaultRouter
from main import views
from authentication.views import register, logout, google_login
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'paragraphs', views.ParagraphViewSet)
router.register(r'phrases', views.PhraseViewSet)
router.register(r'comparisonResult', views.ComparisonResultViewSet)
router.register(r'recommends', views.RecommendViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('swagger/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    
    path('api/register/', register, name='register'),
    path('api/logout/', logout, name='logout'),
    #path('api/auth/google/', google_login, name='google_login'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    path('api/', include(router.urls)),
    path('api/word_info/', views.WordInfoView.as_view(), name='word_info'),
    path('api/url_to_text/', views.UrlToText.as_view()),
    path('api/audio_to_results/', views.AudioToResultsView.as_view(), name='audio_to_results'),
    # path('api/tts/', views.text_to_speech, name='text_to_speech'),
    path('api/testroute/', views.my_view),
    path('social-auth/', include('social_django.urls', namespace='social')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
