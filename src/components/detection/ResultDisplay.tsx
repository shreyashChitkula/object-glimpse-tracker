import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Search, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface Detection {
  box: number[];
  class: number;
  class_name: string;
  confidence: number;
}

interface ResultDisplayProps {
  imageUrl: string | null;
  detections: Detection[] | null;
  isProcessing: boolean;
}

export function ResultDisplay({ imageUrl, detections, isProcessing }: ResultDisplayProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);
  const [activeTab, setActiveTab] = useState("visualization");
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [hoveredDetection, setHoveredDetection] = useState<string | null>(null);

  // Generate a color based on class ID
  const getColorForClass = (classId: number) => {
    const colors = [
      "#FF5733", 
      // "#33FF57", "#3357FF", "#F033FF", "#FF3366",
      // "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C"
    ];
    return colors[classId % colors.length];
  };

  // Update dimensions when image loads or container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (imageRef.current && containerRef.current) {
        setImageDimensions({
          width: imageRef.current.naturalWidth,
          height: imageRef.current.naturalHeight
        });
        setContainerDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };

    // Create ResizeObserver to watch for container size changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Update dimensions when image loads
    if (imageRef.current) {
      imageRef.current.addEventListener('load', updateDimensions);
    }

    // Initial update
    updateDimensions();

    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      if (imageRef.current) {
        imageRef.current.removeEventListener('load', updateDimensions);
      }
    };
  }, [imageUrl]);

  const renderDetectionOverlays = () => {
    if (!detections?.length || !imageDimensions || !containerDimensions) {
      return null;
    }

    return detections.map((detection, index) => {
      // Calculate scaled positions
      const [x1, y1, x2, y2] = detection.box;
      const scaledX = (x1 / imageDimensions.width) * 100;
      const scaledY = (y1 / imageDimensions.height) * 100;
      const scaledWidth = ((x2 - x1) / imageDimensions.width) * 100;
      const scaledHeight = ((y2 - y1) / imageDimensions.height) * 100;

      // Get color based on class ID
      const color = getColorForClass(detection.class);

      return (
        <div
          key={index}
          className="absolute detection-box"
          style={{
            left: `${scaledX}%`,
            top: `${scaledY}%`,
            width: `${scaledWidth}%`,
            height: `${scaledHeight}%`,
            border: `2px solid ${color}`,
          }}
        >
          <span
            className="absolute text-xs px-1 py-0.5 rounded detection-label"
            style={{ 
              backgroundColor: color,
              color: 'white',
              left: 0,
              top: 0,
              transform: 'translateY(-100%)'
            }}
          >
            {`${detection.class_name} (${Math.round(detection.confidence * 100)}%)`}
          </span>
        </div>
      );
    });
  };

  const handleDownload = () => {
    if (!imageRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'detection-result.png';
    link.href = imageRef.current.src;
    link.click();
  };

  const handleListItemHover = (id: string | null) => {
    setHoveredDetection(id);
  };

  if (!imageUrl) {
    return (
      <Card className="h-[400px] flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Search className="h-10 w-10 mb-2 mx-auto opacity-20" />
          <p>Upload an image to see detection results</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-4 w-4" />
            Detection Results
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            >
              {showBoundingBoxes ? "Hide Boxes" : "Show Boxes"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8"
              onClick={handleDownload}
              disabled={isProcessing || !detections}
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative w-full">
          {isProcessing ? (
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <Skeleton className="h-full w-full" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                <Progress value={45} className="w-40 mb-3" />
                <p className="text-sm text-muted-foreground">Processing image...</p>
              </div>
            </div>
          ) : (
            <>
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Detection result"
                className="w-full h-auto rounded-lg"
              />
              {renderDetectionOverlays()}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ResultDisplay;
