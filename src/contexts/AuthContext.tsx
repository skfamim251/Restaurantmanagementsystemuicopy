import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export type UserRole = 'customer' | 'staff' | 'owner';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create Supabase client
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabase = createClient(supabaseUrl, publicAnonKey);

// Demo users for testing (fallback when Supabase auth fails)
const DEMO_USERS = [
  {
    email: 'customer@restaurant.com',
    password: 'password',
    name: 'John Doe',
    role: 'customer' as UserRole,
  },
  {
    email: 'staff@restaurant.com',
    password: 'password',
    name: 'Sarah Wilson',
    role: 'staff' as UserRole,
  },
  {
    email: 'owner@restaurant.com',
    password: 'password',
    name: 'Mike Rodriguez',
    role: 'owner' as UserRole,
  },
];

// Role-based permissions
const PERMISSIONS = {
  customer: [
    'view_menu',
    'add_to_cart',
    'view_basic_info',
    'view_prep_times'
  ],
  staff: [
    'view_menu',
    'add_to_cart',
    'manage_cart',
    'view_basic_info',
    'place_orders',
    'manage_kitchen',
    'manage_tables',
    'view_orders',
    'assign_tables',
    'host_dashboard',
    'process_payments',
    'allocate_tables'
  ],
  owner: [
    'view_menu',
    'add_to_cart',
    'manage_cart',
    'view_basic_info',
    'place_orders',
    'manage_kitchen',
    'manage_tables',
    'view_orders',
    'assign_tables',
    'host_dashboard',
    'view_analytics',
    'view_revenue',
    'manage_users',
    'system_settings',
    'process_payments',
    'allocate_tables'
  ]
};

// Mock users for demo purposes
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'customer@restaurant.com',
    password: 'password',
    role: 'customer' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'staff@restaurant.com',
    password: 'password',
    role: 'staff' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b2e0aa93?w=100&h=100&fit=crop&crop=face'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'owner@restaurant.com',
    password: 'password',
    role: 'owner' as UserRole,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing Supabase session
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      // First check for Supabase session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          role: session.user.user_metadata?.role || 'customer',
          avatar: session.user.user_metadata?.avatar,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store token for API requests
        if (session.access_token) {
          localStorage.setItem('supabase.auth.token', session.access_token);
        }
        return;
      }

      // Check for demo user session
      const savedDemoUser = localStorage.getItem('restaurant_demo_user');
      if (savedDemoUser) {
        const userData = JSON.parse(savedDemoUser);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('supabase.auth.token', publicAnonKey);
      }
    } catch (error) {
      console.error('Error checking session:', error);
      
      // Check for demo user session as fallback
      const savedDemoUser = localStorage.getItem('restaurant_demo_user');
      if (savedDemoUser) {
        const userData = JSON.parse(savedDemoUser);
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('supabase.auth.token', publicAnonKey);
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First, try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!error && data.session?.user) {
        const userData: User = {
          id: data.session.user.id,
          email: data.session.user.email || '',
          name: data.session.user.user_metadata?.name || data.session.user.email?.split('@')[0] || 'User',
          role: data.session.user.user_metadata?.role || 'customer',
          avatar: data.session.user.user_metadata?.avatar,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store token for API requests
        if (data.session.access_token) {
          localStorage.setItem('supabase.auth.token', data.session.access_token);
        }
        
        return true;
      }

      // If Supabase auth fails, try demo users as fallback
      console.log('Supabase auth failed, trying demo users:', error?.message);
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (demoUser) {
        const userData: User = {
          id: `demo-${demoUser.role}`,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        
        // Store demo token for API requests
        localStorage.setItem('supabase.auth.token', publicAnonKey);
        localStorage.setItem('restaurant_demo_user', JSON.stringify(userData));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      
      // Last resort: try demo users
      const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
      if (demoUser) {
        const userData: User = {
          id: `demo-${demoUser.role}`,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
        };
        
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('supabase.auth.token', publicAnonKey);
        localStorage.setItem('restaurant_demo_user', JSON.stringify(userData));
        return true;
      }
      
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      // Call the server endpoint to create user with service role key
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-4a129884/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Signup error:', error);
        return false;
      }

      // Now sign in with the new credentials
      return await login(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('restaurant_demo_user');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if Supabase logout fails
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('restaurant_demo_user');
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) ?? false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      isAuthenticated,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}