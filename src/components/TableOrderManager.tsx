import { useState } from "react";
import { motion } from "motion/react";
import { 
  Clock, 
  DollarSign, 
  User, 
  Users, 
  Receipt, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Plus,
  Eye,
  Trash2
} from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useRestaurant } from "../contexts/RestaurantContext";
import { toast } from "sonner@2.0.3";

export function TableOrderManager() {
  const { 
    tables,
    tableOrders,
    bills,
    updateTableOrderStatus,
    generateBill,
    payBill,
    getActiveTableOrder,
    getTableBill,
    updateTableStatus
  } = useRestaurant();

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const occupiedTables = tables.filter(table => 
    table.status === 'occupied' || getActiveTableOrder(table.id.toString())
  );

  const handleViewOrder = (tableId: string) => {
    const order = getActiveTableOrder(tableId);
    if (order) {
      setSelectedOrder(order);
      setIsOrderModalOpen(true);
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    updateTableOrderStatus(orderId, 'completed');
    toast.success("Order marked as completed!");
  };

  const handleGenerateBill = (tableId: string) => {
    try {
      const bill = generateBill(tableId);
      setSelectedBill(bill);
      setIsBillModalOpen(true);
      toast.success("Bill generated successfully!");
    } catch (error) {
      toast.error("Failed to generate bill");
    }
  };

  const handlePayBill = (billId: string, paymentMethod: any) => {
    payBill(billId, paymentMethod);
    setIsBillModalOpen(false);
    toast.success("Payment processed successfully!");
  };

  const handleFreeTable = (tableId: string) => {
    updateTableStatus(tableId, 'cleaning');
    toast.success("Table marked for cleaning");
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'paid':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Table Order Management</h2>
        <Badge variant="outline">
          {occupiedTables.length} Active Tables
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {occupiedTables.map((table) => {
          const activeOrder = getActiveTableOrder(table.id);
          const tableBill = getTableBill(table.id);
          const completedOrders = tableOrders.filter(
            order => order.tableId === table.id && order.status === 'completed'
          );

          return (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group"
            >
              <Card className="p-4 hover:shadow-lg transition-all duration-200">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Table {table.number}</h3>
                      <p className="text-sm text-muted-foreground">
                        {table.partyName} • {table.partySize} guests
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getOrderStatusColor(activeOrder?.status || 'none')}>
                        {activeOrder?.status || 'No Order'}
                      </Badge>
                    </div>
                  </div>

                  {/* Order Summary */}
                  {activeOrder && (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Current Order:</span>
                        <span className="font-medium">${activeOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Items:</span>
                        <span>{activeOrder.items.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Time:</span>
                        <span>{formatTime(activeOrder.createdAt)}</span>
                      </div>
                    </div>
                  )}

                  {/* Completed Orders */}
                  {completedOrders.length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">
                        {completedOrders.length} completed order(s)
                      </span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {activeOrder && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewOrder(table.id)}
                          className="text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Order
                        </Button>

                        {activeOrder.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteOrder(activeOrder.id)}
                            className="text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Complete
                          </Button>
                        )}
                      </>
                    )}

                    {completedOrders.length > 0 && !tableBill && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateBill(table.id)}
                        className="text-xs"
                      >
                        <Receipt className="h-3 w-3 mr-1" />
                        Generate Bill
                      </Button>
                    )}

                    {tableBill && !tableBill.isPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBill(tableBill);
                          setIsBillModalOpen(true);
                        }}
                        className="text-xs"
                      >
                        <CreditCard className="h-3 w-3 mr-1" />
                        Process Payment
                      </Button>
                    )}

                    {tableBill?.isPaid && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFreeTable(table.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Free Table
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Order Details Modal */}
      <Dialog open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details - Table {selectedOrder?.tableId}</DialogTitle>
            <DialogDescription>
              View complete order information and current status.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Customer:</span>
                  <p className="font-medium">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Party Size:</span>
                  <p className="font-medium">{selectedOrder.partySize}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Order Time:</span>
                  <p className="font-medium">{formatTime(selectedOrder.createdAt)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Order Items</h4>
                {selectedOrder.items.map((item: any, index: number) => (
                  <Card key={index} className="p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium">{item.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          ${item.price} × {item.quantity} = ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        {item.specialRequests && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Note: {item.specialRequests}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8.5%):</span>
                  <span>${selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bill Payment Modal */}
      <Dialog open={isBillModalOpen} onOpenChange={setIsBillModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Select a payment method to complete the transaction.
            </DialogDescription>
          </DialogHeader>

          {selectedBill && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-2xl font-bold">${selectedBill.totalAmount.toFixed(2)}</h3>
                <p className="text-muted-foreground">Total Amount Due</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Select Payment Method</h4>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handlePayBill(selectedBill.id, 'cash')}
                    variant="outline"
                    className="justify-start"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Cash
                  </Button>
                  <Button
                    onClick={() => handlePayBill(selectedBill.id, 'card')}
                    variant="outline"
                    className="justify-start"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Card
                  </Button>
                  <Button
                    onClick={() => handlePayBill(selectedBill.id, 'digital')}
                    variant="outline"
                    className="justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Digital Wallet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}