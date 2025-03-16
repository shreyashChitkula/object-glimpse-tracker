
import React, { useState } from 'react';
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

const Admin = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('detection');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleModelUpload = (file: File) => {
    setModelFile(file);
  };

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!modelName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a model name",
        variant: "destructive"
      });
      return;
    }
    
    if (!modelFile) {
      toast({
        title: "Error",
        description: "Please select a model file",
        variant: "destructive"
      });
      return;
    }
    
    setUploading(true);
    
    // Simulate upload
    try {
      // In a real app, you would upload to your backend here
      // For demo, let's simulate a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `Model "${modelName}" has been uploaded successfully`
      });
      
      // Reset form
      setModelName('');
      setModelFile(null);
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload model",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

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
                  <form onSubmit={handleModelSubmit}>
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
                          <option value="detection">Object Detection</option>
                          <option value="tracking">Object Tracking</option>
                          <option value="segmentation">Segmentation</option>
                        </select>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Model File</Label>
                        <UploadArea onImageUpload={handleModelUpload} />
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
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>YOLOv8 Nano</CardTitle>
                  <CardDescription>Object Detection</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    A lightweight model for real-time object detection.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>StrongSORT</CardTitle>
                  <CardDescription>Object Tracking</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-muted-foreground">
                    Multi-object tracking with appearance features.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
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
