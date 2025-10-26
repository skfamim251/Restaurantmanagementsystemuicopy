import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Supabase client for auth verification
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Get public anon key from environment (it should be available)
const PUBLIC_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';

// Middleware to verify authentication and get user
async function verifyAuth(c: any, next: any) {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'Unauthorized: No token provided' }, 401);
    }

    // Allow public anon key for demo/unauthenticated access
    if (PUBLIC_ANON_KEY && accessToken === PUBLIC_ANON_KEY) {
      console.log('Using public anon key - granting customer access');
      c.set('userId', null);
      c.set('userEmail', null);
      c.set('userRole', 'customer');
      c.set('isPublic', true);
      await next();
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      console.log(`Authorization error: ${error?.message || 'No user found'}`);
      // Debug logging (remove in production)
      if (!PUBLIC_ANON_KEY) {
        console.log('WARNING: SUPABASE_ANON_KEY environment variable not set');
      }
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    c.set('userRole', user.user_metadata?.role || 'customer');
    c.set('isPublic', false);
    await next();
  } catch (error) {
    console.log(`Authorization error during auth verification: ${error}`);
    return c.json({ error: 'Unauthorized: Auth verification failed' }, 401);
  }
}

// Helper function to generate IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Health check endpoint
app.get("/make-server-4a129884/health", (c) => {
  return c.json({ status: "ok" });
});

// Check if system needs initial setup (no owners exist)
app.get("/make-server-4a129884/auth/needs-setup", async (c) => {
  try {
    // List all users and check if any have owner role
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log(`Error checking for owners: ${error.message}`);
      return c.json({ needsSetup: false }); // Fail safe - assume setup is done
    }

    const hasOwner = users.some(user => user.user_metadata?.role === 'owner');
    return c.json({ needsSetup: !hasOwner });
  } catch (error) {
    console.log(`Error during setup check: ${error}`);
    return c.json({ needsSetup: false });
  }
});

// ============================================================================
// AUTH ROUTES
// ============================================================================

