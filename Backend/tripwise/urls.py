from django.urls import path
from . import views
from .views import TripSavingView, UserTripsView, api_status, ping

urlpatterns = [
    path('', api_status, name='api_root_status'),  # API root URL to show API status
    path('ping/', ping, name='ping'),  # Simple ping endpoint to keep the backend awake
    path('auth/register/', views.DriverRegistrationView.as_view(), name='driver-register'),
    path('auth/login/', views.DriverLoginView.as_view(), name='driver-login'),
    path('trip/save/', TripSavingView.as_view(), name='save_trip'),
    path('trip/user/<int:user_id>/', UserTripsView.as_view(), name='user_trips'),
]