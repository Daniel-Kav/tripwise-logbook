
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Map, Route, Navigation, Clock, Bed, Coffee, 
  Plus, Minus, FileText, Truck, AlertTriangle, Fuel 
} from 'lucide-react';
import * as ol from 'ol';
import { fromLonLat } from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import LineString from 'ol/geom/LineString';
import Point from 'ol/geom/Point';
import { Circle as CircleStyle, Fill, Stroke, Style, Text, Icon } from 'ol/style';
import 'ol/ol.css';

interface MapViewProps {
  startLocation: string;
  endLocation: string;
  restStops?: { 
    location: string; 
    type: 'rest' | 'fuel' | 'food'; 
    duration: string;
    arrivalTime: string;
    departureTime: string;
  }[];
  onGenerateLogs?: () => void;
}

// Helper function to get coordinates from location names
// In a real app, you would use a geocoding service
const getCoordinates = (location: string): [number, number] => {
  // This is a simple mock implementation
  // Returns dummy coordinates based on location names
  const locations: Record<string, [number, number]> = {
    'Atlanta, GA': [-84.39, 33.75],
    'Nashville, TN': [-86.78, 36.16],
    'Chicago, IL': [-87.63, 41.88],
    'St. Louis, MO': [-90.20, 38.63],
    'Indianapolis, IN': [-86.15, 39.77],
    'Louisville, KY': [-85.76, 38.25],
    'Columbus, OH': [-83.00, 39.96],
    'Cincinnati, OH': [-84.51, 39.10],
    'Dallas, TX': [-96.80, 32.78],
    'Houston, TX': [-95.37, 29.76],
    'Memphis, TN': [-90.05, 35.15],
    'New Orleans, LA': [-90.07, 29.95],
    'Miami, FL': [-80.19, 25.76],
    'Orlando, FL': [-81.38, 28.54],
    'Tampa, FL': [-82.46, 27.95],
    'Detroit, MI': [-83.05, 42.33],
    'Milwaukee, WI': [-87.91, 43.04],
    'Minneapolis, MN': [-93.27, 44.98],
    'Kansas City, MO': [-94.58, 39.10],
    'Denver, CO': [-104.99, 39.74],
    'Phoenix, AZ': [-112.07, 33.45],
    'Las Vegas, NV': [-115.14, 36.17],
    'Los Angeles, CA': [-118.24, 34.05],
    'San Francisco, CA': [-122.42, 37.77],
    'Portland, OR': [-122.68, 45.52],
    'Seattle, WA': [-122.33, 47.61],
    'Boston, MA': [-71.06, 42.36],
    'New York, NY': [-74.01, 40.71],
    'Philadelphia, PA': [-75.17, 39.95],
    'Washington, DC': [-77.04, 38.91],
  };

  // Return default coordinates if location is not found
  return locations[location] || [-98.58, 39.83]; // Center of US as default
};

// Create a style for route line
const routeStyle = new Style({
  stroke: new Stroke({
    color: '#0061ff',
    width: 4,
  }),
});

// Create styles for different stop types
const stopStyles: Record<string, Style> = {
  rest: new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#4a88ef' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
    text: new Text({
      font: '12px Helvetica',
      fill: new Fill({ color: '#000' }),
      padding: [5, 5, 5, 5],
      offsetY: -18,
      stroke: new Stroke({ color: '#fff', width: 3 }),
    }),
  }),
  fuel: new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#10b981' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
    text: new Text({
      font: '12px Helvetica',
      fill: new Fill({ color: '#000' }),
      padding: [5, 5, 5, 5],
      offsetY: -18,
      stroke: new Stroke({ color: '#fff', width: 3 }),
    }),
  }),
  food: new Style({
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#f59e0b' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
    text: new Text({
      font: '12px Helvetica',
      fill: new Fill({ color: '#000' }),
      padding: [5, 5, 5, 5],
      offsetY: -18,
      stroke: new Stroke({ color: '#fff', width: 3 }),
    }),
  }),
};

