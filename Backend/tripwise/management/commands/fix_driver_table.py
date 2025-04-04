from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Fixes the tripwise_driver table schema by adding missing columns or creating tables from scratch'

    def handle(self, *args, **options):
        self.stdout.write('Starting to fix the database schema...')
        
        with connection.cursor() as cursor:
            # Check if the tables exist
            cursor.execute("SELECT to_regclass('public.tripwise_driver')")
            driver_table_exists = cursor.fetchone()[0]
            
            cursor.execute("SELECT to_regclass('public.tripwise_trip')")
            trip_table_exists = cursor.fetchone()[0]
            
            # Create the auth tables if they don't exist
            self._create_auth_tables(cursor)
            
            # Create or fix the Driver table
            if not driver_table_exists:
                self.stdout.write('Creating tripwise_driver table...')
                self._create_driver_table(cursor)
            else:
                self.stdout.write('Fixing tripwise_driver table...')
                self._fix_driver_table(cursor)
            
            # Create the Trip table if it doesn't exist
            if not trip_table_exists:
                self.stdout.write('Creating tripwise_trip table...')
                self._create_trip_table(cursor)
            
            self.stdout.write(self.style.SUCCESS('Database schema fix completed successfully!'))
    
    def _create_auth_tables(self, cursor):
        """Create the necessary auth tables if they don't exist"""
        # Create content types table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS django_content_type (
                id SERIAL PRIMARY KEY,
                app_label VARCHAR(100) NOT NULL,
                model VARCHAR(100) NOT NULL,
                CONSTRAINT django_content_type_app_label_model_uniq UNIQUE (app_label, model)
            )
        """)
        
        # Create permissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_permission (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                content_type_id INTEGER NOT NULL REFERENCES django_content_type(id),
                codename VARCHAR(100) NOT NULL,
                CONSTRAINT auth_permission_content_type_id_codename_uniq UNIQUE (content_type_id, codename)
            )
        """)
        
        # Create groups table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_group (
                id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL UNIQUE
            )
        """)
        
        # Create group permissions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS auth_group_permissions (
                id SERIAL PRIMARY KEY,
                group_id INTEGER NOT NULL REFERENCES auth_group(id),
                permission_id INTEGER NOT NULL REFERENCES auth_permission(id),
                CONSTRAINT auth_group_permissions_group_id_permission_id_uniq UNIQUE (group_id, permission_id)
            )
        """)
    
    def _create_driver_table(self, cursor):
        """Create the tripwise_driver table from scratch"""
        cursor.execute("""
            CREATE TABLE tripwise_driver (
                id SERIAL PRIMARY KEY,
                password VARCHAR(250) NOT NULL,
                last_login TIMESTAMP WITH TIME ZONE NULL,
                is_superuser BOOLEAN NOT NULL DEFAULT FALSE,
                username VARCHAR(250) NOT NULL UNIQUE,
                first_name VARCHAR(150) NOT NULL DEFAULT '',
                last_name VARCHAR(150) NOT NULL DEFAULT '',
                email VARCHAR(250) NOT NULL UNIQUE,
                is_staff BOOLEAN NOT NULL DEFAULT FALSE,
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                date_joined TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
            )
        """)
        
        # Create the many-to-many tables
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tripwise_driver_groups (
                id SERIAL PRIMARY KEY,
                driver_id INTEGER NOT NULL REFERENCES tripwise_driver(id) ON DELETE CASCADE,
                group_id INTEGER NOT NULL REFERENCES auth_group(id) ON DELETE CASCADE,
                CONSTRAINT tripwise_driver_groups_driver_id_group_id_uniq UNIQUE (driver_id, group_id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tripwise_driver_user_permissions (
                id SERIAL PRIMARY KEY,
                driver_id INTEGER NOT NULL REFERENCES tripwise_driver(id) ON DELETE CASCADE,
                permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
                CONSTRAINT tripwise_driver_user_permissions_driver_id_permission_id_uniq UNIQUE (driver_id, permission_id)
            )
        """)
    
    def _fix_driver_table(self, cursor):
        """Fix the tripwise_driver table by adding missing columns"""
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
                    CONSTRAINT tripwise_driver_groups_driver_id_group_id_uniq UNIQUE (driver_id, group_id)
                )
            """)
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tripwise_driver_user_permissions (
                    id SERIAL PRIMARY KEY,
                    driver_id INTEGER NOT NULL REFERENCES tripwise_driver(id) ON DELETE CASCADE,
                    permission_id INTEGER NOT NULL REFERENCES auth_permission(id) ON DELETE CASCADE,
                    CONSTRAINT tripwise_driver_user_permissions_driver_id_permission_id_uniq UNIQUE (driver_id, permission_id)
                )
            """)
    
    def _create_trip_table(self, cursor):
        """Create the tripwise_trip table from scratch"""
        cursor.execute("""
            CREATE TABLE tripwise_trip (
                id SERIAL PRIMARY KEY,
                user_id VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                daily_logs JSONB NOT NULL,
                notes TEXT NULL,
                rest_stops JSONB NOT NULL,
                route_data JSONB NOT NULL,
                trip_details JSONB NOT NULL
            )
        """)
