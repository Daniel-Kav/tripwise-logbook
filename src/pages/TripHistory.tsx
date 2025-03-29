import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, FileText, MapPin, Truck, ExternalLink, RotateCcw } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";
import { tripHistoryService, SavedTrip } from '@/services/tripHistoryService';

const TripHistory = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState<SavedTrip | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setLoading(true);
      const userTrips = await tripHistoryService.getUserTrips();
      setTrips(userTrips);
      
      // Select the first trip if available
      if (userTrips.length > 0 && !selectedTrip) {
        setSelectedTrip(userTrips[0]);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
      toast({
        title: "Failed to Load Trips",
        description: "There was an error loading your trip history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/trip-planner');
  };

  const handleSelectTrip = (trip: SavedTrip) => {
    setSelectedTrip(trip);
  };

  const handleDeleteTrip = async (tripId: string) => {
    try {
      await tripHistoryService.deleteTrip(tripId);
      toast({
        title: "Trip Deleted",
        description: "The trip has been removed from your history.",
      });
      
      // Reload trips
      loadTrips();
      
      // Clear selected trip if it was deleted
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the trip.",
        variant: "destructive"
      });
    }
  };

  const handleViewEldLogs = (trip: SavedTrip) => {
    try {
      // Validate required data
      if (!trip.trip_details || !trip.route_data || !trip.rest_stops) {
        toast({
          title: "Missing Trip Data",
          description: "Some required trip information is missing. Please try again.",
          variant: "destructive"
        });
        return;
      }

      // Store trip data in session storage
      sessionStorage.setItem('tripDetails', JSON.stringify(trip.trip_details));
      sessionStorage.setItem('routeData', JSON.stringify(trip.route_data));
      sessionStorage.setItem('restStops', JSON.stringify(trip.rest_stops));
      sessionStorage.setItem('savedLogs', JSON.stringify(trip.daily_logs));
      
      // Navigate to log generator
      navigate('/log-generator');
    } catch (error) {
      console.error('Error preparing ELD logs:', error);
      toast({
        title: "Error",
        description: "There was an error preparing your ELD logs. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Trip History
              </h1>
              <p className="text-lg text-gray-600">
                View and manage your previous trips and ELD logs
              </p>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4 md:mt-0"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Trip Planner
            </Button>
          </div>
          
          {loading ? (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Clock size={24} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">Loading Trip History</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Please wait while we retrieve your trip history.
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
          ) : trips.length === 0 ? (
            <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Truck size={24} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-3">No Trip History</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't saved any trips yet. Plan a trip and save it to see it here.
              </p>
              <Button onClick={handleBackToDashboard}>
                Go to Trip Planner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Card className="shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle>Your Trips</CardTitle>
                    <CardDescription>
                      {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[600px] overflow-y-auto">
                      {trips.map((trip) => (
                        <div 
                          key={trip.id}
                          className={`flex items-start gap-4 p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${selectedTrip?.id === trip.id ? 'bg-gray-50' : ''}`}
                          onClick={() => handleSelectTrip(trip)}
                        >
                          <div className="rounded-full p-2 bg-primary/10 text-primary">
                            <Truck size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {trip.trip_details ? `${trip.trip_details.currentLocation} → ${trip.trip_details.dropoffLocation}` : 'Location not available'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center">
                              <Calendar size={12} className="mr-1" />
                              {formatDate(trip.created_at)}
                              <span className="mx-1">•</span>
                              {trip.daily_logs && trip.daily_logs.length} {trip.daily_logs && trip.daily_logs.length === 1 ? 'day' : 'days'}
                            </div>
                            {selectedTrip?.id === trip.id && (
                              <div className="mt-2 space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <MapPin size={12} className="text-gray-400" />
                                  <span className="text-gray-600">
                                    {trip.route_data?.totalDistance || 0} miles
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Clock size={12} className="text-gray-400" />
                                  <span className="text-gray-600">
                                    {((trip.route_data?.totalDrivingTime || 0) / 60).toFixed(1)} hours driving
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <FileText size={12} className="text-gray-400" />
                                  <span className="text-gray-600">
                                    {trip.rest_stops.length} rest stops
                                  </span>
                                </div>
                                <div className="pt-2 flex gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewEldLogs(trip);
                                    }}
                                  >
                                    <FileText size={12} className="mr-1" />
                                    View ELD Logs
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteTrip(trip.id);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          <Badge variant="outline" className="whitespace-nowrap">
                            {trip.route_data?.totalDistance || 0} miles
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {selectedTrip ? (
                  <Card className="shadow-sm">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {selectedTrip.trip_details.currentLocation} to {selectedTrip.trip_details.dropoffLocation}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            Created on {formatDate(selectedTrip.created_at)} at {formatTime(selectedTrip.created_at)}
                          </CardDescription>
                        </div>
                        <div>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => handleViewEldLogs(selectedTrip)}
                          >
                            <FileText size={16} className="mr-2" />
                            View ELD Logs
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <Tabs defaultValue="details">
                        <TabsList className="mb-4">
                          <TabsTrigger value="details">Trip Details</TabsTrigger>
                          <TabsTrigger value="logs">Log Summary</TabsTrigger>
                          <TabsTrigger value="stops">Rest Stops</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="details" className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                              <h3 className="font-medium flex items-center mb-2">
                                <MapPin size={16} className="mr-2 text-blue-500" />
                                Route Information
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Starting Point:</span>
                                  <span className="font-medium">{selectedTrip.trip_details.currentLocation}</span>
                                </div>
                                {selectedTrip.trip_details.pickupLocation && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Pickup:</span>
                                    <span className="font-medium">{selectedTrip.trip_details.pickupLocation}</span>
                                  </div>
                                )}
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Destination:</span>
                                  <span className="font-medium">{selectedTrip.trip_details.dropoffLocation}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Distance:</span>
                                  <span className="font-medium">{selectedTrip.route_data?.totalDistance || 0} miles</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Driving Time:</span>
                                  <span className="font-medium">{((selectedTrip.route_data?.totalDrivingTime || 0) / 60).toFixed(1)} hours</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Trip Duration:</span>
                                  <span className="font-medium">{selectedTrip.daily_logs.length} {selectedTrip.daily_logs.length === 1 ? 'day' : 'days'}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                              <h3 className="font-medium flex items-center mb-2">
                                <Clock size={16} className="mr-2 text-green-500" />
                                HOS Status
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">HOS Compliant:</span>
                                  <Badge variant={selectedTrip.route_data?.hosCompliant ? "outline" : "destructive"}>
                                    {selectedTrip.route_data?.hosCompliant ? "Yes" : "No"}
                                  </Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Rest Stops:</span>
                                  <span className="font-medium">{selectedTrip.rest_stops.length}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total Driving:</span>
                                  <span className="font-medium">
                                    {selectedTrip.daily_logs.reduce((total, log) => {
                                      return total + log.logs
                                        .filter(entry => entry.status === 'driving')
                                        .reduce((sum, entry) => {
                                          const start = new Date(`2000-01-01T${entry.startTime}`);
                                          const end = new Date(`2000-01-01T${entry.endTime}`);
                                          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        }, 0);
                                    }, 0).toFixed(1)} hours
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Total On-Duty:</span>
                                  <span className="font-medium">
                                    {selectedTrip.daily_logs.reduce((total, log) => {
                                      return total + log.logs
                                        .filter(entry => entry.status === 'on-duty')
                                        .reduce((sum, entry) => {
                                          const start = new Date(`2000-01-01T${entry.startTime}`);
                                          const end = new Date(`2000-01-01T${entry.endTime}`);
                                          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        }, 0);
                                    }, 0).toFixed(1)} hours
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                  <span className="text-gray-600">10-hour Break:</span>
                                  <Badge variant="outline">Included</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">30-min Breaks:</span>
                                  <Badge variant="outline">Included</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {selectedTrip.route_data?.violations && selectedTrip.route_data.violations.length > 0 && (
                            <div className="bg-red-50 rounded-lg p-4 border border-red-200 mt-4">
                              <h3 className="font-medium text-red-700 mb-2">HOS Violations</h3>
                              <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                                {selectedTrip.route_data.violations.map((violation, index) => (
                                  <li key={index}>{violation}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="logs">
                          <div className="rounded-lg border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>From</TableHead>
                                  <TableHead>To</TableHead>
                                  <TableHead>Driving Hours</TableHead>
                                  <TableHead>On-Duty Hours</TableHead>
                                  <TableHead>Miles</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {selectedTrip.daily_logs.map((log, index) => {
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
                                    <TableRow key={index}>
                                      <TableCell>{formattedDate}</TableCell>
                                      <TableCell>{log.startLocation}</TableCell>
                                      <TableCell>{log.endLocation}</TableCell>
                                      <TableCell>{drivingHours.toFixed(1)}</TableCell>
                                      <TableCell>{onDutyHours.toFixed(1)}</TableCell>
                                      <TableCell>{log.totalMiles}</TableCell>
                                    </TableRow>
                                  );
                                })}
                                <TableRow className="font-medium">
                                  <TableCell colSpan={3}>Totals</TableCell>
                                  <TableCell>
                                    {selectedTrip.daily_logs.reduce((total, log) => {
                                      return total + log.logs
                                        .filter(entry => entry.status === 'driving')
                                        .reduce((sum, entry) => {
                                          const start = new Date(`2000-01-01T${entry.startTime}`);
                                          const end = new Date(`2000-01-01T${entry.endTime}`);
                                          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        }, 0);
                                    }, 0).toFixed(1)}
                                  </TableCell>
                                  <TableCell>
                                    {selectedTrip.daily_logs.reduce((total, log) => {
                                      return total + log.logs
                                        .filter(entry => entry.status === 'on-duty')
                                        .reduce((sum, entry) => {
                                          const start = new Date(`2000-01-01T${entry.startTime}`);
                                          const end = new Date(`2000-01-01T${entry.endTime}`);
                                          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                        }, 0);
                                    }, 0).toFixed(1)}
                                  </TableCell>
                                  <TableCell>
                                    {selectedTrip.daily_logs.reduce((total, log) => total + log.totalMiles, 0)}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="stops">
                          {selectedTrip.rest_stops.length > 0 ? (
                            <div className="rounded-lg border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Stop #</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Duration</TableHead>
                                    <TableHead>Notes</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {selectedTrip.rest_stops.map((stop, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{index + 1}</TableCell>
                                      <TableCell>{stop.location}</TableCell>
                                      <TableCell>
                                        <Badge variant={stop.type === 'rest' ? "default" : "secondary"}>
                                          {stop.type === 'rest' ? 'Rest Break (10h)' : 'Short Break (30m)'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>{stop.duration}</TableCell>
                                      <TableCell>{stop.stopReason}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No rest stops required for this trip
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                    
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTrip(selectedTrip.id)}
                      >
                        Delete Trip
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewEldLogs(selectedTrip)}
                      >
                        <FileText size={16} className="mr-2" />
                        Generate ELD Logs
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
                        <Truck size={24} className="text-gray-400" />
                      </div>
                      <h3 className="text-xl font-medium text-gray-700 mb-2">Select a Trip</h3>
                      <p className="text-gray-500 mb-4 max-w-xs mx-auto">
                        Choose a trip from the list to view details and ELD logs
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default TripHistory;
