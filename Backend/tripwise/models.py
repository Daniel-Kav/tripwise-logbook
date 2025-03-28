from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class Driver(AbstractUser):
    phone_number = models.CharField(max_length=15, blank=True)
    license_number = models.CharField(max_length=50, unique=True)
    company_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return self.username
