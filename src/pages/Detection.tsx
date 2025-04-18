
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ModelSelector } from "@/components/detection/ModelSelector";
import { ResultDisplay } from "@/components/detection/ResultDisplay";
import { PerformanceMetrics } from "@/components/detection/PerformanceMetrics";
import { CameraFeed } from "@/components/detection/CameraFeed";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

interface Detection {
  id: string;
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number };
  class: number;
  class_name: string;
}

interface ModelPerformance {
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1Score: number | null;
}

interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  modelUrl: string;
  uploadedBy: string;
  uploadDate: string;
  status?: string;
  version?: string;
  useCases?: string[];
  limitations?: string[];
  performance?: ModelPerformance;
}

const Detection = () => {
  const [searchParams] = useSearchParams();
  const mediaUrl = searchParams.get("mediaURL");
  const mediaType = searchParams.get("mediaType") as "image" | "video" | null;

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
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
  const [frameDetections, setFrameDetections] = useState<any[] | null>(null);
  const [totalFrames, setTotalFrames] = useState<number | null>(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/models`,
          { withCredentials: true }
        );
        
        const modelsWithMetrics = response.data.map((model: any) => ({
          id: model.name.toLowerCase(),
          name: model.name,
          type: model.type,
          description: model.description,
          modelUrl: model.modelUrl,
          uploadedBy: model.uploadedBy || "System",
          uploadDate: model.uploadDate || model.createdAt || new Date().toISOString(),
          performance: model.performance || null,
          useCases: model.useCases,
          limitations: model.limitations,
          status: model.status,
          version: model.version,
        }));

        setModels(modelsWithMetrics);
        setSelectedModel(modelsWithMetrics[0]?.id || "");
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
  }, [toast]);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setDetections(null);
    setProcessingTime(null);
    setConfidenceAvg(null);
    setFps(null);
  };

  const handleDetectionsUpdate = (newDetections: Detection[]) => {
    setDetections(newDetections);
  };

  const handleProcessingTimeUpdate = (time: number) => {
    setProcessingTime(time);
    setFps(1000 / time);
  };

  const handleConfidenceAvgUpdate = (avg: number) => {
    setConfidenceAvg(avg);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Detection | Object Tracker</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <div className="container max-w-screen-xl px-4 mt-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3 space-y-6">
              <div className="glass-card p-6">
                <h1 className="text-2xl font-semibold mb-1">
                  Object Detection {mediaType ? `- ${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)}` : "- Live Camera"}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {mediaType ? "Process media for object detection" : "Use your camera for real-time detection"}
                </p>

                {mediaUrl ? (
                  <ResultDisplay
                    mediaUrl={mediaUrl}
                    detections={detections}
                    frameDetections={frameDetections}
                    currentVideoTime={currentVideoTime}
                    totalFrames={totalFrames}
                    isProcessing={isProcessing}
                    mediaType={mediaType || "image"}
                    originalDimensions={originalDimensions}
                    processedVideoUrl={processedVideoUrl}
                    selectedModel={selectedModel}
                    onCacheCleared={() => {
                      setProcessedVideoUrl(null);
                      setDetections(null);
                      setFrameDetections(null);
                    }}
                  />
                ) : (
                  <CameraFeed
                    selectedModel={selectedModel}
                    onDetectionsUpdate={handleDetectionsUpdate}
                    onProcessingTimeUpdate={handleProcessingTimeUpdate}
                    onConfidenceAvgUpdate={handleConfidenceAvgUpdate}
                  />
                )}
              </div>
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

export default Detection;
