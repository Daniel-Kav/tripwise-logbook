import { TripDetails, RouteSegment, RestStop, HOS_CONSTANTS } from '@/utils/tripCalculations';

const OSRM_API_URL = 'http://router.project-osrm.org/route/v1/driving';
const NOMINATIM_API_URL = 'https://nominatim.openstreetmap.org';

interface OSRMResponse {
  code: string;
  routes: {
    distance: number;
    duration: number;
    geometry: string;
    legs: {
      distance: number;
      duration: number;
      steps: {
        distance: number;
        duration: number;
        geometry: string;
      }[];
    }[];
  }[];
}

interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
}

export interface OSRMRouteData {
  totalDistance: number;
  totalDrivingTime: number;
  multiDayTrip: boolean;
  hosCompliant: boolean;
  violations: string[];
  segments: RouteSegment[];
  restStops: RestStop[];
  dailyMiles: number[];
}

/**
 * Convert address to coordinates using OpenStreetMap's Nominatim service
 */
const geocodeAddress = async (address: string): Promise<{ lat: number; lon: number }> => {
  try {
    const response = await fetch(
      `${NOMINATIM_API_URL}/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
          'User-Agent': 'TripWiseLogbook/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Geocoding failed');
    }
    
    const data: NominatimResponse[] = await response.json();
    if (!data.length) {
      throw new Error('No location found');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon)
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
};

/**
 * Calculate route between two points using OSRM
 */
const calculateRoute = async (
  start: { lat: number; lon: number },
  end: { lat: number; lon: number }
): Promise<{ distance: number; duration: number }> => {
  try {
    const response = await fetch(
      `${OSRM_API_URL}/${start.lon},${start.lat};${end.lon},${end.lat}?overview=full&geometries=geojson`
    );
    
    if (!response.ok) {
      throw new Error('Route calculation failed');
    }
    
    const data: OSRMResponse = await response.json();
    if (!data.routes.length) {
      throw new Error('No route found');
    }
    
    return {
      distance: data.routes[0].distance * 0.000621371, // Convert meters to miles
      duration: data.routes[0].duration / 60 // Convert seconds to minutes
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    throw error;
  }
};

/**
 * Calculate required stops based on distance and HOS rules
 */
const calculateRequiredStops = (
  totalDistance: number,
  totalDrivingTime: number,
  segments: RouteSegment[]
): RestStop[] => {
  const stops: RestStop[] = [];
  let currentDistance = 0;
  let currentDrivingTime = 0;
  
  // Add fuel stops every 1000 miles
  for (const segment of segments) {
    currentDistance += segment.distance;
    currentDrivingTime += segment.estimatedDrivingTime;
    
    // Fuel stop needed
    if (currentDistance >= 1000) {
      stops.push({
        type: 'fuel',
        location: segment.endLocation,
        arrivalTime: new Date(Date.now() + currentDrivingTime * 60000),
        departureTime: new Date(Date.now() + (currentDrivingTime + 30) * 60000),
        stopReason: 'Required fuel stop',
        duration: '30 minutes'
      });
      currentDistance = 0;
    }
    
    // 30-minute break needed after 8 hours of driving
    if (currentDrivingTime >= 8 * 60) {
      stops.push({
        type: 'food',
        location: segment.endLocation,
        arrivalTime: new Date(Date.now() + currentDrivingTime * 60000),
        departureTime: new Date(Date.now() + (currentDrivingTime + 30) * 60000),
        stopReason: 'Required 30-minute break after 8 hours of driving',
        duration: '30 minutes'
      });
      currentDrivingTime = 0;
    }
  }
  
  return stops;
};

/**
 * Calculate route details using OSRM
 */
export const calculateRouteWithOSRM = async (tripDetails: TripDetails): Promise<OSRMRouteData> => {
  try {
    // Geocode all locations
    const startCoords = await geocodeAddress(tripDetails.currentLocation);
    const pickupCoords = await geocodeAddress(tripDetails.pickupLocation);
    const dropoffCoords = await geocodeAddress(tripDetails.dropoffLocation);
    
    // Calculate route segments
    const startToPickup = await calculateRoute(startCoords, pickupCoords);
    const pickupToDropoff = await calculateRoute(pickupCoords, dropoffCoords);
    
    // Create route segments
    const segments: RouteSegment[] = [
      {
        startLocation: tripDetails.currentLocation,
        endLocation: tripDetails.pickupLocation,
        distance: startToPickup.distance,
        estimatedDrivingTime: startToPickup.duration,
        pickupOperation: true
      },
      {
        startLocation: tripDetails.pickupLocation,
        endLocation: tripDetails.dropoffLocation,
        distance: pickupToDropoff.distance,
        estimatedDrivingTime: pickupToDropoff.duration,
        dropoffOperation: true
      }
    ];
    
    // Calculate total distance and time
    const totalDistance = startToPickup.distance + pickupToDropoff.distance;
    const totalDrivingTime = startToPickup.duration + pickupToDropoff.duration;
    
    // Calculate required stops
    const restStops = calculateRequiredStops(totalDistance, totalDrivingTime, segments);
    
    // Determine if trip needs multiple days
    const multiDayTrip = totalDrivingTime > 11 * 60; // More than 11 hours of driving
    
    // Calculate daily miles if multi-day trip
    const dailyMiles = multiDayTrip 
      ? Array(Math.ceil(totalDrivingTime / (11 * 60))).fill(totalDistance / Math.ceil(totalDrivingTime / (11 * 60)))
      : [totalDistance];
    
    // Check HOS compliance
    const violations: string[] = [];
    if (totalDrivingTime > 11 * 60) {
      violations.push('Trip exceeds 11-hour driving limit');
    }
    if (totalDrivingTime > 14 * 60) {
      violations.push('Trip exceeds 14-hour on-duty window');
    }
    
    return {
      totalDistance,
      totalDrivingTime,
      multiDayTrip,
      hosCompliant: violations.length === 0,
      violations,
      segments,
      restStops,
      dailyMiles
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    throw error;
  }
}; 