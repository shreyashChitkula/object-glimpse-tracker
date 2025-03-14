
import React from 'react';
import { Link } from 'react-router-dom';
import { Camera, Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-border mt-auto">
      <div className="container py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold">ObjectTracker</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Real-time object detection and tracking in adverse weather conditions.
            </p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link to="/auth?mode=register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Register
              </Link>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h3 className="text-sm font-medium">Team 29</h3>
            <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
              <span>Aryan Mishra</span>
              <span>Ch Shreyash</span>
              <span>Neha Murthy</span>
              <span>Saiteja</span>
              <span>Saloni Goyal</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-center mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ObjectTracker. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="sr-only">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
