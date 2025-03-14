
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, Clock, Target, Zap } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MetricsProps {
  processingTime: number | null;
  confidence: number | null;
  fps: number | null;
  isProcessing: boolean;
}

export function PerformanceMetrics({ processingTime, confidence, fps, isProcessing }: MetricsProps) {
  return (
    <Card className="transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
        <CardDescription>
          Detection and processing performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Processing Time</span>
              </div>
              {processingTime !== null && !isProcessing ? (
                <span className="text-sm font-semibold">{processingTime.toFixed(2)} ms</span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress 
              value={isProcessing ? 25 : processingTime !== null ? Math.min(100, (processingTime / 500) * 100) : 0} 
              className={cn(
                "h-2",
                isProcessing && "animate-pulse"
              )}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Average Confidence</span>
              </div>
              {confidence !== null && !isProcessing ? (
                <span className="text-sm font-semibold">{(confidence * 100).toFixed(1)}%</span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress 
              value={isProcessing ? 65 : confidence !== null ? confidence * 100 : 0} 
              className={cn(
                "h-2",
                isProcessing && "animate-pulse"
              )}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Frame Rate</span>
              </div>
              {fps !== null && !isProcessing ? (
                <span className="text-sm font-semibold">{fps.toFixed(1)} FPS</span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress 
              value={isProcessing ? 45 : fps !== null ? (fps / 60) * 100 : 0} 
              className={cn(
                "h-2",
                isProcessing && "animate-pulse"
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMetrics;
