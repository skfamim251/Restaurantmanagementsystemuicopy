import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UserPlus, Users, Phone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useRestaurant } from '../contexts/RestaurantContext';

export function AddWaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { addToWaitlist } = useRestaurant();
  
  const [formData, setFormData] = useState({
    partyName: '',
    partySize: 2,
    phoneNumber: ''
  });

  const handleAddToWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partyName.trim()) {
      toast.error('Please enter a party name');
      return;
    }

    if (formData.partySize < 1 || formData.partySize > 20) {
      toast.error('Party size must be between 1 and 20');
      return;
    }

    setIsLoading(true);

    try {
      await addToWaitlist({
        partyName: formData.partyName.trim(),
        customerName: formData.partyName.trim(),
        customerPhone: formData.phoneNumber.trim(),
        partySize: formData.partySize,
        status: 'waiting'
      });

      toast.success(`${formData.partyName} party added to waitlist`);
      setIsOpen(false);
      setFormData({
        partyName: '',
        partySize: 2,
        phoneNumber: ''
      });
    } catch (error: any) {
      console.error('Add to waitlist error:', error);
      toast.error(error.message || 'Failed to add to waitlist');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add to Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Add Party to Waitlist</DialogTitle>
              <DialogDescription>
                Enter customer details to add them to the waiting list
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleAddToWaitlist} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="party-name">Party Name *</Label>
            <Input
              id="party-name"
              type="text"
              placeholder="Enter customer name"
              value={formData.partyName}
              onChange={(e) => setFormData(prev => ({ ...prev, partyName: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="party-size">Party Size *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  partySize: Math.max(1, prev.partySize - 1) 
                }))}
                disabled={formData.partySize <= 1}
              >
                -
              </Button>
              <Input
                id="party-size"
                type="number"
                min="1"
                max="20"
                value={formData.partySize}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  partySize: parseInt(e.target.value) || 1 
                }))}
                className="text-center"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setFormData(prev => ({ 
                  ...prev, 
                  partySize: Math.min(20, prev.partySize + 1) 
                }))}
                disabled={formData.partySize >= 20}
              >
                +
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Number of guests (1-20)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number (Optional)</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone-number"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phoneNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              For notifications when table is ready
            </p>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              The customer will be added to the end of the waitlist. Estimated wait time will be calculated based on current occupancy.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add to Waitlist'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
