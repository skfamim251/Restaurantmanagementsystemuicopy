import React, { useState } from 'react';
import { Check, ChevronRight, Building, Utensils, Users, Table } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    openingTime: '09:00',
    closingTime: '22:00',
    taxRate: 0.08,
    serviceCharge: 0.10,
  });

  const [tableCount, setTableCount] = useState(10);
  const [menuItemsCount, setMenuItemsCount] = useState(0);
  const [staffInvited, setStaffInvited] = useState(false);

  const steps: OnboardingStep[] = [
    {
      id: 'restaurant',
      title: 'Restaurant Information',
      description: 'Set up your basic restaurant details',
      icon: <Building className="w-6 h-6" />,
      completed: !!restaurantInfo.name,
    },
    {
      id: 'tables',
      title: 'Table Setup',
      description: 'Configure your dining area',
      icon: <Table className="w-6 h-6" />,
      completed: tableCount > 0,
    },
    {
      id: 'menu',
      title: 'Menu Setup',
      description: 'Add your first menu items',
      icon: <Utensils className="w-6 h-6" />,
      completed: menuItemsCount > 0,
    },
    {
      id: 'staff',
      title: 'Invite Staff',
      description: 'Add your team members',
      icon: <Users className="w-6 h-6" />,
      completed: staffInvited,
    },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleSaveRestaurantInfo = async () => {
    if (isLoading) return;
    
    console.log('Saving restaurant info:', restaurantInfo);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${api.API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          restaurantName: restaurantInfo.name,
          openingTime: restaurantInfo.openingTime,
          closingTime: restaurantInfo.closingTime,
          taxRate: restaurantInfo.taxRate,
          serviceCharge: restaurantInfo.serviceCharge,
        }),
      });

      console.log('Settings response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Settings error:', errorData);
        throw new Error(errorData.error || 'Failed to save settings');
      }

      const data = await response.json();
      console.log('Settings saved successfully:', data);
      
      toast.success('Restaurant information saved');
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      console.error('Error saving restaurant info:', error);
      toast.error(error.message || 'Failed to save restaurant information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupTables = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Create default tables
      const tablePromises = [];
      for (let i = 1; i <= tableCount; i++) {
        tablePromises.push(
          api.createTable({
            number: i,
            capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
            status: 'available',
            position: { x: 0, y: 0 },
          })
        );
      }
      await Promise.all(tablePromises);
      
      toast.success(`${tableCount} tables created`);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Error creating tables:', error);
      toast.error('Failed to create tables');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleComplete = async () => {
    try {
      // Mark onboarding as complete
      await fetch(`${api.API_BASE_URL}/onboarding/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          onboardingComplete: true,
          steps: {
            restaurantInfo: true,
            tableSetup: true,
            menuSetup: menuItemsCount > 0,
            staffInvited: staffInvited,
          },
        }),
      });

      toast.success('Welcome to RestaurantOS!');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurantName">Restaurant Name</Label>
              <Input
                id="restaurantName"
                value={restaurantInfo.name}
                onChange={(e) =>
                  setRestaurantInfo({ ...restaurantInfo, name: e.target.value })
                }
                placeholder="Enter your restaurant name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openingTime">Opening Time</Label>
                <Input
                  id="openingTime"
                  type="time"
                  value={restaurantInfo.openingTime}
                  onChange={(e) =>
                    setRestaurantInfo({ ...restaurantInfo, openingTime: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="closingTime">Closing Time</Label>
                <Input
                  id="closingTime"
                  type="time"
                  value={restaurantInfo.closingTime}
                  onChange={(e) =>
                    setRestaurantInfo({ ...restaurantInfo, closingTime: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={restaurantInfo.taxRate * 100}
                  onChange={(e) =>
                    setRestaurantInfo({
                      ...restaurantInfo,
                      taxRate: parseFloat(e.target.value) / 100,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="serviceCharge">Service Charge (%)</Label>
                <Input
                  id="serviceCharge"
                  type="number"
                  step="0.01"
                  value={restaurantInfo.serviceCharge * 100}
                  onChange={(e) =>
                    setRestaurantInfo({
                      ...restaurantInfo,
                      serviceCharge: parseFloat(e.target.value) / 100,
                    })
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleSaveRestaurantInfo}
              className="w-full bg-terracotta hover:bg-terracotta-dark"
              disabled={!restaurantInfo.name || isLoading}
            >
              {isLoading ? 'Saving...' : 'Continue'}
              {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
            </Button>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tableCount">Number of Tables</Label>
              <Input
                id="tableCount"
                type="number"
                min="1"
                max="50"
                value={tableCount}
                onChange={(e) => setTableCount(parseInt(e.target.value) || 0)}
              />
              <p className="text-sm text-gray-500 mt-1">
                You can adjust table capacities and positions later
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSetupTables}
                className="flex-1 bg-terracotta hover:bg-terracotta-dark"
                disabled={tableCount < 1 || isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Tables'}
                {!isLoading && <ChevronRight className="w-4 h-4 ml-2" />}
              </Button>
              <Button onClick={handleSkipStep} variant="outline" disabled={isLoading}>
                Skip
              </Button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              You can add menu items now or skip this step and add them later from the Menu
              Management page.
            </p>

            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <p className="text-sm">
                <strong>Tip:</strong> We recommend adding at least 5-10 menu items to get
                started. You can always add more later!
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="flex-1 bg-terracotta hover:bg-terracotta-dark"
              >
                Go to Menu Management
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={handleSkipStep} variant="outline">
                Skip for Now
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Invite your staff members to join RestaurantOS. You can do this now or later
              from the Settings page.
            </p>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm">
                <strong>Staff Roles:</strong>
                <br />
                • Staff members can access Kitchen and Host dashboards
                <br />• You can invite multiple staff members with unique accounts
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleComplete}
                className="flex-1 bg-terracotta hover:bg-terracotta-dark"
              >
                Complete Setup
                <Check className="w-4 h-4 ml-2" />
              </Button>
              <Button onClick={handleComplete} variant="outline">
                Skip & Finish
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">
            Welcome to RestaurantOS
          </CardTitle>
          <p className="text-center text-gray-600 dark:text-gray-400">
            Let's get your restaurant set up in a few simple steps
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          {/* Steps Overview */}
          <div className="grid grid-cols-4 gap-2">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`text-center p-3 rounded-lg transition-colors ${
                  index === currentStep
                    ? 'bg-terracotta text-white'
                    : index < currentStep
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                }`}
              >
                <div className="flex justify-center mb-1">
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.icon
                  )}
                </div>
                <p className="text-xs truncate">{step.title}</p>
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="min-h-[300px]">
            <div className="mb-6">
              <h3 className="mb-1">{steps[currentStep].title}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </div>

            {renderStepContent()}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
