
import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { UploadArea } from "@/components/upload/UploadArea";
import { Card, CardContent } from "@/components/ui/card";
import { Image, Video, Plus, ExternalLink, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// Sample media data structure
interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  thumbnail: string;
  date: string;
}

const Gallery = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [userMedia, setUserMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/auth/media_user`,
          {
            withCredentials: true,
          }
        );
        
        // Map the API response to our gallery items format
        // For now, assuming the API returns both images and videos with type field
        const items = response.data.media.map((item: any, index: number) => ({
          id: item.id || `media-${index}`,
          name: item.name || `Media ${index + 1}`,
          type: item.type || 'image',
          thumbnail: item.url,
          date: item.date || new Date().toISOString().split("T")[0],
        }));

        setUserMedia(items);
        console.log("Fetched media:", items);
      } catch (err) {
        setError("Failed to fetch media");
        console.error("Error fetching media:", err);
        toast({
          title: "Error",
          description: "Failed to load media items. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, [toast]);

  const handleMediaUpload = async (file: File, mediaType: 'image' | 'video') => {
    if (!file) return;

    setIsUploading(true);
    setStatusMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", mediaType);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const mediaUrl = response.data.mediaUrl || response.data.imageUrl;
      
      const newMedia = {
        id: `media-${userMedia.length}`,
        name: file.name,
        type: mediaType,
        thumbnail: mediaUrl,
        date: new Date().toISOString().split("T")[0],
      };

      setUserMedia(prev => [newMedia, ...prev]);
      setShowUpload(false);

      toast({
        title: "Success",
        description: response.data.message || `${mediaType} uploaded successfully`,
      });
    } catch (error) {
      console.error(`Error uploading ${mediaType}:`, error);
      toast({
        title: "Error",
        description: `Failed to upload ${mediaType}`,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleMediaClick = (media: MediaItem) => {
    // Navigate to dashboard with media info
    navigate(`/dashboard?mediaURL=${media.thumbnail}&mediaType=${media.type}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>My Gallery | Object Tracker</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <div className="container max-w-screen-xl px-4 mt-8">
          <div className="glass-card p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-semibold mb-1">My Gallery</h1>
                <p className="text-muted-foreground">
                  Upload and manage your media for object detection
                </p>
              </div>

              <Button
                onClick={() => setShowUpload(!showUpload)}
                className="gap-2"
              >
                {showUpload ? (
                  "Close"
                ) : (
                  <>
                    <Plus className="h-4 w-4" /> Add New Media
                  </>
                )}
              </Button>
            </div>

            {showUpload && (
              <div className="animate-fade-in mb-6">
                <UploadArea onMediaUpload={handleMediaUpload} />
              </div>
            )}
          </div>

          {userMedia.length === 0 ? (
            <div className="text-center py-16">
              <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">No media yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload some media to get started with object detection
              </p>
              <Button onClick={() => setShowUpload(true)}>Upload Media</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMedia.map((media) => (
                <Card
                  key={media.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleMediaClick(media)}
                >
                  <div className="relative aspect-video">
                    {media.type === 'image' ? (
                      <img
                        src={media.thumbnail}
                        alt={media.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={media.thumbnail}
                          className="object-cover w-full h-full"
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/30 rounded-full p-3">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
                      <Button size="sm" variant="secondary" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Detect
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{media.name}</h3>
                      {media.type === 'video' && (
                        <Video className="h-4 w-4 text-muted-foreground ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {media.date}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Gallery;
