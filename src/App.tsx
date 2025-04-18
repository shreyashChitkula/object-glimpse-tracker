
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Detection from "./pages/Detection"; // New import
import Auth from "./pages/Auth";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Layout from "./Layout";
import { UserProvider } from "./context/UserContext";
import AdminRoute from "./components/auth/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <UserProvider>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Index />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/detection" element={<Detection />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/gallery" element={<Gallery />} />
                
                {/* Admin routes */}
                <Route element={<AdminRoute />}>
                  <Route path="/admin" element={<Admin />} />
                </Route>
                
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </UserProvider>
);

export default App;
