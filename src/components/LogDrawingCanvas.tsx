import React, { useRef, useEffect, useState } from 'react';
import { PenTool, Eraser, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface LogDrawingCanvasProps {
  width: number;
  height: number;
  className?: string;
  onSave?: (dataUrl: string) => void;
}

const LogDrawingCanvas: React.FC<LogDrawingCanvasProps> = ({ 
  width, 
  height, 
  className,
  onSave 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [lineWidth, setLineWidth] = useState(2);
  const [isEditing, setIsEditing] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Scale canvas for high resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext('2d');
    if (!context) return;
    
    context.scale(dpr, dpr);
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.strokeStyle = tool === 'pen' ? '#000000' : '#FFFFFF';
    context.lineWidth = lineWidth;
    
    contextRef.current = context;
    setCanvasReady(true);
  }, [width, height]);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = tool === 'pen' ? '#000000' : '#FFFFFF';
    contextRef.current.lineWidth = lineWidth;
  }, [tool, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    setDrawing(true);
    
    // Get the position
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    contextRef.current.beginPath();
    contextRef.current.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !isEditing) return;
    
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    
    // Get the position
    let x, y;
    if ('touches' in e) {
      // Touch event
      const rect = canvas.getBoundingClientRect();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // Mouse event
      x = e.nativeEvent.offsetX;
      y = e.nativeEvent.offsetY;
    }
    
    contextRef.current.lineTo(x, y);
    contextRef.current.stroke();
  };

  const endDrawing = () => {
    if (!contextRef.current) return;
    contextRef.current.closePath();
    setDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    }
    setIsEditing(false);
  };

  return (
    <div className={`relative ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className={`border border-gray-200 rounded touch-none ${isEditing ? 'cursor-crosshair' : 'cursor-default'}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      
      {canvasReady && (
        <div className="absolute top-2 right-2 flex flex-col space-y-2">
          {!isEditing ? (
            <Button 
              size="sm" 
              variant="outline" 
              className="bg-white"
              onClick={() => setIsEditing(true)}
            >
              <PenTool className="h-4 w-4 mr-1" />
              Edit
            </Button>
          ) : (
            <>
              <ToggleGroup type="single" value={tool} onValueChange={(value) => value && setTool(value as 'pen' | 'eraser')}>
                <ToggleGroupItem value="pen" size="sm">
                  <PenTool className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="eraser" size="sm">
                  <Eraser className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              
              <div className="bg-white p-2 rounded shadow-sm">
                <Slider 
                  className="w-24" 
                  value={[lineWidth]} 
                  onValueChange={(value) => setLineWidth(value[0])} 
                  min={1} 
                  max={8} 
                  step={1} 
                />
              </div>
              
              <div className="flex space-x-1">
                <Button size="sm" variant="outline" className="bg-white" onClick={clearCanvas}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="sm" className="bg-primary" onClick={saveCanvas}>
                  Save
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LogDrawingCanvas;
