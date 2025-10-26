import { motion } from "motion/react";
import { Users, Clock, CheckCircle, Utensils, Sparkles, UserCheck } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { useRestaurant } from "../contexts/RestaurantContext";
import { TableOrderManager } from "./TableOrderManager";
import { AddWaitlistModal } from "./AddWaitlistModal";

// Simple toast function for demo purposes
const toast = (message: string) => {
  const toastEl = document.createElement('div');
  toastEl.textContent = message;
  toastEl.className = 'fixed top-4 right-4 bg-card text-card-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    document.body.removeChild(toastEl);
  }, 3000);
};

export function Host() {
  const { 
    tables,
    waitlist,
    stats,
    isLoadingTables,
    updateTableStatus, 
    removeFromWaitlist
  } = useRestaurant();

  const handleUpdateTableStatus = (tableId: string, newStatus: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    updateTableStatus(tableId, newStatus);
    const table = tables.find(t => t.id === tableId);
    toast(`Table ${table?.number} status changed to ${newStatus}`);
  };

  const handleRemoveFromWaitlist = (entryId: string) => {
    const entry = waitlist.find(w => w.id === entryId);
    removeFromWaitlist(entryId);
    toast(`${entry?.partyName} party seated and removed from waitlist`);
  };

  const getTableStatusConfig = (status: string) => {
    switch (status) {
      case "available":
        return {
          color: "bg-[var(--status-available)]",
          borderColor: "border-[var(--status-available)]",
          icon: CheckCircle,
          text: "Available",
          textColor: "text-[var(--status-available)]"
        };
      case "occupied":
        return {
          color: "bg-[var(--status-occupied)]",
          borderColor: "border-[var(--status-occupied)]",
          icon: Users,
          text: "Occupied",
          textColor: "text-[var(--status-occupied)]"
        };
      case "reserved":
        return {
          color: "bg-[var(--status-reserved)]",
          borderColor: "border-[var(--status-reserved)]",
          icon: Clock,
          text: "Reserved",
          textColor: "text-[var(--status-reserved)]"
        };
      case "cleaning":
        return {
          color: "bg-[var(--status-cleaning)]",
          borderColor: "border-[var(--status-cleaning)]",
          icon: Sparkles,
          text: "Cleaning",
          textColor: "text-[var(--status-cleaning)]"
        };
      default:
        return {
          color: "bg-muted",
          borderColor: "border-muted",
          icon: CheckCircle,
          text: "Unknown",
          textColor: "text-muted-foreground"
        };
    }
  };

  const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'available':
        return 'default';
      case 'occupied':
        return 'destructive';
      case 'reserved':
        return 'secondary';
      case 'cleaning':
        return 'outline';
      default:
        return 'default';
    }
  };

  const statusCounts = {
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
    cleaning: tables.filter(t => t.status === "cleaning").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-foreground">Host Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">Table management, seating overview, and waitlist</p>
            </div>
            <div className="flex gap-3">
              <Card className="flex-1 md:flex-none px-4 py-2">
                <div className="text-xs md:text-sm text-muted-foreground">Current Occupancy</div>
                <div className="font-bold text-primary">
                  {stats.occupancyRate}%
                </div>
              </Card>
              <Card className="flex-1 md:flex-none px-4 py-2">
                <div className="text-xs md:text-sm text-muted-foreground">Est. Wait Time</div>
                <div className="font-bold text-primary">
                  {stats.estimatedWaitTime}m
                </div>
              </Card>
            </div>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
                <div className="font-bold text-primary mb-1">
                  {stats.occupancyRate}%
                </div>
                <div className="text-muted-foreground text-sm">Occupancy Rate</div>
              </Card>
            </motion.div>

            {[
              { status: "available", count: statusCounts.available, label: "Available", color: "text-[var(--status-available)]" },
              { status: "occupied", count: statusCounts.occupied, label: "Occupied", color: "text-[var(--status-occupied)]" },
              { status: "reserved", count: statusCounts.reserved, label: "Reserved", color: "text-[var(--status-reserved)]" },
              { status: "cleaning", count: statusCounts.cleaning, label: "Cleaning", color: "text-[var(--status-cleaning)]" },
            ].map((stat, index) => (
              <motion.div
                key={stat.status}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
                  <div className="font-bold mb-1" style={{ color: stat.color }}>
                    {stat.count}
                  </div>
                  <div className="text-muted-foreground text-sm">{stat.label}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <Tabs defaultValue="floorplan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-8">
            <TabsTrigger value="floorplan" className="text-xs md:text-sm">Floor Plan</TabsTrigger>
            <TabsTrigger value="management" className="text-xs md:text-sm">Management</TabsTrigger>
            <TabsTrigger value="orders" className="text-xs md:text-sm">Orders</TabsTrigger>
            <TabsTrigger value="waitlist" className="text-xs md:text-sm">Waitlist</TabsTrigger>
          </TabsList>

          <TabsContent value="floorplan" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Interactive Floor Plan */}
              <div className="lg:col-span-2">
                <Card className="p-4 sm:p-6 lg:p-8 bg-card border-border shadow-lg rounded-2xl">
                  <h3 className="text-foreground mb-4 sm:mb-6">Interactive Floor Plan</h3>
                  <div className="relative bg-muted/20 rounded-xl p-4 sm:p-6 lg:p-8 min-h-[400px] sm:min-h-[500px] overflow-hidden">
                    {tables.map((table, index) => {
                      const statusConfig = getTableStatusConfig(table.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={table.id}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 * index, duration: 0.3 }}
                          whileHover={{ scale: 1.05 }}
                          className="absolute cursor-pointer"
                          style={{ 
                            left: `${table.position.x}%`, 
                            top: `${table.position.y}%`,
                            transform: "translate(-50%, -50%)"
                          }}
                        >
                          <div className={`
                            relative border-2 bg-card shadow-lg hover:shadow-xl transition-all duration-200
                            ${table.shape === "round" 
                              ? "rounded-full w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 p-1.5 sm:p-2 lg:p-3" 
                              : "rounded-xl w-16 h-12 sm:w-18 sm:h-14 lg:w-20 lg:h-16 p-1.5 sm:p-2 lg:p-3"}
                            ${statusConfig.borderColor}
                          `}>
                            <div className="text-center flex flex-col items-center justify-center h-full">
                              <div className="font-bold text-foreground text-[10px] sm:text-xs lg:text-sm leading-tight">
                                {table.number}
                              </div>
                              <div className="text-[8px] sm:text-[9px] lg:text-xs text-muted-foreground leading-tight hidden sm:block">
                                {table.capacity}
                              </div>
                            </div>
                            
                            <div className={`
                              absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 lg:-top-2 lg:-right-2 
                              w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 
                              rounded-full flex items-center justify-center
                              ${statusConfig.color}
                            `}>
                              <StatusIcon className="h-2 w-2 sm:h-2.5 sm:w-2.5 lg:h-3 lg:w-3 text-white" />
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}

                    {/* Legend */}
                    <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 lg:bottom-4 lg:right-4 bg-card p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl shadow-lg border border-border">
                      <div className="text-[10px] sm:text-xs lg:text-sm font-medium text-foreground mb-1.5 sm:mb-2 lg:mb-3">Legend</div>
                      <div className="space-y-1 sm:space-y-1.5 lg:space-y-2">
                        {[
                          { status: "available", label: "Available" },
                          { status: "occupied", label: "Occupied" },
                          { status: "reserved", label: "Reserved" },
                          { status: "cleaning", label: "Cleaning" },
                        ].map((item) => {
                          const config = getTableStatusConfig(item.status);
                          const Icon = config.icon;
                          return (
                            <div key={item.status} className="flex items-center space-x-1 sm:space-x-1.5 lg:space-x-2">
                              <div className={`w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full flex items-center justify-center ${config.color}`}>
                                <Icon className="h-1.5 w-1.5 sm:h-2 sm:w-2 text-white" />
                              </div>
                              <span className="text-[9px] sm:text-[10px] lg:text-xs text-muted-foreground whitespace-nowrap">{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Table Details Sidebar */}
              <div>
                <Card className="p-6 bg-card border-border shadow-lg rounded-2xl">
                  <h3 className="text-foreground mb-6">Table Details</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto">
                    {tables.map((table, index) => {
                      const statusConfig = getTableStatusConfig(table.status);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <motion.div
                          key={table.id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.05 * index }}
                          className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${statusConfig.color}`}>
                              <StatusIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">Table {table.number}</div>
                              <div className="text-sm text-muted-foreground">{table.capacity} seats</div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge className={`${statusConfig.color} text-white rounded-full mb-1`}>
                              {statusConfig.text}
                            </Badge>
                            {table.partyName && (
                              <div className="text-xs text-muted-foreground">{table.partyName}</div>
                            )}
                            {table.seatedAt && (
                              <div className="text-xs text-muted-foreground">
                                {Math.floor((Date.now() - new Date(table.seatedAt).getTime()) / (1000 * 60))}m occupied
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                  <h2 className="font-semibold text-foreground">Table Management</h2>
                  <div className="flex flex-wrap gap-3 md:gap-4 text-xs md:text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
                      <span>Reserved</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span>Cleaning</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="table-grid">
                  {tables
                    .sort((a, b) => a.number - b.number)
                    .map((table) => (
                      <Card key={table.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="text-center space-y-2">
                          <div className="flex justify-between items-center">
                            <h3 className="font-semibold">Table {table.number}</h3>
                            <Badge variant={getStatusBadgeVariant(table.status)} className="text-xs">
                              {table.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground">
                            Capacity: {table.capacity}
                          </div>
                          
                          {table.partyName && (
                            <div className="text-sm">
                              <div className="font-medium">{table.partyName}</div>
                              <div className="text-muted-foreground">Party of {table.partySize}</div>
                              {table.seatedAt && (
                                <div className="text-xs text-muted-foreground">
                                  Seated {Math.floor((Date.now() - new Date(table.seatedAt).getTime()) / (1000 * 60))}m ago
                                </div>
                              )}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-2 gap-2 mt-3">
                            <Button
                              size="sm"
                              variant={table.status === 'available' ? 'default' : 'outline'}
                              onClick={() => handleUpdateTableStatus(table.id, 'available')}
                              className="text-xs h-9"
                            >
                              Available
                            </Button>
                            <Button
                              size="sm"
                              variant={table.status === 'occupied' ? 'default' : 'outline'}
                              onClick={() => handleUpdateTableStatus(table.id, 'occupied')}
                              className="text-xs h-9"
                            >
                              Occupied
                            </Button>
                            <Button
                              size="sm"
                              variant={table.status === 'reserved' ? 'default' : 'outline'}
                              onClick={() => handleUpdateTableStatus(table.id, 'reserved')}
                              className="text-xs h-9"
                            >
                              Reserved
                            </Button>
                            <Button
                              size="sm"
                              variant={table.status === 'cleaning' ? 'default' : 'outline'}
                              onClick={() => handleUpdateTableStatus(table.id, 'cleaning')}
                              className="text-xs h-9"
                            >
                              Cleaning
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waitlist" className="space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold text-foreground">Current Waitlist</h3>
                    <Badge className="bg-primary text-primary-foreground">{waitlist.length}</Badge>
                  </div>
                  <AddWaitlistModal />
                </div>
                
                <div className="space-y-3" data-testid="waitlist">
                  {waitlist.length === 0 ? (
                    <div className="text-center py-8">
                      <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No parties currently waiting</p>
                    </div>
                  ) : (
                    waitlist.map((entry) => (
                      <motion.div
                        key={entry.id}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex justify-between items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                        data-testid={`waitlist-entry-${entry.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {entry.partyName || entry.customerName || 'Guest'} Party
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Party of {entry.partySize} • Waiting {Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60))} minutes
                            </div>
                            {entry.customerPhone && (
                              <div className="text-xs text-muted-foreground">
                                📞 {entry.customerPhone}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRemoveFromWaitlist(entry.id)}
                          data-testid={`button-seat-${entry.id}`}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          Seat Now
                        </Button>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <TableOrderManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}