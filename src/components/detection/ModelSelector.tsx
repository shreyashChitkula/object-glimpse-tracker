import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Cog,
  BarChart,
  BadgeInfo,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ModelPerformance {
  speed: number;
  accuracy: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
}

interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  modelUrl: string;
  uploadedBy: string;
  uploadDate: string;
  performance?: ModelPerformance;
  version?: string;
  status?: "active" | "experimental" | "deprecated";
  useCases?: string[];
  limitations?: string[];
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({
  models,
  selectedModel,
  onSelectModel,
}: ModelSelectorProps) {
  const [openModelDetails, setOpenModelDetails] = React.useState(false);
  const [selectedModelForDetails, setSelectedModelForDetails] =
    React.useState<Model | null>(null);

  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  const currentModel = models.find((model) => model.id === selectedModel);

  const handleOpenModelDetails = (model: Model) => {
    setSelectedModelForDetails(model);
    setOpenModelDetails(true);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;

    const statusLower = status.toLowerCase();

    let badgeClass = "px-2 py-1 text-xs rounded-full font-medium";

    switch (statusLower) {
      case "active":
        return (
          <span
            className={`${badgeClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}
          >
            Active
          </span>
        );
      case "deprecated":
        return (
          <span
            className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`}
          >
            Deprecated
          </span>
        );
      case "experimental":
        return (
          <span
            className={`${badgeClass} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`}
          >
            Experimental
          </span>
        );
      case "beta":
        return (
          <span
            className={`${badgeClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`}
          >
            Beta
          </span>
        );
      default:
        return (
          <span
            className={`${badgeClass} bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300`}
          >
            {status}
          </span>
        );
    }
  };

  return (
    <Card className="transition-all duration-300 animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cog className="h-4 w-4" />
              Model Selection
            </CardTitle>
            <CardDescription>
              Choose a detection model based on your needs
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model-select">Detection Model</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger id="model-select" className="w-full">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {models.map((model) => (
                  <SelectItem key={model.id} value={model.id} className="py-2">
                    <div className="flex justify-between w-full items-center">
                      <span>{model.name}</span>
                      {model.status && getStatusBadge(model.status)}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentModel && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium flex items-center gap-1.5">
                    {currentModel.name}
                    {currentModel.version && (
                      <span className="text-xs text-muted-foreground">
                        v{currentModel.version}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {currentModel.type?.replace(/_/g, " ")}
                    </Badge>
                    {getStatusBadge(currentModel.status)}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => {
                    setSelectedModelForDetails(currentModel);
                    setOpenModelDetails(true);
                  }}
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>

              {/* {currentModel.performance && (
                <div className="flex items-center justify-between gap-4">
                  {currentModel.performance.speed && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Speed</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <BadgeInfo className="h-3 w-3" />
                                <span className="sr-only">Speed Info</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Processing speed in frames per second
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${currentModel.performance.speed || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {currentModel.performance.accuracy && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Accuracy</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                              >
                                <BadgeInfo className="h-3 w-3" />
                                <span className="sr-only">Accuracy Info</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Detection accuracy percentage
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{
                            width: `${currentModel.performance.accuracy}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )} */}
            </div>
          )}
        </div>
      </CardContent>

      <Dialog open={openModelDetails} onOpenChange={setOpenModelDetails}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedModelForDetails && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <Box className="h-5 w-5" />
                    {selectedModelForDetails.name}
                    {selectedModelForDetails.version && (
                      <span className="text-sm font-normal ml-1">
                        v{selectedModelForDetails.version}
                      </span>
                    )}
                  </DialogTitle>
                  {getStatusBadge(selectedModelForDetails.status)}
                </div>
                <DialogDescription>
                  {selectedModelForDetails.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" /> Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-md">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">
                        {selectedModelForDetails.type?.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-medium">
                        {selectedModelForDetails.version || "1.0.0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Added By</p>
                      <p className="font-medium">
                        {selectedModelForDetails.uploadedBy}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Upload Date</p>
                      <p className="font-medium">
                        {new Date(
                          selectedModelForDetails.uploadDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                {selectedModelForDetails.performance &&
                  Object.values(selectedModelForDetails.performance).some(
                    (v) => v
                  ) && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <BarChart className="h-4 w-4" /> Performance Metrics
                      </h3>
                      <div className="grid grid-cols-2 gap-4 bg-muted/50 p-3 rounded-md">
                        {/* Accuracy */}
                        {selectedModelForDetails.performance?.accuracy && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs">Accuracy</p>
                              <span className="text-xs font-medium">
                                {selectedModelForDetails.performance?.accuracy}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-green-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${
                                    selectedModelForDetails.performance
                                      ?.accuracy || 0
                                  }%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Precision */}
                        {selectedModelForDetails.performance?.precision && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs">Precision</p>
                              <span className="text-xs font-medium">
                                {selectedModelForDetails.performance.precision}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-purple-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${selectedModelForDetails.performance.precision}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Recall */}
                        {selectedModelForDetails.performance?.recall && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs">Recall</p>
                              <span className="text-xs font-medium">
                                {selectedModelForDetails.performance.recall}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${selectedModelForDetails.performance.recall}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* F1 Score */}
                        {selectedModelForDetails.performance?.f1Score && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs">F1 Score</p>
                              <span className="text-xs font-medium">
                                {selectedModelForDetails.performance.f1Score}%
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full bg-rose-500 rounded-full transition-all duration-300"
                                style={{
                                  width: `${selectedModelForDetails.performance.f1Score}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                {/* Use Cases */}
                {selectedModelForDetails.useCases &&
                  selectedModelForDetails.useCases.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" /> Use Cases
                      </h3>
                      <ul className="list-disc space-y-1 text-sm pl-5 bg-muted/50 p-3 rounded-md">
                        {selectedModelForDetails.useCases.map(
                          (useCase, index) => (
                            <li key={index}>{useCase}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {/* Limitations */}
                {selectedModelForDetails.limitations &&
                  selectedModelForDetails.limitations.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" /> Limitations
                      </h3>
                      <ul className="list-disc space-y-1 text-sm pl-5 bg-muted/50 p-3 rounded-md">
                        {selectedModelForDetails.limitations.map(
                          (limitation, index) => (
                            <li key={index}>{limitation}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>

              <DialogFooter className="gap-2">
                {selectedModel !== selectedModelForDetails.id && (
                  <Button
                    onClick={() => {
                      onSelectModel(selectedModelForDetails.id);
                      setOpenModelDetails(false);
                    }}
                  >
                    Select Model
                  </Button>
                )}
                <Button
                  variant={
                    selectedModel === selectedModelForDetails.id
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setOpenModelDetails(false)}
                >
                  {selectedModel === selectedModelForDetails.id
                    ? "Close"
                    : "Cancel"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ModelSelector;
