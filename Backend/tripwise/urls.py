from django.urls import path
from . import views
from .views import TripSavingView

urlpatterns = [
    path('auth/register/', views.DriverRegistrationView.as_view(), name='driver-register'),
    path('auth/login/', views.DriverLoginView.as_view(), name='driver-login'),
    path('api/trip/save/', TripSavingView.as_view(), name='save_trip'),
]