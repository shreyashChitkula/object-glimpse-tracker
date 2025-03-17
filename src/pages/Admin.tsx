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
import { 
  Loader2, Upload, Trash2, Database, Users, Box, 
  UserRoundPlus, Search, MoreVertical, Edit, ShieldCheck, ShieldX, User, LogOut
} from 'lucide-react';
import { UploadArea } from '@/components/upload/UploadArea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
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
  const { user, logoutUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('object_detection');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [dataSearchQuery, setDataSearchQuery] = useState('');

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setModelFile(file);
  };

  // Dummy data for users
  const dummyUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', lastActive: '2023-10-15', profileImage: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', lastActive: '2023-10-14', profileImage: '' },
    { id: '3', name: 'Robert Johnson', email: 'robert@example.com', role: 'user', lastActive: '2023-10-12', profileImage: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7' },
    { id: '4', name: 'Emily White', email: 'emily@example.com', role: 'user', lastActive: '2023-10-10', profileImage: '' },
    { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'admin', lastActive: '2023-10-09', profileImage: 'https://source.unsplash.com/photo-1487887235947-a955ef187fcc' },
  ];

  // Dummy data for images with owner information
  const dummyImages = [
    { 
      id: '1', 
      name: 'traffic_cam_01.jpg', 
      type: 'JPEG', 
      size: '2.4 MB', 
      date: '2023-10-15', 
      tags: ['traffic', 'street'],
      owner: { id: '1', name: 'John Doe', profileImage: 'https://source.unsplash.com/photo-1581091226825-a6a2a5aee158' }
    },
    { 
      id: '2', 
      name: 'surveillance_02.png', 
      type: 'PNG', 
      size: '3.1 MB', 
      date: '2023-10-14', 
      tags: ['surveillance', 'night'],
      owner: { id: '3', name: 'Robert Johnson', profileImage: 'https://source.unsplash.com/photo-1649972904349-6e44c42644a7' } 
    },
    { 
      id: '3', 
      name: 'drone_footage_03.jpg', 
      type: 'JPEG', 
      size: '4.7 MB', 
      date: '2023-10-12', 
      tags: ['aerial', 'city'],
      owner: { id: '5', name: 'Michael Brown', profileImage: 'https://source.unsplash.com/photo-1487887235947-a955ef187fcc' } 
    },
    { 
      id: '4', 
      name: 'security_cam_04.mp4', 
      type: 'MP4', 
      size: '8.2 MB', 
      date: '2023-10-10', 
      tags: ['security', 'indoor'],
      owner: { id: '2', name: 'Jane Smith', profileImage: '' } 
    },
    { 
      id: '5', 
      name: 'tracking_sample_05.jpg', 
      type: 'JPEG', 
      size: '1.8 MB', 
      date: '2023-10-09', 
      tags: ['tracking', 'person'],
      owner: { id: '4', name: 'Emily White', profileImage: '' } 
    },
  ];

  const handleModelUpload = (file: File) => {
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
    
    // Log the current user to verify authentication
    console.log("Current user:", user);

    try {
      setUploading(true);
      
      // Add authorization header if you're using JWT
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/upload_model`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            // Add Authorization header if you're using JWT
            // "Authorization": `Bearer ${localStorage.getItem('token')}`,
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
      setIsDialogOpen(false);
      
      // Refresh the models list
      fetchModels();
      
    } catch (error: any) {
      console.error("Error uploading model:", error);
      // Log the full error response for debugging
      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);
        console.log("Error response headers:", error.response.headers);
      }
      
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to upload model. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Filter users based on search query
  const filteredUsers = dummyUsers.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter images based on search query
  const filteredImages = dummyImages.filter(image => 
    image.name.toLowerCase().includes(dataSearchQuery.toLowerCase()) ||
    image.type.toLowerCase().includes(dataSearchQuery.toLowerCase()) ||
    image.tags.some(tag => tag.toLowerCase().includes(dataSearchQuery.toLowerCase())) ||
    image.owner.name.toLowerCase().includes(dataSearchQuery.toLowerCase())
  );

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signout`,
        {},
        {
          withCredentials: true,
        }
      );

      // Remove token cookie
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Update context
      logoutUser();

      // Show success toast
      toast({
        title: "Success",
        description: "Logged out successfully",
      });

      // Redirect to home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-10 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Dashboard | Object Tracker</title>
      </Helmet>
      
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user?.fullName}. Manage your application settings and resources.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout} 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
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
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">User Management</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search users..."
                      className="pl-9 w-[250px]"
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <UserRoundPlus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </div>
              </div>
              
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                {user.profileImage ? (
                                  <AvatarImage src={user.profileImage} alt={user.name} />
                                ) : (
                                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {user.role === 'admin' ? (
                                <>
                                  <ShieldCheck className="h-4 w-4 text-primary" />
                                  <span className="font-medium">Admin</span>
                                </>
                              ) : (
                                <span>User</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end">
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="data" className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Data Management</h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search images..."
                      className="pl-9 w-[250px]"
                      value={dataSearchQuery}
                      onChange={(e) => setDataSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Images
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <img 
                          src={`https://source.unsplash.com/random/800x600?${image.tags.join(',')}`} 
                          alt={image.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{image.name}</CardTitle>
                      <CardDescription className="flex gap-2 flex-wrap">
                        {image.tags.map((tag) => (
                          <span key={tag} className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
                            {tag}
                          </span>
                        ))}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 pt-0">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{image.type}</span>
                        <span>{image.size}</span>
                        <span>{image.date}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                        <Avatar className="h-6 w-6">
                          {image.owner.profileImage ? (
                            <AvatarImage src={image.owner.profileImage} alt={image.owner.name} />
                          ) : (
                            <AvatarFallback>{getInitials(image.owner.name)}</AvatarFallback>
                          )}
                        </Avatar>
                        <span className="text-sm">{image.owner.name}</span>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button variant="outline" size="sm">
                        <Edit className="mr-2 h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-3 w-3" />
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
