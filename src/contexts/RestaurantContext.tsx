import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  menuItemsAPI,
  tablesAPI,
  ordersAPI,
  waitlistAPI,
  settingsAPI,
} from '../utils/api';
import {
  isDemoMode,
  demoMenuItems,
  demoTables,
  demoWaitlist,
  demoOrders,
  demoSettings,
  demoStats,
} from '../utils/demoData';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  imageUrl?: string;
  status: 'available' | 'preparing' | 'unavailable';
  available?: boolean;
  prepTime: number;
  popularity: number;
  ingredients?: string[];
  allergens?: string[];
}

export interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  capacity: number;
  seatedAt?: string | null;
  partyName?: string;
  partySize?: number;
  shape?: "round" | "square";
  position: { x: number; y: number };
  orders?: TableOrder[];
  currentOrderId?: string | null;
}

export interface WaitlistEntry {
  id: string;
  partyName?: string;
  customerName?: string;
  customerPhone?: string;
  partySize: number;
  createdAt: string;
  status?: 'waiting' | 'notified' | 'seated' | 'cancelled';
  estimatedWaitTime?: number;
  notified?: boolean;
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  prepTime: number;
  specialRequests?: string;
  notes?: string;
}

export interface TableOrder {
  id: string;
  tableId: string;
  items: CartItem[];
  status: 'active' | 'completed' | 'paid' | 'pending' | 'preparing' | 'ready';
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  subtotal: number;
  tax: number;
  total: number;
  totalAmount?: number;
  customerName?: string;
  partySize?: number;
  customerId?: string;
}

export interface Bill {
  id: string;
  tableId: string;
  orders: TableOrder[];
  totalAmount: number;
  isPaid: boolean;
  paymentMethod?: 'cash' | 'card' | 'digital';
  paidAt?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: { menuItemId: string; quantity: number; status: 'pending' | 'preparing' | 'ready' | 'served' }[];
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: string;
}

export interface RestaurantStats {
  occupancyRate: number;
  averageWaitTime: number;
  averageDiningDuration: number;
  totalSeats: number;
  occupiedSeats: number;
  availableTables: number;
  estimatedWaitTime: number;
}

export interface RestaurantSettings {
  restaurantName: string;
  openingTime: string;
  closingTime: string;
  taxRate: number;
  serviceCharge: number;
  currency: string;
  timeZone: string;
}

// ============================================================================
// CONTEXT INTERFACE
// ============================================================================

interface RestaurantContextType {
  // State
  menuItems: MenuItem[];
  tables: Table[];
  waitlist: WaitlistEntry[];
  cartItems: CartItem[];
  tableOrders: TableOrder[];
  bills: Bill[];
  orders: Order[];
  stats: RestaurantStats;
  settings: RestaurantSettings;
  
  // Loading states
  isLoading: boolean;
  isLoadingMenuItems: boolean;
  isLoadingTables: boolean;
  isLoadingOrders: boolean;
  
  // Refresh functions
  refreshMenuItems: () => Promise<void>;
  refreshTables: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  refreshWaitlist: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  // Menu items
  updateMenuItemStatus: (id: string, status: MenuItem['status']) => Promise<void>;
  updateMenuItemPrepTime: (id: string, prepTime: number) => Promise<void>;
  
  // Tables
  updateTableStatus: (id: string, status: Table['status']) => Promise<void>;
  updateTable: (id: string, updates: Partial<Table>) => Promise<void>;
  
  // Waitlist
  addToWaitlist: (entry: Omit<WaitlistEntry, 'id' | 'createdAt'>) => Promise<void>;
  removeFromWaitlist: (id: string) => Promise<void>;
  updateWaitlistEntry: (id: string, updates: Partial<WaitlistEntry>) => Promise<void>;
  
