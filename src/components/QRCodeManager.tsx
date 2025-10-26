import React, { useState, useEffect } from 'react';
import { QrCode, Download, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface Table {
  id: string;
  number: number;
  capacity: number;
  status: string;
}

interface QRCode {
  tableId: string;
  code: string;
  expiresAt: string;
  createdAt: string;
}

export function QRCodeManager() {
  const [tables, setTables] = useState<Table[]>([]);
  const [qrCodes, setQrCodes] = useState<Record<string, QRCode>>({});
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const tablesData = await api.getTables();
      setTables(tablesData);
    } catch (error) {
      console.error('Error loading tables:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async (tableId: string) => {
    try {
      console.log('Generating QR code for table:', tableId);
      const response = await fetch(`${api.API_BASE_URL}/qr-codes/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({ tableId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('QR generation failed:', errorData);
        throw new Error(errorData.error || 'Failed to generate QR code');
      }

      const data = await response.json();
      console.log('QR code generated:', data);
      setQrCodes({ ...qrCodes, [tableId]: data.qrCode });
      toast.success('QR code generated successfully');
      return data.qrCode;
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      toast.error(error.message || 'Failed to generate QR code');
      return null;
    }
  };

  const handleGenerateQR = async (table: Table) => {
    setSelectedTable(table);
    const qr = await generateQRCode(table.id);
    if (qr) {
      setShowQRDialog(true);
    }
  };

  const downloadQRCode = (table: Table, qrCode: QRCode) => {
    // Generate QR code URL
    const baseUrl = window.location.origin;
    const qrUrl = `${baseUrl}/order?qr=${qrCode.code}`;
    
    // Use a QR code generation service
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(qrUrl)}`;
    
    // Create download link
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `table-${table.number}-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('QR code downloaded');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-terracotta dark:text-terracotta-light mb-2">QR Code Manager</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate QR codes for contactless ordering at each table
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Table {table.number}</span>
                  <QrCode className="w-5 h-5 text-terracotta" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Capacity: {table.capacity} guests</p>
                    <p>Status: <span className="capitalize">{table.status}</span></p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleGenerateQR(table)}
                      className="flex-1 bg-terracotta hover:bg-terracotta-dark"
                      size="sm"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR
                    </Button>
                    
                    {qrCodes[table.id] && (
                      <Button
                        onClick={() => downloadQRCode(table, qrCodes[table.id])}
                        variant="outline"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* QR Code Preview Dialog */}
        <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                QR Code for Table {selectedTable?.number}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTable && qrCodes[selectedTable.id] && (
              <div className="space-y-4">
                <div className="flex justify-center p-6 bg-white rounded-lg">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                      `${window.location.origin}/order?qr=${qrCodes[selectedTable.id].code}`
                    )}`}
                    alt={`QR Code for Table ${selectedTable.number}`}
                    className="w-64 h-64"
                  />
                </div>
                
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Scan this QR code to order from Table {selectedTable.number}
                  </p>
                  <p className="text-xs text-gray-500">
                    Expires: {new Date(qrCodes[selectedTable.id].expiresAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => downloadQRCode(selectedTable, qrCodes[selectedTable.id])}
                    className="flex-1 bg-terracotta hover:bg-terracotta-dark"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    onClick={() => handleGenerateQR(selectedTable)}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Regenerate
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