// Signup endpoint - public signups are always "customer" role (except first-time setup)
app.post("/make-server-4a129884/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role } = body;

    // Check if this is first-time setup (no owners exist)
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const hasOwner = users?.some(user => user.user_metadata?.role === 'owner') || false;

    // Determine the role
    let userRole = 'customer'; // Default to customer
    
    if (!hasOwner && role === 'owner') {
      // FIRST-TIME SETUP: Allow creating the first owner account
      userRole = 'owner';
      console.log('First-time setup: Creating initial owner account');
    } else if (hasOwner) {
      // SECURITY: After first owner exists, public signups can only create customer accounts
      // Staff and Owner accounts must be created through /auth/invite endpoint
      userRole = 'customer';
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role: userRole,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Signup error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user }, 201);
  } catch (error) {
    console.log(`Signup error during user creation: ${error}`);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Invite user endpoint - owners can create staff/owner accounts
app.post("/make-server-4a129884/auth/invite", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can invite users' }, 403);
    }
    
    const body = await c.req.json();
    const { email, password, name, role } = body;

    // Validate role
    if (!['customer', 'staff', 'owner'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Create user with specified role
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        role,
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log(`Invite error: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user }, 201);
  } catch (error) {
    console.log(`Invite error during user creation: ${error}`);
    return c.json({ error: 'Failed to invite user' }, 500);
  }
});

// ============================================================================
// MENU ITEMS ROUTES
// ============================================================================

// Get all menu items
app.get("/make-server-4a129884/menu-items", async (c) => {
  try {
    const items = await kv.getByPrefix("menuItem:");
    return c.json({ menuItems: items || [] });
  } catch (error) {
    console.log(`Error fetching menu items: ${error}`);
    return c.json({ error: 'Failed to fetch menu items' }, 500);
  }
});

// Get a single menu item
app.get("/make-server-4a129884/menu-items/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const item = await kv.get(`menuItem:${id}`);
    
    if (!item) {
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    return c.json({ menuItem: item });
  } catch (error) {
    console.log(`Error fetching menu item: ${error}`);
    return c.json({ error: 'Failed to fetch menu item' }, 500);
  }
});

// Create menu item (owner only)
app.post("/make-server-4a129884/menu-items", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can create menu items' }, 403);
    }
    
    const body = await c.req.json();
    const id = generateId('menu');
    const menuItem = {
      id,
      name: body.name,
      description: body.description || '',
      price: body.price,
      category: body.category,
      imageUrl: body.imageUrl || '',
      available: body.available !== undefined ? body.available : true,
      prepTime: body.prepTime || 15,
      ingredients: body.ingredients || [],
      allergens: body.allergens || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`menuItem:${id}`, menuItem);
    return c.json({ menuItem }, 201);
  } catch (error) {
    console.log(`Error creating menu item: ${error}`);
    return c.json({ error: 'Failed to create menu item' }, 500);
  }
});

// Update menu item (owner/staff)
app.put("/make-server-4a129884/menu-items/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can update menu items' }, 403);
    }
    
    const id = c.req.param('id');
    const existingItem = await kv.get(`menuItem:${id}`);
    
    if (!existingItem) {
      return c.json({ error: 'Menu item not found' }, 404);
    }
    
    const body = await c.req.json();
    const updatedItem = {
      ...existingItem,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`menuItem:${id}`, updatedItem);
    return c.json({ menuItem: updatedItem });
  } catch (error) {
    console.log(`Error updating menu item: ${error}`);
    return c.json({ error: 'Failed to update menu item' }, 500);
  }
});

// Delete menu item (owner only)
app.delete("/make-server-4a129884/menu-items/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can delete menu items' }, 403);
    }
    
    const id = c.req.param('id');
    await kv.del(`menuItem:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting menu item: ${error}`);
    return c.json({ error: 'Failed to delete menu item' }, 500);
  }
});

// ============================================================================
// TABLES ROUTES
// ============================================================================

// Get all tables
app.get("/make-server-4a129884/tables", async (c) => {
  try {
    const tables = await kv.getByPrefix("table:");
    return c.json({ tables: tables || [] });
  } catch (error) {
    console.log(`Error fetching tables: ${error}`);
    return c.json({ error: 'Failed to fetch tables' }, 500);
  }
});

// Get a single table
app.get("/make-server-4a129884/tables/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const table = await kv.get(`table:${id}`);
    
    if (!table) {
      return c.json({ error: 'Table not found' }, 404);
    }
    
    return c.json({ table });
  } catch (error) {
    console.log(`Error fetching table: ${error}`);
    return c.json({ error: 'Failed to fetch table' }, 500);
  }
});

// Create table (owner only)
app.post("/make-server-4a129884/tables", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can create tables' }, 403);
    }
    
    const body = await c.req.json();
    const id = generateId('table');
    const table = {
      id,
      number: body.number,
      capacity: body.capacity,
      status: body.status || 'available',
      position: body.position || { x: 0, y: 0 },
      currentOrderId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`table:${id}`, table);
    return c.json({ table }, 201);
  } catch (error) {
    console.log(`Error creating table: ${error}`);
    return c.json({ error: 'Failed to create table' }, 500);
  }
});

// Update table (staff/owner)
app.put("/make-server-4a129884/tables/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can update tables' }, 403);
    }
    
    const id = c.req.param('id');
    const existingTable = await kv.get(`table:${id}`);
    
    if (!existingTable) {
      return c.json({ error: 'Table not found' }, 404);
    }
    
    const body = await c.req.json();
    const updatedTable = {
      ...existingTable,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`table:${id}`, updatedTable);
    return c.json({ table: updatedTable });
  } catch (error) {
    console.log(`Error updating table: ${error}`);
    return c.json({ error: 'Failed to update table' }, 500);
  }
});

// ============================================================================
// ORDERS ROUTES
// ============================================================================

// Get all orders
app.get("/make-server-4a129884/orders", verifyAuth, async (c) => {
  try {
    const orders = await kv.getByPrefix("order:");
    return c.json({ orders: orders || [] });
  } catch (error) {
    console.log(`Error fetching orders: ${error}`);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get a single order
app.get("/make-server-4a129884/orders/:id", verifyAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    return c.json({ order });
  } catch (error) {
    console.log(`Error fetching order: ${error}`);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Create order
app.post("/make-server-4a129884/orders", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const id = generateId('order');
    
    const order = {
      id,
      tableId: body.tableId || null,
      customerId: userId,
      status: 'pending',
      items: body.items || [],
      totalAmount: body.totalAmount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
    };
    
    await kv.set(`order:${id}`, order);
    
    // Update table if tableId is provided
    if (body.tableId) {
      const table = await kv.get(`table:${body.tableId}`);
      if (table) {
        await kv.set(`table:${body.tableId}`, {
          ...table,
          currentOrderId: id,
          status: 'occupied',
          updatedAt: new Date().toISOString(),
        });
      }
    }
    
    return c.json({ order }, 201);
  } catch (error) {
    console.log(`Error creating order: ${error}`);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Update order
app.put("/make-server-4a129884/orders/:id", verifyAuth, async (c) => {
  try {
    const id = c.req.param('id');
    const existingOrder = await kv.get(`order:${id}`);
    
    if (!existingOrder) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    const body = await c.req.json();
    const updatedOrder = {
      ...existingOrder,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    // If order is completed, set completedAt
    if (body.status === 'completed' && !existingOrder.completedAt) {
      updatedOrder.completedAt = new Date().toISOString();
    }
    
    await kv.set(`order:${id}`, updatedOrder);
    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log(`Error updating order: ${error}`);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// ============================================================================
// RESERVATIONS ROUTES
// ============================================================================

// Get all reservations
app.get("/make-server-4a129884/reservations", verifyAuth, async (c) => {
  try {
    const reservations = await kv.getByPrefix("reservation:");
    return c.json({ reservations: reservations || [] });
  } catch (error) {
    console.log(`Error fetching reservations: ${error}`);
    return c.json({ error: 'Failed to fetch reservations' }, 500);
  }
});

// Create reservation
app.post("/make-server-4a129884/reservations", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const id = generateId('reservation');
    
    const reservation = {
      id,
      customerId: userId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      partySize: body.partySize,
      dateTime: body.dateTime,
      tableId: body.tableId || null,
      status: 'pending',
      notes: body.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`reservation:${id}`, reservation);
    return c.json({ reservation }, 201);
  } catch (error) {
    console.log(`Error creating reservation: ${error}`);
    return c.json({ error: 'Failed to create reservation' }, 500);
  }
});

// Update reservation (staff/owner)
app.put("/make-server-4a129884/reservations/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can update reservations' }, 403);
    }
    
    const id = c.req.param('id');
    const existingReservation = await kv.get(`reservation:${id}`);
    
    if (!existingReservation) {
      return c.json({ error: 'Reservation not found' }, 404);
    }
    
    const body = await c.req.json();
    const updatedReservation = {
      ...existingReservation,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`reservation:${id}`, updatedReservation);
    return c.json({ reservation: updatedReservation });
  } catch (error) {
    console.log(`Error updating reservation: ${error}`);
    return c.json({ error: 'Failed to update reservation' }, 500);
  }
});

// ============================================================================
// WAITLIST ROUTES
// ============================================================================

// Get all waitlist entries
app.get("/make-server-4a129884/waitlist", verifyAuth, async (c) => {
  try {
    const entries = await kv.getByPrefix("waitlist:");
    // Sort by creation time
    const sorted = (entries || []).sort((a: any, b: any) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return c.json({ waitlist: sorted });
  } catch (error) {
    console.log(`Error fetching waitlist: ${error}`);
    return c.json({ error: 'Failed to fetch waitlist' }, 500);
  }
});

// Add to waitlist
app.post("/make-server-4a129884/waitlist", async (c) => {
  try {
    const body = await c.req.json();
    const id = generateId('waitlist');
    
    const entry = {
      id,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      partySize: body.partySize,
      status: 'waiting',
      estimatedWaitTime: body.estimatedWaitTime || 15,
      notified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`waitlist:${id}`, entry);
    return c.json({ entry }, 201);
  } catch (error) {
    console.log(`Error adding to waitlist: ${error}`);
    return c.json({ error: 'Failed to add to waitlist' }, 500);
  }
});

// Update waitlist entry (staff/owner)
app.put("/make-server-4a129884/waitlist/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can update waitlist' }, 403);
    }
    
    const id = c.req.param('id');
    const existingEntry = await kv.get(`waitlist:${id}`);
    
    if (!existingEntry) {
      return c.json({ error: 'Waitlist entry not found' }, 404);
    }
    
    const body = await c.req.json();
    const updatedEntry = {
      ...existingEntry,
      ...body,
      id,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`waitlist:${id}`, updatedEntry);
    return c.json({ entry: updatedEntry });
  } catch (error) {
    console.log(`Error updating waitlist entry: ${error}`);
    return c.json({ error: 'Failed to update waitlist entry' }, 500);
  }
});

// Remove from waitlist (staff/owner)
app.delete("/make-server-4a129884/waitlist/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can remove from waitlist' }, 403);
    }
    
    const id = c.req.param('id');
    await kv.del(`waitlist:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error removing from waitlist: ${error}`);
    return c.json({ error: 'Failed to remove from waitlist' }, 500);
  }
});

// ============================================================================
// DAILY METRICS ROUTES
// ============================================================================

// Get daily metrics (owner only)
app.get("/make-server-4a129884/metrics/daily/:date", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can view metrics' }, 403);
    }
    
    const date = c.req.param('date');
    const metrics = await kv.get(`metrics:${date}`);
    
    if (!metrics) {
      // Return default metrics if none exist
      return c.json({
        metrics: {
          date,
          totalRevenue: 0,
          totalOrders: 0,
          averageOrderValue: 0,
          tableOccupancyRate: 0,
          popularDishes: [],
          peakHours: [],
        }
      });
    }
    
    return c.json({ metrics });
  } catch (error) {
    console.log(`Error fetching daily metrics: ${error}`);
    return c.json({ error: 'Failed to fetch daily metrics' }, 500);
  }
});

// Update daily metrics (owner only)
app.put("/make-server-4a129884/metrics/daily/:date", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can update metrics' }, 403);
    }
    
    const date = c.req.param('date');
    const body = await c.req.json();
    
    const metrics = {
      date,
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set(`metrics:${date}`, metrics);
    return c.json({ metrics });
  } catch (error) {
    console.log(`Error updating daily metrics: ${error}`);
    return c.json({ error: 'Failed to update daily metrics' }, 500);
  }
});

// ============================================================================
// NOTIFICATIONS ROUTES
// ============================================================================

// Get notifications for current user
app.get("/make-server-4a129884/notifications", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const allNotifications = await kv.getByPrefix("notification:");
    
    // Filter notifications for current user
    const userNotifications = (allNotifications || []).filter(
      (n: any) => n.userId === userId || n.userId === 'all'
    ).sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return c.json({ notifications: userNotifications });
  } catch (error) {
    console.log(`Error fetching notifications: ${error}`);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

// Create notification (staff/owner)
app.post("/make-server-4a129884/notifications", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      return c.json({ error: 'Forbidden: Only owners and staff can create notifications' }, 403);
    }
    
    const body = await c.req.json();
    const id = generateId('notification');
    
    const notification = {
      id,
      userId: body.userId || 'all',
      type: body.type,
      title: body.title,
      message: body.message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`notification:${id}`, notification);
    return c.json({ notification }, 201);
  } catch (error) {
    console.log(`Error creating notification: ${error}`);
    return c.json({ error: 'Failed to create notification' }, 500);
  }
});

// Mark notification as read
app.put("/make-server-4a129884/notifications/:id/read", verifyAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const id = c.req.param('id');
    const notification = await kv.get(`notification:${id}`);
    
    if (!notification) {
      return c.json({ error: 'Notification not found' }, 404);
    }
    
    // Only allow user to mark their own notifications as read
    if (notification.userId !== userId && notification.userId !== 'all') {
      return c.json({ error: 'Forbidden: Cannot mark other users notifications' }, 403);
    }
    
    const updatedNotification = {
      ...notification,
      read: true,
      readAt: new Date().toISOString(),
    };
    
    await kv.set(`notification:${id}`, updatedNotification);
    return c.json({ notification: updatedNotification });
  } catch (error) {
    console.log(`Error marking notification as read: ${error}`);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});

// ============================================================================
// RESTAURANT SETTINGS ROUTES
// ============================================================================

// Get restaurant settings
app.get("/make-server-4a129884/settings", verifyAuth, async (c) => {
  try {
    const settings = await kv.get("settings:restaurant");
    
    if (!settings) {
      // Return default settings
      return c.json({
        settings: {
          restaurantName: 'RestaurantOS',
          openingTime: '09:00',
          closingTime: '22:00',
          taxRate: 0.08,
          serviceCharge: 0.10,
          currency: 'USD',
          timeZone: 'America/New_York',
        }
      });
    }
    
    return c.json({ settings });
  } catch (error) {
    console.log(`Error fetching settings: ${error}`);
    return c.json({ error: 'Failed to fetch settings' }, 500);
  }
});

// Update restaurant settings (owner only)
app.put("/make-server-4a129884/settings", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can update settings' }, 403);
    }
    
    const body = await c.req.json();
    const settings = {
      ...body,
      updatedAt: new Date().toISOString(),
    };
    
    await kv.set("settings:restaurant", settings);
    return c.json({ settings });
  } catch (error) {
    console.log(`Error updating settings: ${error}`);
    return c.json({ error: 'Failed to update settings' }, 500);
  }
});

// ============================================================================
// ANALYTICS ROUTES
// ============================================================================

// Get analytics summary (owner only)
app.get("/make-server-4a129884/analytics/summary", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can view analytics' }, 403);
    }
    
    // Get all orders
    const orders = await kv.getByPrefix("order:");
    const completedOrders = (orders || []).filter((o: any) => o.status === 'completed');
    
    // Calculate summary statistics
    const totalRevenue = completedOrders.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0);
    const totalOrders = completedOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    // Get menu items to find popular dishes
    const menuItems = await kv.getByPrefix("menuItem:");
    const dishCounts: Record<string, number> = {};
    
    completedOrders.forEach((order: any) => {
      (order.items || []).forEach((item: any) => {
        dishCounts[item.id] = (dishCounts[item.id] || 0) + item.quantity;
      });
    });
    
    const popularDishes = Object.entries(dishCounts)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([id, count]) => {
        const menuItem = (menuItems || []).find((m: any) => m.id === id);
        return {
          id,
          name: menuItem?.name || 'Unknown',
          orderCount: count,
        };
      });
    
    return c.json({
      analytics: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        popularDishes,
        generatedAt: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.log(`Error fetching analytics summary: ${error}`);
    return c.json({ error: 'Failed to fetch analytics summary' }, 500);
  }
});

// ============================================================================
// QR CODE ROUTES
// ============================================================================

// Generate QR code for a table (staff/owner)
app.post("/make-server-4a129884/qr-codes/generate", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner' && userRole !== 'staff') {
      console.log(`QR generation forbidden for role: ${userRole}`);
      return c.json({ error: 'Forbidden: Only owners and staff can generate QR codes' }, 403);
    }
    
    const body = await c.req.json();
    const { tableId } = body;
    
    console.log(`Generating QR code for table: ${tableId}`);
    
    if (!tableId) {
      console.log('No tableId provided');
      return c.json({ error: 'Table ID is required' }, 400);
    }
    
    // Try to get the table, but don't fail if it doesn't exist (might be in demo mode)
    const table = await kv.get(`table:${tableId}`);
    console.log(`Table lookup result for ${tableId}:`, table ? 'found' : 'not found');
    
    // Generate QR code regardless (in case of demo mode or missing table)
    const qrCode = {
      tableId,
      tableNumber: table?.number || null,
      code: generateId('qr'),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`qrCode:${qrCode.code}`, qrCode);
    console.log(`QR code created successfully: ${qrCode.code}`);
    return c.json({ qrCode }, 201);
  } catch (error) {
    console.log(`Error generating QR code: ${error}`);
    return c.json({ error: `Failed to generate QR code: ${error}` }, 500);
  }
});

// Validate QR code (public)
app.get("/make-server-4a129884/qr-codes/:code", async (c) => {
  try {
    const code = c.req.param('code');
    const qrCode = await kv.get(`qrCode:${code}`);
    
    if (!qrCode) {
      return c.json({ error: 'QR code not found' }, 404);
    }
    
    // Check if expired
    if (new Date(qrCode.expiresAt) < new Date()) {
      return c.json({ error: 'QR code expired' }, 410);
    }
    
    // Get table info
    const table = await kv.get(`table:${qrCode.tableId}`);
    
    return c.json({ qrCode, table });
  } catch (error) {
    console.log(`Error validating QR code: ${error}`);
    return c.json({ error: 'Failed to validate QR code' }, 500);
  }
});

// ============================================================================
// MODIFIERS ROUTES
// ============================================================================

// Get modifiers for a menu item
app.get("/make-server-4a129884/modifiers/:menuItemId", async (c) => {
  try {
    const menuItemId = c.req.param('menuItemId');
    const modifiers = await kv.getByPrefix(`modifier:${menuItemId}:`);
    return c.json({ modifiers: modifiers || [] });
  } catch (error) {
    console.log(`Error fetching modifiers: ${error}`);
    return c.json({ error: 'Failed to fetch modifiers' }, 500);
  }
});

// Create modifier for menu item (owner only)
app.post("/make-server-4a129884/modifiers", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can create modifiers' }, 403);
    }
    
    const body = await c.req.json();
    const { menuItemId, name, options, type } = body;
    
    const id = generateId('mod');
    const modifier = {
      id,
      menuItemId,
      name,
      type: type || 'single', // 'single' or 'multiple'
      options: options || [], // [{name, price}]
      required: body.required || false,
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(`modifier:${menuItemId}:${id}`, modifier);
    return c.json({ modifier }, 201);
  } catch (error) {
    console.log(`Error creating modifier: ${error}`);
    return c.json({ error: 'Failed to create modifier' }, 500);
  }
});

// Delete modifier (owner only)
app.delete("/make-server-4a129884/modifiers/:menuItemId/:id", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can delete modifiers' }, 403);
    }
    
    const menuItemId = c.req.param('menuItemId');
    const id = c.req.param('id');
    
    await kv.del(`modifier:${menuItemId}:${id}`);
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error deleting modifier: ${error}`);
    return c.json({ error: 'Failed to delete modifier' }, 500);
  }
});

