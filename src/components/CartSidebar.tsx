import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Minus, ShoppingCart, Trash2, MessageSquare, Edit3, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useRestaurant } from "../contexts/RestaurantContext";
import { useAuth } from "../contexts/AuthContext";
import { CheckoutModal } from "./CheckoutModal";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTable?: { id: number; name: string; size: number } | null;
}

export function CartSidebar({ isOpen, onClose, currentTable }: CartSidebarProps) {
  const { 
    cartItems,
    removeFromCart, 
    updateCartItemQuantity, 
    updateCartItemRequests,
    clearCart,
    cartTotal,
    cartItemCount
  } = useRestaurant();
  const { user, hasPermission } = useAuth();
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingRequests, setEditingRequests] = useState("");

  const handleQuantityChange = (cartItemId: string, newQuantity: number) => {
    updateCartItemQuantity(cartItemId, newQuantity);
  };

  const handleRemoveItem = (cartItemId: string) => {
    removeFromCart(cartItemId);
  };

  const handleCheckout = () => {
    setIsCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    onClose();
  };

  const handleEditRequests = (item: any) => {
    setEditingItemId(item.id);
    setEditingRequests(item.specialRequests || "");
  };

  const handleSaveRequests = () => {
    if (editingItemId) {
      updateCartItemRequests(editingItemId, editingRequests);
      setEditingItemId(null);
      setEditingRequests("");
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingRequests("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-50 shadow-2xl"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    <h2 className="text-foreground">Your Order</h2>
                    {cartItemCount > 0 && (
                      <Badge className="bg-primary text-primary-foreground">
                        {cartItemCount}
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="hover:bg-accent"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* User Cart Info */}
                {user && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Cart for:</p>
                      <p className="text-sm font-medium text-foreground">{user.name || user.email}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-muted-foreground mb-2">Your cart is empty</h3>
                    <p className="text-sm text-muted-foreground">
                      Add some delicious items from our menu!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Show current table info if available */}
                    {currentTable && (
                      <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium text-primary">
                              {currentTable.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Party of {currentTable.size}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        layout
                      >
                        <Card className="p-4 bg-card border-border">
                          <div className="flex items-start space-x-3">
                            <ImageWithFallback
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="text-foreground truncate">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${item.price} • {item.prepTime}m prep
                              </p>
                              
                              {/* Special Requests */}
                              {editingItemId === item.id ? (
                                <div className="mt-2 space-y-2">
                                  <Textarea
                                    placeholder="Special requests (e.g., no onions, extra spicy...)"
                                    value={editingRequests}
                                    onChange={(e) => setEditingRequests(e.target.value)}
                                    className="text-xs resize-none"
                                    rows={2}
                                  />
                                  <div className="flex space-x-1">
                                    <Button size="sm" onClick={handleSaveRequests} className="h-6 text-xs">
                                      Save
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={handleCancelEdit} className="h-6 text-xs">
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  {item.specialRequests && (
                                    <div className="mt-1 p-2 bg-muted rounded text-xs">
                                      <div className="flex items-start space-x-1">
                                        <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                                        <span className="text-muted-foreground">{item.specialRequests}</span>
                                      </div>
                                    </div>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRequests(item)}
                                    className="h-6 text-xs mt-1 p-1 text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit3 className="h-3 w-3 mr-1" />
                                    {item.specialRequests ? 'Edit requests' : 'Add requests'}
                                  </Button>
                                </>
                              )}
                              
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-sm font-medium w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-primary">
                                    ${(item.price * item.quantity).toFixed(2)}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-border p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground">Total</span>
                    <span className="text-xl font-bold text-primary">
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {user?.role === 'customer' ? (
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-2">
                          Your items are ready to order!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please approach our staff to complete your order and get a table assigned.
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleCheckout}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        {currentTable ? 'Place Order' : 'Assign to Table'}
                      </Button>
                    )}
                    
                    <Button
                      onClick={clearCart}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          <CheckoutModal 
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            onSuccess={handleCheckoutSuccess}
            preSelectedTableId={currentTable?.id}
            customerInfo={currentTable ? { name: currentTable.name, partySize: currentTable.size } : undefined}
          />
        </>
      )}
    </AnimatePresence>
  );
}