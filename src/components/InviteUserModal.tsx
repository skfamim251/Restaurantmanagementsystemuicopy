import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserPlus, User, ChefHat, Crown, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type UserRole = 'customer' | 'staff' | 'owner';

interface InviteUserModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function InviteUserModal({ isOpen: externalIsOpen, onOpenChange: externalOnOpenChange }: InviteUserModalProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Use external state if provided, otherwise use internal state
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalOnOpenChange || setInternalIsOpen;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff' as UserRole
  });

  const roleIcons = {
    customer: User,
    staff: ChefHat,
    owner: Crown
  };

  const roleDescriptions = {
    customer: 'Browse menu, manage cart, and place orders',
    staff: 'Manage kitchen, tables, and customer service',
    owner: 'Full access to analytics and system management'
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      // Get current access token
      const accessToken = localStorage.getItem('supabase.auth.token');
      
      if (!accessToken) {
        toast.error('You must be logged in to create accounts');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4a129884/auth/invite`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to invite user');
      }

      toast.success(`Successfully created ${formData.role} account for ${formData.name}`);
      setIsOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff'
      });
    } catch (error: any) {
      console.error('Invite error:', error);
      toast.error(error.message || 'Failed to invite user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Invite User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Create staff or owner accounts with secure access
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleInvite} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="invite-name">Full Name</Label>
            <Input
              id="invite-name"
              type="text"
              placeholder="Enter full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-password">Initial Password</Label>
            <Input
              id="invite-password"
              type="password"
              placeholder="Create initial password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <p className="text-xs text-muted-foreground">
              Minimum 6 characters. User can change this later.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleDescriptions).map(([role, description]) => {
                  const Icon = roleIcons[role as UserRole];
                  return (
                    <SelectItem key={role} value={role}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <div>
                          <div className="font-medium capitalize">{role}</div>
                          <div className="text-xs text-muted-foreground">{description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-muted/50 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground">
              <Shield className="w-3 h-3 inline mr-1" />
              Only owners can create staff and owner accounts. The invited user will be able to log in immediately with the provided credentials.
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
              {isLoading ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
