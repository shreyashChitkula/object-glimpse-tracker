
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
import { 
  Loader2, Upload, Trash2, Database, Users, Box, 
  UserRoundPlus, Search, MoreVertical, Edit, ShieldCheck, ShieldX
} from 'lucide-react';
import { UploadArea } from '@/components/upload/UploadArea';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const Admin = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState('');
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState('detection');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [dataSearchQuery, setDataSearchQuery] = useState('');

  // Dummy data for users
  const dummyUsers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', lastActive: '2023-10-15' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', lastActive: '2023-10-14' },
    { id: '3', name: 'Robert Johnson', email: 'robert@example.com', role: 'user', lastActive: '2023-10-12' },
    { id: '4', name: 'Emily White', email: 'emily@example.com', role: 'user', lastActive: '2023-10-10' },
    { id: '5', name: 'Michael Brown', email: 'michael@example.com', role: 'admin', lastActive: '2023-10-09' },
  ];

  // Dummy data for images
  const dummyImages = [
    { id: '1', name: 'traffic_cam_01.jpg', type: 'JPEG', size: '2.4 MB', date: '2023-10-15', tags: ['traffic', 'street'] },
    { id: '2', name: 'surveillance_02.png', type: 'PNG', size: '3.1 MB', date: '2023-10-14', tags: ['surveillance', 'night'] },
    { id: '3', name: 'drone_footage_03.jpg', type: 'JPEG', size: '4.7 MB', date: '2023-10-12', tags: ['aerial', 'city'] },
    { id: '4', name: 'security_cam_04.mp4', type: 'MP4', size: '8.2 MB', date: '2023-10-10', tags: ['security', 'indoor'] },
    { id: '5', name: 'tracking_sample_05.jpg', type: 'JPEG', size: '1.8 MB', date: '2023-10-09', tags: ['tracking', 'person'] },
  ];

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
    image.tags.some(tag => tag.toLowerCase().includes(dataSearchQuery.toLowerCase()))
  );

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
                      <TableHead>Name</TableHead>
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
                          <TableCell className="font-medium">{user.name}</TableCell>
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
