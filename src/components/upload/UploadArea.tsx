
import React, { useState, useRef } from 'react';
import { Upload, Image, Video, Trash2, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UploadAreaProps {
  onMediaUpload: (file: File, mediaType: 'image' | 'video') => void;
  acceptedTypes?: string[];
}

export function UploadArea({ 
  onMediaUpload, 
  acceptedTypes = ["image/*", "video/*"] 
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length === 0) return;
    
    const file = files[0];
    
    // Check if the file is an image or video
    let type: 'image' | 'video';
    
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or video file",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setMediaType(type);
    
    // Create a preview URL for the media
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
      setIsUploading(false);
      onMediaUpload(file, type);
      
      toast({
        title: "Upload successful",
        description: `Your ${type} has been uploaded successfully.`,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveMedia = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />
      
      {!previewUrl ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-all duration-300",
            isDragging ? "border-primary bg-primary/5" : "border-border"
          )}
        >
          <CardContent
            className="flex flex-col items-center justify-center px-6 py-10 cursor-pointer"
            onClick={handleBrowseClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div
              className={cn(
                "rounded-full p-4 mb-4 transition-all",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}
            >
              <Upload 
                className={cn(
                  "h-6 w-6 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} 
              />
            </div>
            <h3 className="text-lg font-medium mb-1">
              {isDragging ? "Drop to upload" : "Upload media"}
            </h3>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Drag and drop or click to browse
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleBrowseClick}
              type="button"
            >
              Browse files
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden transition-all duration-300 animate-fade-in">
          <CardContent className="p-0 relative">
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
            <div className="relative aspect-video w-full">
              {mediaType === 'image' ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="relative w-full h-full bg-black/10">
                  <video
                    src={previewUrl}
                    className="object-contain w-full h-full"
                    controls
                  />
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <Play className="h-16 w-16 text-primary/20" />
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 p-4 flex justify-end gap-2 bg-gradient-to-t from-black/50 to-transparent">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-background/80 hover:bg-background/90 backdrop-blur-sm"
                  onClick={handleBrowseClick}
                >
                  {mediaType === 'image' ? (
                    <Image className="h-4 w-4" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                  <span className="sr-only">Change media</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-destructive/20 hover:bg-destructive/30 backdrop-blur-sm border-destructive/20"
                  onClick={handleRemoveMedia}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Remove media</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default UploadArea;
