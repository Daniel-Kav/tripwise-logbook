
import { useState } from 'react';
import { 
  Download, Calendar, Clock, User, Truck, 
  FileText, ChevronLeft, ChevronRight, Printer 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface LogSheetProps {
  date: string;
  driverName?: string;
  truckNumber?: string;
  startLocation: string;
  endLocation: string;
  logs: {
    startTime: string;
    endTime: string;
    status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper';
    location: string;
    remarks?: string;
  }[];
  onPrevDay?: () => void;
  onNextDay?: () => void;
}

const StatusColorMap = {
  'driving': '#3b82f6', // blue-500
  'on-duty': '#f59e0b', // amber-500
  'off-duty': '#10b981', // emerald-500
  'sleeper': '#8b5cf6', // violet-500
};

const StatusLabelMap = {
  'driving': 'Driving',
  'on-duty': 'On-Duty (Not Driving)',
  'off-duty': 'Off-Duty',
  'sleeper': 'Sleeper Berth',
};

const LogSheet = ({
  date,
  driverName = 'John Doe',
  truckNumber = 'TRK-12345',
  startLocation,
  endLocation,
  logs,
  onPrevDay,
  onNextDay
}: LogSheetProps) => {
  const [selectedLog, setSelectedLog] = useState<number | null>(null);

  // Helper function to calculate total hours for each status
  const calculateTotalHours = (status: 'driving' | 'on-duty' | 'off-duty' | 'sleeper') => {
    return logs
      .filter(log => log.status === status)
      .reduce((total, log) => {
        const start = new Date(`2000-01-01T${log.startTime}`);
        const end = new Date(`2000-01-01T${log.endTime}`);
        const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + diffHours;
      }, 0)
      .toFixed(1);
  };

  // Render the log grid (24-hour timeline)
  const renderLogGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="mt-4 relative">
        {/* Hour markers */}
        <div className="flex border-b border-gray-200">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-xs text-gray-500 text-center">
              {hour}
            </div>
          ))}
        </div>

        {/* Status grid */}
        <div className="flex-col h-32 relative">
          {['off-duty', 'sleeper', 'driving', 'on-duty'].map((status, rowIndex) => (
            <div key={status} className="h-8 border-b border-gray-200 flex items-center">
              <div className="w-20 pr-2 text-right text-xs font-medium text-gray-600">
                {StatusLabelMap[status as keyof typeof StatusLabelMap]}
              </div>
              <div className="flex-1 relative h-full">
                {/* Background grid lines */}
                <div className="absolute inset-0 flex pointer-events-none">
                  {hours.map(hour => (
                    <div key={hour} className="flex-1 border-r border-gray-100"></div>
                  ))}
                </div>

                {/* Render log segments for this status */}
                {logs
                  .filter(log => log.status === status)
                  .map((log, index) => {
                    const startHour = parseInt(log.startTime.split(':')[0]);
                    const startMinutes = parseInt(log.startTime.split(':')[1]);
                    const endHour = parseInt(log.endTime.split(':')[0]);
                    const endMinutes = parseInt(log.endTime.split(':')[1]);

                    const startPercent = (startHour + startMinutes / 60) / 24 * 100;
                    const endPercent = (endHour + endMinutes / 60) / 24 * 100;
                    const widthPercent = endPercent - startPercent;

                    const logIndex = logs.findIndex(
                      l => l.startTime === log.startTime && l.status === log.status
                    );

                    return (
                      <div
                        key={`${status}-${index}`}
                        className="absolute h-6 top-1 rounded cursor-pointer transition-all hover:h-7 hover:top-0.5 hover:shadow-md"
                        style={{
                          left: `${startPercent}%`,
                          width: `${widthPercent}%`,
                          backgroundColor: StatusColorMap[log.status as keyof typeof StatusColorMap],
                          opacity: selectedLog === logIndex ? 1 : 0.7,
                          border: selectedLog === logIndex ? '2px solid white' : 'none',
                          zIndex: selectedLog === logIndex ? 10 : 1,
                        }}
                        onClick={() => setSelectedLog(logIndex === selectedLog ? null : logIndex)}
                      ></div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        {/* Time markers */}
        <div className="flex mt-1">
          {hours.map(hour => (
            <div key={hour} className="flex-1 text-xs text-gray-400 text-center">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm animate-scale-in">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Driver's Daily Log
          </CardTitle>
          
          <div className="flex space-x-2">
            {onPrevDay && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrevDay}
                className="h-8 px-2"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                <span className="sr-only sm:not-sr-only">Previous Day</span>
              </Button>
            )}
            
            <div className="flex items-center text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded">
              <Calendar className="h-4 w-4 mr-1 text-gray-500" />
              {date}
            </div>
            
            {onNextDay && (
              <Button
                variant="outline"
                size="sm"
                onClick={onNextDay}
                className="h-8 px-2"
              >
                <span className="sr-only sm:not-sr-only">Next Day</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="space-y-1">
            <div className="text-xs text-gray-500 flex items-center">
              <User className="h-3 w-3 mr-1" /> Driver
            </div>
            <div className="text-sm font-medium">{driverName}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-500 flex items-center">
              <Truck className="h-3 w-3 mr-1" /> Truck #
            </div>
            <div className="text-sm font-medium">{truckNumber}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> From
            </div>
            <div className="text-sm font-medium">{startLocation}</div>
          </div>
          
          <div className="space-y-1">
            <div className="text-xs text-gray-500 flex items-center">
              <MapPin className="h-3 w-3 mr-1" /> To
            </div>
            <div className="text-sm font-medium">{endLocation}</div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="text-sm font-medium mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            Hours Summary
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Driving</div>
              <div className="text-xl font-semibold">{calculateTotalHours('driving')}h</div>
              <div className="w-full h-1 bg-gray-100 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    backgroundColor: StatusColorMap.driving,
                    width: `${Math.min(Number(calculateTotalHours('driving')) / 11 * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">On-Duty</div>
              <div className="text-xl font-semibold">{calculateTotalHours('on-duty')}h</div>
              <div className="w-full h-1 bg-gray-100 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    backgroundColor: StatusColorMap['on-duty'],
                    width: `${Math.min(Number(calculateTotalHours('on-duty')) / 3 * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Off-Duty</div>
              <div className="text-xl font-semibold">{calculateTotalHours('off-duty')}h</div>
              <div className="w-full h-1 bg-gray-100 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    backgroundColor: StatusColorMap['off-duty'],
                    width: `${Math.min(Number(calculateTotalHours('off-duty')) / 10 * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">Sleeper</div>
              <div className="text-xl font-semibold">{calculateTotalHours('sleeper')}h</div>
              <div className="w-full h-1 bg-gray-100 mt-2 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full" 
                  style={{ 
                    backgroundColor: StatusColorMap.sleeper,
                    width: `${Math.min(Number(calculateTotalHours('sleeper')) / 8 * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Log grid visualization */}
        {renderLogGrid()}
        
        {/* Selected log details */}
        {selectedLog !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium mb-2">Log Entry Details:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-500">Status</span>
                <div className="font-medium flex items-center mt-1">
                  <span
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: StatusColorMap[logs[selectedLog].status] }}
                  ></span>
                  {StatusLabelMap[logs[selectedLog].status]}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Time Period</span>
                <div className="font-medium mt-1">
                  {logs[selectedLog].startTime} - {logs[selectedLog].endTime}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Location</span>
                <div className="font-medium mt-1">{logs[selectedLog].location}</div>
              </div>
              <div>
                <span className="text-xs text-gray-500">Remarks</span>
                <div className="font-medium mt-1">
                  {logs[selectedLog].remarks || 'No remarks'}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end space-x-2">
          <Button variant="outline" size="sm" className="h-9 px-3">
            <Printer className="h-4 w-4 mr-2" />
            Print Log
          </Button>
          <Button variant="outline" size="sm" className="h-9 px-3">
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Import for Icon that was missing in the component
const MapPin = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export default LogSheet;
