"""
URL configuration for BP Management app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# API router for ViewSets
router = DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'patients', views.PatientViewSet)
router.register(r'readings', views.BpReadingViewSet)
router.register(r'workflow', views.WorkflowTaskViewSet)
router.register(r'communications', views.CommunicationLogViewSet)

urlpatterns = [
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/login/', views.login_view, name='api_login'),
    path('api/auth/logout/', views.logout_view, name='api_logout'),
    path('api/dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    
    # Web interface (optional - for Django admin and basic views)
    path('', views.dashboard_view, name='dashboard'),
    path('login/', views.web_login_view, name='login'),
    path('logout/', views.web_logout_view, name='logout'),
]