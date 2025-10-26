import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRestaurant } from "../contexts/RestaurantContext";
import { toast } from "sonner@2.0.3";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Receipt, 
  Users, 
  Calculator,
  CheckCircle,
  AlertCircle,
  Printer,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner@2.0.3";

interface SplitBill {
  customerId: string;
  customerNumber: number;
  items: Array<{
    dishId: string;
    name: string;
    price: number;
    quantity: number;
    specialRequests?: string;
  }>;
  subtotal: number;
  tip: number;
  tax: number;
  total: number;
}

export function Payment() {
  const { tables, settings } = useRestaurant();
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [tipPercentage, setTipPercentage] = useState(18);
  const [customTip, setCustomTip] = useState("");
  const [isSplitBill, setIsSplitBill] = useState(false);
  const [splitConfiguration, setSplitConfiguration] = useState<SplitBill[]>([]);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [paidBills, setPaidBills] = useState<number[]>([]);

  // Get tables with orders
  const tablesWithOrders = useMemo(() => {
    return tables.filter(table => 
      table.orders && table.orders.length > 0 && table.status === "occupied"
    );
  }, [tables]);

  // Calculate bill for selected table
  const selectedBill = useMemo(() => {
    if (!selectedTable) return null;
    const table = tables.find(t => t.id.toString() === selectedTable.toString());
    if (!table || !table.orders) return null;

    const items = table.orders.flatMap(order => 
      order.items.map(item => ({
        ...item,
        orderId: order.id,
        orderTime: order.createdAt
      }))
    );

    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tipAmount = customTip ? parseFloat(customTip) || 0 : (subtotal * tipPercentage / 100);
    const taxRate = settings?.taxRate || 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tipAmount + tax;

    return {
      table,
      items,
      subtotal,
      tipAmount,
      tax,
      total,
      customerCount: table.partySize || 1
    };
  }, [selectedTable, tables, tipPercentage, customTip, settings]);

  const initializeSplitBill = () => {
    if (!selectedBill) return;
    
    const customerCount = selectedBill.customerCount;
    const itemsPerCustomer = Math.ceil(selectedBill.items.length / customerCount);
    
    const splits: SplitBill[] = [];
    for (let i = 0; i < customerCount; i++) {
      const startIndex = i * itemsPerCustomer;
      const endIndex = Math.min(startIndex + itemsPerCustomer, selectedBill.items.length);
      const customerItems = selectedBill.items.slice(startIndex, endIndex);
      
      const subtotal = customerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tip = subtotal * tipPercentage / 100;
      const tax = subtotal * 0.08;
      
      splits.push({
        customerId: `customer-${i + 1}`,
        customerNumber: i + 1,
        items: customerItems,
        subtotal,
        tip,
        tax,
        total: subtotal + tip + tax
      });
    }
    
    setSplitConfiguration(splits);
    setIsSplitBill(true);
  };

  const processPayment = async () => {
    if (!selectedBill) return;
    
    setPaymentProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      // Mark bill as paid
      setPaidBills([...paidBills, selectedTable!]);
      
      toast.success("Payment processed successfully!");
      setShowReceipt(true);
      
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  const printReceipt = () => {
    toast.success("Receipt sent to printer");
  };

  const resetPayment = () => {
    setSelectedTable(null);
    setIsSplitBill(false);
    setSplitConfiguration([]);
    setShowReceipt(false);
    setCustomTip("");
    setTipPercentage(18);
    setPaymentMethod("card");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-foreground">Payment Center</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Process payments and manage bills
            </p>
          </div>
          {selectedTable && (
            <Button
              variant="outline"
              onClick={resetPayment}
              className="flex items-center gap-2 w-full md:w-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Tables
            </Button>
          )}
        </div>

        {!selectedTable ? (
          /* Table Selection */
          <div className="grid gap-4">
            <h2 className="text-xl font-medium">Select Table to Process</h2>
            
            {tablesWithOrders.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No tables with pending orders found.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tablesWithOrders.map((table) => {
                  const orderCount = table.orders?.length || 0;
                  const totalAmount = table.orders?.reduce((sum, order) => 
                    sum + order.items.reduce((orderSum, item) => 
                      orderSum + (item.price * item.quantity), 0
                    ), 0
                  ) || 0;
                  
                  const isPaid = paidBills.includes(table.id);

                  return (
                    <motion.div
                      key={table.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          isPaid ? 'opacity-50' : 'hover:shadow-lg'
                        }`}
                        onClick={() => !isPaid && setSelectedTable(table.id)}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              Table {table.id}
                              {isPaid && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              )}
                            </CardTitle>
                            <Badge variant="outline">
                              {orderCount} order{orderCount !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <CardDescription>
                            Party of {table.partySize} • ${totalAmount.toFixed(2)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Status: {table.status}</span>
                            <span>Ready to pay</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Payment Processing */
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Bill Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Table {selectedTable} Bill
                  </CardTitle>
                  <CardDescription>
                    Party of {selectedBill?.customerCount} • {selectedBill?.items.length} items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!isSplitBill ? (
                    <div className="space-y-4">
                      {/* Items List */}
                      <div className="space-y-2">
                        {selectedBill?.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-start py-2 border-b border-border/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{item.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  x{item.quantity}
                                </Badge>
                              </div>
                              {item.specialRequests && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  Note: {item.specialRequests}
                                </p>
                              )}
                            </div>
                            <span className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      {/* Bill Summary */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>${selectedBill?.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax (8%)</span>
                          <span>${selectedBill?.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tip ({tipPercentage}%)</span>
                          <span>${selectedBill?.tipAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                          <span>Total</span>
                          <span>${selectedBill?.total.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Split Bill Option */}
                      <div className="pt-4">
                        <Button
                          variant="outline"
                          onClick={initializeSplitBill}
                          className="flex items-center gap-2"
                        >
                          <Users className="h-4 w-4" />
                          Split Bill
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Split Bill View */
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Split Between {splitConfiguration.length} Customers</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsSplitBill(false)}
                        >
                          Cancel Split
                        </Button>
                      </div>

                      <Tabs defaultValue="customer-1" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          {splitConfiguration.map((split) => (
                            <TabsTrigger key={split.customerId} value={split.customerId}>
                              Customer {split.customerNumber}
                            </TabsTrigger>
                          ))}
                        </TabsList>

                        {splitConfiguration.map((split) => (
                          <TabsContent key={split.customerId} value={split.customerId} className="space-y-4">
                            <div className="space-y-2">
                              {split.items.map((item, index) => (
                                <div key={index} className="flex justify-between py-1">
                                  <span>{item.name} x{item.quantity}</span>
                                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            <Separator />
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>${split.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tax</span>
                                <span>${split.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Tip</span>
                                <span>${split.tip.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span>${split.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </TabsContent>
                        ))}
                      </Tabs>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Payment Options */}
            <div className="space-y-6">
              {/* Tip Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Tip Amount
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[15, 18, 20, 25].map((percentage) => (
                      <Button
                        key={percentage}
                        variant={tipPercentage === percentage ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setTipPercentage(percentage);
                          setCustomTip("");
                        }}
                      >
                        {percentage}%
                      </Button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="custom-tip">Custom Amount</Label>
                    <Input
                      id="custom-tip"
                      type="number"
                      placeholder="0.00"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard className="h-4 w-4" />
                        Card
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                        <Banknote className="h-4 w-4" />
                        Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mobile" id="mobile" />
                      <Label htmlFor="mobile" className="flex items-center gap-2 cursor-pointer">
                        <Smartphone className="h-4 w-4" />
                        Mobile Pay
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Process Payment */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        ${selectedBill?.total.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                    </div>
                    
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={processPayment}
                      disabled={paymentProcessing}
                    >
                      {paymentProcessing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <CreditCard className="h-4 w-4 mr-2" />
                      )}
                      {paymentProcessing ? "Processing..." : "Process Payment"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Receipt Modal */}
        <Dialog open={showReceipt} onOpenChange={setShowReceipt}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Payment Successful
              </DialogTitle>
              <DialogDescription>
                Transaction completed for Table {selectedTable}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">
                    ${selectedBill?.total.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Paid via {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={printReceipt}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                
                <Button
                  className="flex-1"
                  onClick={resetPayment}
                >
                  New Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </div>
  );
}