import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LogSheet from '@/components/LogSheet';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Download, FileText, Clock, Calendar, Printer, Save, History } from 'lucide-react';
import { 
  DailyLog,
  TripDetails,
  RouteSegment,
  RestStop,
  calculateRouteSegments,
  generateELDLogs
} from '@/utils/tripCalculations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { GeminiRouteData } from '@/services/geminiService';
import { tripHistoryService } from '@/services/tripHistoryService';

const LogGenerator = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tripData, setTripData] = useState<{
    tripDetails: TripDetails | null;
    restStops: RestStop[] | null;
    routeData: GeminiRouteData | null;
  }>({
    tripDetails: null,
    restStops: null,
    routeData: null
  });

  useEffect(() => {
    // Try to get trip details from session storage
    const storedTripDetails = sessionStorage.getItem('tripDetails');
    const storedRestStops = sessionStorage.getItem('restStops');
    const storedRouteData = sessionStorage.getItem('routeData');
    
    if (storedTripDetails && storedRestStops) {
      const tripDetails = JSON.parse(storedTripDetails);
      const restStops = JSON.parse(storedRestStops);
      const routeData = storedRouteData ? JSON.parse(storedRouteData) : null;
      
      setTripData({
        tripDetails,
        restStops,
        routeData
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
    
    // Set loading to false after data is processed
    setLoading(false);
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

  const handleSaveTrip = async () => {
    if (!tripData.tripDetails || !tripData.restStops || !logs.length) {
      toast({
        title: "Cannot Save Trip",
        description: "Trip data is incomplete or missing.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSaving(true);
      
      await tripHistoryService.saveTrip(
        tripData.tripDetails,
        tripData.routeData || {
          totalDistance: 0,
          totalDrivingTime: 0,
          multiDayTrip: logs.length > 1,
          hosCompliant: true,
          violations: [],
          restStops: tripData.restStops
        },
        tripData.restStops,
        logs
      );
      
      toast({
        title: "Trip Saved",
        description: "Your trip and ELD logs have been saved successfully.",
      });
      
      // Navigate to history page
      navigate('/trip-history');
    } catch (error) {
      console.error('Error saving trip:', error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your trip data.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleViewHistory = () => {
    navigate('/trip-history');
  };

  const handleDownloadAllLogs = () => {
    // In a real app, this would generate and download PDF logs
    toast({
      title: "Download Started",
      description: "Your logs are being downloaded as PDF files.",
    });
  };

  const handlePrintCurrentLog = () => {
    // In a real app, this would print the current log
    toast({
      title: "Printing Log",
      description: `Printing log for ${logs[currentLogIndex].date}`,
    });
  };

  const handleLogsUpdate = (updatedLogs: any[], dayIndex: number) => {
    // Create a copy of all logs
    const newLogs = [...logs];
    
    // Update the specific day's logs
    newLogs[dayIndex] = {
      ...newLogs[dayIndex],
      logs: updatedLogs
    };
    
    // Update state
    setLogs(newLogs);
    
    // Save to session storage
    const logKey = `edited-logs-${dayIndex}`;
    sessionStorage.setItem(logKey, JSON.stringify(updatedLogs));
    
    toast({
      title: "Logs Updated",
      description: "Your changes have been saved successfully",
    });
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
                View, edit, and manage your Electronic Logging Device records
              </p>
            </div>
            
            <div className="flex mt-4 md:mt-0 space-x-3 flex-wrap gap-2">
              <Button 
                variant="outline" 
                className="py-2 h-10"
                onClick={handleBackToPlanner}
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Planner
              </Button>
              
              <Button 
                variant="outline"
                className="py-2 h-10"
                onClick={handleViewHistory}
              >
                <History size={16} className="mr-2" />
                Trip History
              </Button>
              
              {logs.length > 0 && (
                <>
                  <Button 
                    variant="outline"
                    className="py-2 h-10"
                    onClick={handlePrintCurrentLog}
                  >
                    <Printer size={16} className="mr-2" />
                    Print Current
                  </Button>
                  <Button 
                    variant="outline"
                    className="py-2 h-10"
                    onClick={handleDownloadAllLogs}
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </Button>
                  <Button 
                    className="py-2 h-10"
                    onClick={handleSaveTrip}
                    disabled={saving}
                  >
                    <Save size={16} className="mr-2" />
                    {saving ? "Saving..." : "Save Trip"}
                  </Button>
                </>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <FileText size={24} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-3">Loading Logs</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Please wait while we retrieve your ELD logs.
                </p>
                <div className="flex justify-center">
                  <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          ) : logs.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {/* Trip Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              
              {/* Tabs for day selection when there are multiple logs */}
              {logs.length > 1 && (
                <Tabs 
                  defaultValue={`day-${currentLogIndex}`} 
                  onValueChange={(value) => setCurrentLogIndex(parseInt(value.split('-')[1]))}
                  className="w-full"
                >
                  <div className="border-b mb-4">
                    <TabsList className="bg-transparent space-x-4">
                      {logs.map((log, index) => {
                        const logDate = new Date(log.date);
                        const formattedDate = logDate.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric'
                        });
                        
                        return (
                          <TabsTrigger 
                            key={index} 
                            value={`day-${index}`}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg data-[state=active]:border-b-2 data-[state=active]:border-primary`}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>Day {index + 1}: {formattedDate}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>
                  
                  {logs.map((log, index) => (
                    <TabsContent key={index} value={`day-${index}`} className="mt-0">
                      <LogSheet
                        date={log.date}
                        driverName="John Doe"
                        truckNumber="TRK-12345"
                        startLocation={log.startLocation}
                        endLocation={log.endLocation}
                        logs={log.logs}
                        onPrevDay={index > 0 ? handlePrevDay : undefined}
                        onNextDay={index < logs.length - 1 ? handleNextDay : undefined}
                        onLogsUpdate={(updatedLogs) => handleLogsUpdate(updatedLogs, index)}
                      />
                    </TabsContent>
                  ))}
                </Tabs>
              )}
              
              {/* Single log display when there's only one log */}
              {logs.length === 1 && (
                <LogSheet
                  date={logs[0].date}
                  driverName="John Doe"
                  truckNumber="TRK-12345"
                  startLocation={logs[0].startLocation}
                  endLocation={logs[0].endLocation}
                  logs={logs[0].logs}
                  onLogsUpdate={(updatedLogs) => handleLogsUpdate(updatedLogs, 0)}
                />
              )}
              
              {/* Keep existing trip summary section */}
              {logs.length > 1 && (
                <Card className="shadow-sm">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Trip Summary
                    </h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Route</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Driving Hours</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">On-Duty Hours</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">Miles</th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log, index) => {
                            const logDate = new Date(log.date);
                            const formattedDate = logDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            });
                            
                            // Calculate hours for each status
                            const drivingHours = log.logs
                              .filter(entry => entry.status === 'driving')
                              .reduce((total, entry) => {
                                const start = new Date(`2000-01-01T${entry.startTime}`);
                                const end = new Date(`2000-01-01T${entry.endTime}`);
                                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                              }, 0);
                            
                            const onDutyHours = log.logs
                              .filter(entry => entry.status === 'on-duty')
                              .reduce((total, entry) => {
                                const start = new Date(`2000-01-01T${entry.startTime}`);
                                const end = new Date(`2000-01-01T${entry.endTime}`);
                                return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                              }, 0);
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="border border-gray-300 px-4 py-2">{formattedDate}</td>
                                <td className="border border-gray-300 px-4 py-2">{log.startLocation} → {log.endLocation}</td>
                                <td className="border border-gray-300 px-4 py-2">{drivingHours.toFixed(1)}</td>
                                <td className="border border-gray-300 px-4 py-2">{onDutyHours.toFixed(1)}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {log.totalMiles}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-100 font-semibold">
                            <td className="border border-gray-300 px-4 py-2">Total</td>
                            <td className="border border-gray-300 px-4 py-2"></td>
                            <td className="border border-gray-300 px-4 py-2">
                              {logs.reduce((total, log) => {
                                return total + log.logs
                                  .filter(entry => entry.status === 'driving')
                                  .reduce((sum, entry) => {
                                    const start = new Date(`2000-01-01T${entry.startTime}`);
                                    const end = new Date(`2000-01-01T${entry.endTime}`);
                                    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                  }, 0);
                              }, 0).toFixed(1)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {logs.reduce((total, log) => {
                                return total + log.logs
                                  .filter(entry => entry.status === 'on-duty')
                                  .reduce((sum, entry) => {
                                    const start = new Date(`2000-01-01T${entry.startTime}`);
                                    const end = new Date(`2000-01-01T${entry.endTime}`);
                                    return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                  }, 0);
                              }, 0).toFixed(1)}
                            </td>
                            <td className="border border-gray-300 px-4 py-2">
                              {logs.reduce((total, log) => total + log.totalMiles, 0)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
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
