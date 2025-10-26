# Demo Mode Implementation Guide

## Quick Reference

### What is Demo Mode?
Demo mode allows users to test the full RestaurantOS system without any backend setup. It uses local data stored in `/utils/demoData.ts` and updates happen only in memory during the session.

### When is Demo Mode Active?
Demo mode is automatically active when a user logs in with one of the quick login demo accounts:
- `customer@restaurant.com`
- `staff@restaurant.com`
- `owner@restaurant.com`

## Detection

### isDemoMode() Function
```typescript
// Location: /utils/demoData.ts
export const isDemoMode = () => {
  const savedDemoUser = localStorage.getItem('restaurant_demo_user');
  if (savedDemoUser) {
    try {
      const user = JSON.parse(savedDemoUser);
      return user.id?.startsWith('demo-');
    } catch {
      return false;
    }
  }
  return false;
};
```

### How to Use
```typescript
import { isDemoMode } from './utils/demoData';

// In any function
if (isDemoMode()) {
  // Use local demo data
} else {
  // Make API call
}
```

## Implementation Pattern

### For Fetch/Read Operations
```typescript
const fetchSomething = useCallback(async () => {
  setIsLoading(true);
  try {
    if (isDemoMode()) {
      // Load from demo data
      setSomething(demoSomething);
    } else {
      // Fetch from API
      const data = await someAPI.getAll();
      setSomething(data);
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
    // Fallback to demo data on error
    setSomething(demoSomething);
  } finally {
    setIsLoading(false);
  }
}, []);
```

### For Mutation/Write Operations
```typescript
const updateSomething = async (id: string, updates: any) => {
  try {
    if (isDemoMode()) {
      // Update local state only
      setSomethings(prevSomethings => 
        prevSomethings.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      );
    } else {
      // Make API call
      await someAPI.update(id, updates);
      await refreshSomethings();
    }
  } catch (error) {
    console.error('Failed to update:', error);
  }
};
```

### For Create Operations
```typescript
const createSomething = async (data: any) => {
  try {
    if (isDemoMode()) {
      // Create in local state only
      const newItem = {
        ...data,
        id: `item-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setSomethings(prev => [...prev, newItem]);
    } else {
      // Make API call
      await someAPI.create(data);
      await refreshSomethings();
    }
  } catch (error) {
    console.error('Failed to create:', error);
  }
};
```

### For Delete Operations
```typescript
const deleteSomething = async (id: string) => {
  try {
    if (isDemoMode()) {
      // Remove from local state only
      setSomethings(prev => prev.filter(item => item.id !== id));
    } else {
      // Make API call
      await someAPI.delete(id);
      await refreshSomethings();
    }
  } catch (error) {
    console.error('Failed to delete:', error);
  }
};
```

## Demo Data Structure

### Location
All demo data is stored in `/utils/demoData.ts`

### Available Demo Data
```typescript
export const demoMenuItems = [...];      // 8 menu items
export const demoTables = [...];         // 8 tables
export const demoWaitlist = [...];       // 2 waitlist entries
export const demoOrders = [...];         // 2 orders
export const demoReservations = [...];   // 1 reservation
export const demoSettings = {...};       // Restaurant settings
export const demoStats = {...};          // Analytics stats
```

### Adding New Demo Data
1. Add the data export to `/utils/demoData.ts`
2. Follow the existing interface structure
3. Use realistic data with proper timestamps
4. Include all required fields

## Current Implementation Status

### ✅ Fully Implemented

#### Fetch Functions (5)
- `refreshMenuItems()` - Menu items
- `refreshTables()` - Tables
- `refreshOrders()` - Orders
- `refreshWaitlist()` - Waitlist
- `refreshSettings()` - Settings

#### Mutation Functions (9)
- `updateMenuItemStatus()` - Menu availability
- `updateMenuItemPrepTime()` - Prep times
- `updateTableStatus()` - Table status
- `updateTable()` - Table updates
- `addToWaitlist()` - Add to waitlist
- `removeFromWaitlist()` - Remove from waitlist
- `updateWaitlistEntry()` - Update waitlist
- `createTableOrder()` - Create order
- `updateTableOrderStatus()` - Update order

#### App Initialization
- `initializeDatabase()` - Skipped in demo mode

## Adding Demo Mode to New Features

### Step 1: Add Demo Data
```typescript
// In /utils/demoData.ts
export const demoNewFeature = [
  {
    id: 'demo-1',
    // ... your demo data
  },
];
```

### Step 2: Import Demo Data
```typescript
// In your context or component
import { isDemoMode, demoNewFeature } from './utils/demoData';
```

### Step 3: Add Demo Mode Check
```typescript
// For fetching
const fetchNewFeature = useCallback(async () => {
  try {
    if (isDemoMode()) {
      setNewFeature(demoNewFeature);
    } else {
      const data = await newFeatureAPI.getAll();
      setNewFeature(data);
    }
  } catch (error) {
    console.error('Failed to fetch:', error);
    setNewFeature(demoNewFeature); // Fallback
  }
}, []);

// For mutations
const updateNewFeature = async (id: string, updates: any) => {
  if (isDemoMode()) {
    setNewFeature(prev => 
      prev.map(item => item.id === id ? { ...item, ...updates } : item)
    );
  } else {
    await newFeatureAPI.update(id, updates);
    await fetchNewFeature();
  }
};
```

## Best Practices

### ✅ DO
- Always check `isDemoMode()` before making API calls
- Provide fallback to demo data on API errors
- Update local state immediately in demo mode
- Use realistic demo data with proper timestamps
- Test both demo and production modes

### ❌ DON'T
- Don't make API calls in demo mode
- Don't forget the demo mode check in new features
- Don't use empty or unrealistic demo data
- Don't skip error handling
- Don't assume demo mode is always active

## Troubleshooting

### "Unauthorized" Errors
**Symptom:** API calls failing with "Unauthorized: Invalid token"
**Cause:** Missing `isDemoMode()` check
**Fix:** Add demo mode check to the function making API calls

### Demo Data Not Showing
**Symptom:** Empty state even in demo mode
**Cause:** Demo data not imported or not set
**Fix:** Import demo data and ensure it's set in the demo mode branch

### Changes Not Persisting
**Symptom:** Updates disappear after refresh
**Expected:** Demo mode is session-based, changes don't persist
**Solution:** This is by design; production mode uses backend for persistence

## Testing Checklist

### Before Deployment
- [ ] Test all features in demo mode (customer, staff, owner)
- [ ] Verify no API calls in browser console
- [ ] Test all CRUD operations
- [ ] Verify production mode still works
- [ ] Check error fallbacks work correctly

### For New Features
- [ ] Demo data added to `/utils/demoData.ts`
- [ ] `isDemoMode()` check added to fetch functions
- [ ] `isDemoMode()` check added to mutation functions
- [ ] Error fallback to demo data implemented
- [ ] Both modes tested

## Resources

### Key Files
- `/utils/demoData.ts` - Demo data definitions
- `/contexts/RestaurantContext.tsx` - Main state management
- `/App.tsx` - App initialization
- `/DEMO_MODE_FINAL_FIX.md` - Complete implementation details

### Related Documentation
- `BACKEND_GUIDE.md` - Backend architecture
- `README.md` - Getting started guide
- `MVP_COMPLETION.md` - Feature completeness

---

**Last Updated:** 2025-10-12  
**Version:** v1.4.0  
**Status:** Production Ready ✅
