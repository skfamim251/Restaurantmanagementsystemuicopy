import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Users, 
  UtensilsCrossed, 
  Clock, 
  DollarSign, 
  Target,
  ChefHat,
  MapPin,
  Star,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';

export function RestaurantOverview() {
  const { user, hasPermission } = useAuth();
  const { stats, tables, orders } = useRestaurant();

  // Mock data for demonstration
  const basicStats = {
    totalTables: 20,
    occupiedTables: 14,
    totalOrders: 45,
    activeOrders: 12,
    averageWaitTime: 25,
    customerSatisfaction: 4.8
  };

  const revenueStats = {
    todayRevenue: 4250,
    weeklyRevenue: 28750,
    monthlyRevenue: 125000,
    averageOrderValue: 85,
    topDishes: [
      { name: 'Grilled Salmon', orders: 15 },
      { name: 'Caesar Salad', orders: 12 },
      { name: 'Beef Tenderloin', orders: 10 }
    ]
  };

  const occupancyRate = Math.round((basicStats.occupiedTables / basicStats.totalTables) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening at your restaurant today
        </p>
        <Badge variant="outline" className="capitalize">
          {user?.role} Dashboard
        </Badge>
      </motion.div>

      {/* Basic Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tables Occupied</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {basicStats.occupiedTables}/{basicStats.totalTables}
              </div>
              <div className="space-y-2 mt-2">
                <Progress value={occupancyRate} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {occupancyRate}% occupancy rate
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.activeOrders}</div>
              <p className="text-xs text-muted-foreground">
                {basicStats.totalOrders} total today
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.averageWaitTime}m</div>
              <p className="text-xs text-muted-foreground">
                Within target range
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Satisfaction</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{basicStats.customerSatisfaction}</div>
              <p className="text-xs text-muted-foreground">
                out of 5.0 stars
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Section - Only for Owner */}
      {hasPermission('view_revenue') && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.todayRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.weeklyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.monthlyRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                85% of monthly goal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${revenueStats.averageOrderValue}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Popular Dishes Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Popular Dishes Today
            </CardTitle>
            <CardDescription>
              Most ordered items from the menu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueStats.topDishes.map((dish, index) => (
                <div key={dish.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    </div>
                    <span className="font-medium">{dish.name}</span>
                  </div>
                  <Badge variant="secondary">
                    {dish.orders} orders
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Based on your role: {user?.role}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user?.role === 'customer' ? (
                <>
                  <div className="p-3 rounded-lg bg-primary/10 flex items-center gap-3">
                    <UtensilsCrossed className="h-4 w-4 text-primary" />
                    <span className="text-sm">Browse menu and add items to cart</span>
                  </div>
                  <div className="p-3 rounded-lg bg-accent/50 flex items-center gap-3">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm">View preparation times and wait times</span>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-950 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Note:</strong> Our staff will handle table assignments and order processing for you.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {hasPermission('view_menu') && (
                    <div className="p-3 rounded-lg bg-accent/50 flex items-center gap-3">
                      <UtensilsCrossed className="h-4 w-4 text-primary" />
                      <span className="text-sm">Browse and order from menu</span>
                    </div>
                  )}
                  
                  {hasPermission('manage_kitchen') && (
                    <div className="p-3 rounded-lg bg-accent/50 flex items-center gap-3">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <span className="text-sm">Manage kitchen operations</span>
                    </div>
                  )}
                  
                  {hasPermission('manage_tables') && (
                    <div className="p-3 rounded-lg bg-accent/50 flex items-center gap-3">
                      <Users className="h-4 w-4 text-primary" />
                      <span className="text-sm">Manage tables and seating</span>
                    </div>
                  )}
                  
                  {hasPermission('view_analytics') && (
                    <div className="p-3 rounded-lg bg-accent/50 flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm">View detailed analytics</span>
                    </div>
                  )}
                  
                  {!hasPermission('view_revenue') && (
                    <div className="p-3 rounded-lg bg-muted/50 flex items-center gap-3">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Revenue data (restricted)</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}