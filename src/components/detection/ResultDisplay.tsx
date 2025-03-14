
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Search, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface Detection {
  id: string;
  label: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface ResultDisplayProps {
  imageUrl: string | null;
  detections: Detection[] | null;
  isProcessing: boolean;
}

export function ResultDisplay({ imageUrl, detections, isProcessing }: ResultDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState("visualization");
  const [showBoundingBoxes, setShowBoundingBoxes] = useState(true);
  const [hoveredDetection, setHoveredDetection] = useState<string | null>(null);

  // Colors for different detection classes
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF3366",
    "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C"
  ];

  // Draw detections on canvas
  useEffect(() => {
    if (!canvasRef.current || !imageUrl || !detections || isProcessing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const image = new Image();
    image.src = imageUrl;
    
    image.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw the image
      ctx.drawImage(image, 0, 0);
      
      if (showBoundingBoxes) {
        // Draw bounding boxes
        detections.forEach((detection, index) => {
          const { x, y, width, height } = detection.bbox;
          const color = colors[index % colors.length];
          const isHovered = hoveredDetection === detection.id;
          
          // Draw bounding box
          ctx.lineWidth = isHovered ? 3 : 2;
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.rect(x, y, width, height);
          ctx.stroke();
          
          // Draw label background
          ctx.fillStyle = color + (isHovered ? "E0" : "90");
          const textMetrics = ctx.measureText(detection.label);
          const labelWidth = textMetrics.width + 10;
          ctx.fillRect(x, y - 25, labelWidth, 25);
          
          // Draw label text
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(`${detection.label} ${Math.round(detection.confidence * 100)}%`, x + 5, y - 10);
        });
      }
    };
  }, [imageUrl, detections, isProcessing, showBoundingBoxes, hoveredDetection]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = 'detection-result.png';
    link.href = canvasRef.current.toDataURL('image/png');
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
    <Card className="transition-all duration-300 animate-fade-in overflow-hidden">
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
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pb-3 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="visualization">Visualization</TabsTrigger>
              <TabsTrigger value="detections">Detections</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="visualization" className="m-0">
            <div className="relative w-full">
              {isProcessing ? (
                <div className="aspect-video relative overflow-hidden rounded-b-lg">
                  <Skeleton className="h-full w-full rounded-none" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                    <Progress value={45} className="w-40 mb-3" />
                    <p className="text-sm text-muted-foreground">Processing image...</p>
                  </div>
                </div>
              ) : (
                <canvas
                  ref={canvasRef}
                  className="w-full object-contain rounded-b-lg"
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="detections" className="m-0">
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {isProcessing ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : detections && detections.length > 0 ? (
                <ul className="space-y-2">
                  {detections.map((detection, index) => (
                    <li 
                      key={detection.id}
                      className="p-3 rounded-md border transition-all duration-150"
                      style={{
                        borderColor: hoveredDetection === detection.id ? colors[index % colors.length] : 'hsl(var(--border))',
                        backgroundColor: hoveredDetection === detection.id ? `${colors[index % colors.length]}10` : ''
                      }}
                      onMouseEnter={() => handleListItemHover(detection.id)}
                      onMouseLeave={() => handleListItemHover(null)}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <div className="font-medium flex items-center">
                            <span
                              className="inline-block w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            />
                            {detection.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Position: (x: {Math.round(detection.bbox.x)}, y: {Math.round(detection.bbox.y)})
                          </div>
                        </div>
                        <Badge variant="outline" className="ml-auto">
                          {Math.round(detection.confidence * 100)}%
                        </Badge>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Search className="h-8 w-8 mb-2 mx-auto opacity-20" />
                  <p>No objects detected</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ResultDisplay;
