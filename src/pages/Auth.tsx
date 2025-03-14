
import React from 'react';
import { Helmet } from 'react-helmet';
import { AuthForm } from '@/components/auth/AuthForm';
import { Camera } from 'lucide-react';
import { Link } from 'react-router-dom';

const Auth = () => {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Helmet>
        <title>Authentication | Object Tracker</title>
      </Helmet>
      
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-xl font-semibold">ObjectTracker</span>
        </Link>
        
        <AuthForm />
        
        <p className="mt-8 text-sm text-muted-foreground text-center max-w-md">
          By signing up, you agree to our Terms of Service and Privacy Policy. We use advanced object detection models to provide high-quality tracking services.
        </p>
      </div>
    </div>
  );
};

export default Auth;
