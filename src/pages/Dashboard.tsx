
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { UploadArea } from '@/components/upload/UploadArea';
import { ModelSelector } from '@/components/detection/ModelSelector';
import { ResultDisplay } from '@/components/detection/ResultDisplay';
import { PerformanceMetrics } from '@/components/detection/PerformanceMetrics';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample model data
const models = [
  {
    id: 'yolov8n',
    name: 'YOLOv8 Nano',
    description: 'Lightweight model optimized for speed with good accuracy. Best for environments with limited resources.',
    recommended: true,
    performance: {
      speed: 90,
      accuracy: 75,
    },
  },
  {
    id: 'yolov8s',
    name: 'YOLOv8 Small',
    description: 'Balanced model with good trade-off between speed and accuracy.',
    performance: {
      speed: 75,
      accuracy: 85,
    },
  },
  {
    id: 'yolov8m',
    name: 'YOLOv8 Medium',
    description: 'Higher accuracy model with slightly reduced speed. Good for detailed object detection.',
    performance: {
      speed: 60,
      accuracy: 92,
    },
  },
  {
    id: 'yolov8l',
    name: 'YOLOv8 Large',
    description: 'High accuracy model for demanding applications where precision is critical.',
    performance: {
      speed: 40,
      accuracy: 96,
    },
  },
];

// Sample detection data (would come from the ML model in a real app)
const sampleDetections = [
  {
    id: '1',
    label: 'Person',
    confidence: 0.92,
    bbox: { x: 50, y: 100, width: 100, height: 200 },
  },
  {
    id: '2',
    label: 'Car',
    confidence: 0.87,
    bbox: { x: 200, y: 150, width: 150, height: 100 },
  },
  {
    id: '3',
    label: 'Bicycle',
    confidence: 0.78,
    bbox: { x: 400, y: 200, width: 80, height: 50 },
  },
];

const Dashboard = () => {
  const [selectedModel, setSelectedModel] = useState('yolov8n');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<typeof sampleDetections | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [confidenceAvg, setConfidenceAvg] = useState<number | null>(null);
  const [fps, setFps] = useState<number | null>(null);
  const { toast } = useToast();

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

  const handleProcessImage = () => {
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
    
    // Simulate processing delay
    const processingDelay = Math.floor(Math.random() * 1000) + 1000; // Random between 1-2 seconds
    
    setTimeout(() => {
      // Simulate different results based on the model
      const modelIndex = models.findIndex(m => m.id === selectedModel);
      const accuracyFactor = models[modelIndex].performance.accuracy / 100;
      const speedFactor = models[modelIndex].performance.speed / 100;
      
      // Apply model factors to sample data
      const modifiedDetections = sampleDetections.map(detection => ({
        ...detection,
        confidence: Math.min(detection.confidence * accuracyFactor, 0.99),
      }));
      
      // Set detection results and metrics
      setDetections(modifiedDetections);
      setProcessingTime(500 - (speedFactor * 300)); // Lower is better (milliseconds)
      setConfidenceAvg(modifiedDetections.reduce((acc, d) => acc + d.confidence, 0) / modifiedDetections.length);
      setFps(10 + (speedFactor * 50)); // Higher is better (frames per second)
      setIsProcessing(false);
      
      toast({
        title: "Processing complete",
        description: `Detected ${modifiedDetections.length} objects with ${selectedModel}`,
      });
    }, processingDelay);
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
      `Model: ${models.find(m => m.id === selectedModel)?.name}`,
      `Processing Time: ${processingTime?.toFixed(2)} ms`,
      `Average Confidence: ${(confidenceAvg || 0) * 100}%`,
      `Frame Rate: ${fps?.toFixed(1)} FPS`,
      '\nDetected Objects:',
      ...detections.map(d => `- ${d.label}: ${(d.confidence * 100).toFixed(1)}% confidence`)
    ];
    
    const reportText = reportLines.join('\n');
    
    // Create and download the report file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'detection-report.txt';
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
                <h1 className="text-2xl font-semibold mb-1">Object Detection Dashboard</h1>
                <p className="text-muted-foreground mb-6">Upload an image and run detection models</p>
                
                <UploadArea onImageUpload={handleImageUpload} />
                
                <div className="mt-6 flex flex-wrap gap-3 justify-end">
                  <Button
                    className="gap-2"
                    disabled={!uploadedImage || isProcessing}
                    onClick={handleProcessImage}
                  >
                    {isProcessing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isProcessing ? 'Processing...' : 'Run Detection'}
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
