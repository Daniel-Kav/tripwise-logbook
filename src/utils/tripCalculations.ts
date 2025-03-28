
// Interface for trip details
export interface TripDetails {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycle: string;
  availableDrivingHours: string;
}

// Interface for a route segment
export interface RouteSegment {
  startLocation: string;
  endLocation: string;
  distance: number; // in miles
  estimatedDrivingTime: number; // in minutes
}

// Interface for a rest stop
export interface RestStop {
  location: string;
  type: 'rest' | 'fuel' | 'food';
  duration: string;
  arrivalTime: string;
  departureTime: string;
  stopReason: string;
}

// Interface for a log entry
export interface LogEntry {
  startTime: string;
  endTime: string;
  status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper';
  location: string;
  remarks?: string;
}

// Interface for daily logs
export interface DailyLog {
  date: string;
  startLocation: string;
  endLocation: string;
  logs: LogEntry[];
  totalMiles: number; // Added to track miles per day
}

// Constants for HOS regulations
export const HOS_CONSTANTS = {
  MAX_DRIVING_HOURS: 11, // Maximum driving hours in a day
  MAX_ON_DUTY_HOURS: 14, // Maximum on-duty hours in a day
  MIN_OFF_DUTY_HOURS: 10, // Minimum off-duty hours between shifts
  REQUIRED_BREAK_MINUTES: 30, // Required break duration
  MAX_DRIVING_BEFORE_BREAK: 8, // Maximum driving hours before requiring a break
  FUEL_STOP_FREQUENCY: 1000, // Miles between fuel stops
  AVERAGE_SPEED: 65, // Average speed in mph (updated from 60 to 65)
  PICKUP_DROPOFF_TIME: 60, // Minutes for pickup and dropoff
  CYCLE_70_HOUR_LIMIT: 70, // Hour limit for 70-hour/8-day cycle
  CYCLE_60_HOUR_LIMIT: 60, // Hour limit for 60-hour/7-day cycle
};

/**
 * Calculate the route segments from origin to destination, including pickup and dropoff
 * This is a simplified implementation - in a real application, you would use a mapping API
 */
export const calculateRouteSegments = (
  currentLocation: string,
  pickupLocation: string,
  dropoffLocation: string
): RouteSegment[] => {
  // For demonstration, we'll create some mock segments
  // In a real implementation, this would call a mapping API
  
  // Updated to use 65mph average speed
  const segments: RouteSegment[] = [
    {
      startLocation: currentLocation,
      endLocation: pickupLocation,
      distance: 150, // miles
      estimatedDrivingTime: Math.round(150 / HOS_CONSTANTS.AVERAGE_SPEED * 60), // minutes using 65mph average
    },
    {
      startLocation: pickupLocation,
      endLocation: dropoffLocation,
      distance: 575, // miles
      estimatedDrivingTime: Math.round(575 / HOS_CONSTANTS.AVERAGE_SPEED * 60), // minutes using 65mph average
    },
  ];
  
  return segments;
};

/**
 * Calculate required rest stops based on HOS regulations
 */
export const calculateRestStops = (
  segments: RouteSegment[],
  availableDrivingHours: number
): RestStop[] => {
  const restStops: RestStop[] = [];
  
  // Updated time calculations based on 65mph average speed
  // Mock implementation for demonstration
  
  // Example fuel stop
  restStops.push({
    location: "Chattanooga, TN",
    type: "fuel",
    duration: "30 min",
    arrivalTime: "12:15 PM",
    departureTime: "12:45 PM",
    stopReason: "Fuel stop"
  });
  
  // Example mandatory break
  restStops.push({
    location: "Louisville, KY",
    type: "food",
    duration: "30 min",
    arrivalTime: "3:30 PM",
    departureTime: "4:00 PM",
    stopReason: "Mandatory 30-minute break after 8 hours driving"
  });
  
  // Example rest stop for multi-day trip
  if (getTotalDrivingTime(segments) > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60) {
    restStops.push({
      location: "Indianapolis, IN",
      type: "rest",
      duration: "10 hours",
      arrivalTime: "7:45 PM",
      departureTime: "5:45 AM",
      stopReason: "Required 10-hour rest period after 11 hours driving"
    });
  }
  
  return restStops;
};

/**
 * Calculate the total driving time in minutes
 */
export const getTotalDrivingTime = (segments: RouteSegment[]): number => {
  return segments.reduce((total, segment) => total + segment.estimatedDrivingTime, 0);
};

/**
 * Calculate the total distance in miles
 */
export const getTotalDistance = (segments: RouteSegment[]): number => {
  return segments.reduce((total, segment) => total + segment.distance, 0);
};

/**
 * Generate ELD logs based on the trip details
 */
