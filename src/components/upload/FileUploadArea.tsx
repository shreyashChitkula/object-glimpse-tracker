import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadAreaProps {
  onFileUpload: (file: File) => void;
  acceptedFileTypes?: string[];
}

export const FileUploadArea = ({ 
  onFileUpload, 
  acceptedFileTypes = ['.pt', '.pth', '.onnx', '.tflite', '.h5'] 
}: FileUploadAreaProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/octet-stream': acceptedFileTypes
    },
    multiple: false
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/20'}
        hover:border-primary hover:bg-primary/5`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-2 text-center">
        <Upload className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {isDragActive ? (
            "Drop the file here"
          ) : (
            <>
              Drag & drop a model file, or <span className="text-primary">browse</span>
              <br />
              <span className="text-xs">
                Supported formats: {acceptedFileTypes.join(', ')}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}; 