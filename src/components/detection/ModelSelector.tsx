
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cog, BarChart, BadgeInfo, Info, CheckCircle2, AlertTriangle, XCircle, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

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
  status?: 'active' | 'experimental' | 'deprecated';
  useCases?: string[];
  limitations?: string[];
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  const [openModelDetails, setOpenModelDetails] = React.useState(false);
  const [selectedModelForDetails, setSelectedModelForDetails] = React.useState<Model | null>(null);

  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  const currentModel = models.find(model => model.id === selectedModel);

  const handleOpenModelDetails = (model: Model) => {
    setSelectedModelForDetails(model);
    setOpenModelDetails(true);
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
    
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </Badge>
        );
      case 'experimental':
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-200 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Experimental
          </Badge>
        );
      case 'deprecated':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Deprecated
          </Badge>
        );
      default:
        return null;
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
          {currentModel && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              Recommended
            </Badge>
          )}
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
                <div className="text-sm text-muted-foreground">{currentModel.description}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 ml-2 shrink-0"
                  onClick={() => handleOpenModelDetails(currentModel)}
                >
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Model Details</span>
                </Button>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Speed</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <BadgeInfo className="h-3 w-3" />
                            <span className="sr-only">Speed Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Processing speed in frames per second</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${currentModel.performance?.speed || 0}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Accuracy</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <BadgeInfo className="h-3 w-3" />
                            <span className="sr-only">Accuracy Info</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Detection accuracy percentage</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${currentModel.performance?.accuracy || 0}%` }}
                    />
                  </div>
                </div>
              </div>
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
                  <h3 className="text-sm font-medium">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{selectedModelForDetails.type?.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Version</p>
                      <p className="font-medium">{selectedModelForDetails.version || "1.0.0"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Added By</p>
                      <p className="font-medium">{selectedModelForDetails.uploadedBy}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Upload Date</p>
                      <p className="font-medium">{new Date(selectedModelForDetails.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                
                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs">Speed</p>
                        <span className="text-xs font-medium">{selectedModelForDetails.performance?.speed}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${selectedModelForDetails.performance?.speed || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs">Accuracy</p>
                        <span className="text-xs font-medium">{selectedModelForDetails.performance?.accuracy}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${selectedModelForDetails.performance?.accuracy || 0}%` }}
                        />
                      </div>
                    </div>
                    
                    {selectedModelForDetails.performance?.precision !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs">Precision</p>
                          <span className="text-xs font-medium">{selectedModelForDetails.performance.precision}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-purple-500 rounded-full transition-all duration-300"
                            style={{ width: `${selectedModelForDetails.performance.precision}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedModelForDetails.performance?.recall !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs">Recall</p>
                          <span className="text-xs font-medium">{selectedModelForDetails.performance.recall}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${selectedModelForDetails.performance.recall}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {selectedModelForDetails.performance?.f1Score !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs">F1 Score</p>
                          <span className="text-xs font-medium">{selectedModelForDetails.performance.f1Score}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full transition-all duration-300"
                            style={{ width: `${selectedModelForDetails.performance.f1Score}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Use Cases */}
                {selectedModelForDetails.useCases && selectedModelForDetails.useCases.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Use Cases</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                      {selectedModelForDetails.useCases.map((useCase, index) => (
                        <li key={index}>{useCase}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Limitations */}
                {selectedModelForDetails.limitations && selectedModelForDetails.limitations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Limitations</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm pl-2">
                      {selectedModelForDetails.limitations.map((limitation, index) => (
                        <li key={index}>{limitation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpenModelDetails(false)}
                >
                  Close
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
