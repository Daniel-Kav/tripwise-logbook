
import { useState } from 'react';
import { 
  Clock, Truck, MapPin, Calendar, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from '@/components/ui/select';

export interface TripFormValues {
  currentLocation: string;
  pickupLocation: string;
  dropoffLocation: string;
  currentCycle: string;
  availableDrivingHours: string;
}

interface TripFormProps {
  onSubmit: (values: TripFormValues) => void;
  isLoading?: boolean;
}

const TripForm = ({ onSubmit, isLoading = false }: TripFormProps) => {
  const [formValues, setFormValues] = useState<TripFormValues>({
    currentLocation: '',
    pickupLocation: '',
    dropoffLocation: '',
    currentCycle: '70-hour/8-day',
    availableDrivingHours: '11',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TripFormValues, string>>>({});

  const handleChange = (field: keyof TripFormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TripFormValues, string>> = {};
    
    if (!formValues.currentLocation.trim()) {
      newErrors.currentLocation = 'Current location is required';
    }
    
    if (!formValues.pickupLocation.trim()) {
      newErrors.pickupLocation = 'Pickup location is required';
    }
    
    if (!formValues.dropoffLocation.trim()) {
      newErrors.dropoffLocation = 'Drop-off location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formValues);
    }
  };

  return (
    <Card className="w-full shadow-sm animate-scale-in">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Truck className="mr-2 h-6 w-6 text-primary" />
          Trip Planner
        </CardTitle>
        <CardDescription>
          Enter your trip details to generate a FMCSA compliant route and ELD logs
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentLocation" className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-gray-500" />
              Current Location
            </Label>
            <Input
              id="currentLocation"
              placeholder="e.g. Atlanta, GA"
              value={formValues.currentLocation}
              onChange={(e) => handleChange('currentLocation', e.target.value)}
              className="border-gray-200 focus:border-primary"
            />
            {errors.currentLocation && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.currentLocation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupLocation" className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-gray-500" />
              Pickup Location
            </Label>
            <Input
              id="pickupLocation"
              placeholder="e.g. Nashville, TN"
              value={formValues.pickupLocation}
              onChange={(e) => handleChange('pickupLocation', e.target.value)}
              className="border-gray-200 focus:border-primary"
            />
            {errors.pickupLocation && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.pickupLocation}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoffLocation" className="flex items-center">
              <MapPin className="mr-1 h-4 w-4 text-gray-500" />
              Drop-off Location
            </Label>
            <Input
              id="dropoffLocation"
              placeholder="e.g. Chicago, IL"
              value={formValues.dropoffLocation}
              onChange={(e) => handleChange('dropoffLocation', e.target.value)}
              className="border-gray-200 focus:border-primary"
            />
            {errors.dropoffLocation && (
              <p className="text-sm text-red-500 flex items-center mt-1">
                <AlertCircle className="h-4 w-4 mr-1" /> {errors.dropoffLocation}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currentCycle" className="flex items-center">
                <Calendar className="mr-1 h-4 w-4 text-gray-500" />
                Current Cycle
              </Label>
              <Select
                value={formValues.currentCycle}
                onValueChange={(value) => handleChange('currentCycle', value)}
              >
                <SelectTrigger id="currentCycle" className="border-gray-200 focus:border-primary">
                  <SelectValue placeholder="Select cycle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70-hour/8-day">70-hour/8-day</SelectItem>
                  <SelectItem value="60-hour/7-day">60-hour/7-day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="availableDrivingHours" className="flex items-center">
                <Clock className="mr-1 h-4 w-4 text-gray-500" />
                Available Driving Hours
              </Label>
              <Select
                value={formValues.availableDrivingHours}
                onValueChange={(value) => handleChange('availableDrivingHours', value)}
              >
                <SelectTrigger id="availableDrivingHours" className="border-gray-200 focus:border-primary">
                  <SelectValue placeholder="Select hours" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i).map((hour) => (
                    <SelectItem key={hour} value={hour.toString()}>
                      {hour} hours
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            type="submit"
            className="w-full py-6 font-medium hover-lift"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Calculating Route...
              </>
            ) : (
              'Generate Route & ELD Logs'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default TripForm;
