from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny
from .serializers import DriverRegistrationSerializer, DriverLoginSerializer
from django.contrib.auth import get_user_model
from .models import Trip  # Import the Trip model
import datetime

User = get_user_model()

# API Status View
@api_view(['GET'])
@permission_classes([AllowAny])
def api_status(request):
    return Response({
        'status': 'online',
        'message': 'TripWise API is running',
        'version': '1.0.0'
    }, status=status.HTTP_200_OK)

# Simple ping endpoint for keeping the backend awake
@api_view(['GET'])
@permission_classes([AllowAny])
def ping(request):
    return Response({
        'status': 'alive',
        'timestamp': str(datetime.datetime.now())
    }, status=status.HTTP_200_OK)

# Driver Registration View
class DriverRegistrationView(generics.CreateAPIView):
    serializer_class = DriverRegistrationSerializer
    permission_classes = [AllowAny]  # Allow anyone to register

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            'message': 'Driver registered successfully',
            'user': {
                'username': user.username,
                'email': user.email
            }
        }, status=status.HTTP_201_CREATED)

# Driver Login View
class DriverLoginView(APIView):
    serializer_class = DriverLoginSerializer
    permission_classes = [AllowAny]  # Allow login for all users

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(username=username, password=password)
            
            if user:
                login(request, user)
                return Response({
                    'message': 'Login successful',
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email
                    }
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Trip Saving View
class TripSavingView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to save trips

    def post(self, request):
        data = request.data
        # Assuming data structure is validated, you can add validation logic here
        trip = Trip.objects.create(
            user_id=data['userId'],
            created_at=data['createdAt'],
            daily_logs=data['dailyLogs'],
            notes=data.get('notes', None),
            rest_stops=data['restStops'],
            route_data=data['routeData'],
            trip_details=data['tripDetails']
        )
        return Response({'message': 'Trip saved successfully', 'tripId': trip.id}, status=status.HTTP_201_CREATED)

# User Trips View
class UserTripsView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to view trips

    def get(self, request, user_id):
        trips = Trip.objects.filter(user_id=user_id)
        trip_data = [
            {
                'id': trip.id,
                'created_at': trip.created_at,
                'daily_logs': trip.daily_logs,
                'notes': trip.notes,
                'rest_stops': trip.rest_stops,
                'route_data': trip.route_data,
                'trip_details': trip.trip_details,
            }
            for trip in trips
        ]
        return Response(trip_data, status=status.HTTP_200_OK)
