# RestaurantOS

A modern, comprehensive restaurant management system with real-time backend integration, role-based access control, and beautiful UI.

## 🚀 Quick Start

### Demo Login (Works Offline!)

RestaurantOS includes a **Demo Mode** that works completely offline without any backend setup. Click on one of the quick login buttons to access the system with different roles:

- **Customer** (`customer@restaurant.com` / `password`)
  - Browse menu with pictures, descriptions, and prices
  - Add items to cart with special requests
  - View preparation times and availability
  
- **Staff** (`staff@restaurant.com` / `password`)
  - All customer features plus:
  - Kitchen Dashboard - Update dish status and prep times
  - Host Dashboard - Manage table seating and waitlist
  - Process orders and payments
  
- **Owner** (`owner@restaurant.com` / `password`)
  - All staff features plus:
  - Analytics Dashboard - Revenue, occupancy, popular dishes
  - Settings management
  - Full system access

**✨ Demo Mode Features:**
- 🚀 **100% Offline** - No backend setup required
- ⚡ **Instant Loading** - No network requests
- 🔄 **Full CRUD Operations** - Create, read, update, delete
- 💾 **Session Persistence** - Changes persist during your session
- 🎭 **Realistic Experience** - All features work exactly as in production

**Note:** For production use with real Supabase backend, create actual user accounts through the signup flow.

### Sign Up

You can also create new accounts through the Sign Up tab. The system supports:
- **Demo Mode**: Instant access without backend (demo accounts)
- **Production Mode**: Real Supabase authentication with backend
- Automatic fallback to demo data if API calls fail
- Role-based permissions for all modes

## 🎯 Features

### Customer Menu
- Digital menu with high-quality images
- Real-time availability status
- Preparation time estimates
- Shopping cart with special requests
- Table allocation (for staff)

### Kitchen Dashboard
- Quick status updates (Available/Out of Stock/Limited)
- Adjustable preparation times
- Big, touch-friendly buttons
- Real-time menu management

### Host Dashboard
- **Seating Management**
  - Visual table layout
  - Table status tracking (Available/Occupied/Reserved/Cleaning)
  - Quick status changes
  
- **Waitlist Management**
  - Add customers to waitlist
  - Estimated wait times
  - Queue management

- **Table Order Manager**
  - View active orders per table
  - Generate bills
  - Process payments (Cash/Card/Digital)
  - Complete table workflows

### Owner Dashboard
- **Analytics**
  - Total revenue tracking
  - Seat occupancy metrics
  - Popular dishes analysis
  - Average preparation times
  
- **Charts & Visualizations**
  - Occupancy trends over time
  - Revenue breakdown by category
  - Dish popularity rankings

## 🏗️ Architecture

### Frontend
- **React** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for animations
- **Recharts** for analytics
- **ShadcN UI** components

### Backend
- **Supabase Edge Functions** (Hono web server)
- **Key-Value Store** for data persistence
- **Role-Based Access Control**
- **RESTful API**

### State Management
- **RestaurantContext** - Global restaurant state
- **AuthContext** - Authentication & permissions
- **NotificationContext** - Toast notifications

## 🎨 Design System

- **Color Palette**: Warm terracotta, beige, and soft green tones
- **Dark Mode**: Full dark mode support
- **Typography**: Clean, modern fonts with proper hierarchy
- **Animations**: Smooth transitions and delightful interactions
- **Responsive**: Works on desktop and tablet

## 📊 Database Schema

The system uses 10 collections:

1. **users** - User accounts with roles
2. **tables** - Restaurant table information
3. **menuItems** - Dishes with pricing and details
4. **orders** - Customer orders
5. **orderItems** - Individual order line items
6. **reservations** - Table reservations
7. **waitlist** - Walk-in customer queue
8. **dailyMetrics** - Analytics data
9. **notifications** - System notifications
10. **restaurantSettings** - Configuration

## 🔐 Permissions

### Customer
- ✅ View menu
- ✅ Add to cart
- ✅ View basic info
- ❌ Manage kitchen
- ❌ Manage tables
- ❌ View analytics

### Staff
- ✅ All customer permissions
- ✅ Manage kitchen
- ✅ Manage tables
- ✅ Host dashboard
- ✅ Process payments
- ❌ View revenue data

### Owner
- ✅ All staff permissions
- ✅ View analytics
- ✅ View revenue
- ✅ Manage users
- ✅ System settings

## 🛠️ Development

### Sample Data

When an owner first logs in, the system automatically initializes with:
- 8 sample menu items
- 8 tables with varying capacities
- Default restaurant settings

### API Documentation

See [BACKEND_GUIDE.md](./BACKEND_GUIDE.md) for comprehensive API documentation.

### Key Files

- `/App.tsx` - Main application entry point
- `/contexts/RestaurantContext.tsx` - Restaurant state management
- `/contexts/AuthContext.tsx` - Authentication & authorization
- `/supabase/functions/server/index.tsx` - Backend server
- `/utils/api.ts` - API client

## 📝 Notes

- The system uses both real Supabase authentication and demo accounts
- Demo accounts work offline without backend setup
- All data is stored in Supabase KV store
- Real-time updates across all dashboards
- Comprehensive error handling and logging

## 🎓 Learn More

- Check out the [Backend Integration Guide](./BACKEND_GUIDE.md)
- Review the [MVP Completion Document](./MVP_COMPLETION.md)
- See [Guidelines](./guidelines/Guidelines.md) for development standards

## 🙏 Credits

Built with modern web technologies and best practices. See [Attributions.md](./Attributions.md) for image credits.

---

**RestaurantOS** - Modern restaurant management made simple ✨
