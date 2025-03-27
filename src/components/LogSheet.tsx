
import { useState } from 'react';
import { 
  Download, Calendar, Clock, User, Truck, 
  FileText, ChevronLeft, ChevronRight, Printer 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
  const [showDetails, setShowDetails] = useState(false);

  // Parse date components
  const dateObj = new Date(date);
  const month = dateObj.toLocaleString('default', { month: 'short' });
  const day = dateObj.getDate();
  const year = dateObj.getFullYear();

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

  // Calculate accumulated total hours
  const totalDrivingHours = Number(calculateTotalHours('driving'));
  const totalOnDutyHours = Number(calculateTotalHours('on-duty'));
  const totalHours = totalDrivingHours + totalOnDutyHours;

  // Render the log grid (24-hour timeline with FMCSA format)
  const renderLogGrid = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="mt-4 overflow-x-auto">
        <div className="min-w-max">
          {/* Hour markers */}
          <div className="flex border-b border-black">
            <div className="w-20"></div>
            <div className="flex-1 flex">
              <div className="flex-1 flex">
                <div className="w-1/2 text-xs text-center font-bold border-r border-black">AM</div>
                <div className="w-1/2 text-xs text-center font-bold">NOON</div>
              </div>
              <div className="flex-1 flex">
                <div className="w-1/2 text-xs text-center font-bold">PM</div>
                <div className="w-1/2 text-xs text-center font-bold border-l border-black">MID</div>
              </div>
            </div>
            <div className="w-12 text-xs text-center font-bold">Total Hours</div>
          </div>

          <div className="flex border-b border-black">
            <div className="w-20"></div>
            <div className="flex-1 flex">
              {hours.map(hour => (
                <div 
                  key={hour} 
                  className={`flex-1 text-xs text-center font-semibold ${hour % 2 === 0 ? 'border-r border-black' : ''}`}
                >
                  {hour === 0 ? 'M' : hour}
                </div>
              ))}
            </div>
            <div className="w-12"></div>
          </div>

          {/* Status grid - FMCSA format */}
          {['off-duty', 'sleeper', 'driving', 'on-duty'].map((status, rowIndex) => {
            // Calculate total hours for this status
            const statusHours = calculateTotalHours(status as 'driving' | 'on-duty' | 'off-duty' | 'sleeper');
            
            return (
              <div key={status} className="flex border-b border-black">
                <div className="w-20 py-1 px-2 text-right text-xs font-bold border-r border-black">
                  {rowIndex + 1}. {StatusLabelMap[status as keyof typeof StatusLabelMap]}
                </div>
                <div className="flex-1 relative h-8">
                  {/* Background grid lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {hours.map(hour => (
                      <div 
                        key={hour} 
                        className={`flex-1 border-r ${hour % 2 === 0 ? 'border-black' : 'border-gray-300'}`}
                      ></div>
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
                          className="absolute h-full top-0"
                          style={{
                            left: `${startPercent}%`,
                            width: `${widthPercent}%`,
                            background: `repeating-linear-gradient(
                              45deg,
                              ${StatusColorMap[log.status as keyof typeof StatusColorMap]},
                              ${StatusColorMap[log.status as keyof typeof StatusColorMap]} 5px,
                              rgba(0,0,0,0.1) 5px,
                              rgba(0,0,0,0.1) 10px
                            )`,
                            border: '1px solid black',
                            zIndex: 1,
                          }}
                          onClick={() => setSelectedLog(logIndex === selectedLog ? null : logIndex)}
                        ></div>
                      );
                    })}
                </div>
                <div className="w-12 text-center text-xs font-semibold border-l border-black flex items-center justify-center">
                  {statusHours}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm animate-scale-in">
      <CardHeader className="pb-2 border-b border-gray-200">
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
              {month} / {day} / {year}
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
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="border border-black rounded p-3">
            <div className="flex justify-between mb-2">
              <div>
                <div className="text-xs text-gray-500">From:</div>
                <div className="text-sm font-medium">{startLocation}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">To:</div>
                <div className="text-sm font-medium">{endLocation}</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-2">
              <div>
                <div className="text-xs text-gray-500 text-center">Total Miles Driving Today:</div>
                <div className="border border-black h-8 flex items-center justify-center font-bold">275</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 text-center">Total Mileage Today:</div>
                <div className="border border-black h-8 flex items-center justify-center font-bold">275</div>
              </div>
            </div>
          </div>
          
          <div className="border border-black rounded p-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Name of Carrier or Drivers:</div>
                <div className="text-sm font-medium">{driverName}</div>
                
                <div className="text-xs text-gray-500 mt-2">Unit/Trailer and Entity Numbers or License/State/Unit:</div>
                <div className="text-sm font-medium">{truckNumber}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Main Office Address:</div>
                <div className="text-sm font-medium">123 Transport Way, Springfield, IL</div>
                
                <div className="text-xs text-gray-500 mt-2">Home Terminal Address:</div>
                <div className="text-sm font-medium">456 Logistics Drive, Springfield, IL</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* ELD Graph Section */}
        <div className="border border-black rounded mb-4">
          {renderLogGrid()}
        </div>
        
        {/* Remarks Section */}
        <div className="border border-black rounded p-3 mb-4">
          <div className="font-bold text-sm border-b border-black pb-1">Remarks</div>
          <div className="min-h-[100px] pt-2 text-sm">
            {selectedLog !== null ? (
              <div>
                <p>
                  <span className="font-semibold">{logs[selectedLog].startTime} - {logs[selectedLog].endTime}:</span> {" "}
                  {logs[selectedLog].remarks || `${StatusLabelMap[logs[selectedLog].status]} at ${logs[selectedLog].location}`}
                </p>
              </div>
            ) : (
              logs.map((log, index) => (
                <p key={index} className="mb-1">
                  <span className="font-semibold">{log.startTime} - {log.endTime}:</span> {" "}
                  {log.remarks || `${StatusLabelMap[log.status]} at ${log.location}`}
                </p>
              ))
            )}
          </div>
        </div>
        
        {/* Shipping Documents */}
        <Collapsible 
          open={showDetails} 
          onOpenChange={setShowDetails}
          className="border border-black rounded mb-4"
        >
          <CollapsibleTrigger asChild>
            <div className="p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center">
              <div className="font-bold text-sm">Shipping Documents</div>
              <div className="text-xs text-blue-600">{showDetails ? 'Hide Details' : 'Show Details'}</div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-3 border-t border-black">
              <div className="mb-2">
                <div className="text-xs text-gray-500">BOL or Manifest No.</div>
                <div className="text-sm font-medium">BOL-12345-789</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Shipper & Commodity</div>
                <div className="text-sm font-medium">XYZ Manufacturing - Industrial Equipment</div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Summary Table */}
        <div className="border border-black rounded mb-4">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-100">
                <TableHead className="border-r border-black text-center py-1 h-auto" rowSpan={2}>Recap</TableHead>
                <TableHead className="border-r border-black text-center py-1 h-auto" colSpan={3}>7 Day / 60 hour</TableHead>
                <TableHead className="text-center py-1 h-auto" colSpan={3}>8 Day / 70 hour</TableHead>
              </TableRow>
              <TableRow className="bg-gray-100">
                <TableHead className="border-r border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">A. Total hours on duty today:</div>
                </TableHead>
                <TableHead className="border-r border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">B. Total hours in 6 days preceding today:</div>
                </TableHead>
                <TableHead className="border-r border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">C. Total hours in 7 days:</div>
                </TableHead>
                <TableHead className="border-r border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">A. Total hours on duty today:</div>
                </TableHead>
                <TableHead className="border-r border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">B. Total hours in 7 days preceding today:</div>
                </TableHead>
                <TableHead className="border-t border-black text-center py-1 h-auto w-1/6">
                  <div className="text-xs">C. Total hours in 8 days:</div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="border-r border-t border-black text-center font-bold">
                  {totalHours.toFixed(1)}
                </TableCell>
                <TableCell className="border-r border-t border-black text-center font-bold">
                  48.5
                </TableCell>
                <TableCell className="border-r border-t border-black text-center font-bold">
                  {(totalHours + 48.5).toFixed(1)}
                </TableCell>
                <TableCell className="border-r border-t border-black text-center font-bold">
                  {totalHours.toFixed(1)}
                </TableCell>
                <TableCell className="border-r border-t border-black text-center font-bold">
                  55.0
                </TableCell>
                <TableCell className="border-t border-black text-center font-bold">
                  {(totalHours + 55.0).toFixed(1)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="certification" />
            <label htmlFor="certification" className="text-sm font-medium">
              I hereby certify that the information contained in this log is true and accurate
            </label>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Printer className="h-4 w-4 mr-2" />
              Print Log
            </Button>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
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
