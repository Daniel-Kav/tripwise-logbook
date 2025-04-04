// This file manages saving and retrieving trip history data

import { authService } from "./authService";
import { TripFormValues } from "@/components/TripForm";
import { DailyLog, RestStop } from "@/utils/tripCalculations";
import { GeminiRouteData } from "./geminiService";

// API base URL - use environment variable or fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tripwise-7jbg.onrender.com';

export interface SavedTrip {
  id: string;
  userId: string;
  tripDetails: TripFormValues;
  routeData: GeminiRouteData;
  restStops: RestStop[];
  dailyLogs: DailyLog[];
  createdAt: string;
  notes?: string;
}

// In-memory storage for demo purposes
// In a real app, this would use a database
const tripsStorage: Record<string, SavedTrip[]> = {};

export const tripHistoryService = {
  // Save a trip and its logs
  saveTrip: (
    tripDetails: TripFormValues,
    routeData: GeminiRouteData,
    restStops: RestStop[],
    dailyLogs: DailyLog[],
    notes?: string
  ): Promise<SavedTrip> => {
    return new Promise(async (resolve, reject) => {
      if (!authService.isAuthenticated()) {
        reject(new Error("User must be authenticated to save trips"));
      }

      const userId = authService.getCurrentUser()?.id;
      const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const newTrip = {
        id,
        userId,
        tripDetails,
        routeData,
        restStops,
        dailyLogs,
        createdAt: new Date().toISOString(),
        notes
      };

      // Send the trip data to the backend API
      try {
        const response = await fetch(`${API_BASE_URL}/api/trip/save/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'include', // Include cookies for CSRF token
          body: JSON.stringify(newTrip),
        });

        if (!response.ok) {
          throw new Error('Failed to save trip');
        }

        const savedTrip = await response.json();
        resolve(savedTrip);
      } catch (error) {
        reject(error);
      }
    });
  },
  
  // Get all trips for the current user
  getUserTrips: async (): Promise<SavedTrip[]> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to view trips");
    }

    const userId = authService.getCurrentUser()?.id;

    // Send a request to the backend to retrieve user trips
    try {
        const response = await fetch(`${API_BASE_URL}/api/trip/user/${userId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include', // Include cookies for CSRF token
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user trips');
        }

        const trips: SavedTrip[] = await response.json();
        console.log("Fetched trips:", trips);
        return trips;
    } catch (error) {
        throw error;
    }
  },
  
  // Get a specific trip by ID
  getTripById: async (tripId: string): Promise<SavedTrip | null> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to view trips");
    }

    const userId = authService.getCurrentUser()?.id;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/trip/${tripId}/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include', // Include cookies for CSRF token
        });

        if (!response.ok) {
            throw new Error('Failed to fetch trip');
        }

        const trip: SavedTrip = await response.json();
        return trip;
    } catch (error) {
        console.error("Error fetching trip:", error);
        return null;
    }
  },
  
  // Delete a trip by ID
  deleteTrip: async (tripId: string): Promise<boolean> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to delete trips");
    }

    try {
        const response = await fetch(`${API_BASE_URL}/api/trip/${tripId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            credentials: 'include', // Include cookies for CSRF token
        });

        if (!response.ok) {
            throw new Error('Failed to delete trip');
        }

        return true;
    } catch (error) {
        console.error("Error deleting trip:", error);
        return false;
    }
  }
};
