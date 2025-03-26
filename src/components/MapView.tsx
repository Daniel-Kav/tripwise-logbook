
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Map, Route, Navigation, Clock, Bed, Coffee, 
  Plus, Minus, FileText, Truck, AlertTriangle, Fuel 
} from 'lucide-react';

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

const MapView = ({ 
  startLocation, 
  endLocation, 
  restStops = [],
  onGenerateLogs
}: MapViewProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  // This would be replaced with actual map integration
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Simulate map loading
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.classList.remove('before:opacity-100');
        mapRef.current.classList.add('before:opacity-0');
      }
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [startLocation, endLocation]);

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
          className="h-96 bg-gray-100 relative before:absolute before:inset-0 before:bg-gray-50 before:flex before:items-center before:justify-center before:transition-opacity before:duration-500 before:opacity-100 before:z-10"
          style={{
            backgroundImage: "url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/pin-s+0061ff(${startLng},${startLat}),pin-s+0061ff(${endLng},${endLat})/auto/500x300?access_token=pk.sample')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:to-white/30 before:pointer-events-none"></div>
          
          {/* Map controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2 z-10">
            <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm">
              <Plus className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="outline" className="h-8 w-8 bg-white shadow-sm">
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
