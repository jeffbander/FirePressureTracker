#!/usr/bin/env python
"""
Django development server launcher for the Fire Department BP Management System
"""
import os
import sys
import subprocess
import time
from pathlib import Path

def main():
    # Set the Django settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bp_system.settings')
    
    # Change to the Django project directory
    django_dir = Path(__file__).parent / 'django_bp_system'
    os.chdir(django_dir)
    
    # Start the Django development server on port 5000
    try:
        print("Starting Django development server on port 5000...")
        subprocess.run([
            sys.executable, 
            'manage.py', 
            'runserver', 
            '0.0.0.0:5000'
        ], check=True)
    except KeyboardInterrupt:
        print("\nShutting down Django server...")
    except subprocess.CalledProcessError as e:
        print(f"Error starting Django server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()