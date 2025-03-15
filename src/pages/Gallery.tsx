
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { UploadArea } from '@/components/upload/UploadArea';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Plus, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Sample media data for demonstration
const sampleMedia = [
  {
    id: '1',
    name: 'Traffic camera footage',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    date: '2023-11-20',
  },
  {
    id: '2',
    name: 'Highway surveillance',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1573400145000-43f242deb9c9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    date: '2023-11-18',
  },
  {
    id: '3',
    name: 'Border security camera',
    type: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1519575706483-221027bfbb31?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&q=80',
    date: '2023-11-15',
  },
];

const Gallery = () => {
  const [showUpload, setShowUpload] = useState(false);
  const [userMedia, setUserMedia] = useState(sampleMedia);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleMediaUpload = (file: File) => {
    // Generate a thumbnail preview
    const imageUrl = URL.createObjectURL(file);
    
    // Add the new media to the gallery
    const newMedia = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      thumbnail: imageUrl,
      date: new Date().toISOString().split('T')[0],
    };
    
    setUserMedia([newMedia, ...userMedia]);
    setShowUpload(false);
    
    toast({
      title: "Media added to gallery",
      description: "Your media is now available in your gallery.",
    });
  };

  const handleMediaClick = (mediaId: string) => {
    // In a real app, we would pass the media data to the detection page
    // For now, we'll just navigate to the dashboard
    navigate(`/dashboard?mediaId=${mediaId}`);
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
                <p className="text-muted-foreground">Upload and manage your media for object detection</p>
              </div>
              
              <Button 
                onClick={() => setShowUpload(!showUpload)} 
                className="gap-2"
              >
                {showUpload ? "Close" : <><Plus className="h-4 w-4" /> Add New Media</>}
              </Button>
            </div>
            
            {showUpload && (
              <div className="animate-fade-in mb-6">
                <UploadArea onImageUpload={handleMediaUpload} />
              </div>
            )}
          </div>
          
          {userMedia.length === 0 ? (
            <div className="text-center py-16">
              <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">No media yet</h3>
              <p className="text-muted-foreground mb-4">Upload some media to get started with object detection</p>
              <Button onClick={() => setShowUpload(true)}>Upload Media</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMedia.map((media) => (
                <Card key={media.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-all" onClick={() => handleMediaClick(media.id)}>
                  <div className="relative aspect-video">
                    <img 
                      src={media.thumbnail} 
                      alt={media.name} 
                      className="object-cover w-full h-full" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-4">
                      <Button size="sm" variant="secondary" className="gap-1">
                        <ExternalLink className="h-4 w-4" />
                        Detect
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate">{media.name}</h3>
                    <p className="text-sm text-muted-foreground">{media.date}</p>
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
