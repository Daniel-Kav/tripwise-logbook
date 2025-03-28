
import { TripDetails, RouteSegment, RestStop, HOS_CONSTANTS } from '@/utils/tripCalculations';

// Gemini API endpoint - in a real app, this would be an environment variable
const GEMINI_API_ENDPOINT = "https://api.google.com/v1/models/gemini-pro:generateContent";

// Interface for the Gemini API request
interface GeminiRequest {
  contents: {
    parts: {
      text: string;
    }[];
  }[];
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

// Interface for the Gemini API response
interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

// Interface for the route data returned by Gemini
export interface GeminiRouteData {
  segments: RouteSegment[];
  restStops: RestStop[];
  totalDistance: number;
  totalDrivingTime: number;
  hosCompliant: boolean;
  violations: string[];
  multiDayTrip: boolean;
  dailyMiles: number[];
}

/**
 * Send a request to Gemini API to calculate route details
 */
export const calculateRouteWithGemini = async (tripDetails: TripDetails): Promise<GeminiRouteData> => {
  // For demo purposes, we'll simulate the Gemini API call
  // In a real application, you would make an actual API request
  console.log("Sending request to Gemini API for route calculation...");
  
  // Simulating API request delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Create prompt for Gemini
  const prompt = createGeminiPrompt(tripDetails);
  
  try {
    // In a real implementation, this would make an actual API call to Gemini
    // const response = await fetch(GEMINI_API_ENDPOINT, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${API_KEY}`
    //   },
    //   body: JSON.stringify(createGeminiRequest(prompt))
    // });
    // const data = await response.json();
    // return parseGeminiResponse(data);
    
    // For demo purposes, return mock data based on the trip details
    return getMockGeminiResponse(tripDetails);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to calculate route using Gemini. Please try again.");
  }
};

/**
 * Create a prompt for Gemini based on trip details
 */
const createGeminiPrompt = (tripDetails: TripDetails): string => {
  return `
    Calculate the most efficient route for a truck driver with the following parameters:
    - Current location: ${tripDetails.currentLocation}
    - Pickup location: ${tripDetails.pickupLocation}
    - Dropoff location: ${tripDetails.dropoffLocation}
    - Current HOS cycle: ${tripDetails.currentCycle}
    - Available driving hours: ${tripDetails.availableDrivingHours}

    Please provide:
    1. Total route distance in miles
    2. Route segments with their distances and estimated driving times
    3. Required rest stops based on FMCSA Hours of Service regulations:
       - Maximum 11 hours driving in a day
       - Maximum 14 hours on-duty in a day
       - Minimum 10 hours off-duty between shifts
       - Required 30-minute break after 8 hours of driving
    4. Whether the trip requires multiple days
    5. Daily miles breakdown
    6. Any HOS violations that might occur

    Please format the response as structured data that can be parsed by a JavaScript application.
  `;
};

/**
 * Create a request object for the Gemini API
 */
const createGeminiRequest = (prompt: string): GeminiRequest => {
  return {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 2048
    }
  };
};

/**
 * Parse the Gemini API response into a structured format
 */
const parseGeminiResponse = (response: GeminiResponse): GeminiRouteData => {
  // In a real implementation, this would parse the JSON or structured text from Gemini
  // For demo purposes, we're returning mock data instead
  throw new Error("Not implemented - using mock data instead");
};

/**
 * Generate mock response data based on trip details
 */
