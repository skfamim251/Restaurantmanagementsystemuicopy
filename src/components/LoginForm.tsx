import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { LogIn, UserPlus, User, ChefHat, Crown, Utensils, Sparkles } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { authAPI } from '../utils/api';
import { isDemoMode } from '../utils/demoData';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Signup form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' as UserRole
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData.email, loginData.password);
      if (success) {
        toast.success('Welcome back!');
        onSuccess();
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // If this is first-time setup, create as owner
      const roleToCreate = needsSetup ? 'owner' : 'customer';
      
      const success = await signup(
        signupData.name,
        signupData.email,
        signupData.password,
        roleToCreate
      );
      
      if (success) {
        if (needsSetup) {
          toast.success('Owner account created successfully! Welcome to RestaurantOS.');
        } else {
          toast.success('Customer account created successfully!');
        }
        onSuccess();
      } else {
        toast.error('Email already exists');
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    customer: User,
    staff: ChefHat,
    owner: Crown
  };

  const roleDescriptions = {
    customer: 'Browse menu, manage cart, and place orders',
    staff: 'Manage kitchen, tables, and customer service',
    owner: 'Full access to analytics and system management'
  };

  // Check if system needs first-time setup
  useEffect(() => {
    const checkSetup = async () => {
      if (isDemoMode()) {
        setNeedsSetup(false);
        setCheckingSetup(false);
        return;
      }

      try {
        const result = await authAPI.needsSetup();
        setNeedsSetup(result.needsSetup || false);
      } catch (error) {
        console.error('Failed to check setup status:', error);
        setNeedsSetup(false);
      } finally {
        setCheckingSetup(false);
      }
    };

    checkSetup();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-chart-2/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">RestaurantOS</CardTitle>
            <CardDescription>
              {needsSetup && !checkingSetup ? (
                <span className="flex items-center gap-1 text-primary">
                  <Sparkles className="w-4 h-4" />
                  First-Time Setup - Create Your Owner Account
                </span>
              ) : (
                'Welcome to your restaurant management system'
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>

                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or try demo accounts
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setLoginData({ email: 'customer@restaurant.com', password: 'password' });
                        setIsLoading(true);
                        const success = await login('customer@restaurant.com', 'password');
                        if (success) {
                          toast.success('Welcome back!');
                          onSuccess();
                        } else {
                          toast.error('Login failed');
                        }
                        setIsLoading(false);
                      }}
                    >
                      <User className="w-3 h-3 mr-1" />
                      Customer
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setLoginData({ email: 'staff@restaurant.com', password: 'password' });
                        setIsLoading(true);
                        const success = await login('staff@restaurant.com', 'password');
                        if (success) {
                          toast.success('Welcome back!');
                          onSuccess();
                        } else {
                          toast.error('Login failed');
                        }
                        setIsLoading(false);
                      }}
                    >
                      <ChefHat className="w-3 h-3 mr-1" />
                      Staff
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        setLoginData({ email: 'owner@restaurant.com', password: 'password' });
                        setIsLoading(true);
                        const success = await login('owner@restaurant.com', 'password');
                        if (success) {
                          toast.success('Welcome back!');
                          onSuccess();
                        } else {
                          toast.error('Login failed');
                        }
                        setIsLoading(false);
                      }}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Owner
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 mt-6">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.name}
                      onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupData.email}
                      onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signupData.password}
                      onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      required
                    />
                  </div>

                  {needsSetup ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-foreground mb-1">First-Time Setup</p>
                            <p className="text-sm text-muted-foreground">
                              This is the first account in your system. You will be created as an <span className="font-medium text-primary">Owner</span> with full access to manage the restaurant.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                      <p className="text-sm text-muted-foreground">
                        <User className="w-4 h-4 inline mr-1" />
                        Signing up as a <span className="font-medium text-foreground">Customer</span>. 
                        Staff and Owner accounts can only be created by existing owners.
                      </p>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading || checkingSetup}>
                    {isLoading ? 'Creating account...' : needsSetup ? 'Create Owner Account' : 'Create Customer Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}