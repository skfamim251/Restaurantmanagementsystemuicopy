# Cart and Order Management Fix

## Problem

When a customer added items to their cart in demo mode and then staff logged in to check orders, **all users were seeing the same cart items**. This created confusion because:

1. The cart was globally shared across all users
2. Staff couldn't tell which items belonged to which customer/table
3. Multiple tables placing orders would result in all items appearing in one mixed cart
4. No way to track which order belonged to which table

## Root Cause

The cart was stored in localStorage with a **single global key** (`restaurant-cart`) that was shared across all users:

```tsx
// BEFORE - Global cart (broken)
const [cartItems, setCartItems] = useState<CartItem[]>(() => {
  const saved = localStorage.getItem('restaurant-cart'); // ❌ Same key for everyone
  return saved ? JSON.parse(saved) : [];
});
```

## Solution

### 1. User-Specific Cart Storage

Made the cart **user-specific** by storing it with a unique key per user:

```tsx
// AFTER - User-specific cart (fixed)
const getUserCartKey = () => {
  // For authenticated users - use their user ID
  const authData = localStorage.getItem('supabase.auth.token');
  if (authData) {
    const userId = JSON.parse(authData)?.user?.id;
    if (userId) return `restaurant-cart-${userId}`;
  }
  
  // For demo mode - use their email
  const demoUser = localStorage.getItem('demo-user');
  if (demoUser) {
    const email = JSON.parse(demoUser).email;
    return `restaurant-cart-demo-${email}`;
  }
  
  return 'restaurant-cart'; // Fallback
};

const [cartItems, setCartItems] = useState<CartItem[]>(() => {
  const cartKey = getUserCartKey(); // ✅ Unique key per user
  const saved = localStorage.getItem(cartKey);
  return saved ? JSON.parse(saved) : [];
});
```

### 2. Enhanced Kitchen Dashboard

Improved the **Active Orders by Table** section to show:
- Table number and customer name
- List of items in each order (with quantities)
- Order status (pending/preparing)
- Time since order was placed
- Visual grouping by table

**Before:**
```
Table 5 | preparing
John Doe party
3 items • 15m ago
```

**After:**
```
Table 5
John Doe

• Margherita Pizza ×2
• Caesar Salad ×1
• Tiramisu ×1

3 total items | 15m ago
[preparing]
```

### 3. Cart Sidebar User Indicator

Added a **user badge** in the cart sidebar to clearly show whose cart is being viewed:

```
┌─────────────────────────────┐
│ 🛒 Your Order       [3]     │
├─────────────────────────────┤
│ Cart for:                   │
│ john@example.com            │
│                   [customer]│
└─────────────────────────────┘
```

This prevents confusion when staff switches between accounts.

## How It Works Now

### Customer Flow
1. **Customer logs in** → Gets their own unique cart
2. **Adds items to cart** → Items stored under `restaurant-cart-demo-customer@demo.com`
3. **Cart persists** → Customer can logout/login and see their cart
4. **Checkout** → Staff assigns table and creates order

### Staff Flow
1. **Staff logs in** → Gets their own empty cart (separate from customers)
2. **Views Kitchen Dashboard** → Sees all active orders **grouped by table**
3. **Each order shows**:
   - Which table it belongs to
   - Customer name
   - List of items with quantities
   - Order status and timing
4. **Can take new orders** → Uses their own cart to add items for walk-ins

### Multi-Table Scenario
```
Table 1 (Sarah's party)
  - Pasta ×2
  - Wine ×1
  
Table 3 (Mike's party)  
  - Burger ×3
  - Fries ×2
  
Table 7 (Emma's party)
  - Salad ×1
  - Soup ×2
```

Each order is **clearly separated and labeled** by table.

## Files Modified

1. **`/contexts/RestaurantContext.tsx`**
   - Added `getUserCartKey()` function to generate user-specific cart keys
   - Updated cart initialization to use user-specific storage
   - Updated cart persistence to save to user-specific key

2. **`/components/KitchenDashboard.tsx`**
   - Enhanced "Active Orders by Table" section
   - Added item list preview for each order
   - Improved visual hierarchy and information density

3. **`/components/CartSidebar.tsx`**
   - Added user badge showing whose cart is being viewed
   - Displays user name/email and role
   - Helps prevent confusion when switching accounts

## Benefits

✅ **No More Cart Confusion**: Each user has their own cart
✅ **Clear Order Tracking**: Staff can see which items belong to which table
✅ **Better Organization**: Orders grouped by table with full context
✅ **Persistent Carts**: Users keep their cart items across sessions
✅ **Multi-Table Support**: Handle multiple simultaneous orders without confusion

## Testing

### Test Case 1: Customer Cart Isolation
1. Login as `customer@demo.com`
2. Add 3 items to cart
3. Logout and login as `staff@demo.com`
4. **Expected**: Staff cart is empty (not seeing customer's items) ✅

### Test Case 2: Order Visibility
1. Customer places order at Table 5
2. Staff logs in and views Kitchen Dashboard
3. **Expected**: Order appears under "Table 5" with customer name and items ✅

### Test Case 3: Multiple Tables
1. Create orders for Tables 1, 3, and 7
2. Staff views Kitchen Dashboard
3. **Expected**: All three orders shown separately, each clearly labeled ✅

## Result

The restaurant management system now properly handles:
- ✅ User-specific carts
- ✅ Order tracking by table
- ✅ Clear visual separation of orders
- ✅ No confusion when multiple staff/customers use the system
- ✅ Professional order management workflow
