from django.shortcuts import render
from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login
from rest_framework.permissions import AllowAny
from .serializers import DriverRegistrationSerializer, DriverLoginSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

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
                        'username': user.username,
                        'email': user.email
                    }
                })
            else:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