  // Cart
  addToCart: (menuItem: MenuItem, specialRequests?: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  updateCartItemRequests: (cartItemId: string, specialRequests: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartItemCount: number;
  
  // Table Orders
  createTableOrder: (tableId: string, customerName?: string, partySize?: number) => Promise<void>;
  addItemsToTableOrder: (tableId: string, items: CartItem[]) => void;
  updateTableOrderStatus: (orderId: string, status: TableOrder['status']) => Promise<void>;
  getActiveTableOrder: (tableId: string) => TableOrder | undefined;
  
  // Bills
  generateBill: (tableId: string) => Bill;
  payBill: (billId: string, paymentMethod: Bill['paymentMethod']) => void;
  getTableBill: (tableId: string) => Bill | undefined;
  
  // Orders (legacy)
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function RestaurantProvider({ children }: { children: ReactNode }) {
  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tableOrders, setTableOrders] = useState<TableOrder[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings>({
    restaurantName: 'RestaurantOS',
    openingTime: '09:00',
    closingTime: '22:00',
    taxRate: 0.08,
    serviceCharge: 0.10,
    currency: 'USD',
    timeZone: 'America/New_York',
  });

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMenuItems, setIsLoadingMenuItems] = useState(false);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Get user ID for cart storage
  const getUserCartKey = () => {
    if (typeof window !== 'undefined') {
      // Get user info from auth
      const authData = localStorage.getItem('supabase.auth.token');
      if (authData) {
        try {
          const parsed = JSON.parse(authData);
          const userId = parsed?.user?.id;
          if (userId) {
            return `restaurant-cart-${userId}`;
          }
        } catch (e) {
          // Fallback to demo user cart key
        }
      }
      // Demo mode or unauthenticated - use demo cart key
      const demoUser = localStorage.getItem('demo-user');
      if (demoUser) {
        try {
          const parsed = JSON.parse(demoUser);
          return `restaurant-cart-demo-${parsed.email}`;
        } catch (e) {
          // Fallback
        }
      }
    }
    return 'restaurant-cart'; // Fallback to generic key
  };

  // Cart state (persisted in localStorage per user)
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cartKey = getUserCartKey();
      const saved = localStorage.getItem(cartKey);
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Persist cart to localStorage per user
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cartKey = getUserCartKey();
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // ============================================================================
  // API INTEGRATION - FETCH DATA
  // ============================================================================

  const refreshMenuItems = useCallback(async () => {
    setIsLoadingMenuItems(true);
    try {
      if (isDemoMode()) {
        // Use demo data in demo mode
        setMenuItems(demoMenuItems);
      } else {
        const { menuItems: items } = await menuItemsAPI.getAll();
        // Transform API data to match our interface
        const transformedItems = items.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          description: item.description,
          category: item.category,
          image: item.imageUrl || item.image || '',
          imageUrl: item.imageUrl,
          status: item.available ? 'available' : 'unavailable',
          available: item.available,
          prepTime: item.prepTime || 15,
          popularity: 75, // Default value
          ingredients: item.ingredients || [],
          allergens: item.allergens || [],
        }));
        setMenuItems(transformedItems);
      }
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      // Fallback to demo data on error
      setMenuItems(demoMenuItems);
    } finally {
      setIsLoadingMenuItems(false);
    }
  }, []);

  const refreshTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      if (isDemoMode()) {
        // Use demo data in demo mode
        setTables(demoTables);
      } else {
        const { tables: fetchedTables } = await tablesAPI.getAll();
        // Transform API data to match our interface
        const transformedTables = fetchedTables.map((table: any) => ({
          id: table.id,
          number: table.number,
          status: table.status,
          capacity: table.capacity,
          position: table.position || { x: 0, y: 0 },
          shape: table.capacity <= 2 ? 'round' : 'square',
          currentOrderId: table.currentOrderId,
          seatedAt: table.seatedAt,
          partyName: table.partyName,
          partySize: table.partySize,
        }));
        setTables(transformedTables);
      }
    } catch (error) {
      console.error('Failed to fetch tables:', error);
      // Fallback to demo data on error
      setTables(demoTables);
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      if (isDemoMode()) {
        // Use demo data in demo mode
        setOrders(demoOrders);
      } else {
        const { orders: fetchedOrders } = await ordersAPI.getAll();
        // Transform to table orders format
        const transformedOrders = fetchedOrders.map((order: any) => ({
          id: order.id,
          tableId: order.tableId || '',
          items: order.items || [],
          status: order.status,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          completedAt: order.completedAt,
          subtotal: order.totalAmount || 0,
          tax: (order.totalAmount || 0) * settings.taxRate,
          total: (order.totalAmount || 0) * (1 + settings.taxRate),
          totalAmount: order.totalAmount,
          customerId: order.customerId,
        }));
        setTableOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback to demo data on error
      setOrders(demoOrders);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [settings.taxRate]);

  const refreshWaitlist = useCallback(async () => {
    try {
      if (isDemoMode()) {
        // Use demo data in demo mode
        setWaitlist(demoWaitlist);
      } else {
        const { waitlist: fetchedWaitlist } = await waitlistAPI.getAll();
        const transformedWaitlist = fetchedWaitlist.map((entry: any) => ({
          id: entry.id,
          partyName: entry.customerName || entry.partyName,
          customerName: entry.customerName,
          customerPhone: entry.customerPhone,
          partySize: entry.partySize,
          createdAt: entry.createdAt,
          status: entry.status,
          estimatedWaitTime: entry.estimatedWaitTime,
          notified: entry.notified,
        }));
        setWaitlist(transformedWaitlist);
      }
    } catch (error) {
      console.error('Failed to fetch waitlist:', error);
      // Fallback to demo data on error
      setWaitlist(demoWaitlist);
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      if (isDemoMode()) {
        // Use demo data in demo mode
        setSettings(demoSettings);
      } else {
        const { settings: fetchedSettings } = await settingsAPI.get();
        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Fallback to demo data on error
      setSettings(demoSettings);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([
      refreshMenuItems(),
      refreshTables(),
      refreshOrders(),
      refreshWaitlist(),
      refreshSettings(),
    ]);
    setIsLoading(false);
  }, [refreshMenuItems, refreshTables, refreshOrders, refreshWaitlist, refreshSettings]);

  // Initial data load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // ============================================================================
  // MENU ITEMS
  // ============================================================================

  const updateMenuItemStatus = async (id: string, status: MenuItem['status']) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setMenuItems(menuItems.map(item => 
          item.id === id ? { ...item, status, available: status === 'available' } : item
        ));
      } else {
        const available = status === 'available';
        await menuItemsAPI.update(id, { available });
        await refreshMenuItems();
      }
    } catch (error) {
      console.error('Failed to update menu item status:', error);
    }
  };

  const updateMenuItemPrepTime = async (id: string, prepTime: number) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setMenuItems(menuItems.map(item => 
          item.id === id ? { ...item, prepTime } : item
        ));
      } else {
        await menuItemsAPI.update(id, { prepTime });
        await refreshMenuItems();
      }
    } catch (error) {
      console.error('Failed to update menu item prep time:', error);
    }
  };

  // ============================================================================
  // TABLES
  // ============================================================================

  const updateTableStatus = async (id: string, status: Table['status']) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setTables(tables.map(table => 
          table.id === id ? { ...table, status } : table
        ));
      } else {
        await tablesAPI.update(id, { status });
        await refreshTables();
      }
    } catch (error) {
      console.error('Failed to update table status:', error);
    }
  };

  const updateTable = async (id: string, updates: Partial<Table>) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setTables(tables.map(table => 
          table.id === id ? { ...table, ...updates } : table
        ));
      } else {
        await tablesAPI.update(id, updates);
        await refreshTables();
      }
    } catch (error) {
      console.error('Failed to update table:', error);
    }
  };

  // ============================================================================
  // WAITLIST
  // ============================================================================

  const addToWaitlist = async (entry: Omit<WaitlistEntry, 'id' | 'createdAt'>) => {
    try {
      if (isDemoMode()) {
        // Add to local state only in demo mode
        const newEntry: WaitlistEntry = {
          ...entry,
          id: `wait-${Date.now()}`,
          createdAt: new Date().toISOString(),
          partyName: entry.partyName || entry.customerName || '',
          status: entry.status || 'waiting',
        };
        setWaitlist([...waitlist, newEntry]);
      } else {
        await waitlistAPI.add({
          customerName: entry.partyName || entry.customerName || '',
          customerPhone: entry.customerPhone || '',
          partySize: entry.partySize,
          estimatedWaitTime: entry.estimatedWaitTime || 15,
        });
        await refreshWaitlist();
      }
    } catch (error) {
      console.error('Failed to add to waitlist:', error);
    }
  };

  const removeFromWaitlist = async (id: string) => {
    try {
      if (isDemoMode()) {
        // Remove from local state only in demo mode
        setWaitlist(waitlist.filter(entry => entry.id !== id));
      } else {
        await waitlistAPI.remove(id);
        await refreshWaitlist();
      }
    } catch (error) {
      console.error('Failed to remove from waitlist:', error);
    }
  };

  const updateWaitlistEntry = async (id: string, updates: Partial<WaitlistEntry>) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setWaitlist(waitlist.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        ));
      } else {
        await waitlistAPI.update(id, updates);
        await refreshWaitlist();
      }
    } catch (error) {
      console.error('Failed to update waitlist entry:', error);
    }
  };

  // ============================================================================
  // CART
  // ============================================================================

  const addToCart = (menuItem: MenuItem, specialRequests?: string) => {
    const existingItem = cartItems.find(item => 
      item.menuItemId === menuItem.id && item.specialRequests === specialRequests
    );

    if (existingItem) {
      updateCartItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        id: `cart-${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        image: menuItem.image || menuItem.imageUrl || '',
        prepTime: menuItem.prepTime,
        specialRequests,
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(cartItems.filter(item => item.id !== cartItemId));
  };

  const updateCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(cartItems.map(item =>
      item.id === cartItemId ? { ...item, quantity } : item
    ));
  };

  const updateCartItemRequests = (cartItemId: string, specialRequests: string) => {
    setCartItems(cartItems.map(item =>
      item.id === cartItemId ? { ...item, specialRequests } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ============================================================================
  // TABLE ORDERS
  // ============================================================================

  const createTableOrder = async (tableId: string, customerName?: string, partySize?: number) => {
    try {
      const subtotal = cartTotal;
      const tax = subtotal * settings.taxRate;
      const total = subtotal + tax;

      if (isDemoMode()) {
        // Demo mode - update local state only
        const newOrder: any = {
          id: `order-${Date.now()}`,
          tableId,
          items: cartItems,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subtotal,
          tax,
          total,
          totalAmount: total,
          customerName,
        };
        setOrders([...orders, newOrder]);
        
        // Update table status
        setTables(tables.map(table => 
          table.id === tableId 
            ? { 
                ...table, 
                status: 'occupied' as const, 
                partyName: customerName, 
                partySize,
                seatedAt: new Date().toISOString() 
              }
            : table
        ));

        clearCart();
      } else {
        // Production mode - make API calls
        await ordersAPI.create({
          tableId,
          items: cartItems,
          totalAmount: total,
          status: 'pending',
        });

        // Update table status
        await tablesAPI.update(tableId, {
          status: 'occupied',
          partyName: customerName,
          partySize,
          seatedAt: new Date().toISOString(),
        });

        clearCart();
        await refreshOrders();
        await refreshTables();
      }
    } catch (error) {
      console.error('Failed to create table order:', error);
      throw error;
    }
  };

  const addItemsToTableOrder = (tableId: string, items: CartItem[]) => {
    const existingOrder = tableOrders.find(
      order => order.tableId === tableId && order.status === 'active'
    );

    if (existingOrder) {
      const updatedItems = [...existingOrder.items];
      items.forEach(newItem => {
        const existing = updatedItems.find(
          item => item.menuItemId === newItem.menuItemId && item.specialRequests === newItem.specialRequests
        );
        if (existing) {
          existing.quantity += newItem.quantity;
        } else {
          updatedItems.push(newItem);
        }
      });

      const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * settings.taxRate;
      const total = subtotal + tax;

      setTableOrders(tableOrders.map(order =>
        order.id === existingOrder.id
          ? { ...order, items: updatedItems, subtotal, tax, total, updatedAt: new Date().toISOString() }
          : order
      ));
    }
  };

  const updateTableOrderStatus = async (orderId: string, status: TableOrder['status']) => {
    try {
      if (isDemoMode()) {
        // Update local state only in demo mode
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        ));
        setTableOrders(tableOrders.map(order => 
          order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
        ));
      } else {
        await ordersAPI.update(orderId, { status });
        await refreshOrders();
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const getActiveTableOrder = (tableId: string): TableOrder | undefined => {
    return tableOrders.find(
      order => order.tableId === tableId && order.status === 'active'
    );
  };

  // ============================================================================
  // BILLS
  // ============================================================================

  const generateBill = (tableId: string): Bill => {
    const tableOrdersList = tableOrders.filter(
      order => order.tableId === tableId && order.status === 'active'
    );

    const totalAmount = tableOrdersList.reduce((sum, order) => sum + order.total, 0);

    const bill: Bill = {
      id: `bill-${Date.now()}`,
      tableId,
      orders: tableOrdersList,
      totalAmount,
      isPaid: false,
      createdAt: new Date().toISOString(),
    };

    setBills([...bills, bill]);
    return bill;
  };

  const payBill = (billId: string, paymentMethod: Bill['paymentMethod']) => {
    setBills(bills.map(bill =>
      bill.id === billId
        ? { ...bill, isPaid: true, paymentMethod, paidAt: new Date().toISOString() }
        : bill
    ));

    const bill = bills.find(b => b.id === billId);
    if (bill) {
      // Mark all orders as paid
      setTableOrders(tableOrders.map(order =>
        bill.orders.some(o => o.id === order.id)
          ? { ...order, status: 'paid' as const }
          : order
      ));

      // Update table status to available
      updateTableStatus(bill.tableId, 'available');
    }
  };

  const getTableBill = (tableId: string): Bill | undefined => {
    return bills.find(bill => bill.tableId === tableId && !bill.isPaid);
  };

  // ============================================================================
  // ORDERS (LEGACY)
  // ============================================================================

  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
  };

  // ============================================================================
  // STATS
  // ============================================================================

  const stats: RestaurantStats = {
    totalSeats: tables.reduce((sum, table) => sum + table.capacity, 0),
    occupiedSeats: tables
      .filter(table => table.status === 'occupied')
      .reduce((sum, table) => sum + (table.partySize || table.capacity), 0),
    availableTables: tables.filter(table => table.status === 'available').length,
    occupancyRate: tables.length > 0
      ? (tables.filter(table => table.status === 'occupied').length / tables.length) * 100
      : 0,
    averageWaitTime: waitlist.reduce((sum, entry) => sum + (entry.estimatedWaitTime || 15), 0) / (waitlist.length || 1),
    averageDiningDuration: 60,
    estimatedWaitTime: Math.ceil((waitlist.length * 15) / Math.max(tables.filter(t => t.status === 'available').length, 1)),
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: RestaurantContextType = {
    // State
    menuItems,
    tables,
    waitlist,
    cartItems,
    tableOrders,
    bills,
    orders,
    stats,
    settings,

    // Loading states
    isLoading,
    isLoadingMenuItems,
    isLoadingTables,
    isLoadingOrders,

    // Refresh functions
    refreshMenuItems,
    refreshTables,
    refreshOrders,
    refreshWaitlist,
    refreshAll,

    // Menu items
    updateMenuItemStatus,
    updateMenuItemPrepTime,

    // Tables
    updateTableStatus,
    updateTable,

    // Waitlist
    addToWaitlist,
    removeFromWaitlist,
    updateWaitlistEntry,

    // Cart
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemRequests,
    clearCart,
    cartTotal,
    cartItemCount,

    // Table Orders
    createTableOrder,
    addItemsToTableOrder,
    updateTableOrderStatus,
    getActiveTableOrder,

    // Bills
    generateBill,
    payBill,
    getTableBill,

    // Orders (legacy)
    addOrder,
  };

  return (
    <RestaurantContext.Provider value={value}>
      {children}
    </RestaurantContext.Provider>
  );
}