const getMockGeminiResponse = (tripDetails: TripDetails): GeminiRouteData => {
  // For demonstration, generate realistic data based on the provided locations
  const { currentLocation, pickupLocation, dropoffLocation, availableDrivingHours } = tripDetails;
  
  // Calculate distances based on popular city pairs
  let distance1 = 150; // Default distance from current to pickup
  let distance2 = 575; // Default distance from pickup to dropoff
  
  // Customize distances based on actual locations for demo purposes
  if (currentLocation.includes("Atlanta") && pickupLocation.includes("Nashville")) {
    distance1 = 250; // Atlanta to Nashville approx.
  } else if (currentLocation.includes("Chicago") && pickupLocation.includes("Detroit")) {
    distance1 = 280; // Chicago to Detroit approx.
  }
  
  if (pickupLocation.includes("Nashville") && dropoffLocation.includes("Chicago")) {
    distance2 = 475; // Nashville to Chicago approx.
  } else if (pickupLocation.includes("Detroit") && dropoffLocation.includes("New York")) {
    distance2 = 615; // Detroit to New York approx.
  }
  
  const totalDistance = distance1 + distance2;
  const averageSpeed = HOS_CONSTANTS.AVERAGE_SPEED; // Using 65mph from constants
  
  const segment1DrivingTime = Math.round(distance1 / averageSpeed * 60); // minutes
  const segment2DrivingTime = Math.round(distance2 / averageSpeed * 60); // minutes
  const totalDrivingTime = segment1DrivingTime + segment2DrivingTime;
  
  // Determine if trip requires multiple days based on total driving time and available hours
  const availableMinutes = parseInt(availableDrivingHours) * 60;
  const multiDayTrip = totalDrivingTime > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60 || totalDrivingTime > availableMinutes;
  
  // Calculate daily miles for multi-day trips
  let dailyMiles: number[] = [];
  if (multiDayTrip) {
    // Day 1: Current to pickup + part of pickup to dropoff
    const secondSegmentPortion = Math.round(distance2 * 0.75);
    const day1Miles = distance1 + secondSegmentPortion;
    const day2Miles = totalDistance - day1Miles;
    dailyMiles = [day1Miles, day2Miles];
  } else {
    dailyMiles = [totalDistance];
  }
  
  // Create segments
  const segments: RouteSegment[] = [
    {
      startLocation: currentLocation,
      endLocation: pickupLocation,
      distance: distance1,
      estimatedDrivingTime: segment1DrivingTime
    },
    {
      startLocation: pickupLocation,
      endLocation: dropoffLocation,
      distance: distance2,
      estimatedDrivingTime: segment2DrivingTime
    }
  ];
  
  // Create rest stops
  const restStops: RestStop[] = [
    {
      location: calculateMidpoint(currentLocation, pickupLocation),
      type: "fuel",
      duration: "30 min",
      arrivalTime: "12:15 PM",
      departureTime: "12:45 PM",
      stopReason: "Fuel stop"
    }
  ];
  
  // Add mandatory break if driving time exceeds 8 hours
  if (totalDrivingTime > HOS_CONSTANTS.MAX_DRIVING_BEFORE_BREAK * 60) {
    restStops.push({
      location: calculateRestPoint(pickupLocation, dropoffLocation, 0.3),
      type: "food",
      duration: "30 min",
      arrivalTime: "3:30 PM",
      departureTime: "4:00 PM",
      stopReason: "Mandatory 30-minute break after 8 hours driving"
    });
  }
  
  // Add overnight rest for multi-day trips
  if (multiDayTrip) {
    restStops.push({
      location: calculateRestPoint(pickupLocation, dropoffLocation, 0.75),
      type: "rest",
      duration: "10 hours",
      arrivalTime: "7:45 PM",
      departureTime: "5:45 AM",
      stopReason: "Required 10-hour rest period after 11 hours driving"
    });
  }
  
  // Check HOS compliance
  const hosCompliant = parseInt(availableDrivingHours) >= Math.ceil(totalDrivingTime / 60);
  const violations = !hosCompliant ? 
    [`Trip requires ${(totalDrivingTime / 60).toFixed(1)} hours of driving, but only ${availableDrivingHours} hours available.`] : 
    [];
  
  return {
    segments,
    restStops,
    totalDistance,
    totalDrivingTime,
    hosCompliant,
    violations,
    multiDayTrip,
    dailyMiles
  };
};

/**
 * Calculate an approximate midpoint for a stop between two locations
 */
const calculateMidpoint = (location1: string, location2: string): string => {
  // For demonstration purposes, generate a plausible midpoint location
  // In a real application, this would use actual geolocation data
  
  // Extract city names for demonstration
  const city1 = location1.split(',')[0].trim();
  const city2 = location2.split(',')[0].trim();
  
  // Common midpoint cities between major routes
  if ((city1 === "Atlanta" && city2 === "Nashville") || (city2 === "Atlanta" && city1 === "Nashville")) {
    return "Chattanooga, TN";
  } else if ((city1 === "Chicago" && city2 === "Detroit") || (city2 === "Chicago" && city1 === "Detroit")) {
    return "Kalamazoo, MI";
  } else if ((city1 === "Nashville" && city2 === "Chicago") || (city2 === "Nashville" && city1 === "Chicago")) {
    return "Louisville, KY";
  }
  
  // Generic fallback
  return "Midpoint City";
};

/**
 * Calculate a rest point along a route at a certain percentage of the journey
 */
const calculateRestPoint = (location1: string, location2: string, percentage: number): string => {
  // For demonstration purposes, generate a plausible rest point
  // In a real application, this would use actual geolocation data
  
  // Extract city names for demonstration
  const city1 = location1.split(',')[0].trim();
  const city2 = location2.split(',')[0].trim();
  
  // Common rest points between major routes
  if ((city1 === "Nashville" && city2 === "Chicago") || (city2 === "Nashville" && city1 === "Chicago")) {
    if (percentage < 0.5) return "Louisville, KY";
    return "Indianapolis, IN";
  } else if ((city1 === "Detroit" && city2 === "New York") || (city2 === "Detroit" && city1 === "New York")) {
    if (percentage < 0.5) return "Cleveland, OH";
    return "Scranton, PA";
  }
  
  // Generic fallback
  return percentage < 0.5 ? "Rest Point A" : "Rest Point B";
};
