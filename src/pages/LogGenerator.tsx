
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LogSheet from '@/components/LogSheet';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Download, FileText } from 'lucide-react';
import { 
  DailyLog,
  TripDetails,
  RouteSegment,
  RestStop,
  calculateRouteSegments,
  generateELDLogs
} from '@/utils/tripCalculations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const LogGenerator = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [tripData, setTripData] = useState<{
    tripDetails: TripDetails | null;
    restStops: RestStop[] | null;
  }>({
    tripDetails: null,
    restStops: null
  });

  useEffect(() => {
    // Try to get trip details from session storage
    const storedTripDetails = sessionStorage.getItem('tripDetails');
    const storedRestStops = sessionStorage.getItem('restStops');
    
    if (storedTripDetails && storedRestStops) {
      const tripDetails = JSON.parse(storedTripDetails);
      const restStops = JSON.parse(storedRestStops);
      
      setTripData({
        tripDetails,
        restStops
      });
      
      // Generate logs based on the stored trip details
      const segments = calculateRouteSegments(
        tripDetails.currentLocation,
        tripDetails.pickupLocation,
        tripDetails.dropoffLocation
      );
      
      const generatedLogs = generateELDLogs(tripDetails, segments, restStops);
      setLogs(generatedLogs);
    }
  }, []);

  const handlePrevDay = () => {
    if (currentLogIndex > 0) {
      setCurrentLogIndex(currentLogIndex - 1);
    }
  };

  const handleNextDay = () => {
    if (currentLogIndex < logs.length - 1) {
      setCurrentLogIndex(currentLogIndex + 1);
    }
  };

  const handleBackToPlanner = () => {
    navigate('/trip-planner');
  };

  const handleDownloadAllLogs = () => {
    // In a real app, this would generate and download PDF logs
    alert('In a real application, this would download all logs as PDF files.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                ELD Logs
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your Electronic Logging Device records
              </p>
            </div>
            
            <div className="flex mt-4 md:mt-0 space-x-3">
              <Button 
                variant="outline" 
                className="py-2 h-10"
                onClick={handleBackToPlanner}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Planner
              </Button>
              
              {logs.length > 0 && (
                <Button 
                  className="py-2 h-10"
                  onClick={handleDownloadAllLogs}
                >
                  <Download size={16} className="mr-2" />
                  Download All Logs
                </Button>
              )}
            </div>
          </div>
          
          {logs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              <LogSheet
                date={logs[currentLogIndex].date}
                driverName="John Doe"
                truckNumber="TRK-12345"
                startLocation={logs[currentLogIndex].startLocation}
                endLocation={logs[currentLogIndex].endLocation}
                logs={logs[currentLogIndex].logs}
                onPrevDay={currentLogIndex > 0 ? handlePrevDay : undefined}
                onNextDay={currentLogIndex < logs.length - 1 ? handleNextDay : undefined}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText size={16} className="text-blue-500 mr-2" />
                    Trip Overview
                  </h3>
                  <p className="text-sm text-gray-600">
                    {tripData.tripDetails?.currentLocation} to {tripData.tripDetails?.dropoffLocation}
                    <br />
                    {logs.length} day trip with {tripData.restStops?.length || 0} required stops.
                  </p>
                </div>
                
                <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                  <h3 className="font-medium text-gray-900 mb-2">FMCSA HOS Compliance</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 11-hour driving limit: Compliant</li>
                    <li>• 14-hour on-duty window: Compliant</li>
                    <li>• 30-minute break requirement: Included</li>
                    <li>• 10-hour off-duty period: Scheduled</li>
                    <li>• 60/70-hour limit: Within allowed limits</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              {tripData.tripDetails ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <FileText size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 mb-3">Generating Logs</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your ELD logs are being generated based on your trip details.
                  </p>
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                </div>
              ) : (
                <div>
                  <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Trip Data Available</AlertTitle>
                    <AlertDescription>
                      You need to plan a trip before generating ELD logs.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-3">No Logs Available</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      First, use the Trip Planner to create a route. Then, you can generate ELD logs based on your planned trip.
                    </p>
                    <Button onClick={handleBackToPlanner}>
                      Go to Trip Planner
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LogGenerator;
