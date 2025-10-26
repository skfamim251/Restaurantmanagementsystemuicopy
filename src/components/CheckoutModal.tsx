import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { X, User, Users, MapPin, CreditCard, DollarSign, Smartphone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRestaurant } from "../contexts/RestaurantContext";
import { toast } from "sonner@2.0.3";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preSelectedTableId?: number;
  customerInfo?: { name: string; partySize: number };
}

export function CheckoutModal({ isOpen, onClose, onSuccess, preSelectedTableId, customerInfo }: CheckoutModalProps) {
  const { 
    cartItems,
    tables,
    settings,
    cartTotal,
    createTableOrder, 
    addItemsToTableOrder,
    getActiveTableOrder,
    updateTableStatus
  } = useRestaurant();
  
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState<number>(1);

  // Update state when props change
  useEffect(() => {
    if (preSelectedTableId) {
      setSelectedTableId(preSelectedTableId);
    }
    if (customerInfo) {
      setCustomerName(customerInfo.name);
      setPartySize(customerInfo.partySize);
    }
  }, [preSelectedTableId, customerInfo]);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableTables = tables.filter(table => 
    table.status === 'available' || table.status === 'occupied'
  );

  const selectedTable = selectedTableId ? tables.find(t => t.id.toString() === selectedTableId.toString()) : null;
  const existingOrder = selectedTableId ? getActiveTableOrder(selectedTableId.toString()) : null;

  const taxRate = settings?.taxRate || 0.08;
  const subtotal = cartTotal;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (!selectedTableId) {
      toast.error("Please select a table");
      return;
    }

    // If customer info is pre-provided, no need to validate
    if (!preSelectedTableId && !customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    setIsProcessing(true);

    try {
      if (existingOrder) {
        // Add items to existing order
        addItemsToTableOrder(selectedTableId!.toString(), cartItems);
        toast.success("Items added to existing order!");
      } else {
        // Create new order
        createTableOrder(selectedTableId!.toString(), customerName, partySize);
        
        // Update table status to occupied if it was available
        if (selectedTable?.status === 'available') {
          updateTableStatus(selectedTableId!.toString(), 'occupied');
        }
        
        toast.success("Order created successfully!");
      }

      onSuccess();
      onClose();
      
      // Reset form only if not pre-selected
      if (!preSelectedTableId) {
        setSelectedTableId(null);
        setCustomerName("");
        setPartySize(1);
      }
    } catch (error) {
      toast.error("Failed to process order");
    } finally {
      setIsProcessing(false);
    }
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'occupied':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'reserved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <span>Checkout - Assign to Table</span>
          </DialogTitle>
          <DialogDescription>
            Select a table and enter customer details to complete your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="p-4 bg-muted/50">
            <h3 className="font-medium mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>{cartItems.length} items</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (8.5%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Customer Information - only show if not pre-selected */}
          {!preSelectedTableId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="partySize">Party Size</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="partySize"
                    type="number"
                    min="1"
                    max="12"
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Show customer info if pre-selected */}
          {preSelectedTableId && customerInfo && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-primary">
                    {customerInfo.name} • Party of {customerInfo.partySize}
                  </p>
                  <p className="text-muted-foreground">
                    Table {selectedTable?.number}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Table Selection - only show if not pre-selected */}
          {!preSelectedTableId && (
            <div className="space-y-3">
              <Label>Select Table</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableTables.map((table) => {
                  const isSelected = selectedTableId === table.id;
                  const activeOrder = getActiveTableOrder(table.id.toString());
                  
                  return (
                    <motion.button
                      key={table.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTableId(table.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        isSelected 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Table {table.number}</span>
                        <Badge className={getTableStatusColor(table.status)}>
                          {table.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          <span>Seats {table.capacity}</span>
                        </div>
                        
                        {table.status === 'occupied' && table.partyName && (
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{table.partyName}</span>
                          </div>
                        )}
                        
                        {activeOrder && (
                          <div className="text-primary text-xs">
                            Active order: ${activeOrder.total.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              
              {availableTables.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-8 w-8 mx-auto mb-2" />
                  <p>No available tables at the moment</p>
                </div>
              )}
            </div>
          )}

          {/* Existing Order Warning */}
          {existingOrder && (
            <Card className="p-4 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800">
              <div className="flex items-start space-x-2">
                <Users className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    This table has an existing order
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    New items will be added to the current order for {existingOrder.customerName}. 
                    Current total: ${existingOrder.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleCheckout}
              disabled={!selectedTableId || (!preSelectedTableId && !customerName.trim()) || isProcessing}
              className="flex-1"
            >
              {isProcessing ? (
                "Processing..."
              ) : existingOrder ? (
                "Add to Order"
              ) : preSelectedTableId ? (
                "Place Order"
              ) : (
                "Create Order"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}