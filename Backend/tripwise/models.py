from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class Driver(AbstractUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.username

class Trip(models.Model):
    user_id = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    daily_logs = models.JSONField()
    notes = models.TextField(null=True, blank=True)
    rest_stops = models.JSONField()
    route_data = models.JSONField()
    trip_details = models.JSONField()

    def __str__(self):
        return f"Trip {self.id} by User {self.user_id}"
