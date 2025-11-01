import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  type: 'order_update' | 'table_update' | 'kitchen_alert' | 'customer_request';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    // Filter notifications based on user role
    const shouldShowNotification = () => {
      if (!user) return false;
      
      switch (user.role) {
        case 'customer':
          // Customers only see order updates related to their orders
          return notification.type === 'order_update';
        case 'staff':
          // Staff see all operational notifications except system-wide alerts
          return ['order_update', 'table_update', 'customer_request'].includes(notification.type);
        case 'owner':
          // Owners see all notifications
          return true;
        default:
          return false;
      }
    };

    if (!shouldShowNotification()) return;

    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast(notification.title, {
      description: notification.message,
      duration: 5000,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Real-time updates are now triggered only by actual events
  // Remove auto-generation of fake notifications
  useEffect(() => {
    if (!user) return;
    
    // Set up WebSocket or polling for real-time notifications
    // This will be implemented when connected to actual backend events
    
    return () => {
      // Cleanup
    };
  }, [user]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}