from django.urls import path
from . import views

urlpatterns = [
    path('auth/register/', views.DriverRegistrationView.as_view(), name='driver-register'),
    path('auth/login/', views.DriverLoginView.as_view(), name='driver-login'),
] 