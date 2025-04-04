# TripWise Keep-Alive Service

A standalone service to continuously ping the TripWise backend server every 10 seconds to prevent it from going to sleep.

## Overview

This service is designed to run independently of the main TripWise application. It regularly sends requests to the backend server to keep it active and prevent it from going to sleep due to inactivity, which is common with free-tier hosting services.

## Deployment Options

### 1. Run Locally

You can run the service locally on your machine:

```bash
# Install dependencies
pip install -r requirements.txt

# Run the service
python app.py
```

### 2. Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create tripwise-keep-alive

# Set the backend URL (if different from default)
heroku config:set TRIPWISE_API_URL=https://your-backend-url.com/api/ping/

# Deploy the app
git push heroku main
```

### 3. Deploy to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `pip install -r requirements.txt`
4. Set the start command: `gunicorn app:app`
5. Add environment variable: `TRIPWISE_API_URL=https://your-backend-url.com/api/ping/`

## Monitoring

The service provides a simple status page at the root URL (`/`) that shows:
- Current service status
- Last ping time
- Last ping status
- Total ping count
- Success and failure counts

A health check endpoint is also available at `/health` for monitoring services.

## Customization

You can adjust the ping interval by modifying the `time.sleep(10)` value in the `ping_thread` function.
