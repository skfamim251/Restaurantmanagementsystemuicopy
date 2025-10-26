import { menuItemsAPI, tablesAPI, settingsAPI } from './api';

// Sample menu items
const sampleMenuItems = [
  {
    name: 'Margherita Pizza',
    description: 'Classic tomato sauce, fresh mozzarella, and basil',
    price: 16.99,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop',
    available: true,
    prepTime: 20,
    ingredients: ['tomato sauce', 'mozzarella', 'basil', 'olive oil'],
    allergens: ['dairy', 'gluten'],
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce, parmesan, croutons, and Caesar dressing',
    price: 12.99,
    category: 'Appetizer',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    available: true,
    prepTime: 10,
    ingredients: ['romaine lettuce', 'parmesan', 'croutons', 'Caesar dressing'],
    allergens: ['dairy', 'gluten', 'eggs'],
  },
  {
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon with herbs and lemon butter',
    price: 24.99,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
    available: true,
    prepTime: 25,
    ingredients: ['salmon', 'herbs', 'lemon', 'butter'],
    allergens: ['fish', 'dairy'],
  },
  {
    name: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta with pancetta, eggs, and pecorino',
    price: 18.99,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&h=300&fit=crop',
    available: true,
    prepTime: 18,
    ingredients: ['spaghetti', 'pancetta', 'eggs', 'pecorino cheese'],
    allergens: ['gluten', 'dairy', 'eggs', 'pork'],
  },
  {
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla ice cream',
    price: 9.99,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=400&h=300&fit=crop',
    available: true,
    prepTime: 15,
    ingredients: ['chocolate', 'eggs', 'butter', 'flour', 'vanilla ice cream'],
    allergens: ['gluten', 'dairy', 'eggs'],
  },
  {
    name: 'Beef Burger',
    description: 'Juicy beef patty with lettuce, tomato, and special sauce',
    price: 15.99,
    category: 'Main Course',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop',
    available: true,
    prepTime: 22,
    ingredients: ['beef patty', 'lettuce', 'tomato', 'cheese', 'special sauce', 'bun'],
    allergens: ['gluten', 'dairy'],
  },
  {
    name: 'Tomato Soup',
    description: 'Creamy tomato soup with fresh herbs and croutons',
    price: 8.99,
    category: 'Appetizer',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    available: true,
    prepTime: 12,
    ingredients: ['tomatoes', 'cream', 'herbs', 'croutons'],
    allergens: ['dairy', 'gluten'],
  },
  {
    name: 'Tiramisu',
    description: 'Classic Italian dessert with coffee and mascarpone',
    price: 10.99,
    category: 'Dessert',
    imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop',
    available: true,
    prepTime: 10,
    ingredients: ['mascarpone', 'coffee', 'ladyfingers', 'cocoa'],
    allergens: ['dairy', 'eggs', 'gluten'],
  },
];

// Sample tables with percentage-based positions for floor plan
const sampleTables = [
  { number: 1, capacity: 2, status: 'available', position: { x: 15, y: 20 } },
  { number: 2, capacity: 2, status: 'available', position: { x: 35, y: 20 } },
  { number: 3, capacity: 4, status: 'available', position: { x: 55, y: 20 } },
  { number: 4, capacity: 4, status: 'available', position: { x: 75, y: 20 } },
  { number: 5, capacity: 6, status: 'available', position: { x: 15, y: 50 } },
  { number: 6, capacity: 2, status: 'available', position: { x: 35, y: 50 } },
  { number: 7, capacity: 4, status: 'available', position: { x: 55, y: 50 } },
  { number: 8, capacity: 8, status: 'available', position: { x: 75, y: 50 } },
  { number: 9, capacity: 2, status: 'available', position: { x: 25, y: 80 } },
  { number: 10, capacity: 6, status: 'available', position: { x: 65, y: 80 } },
];

// Restaurant settings
const defaultSettings = {
  restaurantName: 'RestaurantOS',
  openingTime: '09:00',
  closingTime: '22:00',
  taxRate: 0.08,
  serviceCharge: 0.10,
  currency: 'USD',
  timeZone: 'America/New_York',
};

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if data already exists
    const existingMenuItems = await menuItemsAPI.getAll();
    const existingTables = await tablesAPI.getAll();
    
    // Only initialize if no data exists
    if (existingMenuItems.menuItems.length === 0) {
      console.log('Creating sample menu items...');
      for (const item of sampleMenuItems) {
        try {
          await menuItemsAPI.create(item);
        } catch (error) {
          console.error('Error creating menu item:', error);
        }
      }
    }
    
    if (existingTables.tables.length === 0) {
      console.log('Creating sample tables...');
      for (const table of sampleTables) {
        try {
          await tablesAPI.create(table);
        } catch (error) {
          console.error('Error creating table:', error);
        }
      }
    }
    
    // Initialize settings
    try {
      const { settings } = await settingsAPI.get();
      if (!settings.restaurantName) {
        await settingsAPI.update(defaultSettings);
      }
    } catch (error) {
      // Settings might not exist yet, create them
      try {
        await settingsAPI.update(defaultSettings);
      } catch (err) {
        console.error('Error creating settings:', err);
      }
    }
    
    console.log('Database initialization complete!');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}
