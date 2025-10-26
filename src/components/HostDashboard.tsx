import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
// Simple toast function for demo purposes
const toast = (message: string) => {
  // Create a temporary toast element
  const toastEl = document.createElement('div');
  toastEl.textContent = message;
  toastEl.className = 'fixed top-4 right-4 bg-card text-card-foreground px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    document.body.removeChild(toastEl);
  }, 3000);
};

interface Table {
  id: string;
  number: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  capacity: number;
  seatedAt?: string | null;
  partyName?: string;
  partySize?: number;
}

interface WaitlistEntry {
  id: string;
  partyName: string;
  partySize: number;
  createdAt: string;
}

interface Stats {
  occupancyRate: number;
  averageWaitTime: number;
}

export function HostDashboard() {
  const [tables, setTables] = useState<Table[]>([
    { id: '1', number: 1, status: 'available', capacity: 2 },
    { id: '2', number: 2, status: 'occupied', capacity: 4, seatedAt: new Date(Date.now() - 45 * 60000).toISOString(), partyName: 'Johnson', partySize: 4 },
    { id: '3', number: 3, status: 'reserved', capacity: 6, partyName: 'Williams', partySize: 5 },
    { id: '4', number: 4, status: 'available', capacity: 2 },
    { id: '5', number: 5, status: 'cleaning', capacity: 4 },
    { id: '6', number: 6, status: 'occupied', capacity: 8, seatedAt: new Date(Date.now() - 30 * 60000).toISOString(), partyName: 'Brown', partySize: 6 },
    { id: '7', number: 7, status: 'available', capacity: 2 },
    { id: '8', number: 8, status: 'available', capacity: 4 },
    { id: '9', number: 9, status: 'reserved', capacity: 4, partyName: 'Davis', partySize: 3 },
    { id: '10', number: 10, status: 'occupied', capacity: 6, seatedAt: new Date(Date.now() - 20 * 60000).toISOString(), partyName: 'Miller', partySize: 4 }
  ]);

  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    { id: '1', partyName: 'Smith', partySize: 3, createdAt: new Date(Date.now() - 15 * 60000).toISOString() },
    { id: '2', partyName: 'Anderson', partySize: 2, createdAt: new Date(Date.now() - 25 * 60000).toISOString() },
    { id: '3', partyName: 'Garcia', partySize: 5, createdAt: new Date(Date.now() - 10 * 60000).toISOString() }
  ]);

  const [stats, setStats] = useState<Stats>({
    occupancyRate: 0,
    averageWaitTime: 0
  });

  useEffect(() => {
    // Calculate occupancy rate
    const occupiedTables = tables.filter(t => t.status === 'occupied' || t.status === 'reserved').length;
    const occupancyRate = Math.round((occupiedTables / tables.length) * 100);
    
    // Calculate average wait time
    const totalWaitTime = waitlist.reduce((sum, entry) => {
      return sum + Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60));
    }, 0);
    const averageWaitTime = waitlist.length > 0 ? Math.round(totalWaitTime / waitlist.length) : 0;

    setStats({ occupancyRate, averageWaitTime });
  }, [tables, waitlist]);

  const updateTableStatus = (tableId: string, newStatus: 'available' | 'occupied' | 'reserved' | 'cleaning') => {
    setTables(prevTables => 
      prevTables.map(table => {
        if (table.id === tableId) {
          const updates: Partial<Table> = { status: newStatus };
          
          // Set seatedAt timestamp when marking as occupied
          if (newStatus === "occupied") {
            updates.seatedAt = new Date().toISOString();
          } else if (newStatus === "available") {
            updates.seatedAt = null;
            updates.partyName = undefined;
            updates.partySize = undefined;
          }

          return { ...table, ...updates };
        }
        return table;
      })
    );
    
    toast(`Table ${tables.find(t => t.id === tableId)?.number} status changed to ${newStatus}`);
  };

  const removeFromWaitlist = (entryId: string) => {
    const entry = waitlist.find(w => w.id === entryId);
    setWaitlist(prevWaitlist => prevWaitlist.filter(w => w.id !== entryId));
    toast(`${entry?.partyName} party seated and removed from waitlist`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'occupied':
        return 'bg-red-500';
      case 'reserved':
        return 'bg-amber-500';
      case 'cleaning':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
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

  return (
    <div className="max-w-7xl mx-auto p-6" data-testid="host-dashboard">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Host Dashboard</h1>
          <p className="text-muted-foreground">Table management and seating overview</p>
        </div>
        <div className="flex space-x-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-muted-foreground">Current Occupancy</div>
            <div className="text-2xl font-bold text-foreground" data-testid="occupancy-rate">
              {stats?.occupancyRate || 0}%
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-muted-foreground">Avg Wait Time</div>
            <div className="text-2xl font-bold text-secondary" data-testid="avg-wait-time">
              {stats?.averageWaitTime || 0} min
            </div>
          </Card>
        </div>
      </div>

      {/* Table Layout Grid */}
      <Card className="mb-6 shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Restaurant Floor Plan</h2>
            <div className="flex space-x-4 text-sm">
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

          {/* Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="table-grid">
            {tables
              .sort((a, b) => a.number - b.number)
              .map((table) => (
                <Card key={table.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="text-center space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Table {table.number}</h3>
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
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Button
                        size="sm"
                        variant={table.status === 'available' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'available')}
                        className="text-xs"
                      >
                        Available
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'occupied' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'occupied')}
                        className="text-xs"
                      >
                        Occupied
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'reserved' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'reserved')}
                        className="text-xs"
                      >
                        Reserved
                      </Button>
                      <Button
                        size="sm"
                        variant={table.status === 'cleaning' ? 'default' : 'outline'}
                        onClick={() => updateTableStatus(table.id, 'cleaning')}
                        className="text-xs"
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

      {/* Waitlist Section */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Current Waitlist</h3>
          <div className="space-y-3" data-testid="waitlist">
            {waitlist.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No parties currently waiting</p>
            ) : (
              waitlist.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center p-3 bg-muted rounded-md"
                  data-testid={`waitlist-entry-${entry.id}`}
                >
                  <div>
                    <div className="font-medium">
                      {entry.partyName} Party ({entry.partySize})
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Waiting {Math.floor((Date.now() - new Date(entry.createdAt).getTime()) / (1000 * 60))} minutes
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => removeFromWaitlist(entry.id)}
                    data-testid={`button-seat-${entry.id}`}
                  >
                    Seat Now
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
