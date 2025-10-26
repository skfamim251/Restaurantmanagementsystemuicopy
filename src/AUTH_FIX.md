# Authentication Token Fix

## Problem
The application was experiencing "Unauthorized: Invalid token" errors when trying to fetch settings, orders, and waitlist data.

## Root Cause
The issue was caused by a **race condition in the provider hierarchy**:

1. `RestaurantProvider` was mounted at the top level (in App.tsx) alongside `AuthProvider`
2. When the app loaded, both providers mounted simultaneously
3. `RestaurantProvider` immediately called `refreshAll()` to fetch data
4. At this point, the user hadn't logged in yet, so there was no valid auth token
5. API calls were made with the public anon key or no token
6. Backend rejected these requests with "Unauthorized: Invalid token"

## Solution
**Moved `RestaurantProvider` inside `AppContent`**, after the authentication check:

```tsx
// BEFORE (Broken)
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <RestaurantProvider>  {/* ❌ Mounted before auth check */}
          <AppContent />
        </RestaurantProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

// AFTER (Fixed)
export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />  {/* RestaurantProvider now inside AppContent */}
      </NotificationProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <LoginForm />;
  }
  
  return (
    <RestaurantProvider>  {/* ✅ Only mounted after authentication */}
      {/* App content */}
    </RestaurantProvider>
  );
}
```

## Benefits

1. **No Race Conditions**: RestaurantProvider only mounts after user is authenticated
2. **Valid Tokens**: All API calls are made with a valid authentication token
3. **Cleaner Flow**: Data fetching happens at the right time in the lifecycle
4. **Better Performance**: No wasted API calls before authentication

## Flow

### Before Login
1. App renders
2. AuthProvider checks for existing session
3. No session found
4. LoginForm is displayed
5. RestaurantProvider is NOT mounted yet (no API calls)

### After Login
1. User logs in successfully
2. Auth token stored in localStorage
3. isAuthenticated becomes true
4. AppContent re-renders
5. RestaurantProvider mounts
6. refreshAll() is called with valid auth token
7. All data fetched successfully

### Demo Mode
Same flow as above, but with demo credentials and demo data fallbacks.

## Related Files Modified
- `/App.tsx` - Moved RestaurantProvider inside AppContent
- `/contexts/RestaurantContext.tsx` - Simplified initialization (no longer needs token check)
- `/supabase/functions/server/index.tsx` - Added better logging for auth debugging

## Result
✅ No more "Unauthorized: Invalid token" errors
✅ Clean authentication flow
✅ Data fetching only happens when appropriate
