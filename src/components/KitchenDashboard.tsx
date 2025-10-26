import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Plus, Minus, Users, Utensils, Search, Leaf, Fish, Coffee, IceCream } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { useRestaurant } from "../contexts/RestaurantContext";

const categories = [
  { id: "all", name: "All", icon: Utensils },
  { id: "Starters", name: "Starters", icon: Leaf },
  { id: "Mains", name: "Mains", icon: Utensils },
  { id: "Seafood", name: "Seafood", icon: Fish },
  { id: "Drinks", name: "Drinks", icon: Coffee },
  { id: "Desserts", name: "Desserts", icon: IceCream },
];

export function KitchenDashboard() {
  const { menuItems, stats, orders, tables, isLoadingMenuItems, updateMenuItemStatus, updateMenuItemPrepTime } = useRestaurant();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const updatePrepTime = (id: string, change: number) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      updateMenuItemPrepTime(id, Math.max(1, item.prepTime + change));
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-[var(--status-available)] text-white",
          icon: CheckCircle2,
          text: "Available"
        };
      case "unavailable":
        return {
          color: "bg-[var(--status-unavailable)] text-white",
          icon: XCircle,
          text: "Out of Stock"
        };
      case "preparing":
        return {
          color: "bg-[var(--status-preparing)] text-white",
          icon: Clock,
          text: "Limited"
        };
      default:
        return {
          color: "bg-muted text-muted-foreground",
          icon: CheckCircle2,
          text: "Unknown"
        };
    }
  };

  const statusButtons = [
    { status: "available" as const, label: "Available", color: "bg-[var(--status-available)]" },
    { status: "unavailable" as const, label: "Out of Stock", color: "bg-[var(--status-unavailable)]" },
    { status: "preparing" as const, label: "Limited", color: "bg-[var(--status-preparing)]" },
  ];

  const getActiveOrders = (itemId: string) => {
    return orders.reduce((count, order) => {
      const orderItems = order.items.filter(item => 
        item.menuItemId === itemId && 
        (item.status === 'pending' || item.status === 'preparing')
      );
      return count + orderItems.reduce((sum, item) => sum + item.quantity, 0);
    }, 0);
  };

  // Filter menu items based on category and search query
  const filteredMenuItems = menuItems.filter(item => {
    // Filter by category first
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    if (!matchesCategory) return false;
    
    // Then filter by search query
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="mb-2 text-foreground">Kitchen Dashboard</h1>
          <p className="text-muted-foreground mb-8">Manage dish availability, preparation times, and table load</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-primary" />
            <Input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-primary/20 bg-white dark:bg-card hover:border-primary/40 focus:border-primary shadow-sm hover:shadow-md transition-all duration-200"
            />
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-3 mb-6"
        >
          {categories.map((category, index) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all duration-200 shadow-sm text-sm ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'bg-card border-border hover:bg-accent text-foreground'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{category.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          {/* Restaurant Status */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Table Load</span>
              </div>
              <div className="font-bold text-primary mb-1">
                {stats.occupancyRate}%
              </div>
              <div className="text-xs text-muted-foreground">
                {stats.occupiedSeats}/{stats.totalSeats} seats
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Active Tables</span>
              </div>
              <div className="font-bold text-primary mb-1">
                {tables.filter(t => t.status === 'occupied').length}
              </div>
              <div className="text-xs text-muted-foreground">
                of {tables.length} tables
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
              <div className="flex items-center space-x-2 mb-2">
                <Utensils className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Pending Orders</span>
              </div>
              <div className="font-bold text-primary mb-1">
                {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length}
              </div>
              <div className="text-xs text-muted-foreground">
                orders active
              </div>
            </Card>
          </motion.div>

          {/* Menu Status */}
          {[
            { 
              label: "Available", 
              value: menuItems.filter(d => d.status === "available").length,
              color: "text-[var(--status-available)]"
            },
            { 
              label: "Limited", 
              value: menuItems.filter(d => d.status === "preparing").length,
              color: "text-[var(--status-preparing)]"
            },
            { 
              label: "Out of Stock", 
              value: menuItems.filter(d => d.status === "unavailable").length,
              color: "text-[var(--status-unavailable)]"
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * (index + 3) }}
            >
              <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
                <div className="font-bold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Active Orders by Table */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
            <h3 className="text-foreground mb-4">Active Orders by Table</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {orders
                .filter(order => order.status === 'pending' || order.status === 'preparing')
                .map((order, index) => {
                  const table = tables.find(t => t.id === order.tableId);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className="p-4 bg-muted/30 rounded-xl border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-medium text-foreground">Table {table?.number}</span>
                          {table?.partyName && (
                            <p className="text-sm text-muted-foreground">{table.partyName}</p>
                          )}
                        </div>
                        <Badge className={order.status === 'preparing' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      {/* Order Items List */}
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 3).map((item, idx) => {
                          const menuItem = menuItems.find(m => m.id === item.menuItemId);
                          return (
                            <div key={idx} className="text-sm text-muted-foreground flex items-center justify-between">
                              <span className="truncate">{menuItem?.name || 'Unknown Item'}</span>
                              <span className="ml-2 text-xs">×{item.quantity}</span>
                            </div>
                          );
                        })}
                        {order.items.length > 3 && (
                          <div className="text-xs text-muted-foreground italic">
                            +{order.items.length - 3} more items
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                        <span>{order.items.length} total items</span>
                        <span>{Math.floor((Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60))}m ago</span>
                      </div>
                    </motion.div>
                  );
                })}
              {orders.filter(order => order.status === 'pending' || order.status === 'preparing').length === 0 && (
                <div className="text-center text-muted-foreground py-8 col-span-3">
                  <Utensils className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No active orders</p>
                  <p className="text-sm">New orders will appear here</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Dish Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMenuItems.map((dish, index) => {
            const statusConfig = getStatusConfig(dish.status);
            const StatusIcon = statusConfig.icon;
            const activeOrders = getActiveOrders(dish.id);

            return (
              <motion.div
                key={dish.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-foreground mb-2">{dish.name}</h3>
                      <div className="flex items-center space-x-3">
                        <Badge className={`${statusConfig.color} rounded-full px-3 py-1`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.text}
                        </Badge>
                        <div className="text-muted-foreground text-sm">
                          {activeOrders} active orders
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Popularity: {dish.popularity}%
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground mb-1">Prep Time</div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePrepTime(dish.id, -1)}
                          className="h-6 w-6 p-0 rounded-full"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-medium min-w-[3rem] text-center">
                          {dish.prepTime}m
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePrepTime(dish.id, 1)}
                          className="h-6 w-6 p-0 rounded-full"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    {statusButtons.map((button) => (
                      <motion.div
                        key={button.status}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => updateMenuItemStatus(dish.id, button.status)}
                          variant={dish.status === button.status ? "default" : "outline"}
                          className={`w-full py-3 rounded-xl font-medium transition-all duration-200 text-sm ${
                            dish.status === button.status 
                              ? button.color + " text-white hover:opacity-90" 
                              : "hover:bg-accent"
                          }`}
                        >
                          {button.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}