// Style for start/end locations
const locationStyle = new Style({
  image: new CircleStyle({
    radius: 10,
    fill: new Fill({ color: '#0061ff' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
  text: new Text({
    font: '12px Helvetica',
    fill: new Fill({ color: '#000' }),
    padding: [5, 5, 5, 5],
    offsetY: -20,
    stroke: new Stroke({ color: '#fff', width: 3 }),
  }),
});

const MapView = ({ 
  startLocation, 
  endLocation, 
  restStops = [],
  onGenerateLogs
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const olMapRef = useRef<ol.Map | null>(null);

  // Create route and markers
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Get coordinates
    const startCoords = getCoordinates(startLocation);
    const endCoords = getCoordinates(endLocation);
    
    // Convert to OpenLayers projection
    const startPoint = fromLonLat(startCoords);
    const endPoint = fromLonLat(endCoords);
    
    // Create route feature
    const routeCoordinates = [startPoint, endPoint];
    
    // Add intermediate points if we have rest stops
    const stopCoordinates = restStops.map(stop => {
      const coords = getCoordinates(stop.location);
      return fromLonLat(coords);
    });

    // Add stop coordinates between start and end for route line
    if (stopCoordinates.length > 0) {
      routeCoordinates.splice(1, 0, ...stopCoordinates);
    }
    
    const routeFeature = new Feature({
      geometry: new LineString(routeCoordinates),
      name: 'Route',
    });
    
    routeFeature.setStyle(routeStyle);
    
    // Create vector source and layer for route
    const routeSource = new VectorSource({
      features: [routeFeature],
    });
    
    const routeLayer = new VectorLayer({
      source: routeSource,
    });
    
    // Create markers for start and end locations
    const startFeature = new Feature({
      geometry: new Point(startPoint),
      name: startLocation,
      type: 'location',
      isStart: true,
    });
    
    const endFeature = new Feature({
      geometry: new Point(endPoint),
      name: endLocation,
      type: 'location',
      isEnd: true,
    });
    
    // Set styles for start/end features
    const startStyle = locationStyle.clone();
    startStyle.getText().setText('Start: ' + startLocation);
    startFeature.setStyle(startStyle);
    
    const endStyle = locationStyle.clone();
    endStyle.getText().setText('End: ' + endLocation);
    endFeature.setStyle(endStyle);
    
    // Create features for rest stops
    const stopFeatures = restStops.map((stop, index) => {
      const coords = getCoordinates(stop.location);
      const feature = new Feature({
        geometry: new Point(fromLonLat(coords)),
        name: stop.location,
        type: stop.type,
        duration: stop.duration,
        arrivalTime: stop.arrivalTime,
        departureTime: stop.departureTime,
        index,
      });
      
      // Set style based on stop type
      const stopStyle = stopStyles[stop.type].clone();
      stopStyle.getText().setText(stop.location);
      feature.setStyle(stopStyle);
      
      return feature;
    });
    
    // Create vector source and layer for markers
    const markerSource = new VectorSource({
      features: [startFeature, endFeature, ...stopFeatures],
    });
    
    const markerLayer = new VectorLayer({
      source: markerSource,
    });
    
    // Create map
    olMapRef.current = new ol.Map({
      target: mapRef.current,
      layers: [
        // Base tile layer (OpenStreetMap)
        new TileLayer({
          source: new OSM(),
        }),
        routeLayer,
        markerLayer,
      ],
      view: new ol.View({
        center: fromLonLat([-95.7129, 37.0902]), // Center of US
        zoom: 4,
      }),
      controls: ol.control.defaults({
        zoom: false,
        rotate: false,
        attribution: false,
      }),
    });
    
    // Fit map to route extent with padding
    const routeExtent = routeSource.getExtent();
    olMapRef.current.getView().fit(routeExtent, {
      padding: [50, 50, 50, 50],
      maxZoom: 12,
    });
    
    // Add click event for markers
    olMapRef.current.on('click', (event) => {
      const feature = olMapRef.current?.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );
      
      if (feature) {
        const type = feature.get('type');
        const name = feature.get('name');
        
        if (type === 'location') {
          alert(`Location: ${name}`);
        } else if (type === 'rest' || type === 'fuel' || type === 'food') {
          const duration = feature.get('duration');
          const arrival = feature.get('arrivalTime');
          const departure = feature.get('departureTime');
          alert(`Stop: ${name}\nType: ${type}\nDuration: ${duration}\nArrival: ${arrival}\nDeparture: ${departure}`);
        }
      }
    });
    
    // Clean up
    return () => {
      if (olMapRef.current) {
        olMapRef.current.setTarget(undefined);
        olMapRef.current = null;
      }
    };
  }, [startLocation, endLocation, restStops]);

  // Handle zoom in/out
  const handleZoomIn = () => {
    if (olMapRef.current) {
      const view = olMapRef.current.getView();
      const zoom = view.getZoom() || 0;
      view.animate({
        zoom: zoom + 1,
        duration: 250,
      });
    }
  };

  const handleZoomOut = () => {
    if (olMapRef.current) {
      const view = olMapRef.current.getView();
      const zoom = view.getZoom() || 0;
      view.animate({
        zoom: Math.max(zoom - 1, 1),
        duration: 250,
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center">
          <Map className="h-5 w-5 text-primary mr-2" />
          <h3 className="font-medium text-gray-900">Route Overview</h3>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Truck className="h-4 w-4 mr-1" />
          <span>{startLocation} to {endLocation}</span>
        </div>
      </div>
      
      <div className="relative">
        <div 
          ref={mapRef}
          className="h-96 bg-gray-100 relative"
        >
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
            <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm" onClick={handleZoomIn}>
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm" onClick={handleZoomOut}>
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Route summary overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-gray-100 max-w-xs z-10">
            <div className="flex items-center text-sm font-medium text-gray-900 mb-2">
              <Route className="h-4 w-4 text-primary mr-2" />
              Route Summary
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center text-gray-600">
                <Navigation className="h-3 w-3 mr-1" />
                Distance: 725 mi
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="h-3 w-3 mr-1" />
                Drive Time: 10h 45m
              </div>
              <div className="flex items-center text-gray-600">
                <Bed className="h-3 w-3 mr-1" />
                Rest Stops: {restStops.filter(s => s.type === 'rest').length}
              </div>
              <div className="flex items-center text-gray-600">
                <Fuel className="h-3 w-3 mr-1" />
                Fuel Stops: {restStops.filter(s => s.type === 'fuel').length}
              </div>
            </div>
          </div>
          
          {/* FMCSA compliance alert */}
          <div className="absolute bottom-4 right-4 bg-amber-50/90 backdrop-blur-sm p-3 rounded-lg shadow-sm border border-amber-100 max-w-xs z-10">
            <div className="flex items-center text-sm font-medium text-amber-800 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-500 mr-1" />
              HOS Compliance Alert
            </div>
            <p className="text-xs text-amber-700">
              This route requires a mandatory 30-minute break after 8 hours of driving. Required rest stops have been added to your route.
            </p>
          </div>
        </div>
      </div>
      
      {/* Rest stops details */}
      <div className="p-4 border-t border-gray-100">
        <h4 className="font-medium text-sm text-gray-900 mb-3 flex items-center">
          <Clock className="h-4 w-4 text-primary mr-2" />
          Required Stops & Breaks
        </h4>
        
        <div className="space-y-3">
          {restStops.map((stop, index) => (
            <div key={index} className="flex items-start p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
              {stop.type === 'rest' && <Bed className="h-4 w-4 text-blue-500 mt-1 mr-3 flex-shrink-0" />}
              {stop.type === 'fuel' && <Fuel className="h-4 w-4 text-green-500 mt-1 mr-3 flex-shrink-0" />}
              {stop.type === 'food' && <Coffee className="h-4 w-4 text-amber-500 mt-1 mr-3 flex-shrink-0" />}
              
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-900">{stop.location}</span>
                  <span className="text-xs text-gray-500">{stop.duration}</span>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  Arrive: {stop.arrivalTime} • Depart: {stop.departureTime}
                </div>
              </div>
            </div>
          ))}
          
          {restStops.length === 0 && (
            <div className="text-sm text-gray-500 italic text-center py-2">
              No rest stops required for this route
            </div>
          )}
        </div>
      </div>
      
      {onGenerateLogs && (
        <div className="p-4 border-t border-gray-100">
          <Button 
            onClick={onGenerateLogs} 
            className="w-full flex items-center justify-center hover-lift"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate ELD Logs
          </Button>
        </div>
      )}
    </div>
  );
};

export default MapView;
