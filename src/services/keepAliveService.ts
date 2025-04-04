// This file contains a service to keep the backend server awake by pinging it regularly

// API base URL - use environment variable or fallback to the deployed URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripwise-7jbg.onrender.com';

// Keep track of the interval ID so we can clear it if needed
let keepAliveIntervalId: number | null = null;

export const keepAliveService = {
  /**
   * Start pinging the backend every 10 seconds to prevent it from going to sleep
   * @returns The interval ID that can be used to stop the pinging
   */
  startKeepAlive: (): number => {
    // Clear any existing interval first
    if (keepAliveIntervalId !== null) {
      clearInterval(keepAliveIntervalId);
    }

    // Set up a new interval to ping the backend every 10 seconds
    const intervalId = window.setInterval(async () => {
      try {
        // Simple ping endpoint that doesn't require authentication
        const response = await fetch(`${API_BASE_URL}/api/ping/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          // No credentials needed for a simple ping
        });

        // Log the ping status for debugging (can be removed in production)
        if (response.ok) {
          console.debug('Backend ping successful:', new Date().toISOString());
        } else {
          console.warn('Backend ping failed:', response.status);
        }
      } catch (error) {
        // Log any errors but don't throw them to avoid breaking the app
        console.warn('Backend ping error:', error);
      }
    }, 10000); // 10 seconds interval

    // Store the interval ID for later reference
    keepAliveIntervalId = intervalId;
    
    return intervalId;
  },

  /**
   * Stop pinging the backend
   */
  stopKeepAlive: (): void => {
    if (keepAliveIntervalId !== null) {
      clearInterval(keepAliveIntervalId);
      keepAliveIntervalId = null;
      console.debug('Backend keep-alive service stopped');
    }
  },

  /**
   * Check if the keep-alive service is currently running
   * @returns True if the service is running, false otherwise
   */
  isRunning: (): boolean => {
    return keepAliveIntervalId !== null;
  }
};
