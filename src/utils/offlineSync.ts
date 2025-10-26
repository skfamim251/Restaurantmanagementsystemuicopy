// Offline sync utilities for RestaurantOS

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  data: any;
  timestamp: number;
}

const PENDING_ACTIONS_KEY = 'restaurantos_pending_actions';

// Register service worker
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker available');
              // Optionally notify user about update
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
}

// Check if online
export function isOnline(): boolean {
  return navigator.onLine;
}

// Get pending actions from localStorage
export function getPendingActions(): PendingAction[] {
  try {
    const stored = localStorage.getItem(PENDING_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting pending actions:', error);
    return [];
  }
}

// Save pending action
export function savePendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>) {
  const pendingActions = getPendingActions();
  const newAction: PendingAction = {
    ...action,
    id: `${Date.now()}_${Math.random().toString(36).substring(2)}`,
    timestamp: Date.now(),
  };
  
  pendingActions.push(newAction);
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(pendingActions));
  
  return newAction;
}

// Remove pending action
export function removePendingAction(id: string) {
  const pendingActions = getPendingActions();
  const filtered = pendingActions.filter(action => action.id !== id);
  localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(filtered));
}

// Clear all pending actions
export function clearPendingActions() {
  localStorage.removeItem(PENDING_ACTIONS_KEY);
}

// Sync pending actions
export async function syncPendingActions(apiBaseUrl: string, getToken: () => string) {
  if (!isOnline()) {
    console.log('Cannot sync - offline');
    return { success: false, error: 'Offline' };
  }

  const pendingActions = getPendingActions();
  
  if (pendingActions.length === 0) {
    return { success: true, synced: 0 };
  }

  console.log(`Syncing ${pendingActions.length} pending actions...`);
  
  let syncedCount = 0;
  const errors: any[] = [];

  for (const action of pendingActions) {
    try {
      const options: RequestInit = {
        method: action.type === 'create' ? 'POST' : action.type === 'update' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
        },
      };

      if (action.type !== 'delete' && action.data) {
        options.body = JSON.stringify(action.data);
      }

      const response = await fetch(`${apiBaseUrl}${action.endpoint}`, options);
      
      if (response.ok) {
        removePendingAction(action.id);
        syncedCount++;
        console.log(`Synced action ${action.id}`);
      } else {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        errors.push({ action: action.id, error });
        console.error(`Failed to sync action ${action.id}:`, error);
      }
    } catch (error) {
      console.error(`Error syncing action ${action.id}:`, error);
      errors.push({ action: action.id, error });
    }
  }

  return {
    success: errors.length === 0,
    synced: syncedCount,
    errors,
  };
}

// Setup online/offline event listeners
export function setupOnlineListeners(onOnline?: () => void, onOffline?: () => void) {
  const handleOnline = () => {
    console.log('Back online');
    if (onOnline) onOnline();
    
    // Trigger sync
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SYNC_NOW' });
    }
  };

  const handleOffline = () => {
    console.log('Gone offline');
    if (onOffline) onOffline();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

// Queue an API action for later execution (when offline)
export async function queueOrExecute<T>(
  online: boolean,
  executeAction: () => Promise<T>,
  queueData: Omit<PendingAction, 'id' | 'timestamp'>
): Promise<T | null> {
  if (online) {
    // Execute immediately if online
    return await executeAction();
  } else {
    // Queue for later if offline
    savePendingAction(queueData);
    console.log('Action queued for sync:', queueData.type, queueData.endpoint);
    return null;
  }
}

// Cache data locally for offline access
export function cacheData(key: string, data: any) {
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now(),
    }));
  } catch (error) {
    console.error('Error caching data:', error);
  }
}

// Get cached data
export function getCachedData<T>(key: string, maxAge: number = 3600000): T | null {
  try {
    const stored = localStorage.getItem(`cache_${key}`);
    if (!stored) return null;

    const { data, timestamp } = JSON.parse(stored);
    
    // Check if cache is still valid
    if (Date.now() - timestamp > maxAge) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }

    return data as T;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
}

// Clear cached data
export function clearCache(key?: string) {
  if (key) {
    localStorage.removeItem(`cache_${key}`);
  } else {
    // Clear all cache entries
    const keys = Object.keys(localStorage);
    keys.forEach(k => {
      if (k.startsWith('cache_')) {
        localStorage.removeItem(k);
      }
    });
  }
}
