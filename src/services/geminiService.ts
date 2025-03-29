import { TripDetails, RouteSegment, RestStop, HOS_CONSTANTS } from '@/utils/tripCalculations';

// Gemini API endpoint - in a real app, this would be an environment variable
const GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

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
  if (!API_KEY) {
    throw new Error("Gemini API key is not configured");
  }

  console.log("Sending request to Gemini API for route calculation...");
  
  try {
    // Create prompt for Gemini
    const prompt = createGeminiPrompt(tripDetails);
    
    // Make actual API call to Gemini
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(createGeminiRequest(prompt))
    });

    // Log the raw response for debugging
    console.log("Raw API Response:", response);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error response:", errorText);
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Parsed API Response:", data);

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error("Invalid API response structure:", data);
      throw new Error("Invalid response format from Gemini API");
    }

    return parseGeminiResponse(data, tripDetails);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // For development/testing, return mock data if API fails
    if (import.meta.env.DEV) {
      console.log("Returning mock data for development");
      return getMockGeminiResponse(tripDetails);
    }
    throw new Error("Failed to calculate route using Gemini. Please try again.");
  }
};

/**
 * Create a prompt for Gemini based on trip details
 */
const createGeminiPrompt = (tripDetails: TripDetails): string => {
  return `
    Calculate a detailed truck route plan following FMCSA Hours of Service regulations.
    
    Trip Details:
    - Current location: ${tripDetails.currentLocation}
    - Pickup location: ${tripDetails.pickupLocation}
    - Dropoff location: ${tripDetails.dropoffLocation}
    - Current HOS cycle: ${tripDetails.currentCycle}
    - Available driving hours: ${tripDetails.availableDrivingHours}

    HOS Regulations to Follow:
    1. Maximum 11 hours driving in a day
    2. Maximum 14 hours on-duty in a day
    3. Minimum 10 hours off-duty between shifts
    4. Required 30-minute break after 8 hours of driving
    5. Must take a 10-hour break after 11 hours of driving

    Please provide a JSON response with the following structure:
    {
      "segments": [
        {
          "startLocation": "string",
          "endLocation": "string",
          "distance": number (miles),
          "estimatedDrivingTime": number (minutes)
        }
      ],
      "restStops": [
        {
          "location": "string",
          "type": "rest" | "fuel" | "food",
          "duration": "string",
          "arrivalTime": "string (HH:MM AM/PM)",
          "departureTime": "string (HH:MM AM/PM)",
          "stopReason": "string"
        }
      ],
      "totalDistance": number (miles),
      "totalDrivingTime": number (minutes),
      "hosCompliant": boolean,
      "violations": string[],
      "multiDayTrip": boolean,
      "dailyMiles": number[]
    }

    Calculate realistic distances and times based on:
    - Average speed: 65 mph
    - Traffic conditions
    - Required breaks
    - HOS compliance

    Ensure all times are properly formatted and calculations follow HOS regulations.
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
const parseGeminiResponse = (response: GeminiResponse, tripDetails: TripDetails): GeminiRouteData => {
  try {
    // Extract the text content from the response
    const textContent = response.candidates[0].content.parts[0].text;
    
    // Find the JSON object in the response
    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    // Parse the JSON data
    const data = JSON.parse(jsonMatch[0]);

    // Validate the response data
    validateResponseData(data);

    // Calculate additional HOS compliance checks
    const hosCompliant = calculateHOSCompliance(data, tripDetails);
    const violations = calculateViolations(data, tripDetails);

    return {
      ...data,
      hosCompliant,
      violations
    };
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    throw new Error("Failed to parse route data from Gemini. Please try again.");
  }
};

/**
 * Validate the response data structure
 */
const validateResponseData = (data: any): void => {
  const requiredFields = [
    'segments',
    'restStops',
    'totalDistance',
    'totalDrivingTime',
    'multiDayTrip',
    'dailyMiles'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Validate segments
  if (!Array.isArray(data.segments)) {
    throw new Error("Segments must be an array");
  }

  // Validate rest stops
  if (!Array.isArray(data.restStops)) {
    throw new Error("Rest stops must be an array");
  }

  // Validate numeric fields
  if (typeof data.totalDistance !== 'number' || data.totalDistance <= 0) {
    throw new Error("Invalid total distance");
  }
  if (typeof data.totalDrivingTime !== 'number' || data.totalDrivingTime <= 0) {
    throw new Error("Invalid total driving time");
  }
};

/**
 * Calculate HOS compliance based on the route data
 */
const calculateHOSCompliance = (data: any, tripDetails: TripDetails): boolean => {
  const availableMinutes = parseInt(tripDetails.availableDrivingHours) * 60;
  
  // Check if total driving time exceeds available hours
  if (data.totalDrivingTime > availableMinutes) {
    return false;
  }

  // Check if any single day exceeds HOS limits
  const dailyDrivingTimes = calculateDailyDrivingTimes(data);
  for (const drivingTime of dailyDrivingTimes) {
    if (drivingTime > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60) {
      return false;
    }
  }

  // Check if rest breaks are properly scheduled
  const hasProperBreaks = checkRestBreaks(data.restStops);
  if (!hasProperBreaks) {
    return false;
  }

  return true;
};

/**
 * Calculate driving times for each day
 */
const calculateDailyDrivingTimes = (data: any): number[] => {
  const dailyTimes: number[] = [];
  let currentDayTime = 0;
  
  for (const segment of data.segments) {
    currentDayTime += segment.estimatedDrivingTime;
    
    // If we exceed 11 hours, start a new day
    if (currentDayTime > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60) {
      dailyTimes.push(HOS_CONSTANTS.MAX_DRIVING_HOURS * 60);
      currentDayTime = segment.estimatedDrivingTime;
    }
  }
  
  // Add the last day's time
  if (currentDayTime > 0) {
    dailyTimes.push(currentDayTime);
  }
  
  return dailyTimes;
};

/**
 * Check if rest breaks are properly scheduled
 */
const checkRestBreaks = (restStops: RestStop[]): boolean => {
  let hasTenHourBreak = false;
  let hasThirtyMinBreak = false;
  let currentDrivingTime = 0;

  for (const stop of restStops) {
    if (stop.type === 'rest' && stop.duration === '10 hours') {
      hasTenHourBreak = true;
    }
    
    if (stop.type === 'food' && stop.duration === '30 min') {
      hasThirtyMinBreak = true;
    }
  }

  return hasTenHourBreak && hasThirtyMinBreak;
};

/**
 * Calculate HOS violations
 */
const calculateViolations = (data: any, tripDetails: TripDetails): string[] => {
  const violations: string[] = [];
  const availableMinutes = parseInt(tripDetails.availableDrivingHours) * 60;

  // Check available hours
  if (data.totalDrivingTime > availableMinutes) {
    violations.push(`Trip requires ${(data.totalDrivingTime / 60).toFixed(1)} hours of driving, but only ${tripDetails.availableDrivingHours} hours available.`);
  }

  // Check daily driving limits
  const dailyDrivingTimes = calculateDailyDrivingTimes(data);
  dailyDrivingTimes.forEach((time, index) => {
    if (time > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60) {
      violations.push(`Day ${index + 1} exceeds maximum driving time of 11 hours.`);
    }
  });

  // Check rest breaks
  const restStops = data.restStops;
  const hasTenHourBreak = restStops.some(stop => stop.type === 'rest' && stop.duration === '10 hours');
  const hasThirtyMinBreak = restStops.some(stop => stop.type === 'food' && stop.duration === '30 min');

  if (!hasTenHourBreak) {
    violations.push("Missing required 10-hour rest break.");
  }
  if (!hasThirtyMinBreak) {
    violations.push("Missing required 30-minute break after 8 hours of driving.");
  }

  return violations;
};

/**
 * Generate mock response data for development/testing
 */
const getMockGeminiResponse = (tripDetails: TripDetails): GeminiRouteData => {
  // Calculate distances based on locations
  const distance1 = 250; // Default distance from current to pickup
  const distance2 = 475; // Default distance from pickup to dropoff
  const totalDistance = distance1 + distance2;
  const averageSpeed = 65; // mph
  
  const segment1DrivingTime = Math.round(distance1 / averageSpeed * 60); // minutes
  const segment2DrivingTime = Math.round(distance2 / averageSpeed * 60); // minutes
  const totalDrivingTime = segment1DrivingTime + segment2DrivingTime;
  
  // Create segments
  const segments: RouteSegment[] = [
    {
      startLocation: tripDetails.currentLocation,
      endLocation: tripDetails.pickupLocation,
      distance: distance1,
      estimatedDrivingTime: segment1DrivingTime
    },
    {
      startLocation: tripDetails.pickupLocation,
      endLocation: tripDetails.dropoffLocation,
      distance: distance2,
      estimatedDrivingTime: segment2DrivingTime
    }
  ];
  
  // Create rest stops
  const restStops: RestStop[] = [
    {
      location: "Chattanooga, TN",
      type: "fuel",
      duration: "30 min",
      arrivalTime: "12:15 PM",
      departureTime: "12:45 PM",
      stopReason: "Fuel stop"
    },
    {
      location: "Louisville, KY",
      type: "food",
      duration: "30 min",
      arrivalTime: "3:30 PM",
      departureTime: "4:00 PM",
      stopReason: "Mandatory 30-minute break"
    },
    {
      location: "Indianapolis, IN",
      type: "rest",
      duration: "10 hours",
      arrivalTime: "7:45 PM",
      departureTime: "5:45 AM",
      stopReason: "Required 10-hour rest period"
    }
  ];
  
  // Determine if trip requires multiple days
  const multiDayTrip = totalDrivingTime > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60;
  
  // Calculate daily miles
  const dailyMiles = multiDayTrip ? [distance1 + distance2 * 0.6, distance2 * 0.4] : [totalDistance];
  
  return {
    segments,
    restStops,
    totalDistance,
    totalDrivingTime,
    hosCompliant: true,
    violations: [],
    multiDayTrip,
    dailyMiles
  };
};
