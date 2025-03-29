
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UploadArea } from "@/components/upload/UploadArea";
import { ModelSelector } from "@/components/detection/ModelSelector";
import { ResultDisplay } from "@/components/detection/ResultDisplay";
import { PerformanceMetrics } from "@/components/detection/PerformanceMetrics";
import { MediaPlayer } from "@/components/detection/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

interface Model {
  id: string;
  name: string;
  description: string;
  recommended?: boolean;
  performance: {
    speed: number;
    accuracy: number;
  };
}

interface Detection {
  id: string;
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  class: number;
  class_name: string;
}

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const mediaUrlFromGallery = searchParams.get("mediaURL");
  const mediaTypeFromGallery = searchParams.get("mediaType") || "image";

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<Detection[] | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [confidenceAvg, setConfidenceAvg] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/models`,
          { withCredentials: true }
        );

        // Transform the backend data to include random performance metrics
        const modelsWithMetrics = response.data.map((model: any) => ({
          id: model.name.toLowerCase(),
          name: model.name,
          description: `${model.name} model for object detection`,
          recommended: Math.random() > 0.8, // 20% chance of being recommended
          performance: {
            speed: Math.floor(Math.random() * 60) + 40, // Random speed between 40-100
            accuracy: Math.floor(Math.random() * 30) + 70, // Random accuracy between 70-100
          },
        }));

        setModels(modelsWithMetrics);
        setSelectedModel(modelsWithMetrics[0].id); // Set first model as default
      } catch (error) {
        console.error("Error fetching models:", error);
        toast({
          title: "Error",
          description: "Failed to load available models",
          variant: "destructive",
        });
      }
    };

    fetchModels();
  }, []);

  // Load media from URL when component mounts
  useEffect(() => {
    if (mediaUrlFromGallery) {
      setUploadedMedia(mediaUrlFromGallery);
      setMediaType(mediaTypeFromGallery as 'image' | 'video');
    }
  }, [mediaUrlFromGallery, mediaTypeFromGallery]);

  const handleMediaUpload = (file: File, type: 'image' | 'video') => {
    const mediaUrl = URL.createObjectURL(file);
    setUploadedMedia(mediaUrl);
    setMediaType(type);
    setDetections(null);
    setProcessingTime(null);
    setConfidenceAvg(null);
    setFps(null);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    if (uploadedMedia && detections) {
      // If media is already processed, reprocess with the new model
      // handleProcessMedia();
    }
  };

  const handleVideoTimeUpdate = (currentTime: number) => {
    setCurrentVideoTime(currentTime);
    // In a real implementation, we would query for detections at this timestamp
    // or use a pre-processed detection timeline
  };

  const handleProcessMedia = async () => {
    if (!uploadedMedia) {
      toast({
        title: "No media selected",
        description: "Please upload an image or video first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDetections(null);
    const model = models.find((m) => m.id === selectedModel)?.name;
    console.log("mediaURL", uploadedMedia, "model", model, "type", mediaType);
    
    try {
      const endpoint = mediaType === 'image' 
        ? `${import.meta.env.VITE_BACKEND_URL}/auth/detect`
        : `${import.meta.env.VITE_BACKEND_URL}/auth/detect_video`;
        
      const response = await axios.post(
        endpoint,
        {
          mediaUrl: uploadedMedia,
          model,
          ...(mediaType === 'video' && { currentTime: currentVideoTime }),
        },
        { withCredentials: true }
      );

      console.log("detection response", response.data);

      // Transform the detections to match our interface
      const transformedDetections: Detection[] = response.data.detections.map((det: any) => ({
        id: det.id || String(Math.random()),
        label: det.label || det.class_name,
        confidence: det.confidence,
        box: det.bbox || det.box,
        class: det.class || 0,
        class_name: det.class_name || det.label,
      }));

      setDetections(transformedDetections);
      setOriginalDimensions({
        width: response.data.original_width,
        height: response.data.original_height,
      });

      // Calculate metrics
      if (transformedDetections.length > 0) {
        const avgConfidence =
          transformedDetections.reduce(
            (acc: number, det: any) => acc + det.confidence,
            0
          ) / transformedDetections.length;
        setConfidenceAvg(avgConfidence);
      }

      // Optional: Show success toast
      toast({
        title: "Detection Complete",
        description: `Found ${transformedDetections.length} objects`,
      });
    } catch (error) {
      console.error("Error processing media:", error);
      toast({
        title: "Error",
        description: "Failed to process media",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!detections) {
      toast({
        title: "No data to download",
        description: "Process media first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    // Create a simple report text
    const reportLines = [
      `Object Detection Report - ${new Date().toLocaleString()}`,
      `Media Type: ${mediaType}`,
      `Model: ${models.find((m) => m.id === selectedModel)?.name}`,
      `Processing Time: ${processingTime?.toFixed(2)} ms`,
      `Average Confidence: ${(confidenceAvg || 0) * 100}%`,
      `Frame Rate: ${fps?.toFixed(1)} FPS`,
      "\nDetected Objects:",
      ...detections.map(
        (d) => `- ${d.label}: ${(d.confidence * 100).toFixed(1)}% confidence`
      ),
    ];

    const reportText = reportLines.join("\n");

    // Create and download the report file
    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "detection-report.txt";
    link.click();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Dashboard | Object Tracker</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <div className="container max-w-screen-xl px-4 mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3 space-y-6">
              <div className="glass-card p-6">
                <h1 className="text-2xl font-semibold mb-1">
                  Object Detection Dashboard
                </h1>
                <p className="text-muted-foreground mb-6">
                  {!uploadedMedia
                    ? "Upload media and run detection models"
                    : `${mediaType === 'image' ? 'Image' : 'Video'} loaded from gallery. You can upload a different media or proceed with detection.`}
                </p>

                {uploadedMedia ? (
                  <div className="mb-6">
                    <MediaPlayer 
                      src={uploadedMedia} 
                      type={mediaType} 
                      isProcessing={isProcessing}
                      onTimeUpdate={mediaType === 'video' ? handleVideoTimeUpdate : undefined}
                    />
                  </div>
                ) : (
                  <UploadArea onMediaUpload={handleMediaUpload} />
                )}

                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <Button
                    className="gap-2"
                    disabled={!uploadedMedia || isProcessing}
                    onClick={handleProcessMedia}
                  >
                    {isProcessing ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {isProcessing ? "Processing..." : "Run Detection"}
                  </Button>

                  <Button
                    variant="outline"
                    className="gap-2"
                    disabled={!detections}
                    onClick={handleDownloadReport}
                  >
                    <Download className="h-4 w-4" />
                    Download Report
                  </Button>
                </div>
              </div>

              <ResultDisplay
                imageUrl={uploadedMedia}
                detections={detections}
                isProcessing={isProcessing}
                mediaType={mediaType}
              />
            </div>

            <div className="w-full md:w-1/3 space-y-6">
              <ModelSelector
                models={models}
                selectedModel={selectedModel}
                onSelectModel={handleModelSelect}
              />

              <PerformanceMetrics
                processingTime={processingTime}
                confidence={confidenceAvg}
                fps={fps}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
