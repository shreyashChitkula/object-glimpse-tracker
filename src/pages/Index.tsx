
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowRight, CloudSun, Image, Camera, Cpu, ListChecks, Cog, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/context/ThemeContext';

const Index = () => {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    // Check if the current theme is dark
    if (theme === 'dark') {
      setIsDark(true);
    } else if (theme === 'light') {
      setIsDark(false);
    } else if (theme === 'system') {
      // Check system preference
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setIsDark(mediaQuery.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Object Tracker | Real-time Object Detection in Adverse Weather</title>
      </Helmet>
      
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-20 overflow-hidden">
        <div className={`absolute inset-0 -z-10 ${isDark ? 'hero-bg-dark' : 'hero-bg-light'}`}></div>
        
        <div className="container px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 px-3 py-1 text-sm bg-background/80 backdrop-blur-sm">
              Real-time Object Detection
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-slide-in-up">
              Advanced Object Detection <br className="hidden md:block" />
              <span className="text-primary">In Adverse Weather</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mb-8 animate-slide-in-up [animation-delay:200ms]">
              Track and detect objects in challenging weather conditions like fog, rain, and dust with precision and reliability. Powered by state-of-the-art computer vision models.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-up [animation-delay:400ms]">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2">
                  Try Detection <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button variant="outline" size="lg">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Preview Image */}
        <div className="container px-4 pb-20 md:pb-32">
          <div className="w-full max-w-5xl mx-auto mt-10 glass-card overflow-hidden">
            <div className="relative aspect-video w-full">
              <div className="absolute inset-0 bg-card animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Camera className="h-10 w-10 opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="outline" className="mb-3">Features</Badge>
            <h2 className="text-3xl font-bold mb-4">Designed for Precision & Performance</h2>
            <p className="text-muted-foreground">
              Our object detection system is built to perform in the most challenging conditions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CloudSun />}
              title="Adverse Weather Support"
              description="Reliable detection in fog, rain, dust, and other challenging visibility conditions."
            />
            
            <FeatureCard
              icon={<Image />}
              title="Image & Video Processing"
              description="Upload images or video files for detection, or use real-time camera feed input."
            />
            
            <FeatureCard
              icon={<Cpu />}
              title="Multiple Detection Models"
              description="Choose from different models optimized for accuracy, speed, or balanced performance."
            />
            
            <FeatureCard
              icon={<ListChecks />}
              title="Performance Metrics"
              description="View detailed metrics on detection accuracy, processing speed, and confidence scores."
            />
            
            <FeatureCard
              icon={<Cog />}
              title="Customizable Settings"
              description="Fine-tune detection parameters to match your specific requirements."
            />
            
            <FeatureCard
              icon={<Download />}
              title="Exportable Results"
              description="Download detailed reports of detection results with timestamp data."
            />
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between max-w-6xl mx-auto p-8 glass-card">
            <div className="md:max-w-md">
              <h2 className="text-2xl font-bold mb-4">Start Using Object Tracker Today</h2>
              <p className="text-muted-foreground mb-6">
                Create an account to access all features and begin detecting objects in challenging visibility conditions.
              </p>
              <Link to="/auth?mode=register">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
            
            <div className="w-full md:w-1/2 aspect-video bg-card rounded-lg shadow-lg overflow-hidden">
              <div className="h-full w-full bg-muted animate-pulse flex items-center justify-center">
                <Camera className="h-10 w-10 text-muted-foreground/20" />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => {
  return (
    <Card className="hover:shadow-md transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="p-3 rounded-full bg-primary/10 w-fit mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

export default Index;
