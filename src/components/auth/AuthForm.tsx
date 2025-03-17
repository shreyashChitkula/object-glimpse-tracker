
import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X } from "lucide-react";
import axios from "axios";
import { useUser } from "@/context/UserContext";
import { Separator } from "@/components/ui/separator";

export function AuthForm() {
  const [searchParams] = useSearchParams();
  const defaultTab =
    searchParams.get("mode") === "register" ? "register" : "login";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { registerUser } = useUser();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "password") {
      validatePassword(value);
    }
  };

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signin`,
        formData,
        {
          withCredentials: true,
        }
      );
      console.log("Login response", response.data);
      if (!response.data.success) {
        throw new Error(response.data.error || "Login failed");
      }

      // Extract only the required details for the user interface
      const { _id, fullName, email, role } = response.data.user;
      const userData = { id:_id, fullName, email, role };

      toast({
        title: "Success",
        description: "You've been logged in successfully.",
      });

      // Register user in context
      registerUser(userData);

      // Navigate based on user role
      userData.role === "admin" ? navigate("/admin") : navigate("/");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description:
          err.message || "Failed to login. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleThirdPartyLogin = (provider: string) => {
    console.log(`Initiating login with ${provider}`);
    // You'll implement the actual authentication logic
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const { length, uppercase, number, specialChar } = passwordValidation;
    if (!length || !uppercase || !number || !specialChar) {
      toast({
        title: "Error",
        description:
          "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character.",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/auth/signup`,
        {
          fullName: formData.name,
          email: formData.email,
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );
      console.log("register response", response.data);
      if (!response.data.success) {
        throw new Error(response.data.error || "Signup failed");
      }

      // Register user in context
      registerUser({
        ...response.data.user,
        role: "user"
      });

      toast({
        title: "Success",
        description: "Your account has been created successfully.",
      });

      navigate("/");
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description:
          err.message || "Failed to create account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-in-up">
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>

        <TabsContent value="login">
          <form onSubmit={handleLogin}>
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Enter your credentials to sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 h-auto text-xs"
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('google')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('github')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  GitHub
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('linkedin')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
                    />
                  </svg>
                  LinkedIn
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please
                    wait
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          <form onSubmit={handleRegister}>
            <CardHeader>
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>
                Enter your information to create a new account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <Input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="transition-all"
                />
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-2 bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center gap-2">
                      {passwordValidation.length ? (
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                          <X className="h-3 w-3 text-destructive" />
                        </div>
                      )}
                      <span className={`text-sm ${passwordValidation.length ? "text-green-500" : "text-muted-foreground"}`}>
                        At least 8 characters
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {passwordValidation.uppercase ? (
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                          <X className="h-3 w-3 text-destructive" />
                        </div>
                      )}
                      <span className={`text-sm ${passwordValidation.uppercase ? "text-green-500" : "text-muted-foreground"}`}>
                        At least one uppercase letter
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {passwordValidation.number ? (
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                          <X className="h-3 w-3 text-destructive" />
                        </div>
                      )}
                      <span className={`text-sm ${passwordValidation.number ? "text-green-500" : "text-muted-foreground"}`}>
                        At least one number
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {passwordValidation.specialChar ? (
                        <div className="h-5 w-5 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Check className="h-3 w-3 text-green-500" />
                        </div>
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-destructive/20 flex items-center justify-center">
                          <X className="h-3 w-3 text-destructive" />
                        </div>
                      )}
                      <span className={`text-sm ${passwordValidation.specialChar ? "text-green-500" : "text-muted-foreground"}`}>
                        At least one special character (@, $, !, %, *, ?, &)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>
              
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs text-muted-foreground">
                    OR CONTINUE WITH
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('google')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('github')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.343-3.369-1.343-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
                    />
                  </svg>
                  GitHub
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => handleThirdPartyLogin('linkedin')}
                  className="flex items-center justify-center gap-2"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" className="text-current">
                    <path
                      fill="currentColor"
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"
                    />
                  </svg>
                  LinkedIn
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating
                    account
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default AuthForm;
