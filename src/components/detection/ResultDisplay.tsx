import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download, Search, Eye, Tag, FileText, List } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import jsPDF from 'jspdf';

interface Detection {
  id?: string;
  label?: string;
  box: { x: number; y: number; width: number; height: number } | number[];
  class: number;
  class_name: string;
  confidence: number;
}

interface FrameDetection {
  frame: number;
  detections: Detection[];
}

interface ResultDisplayProps {
  mediaUrl: string | null;
  detections: Detection[] | null;
  frameDetections?: FrameDetection[] | null;
  currentVideoTime?: number;
  totalFrames?: number;
  isProcessing: boolean;
  mediaType: "image" | "video";
  originalDimensions?: { width: number; height: number };
}

export function ResultDisplay({ 
  mediaUrl, 
  detections, 
  frameDetections,
  currentVideoTime = 0,
  totalFrames = 0,
  isProcessing, 
  mediaType,
  originalDimensions
}: ResultDisplayProps) {
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number } | null>(null);
  const [activeTab, setActiveTab] = useState("visualization");
  const [showBoxes, setShowBoxes] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [hoveredDetection, setHoveredDetection] = useState<string | null>(null);
  const [currentFrameDetections, setCurrentFrameDetections] = useState<Detection[] | null>(null);
  const { toast } = useToast();

  // Generate a color based on class ID
  const getColorForClass = (classId: number) => {
    const colors = [
      "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF3366",
      "#33FFF5", "#F5FF33", "#FF8C33", "#8C33FF", "#33FF8C"
    ];
    return colors[classId % colors.length];
  };

  // Get box coordinates in a consistent format
  const getBoxCoordinates = (detection: Detection) => {
    if (Array.isArray(detection.box)) {
      return {
        x1: detection.box[0],
        y1: detection.box[1],
        x2: detection.box[2],
        y2: detection.box[3]
      };
    } else {
      return {
        x1: detection.box.x,
        y1: detection.box.y,
        x2: detection.box.x + detection.box.width,
        y2: detection.box.y + detection.box.height
      };
    }
  };

  // Update dimensions when media loads or container resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (mediaRef.current && containerRef.current) {
        // Handle both image and video elements
        const width = mediaType === "image" 
          ? (mediaRef.current as HTMLImageElement).naturalWidth 
          : (mediaRef.current as HTMLVideoElement).videoWidth;
        
        const height = mediaType === "image" 
          ? (mediaRef.current as HTMLImageElement).naturalHeight 
          : (mediaRef.current as HTMLVideoElement).videoHeight;
          
        setMediaDimensions({
          width: width || (originalDimensions?.width || 0),
          height: height || (originalDimensions?.height || 0)
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

    // Update dimensions when media loads
    if (mediaRef.current) {
      if (mediaType === "image") {
        (mediaRef.current as HTMLImageElement).addEventListener('load', updateDimensions);
      } else {
        (mediaRef.current as HTMLVideoElement).addEventListener('loadedmetadata', updateDimensions);
      }
    }

    // Initial update
    updateDimensions();

    // Cleanup
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
      if (mediaRef.current) {
        if (mediaType === "image") {
          (mediaRef.current as HTMLImageElement).removeEventListener('load', updateDimensions);
        } else {
          (mediaRef.current as HTMLVideoElement).removeEventListener('loadedmetadata', updateDimensions);
        }
      }
    };
  }, [mediaUrl, mediaType, originalDimensions]);

  // Update current frame detections based on video time
  useEffect(() => {
    if (mediaType === "video" && detections) {
      // For video, we're already getting updated detections from the Dashboard component
      setCurrentFrameDetections(detections);
    } else if (mediaType === "image") {
      // For images, use the regular detections
      setCurrentFrameDetections(detections);
    }
  }, [mediaType, detections, currentVideoTime]);

  // Update video time when currentVideoTime prop changes
  useEffect(() => {
    if (mediaType === "video" && videoRef.current && mediaUrl) {
      // Set the current time of the video in the visualization tab
      videoRef.current.currentTime = currentVideoTime;
    }
  }, [currentVideoTime, mediaType, mediaUrl]);

  const handleSaveMedia = async () => {
    if (!containerRef.current || (!detections && !currentFrameDetections)) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        if (showBoxes && currentFrameDetections) {
          currentFrameDetections.forEach((detection) => {
            const { x1, y1, x2, y2 } = getBoxCoordinates(detection);
            const color = getColorForClass(detection.class);
            
            // Draw box
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Draw label only if showLabels is true
            if (showLabels) {
              ctx.fillStyle = color;
              ctx.font = '14px Arial';
              const label = `${detection.class_name || detection.label} (${Math.round(detection.confidence * 100)}%)`;
              const textWidth = ctx.measureText(label).width;
              
              ctx.fillRect(x1, y1 - 20, textWidth + 10, 20);
              ctx.fillStyle = 'white';
              ctx.fillText(label, x1 + 5, y1 - 5);
            }
          });
        }

        // Convert to blob and download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `detection-result-${Date.now()}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Result saved",
            description: `The ${mediaType === "video" ? "frame" : "image"} has been saved to your downloads folder`,
          });
        }, 'image/png');
      };

      img.src = mediaUrl!;
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to save the ${mediaType === "video" ? "frame" : "image"}`,
        variant: "destructive",
      });
    }
  };

  const generatePDFReport = async () => {
    if ((!detections && !currentFrameDetections) || !mediaUrl) return;
    
    const detectionsToUse = currentFrameDetections || detections;
    if (!detectionsToUse) return;

    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      let yOffset = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.text(`${mediaType === "image" ? "Image" : "Video"} Detection Report`, pageWidth / 2, yOffset, { align: 'center' });
      yOffset += 20;

      // Add timestamp
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, yOffset);
      yOffset += 20;

      // Create a canvas to draw the media with detections
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load the media and draw it with detections
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Set canvas size to match media
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw original media
          ctx.drawImage(img, 0, 0);

          // Draw detections
          detectionsToUse.forEach((detection) => {
            const { x1, y1, x2, y2 } = getBoxCoordinates(detection);
            const color = getColorForClass(detection.class);
            
            // Draw bounding box
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

            // Draw label
            ctx.fillStyle = color;
            ctx.font = '14px Arial';
            const label = `${detection.class_name || detection.label} (${Math.round(detection.confidence * 100)}%)`;
            const textWidth = ctx.measureText(label).width;
            
            ctx.fillRect(x1, y1 - 20, textWidth + 10, 20);
            ctx.fillStyle = 'white';
            ctx.fillText(label, x1 + 5, y1 - 5);
          });

          resolve(null);
        };
        img.onerror = reject;
        img.src = mediaUrl;
      });

      // Calculate dimensions to fit page width
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Add the annotated media to PDF
      pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 20, yOffset, imgWidth, imgHeight);
      yOffset += imgHeight + 20;

      // Add detection summary
      pdf.setFontSize(16);
      pdf.text('Detection Summary', 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(12);
      // Group detections by class
      const groupedDetections = detectionsToUse.reduce((acc, det) => {
        acc[det.class_name] = (acc[det.class_name] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Add summary table
      pdf.text('Objects Detected:', 20, yOffset);
      yOffset += 10;

      Object.entries(groupedDetections).forEach(([className, count]) => {
        pdf.text(`• ${className}: ${count}`, 30, yOffset);
        yOffset += 8;
      });

      yOffset += 10;

      // Add detailed detections
      pdf.setFontSize(16);
      pdf.text('Detailed Detections', 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(12);
      detectionsToUse.forEach((detection, index) => {
        // Check if we need a new page
        if (yOffset > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yOffset = 20;
        }

        const detectionInfo = [
          `Detection #${index + 1}:`,
          `• Class: ${detection.class_name || detection.label}`,
          `• Confidence: ${(detection.confidence * 100).toFixed(2)}%`,
          `• Location: [${getBoxCoordinates(detection).x1}, ${getBoxCoordinates(detection).y1}, ${getBoxCoordinates(detection).x2}, ${getBoxCoordinates(detection).y2}]`,
        ].join('\n');

        pdf.text(detectionInfo, 20, yOffset);
        yOffset += 30;
      });

      // Save the PDF
      pdf.save(`detection-report-${Date.now()}.pdf`);

      toast({
        title: "Report generated",
        description: "The PDF report has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF report",
        variant: "destructive",
      });
    }
  };

  const renderControls = () => {
    return (
      <div className="flex flex-wrap gap-2 mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowBoxes(!showBoxes)}
        >
          <Eye className="h-4 w-4 mr-2" />
          {showBoxes ? 'Hide Boxes' : 'Show Boxes'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowLabels(!showLabels)}
          disabled={!showBoxes}
        >
          <Tag className="h-4 w-4 mr-2" />
          {showLabels ? 'Hide Labels' : 'Show Labels'}
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSaveMedia}
          disabled={!currentFrameDetections || currentFrameDetections.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Save {mediaType === "video" ? "Frame" : "Image"}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={generatePDFReport}
          disabled={!currentFrameDetections || currentFrameDetections.length === 0}
        >
          <FileText className="h-4 w-4 mr-2" />
          Download Report
        </Button>
      </div>
    );
  };

  const renderDetectionOverlays = () => {
    if (!currentFrameDetections?.length || !showBoxes) {
      return null;
    }

    // Use original dimensions if available, otherwise fall back to measured dimensions
    const width = originalDimensions?.width || mediaDimensions?.width || 1;
    const height = originalDimensions?.height || mediaDimensions?.height || 1;

    return currentFrameDetections.map((detection, index) => {
      const { x1, y1, x2, y2 } = getBoxCoordinates(detection);
      
      const scaledX = (x1 / width) * 100;
      const scaledY = (y1 / height) * 100;
      const scaledWidth = ((x2 - x1) / width) * 100;
      const scaledHeight = ((y2 - y1) / height) * 100;
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
            pointerEvents: 'none',
          }}
        >
          {showLabels && (
            <span
              className="absolute text-xs px-1 py-0.5 rounded detection-label whitespace-nowrap"
              style={{ 
                backgroundColor: color,
                color: 'white',
                left: 0,
                top: 0,
                transform: 'translateY(-100%)',
                pointerEvents: 'none',
              }}
            >
              {`${detection.class_name || detection.label} (${Math.round(detection.confidence * 100)}%)`}
            </span>
          )}
        </div>
      );
    });
  };

  const handleListItemHover = (id: string | null) => {
    setHoveredDetection(id);
  };

  const renderDetectionsList = () => {
    if (!currentFrameDetections?.length) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No detections found
        </div>
      );
    }

    // Group detections by class
    const groupedDetections = currentFrameDetections.reduce((acc, det) => {
      if (!acc[det.class_name]) {
        acc[det.class_name] = [];
      }
      acc[det.class_name].push(det);
      return acc;
    }, {} as Record<string, Detection[]>);

    return (
      <div className="space-y-4">
        {mediaType === "video" && (
          <div className="mb-4 p-2 bg-muted/50 rounded-md text-sm">
            Showing detections for frame at time: {currentVideoTime.toFixed(2)}s
          </div>
        )}
        
        {Object.entries(groupedDetections).map(([className, items]) => (
          <div key={className} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">{className}</h3>
              <Badge variant="secondary">
                {items.length} {items.length === 1 ? 'instance' : 'instances'}
              </Badge>
            </div>
            <div className="space-y-2">
              {items.map((detection, index) => (
                <div 
                  key={index}
                  className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2"
                >
                  <div className="flex justify-between items-center">
                    <span>Instance {index + 1}</span>
                    <Badge variant="outline">
                      {Math.round(detection.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs">
                    Location: [{getBoxCoordinates(detection).x1}, {getBoxCoordinates(detection).y1}, {getBoxCoordinates(detection).x2}, {getBoxCoordinates(detection).y2}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!mediaUrl) {
    return (
      <Card className="h-[400px] flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <Search className="h-10 w-10 mb-2 mx-auto opacity-20" />
          <p>Upload media to see detection results</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Eye className="h-4 w-4" />
          Detection Results {mediaType === "video" && "- Video"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="visualization">
              <Eye className="h-4 w-4 mr-2" />
              Visualization
            </TabsTrigger>
            <TabsTrigger value="detections">
              <List className="h-4 w-4 mr-2" />
              Detections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="mt-0">
            <div ref={containerRef} className="relative w-full">
              {isProcessing ? (
                <div className="aspect-video relative overflow-hidden rounded-lg">
                  <Skeleton className="h-full w-full" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
                    <Progress value={45} className="w-40 mb-3" />
                    <p className="text-sm text-muted-foreground">Processing {mediaType}...</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  {mediaType === "image" ? (
                    <img
                      ref={mediaRef as React.RefObject<HTMLImageElement>}
                      src={mediaUrl!}
                      alt="Detection result"
                      className="w-full h-auto rounded-lg"
                    />
                  ) : (
                    // For video, we embed a second video element without controls
                    // This will be synchronized with the main player
                    <video
                      ref={videoRef}
                      src={mediaUrl!}
                      className="w-full rounded-lg"
                      style={originalDimensions ? {
                        aspectRatio: `${originalDimensions.width}/${originalDimensions.height}`
                      } : undefined}
                      playsInline
                      muted
                      // We don't add controls here as we don't want to have duplicate controls
                      // The main video player in Dashboard has controls, and this one is just for visualization
                    />
                  )}
                  {renderDetectionOverlays()}
                </div>
              )}
            </div>
            {renderControls()}
          </TabsContent>

          <TabsContent value="detections" className="mt-0">
            {renderDetectionsList()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default ResultDisplay;
