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
import { set } from "date-fns";
import { version } from "os";

interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  modelUrl: string;
  uploadedBy: string;
  uploadDate: string;
  status?: "active" | "deprecated" | "experimental" | "beta" | string;
  version?: string;
  useCases?: string[];
  limitations?: string[];
  performance?: {
    accuracy?: number;
    precision?: number;
    recall?: number;
    f1Score?: number;
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
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
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
  const { toast } = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/models`,
          { withCredentials: true }
        );
        console.log("models response", response.data);

        // Transform the backend data to match our interface
        const modelsWithMetrics = response.data.map((model: any) => ({
          id: model.name.toLowerCase(),
          name: model.name,
          type: model.type,
          description: model.description,
          modelUrl: model.modelUrl,
          uploadedBy: model.uploadedBy || "System",
          uploadDate:
            model.uploadDate || model.createdAt || new Date().toISOString(),
          performance: model.performance,
          useCases: model.useCases,
          limitations: model.limitations,
          status: model.status,
          version: model.version,
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
      setMediaType(mediaTypeFromGallery as "image" | "video");
    }
  }, [mediaUrlFromGallery, mediaTypeFromGallery]);

  const handleMediaUpload = (file: File, type: "image" | "video") => {
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

    // Get the corresponding detections for the current video frame
    if (frameDetections && totalFrames) {
      // Calculate which frame index corresponds to current time
      const videoElement = document.querySelector("video");
      const duration = videoElement?.duration || 0;

      if (duration > 0 && totalFrames > 0) {
        const frameIndex = Math.min(
          Math.floor((currentTime / duration) * totalFrames),
          frameDetections.length - 1
        );

        // Update detections based on current frame
        if (frameDetections[frameIndex]?.detections) {
          const currentFrameDetections = frameDetections[
            frameIndex
          ].detections.map((det: any) => ({
            id: String(Math.random()),
            label: det.class_name,
            confidence: det.confidence,
            box: det.box,
            class: det.class || 0,
            class_name: det.class_name,
          }));
          setDetections(currentFrameDetections);
        }
      }
    }
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
    const modelUrl = models.find((m) => m.id === selectedModel)?.modelUrl;
    console.log(
      "mediaURL",
      uploadedMedia,
      "model",
      model,
      "modelUrl",
      modelUrl,
      "type",
      mediaType
    );
    setConfidenceAvg(null);
    setFps(null);
    setProcessingTime(null);
    try {
      const endpoint =
        mediaType === "image"
          ? `${import.meta.env.VITE_BACKEND_URL}/auth/detect`
          : `${import.meta.env.VITE_BACKEND_URL}/auth/detect_video`;

      const response = await axios.post(
        endpoint,
        {
          mediaUrl: uploadedMedia,
          model,
          modelUrl,
        },
        { withCredentials: true }
      );

      console.log("detection response", response.data);

      if (mediaType === "image") {
        // Transform the detections to match our interface
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

        setDetections(transformedDetections);
      } else {
        // For video, we'll use the first frame's detections as the initial display
        if (
          response.data.frame_detections &&
          response.data.frame_detections.length > 0
        ) {
          const firstFrameDetections =
            response.data.frame_detections[0].detections.map((det: any) => ({
              id: String(Math.random()),
              label: det.class_name,
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
              class_name: det.class_name,
            }));
          setDetections(firstFrameDetections);
          setFrameDetections(response.data.frame_detections);
          setTotalFrames(response.data.total_frames);
        }
      }

      setOriginalDimensions({
        width: response.data.width || response.data.original_width,
        height: response.data.height || response.data.original_height,
      });

      // Calculate metrics
      if (mediaType === "image") {
        const avgConfidence =
          response.data.detections.reduce(
            (acc: number, det: any) => acc + det.confidence,
            0
          ) / response.data.detections.length;
        console.log("avgConfidence", avgConfidence);
        // Check if performance metrics exist in the response
        if (response.data.performance) {
          setConfidenceAvg(
            response.data.performance.confidenceAvg || avgConfidence
          );
          setFps(response.data.performance.fps);
          setProcessingTime(response.data.performance.processingTime);
        } else {
          // Fallback to calculated values
          setConfidenceAvg(avgConfidence);
          setFps(null);
          setProcessingTime(null);
        }
      } else if (
        mediaType === "video" &&
        response.data.frame_detections &&
        response.data.frame_detections.length > 0
      ) {
        // Calculate average confidence across all frames
        let totalConfidence = 0;
        let totalDetections = 0;

        response.data.frame_detections.forEach((frame: any) => {
          frame.detections.forEach((det: any) => {
            totalConfidence += det.confidence;
            totalDetections++;
          });
        });

        // Use performance metrics from backend response
        if (response.data.performance) {
          setConfidenceAvg(
            response.data.performance.confidenceAvg ||
              (totalDetections > 0 ? totalConfidence / totalDetections : 0)
          );
          setFps(response.data.performance.fps);
          setProcessingTime(response.data.performance.processingTime);
        } else {
          // Fallback to calculated values
          setConfidenceAvg(
            totalDetections > 0 ? totalConfidence / totalDetections : 0
          );
          setFps(null);
          setProcessingTime(null);
        }
      }

      // Optional: Show success toast
      toast({
        title: "Detection Complete",
        description:
          mediaType === "image"
            ? `Found ${response.data.detections.length} objects`
            : `Processed ${
                response.data.frame_detections?.length || 0
              } video frames`,
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
                    : `${
                        mediaType === "image" ? "Image" : "Video"
                      } loaded from gallery. You can upload a different media or proceed with detection.`}
                </p>

                {uploadedMedia ? (
                  <div className="mb-6">
                    <MediaPlayer
                      src={uploadedMedia}
                      type={mediaType}
                      isProcessing={isProcessing}
                      onTimeUpdate={
                        mediaType === "video"
                          ? handleVideoTimeUpdate
                          : undefined
                      }
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
                mediaUrl={uploadedMedia}
                detections={detections}
                frameDetections={frameDetections}
                currentVideoTime={currentVideoTime}
                totalFrames={totalFrames}
                isProcessing={isProcessing}
                mediaType={mediaType}
                originalDimensions={originalDimensions}
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
