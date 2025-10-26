import { useState } from "react";
import { motion } from "motion/react";
import { X, User, Users, MapPin, CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useRestaurant } from "../contexts/RestaurantContext";
import { toast } from "sonner@2.0.3";

interface TableAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tableId: number, customerName: string, partySize: number) => void;
}

export function TableAllocationModal({ isOpen, onClose, onSuccess }: TableAllocationModalProps) {
  const { tables, updateTableStatus } = useRestaurant();
  
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [partySize, setPartySize] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableTables = tables.filter(table => 
    table.status === 'available'
  );

  const selectedTable = selectedTableId ? tables.find(t => t.id.toString() === selectedTableId.toString()) : null;

  const handleAllocateTable = async () => {
    if (!selectedTableId) {
      toast.error("Please select a table");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }

    if (partySize < 1) {
      toast.error("Party size must be at least 1");
      return;
    }

    if (selectedTable && partySize > selectedTable.capacity) {
      toast.error(`This table can only seat ${selectedTable.capacity} people`);
      return;
    }

    setIsProcessing(true);

    try {
      // Update table status to occupied and set party details
      const updatedTables = tables.map(table => {
        if (table.id === selectedTableId) {
          return {
            ...table,
            status: 'occupied' as const,
            seatedAt: new Date().toISOString(),
            partyName: customerName,
            partySize: partySize
          };
        }
        return table;
      });

      // Update the table status in context
      updateTableStatus(selectedTableId.toString(), 'occupied');
      
      toast.success(`Table ${selectedTable?.number} allocated to ${customerName}`);
      
      // Call success callback with table details
      onSuccess(selectedTableId, customerName, partySize);
      onClose();
      
      // Reset form
      setSelectedTableId(null);
      setCustomerName("");
      setPartySize(1);
    } catch (error) {
      toast.error("Failed to allocate table");
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
            <MapPin className="h-5 w-5 text-primary" />
            <span>Allocate Table</span>
          </DialogTitle>
          <DialogDescription>
            Enter customer details and select a table to get started with your order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
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
              <Label htmlFor="partySize">Party Size *</Label>
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

          {/* Table Selection */}
          <div className="space-y-3">
            <Label>Select Table *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableTables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isCapacitySufficient = partySize <= table.capacity;
                
                return (
                  <motion.button
                    key={table.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTableId(table.id)}
                    disabled={!isCapacitySufficient}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : isCapacitySufficient
                        ? 'border-border hover:border-primary/50'
                        : 'border-destructive/30 bg-destructive/5 cursor-not-allowed opacity-60'
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
                      
                      {!isCapacitySufficient && (
                        <div className="text-destructive text-xs">
                          Too small for party of {partySize}
                        </div>
                      )}
                      
                      {isSelected && (
                        <div className="flex items-center text-primary text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Selected</span>
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
                <p className="text-sm">Please wait for a table to become available</p>
              </div>
            )}
          </div>

          {/* Selected Table Summary */}
          {selectedTable && (
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <p className="font-medium text-primary">
                    Table {selectedTable.number} for {customerName || 'customer'}
                  </p>
                  <p className="text-muted-foreground">
                    Party of {partySize} • Seats {selectedTable.capacity}
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
              onClick={handleAllocateTable}
              disabled={!selectedTableId || !customerName.trim() || partySize < 1 || isProcessing}
              className="flex-1"
            >
              {isProcessing ? "Allocating..." : "Allocate Table"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}