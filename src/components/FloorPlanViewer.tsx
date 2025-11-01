import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Users, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useRestaurant, Table } from '../contexts/RestaurantContext';

interface FloorPlanViewerProps {
  showDetails?: boolean;
}

export function FloorPlanViewer({ showDetails = true }: FloorPlanViewerProps) {
  const { tables, stats } = useRestaurant();

  const getTableColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500 border-green-600';
      case 'occupied':
        return 'bg-red-500 border-red-600';
      case 'reserved':
        return 'bg-yellow-500 border-yellow-600';
      case 'cleaning':
        return 'bg-gray-400 border-gray-500';
      default:
        return 'bg-gray-300 border-gray-400';
    }
  };

  const getTableIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-white" />;
      case 'occupied':
        return <XCircle className="w-4 h-4 text-white" />;
      case 'reserved':
        return <Clock className="w-4 h-4 text-white" />;
      case 'cleaning':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return <MapPin className="w-4 h-4 text-white" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Group tables by position for better layout
  const maxX = Math.max(...tables.map(t => t.position.x), 800);
  const maxY = Math.max(...tables.map(t => t.position.y), 600);
  
  return (
    <div className="space-y-6">
      {showDetails && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {tables.filter(t => t.status === 'available').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Occupied</p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {tables.filter(t => t.status === 'occupied').length}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {tables.filter(t => t.status === 'reserved').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                    {stats.totalSeats}
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Restaurant Floor Plan</CardTitle>
              <CardDescription>
                Real-time table availability
              </CardDescription>
            </div>
            <Badge className="bg-primary">
              {stats.occupancyRate}% Occupied
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-8 border-2 border-dashed border-primary/30 min-h-[400px]">
            {/* Legend */}
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-border z-10">
              <p className="text-xs font-semibold mb-2">Legend</p>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-xs">Occupied</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-xs">Reserved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-gray-400" />
                  <span className="text-xs">Cleaning</span>
                </div>
              </div>
            </div>

            {/* Tables */}
            <div className="relative w-full h-full min-h-[350px]">
              {tables.map((table, index) => {
                const x = table.position.x || (index % 4) * 150 + 50;
                const y = table.position.y || Math.floor(index / 4) * 120 + 50;
                const size = table.capacity <= 2 ? 'w-16 h-16' : table.capacity <= 4 ? 'w-20 h-20' : 'w-24 h-24';

                return (
                  <motion.div
                    key={table.id}
                    className="absolute"
                    style={{ left: `${x}px`, top: `${y}px` }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.1, zIndex: 50 }}
                  >
                    <div className={`${size} relative group cursor-pointer`}>
                      {/* Table */}
                      <div
                        className={`w-full h-full ${
                          table.shape === 'round' ? 'rounded-full' : 'rounded-lg'
                        } ${getTableColor(table.status)} border-4 shadow-lg flex items-center justify-center transition-all`}
                      >
                        <div className="text-center">
                          <div className="flex justify-center mb-1">
                            {getTableIcon(table.status)}
                          </div>
                          <span className="text-white font-bold text-sm">
                            {table.number}
                          </span>
                        </div>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                          <p className="font-semibold">Table {table.number}</p>
                          <p className="text-gray-300">Capacity: {table.capacity}</p>
                          <p className="text-gray-300">Status: {getStatusLabel(table.status)}</p>
                          {table.partyName && (
                            <p className="text-gray-300">Party: {table.partyName}</p>
                          )}
                          {table.partySize && (
                            <p className="text-gray-300">Guests: {table.partySize}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>Hover over tables to see more details</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
