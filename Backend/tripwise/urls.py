from django.urls import path
from . import views
from .views import TripSavingView, UserTripsView

urlpatterns = [
    path('auth/register/', views.DriverRegistrationView.as_view(), name='driver-register'),
    path('auth/login/', views.DriverLoginView.as_view(), name='driver-login'),
    path('trip/save/', TripSavingView.as_view(), name='save_trip'),
    path('trip/user/<int:user_id>/', UserTripsView.as_view(), name='user_trips'),
]