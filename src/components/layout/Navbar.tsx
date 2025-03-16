import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, X, Camera, UserCircle2, Image } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ThemeSwitcher } from "@/components/theme/ThemeSwitcher";
import { useUser } from "@/context/UserContext";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logoutUser } = useUser();
  const { toast } = useToast();

  const navItems: NavItem[] = isAuthenticated
    ? [
        { title: "Home", href: "/" },
        { title: "Dashboard", href: "/dashboard" },
        {
          title: "Gallery",
          href: "/gallery",
          icon: <Image className="h-4 w-4 mr-2" />,
        },
      ]
    : [
        { title: "Home", href: "/" },
        { title: "Dashboard", href: "/dashboard" },
      ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
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

      // Optional: Show success toast
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error) {
      console.error("Logout failed:", error);
      // Optional: Show error toast
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "py-3 backdrop-blur-lg bg-background/70 border-b border-border/30 shadow-sm"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 animate-fade-in">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">ObjectTracker</span>
        </Link>

        {isMobile ? (
          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] p-0">
                <DialogTitle className="sr-only">ObjectTracker Navigation</DialogTitle>
                <DialogDescription className="sr-only">
                  Access ObjectTracker features and settings
                </DialogDescription>
                <div className="flex flex-col h-full">
                  <div className="px-6 py-5 border-b">
                    <div className="flex items-center justify-between">
                      <Link
                        to="/"
                        className="flex items-center gap-2"
                        onClick={() => setIsOpen(false)}
                      >
                        <Camera className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">
                          ObjectTracker
                        </span>
                      </Link>
                    </div>
                  </div>
                  <nav className="px-4 py-6 space-y-3 flex-1">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                          location.pathname === item.href
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-accent/50"
                        )}
                      >
                        {item.icon}
                        {item.title}
                      </Link>
                    ))}
                  </nav>
                  <div className="px-6 py-4 border-t">
                    <div className="flex flex-col gap-2">
                      {isAuthenticated ? (
                        <Button size="sm" onClick={handleLogout}>
                          Sign Out
                        </Button>
                      ) : (
                        <>
                          <Link
                            to="/auth?mode=login"
                            onClick={() => setIsOpen(false)}
                          >
                            <Button variant="outline" className="w-full">
                              Sign In
                            </Button>
                          </Link>
                          <Link
                            to="/auth?mode=register"
                            onClick={() => setIsOpen(false)}
                          >
                            <Button className="w-full">Create Account</Button>
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        ) : (
          <div className="flex items-center gap-x-6">
            <nav className="flex items-center gap-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary flex items-center",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-x-2">
              <ThemeSwitcher />

              {isAuthenticated ? (
                <div className="flex items-center gap-4">
                  <span>
                    Welcome back,{" "}
                    <span className="text-primary">{user?.fullName}</span>
                  </span>
                  <Button size="sm" onClick={handleLogout}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <>
                  <Link to="/auth?mode=login">
                    <Button variant="outline" size="sm" className="h-8">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth?mode=register">
                    <Button size="sm" className="h-8">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
