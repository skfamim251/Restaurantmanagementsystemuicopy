import { motion } from "motion/react";
import { TrendingUp, TrendingDown, Users, Clock, DollarSign, Star, Utensils, TableProperties } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { useRestaurant } from "../contexts/RestaurantContext";
import { InviteUserModal } from "./InviteUserModal";

const occupancyData = [
  { time: "9 AM", occupancy: 20 },
  { time: "11 AM", occupancy: 45 },
  { time: "1 PM", occupancy: 85 },
  { time: "3 PM", occupancy: 60 },
  { time: "6 PM", occupancy: 95 },
  { time: "8 PM", occupancy: 90 },
  { time: "10 PM", occupancy: 40 },
];

const revenueData = [
  { name: "Food", value: 12500, color: "#d2691e" },
  { name: "Beverages", value: 3200, color: "#8fbc8f" },
  { name: "Desserts", value: 1800, color: "#deb887" },
];

export function OwnerDashboard() {
  const { menuItems, stats, tables, orders, waitlist, isLoading } = useRestaurant();

  // Calculate dynamic dish popularity based on menu items
  const dishPopularityData = menuItems
    .sort((a, b) => b.popularity - a.popularity)
    .map(item => ({
      name: item.name,
      orders: Math.floor(item.popularity / 5), // Simulate orders based on popularity
      revenue: Math.floor(item.popularity / 5) * item.price,
      popularity: item.popularity
    }));

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.value, 0);
  const avgPrepTime = menuItems.reduce((sum, item) => sum + item.prepTime, 0) / menuItems.length;
  const customerSatisfaction = 4.7;
  const dailyCustomers = tables.reduce((sum, table) => sum + (table.partySize || 0), 0) + 40; // Add some baseline

  const dashboardStats = [
    {
      title: "Current Occupancy",
      value: `${stats.occupancyRate}%`,
      change: stats.occupancyRate > 75 ? "+High" : stats.occupancyRate > 50 ? "Normal" : "Low",
      isPositive: stats.occupancyRate > 50,
      icon: Users,
      color: "text-[var(--status-occupied)]"
    },
    {
      title: "Wait Time",
      value: `${stats.estimatedWaitTime}m`,
      change: stats.estimatedWaitTime === 0 ? "None" : stats.estimatedWaitTime > 30 ? "High" : "Normal",
      isPositive: stats.estimatedWaitTime <= 15,
      icon: Clock,
      color: "text-[var(--status-preparing)]"
    },
    {
      title: "Available Tables",
      value: stats.availableTables.toString(),
      change: `${stats.totalSeats - stats.occupiedSeats} seats`,
      isPositive: stats.availableTables > 0,
      icon: TableProperties,
      color: "text-[var(--status-available)]"
    },
    {
      title: "Active Orders",
      value: orders.filter(o => o.status === 'pending' || o.status === 'preparing').length.toString(),
      change: `${orders.length} total`,
      isPositive: true,
      icon: Utensils,
      color: "text-[var(--status-reserved)]"
    },
    {
      title: "Today's Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-[var(--status-available)]"
    },
    {
      title: "Customers Served",
      value: dailyCustomers.toString(),
      change: "+8.2%",
      isPositive: true,
      icon: Users,
      color: "text-[var(--status-occupied)]"
    },
    {
      title: "Avg Prep Time",
      value: `${Math.round(avgPrepTime)}m`,
      change: avgPrepTime < 20 ? "Good" : "High",
      isPositive: avgPrepTime < 20,
      icon: Clock,
      color: "text-[var(--status-preparing)]"
    },
    {
      title: "Satisfaction",
      value: customerSatisfaction.toFixed(1),
      change: "+0.3",
      isPositive: true,
      icon: Star,
      color: "text-[var(--status-reserved)]"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="mb-2 text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">Real-time insights and performance metrics</p>
          </div>
          <InviteUserModal />
        </motion.div>

        {/* Real-time Status */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-6 bg-card border-border shadow-sm rounded-2xl">
            <h3 className="text-foreground mb-4">Live Restaurant Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stats.occupancyRate}%</div>
                <div className="text-sm text-muted-foreground">Occupancy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stats.availableTables}</div>
                <div className="text-sm text-muted-foreground">Available Tables</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{waitlist.length}</div>
                <div className="text-sm text-muted-foreground">Waitlist Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">{menuItems.filter(item => item.status === 'available').length}</div>
                <div className="text-sm text-muted-foreground">Dishes Available</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.slice(0, 4).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
              >
                <Card className="p-4 bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-muted/20`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <Badge 
                      className={`
                        ${stat.isPositive 
                          ? "bg-[var(--status-available)] text-white" 
                          : "bg-[var(--status-unavailable)] text-white"
                        } rounded-full px-2 py-1 text-xs
                      `}
                    >
                      {stat.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <div className="font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.title}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {dashboardStats.slice(4).map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 4), duration: 0.5 }}
              >
                <Card className="p-4 bg-card border-border shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-xl bg-muted/20`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <Badge 
                      className={`
                        ${stat.isPositive 
                          ? "bg-[var(--status-available)] text-white" 
                          : "bg-[var(--status-unavailable)] text-white"
                        } rounded-full px-2 py-1 text-xs
                      `}
                    >
                      {stat.isPositive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {stat.change}
                    </Badge>
                  </div>
                  
                  <div className="font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.title}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Occupancy Chart */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
                <h3 className="text-foreground mb-6">Occupancy Rate Today</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={occupancyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="time" 
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="occupancy" 
                      stroke="#d2691e" 
                      strokeWidth={3}
                      dot={{ fill: "#d2691e", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: "#d2691e", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </div>

          {/* Revenue Breakdown */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
              <h3 className="text-foreground mb-6">Revenue Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={revenueData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-3">
                {revenueData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground text-sm">{item.name}</span>
                    </div>
                    <span className="font-medium text-foreground">
                      ${item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Popular Dishes - Real Data */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
            <h3 className="text-foreground mb-6">Most Popular Dishes (Live Data)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dishPopularityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis 
                  dataKey="name" 
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'orders' ? `${value} orders` : `$${value}`,
                    name === 'orders' ? 'Orders' : 'Revenue'
                  ]}
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                  }}
                />
                <Bar 
                  dataKey="popularity" 
                  fill="#d2691e" 
                  radius={[8, 8, 0, 0]}
                  name="Popularity %"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}