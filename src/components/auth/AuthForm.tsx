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
              {/* <div className="text-xs text-muted-foreground">
                <p>For admin access demo use:</p>
                <p>Email: admin@example.com</p>
                <p>Password: admin123</p>
              </div> */}
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
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium mb-1">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center">
                      {passwordValidation.length ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      <span className={`text-sm ${passwordValidation.length ? "text-green-500" : "text-destructive"}`}>
                        At least 8 characters
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      {passwordValidation.uppercase ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      <span className={`text-sm ${passwordValidation.uppercase ? "text-green-500" : "text-destructive"}`}>
                        At least one uppercase letter
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      {passwordValidation.number ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      <span className={`text-sm ${passwordValidation.number ? "text-green-500" : "text-destructive"}`}>
                        At least one number
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      {passwordValidation.specialChar ? (
                        <Check className="h-4 w-4 mr-2 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 mr-2 text-destructive" />
                      )}
                      <span className={`text-sm ${passwordValidation.specialChar ? "text-green-500" : "text-destructive"}`}>
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
