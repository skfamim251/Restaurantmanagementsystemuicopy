import { projectId, publicAnonKey } from './supabase/info';

export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-4a129884`;

// Helper function to get auth token from localStorage
function getAuthToken(): string {
  return localStorage.getItem('supabase.auth.token') || publicAnonKey;
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error(`API error on ${endpoint}:`, error);
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// MENU ITEMS API
// ============================================================================

export const menuItemsAPI = {
  getAll: () => apiRequest<{ menuItems: any[] }>('/menu-items'),
  
  getById: (id: string) => apiRequest<{ menuItem: any }>(`/menu-items/${id}`),
  
  create: (menuItem: any) =>
    apiRequest<{ menuItem: any }>('/menu-items', {
      method: 'POST',
      body: JSON.stringify(menuItem),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<{ menuItem: any }>(`/menu-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  delete: (id: string) =>
    apiRequest<{ success: boolean }>(`/menu-items/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// TABLES API
// ============================================================================

export const tablesAPI = {
  getAll: () => apiRequest<{ tables: any[] }>('/tables'),
  
  getById: (id: string) => apiRequest<{ table: any }>(`/tables/${id}`),
  
  create: (table: any) =>
    apiRequest<{ table: any }>('/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<{ table: any }>(`/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================================================
// ORDERS API
// ============================================================================

export const ordersAPI = {
  getAll: () => apiRequest<{ orders: any[] }>('/orders'),
  
  getById: (id: string) => apiRequest<{ order: any }>(`/orders/${id}`),
  
  create: (order: any) =>
    apiRequest<{ order: any }>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<{ order: any }>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================================================
// RESERVATIONS API
// ============================================================================

export const reservationsAPI = {
  getAll: () => apiRequest<{ reservations: any[] }>('/reservations'),
  
  create: (reservation: any) =>
    apiRequest<{ reservation: any }>('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservation),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<{ reservation: any }>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
};

// ============================================================================
// WAITLIST API
// ============================================================================

export const waitlistAPI = {
  getAll: () => apiRequest<{ waitlist: any[] }>('/waitlist'),
  
  add: (entry: any) =>
    apiRequest<{ entry: any }>('/waitlist', {
      method: 'POST',
      body: JSON.stringify(entry),
    }),
  
  update: (id: string, updates: any) =>
    apiRequest<{ entry: any }>(`/waitlist/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  
  remove: (id: string) =>
    apiRequest<{ success: boolean }>(`/waitlist/${id}`, {
      method: 'DELETE',
    }),
};

// ============================================================================
// METRICS API
// ============================================================================

export const metricsAPI = {
  getDaily: (date: string) =>
    apiRequest<{ metrics: any }>(`/metrics/daily/${date}`),
  
  updateDaily: (date: string, metrics: any) =>
    apiRequest<{ metrics: any }>(`/metrics/daily/${date}`, {
      method: 'PUT',
      body: JSON.stringify(metrics),
    }),
};

// ============================================================================
// NOTIFICATIONS API
// ============================================================================

export const notificationsAPI = {
  getAll: () => apiRequest<{ notifications: any[] }>('/notifications'),
  
  create: (notification: any) =>
    apiRequest<{ notification: any }>('/notifications', {
      method: 'POST',
      body: JSON.stringify(notification),
    }),
  
  markAsRead: (id: string) =>
    apiRequest<{ notification: any }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),
};

// ============================================================================
// SETTINGS API
// ============================================================================

export const settingsAPI = {
  get: () => apiRequest<{ settings: any }>('/settings'),
  
  update: (settings: any) =>
    apiRequest<{ settings: any }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

// ============================================================================
// ANALYTICS API
// ============================================================================

export const analyticsAPI = {
  getSummary: () => apiRequest<{ analytics: any }>('/analytics/summary'),
};

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  needsSetup: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/needs-setup`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      if (!response.ok) {
        return { needsSetup: false };
      }
      return response.json();
    } catch (error) {
      console.error('Error checking setup status:', error);
      return { needsSetup: false };
    }
  },
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

export const healthCheck = () =>
  apiRequest<{ status: string }>('/health');

// ============================================================================
// CONVENIENCE EXPORTS (for backward compatibility)
// ============================================================================

export const getMenuItems = async () => {
  const result = await menuItemsAPI.getAll();
  return result.menuItems;
};

export const createMenuItem = async (menuItem: any) => {
  const result = await menuItemsAPI.create(menuItem);
  return result.menuItem;
};

export const updateMenuItem = async (id: string, updates: any) => {
  const result = await menuItemsAPI.update(id, updates);
  return result.menuItem;
};

export const deleteMenuItem = async (id: string) => {
  await menuItemsAPI.delete(id);
};

export const getTables = async () => {
  const result = await tablesAPI.getAll();
  return result.tables;
};

export const createTable = async (table: any) => {
  const result = await tablesAPI.create(table);
  return result.table;
};

export const updateTable = async (id: string, updates: any) => {
  const result = await tablesAPI.update(id, updates);
  return result.table;
};

export const getOrders = async () => {
  const result = await ordersAPI.getAll();
  return result.orders;
};

export const createOrder = async (order: any) => {
  const result = await ordersAPI.create(order);
  return result.order;
};

export const updateOrder = async (id: string, updates: any) => {
  const result = await ordersAPI.update(id, updates);
  return result.order;
};

export const getWaitlist = async () => {
  const result = await waitlistAPI.getAll();
  return result.waitlist;
};

export const addToWaitlist = async (entry: any) => {
  const result = await waitlistAPI.add(entry);
  return result.entry;
};

export const updateWaitlistEntry = async (id: string, updates: any) => {
  const result = await waitlistAPI.update(id, updates);
  return result.entry;
};

export const removeFromWaitlist = async (id: string) => {
  await waitlistAPI.remove(id);
};

// Helper to get/set token
export const getToken = getAuthToken;
