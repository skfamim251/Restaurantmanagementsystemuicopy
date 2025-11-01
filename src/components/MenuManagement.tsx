import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import * as api from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  available: boolean;
  prepTime: number;
  ingredients?: string[];
  allergens?: string[];
}

interface Modifier {
  id: string;
  menuItemId: string;
  name: string;
  type: 'single' | 'multiple';
  options: { name: string; price: number }[];
  required: boolean;
}

const categories = [
  'Appetizers',
  'Salads',
  'Mains',
  'Pasta',
  'Seafood',
  'Desserts',
  'Beverages',
  'Specials'
];

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modifiers, setModifiers] = useState<Modifier[]>([]);
  const [showModifierDialog, setShowModifierDialog] = useState(false);
  
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category: 'Mains',
    imageUrl: '',
    available: true,
    prepTime: 15,
    ingredients: [],
    allergens: [],
  });

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const items = await api.getMenuItems();
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadModifiers = async (menuItemId: string) => {
    try {
      const response = await fetch(
        `${api.API_BASE_URL}/modifiers/${menuItemId}`,
        {
          headers: { Authorization: `Bearer ${api.getToken()}` },
        }
      );
      const data = await response.json();
      setModifiers(data.modifiers || []);
    } catch (error) {
      console.error('Error loading modifiers:', error);
    }
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Mains',
      imageUrl: '',
      available: true,
      prepTime: 15,
      ingredients: [],
      allergens: [],
    });
    setIsCreating(true);
  };

  const handleEdit = (item: MenuItem) => {
    setFormData(item);
    setSelectedItem(item);
    setIsEditing(true);
    loadModifiers(item.id);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Confirmation dialog for editing existing items
    if (!isCreating && selectedItem) {
      if (!confirm('Are you sure you want to save these changes?')) {
        return;
      }
    }

    try {
      if (isCreating) {
        const newItem = await api.createMenuItem(formData as MenuItem);
        setMenuItems([...menuItems, newItem]);
        toast.success('Menu item created successfully');
      } else if (selectedItem) {
        const updatedItem = await api.updateMenuItem(selectedItem.id, formData);
        setMenuItems(menuItems.map(item => 
          item.id === selectedItem.id ? updatedItem : item
        ));
        toast.success('Menu item updated successfully');
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error('Failed to save menu item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    
    try {
      await api.deleteMenuItem(id);
      setMenuItems(menuItems.filter(item => item.id !== id));
      toast.success('Menu item deleted successfully');
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setIsEditing(false);
    setSelectedItem(null);
    setModifiers([]);
  };

  const addModifier = async (modifier: Partial<Modifier>) => {
    try {
      const response = await fetch(`${api.API_BASE_URL}/modifiers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${api.getToken()}`,
        },
        body: JSON.stringify({
          ...modifier,
          menuItemId: selectedItem?.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add modifier');
      
      const data = await response.json();
      setModifiers([...modifiers, data.modifier]);
      toast.success('Modifier added successfully');
      setShowModifierDialog(false);
    } catch (error) {
      console.error('Error adding modifier:', error);
      toast.error('Failed to add modifier');
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-terracotta dark:text-terracotta-light mb-2">Menu Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create, edit, and manage your restaurant menu
            </p>
          </div>
          <Button onClick={handleCreate} className="bg-terracotta hover:bg-terracotta-dark">
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {item.imageUrl ? (
                  <ImageWithFallback
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={item.available ? 'default' : 'secondary'}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {item.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-terracotta">${item.price.toFixed(2)}</span>
                  <Badge variant="outline">{item.category}</Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(item)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(item.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Dialog */}
        <Dialog open={isEditing || isCreating} onOpenChange={handleCancel}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isCreating ? 'Create New Menu Item' : 'Edit Menu Item'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter dish name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter dish description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                <Input
                  id="prepTime"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available</Label>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
              </div>

              {!isCreating && selectedItem && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Modifiers</Label>
                    <Button
                      onClick={() => setShowModifierDialog(true)}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Modifier
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {modifiers.map((mod) => (
                      <div
                        key={mod.id}
                        className="p-3 border rounded-lg"
                      >
                        <div className="flex items-center justify-between">
                          <span>{mod.name}</span>
                          <Badge variant="outline">
                            {mod.options.length} options
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1 bg-terracotta hover:bg-terracotta-dark">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
