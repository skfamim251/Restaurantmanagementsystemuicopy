import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Building, MapPin, Phone, Mail, Globe, ChefHat, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import * as api from '../utils/api';

interface TenantRegistrationProps {
  onComplete: (tenantData: any) => void;
  onBack?: () => void;
}

export function TenantRegistration({ onComplete, onBack }: TenantRegistrationProps) {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [tenantData, setTenantData] = useState({
    // Restaurant Details
    restaurantName: '',
    restaurantType: '',
    description: '',
    
    // Location
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    
    // Contact
    phone: '',
    email: '',
    website: '',
    
    // Business Details
    taxId: '',
    numberOfTables: 10,
    cuisineType: '',
    
    // Branding
    primaryColor: '#D55A47',
    logoUrl: '',
  });

  const restaurantTypes = [
    'Fine Dining',
    'Casual Dining',
    'Fast Casual',
    'Cafe',
    'Bar & Grill',
    'Pizzeria',
    'Steakhouse',
    'Seafood',
    'Asian',
    'Mexican',
    'Italian',
    'American',
    'Other'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setTenantData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!tenantData.restaurantName || !tenantData.restaurantType) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (step === 2) {
      if (!tenantData.address || !tenantData.city || !tenantData.state) {
        toast.error('Please fill in all required fields');
        return;
      }
    } else if (step === 3) {
      if (!tenantData.phone || !tenantData.email) {
        toast.error('Please fill in all required fields');
        return;
      }
    }
    
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      // Register tenant via API
      const response = await fetch(`${api.API_BASE_URL}/tenants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify(tenantData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(errorData.error || 'Failed to register tenant');
      }

      const data = await response.json();
      
      toast.success('Restaurant registered successfully!');
      onComplete(data.tenant);
    } catch (error: any) {
      console.error('Error registering tenant:', error);
      toast.error(error.message || 'Failed to register restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="restaurantName">Restaurant Name *</Label>
        <Input
          id="restaurantName"
          value={tenantData.restaurantName}
          onChange={(e) => handleInputChange('restaurantName', e.target.value)}
          placeholder="Enter your restaurant name"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="restaurantType">Restaurant Type *</Label>
        <Select 
          value={tenantData.restaurantType} 
          onValueChange={(value) => handleInputChange('restaurantType', value)}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {restaurantTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={tenantData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Tell us about your restaurant"
          className="mt-2"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="cuisineType">Cuisine Type</Label>
        <Input
          id="cuisineType"
          value={tenantData.cuisineType}
          onChange={(e) => handleInputChange('cuisineType', e.target.value)}
          placeholder="e.g., Italian, Asian Fusion, etc."
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          value={tenantData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
          placeholder="123 Main Street"
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            value={tenantData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="New York"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={tenantData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="NY"
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="zipCode">ZIP Code</Label>
          <Input
            id="zipCode"
            value={tenantData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
            placeholder="10001"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={tenantData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          value={tenantData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          placeholder="(555) 123-4567"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={tenantData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="contact@restaurant.com"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={tenantData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          placeholder="https://restaurant.com"
          className="mt-2"
        />
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="taxId">Tax ID / EIN (Optional)</Label>
        <Input
          id="taxId"
          value={tenantData.taxId}
          onChange={(e) => handleInputChange('taxId', e.target.value)}
          placeholder="XX-XXXXXXX"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="numberOfTables">Number of Tables</Label>
        <Input
          id="numberOfTables"
          type="number"
          min="1"
          max="200"
          value={tenantData.numberOfTables}
          onChange={(e) => handleInputChange('numberOfTables', parseInt(e.target.value) || 10)}
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          We'll automatically create this many tables for you
        </p>
      </div>

      <div>
        <Label htmlFor="primaryColor">Brand Color</Label>
        <div className="flex gap-4 mt-2">
          <Input
            id="primaryColor"
            type="color"
            value={tenantData.primaryColor}
            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
            className="w-20 h-12"
          />
          <Input
            value={tenantData.primaryColor}
            onChange={(e) => handleInputChange('primaryColor', e.target.value)}
            placeholder="#D55A47"
            className="flex-1"
          />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          This color will be used throughout your restaurant's interface
        </p>
      </div>

      <div>
        <Label htmlFor="logoUrl">Logo URL (Optional)</Label>
        <Input
          id="logoUrl"
          type="url"
          value={tenantData.logoUrl}
          onChange={(e) => handleInputChange('logoUrl', e.target.value)}
          placeholder="https://example.com/logo.png"
          className="mt-2"
        />
        <p className="text-sm text-muted-foreground mt-1">
          You can upload your logo later
        </p>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Restaurant Details', icon: <Building className="w-5 h-5" /> },
    { number: 2, title: 'Location', icon: <MapPin className="w-5 h-5" /> },
    { number: 3, title: 'Contact Info', icon: <Phone className="w-5 h-5" /> },
    { number: 4, title: 'Business Details', icon: <Globe className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="w-10 h-10 text-terracotta" />
            </div>
            <CardTitle className="text-center text-3xl">Register Your Restaurant</CardTitle>
            <CardDescription className="text-center">
              Step {step} of {steps.length} - {steps[step - 1].title}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Progress Steps */}
            <div className="flex justify-between mb-8">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        step >= s.number
                          ? 'bg-terracotta text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                      }`}
                    >
                      {s.icon}
                    </div>
                    <p className="text-xs mt-2 text-center hidden sm:block">{s.title}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        step > s.number ? 'bg-terracotta' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              
              {step < 4 ? (
                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 bg-terracotta hover:bg-terracotta-dark"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-terracotta hover:bg-terracotta-dark"
                >
                  {isLoading ? 'Registering...' : 'Complete Registration'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
