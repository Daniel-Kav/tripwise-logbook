
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TripForm, { TripFormValues } from '@/components/TripForm';
import MapView from '@/components/MapView';
import { useToast } from '@/hooks/use-toast';
import { 
  RestStop,
  checkHOSCompliance
} from '@/utils/tripCalculations';
import { useNavigate } from 'react-router-dom';
import { calculateRouteWithGemini, GeminiRouteData } from '@/services/geminiService';

const TripPlanner = () => {
  const [loading, setLoading] = useState(false);
  const [routeGenerated, setRouteGenerated] = useState(false);
  const [tripDetails, setTripDetails] = useState<TripFormValues | null>(null);
  const [restStops, setRestStops] = useState<RestStop[]>([]);
  const [routeData, setRouteData] = useState<GeminiRouteData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (values: TripFormValues) => {
    setLoading(true);
    setTripDetails(values);
    
    try {
      // Use Gemini for route calculations
      const geminiData = await calculateRouteWithGemini(values);
      
      // Update state with Gemini's response
      setRouteData(geminiData);
      setRestStops(geminiData.restStops);
      setRouteGenerated(true);
      
      // Check HOS compliance
      if (!geminiData.hosCompliant && geminiData.violations.length > 0) {
        toast({
          title: "HOS Compliance Warning",
          description: geminiData.violations[0],
          variant: "destructive"
        });
      } else {
        toast({
          title: "Route Generated",
          description: "Your HOS-compliant route has been calculated.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to calculate route. Please try again.",
        variant: "destructive"
      });
      console.error('Error calculating route:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLogs = () => {
    // Store trip details and route data in session storage to use in log generator
    if (tripDetails && routeData) {
      sessionStorage.setItem('tripDetails', JSON.stringify(tripDetails));
      sessionStorage.setItem('routeData', JSON.stringify(routeData));
      sessionStorage.setItem('restStops', JSON.stringify(restStops));
      navigate('/log-generator');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Plan Your Trip
            </h1>
            <p className="text-xl text-gray-600">
              Generate an intelligent, HOS-compliant route with suggested rest stops.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <TripForm onSubmit={handleSubmit} isLoading={loading} />
              
              {routeGenerated && routeData && (
                <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
                  <h3 className="font-medium text-gray-900 mb-2">Trip Notes</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Total distance: {routeData.totalDistance} miles</li>
                    <li>• Estimated driving time: {(routeData.totalDrivingTime / 60).toFixed(1)} hours</li>
                    <li>• Required stops: {restStops.length}</li>
                    <li>• Trip days: {routeData.multiDayTrip ? 2 : 1}</li>
                    {restStops.some(stop => stop.type === 'rest') && (
                      <li>• 10-hour rest period required due to trip length.</li>
                    )}
                    <li>• All driving segments comply with 11-hour driving limit.</li>
                  </ul>
                </div>
              )}
            </div>
            
            <div>
              {routeGenerated && tripDetails && routeData ? (
                <MapView 
                  startLocation={tripDetails.currentLocation}
                  endLocation={tripDetails.dropoffLocation}
                  restStops={restStops}
                  onGenerateLogs={handleGenerateLogs}
                />
              ) : (
                <div className="h-full min-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-8 w-8 text-gray-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={1.5} 
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" 
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Route Generated</h3>
                    <p className="max-w-xs mx-auto mb-4">
                      Enter your trip details and click "Generate Route" to see your HOS-compliant route.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TripPlanner;
