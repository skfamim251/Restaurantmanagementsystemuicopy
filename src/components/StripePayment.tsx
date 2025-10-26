import React, { useState, useEffect } from 'react';
import { CreditCard, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface StripePaymentProps {
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripePayment({ orderId, amount, onSuccess, onCancel }: StripePaymentProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);

  // Card details (in a real app, use Stripe Elements)
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${api.API_BASE_URL}/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          amount,
          orderId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      toast.error(error.message || 'Failed to initialize payment');
      setPaymentStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientSecret || !paymentIntentId) {
      toast.error('Payment not initialized');
      return;
    }

    // Validate card details
    if (!cardNumber || !expiry || !cvc || !cardholderName) {
      toast.error('Please fill in all card details');
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus('processing');

      // In a real app, you would use Stripe.js to handle the card payment
      // For demo purposes, we'll simulate a successful payment
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Confirm payment
      const response = await fetch(`${api.API_BASE_URL}/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          paymentIntentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      setPaymentStatus('success');
      toast.success('Payment successful!');
      
      // Wait a moment before calling onSuccess
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      console.error('Payment error:', error);
      setPaymentStatus('error');
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (paymentStatus === 'success') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-green-600 dark:text-green-400">Payment Successful!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment of ${amount.toFixed(2)} has been processed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (paymentStatus === 'error') {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-red-600 dark:text-red-400">Payment Failed</h3>
            <p className="text-gray-600 dark:text-gray-400">
              There was an error processing your payment. Please try again.
            </p>
            <div className="flex gap-2">
              <Button onClick={createPaymentIntent} className="flex-1">
                Try Again
              </Button>
              <Button onClick={onCancel} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Details
        </CardTitle>
        <p className="text-gray-600 dark:text-gray-400">
          Total: ${amount.toFixed(2)}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input
              id="cardNumber"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                required
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123"
                maxLength={4}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-4 space-y-2">
            <Button
              type="submit"
              className="w-full bg-terracotta hover:bg-terracotta-dark"
              disabled={loading || !clientSecret}
            >
              {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="w-full"
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-center text-gray-500">
            <p>🔒 Secured by Stripe</p>
            <p className="mt-1">
              Demo mode: Use any valid card format for testing
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface StripePaymentDialogProps {
  open: boolean;
  orderId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripePaymentDialog({
  open,
  orderId,
  amount,
  onSuccess,
  onCancel,
}: StripePaymentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Complete Payment</DialogTitle>
        </DialogHeader>
        <StripePayment
          orderId={orderId}
          amount={amount}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
