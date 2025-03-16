
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';

export default function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useUser();
  const { toast } = useToast();
  
  // While checking authentication status, show nothing
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">Checking authorization...</p>
    </div>;
  }
  
  // If not authenticated or not admin, redirect to home
  if (!isAuthenticated || !isAdmin()) {
    toast({
      title: "Access denied",
      description: "You don't have permission to access this page",
      variant: "destructive"
    });
    return <Navigate to="/" replace />;
  }
  
  // If admin, render the child routes
  return <Outlet />;
}
