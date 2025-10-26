import { motion } from "motion/react";
import { ChefHat, Users, Monitor, Crown, TrendingUp, Clock, Utensils, Star, ArrowRight, Sparkles, Zap, Shield, BarChart3, Heart, CheckCircle } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { useRestaurant } from "../contexts/RestaurantContext";
import { useAuth } from "../contexts/AuthContext";
import { RestaurantOverview } from "./RestaurantOverview";

interface HomeProps {
  onNavigate: (view: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  const { stats, menuItems, tables, orders, waitlist } = useRestaurant();
  const { hasPermission } = useAuth();

  // Show loading state if data hasn't loaded yet
  if (!stats || !menuItems || !tables) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const allRoles = [
    {
      title: "Customer Menu",
      description: "Digital menu with real-time availability and wait times",
      icon: ChefHat,
      view: "menu",
      iconBg: "bg-[var(--status-available)]",
      features: ["QR Code Access", "Live Updates", "Wait Times"],
      metric: `${menuItems.filter(item => item.status === 'available').length} dishes available`,
      permission: "view_menu"
    },
    {
      title: "Host Dashboard", 
      description: "Intelligent table management and seating optimization",
      icon: Users,
      view: "host",
      iconBg: "bg-primary",
      features: ["Floor Plan", "Waitlist", "Reservations"],
      metric: `${stats.availableTables} tables available`,
      permission: "host_dashboard"
    },
    {
      title: "Kitchen Dashboard",
      description: "Smart kitchen operations and order management",
      icon: Monitor,
      view: "kitchen",
      iconBg: "bg-[var(--status-preparing)]",
      features: ["Order Queue", "Prep Times", "Inventory"],
      metric: `${orders.filter(o => o.status === 'pending' || o.status === 'preparing').length} active orders`,
      permission: "manage_kitchen"
    },
    {
      title: "Owner Analytics",
      description: "Advanced insights and performance analytics",
      icon: Crown,
      view: "analytics",
      iconBg: "bg-[var(--status-occupied)]",
      features: ["Revenue", "Analytics", "Reports"],
      metric: `${stats.occupancyRate}% occupancy rate`,
      permission: "view_analytics"
    }
  ];

  const roles = allRoles.filter(role => hasPermission(role.permission));

  const features = [
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live synchronization across all platforms for instant updates"
    },
    {
      icon: Shield,
      title: "Reliable & Secure",
      description: "Enterprise-grade security with 99.9% uptime guarantee"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights and actionable data for better decisions"
    },
    {
      icon: Heart,
      title: "Customer Experience",
      description: "Enhanced dining experience from reservation to payment"
    }
  ];

  const benefits = [
    "Reduce wait times by 40%",
    "Increase table turnover",
    "Streamline kitchen operations",
    "Boost customer satisfaction"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Restaurant Overview */}
      <div className="container mx-auto px-6 py-8">
        <RestaurantOverview />
      </div>

      {/* Available Dashboards */}
      {roles.length > 0 && (
        <div className="container mx-auto px-6 py-12">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-2xl font-bold text-foreground mb-2">Available Dashboards</h2>
            <p className="text-muted-foreground">
              Quick access to your authorized sections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {roles.map((role, index) => (
              <motion.div
                key={role.view}
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.6 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                onClick={() => onNavigate(role.view)}
                className="group cursor-pointer"
              >
                <Card className="h-full border shadow-sm hover:shadow-md transition-all duration-300 bg-card group-hover:border-primary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${role.iconBg} text-white group-hover:scale-105 transition-transform duration-300`}>
                        <role.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground group-hover:text-primary transition-colors duration-300">
                          {role.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {role.metric}
                        </p>
                      </div>
                      
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose RestaurantOS?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for modern restaurants with cutting-edge technology
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.6 + (index * 0.1), duration: 0.6 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-md">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
        className="container mx-auto px-6 py-20"
      >
        <Card className="bg-primary text-primary-foreground rounded-2xl shadow-2xl max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Restaurant?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of restaurants already using RestaurantOS to streamline operations and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate("menu")}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-4 rounded-xl font-medium shadow-lg"
              >
                Start Demo
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onNavigate("host")}
                className="border-2 border-primary-foreground/30 hover:border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 px-8 py-4 rounded-xl font-medium"
              >
                Explore Features
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}