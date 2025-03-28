
// This file manages saving and retrieving trip history data

import { authService } from "./authService";
import { TripFormValues } from "@/components/TripForm";
import { DailyLog, RestStop } from "@/utils/tripCalculations";
import { GeminiRouteData } from "./geminiService";

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
  saveTrip: async (
    tripDetails: TripFormValues,
    routeData: GeminiRouteData,
    restStops: RestStop[],
    dailyLogs: DailyLog[],
    notes?: string
  ): Promise<SavedTrip> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to save trips");
    }

    const userId = authService.getCurrentUser()?.userId || 'demo-user';
    
    // Create a unique ID
    const id = `trip-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newTrip: SavedTrip = {
      id,
      userId: String(userId), // Convert userId to string explicitly
      tripDetails,
      routeData,
      restStops,
      dailyLogs,
      createdAt: new Date().toISOString(),
      notes
    };
    
    // Initialize user's trips array if it doesn't exist
    if (!tripsStorage[userId]) {
      tripsStorage[userId] = [];
    }
    
    // Add to in-memory storage (would be a database in production)
    tripsStorage[userId].push(newTrip);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Trip saved:', newTrip);
    
    return newTrip;
  },
  
  // Get all trips for the current user
  getUserTrips: async (): Promise<SavedTrip[]> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to view trips");
    }

    const userId = authService.getCurrentUser()?.userId || 'demo-user';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return user's trips or empty array if none found
    return tripsStorage[userId] || [];
  },
  
  // Get a specific trip by ID
  getTripById: async (tripId: string): Promise<SavedTrip | null> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to view trips");
    }

    const userId = authService.getCurrentUser()?.userId || 'demo-user';
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Find the trip in the user's trips
    const trip = tripsStorage[userId]?.find(trip => trip.id === tripId) || null;
    
    return trip;
  },
  
  // Delete a trip by ID
  deleteTrip: async (tripId: string): Promise<boolean> => {
    // Check if user is authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("User must be authenticated to delete trips");
    }

    const userId = authService.getCurrentUser()?.userId || 'demo-user';
    
    // If user has no trips, nothing to delete
    if (!tripsStorage[userId]) {
      return false;
    }
    
    // Find index of trip to delete
    const tripIndex = tripsStorage[userId].findIndex(trip => trip.id === tripId);
    
    // If trip not found, return false
    if (tripIndex === -1) {
      return false;
    }
    
    // Remove trip from array
    tripsStorage[userId].splice(tripIndex, 1);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return true;
  }
};
