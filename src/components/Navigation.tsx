import { motion, AnimatePresence } from "motion/react";
import { UtensilsCrossed, ChefHat, TrendingUp, Users, Moon, Sun, Utensils, Menu, X, CreditCard, LogOut, User, UserPlus, Settings, QrCode } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { InviteUserModal } from "./InviteUserModal";

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isDarkMode: boolean;
  onThemeToggle: () => void;
}

const navItems = [
  { id: "menu", label: "Customer Menu", icon: UtensilsCrossed, permission: "view_menu" },
  { id: "kitchen", label: "Kitchen", icon: ChefHat, permission: "manage_kitchen" },
  { id: "host", label: "Host", icon: Users, permission: "host_dashboard" },
  { id: "payment", label: "Payment", icon: CreditCard, permission: "process_payments" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, permission: "view_analytics" },
  { id: "menu-management", label: "Menu Setup", icon: Settings, permission: "view_analytics" },
  { id: "qr-codes", label: "QR Codes", icon: QrCode, permission: "host_dashboard" },
];

export function Navigation({ activeView, onViewChange, isDarkMode, onThemeToggle }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();

  const availableNavItems = navItems.filter(item => hasPermission(item.permission));

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Invite User Modal (for owners) */}
      {user?.role === 'owner' && (
        <InviteUserModal 
          isOpen={isInviteModalOpen} 
          onOpenChange={setIsInviteModalOpen}
        />
      )}
      
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange("home")}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">RestaurantOS</h2>
            </motion.div>
            
            {/* Right Side - Navigation + User Menu */}
            <div className="flex items-center gap-3">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-1">
                {availableNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => onViewChange(item.id)}
                        className="relative px-4 py-2 rounded-xl transition-all duration-200"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                        {isActive && (
                          <motion.div
                            layoutId="activeTab"
                            className="absolute inset-0 bg-primary rounded-xl -z-10"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </nav>
              
              {/* Notifications */}
              <NotificationCenter />
              
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={onThemeToggle}
                className="rounded-xl"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback>
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user?.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user?.role === 'owner' && (
                    <>
                      <DropdownMenuItem onClick={() => setIsInviteModalOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden rounded-xl ml-2"
              >
                {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            />
            
            {/* Menu Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-[73px] left-0 right-0 md:hidden bg-card border-b border-border shadow-2xl z-50 max-h-[calc(100vh-73px)] overflow-y-auto"
            >
              <div className="container mx-auto px-6 py-4">
                <nav className="flex flex-col space-y-2">
                  {availableNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;
                    
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "ghost"}
                        onClick={() => {
                          onViewChange(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className="justify-start px-4 py-2 rounded-xl transition-all duration-200"
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </Button>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
