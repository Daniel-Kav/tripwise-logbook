#!/usr/bin/env python
"""
A standalone script to ping the TripWise backend server every 10 seconds
to prevent it from going to sleep. This script can be run independently
of the main application.

Usage:
    python keep_alive.py

To run in the background on Windows:
    pythonw keep_alive.py
"""

import requests
import time
import datetime
import sys
import logging
from logging.handlers import RotatingFileHandler

# Configure logging
log_formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
log_file = 'keep_alive.log'
log_handler = RotatingFileHandler(log_file, maxBytes=1024*1024, backupCount=3)
log_handler.setFormatter(log_formatter)

logger = logging.getLogger('keep_alive')
logger.setLevel(logging.INFO)
logger.addHandler(log_handler)

# Add console handler if not running in background
if sys.executable.endswith('python.exe'):
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(log_formatter)
    logger.addHandler(console_handler)

# API URL - Change this to match your deployment
API_URL = 'https://tripwise-7jbg.onrender.com/api/ping/'

def ping_server():
    """Send a ping request to the server"""
    try:
        response = requests.get(API_URL, timeout=10)
        if response.status_code == 200:
            logger.info(f"Ping successful: {response.status_code}")
            return True
        else:
            logger.warning(f"Ping failed with status code: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"Ping error: {str(e)}")
        return False

def main():
    """Main function to continuously ping the server"""
    logger.info("Starting keep-alive service...")
    
    # Track consecutive failures
    consecutive_failures = 0
    max_consecutive_failures = 5
    
    try:
        while True:
            result = ping_server()
            
            # Reset counter on success
            if result:
                consecutive_failures = 0
            else:
                consecutive_failures += 1
            
            # Log warning if we're having multiple failures
            if consecutive_failures >= max_consecutive_failures:
                logger.warning(f"Experienced {consecutive_failures} consecutive failures")
            
            # Sleep for 10 seconds
            time.sleep(10)
    except KeyboardInterrupt:
        logger.info("Keep-alive service stopped by user")
    except Exception as e:
        logger.critical(f"Keep-alive service crashed: {str(e)}")
        raise

if __name__ == "__main__":
    main()
