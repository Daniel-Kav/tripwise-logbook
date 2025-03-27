
// This file simulates integration with Django backend for log data

import { authService } from "./authService";

interface LogEntry {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  location: string;
  miles: number;
}

// Simulated API URL - in a real implementation, this would point to your Django backend
const API_URL = "https://api.example.com";

// Helper function to include auth token in requests
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
};

export const logService = {
  // Get all logs for current user
  getLogs: async (): Promise<LogEntry[]> => {
    // Simulate API request to Django backend
    console.log("Fetching logs from backend");
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("Authentication required");
    }
    
    // Simulated response data
    return [
      { id: 1, date: "2023-10-15", startTime: "08:00", endTime: "16:00", status: "On Duty", location: "New York, NY", miles: 0 },
      { id: 2, date: "2023-10-15", startTime: "16:00", endTime: "18:00", status: "Driving", location: "Jersey City, NJ", miles: 42 },
      { id: 3, date: "2023-10-15", startTime: "18:00", endTime: "20:00", status: "Off Duty", location: "Philadelphia, PA", miles: 95 },
    ];
  },
  
  // Save a log entry
  saveLog: async (log: Omit<LogEntry, "id">): Promise<LogEntry> => {
    // Simulate API request to Django backend
    console.log("Saving log to backend:", log);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Check if authenticated
    if (!authService.isAuthenticated()) {
      throw new Error("Authentication required");
    }
    
    // Simulate successful save with server-assigned ID
    return {
      id: Math.floor(Math.random() * 1000) + 10,
      ...log
    };
  },
  
  // Validate log entry
  validateLog: async (log: Partial<LogEntry>): Promise<{valid: boolean, errors: string[]}> => {
    // Simulate validation request to Django backend
    console.log("Validating log with backend:", log);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simple validation logic (would be done by Django in real implementation)
    const errors: string[] = [];
    
    if (!log.date) {
      errors.push("Date is required");
    }
    
    if (!log.startTime) {
      errors.push("Start time is required");
    }
    
    if (!log.endTime) {
      errors.push("End time is required");
    }
    
    if (log.startTime && log.endTime && log.startTime >= log.endTime) {
      errors.push("End time must be after start time");
    }
    
    if (!log.status) {
      errors.push("Status is required");
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
};
