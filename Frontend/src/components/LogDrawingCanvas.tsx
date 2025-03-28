
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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
  const [canvasReady, setCanvasReady] = useState(false);

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
    setCanvasReady(true);
  }, [width, height]);

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    if (onSave) {
      onSave(dataUrl);
    }
  };

  return (
    <div className={`relative ${className || ''}`}>
      <canvas
        ref={canvasRef}
        className="border border-gray-200 rounded"
      />
    </div>
  );
};

export default LogDrawingCanvas;