// ============================================================================
// PAYMENT ROUTES (STRIPE)
// ============================================================================

// Create payment intent (requires Stripe secret key)
app.post("/make-server-4a129884/payments/create-intent", verifyAuth, async (c) => {
  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    
    if (!stripeKey) {
      return c.json({ error: 'Stripe not configured' }, 503);
    }
    
    const body = await c.req.json();
    const { amount, orderId } = body;
    
    // Create Stripe payment intent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: Math.round(amount * 100).toString(), // Convert to cents
        currency: 'usd',
        'metadata[orderId]': orderId,
      }),
    });
    
    const paymentIntent = await response.json();
    
    if (!response.ok) {
      console.log(`Stripe error: ${JSON.stringify(paymentIntent)}`);
      return c.json({ error: 'Failed to create payment intent' }, 500);
    }
    
    // Store payment record
    await kv.set(`payment:${paymentIntent.id}`, {
      id: paymentIntent.id,
      orderId,
      amount,
      status: paymentIntent.status,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ 
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.log(`Error creating payment intent: ${error}`);
    return c.json({ error: 'Failed to create payment intent' }, 500);
  }
});

// Confirm payment
app.post("/make-server-4a129884/payments/confirm", verifyAuth, async (c) => {
  try {
    const body = await c.req.json();
    const { paymentIntentId } = body;
    
    const payment = await kv.get(`payment:${paymentIntentId}`);
    
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404);
    }
    
    // Update order status to paid
    const order = await kv.get(`order:${payment.orderId}`);
    if (order) {
      await kv.set(`order:${payment.orderId}`, {
        ...order,
        status: 'completed',
        paymentStatus: 'paid',
        paidAt: new Date().toISOString(),
      });
    }
    
    // Update payment status
    await kv.set(`payment:${paymentIntentId}`, {
      ...payment,
      status: 'succeeded',
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error confirming payment: ${error}`);
    return c.json({ error: 'Failed to confirm payment' }, 500);
  }
});

// ============================================================================
// ONBOARDING ROUTES
// ============================================================================

// Get onboarding status
app.get("/make-server-4a129884/onboarding/status", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ onboardingComplete: true });
    }
    
    const status = await kv.get("onboarding:status");
    
    if (!status) {
      return c.json({
        onboardingComplete: false,
        steps: {
          restaurantInfo: false,
          menuSetup: false,
          tableSetup: false,
          staffInvited: false,
        }
      });
    }
    
    return c.json(status);
  } catch (error) {
    console.log(`Error fetching onboarding status: ${error}`);
    return c.json({ error: 'Failed to fetch onboarding status' }, 500);
  }
});

// Update onboarding status
app.put("/make-server-4a129884/onboarding/status", verifyAuth, async (c) => {
  try {
    const userRole = c.get('userRole');
    
    if (userRole !== 'owner') {
      return c.json({ error: 'Forbidden: Only owners can update onboarding' }, 403);
    }
    
    const body = await c.req.json();
    
    await kv.set("onboarding:status", {
      ...body,
      updatedAt: new Date().toISOString(),
    });
    
    return c.json({ success: true });
  } catch (error) {
    console.log(`Error updating onboarding status: ${error}`);
    return c.json({ error: 'Failed to update onboarding status' }, 500);
  }
});

// ============================================================================
// PRINTING ROUTES
// ============================================================================

// Generate receipt for order
app.get("/make-server-4a129884/print/receipt/:orderId", verifyAuth, async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Get menu item details
    const menuItems = await kv.getByPrefix("menuItem:");
    const items = order.items.map((item: any) => {
      const menuItem = menuItems.find((m: any) => m.id === item.id);
      return {
        ...item,
        name: menuItem?.name || 'Unknown',
        price: menuItem?.price || 0,
      };
    });
    
    const settings = await kv.get("settings:restaurant") || { 
      restaurantName: 'RestaurantOS',
      taxRate: 0.08,
    };
    
    const subtotal = items.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    const tax = subtotal * (settings.taxRate || 0.08);
    const total = subtotal + tax;
    
    const receipt = {
      restaurantName: settings.restaurantName,
      orderId: order.id,
      tableNumber: order.tableNumber || 'N/A',
      items,
      subtotal,
      tax,
      total,
      createdAt: order.createdAt,
    };
    
    return c.json({ receipt });
  } catch (error) {
    console.log(`Error generating receipt: ${error}`);
    return c.json({ error: 'Failed to generate receipt' }, 500);
  }
});

// Generate kitchen ticket for order
app.get("/make-server-4a129884/print/kitchen-ticket/:orderId", verifyAuth, async (c) => {
  try {
    const orderId = c.req.param('orderId');
    const order = await kv.get(`order:${orderId}`);
    
    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }
    
    // Get menu item details
    const menuItems = await kv.getByPrefix("menuItem:");
    const items = order.items.map((item: any) => {
      const menuItem = menuItems.find((m: any) => m.id === item.id);
      return {
        ...item,
        name: menuItem?.name || 'Unknown',
        prepTime: menuItem?.prepTime || 15,
        category: menuItem?.category || '',
      };
    });
    
    const ticket = {
      orderId: order.id,
      tableNumber: order.tableNumber || 'N/A',
      items,
      specialInstructions: order.specialInstructions || '',
      createdAt: order.createdAt,
      status: order.status,
    };
    
    return c.json({ ticket });
  } catch (error) {
    console.log(`Error generating kitchen ticket: ${error}`);
    return c.json({ error: 'Failed to generate kitchen ticket' }, 500);
  }
});

Deno.serve(app.fetch);