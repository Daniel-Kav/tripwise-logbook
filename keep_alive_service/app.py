"""
TripWise Keep-Alive Service

A simple Flask application that pings the TripWise backend every 10 seconds
to prevent it from going to sleep. This can be deployed to a cloud platform
like Heroku or Render as a separate service.
"""

import os
import time
import threading
import requests
import logging
from flask import Flask, jsonify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create Flask app
app = Flask(__name__)

# API URL - Change this to match your deployment
API_URL = os.environ.get('TRIPWISE_API_URL', 'https://tripwise-7jbg.onrender.com/api/ping/')

# Ping status tracking
ping_status = {
    'last_ping_time': None,
    'last_ping_status': None,
    'ping_count': 0,
    'success_count': 0,
    'failure_count': 0
}

def ping_server():
    """Send a ping request to the server"""
    try:
        response = requests.get(API_URL, timeout=10)
        ping_status['last_ping_time'] = time.strftime('%Y-%m-%d %H:%M:%S')
        ping_status['ping_count'] += 1
        
        if response.status_code == 200:
            ping_status['last_ping_status'] = 'success'
            ping_status['success_count'] += 1
            logger.info(f"Ping successful: {response.status_code}")
            return True
        else:
            ping_status['last_ping_status'] = f'failed ({response.status_code})'
            ping_status['failure_count'] += 1
            logger.warning(f"Ping failed with status code: {response.status_code}")
            return False
    except Exception as e:
        ping_status['last_ping_time'] = time.strftime('%Y-%m-%d %H:%M:%S')
        ping_status['last_ping_status'] = f'error ({str(e)})'
        ping_status['ping_count'] += 1
        ping_status['failure_count'] += 1
        logger.error(f"Ping error: {str(e)}")
        return False

def ping_thread():
    """Background thread to continuously ping the server"""
    logger.info("Starting keep-alive background thread...")
    
    while True:
        ping_server()
        time.sleep(10)  # Ping every 10 seconds

# Start the background ping thread when the app starts
@app.before_first_request
def start_ping_thread():
    thread = threading.Thread(target=ping_thread)
    thread.daemon = True  # Thread will exit when the main process exits
    thread.start()
    logger.info("Background ping thread started")

# Status endpoint
@app.route('/')
def status():
    return jsonify({
        'service': 'TripWise Keep-Alive Service',
        'status': 'running',
        'ping_status': ping_status
    })

# Health check endpoint for the service itself
@app.route('/health')
def health():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    # Get port from environment variable (for Heroku/Render compatibility)
    port = int(os.environ.get('PORT', 5000))
    
    # Start the Flask app
    app.run(host='0.0.0.0', port=port)