export const generateELDLogs = (
  tripDetails: TripDetails,
  segments: RouteSegment[],
  restStops: RestStop[]
): DailyLog[] => {
  const dailyLogs: DailyLog[] = [];
  const totalTripDistance = getTotalDistance(segments);
  
  // Calculate how to distribute miles across days
  const multiDayTrip = getTotalDrivingTime(segments) > HOS_CONSTANTS.MAX_DRIVING_HOURS * 60;
  
  // For multi-day trip, split mileage appropriately between days
  // First day includes distance from current location to pickup and partial distance to dropoff
  // Second day includes remaining distance to dropoff
  let day1Miles = 0;
  let day2Miles = 0;
  
  if (multiDayTrip) {
    // First segment is current location to pickup
    day1Miles = segments[0].distance; // 150 miles from current to pickup
    
    // Add portion of second segment up to rest point (approximately 3/4 of the second segment)
    const secondSegmentPortion = Math.round(segments[1].distance * 0.75); // ~430 miles 
    day1Miles += secondSegmentPortion;
    
    // Second day is remainder of trip
    day2Miles = totalTripDistance - day1Miles; // ~145 miles
  } else {
    day1Miles = totalTripDistance; // All miles on day 1 for single-day trip
  }
  
  // Example log for day 1
  dailyLogs.push({
    date: "2023-06-15",
    startLocation: tripDetails.currentLocation,
    endLocation: multiDayTrip ? restStops[restStops.length - 1].location : tripDetails.dropoffLocation,
    totalMiles: day1Miles,
    logs: [
      {
        startTime: "00:00",
        endTime: "05:45",
        status: "off-duty",
        location: tripDetails.currentLocation,
        remarks: "Off duty"
      },
      {
        startTime: "05:45",
        endTime: "06:00",
        status: "on-duty",
        location: tripDetails.currentLocation,
        remarks: "Pre-trip inspection"
      },
      {
        startTime: "06:00",
        endTime: "08:45",
        status: "driving",
        location: `${tripDetails.currentLocation} to ${restStops[0].location}`,
        remarks: "En route"
      },
      {
        startTime: "08:45",
        endTime: "09:15",
        status: "on-duty",
        location: restStops[0].location,
        remarks: "Fuel stop"
      },
      {
        startTime: "09:15",
        endTime: "12:30",
        status: "driving",
        location: `${restStops[0].location} to ${restStops[1].location}`,
        remarks: "En route"
      },
      {
        startTime: "12:30",
        endTime: "13:00",
        status: "off-duty",
        location: restStops[1].location,
        remarks: "Mandatory break"
      },
      {
        startTime: "13:00",
        endTime: "17:45",
        status: "driving",
        location: `${restStops[1].location} to ${restStops[2].location}`,
        remarks: "En route"
      },
      {
        startTime: "17:45",
        endTime: "19:45",
        status: "on-duty",
        location: restStops[2].location,
        remarks: "Waiting at shipper"
      },
      {
        startTime: "19:45",
        endTime: "24:00",
        status: "sleeper",
        location: restStops[2].location,
        remarks: "10-hour rest period"
      }
    ]
  });
  
  // If the trip requires more than one day, add a second day
  if (multiDayTrip) {
    dailyLogs.push({
      date: "2023-06-16",
      startLocation: restStops[2].location,
      endLocation: tripDetails.dropoffLocation,
      totalMiles: day2Miles,
      logs: [
        {
          startTime: "00:00",
          endTime: "05:45",
          status: "sleeper",
          location: restStops[2].location,
          remarks: "Continued 10-hour rest period"
        },
        {
          startTime: "05:45",
          endTime: "06:00",
          status: "on-duty",
          location: restStops[2].location,
          remarks: "Pre-trip inspection"
        },
        {
          startTime: "06:00",
          endTime: "09:30",
          status: "driving",
          location: `${restStops[2].location} to ${tripDetails.dropoffLocation}`,
          remarks: "En route"
        },
        {
          startTime: "09:30",
          endTime: "10:30",
          status: "on-duty",
          location: tripDetails.dropoffLocation,
          remarks: "Unloading at receiver"
        },
        {
          startTime: "10:30",
          endTime: "24:00",
          status: "off-duty",
          location: tripDetails.dropoffLocation,
          remarks: "Off duty"
        }
      ]
    });
  }
  
  return dailyLogs;
};

/**
 * Check if a trip is compliant with HOS regulations
 */
export const checkHOSCompliance = (
  tripDetails: TripDetails,
  segments: RouteSegment[]
): { isCompliant: boolean; violations: string[] } => {
  const violations: string[] = [];
  const totalDrivingMinutes = getTotalDrivingTime(segments);
  const totalDrivingHours = totalDrivingMinutes / 60;
  
  // Check available driving hours
  const availableDrivingHours = parseInt(tripDetails.availableDrivingHours);
  if (totalDrivingHours > availableDrivingHours) {
    violations.push(`Trip requires ${totalDrivingHours.toFixed(1)} hours of driving, but only ${availableDrivingHours} hours available.`);
  }
  
  // Check cycle limits
  if (tripDetails.currentCycle === '70-hour/8-day' && totalDrivingHours > HOS_CONSTANTS.CYCLE_70_HOUR_LIMIT) {
    violations.push(`Trip exceeds 70-hour/8-day cycle limit.`);
  } else if (tripDetails.currentCycle === '60-hour/7-day' && totalDrivingHours > HOS_CONSTANTS.CYCLE_60_HOUR_LIMIT) {
    violations.push(`Trip exceeds 60-hour/7-day cycle limit.`);
  }
  
  return {
    isCompliant: violations.length === 0,
    violations
  };
};

/**
 * Format a duration in minutes to a human-readable string
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} h`;
  } else {
    return `${hours} h ${mins} min`;
  }
};
