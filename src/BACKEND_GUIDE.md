# RestaurantOS Backend Implementation Guide

## Overview

RestaurantOS now has a complete backend implementation using Supabase Edge Functions with a Hono web server and key-value storage. The system supports all database operations for the 10 collections outlined in your schema.

## Architecture

```
Frontend (React) → API Client (/utils/api.ts) → Supabase Edge Function Server → KV Store
```

### Three-Tier Architecture:
- **Frontend**: React components making API calls
- **Server**: Hono web server in `/supabase/functions/server/index.tsx`
- **Database**: Key-value store accessed via `/supabase/functions/server/kv_store.tsx`

## Authentication

### Supabase Auth Integration

The system uses Supabase's built-in authentication service with role-based access control:

- **Customer**: Can view menu, add to cart, place orders
- **Staff**: All customer permissions + kitchen management, table management, host dashboard
- **Owner**: All permissions + analytics, revenue data, settings management

### Creating Users

Users are created through the signup endpoint which uses the Supabase service role key:

```typescript
POST /make-server-4a129884/auth/signup
{
  "email": "user@restaurant.com",
  "password": "password123",
  "name": "User Name",
  "role": "customer" | "staff" | "owner"
}
```

### Test Users

You can create test users through the LoginForm component's signup tab.

## API Endpoints

All endpoints are prefixed with `/make-server-4a129884/`

### Menu Items

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/menu-items` | No | - | Get all menu items |
| GET | `/menu-items/:id` | No | - | Get single menu item |
| POST | `/menu-items` | Yes | Owner | Create menu item |
| PUT | `/menu-items/:id` | Yes | Owner/Staff | Update menu item |
| DELETE | `/menu-items/:id` | Yes | Owner | Delete menu item |

### Tables

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/tables` | No | - | Get all tables |
| GET | `/tables/:id` | No | - | Get single table |
| POST | `/tables` | Yes | Owner | Create table |
| PUT | `/tables/:id` | Yes | Owner/Staff | Update table status/info |

### Orders

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/orders` | Yes | All | Get all orders |
| GET | `/orders/:id` | Yes | All | Get single order |
| POST | `/orders` | Yes | All | Create order |
| PUT | `/orders/:id` | Yes | All | Update order status |

### Reservations

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/reservations` | Yes | All | Get all reservations |
| POST | `/reservations` | Yes | All | Create reservation |
| PUT | `/reservations/:id` | Yes | Owner/Staff | Update reservation |

### Waitlist

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/waitlist` | Yes | All | Get waitlist entries |
| POST | `/waitlist` | No | - | Add to waitlist |
| PUT | `/waitlist/:id` | Yes | Owner/Staff | Update waitlist entry |
| DELETE | `/waitlist/:id` | Yes | Owner/Staff | Remove from waitlist |

### Metrics

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/metrics/daily/:date` | Yes | Owner | Get daily metrics |
| PUT | `/metrics/daily/:date` | Yes | Owner | Update daily metrics |

### Notifications

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/notifications` | Yes | All | Get user notifications |
| POST | `/notifications` | Yes | Owner/Staff | Create notification |
| PUT | `/notifications/:id/read` | Yes | All | Mark as read |

### Settings

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/settings` | Yes | All | Get restaurant settings |
| PUT | `/settings` | Yes | Owner | Update settings |

### Analytics

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/analytics/summary` | Yes | Owner | Get analytics summary |

## Using the API Client

The API client is located at `/utils/api.ts` and provides convenient functions for all endpoints:

```typescript
import { menuItemsAPI, tablesAPI, ordersAPI } from './utils/api';

// Get all menu items
const { menuItems } = await menuItemsAPI.getAll();

// Create a new order
const { order } = await ordersAPI.create({
  tableId: 'table_123',
  items: [
    { id: 'menu_1', quantity: 2, price: 15.99 }
  ],
  totalAmount: 31.98
});

// Update table status
await tablesAPI.update('table_123', { status: 'occupied' });
```

## Data Models

### Menu Item
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  prepTime: number; // minutes
  ingredients: string[];
  allergens: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Table
```typescript
{
  id: string;
  number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  position: { x: number; y: number };
  currentOrderId: string | null;
  createdAt: string;
  updatedAt: string;
}
```

### Order
```typescript
{
  id: string;
  tableId: string | null;
  customerId: string;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}
```

### Reservation
```typescript
{
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  dateTime: string;
  tableId: string | null;
  status: 'pending' | 'confirmed' | 'seated' | 'cancelled';
  notes: string;
  createdAt: string;
  updatedAt: string;
}
```

### Waitlist Entry
```typescript
{
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  status: 'waiting' | 'notified' | 'seated' | 'cancelled';
  estimatedWaitTime: number; // minutes
  notified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Sample Data Initialization

The system automatically initializes sample data when an owner first logs in:

- **8 sample menu items** across categories (appetizers, mains, desserts)
- **8 tables** with varying capacities (2, 4, 6, 8 seats)
- **Default restaurant settings** (opening hours, tax rate, etc.)

This initialization only runs once and only for owner accounts.

## Error Handling

All endpoints include comprehensive error handling:

- **401 Unauthorized**: Missing or invalid auth token
- **403 Forbidden**: User lacks required permissions
- **404 Not Found**: Resource doesn't exist
- **400 Bad Request**: Invalid request data
- **500 Internal Server Error**: Server-side error

Errors are logged to the console with detailed context for debugging.

## Best Practices

1. **Always handle errors** when making API calls:
   ```typescript
   try {
     const { menuItems } = await menuItemsAPI.getAll();
   } catch (error) {
     console.error('Failed to fetch menu items:', error);
     // Show user-friendly error message
   }
   ```

2. **Check user permissions** before showing UI elements:
   ```typescript
   const { hasPermission } = useAuth();
   
   {hasPermission('view_analytics') && (
     <AnalyticsDashboard />
   )}
   ```

3. **Refresh data after mutations**:
   ```typescript
   await menuItemsAPI.update(id, { available: false });
   // Refresh the list
   const { menuItems } = await menuItemsAPI.getAll();
   ```

## Next Steps

To fully integrate the backend with your existing components:

1. Update `RestaurantContext.tsx` to fetch data from API instead of using mock data
2. Add error boundaries to handle API failures gracefully
3. Implement loading states for async operations
4. Add optimistic updates for better UX
5. Implement real-time updates using Supabase Realtime (optional)

## Debugging

- Check browser console for API errors
- Server logs are visible in Supabase dashboard
- Use `/make-server-4a129884/health` endpoint to verify server is running
- Test authentication flow with different user roles

## Security Notes

- The `SUPABASE_SERVICE_ROLE_KEY` is kept secure on the server
- Auth tokens are required for protected endpoints
- Role-based access control prevents unauthorized actions
- All user inputs should be validated (add validation as needed)
