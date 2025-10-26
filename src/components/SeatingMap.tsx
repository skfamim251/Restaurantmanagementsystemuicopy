import { motion } from "motion/react";
import { Users, Clock, CheckCircle, Utensils, Sparkles } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useState } from "react";

interface Table {
  id: string;
  number: number;
  seats: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  customerName?: string;
  timeOccupied?: number;
  estimatedWait?: number;
  shape: "round" | "square";
  position: { x: number; y: number };
}

export function SeatingMap() {
  const [tables] = useState<Table[]>([
    { id: "1", number: 1, seats: 2, status: "occupied", customerName: "Johnson", timeOccupied: 45, shape: "round", position: { x: 10, y: 10 } },
    { id: "2", number: 2, seats: 4, status: "available", shape: "square", position: { x: 40, y: 10 } },
    { id: "3", number: 3, seats: 6, status: "reserved", customerName: "Williams", estimatedWait: 15, shape: "round", position: { x: 70, y: 10 } },
    { id: "4", number: 4, seats: 2, status: "cleaning", shape: "square", position: { x: 10, y: 40 } },
    { id: "5", number: 5, seats: 4, status: "occupied", customerName: "Davis", timeOccupied: 20, shape: "square", position: { x: 40, y: 40 } },
    { id: "6", number: 6, seats: 8, status: "available", shape: "round", position: { x: 70, y: 40 } },
    { id: "7", number: 7, seats: 2, status: "reserved", customerName: "Brown", estimatedWait: 30, shape: "round", position: { x: 10, y: 70 } },
    { id: "8", number: 8, seats: 4, status: "occupied", customerName: "Taylor", timeOccupied: 60, shape: "square", position: { x: 40, y: 70 } },
    { id: "9", number: 9, seats: 2, status: "available", shape: "round", position: { x: 70, y: 70 } },
  ]);

  const getTableStatusConfig = (status: Table["status"]) => {
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

  const statusCounts = {
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
    cleaning: tables.filter(t => t.status === "cleaning").length,
  };

  const totalSeats = tables.reduce((sum, table) => sum + table.seats, 0);
  const occupiedSeats = tables
    .filter(t => t.status === "occupied" || t.status === "reserved")
    .reduce((sum, table) => sum + table.seats, 0);
  const occupancyRate = Math.round((occupiedSeats / totalSeats) * 100);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="mb-2 text-foreground">Restaurant Floor Plan</h1>
          <p className="text-muted-foreground mb-8">Real-time table status and occupancy</p>
        </motion.div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 bg-card border-border shadow-sm rounded-2xl">
              <div className="text-2xl font-bold text-primary mb-1">
                {occupancyRate}%
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
                <div className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                  {stat.count}
                </div>
                <div className="text-muted-foreground text-sm">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Floor Plan */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-card border-border shadow-lg rounded-2xl">
              <h3 className="text-foreground mb-6">Floor Plan</h3>
              <div className="relative bg-muted/20 rounded-xl p-8 min-h-[500px]">
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
                        relative p-4 border-2 bg-card shadow-lg hover:shadow-xl transition-all duration-200
                        ${table.shape === "round" ? "rounded-full w-20 h-20" : "rounded-xl w-20 h-16"}
                        ${statusConfig.borderColor}
                      `}>
                        <div className="text-center">
                          <div className="font-bold text-foreground text-sm">
                            {table.number}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {table.seats} seats
                          </div>
                        </div>
                        
                        <div className={`
                          absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center
                          ${statusConfig.color}
                        `}>
                          <StatusIcon className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Legend */}
                <div className="absolute bottom-4 right-4 bg-card p-4 rounded-xl shadow-lg border border-border">
                  <div className="text-sm font-medium text-foreground mb-3">Status Legend</div>
                  <div className="space-y-2">
                    {[
                      { status: "available", label: "Available" },
                      { status: "occupied", label: "Occupied" },
                      { status: "reserved", label: "Reserved" },
                      { status: "cleaning", label: "Cleaning" },
                    ].map((item) => {
                      const config = getTableStatusConfig(item.status as Table["status"]);
                      const Icon = config.icon;
                      return (
                        <div key={item.status} className="flex items-center space-x-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${config.color}`}>
                            <Icon className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-xs text-muted-foreground">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Table Details */}
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
                          <div className="text-sm text-muted-foreground">{table.seats} seats</div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <Badge className={`${statusConfig.color} text-white rounded-full mb-1`}>
                          {statusConfig.text}
                        </Badge>
                        {table.customerName && (
                          <div className="text-xs text-muted-foreground">{table.customerName}</div>
                        )}
                        {table.timeOccupied && (
                          <div className="text-xs text-muted-foreground">{table.timeOccupied}m occupied</div>
                        )}
                        {table.estimatedWait && (
                          <div className="text-xs text-muted-foreground">Est. {table.estimatedWait}m</div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}