from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Fixes the tripwise_driver table schema by adding missing columns'

    def handle(self, *args, **options):
        self.stdout.write('Starting to fix the tripwise_driver table...')
        
        # Check if the table exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT to_regclass('public.tripwise_driver')")
            table_exists = cursor.fetchone()[0]
            
            if not table_exists:
                self.stdout.write(self.style.ERROR('Table tripwise_driver does not exist!'))
                return
            
            # Check if last_login column exists
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='tripwise_driver' AND column_name='last_login'
            """)
            last_login_exists = cursor.fetchone()
            
            if not last_login_exists:
                self.stdout.write('Adding missing columns to tripwise_driver table...')
                
                # Add all the missing columns from AbstractUser
                cursor.execute("""
                    ALTER TABLE tripwise_driver 
                    ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE NULL,
                    ADD COLUMN IF NOT EXISTS is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS first_name VARCHAR(150) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS last_name VARCHAR(150) NOT NULL DEFAULT '',
                    ADD COLUMN IF NOT EXISTS is_staff BOOLEAN NOT NULL DEFAULT FALSE,
                    ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
                    ADD COLUMN IF NOT EXISTS date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
                """)
                
                # Create the many-to-many tables if they don't exist
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tripwise_driver_groups (
                        id SERIAL PRIMARY KEY,
                        driver_id INTEGER NOT NULL REFERENCES tripwise_driver(id) ON DELETE CASCADE,
                        group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
                        UNIQUE(driver_id, group_id)
                    )
                """)
                
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS tripwise_driver_user_permissions (
                        id SERIAL PRIMARY KEY,
                        driver_id INTEGER NOT NULL REFERENCES tripwise_driver(id) ON DELETE CASCADE,
                        permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
                        UNIQUE(driver_id, permission_id)
                    )
                """)
                
                self.stdout.write(self.style.SUCCESS('Successfully fixed the tripwise_driver table!'))
            else:
                self.stdout.write(self.style.SUCCESS('The tripwise_driver table already has the required columns.'))
