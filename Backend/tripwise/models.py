from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.

class Driver(AbstractUser):
    username = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=50, unique=True)
    password = models.CharField(max_length=50)

    def __str__(self):
        return self.username
