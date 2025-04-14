
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BarChart2, Clock, Target, Zap, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { BadgeInfo } from "lucide-react";

interface MetricsProps {
  processingTime: number | null;
  confidence: number | null;
  fps: number | null;
  isProcessing: boolean;
  precision?: number | null;
  recall?: number | null;
  f1Score?: number | null;
}

export function PerformanceMetrics({
  processingTime,
  confidence,
  fps,
  isProcessing,
  precision = null,
  recall = null,
  f1Score = null,
}: MetricsProps) {
  return (
    <Card className="transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart2 className="h-4 w-4" />
          Performance Metrics
        </CardTitle>
        <CardDescription>Detection and processing performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Processing Time</span>
              </div>
              {processingTime !== null &&
              !isNaN(processingTime) &&
              !isProcessing ? (
                <span className="text-sm font-semibold">
                  {processingTime.toFixed(2)} ms
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress
              value={
                isProcessing
                  ? 25
                  : processingTime !== null
                  ? Math.min(100, (processingTime / 500) * 100)
                  : 0
              }
              className={cn("h-2", isProcessing && "animate-pulse")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Average Confidence</span>
              </div>
              {confidence !== null && !isNaN(confidence) && !isProcessing ? (
                <span className="text-sm font-semibold">
                  {(confidence * 100).toFixed(1)}%
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress
              value={
                isProcessing ? 65 : confidence !== null ? confidence * 100 : 0
              }
              className={cn("h-2", isProcessing && "animate-pulse")}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">Frame Rate</span>
              </div>
              {fps !== null && !isNaN(fps) && !isProcessing ? (
                <span className="text-sm font-semibold">
                  {fps.toFixed(1)} FPS
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">--</span>
              )}
            </div>
            <Progress
              value={isProcessing ? 45 : fps !== null ? (fps / 60) * 100 : 0}
              className={cn("h-2", isProcessing && "animate-pulse")}
            />
          </div>

          {precision !== null && !isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Precision</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                          <BadgeInfo className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Ratio of correctly predicted positive observations to total predicted positives</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-semibold">
                  {precision.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={precision}
                className="h-2 bg-muted"
              />
            </div>
          )}
          
          {recall !== null && !isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-rose-500" />
                  <span className="text-sm font-medium">Recall</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-5 w-5 p-0">
                          <BadgeInfo className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="text-xs">Ratio of correctly predicted positive observations to all actual positives</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-sm font-semibold">
                  {recall.toFixed(1)}%
                </span>
              </div>
              <Progress
                value={recall}
                className="h-2 bg-muted"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PerformanceMetrics;
