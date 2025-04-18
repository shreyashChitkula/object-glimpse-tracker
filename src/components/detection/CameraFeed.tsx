
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Camera, StopCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  class: number;
  class_name: string;
}

interface CameraFeedProps {
  selectedModel: string;
  onDetectionsUpdate: (detections: Detection[]) => void;
  onProcessingTimeUpdate: (time: number) => void;
  onConfidenceAvgUpdate: (avg: number) => void;
}

export function CameraFeed({
  selectedModel,
  onDetectionsUpdate,
  onProcessingTimeUpdate,
  onConfidenceAvgUpdate,
}: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [detectionInterval, setDetectionInterval] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsStreaming(true);
        
        // Start detection after camera is ready
        const interval = setInterval(() => {
          captureFrame();
        }, 500); // Adjust for frame rate (2 FPS)
        
        setDetectionInterval(interval);
        
        toast({
          title: "Camera started",
          description: "Live detection is now running"
        });
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (detectionInterval) {
      clearInterval(detectionInterval);
      setDetectionInterval(null);
    }
    
    setIsStreaming(false);
    
    // Clear the canvas
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
    }
    
    toast({
      title: "Camera stopped",
      description: "Live detection has been stopped"
    });
  };

  const captureFrame = async () => {
    if (!videoRef.current || !hiddenCanvasRef.current || !overlayCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = hiddenCanvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) return;
    
    // Make sure video is playing before capturing
    if (video.paused || video.ended) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    overlayCanvasRef.current.width = video.videoWidth;
    overlayCanvasRef.current.height = video.videoHeight;
    
    // Draw the current frame to the hidden canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert the frame to a data URL
    const dataURL = canvas.toDataURL("image/jpeg");
    
    try {
      const startTime = performance.now();
      
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/detect`,
        {
          mediaUrl: dataURL,
          model: selectedModel,
        },
        { withCredentials: true }
      );
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;
      
      // Update processing time
      onProcessingTimeUpdate(processingTime);
      
      const transformedDetections: Detection[] = response.data.detections.map(
        (det: any) => ({
          id: det.id || String(Math.random()),
          label: det.label || det.class_name,
          confidence: det.confidence,
          box: Array.isArray(det.box)
            ? {
                x: det.box[0],
                y: det.box[1],
                width: det.box[2] - det.box[0],
                height: det.box[3] - det.box[1],
              }
            : det.box,
          class: det.class || 0,
          class_name: det.class_name || det.label,
        })
      );
      
      // Calculate average confidence
      const avgConfidence =
        transformedDetections.reduce((acc, det) => acc + det.confidence, 0) /
        (transformedDetections.length || 1);
      
      // Update parent component with detections
      onDetectionsUpdate(transformedDetections);
      onConfidenceAvgUpdate(avgConfidence);
      
      // Draw bounding boxes
      drawBoundingBoxes(transformedDetections);
    } catch (err) {
      console.error("Error detecting objects:", err);
    }
  };

  const drawBoundingBoxes = (detections: Detection[]) => {
    if (!overlayCanvasRef.current) return;
    
    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) return;
    
    // Clear previous boxes
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach((det) => {
      const { x, y, width, height } = det.box;
      
      // Draw box
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw label background
      const label = `${det.class_name} (${(det.confidence * 100).toFixed(1)}%)`;
      const textMetrics = ctx.measureText(label);
      const textHeight = 16; // Approximate height for 16px font
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(
        x,
        y > 20 ? y - textHeight : y,
        textMetrics.width + 6,
        textHeight
      );
      
      // Draw label text
      ctx.fillStyle = "white";
      ctx.font = "16px Arial";
      ctx.fillText(
        label,
        x + 3,
        y > 20 ? y - 5 : y + 15
      );
    });
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [stream, detectionInterval]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Live Camera Detection</h3>
        <div>
          {!isStreaming ? (
            <Button 
              onClick={startCamera} 
              className="gap-2"
              disabled={!selectedModel}
            >
              <Camera className="h-4 w-4" />
              Start Camera
            </Button>
          ) : (
            <Button 
              onClick={stopCamera} 
              variant="destructive"
              className="gap-2"
            >
              <StopCircle className="h-4 w-4" />
              Stop Camera
            </Button>
          )}
        </div>
      </div>
      
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        {!isStreaming && (
          <div className="absolute inset-0 flex items-center justify-center text-white/70">
            <p>Start camera to begin live detection</p>
          </div>
        )}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-contain"
        />
        <canvas
          ref={overlayCanvasRef}
          className="absolute top-0 left-0 w-full h-full"
        />
        <canvas
          ref={hiddenCanvasRef}
          className="hidden"
        />
      </div>
    </div>
  );
}
