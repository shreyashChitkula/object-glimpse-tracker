import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Upload,
  Trash2,
  Database,
  Users,
  Box,
  UserRoundPlus,
  Search,
  MoreVertical,
  Edit,
  ShieldCheck,
  ShieldX,
  User,
  LogOut,
} from "lucide-react";
import { UploadArea } from "@/components/upload/UploadArea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FileUploadArea } from "@/components/upload/FileUploadArea";
import { format } from "date-fns";

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

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profileImage?: string;
  joinedDate?: string;
}

interface Image {
  id: string;
  imageUrl: string;
  uploadedBy: string;
  userEmail: string;
  uploadDate?: string;
  status?: string;
}

interface Media {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  uploadedBy: string;
  userEmail: string;
  uploadDate?: string;
  originalMediaId: string;
}

const Admin = () => {
  const { user, logoutUser } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelType, setModelType] = useState("object_detection");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);

  const handleFileUpload = (file: File) => {
    setSelectedFile(file);
    setModelFile(file);
  };

  const handleModelUpload = (file: File) => {
    setModelFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Form submission values:", {
      selectedFile,
      modelName,
      modelType,
    });

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

      // Reset form state completely
      setSelectedFile(null);
      setModelFile(null); // Make sure to reset both file state variables
      setModelName("");
      setModelType("object_detection"); // Reset to default value
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
        description:
          error.response?.data?.message ||
          "Failed to upload model. Please try again.",
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

  const handleDeleteMedia = async (originalMediaId: string, mediaId: string) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/media/${originalMediaId}/${mediaId}`,
        { withCredentials: true }
      );

      if (response.data.message) {
        toast({
          title: "Success",
          description: "Media deleted successfully",
        });
        // Refresh the media list
        fetchMedia();
      }
    } catch (error) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  const fetchMedia = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/media`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setMediaItems(response.data.media);
      }
    } catch (error) {
      console.error("Error fetching media:", error);
      toast({
        title: "Error",
        description: "Failed to fetch media",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch models on component mount
  useEffect(() => {
    fetchModels();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  function handleSwitchToUserMode(
    event: React.MouseEvent<HTMLButtonElement>
  ): void {
    event.preventDefault();
    navigate("/");
  }

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // Filter media based on search query
  const filteredMedia = mediaItems.filter(
    (media) =>
      media.url.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      media.uploadedBy.toLowerCase().includes(mediaSearchQuery.toLowerCase()) ||
      media.userEmail.toLowerCase().includes(mediaSearchQuery.toLowerCase())
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

  // Format date function
  const formatDate = (dateString: string | Date | undefined | null) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return format(date, "PPP");
    } catch (error) {
      return "N/A";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard-stats`,
          { withCredentials: true }
        );

        if (response.data.success) {
          const { data } = response.data;
          setUsers(data.usersList);
          setMediaItems(data.mediaList.map((item: any) => ({
            id: item.id,
            url: item.url,
            type: item.type,
            name: item.name,
            uploadedBy: item.uploadedBy,
            userEmail: item.userEmail,
            uploadDate: item.uploadDate,
            originalMediaId: item.originalMediaId
          })));
          fetchModels();
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch dashboard data",
          variant: "destructive",
        });

        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container py-10 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Admin Dashboard | Object Tracker</title>
      </Helmet>

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome, {user?.fullName}. Manage your application settings and
              resources.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSwitchToUserMode}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              Switch to User Mode
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Models
              </CardTitle>
              <Box className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{models.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Media
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mediaItems.length}</div>
            </CardContent>
          </Card>
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
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>Media</span>
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
                        Upload a new object detection or tracking model to the
                        system.
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
                          <option value="object_detection">
                            Object Detection
                          </option>
                          <option value="image_classification">
                            Image Classification
                          </option>
                        </select>
                      </div>

                      <div className="grid gap-2">
                        <Label>Model File</Label>
                        {selectedFile ? (
                          <div className="flex items-center gap-2 p-2 border rounded-md">
                            <span className="text-sm truncate flex-1">
                              {selectedFile.name}
                            </span>
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
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
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
                        <span className="text-muted-foreground">
                          Uploaded by:
                        </span>
                        <span className="font-medium">{model.username}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.userEmail}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">
                          Upload date:
                        </span>
                        <span className="text-xs">
                          {format(new Date(model.createdAt), "PPP")}
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(model.modelUrl, "_blank")}
                      >
                        Download
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          // Show confirmation dialog before deleting
                          if (
                            window.confirm(
                              "Are you sure you want to delete this model?"
                            )
                          ) {
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
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="pl-8"
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No users found matching your search.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card key={user.id}>
                    <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.profileImage} />
                        <AvatarFallback>
                          {getInitials(user.fullName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          {user.fullName}
                        </CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Role:
                          </span>
                          <span
                            className={`text-sm font-medium ${
                              user.role === "admin" ? "text-blue-600" : ""
                            }`}
                          >
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Joined:
                          </span>
                          <span className="text-sm">
                            {formatDate(user.joinedDate)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          <TabsContent value="media" className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search media..."
                  className="pl-8"
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                <div className="col-span-full flex justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="col-span-full text-center py-8 text-muted-foreground">
                  No media found matching your search.
                </div>
              ) : (
                filteredMedia.map((media) => (
                  <Card key={media.id}>
                    <div className="aspect-square relative">
                      {media.type === 'video' ? (
                        <video
                          src={media.url}
                          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                          controls
                          preload="metadata"
                        >
                          Your browser does not support the video tag.
                        </video>
                      ) : (
                        <img
                          src={media.url}
                          alt={media.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                        />
                      )}
                    </div>
                    <CardContent className="pt-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Type:</span>
                          <span className="text-sm font-medium capitalize">{media.type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Name:</span>
                          <span className="text-sm font-medium">{media.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Uploaded by:</span>
                          <span className="text-sm font-medium">{media.uploadedBy}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm">{media.userEmail}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Date:</span>
                          <span className="text-sm">{formatDate(media.uploadDate)}</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(media.url, "_blank")}
                      >
                        View Full Size
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this media?")) {
                            handleDeleteMedia(media.originalMediaId, media.id);
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
