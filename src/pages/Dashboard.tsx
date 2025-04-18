
import React from "react";
import { Helmet } from "react-helmet";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Image } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Dashboard | Object Tracker</title>
      </Helmet>

      <Navbar />

      <main className="flex-1 py-16">
        <div className="container max-w-screen-xl px-4 mt-8">
          <div className="glass-card p-6 mb-8">
            <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
            <p className="text-muted-foreground">
              Choose your detection method
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/detection")}
            >
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <Camera className="h-12 w-12" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Live Camera Detection</h2>
                  <p className="text-muted-foreground">
                    Use your camera for real-time object detection
                  </p>
                </div>
                <Button>Start Camera Detection</Button>
              </CardContent>
            </Card>

            <Card 
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate("/gallery")}
            >
              <CardContent className="flex flex-col items-center text-center space-y-4">
                <Image className="h-12 w-12" />
                <div>
                  <h2 className="text-xl font-semibold mb-2">Media Detection</h2>
                  <p className="text-muted-foreground">
                    Upload or select media for object detection
                  </p>
                </div>
                <Button>Open Gallery</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
