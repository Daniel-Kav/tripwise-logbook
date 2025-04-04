"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
import sys
from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

application = get_wsgi_application()

# Run migrations and fix database schema on startup
try:
    print("Applying migrations...")
    call_command('migrate', '--noinput')
    print("Migrations applied successfully")
    
    print("Running database schema fix command...")
    call_command('fix_driver_table')
    print("Database schema fix command executed successfully")
except Exception as e:
    print(f"Error during startup tasks: {e}")
