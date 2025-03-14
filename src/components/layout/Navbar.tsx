
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Camera, UserCircle2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItem = {
  title: string;
  href: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Dashboard', href: '/dashboard' },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'py-3 backdrop-blur-lg bg-white/70 border-b border-gray-200/30 shadow-sm'
          : 'py-5 bg-transparent'
      )}
    >
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 animate-fade-in">
          <Camera className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">ObjectTracker</span>
        </Link>

        {isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] p-0">
              <div className="flex flex-col h-full">
                <div className="px-6 py-5 border-b">
                  <div className="flex items-center justify-between">
                    <Link 
                      to="/" 
                      className="flex items-center gap-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <Camera className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">ObjectTracker</span>
                    </Link>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8" 
                      onClick={() => setIsOpen(false)}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </Button>
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
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </Link>
                  ))}
                </nav>
                <div className="px-6 py-4 border-t">
                  <div className="flex flex-col gap-2">
                    <Link to="/auth?mode=login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <div className="flex items-center gap-x-6">
            <nav className="flex items-center gap-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === item.href
                      ? "text-primary"
                      : "text-muted-foreground"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-x-2">
              <Link to="/auth?mode=login">
                <Button variant="outline" size="sm" className="h-8">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button size="sm" className="h-8">
                  Register
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
