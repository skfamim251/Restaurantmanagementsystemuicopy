// Demo data for offline/demo mode usage

export const demoMenuItems = [
  {
    id: 'demo-1',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with parmesan and croutons',
    price: 12.99,
    category: 'Salads',
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 10,
    popularity: 75,
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'caesar dressing'],
    allergens: ['dairy', 'gluten'],
  },
  {
    id: 'demo-2',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon butter sauce',
    price: 24.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 20,
    popularity: 90,
    ingredients: ['salmon', 'lemon', 'butter', 'herbs'],
    allergens: ['fish', 'dairy'],
  },
  {
    id: 'demo-3',
    name: 'Margherita Pizza',
    description: 'Classic tomato, mozzarella, and basil',
    price: 16.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 15,
    popularity: 70,
    ingredients: ['pizza dough', 'tomato sauce', 'mozzarella', 'basil'],
    allergens: ['gluten', 'dairy'],
  },
  {
    id: 'demo-4',
    name: 'Beef Tenderloin',
    description: 'Premium beef with truffle butter',
    price: 32.99,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 25,
    popularity: 85,
    ingredients: ['beef tenderloin', 'truffle butter', 'seasonal vegetables'],
    allergens: ['dairy'],
  },
  {
    id: 'demo-5',
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with vanilla ice cream',
    price: 9.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 12,
    popularity: 88,
    ingredients: ['chocolate', 'flour', 'eggs', 'vanilla ice cream'],
    allergens: ['gluten', 'eggs', 'dairy'],
  },
  {
    id: 'demo-6',
    name: 'Bruschetta',
    description: 'Toasted bread with tomatoes and basil',
    price: 8.99,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 8,
    popularity: 65,
    ingredients: ['bread', 'tomatoes', 'basil', 'olive oil', 'garlic'],
    allergens: ['gluten'],
  },
  {
    id: 'demo-7',
    name: 'Tiramisu',
    description: 'Classic Italian coffee dessert',
    price: 10.99,
    category: 'Desserts',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400',
    status: 'unavailable' as const,
    available: false,
    prepTime: 5,
    popularity: 80,
    ingredients: ['ladyfingers', 'mascarpone', 'coffee', 'cocoa'],
    allergens: ['eggs', 'dairy', 'gluten'],
  },
  {
    id: 'demo-8',
    name: 'Lobster Bisque',
    description: 'Creamy lobster soup',
    price: 14.99,
    category: 'Soups',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
    status: 'available' as const,
    available: true,
    prepTime: 10,
    popularity: 72,
    ingredients: ['lobster', 'cream', 'butter', 'sherry', 'herbs'],
    allergens: ['shellfish', 'dairy'],
  },
];

export const demoTables = [
  { id: '1', number: 1, capacity: 2, status: 'available' as const, position: { x: 15, y: 20 }, shape: 'round' as const },
  { id: '2', number: 2, capacity: 4, status: 'occupied' as const, position: { x: 35, y: 20 }, partySize: 3, partyName: 'Smith', shape: 'square' as const },
  { id: '3', number: 3, capacity: 6, status: 'reserved' as const, position: { x: 55, y: 20 }, partySize: 5, partyName: 'Johnson', shape: 'square' as const },
  { id: '4', number: 4, capacity: 2, status: 'available' as const, position: { x: 75, y: 20 }, shape: 'round' as const },
  { id: '5', number: 5, capacity: 4, status: 'cleaning' as const, position: { x: 15, y: 50 }, shape: 'square' as const },
  { id: '6', number: 6, capacity: 8, status: 'occupied' as const, position: { x: 35, y: 50 }, partySize: 6, partyName: 'Williams', shape: 'square' as const },
  { id: '7', number: 7, capacity: 2, status: 'available' as const, position: { x: 55, y: 50 }, shape: 'round' as const },
  { id: '8', number: 8, capacity: 4, status: 'available' as const, position: { x: 75, y: 50 }, shape: 'square' as const },
  { id: '9', number: 9, capacity: 2, status: 'available' as const, position: { x: 25, y: 80 }, shape: 'round' as const },
  { id: '10', number: 10, capacity: 6, status: 'available' as const, position: { x: 65, y: 80 }, shape: 'square' as const },
];

export const demoWaitlist = [
  {
    id: 'wait-1',
    partyName: 'Anderson',
    partySize: 4,
    phoneNumber: '555-0101',
    estimatedWaitTime: 15,
    status: 'waiting' as const,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: 'wait-2',
    partyName: 'Brown',
    partySize: 2,
    phoneNumber: '555-0102',
    estimatedWaitTime: 25,
    status: 'waiting' as const,
    createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
];

export const demoReservations = [
  {
    id: 'res-1',
    tableId: '3',
    partyName: 'Johnson',
    partySize: 5,
    phoneNumber: '555-0201',
    reservationTime: new Date(Date.now() + 2 * 60 * 60000).toISOString(),
    status: 'confirmed' as const,
    createdAt: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
  },
];

export const demoOrders = [
  {
    id: 'order-1',
    tableId: '2',
    items: [
      { menuItemId: 'demo-2', name: 'Grilled Salmon', quantity: 2, price: 24.99, specialRequests: '' },
      { menuItemId: 'demo-1', name: 'Caesar Salad', quantity: 1, price: 12.99, specialRequests: 'No croutons' },
    ],
    status: 'preparing' as const,
    total: 62.97,
    createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: 'order-2',
    tableId: '6',
    items: [
      { menuItemId: 'demo-4', name: 'Beef Tenderloin', quantity: 2, price: 32.99, specialRequests: 'Medium rare' },
      { menuItemId: 'demo-3', name: 'Margherita Pizza', quantity: 1, price: 16.99, specialRequests: '' },
    ],
    status: 'pending' as const,
    total: 82.97,
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export const demoSettings = {
  id: 'settings-1',
  restaurantName: 'RestaurantOS Demo',
  currency: 'USD',
  taxRate: 0.08,
  serviceChargeRate: 0.15,
  timezone: 'America/New_York',
  openingHours: {
    monday: { open: '11:00', close: '22:00' },
    tuesday: { open: '11:00', close: '22:00' },
    wednesday: { open: '11:00', close: '22:00' },
    thursday: { open: '11:00', close: '22:00' },
    friday: { open: '11:00', close: '23:00' },
    saturday: { open: '10:00', close: '23:00' },
    sunday: { open: '10:00', close: '21:00' },
  },
  averageWaitTimePerParty: 15,
  updatedAt: new Date().toISOString(),
};

export const demoStats = {
  totalTables: 8,
  availableTables: 3,
  occupiedTables: 2,
  reservedTables: 1,
  cleaningTables: 1,
  totalRevenue: 1245.89,
  todayOrders: 24,
  averageOrderValue: 51.91,
  popularDishes: [
    { name: 'Grilled Salmon', count: 8 },
    { name: 'Beef Tenderloin', count: 6 },
    { name: 'Chocolate Lava Cake', count: 5 },
  ],
};

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
