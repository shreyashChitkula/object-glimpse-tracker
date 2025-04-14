
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cog, BarChart, BadgeInfo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Model {
  id: string;
  name: string;
  type: string;
  description: string;
  modelUrl: string;
  uploadedBy: string;
  uploadDate: string;
  performance?: {
    speed: number;
    accuracy: number;
  };
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

export function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  const handleModelChange = (value: string) => {
    onSelectModel(value);
  };

  const currentModel = models.find(model => model.id === selectedModel);

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
                      {model && (
                        <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-600 border-green-200">
                          Recommended
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {currentModel && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="text-sm text-muted-foreground">{currentModel.description}</div>
              
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
                      style={{ width: `${currentModel.performance.speed}%` }}
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
                      style={{ width: `${currentModel.performance.accuracy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default ModelSelector;
