import React, { useState } from 'react';
import { Printer, Receipt, UtensilsCrossed } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface PrintManagerProps {
  orderId: string;
  type: 'receipt' | 'kitchen';
}

export function PrintManager({ orderId, type }: PrintManagerProps) {
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  const handlePrint = async () => {
    try {
      setLoading(true);
      
      const endpoint = type === 'receipt' 
        ? `/print/receipt/${orderId}`
        : `/print/kitchen-ticket/${orderId}`;

      const response = await fetch(`${api.API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      });

      if (!response.ok) throw new Error('Failed to generate print data');

      const data = await response.json();
      setPrintData(type === 'receipt' ? data.receipt : data.ticket);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error generating print data:', error);
      toast.error('Failed to generate print data');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintWindow = () => {
    window.print();
    toast.success('Printing...');
  };

  return (
    <>
      <Button
        onClick={handlePrint}
        disabled={loading}
        size="sm"
        variant="outline"
      >
        <Printer className="w-4 h-4 mr-2" />
        {type === 'receipt' ? 'Print Receipt' : 'Print Kitchen Ticket'}
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {type === 'receipt' ? 'Receipt Preview' : 'Kitchen Ticket Preview'}
            </DialogTitle>
          </DialogHeader>

          {printData && (
            <div className="print-preview">
              {type === 'receipt' ? (
                <ReceiptPreview data={printData} />
              ) : (
                <KitchenTicketPreview data={printData} />
              )}

              <div className="mt-4 flex gap-2 no-print">
                <Button onClick={handlePrintWindow} className="flex-1">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button onClick={() => setPreviewOpen(false)} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReceiptPreview({ data }: { data: any }) {
  return (
    <div className="receipt-content p-6 bg-white text-black font-mono text-sm">
      <div className="text-center mb-4">
        <h2 className="text-lg mb-1">{data.restaurantName}</h2>
        <p className="text-xs">Thank you for dining with us!</p>
      </div>

      <div className="border-t border-b border-dashed border-gray-400 py-2 my-2">
        <div className="flex justify-between text-xs">
          <span>Order: {data.orderId.substring(0, 8)}</span>
          <span>Table: {data.tableNumber}</span>
        </div>
        <div className="text-xs">
          {new Date(data.createdAt).toLocaleString()}
        </div>
      </div>

      <div className="my-4">
        {data.items.map((item: any, index: number) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <span>{item.quantity}x {item.name}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
            {item.modifiers && item.modifiers.length > 0 && (
              <div className="text-xs text-gray-600 ml-4">
                {item.modifiers.map((mod: any, i: number) => (
                  <div key={i}>+ {mod.name}</div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-400 pt-2 space-y-1">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${data.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>${data.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-400 pt-1 mt-1">
          <span>Total:</span>
          <span>${data.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mt-4 text-xs">
        <p>Visit us again!</p>
      </div>
    </div>
  );
}

function KitchenTicketPreview({ data }: { data: any }) {
  return (
    <div className="kitchen-ticket-content p-6 bg-white text-black font-mono">
      <div className="text-center mb-4">
        <h2 className="text-xl">KITCHEN ORDER</h2>
      </div>

      <div className="border-t border-b border-gray-800 py-2 my-2">
        <div className="flex justify-between">
          <span>Table: <strong>{data.tableNumber}</strong></span>
          <span>Order: {data.orderId.substring(0, 8)}</span>
        </div>
        <div className="text-sm">
          {new Date(data.createdAt).toLocaleTimeString()}
        </div>
      </div>

      <div className="my-4">
        {data.items.map((item: any, index: number) => (
          <div key={index} className="mb-3 pb-3 border-b border-gray-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <span className="text-lg">
                  <strong>{item.quantity}x</strong> {item.name}
                </span>
                {item.modifiers && item.modifiers.length > 0 && (
                  <div className="ml-4 mt-1 text-sm">
                    {item.modifiers.map((mod: any, i: number) => (
                      <div key={i} className="text-red-600">
                        ★ {mod.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {item.prepTime} min
              </div>
            </div>
            {item.category && (
              <div className="text-xs text-gray-600 mt-1">
                [{item.category}]
              </div>
            )}
          </div>
        ))}
      </div>

      {data.specialInstructions && (
        <div className="border-t border-gray-800 pt-2 mt-2">
          <p className="text-sm">
            <strong>Special Instructions:</strong>
          </p>
          <p className="text-red-600">{data.specialInstructions}</p>
        </div>
      )}

      <div className="text-center mt-4 pt-2 border-t border-gray-800">
        <p className="text-sm">Status: <strong>{data.status.toUpperCase()}</strong></p>
      </div>
    </div>
  );
}

// Inline print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .print-preview, .print-preview * {
      visibility: visible;
    }
    .print-preview {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    .receipt-content, .kitchen-ticket-content {
      max-width: 80mm;
      margin: 0 auto;
    }
  }
`;

// Inject print styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = printStyles;
  document.head.appendChild(styleElement);
}
