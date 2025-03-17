import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Trash2, Database, Users, Box } from 'lucide-react';
import { UploadArea } from '@/components/upload/UploadArea';
import axios from 'axios';
import { FileUploadArea } from '@/components/upload/FileUploadArea';
import { format } from 'date-fns';

// Add interface for model type
interface Model {
  _id: string;
  modelName: string;
  modelType: string;
  modelUrl: string;
  username: string;
  userEmail: string;
  createdAt: string;
}

const Admin = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('object_detection');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  const handleModelUpload = (file: File) => {
    setModelFile(file);
  };

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setModelFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !modelName || !modelType) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("modelName", modelName);
    formData.append("modelType", modelType);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/upload_model`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      toast({
        title: "Success",
        description: "Model uploaded successfully",
      });

      // Reset form
      setSelectedFile(null);
      setModelName("");
      setModelType("");
      
    } catch (error) {
      console.error("Error uploading model:", error);
      toast({
        title: "Error",
        description: "Failed to upload model",
        variant: "destructive",
      });
    }
  };

  // Add function to fetch models
  const fetchModels = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/models`,
        { withCredentials: true }
      );
      
      if (response.data.success) {
        setModels(response.data.models);
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      toast({
        title: "Error",
        description: "Failed to fetch models",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModel = async (modelId: string) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/models/${modelId}`,
        { withCredentials: true }
      );

      if (response.data.message) {
        toast({
          title: "Success",
          description: "Model deleted successfully",
        });
        // Refresh the models list
        fetchModels();
      }
    } catch (error) {
      console.error("Error deleting model:", error);
      toast({
        title: "Error",
        description: "Failed to delete model",
        variant: "destructive",
      });
    }
  };

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  return (
    <div className="container py-10 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Dashboard | Object Tracker</title>
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.fullName}. Manage your application settings and resources.
          </p>
        </div>
        
        <Tabs defaultValue="models" className="space-y-4">
          <TabsList>
            <TabsTrigger value="models" className="flex items-center gap-2">
              <Box className="h-4 w-4" />
              <span>Models</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Data</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="models" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Models Management</h2>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" /> Upload Model
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <form onSubmit={handleSubmit}>
                    <DialogHeader>
                      <DialogTitle>Upload New Model</DialogTitle>
                      <DialogDescription>
                        Upload a new object detection or tracking model to the system.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="model-name">Model Name</Label>
                        <Input
                          id="model-name"
                          placeholder="Enter model name"
                          value={modelName}
                          onChange={(e) => setModelName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="model-type">Model Type</Label>
                        <select 
                          id="model-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          value={modelType}
                          onChange={(e) => setModelType(e.target.value)}
                        >
                          <option value="object_detection">Object Detection</option>
                          <option value="image_classification">Image Classification</option>
                        </select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Model File</Label>
                        {selectedFile ? (
                          <div className="flex items-center gap-2 p-2 border rounded-md">
                            <span className="text-sm truncate flex-1">{selectedFile.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFile(null);
                                setModelFile(null);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <FileUploadArea onFileUpload={handleFileUpload} />
                        )}
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={uploading}>
                        {uploading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Upload Model"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : models.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No models uploaded yet.
                </div>
              ) : (
                models.map((model) => (
                  <Card key={model._id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{model.modelName}</CardTitle>
                          <CardDescription>{model.modelType}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm space-y-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Uploaded by:</span>
                        <span className="font-medium">{model.username}</span>
                        <span className="text-xs text-muted-foreground">{model.userEmail}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">Upload date:</span>
                        <span className="text-xs">
                          {format(new Date(model.createdAt), 'PPP')}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(model.modelUrl, '_blank')}
                      >
                        Download
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => {
                          // Show confirmation dialog before deleting
                          if (window.confirm('Are you sure you want to delete this model?')) {
                            handleDeleteModel(model._id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <h2 className="text-xl font-semibold">User Management</h2>
            <p className="text-muted-foreground">User management interface will be implemented here.</p>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <h2 className="text-xl font-semibold">Data Management</h2>
            <p className="text-muted-foreground">Data management interface will be implemented here.</p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
