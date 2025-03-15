import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UploadArea } from "@/components/upload/UploadArea";
import { ModelSelector } from "@/components/detection/ModelSelector";
import { ResultDisplay } from "@/components/detection/ResultDisplay";
import { PerformanceMetrics } from "@/components/detection/PerformanceMetrics";
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

// Sample detection data (would come from the ML model in a real app)
const sampleDetections = [
  {
    id: "1",
    label: "Person",
    confidence: 0.92,
    bbox: { x: 50, y: 100, width: 100, height: 200 },
  },
  {
    id: "2",
    label: "Car",
    confidence: 0.87,
    bbox: { x: 200, y: 150, width: 150, height: 100 },
  },
  {
    id: "3",
    label: "Bicycle",
    confidence: 0.78,
    bbox: { x: 400, y: 200, width: 80, height: 50 },
  },
];

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const imageUrlFromGallery = searchParams.get("mediaURL");

  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<typeof sampleDetections | null>(
    null
  );
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [confidenceAvg, setConfidenceAvg] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
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

  // Load image from URL when component mounts
  useEffect(() => {
    if (imageUrlFromGallery) {
      setUploadedImage(imageUrlFromGallery);
    }
  }, [imageUrlFromGallery]);

  const handleImageUpload = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    setDetections(null);
    setProcessingTime(null);
    setConfidenceAvg(null);
    setFps(null);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    if (uploadedImage && detections) {
      // If an image is already processed, reprocess with the new model
      handleProcessImage();
    }
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload an image first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setDetections(null);
    const model = models.find((m) => m.id === selectedModel)?.name;
    console.log("imageURL", uploadedImage, "model", model);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/detect`,
        {
          imageUrl: uploadedImage,
          model,
        },
        { withCredentials: true }
      );

      console.log("detected responses", response.data);

      setDetections(response.data.detections);
      setOriginalDimensions({
        width: response.data.original_width,
        height: response.data.original_height,
      });

      // Calculate metrics
      if (response.data.detections.length > 0) {
        const avgConfidence =
          response.data.detections.reduce(
            (acc: number, det: any) => acc + det.confidence,
            0
          ) / response.data.detections.length;
        setConfidenceAvg(avgConfidence);
      }

      // Optional: Show success toast
      toast({
        title: "Detection Complete",
        description: `Found ${response.data.detections.length} objects`,
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Error",
        description: "Failed to process image",
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
        description: "Process an image first to generate a report.",
        variant: "destructive",
      });
      return;
    }

    // Create a simple report text
    const reportLines = [
      `Object Detection Report - ${new Date().toLocaleString()}`,
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
                  {!imageUrlFromGallery
                    ? "Upload an image and run detection models"
                    : "Image loaded from gallery. You can upload a different image or proceed with detection."}
                </p>

                {imageUrlFromGallery ? (
                  <div className="relative aspect-video w-full mb-6">
                    <img
                      src={imageUrlFromGallery}
                      alt="Input image"
                      className="object-contain w-full h-full rounded-lg border border-border"
                    />
                  </div>
                ) : (
                  <UploadArea onImageUpload={handleImageUpload} />
                )}

                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <Button
                    className="gap-2"
                    disabled={!uploadedImage || isProcessing}
                    onClick={handleProcessImage}
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
                imageUrl={uploadedImage}
                detections={detections}
                isProcessing={isProcessing}
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
