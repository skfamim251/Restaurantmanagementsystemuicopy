import { useState } from "react";
import { motion } from "motion/react";
import { Clock, Utensils, Leaf, Fish, Coffee, IceCream, Users, AlertCircle, CheckCircle, ShoppingCart, MapPin, Search } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRestaurant } from "../contexts/RestaurantContext";
import { useAuth } from "../contexts/AuthContext";
import { CartSidebar } from "./CartSidebar";
import { TableAllocationModal } from "./TableAllocationModal";
import { toast } from "sonner@2.0.3";

const categories = [
  { id: "all", name: "All", icon: Utensils },
  { id: "Starters", name: "Starters", icon: Leaf },
  { id: "Mains", name: "Main Courses", icon: Utensils },
  { id: "Seafood", name: "Seafood", icon: Fish },
  { id: "Drinks", name: "Beverages", icon: Coffee },
  { id: "Desserts", name: "Desserts", icon: IceCream },
];

export function CustomerMenu() {
  const { menuItems, stats, cartItems, isLoadingMenuItems, addToCart } = useRestaurant();
  const { user, hasPermission } = useAuth();
  const cartItemCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTableAllocationModalOpen, setIsTableAllocationModalOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<{id: number, name: string, size: number} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleAddToCart = (item: any) => {
    // Check if user has permission to add to cart
    if (!hasPermission('add_to_cart')) {
      toast.error('You do not have permission to add items to cart');
      return;
    }

    // For customers, they can add to cart without table allocation (staff will handle table assignment)
    addToCart(item);
    
    if (user?.role === 'customer') {
      toast.success(`${item.name} added to your cart!`, {
        description: `A staff member will assign your table when you're ready to order.`,
        duration: 3000,
      });
    } else {
      // For staff/owner, require table allocation first
      if (!currentTable) {
        setIsTableAllocationModalOpen(true);
        return;
      }
      
      toast.success(`${item.name} added to cart!`, {
        description: `${item.name} - ${item.price}`,
        duration: 2000,
      });
    }
  };

  const handleTableAllocation = (tableId: number, customerName: string, partySize: number) => {
    setCurrentTable({ id: tableId, name: customerName, size: partySize });
    toast.success(`Table allocated to ${customerName}!`, {
      description: `Table ${tableId} • Party of ${partySize}`,
      duration: 3000,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-[var(--status-available)] text-white";
      case "unavailable":
        return "bg-[var(--status-unavailable)] text-white";
      case "preparing":
        return "bg-[var(--status-preparing)] text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "available":
        return "Available";
      case "unavailable":
        return "Out of Stock";
      case "preparing":
        return "Limited";
      default:
        return "Unknown";
    }
  };

  const renderSeatingAlert = () => {
    if (stats.availableTables > 0) {
      return (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>
                    <strong>Seating Available!</strong> {stats.availableTables} table{stats.availableTables > 1 ? 's' : ''} ready for immediate seating.
                  </span>
                </div>
                <Badge className="bg-green-600 text-white">
                  {stats.occupancyRate}% occupied
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Alert className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>
                    <strong>Currently Full</strong> - Estimated wait time: <strong>{stats.estimatedWaitTime} minutes</strong>
                  </span>
                </div>
                <Badge className="bg-amber-600 text-white">
                  {stats.occupancyRate}% occupied
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
            <div className="flex-1">
              <h1 className="mb-2 text-foreground">Today's Menu</h1>
              <p className="text-muted-foreground text-sm md:text-base">Crafted with the finest ingredients • Real-time availability</p>
              {currentTable && (
                <div className="mt-2 flex items-center space-x-2 text-xs md:text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Table {currentTable.id} • {currentTable.name} • Party of {currentTable.size}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              {/* Only show table allocation button for staff/owner */}
              {hasPermission('allocate_tables') && !currentTable && (
                <Button
                  onClick={() => setIsTableAllocationModalOpen(true)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm md:text-base"
                  size="sm"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Get Table</span>
                  <span className="sm:hidden">Table</span>
                </Button>
              )}
              
              {cartItemCount > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCartOpen(true)}
                  className="flex items-center space-x-2 bg-primary text-primary-foreground px-3 md:px-4 py-2 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span className="font-medium text-sm md:text-base">{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</span>
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Seating Status Alert */}
        {renderSeatingAlert()}

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
          className="flex flex-wrap gap-3 mb-8"
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
                transition={{ delay: 0.1 * index }}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full border transition-all duration-200 shadow-sm ${
                  isActive 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md' 
                    : 'bg-card border-border hover:bg-accent text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-primary'}`} />
                <span>{category.name}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Restaurant Stats */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Seating</span>
            </div>
            <div className="font-bold text-primary">
              {stats.availableTables > 0 ? `${stats.availableTables} Available` : 'Full'}
            </div>
          </Card>
          
          <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Wait Time</span>
            </div>
            <div className="font-bold text-primary">
              {stats.availableTables > 0 ? 'None' : `${stats.estimatedWaitTime}m`}
            </div>
          </Card>

          <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Utensils className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Available Dishes</span>
            </div>
            <div className="font-bold text-primary">
              {menuItems.filter(item => item.status === 'available').length}
            </div>
          </Card>

          <Card className="p-4 bg-card border-border shadow-sm rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Occupancy</span>
            </div>
            <div className="font-bold text-primary">
              {stats.occupancyRate}%
            </div>
          </Card>
        </motion.div>

        {/* Menu Items */}
        {isLoadingMenuItems ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden bg-card border-border shadow-lg rounded-2xl">
                <div className="w-full h-48 bg-muted animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems
              .filter(item => {
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
              })
              .map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <Card className="overflow-hidden bg-card border-border shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
                <div className="relative">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(item.status)} rounded-full px-3 py-1`}>
                      {getStatusText(item.status)}
                    </Badge>
                  </div>
                  {item.status === "available" && (
                    <div className="absolute top-4 right-4 flex items-center bg-black/70 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-sm">{item.prepTime}m</span>
                    </div>
                  )}
                  {item.status === "preparing" && (
                    <div className="absolute top-4 right-4 flex items-center bg-amber-500/90 text-white px-3 py-1 rounded-full backdrop-blur-sm">
                      <Clock className="h-3 w-3 mr-1" />
                      <span className="text-sm">+{Math.round(item.prepTime * 1.5)}m</span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-foreground">{item.name}</h3>
                    <span className="text-primary font-medium">${item.price}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={item.status === "unavailable"}
                    onClick={() => handleAddToCart(item)}
                    className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
                  >
                    {item.status === "unavailable" 
                      ? "Out of Stock" 
                      : item.status === "preparing"
                        ? `Add to Cart (+${Math.round(item.prepTime * 1.5)}m)`
                        : "Add to Cart"
                    }
                  </motion.button>
                </div>
              </Card>
            </motion.div>
          ))}
          </div>
        )}
      </div>
      
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)}
        currentTable={currentTable}
      />
      
      {hasPermission('allocate_tables') && (
        <TableAllocationModal 
          isOpen={isTableAllocationModalOpen}
          onClose={() => setIsTableAllocationModalOpen(false)}
          onSuccess={handleTableAllocation}
        />
      )}
    </div>
  );
}