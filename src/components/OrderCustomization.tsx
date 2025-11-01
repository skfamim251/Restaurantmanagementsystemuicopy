import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, Plus, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

interface OrderCustomizationProps {
  onAddComment: (comment: string) => void;
  onRequestExtras: (extras: string[]) => void;
  initialComment?: string;
  initialExtras?: string[];
}

const availableExtras = [
  { id: 'napkins', label: 'Extra Napkins', icon: '🧻' },
  { id: 'spoons', label: 'Extra Spoons', icon: '🥄' },
  { id: 'forks', label: 'Extra Forks', icon: '🍴' },
  { id: 'knives', label: 'Extra Knives', icon: '🔪' },
  { id: 'plates', label: 'Extra Plates', icon: '🍽️' },
  { id: 'water', label: 'Water', icon: '💧' },
  { id: 'ice', label: 'Ice', icon: '🧊' },
  { id: 'condiments', label: 'Condiments', icon: '🧂' },
  { id: 'toGo', label: 'To-Go Container', icon: '📦' },
];

export function OrderCustomization({
  onAddComment,
  onRequestExtras,
  initialComment = '',
  initialExtras = []
}: OrderCustomizationProps) {
  const [comment, setComment] = useState(initialComment);
  const [selectedExtras, setSelectedExtras] = useState<string[]>(initialExtras);
  const [hasChanges, setHasChanges] = useState(false);

  const handleCommentChange = (value: string) => {
    setComment(value);
    setHasChanges(true);
  };

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras(prev => {
      const newExtras = prev.includes(extraId)
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId];
      setHasChanges(true);
      return newExtras;
    });
  };

  const handleSave = () => {
    onAddComment(comment);
    onRequestExtras(selectedExtras);
    setHasChanges(false);
  };

  return (
    <div className="space-y-4">
      {/* Order Comments */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Special Instructions</CardTitle>
          </div>
          <CardDescription>
            Let us know how you'd like your order prepared
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder="e.g., No onions, extra sauce, well done, etc."
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {comment.length}/500 characters
          </p>
        </CardContent>
      </Card>

      {/* Request Extras */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plus className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Request Extras</CardTitle>
            </div>
            {selectedExtras.length > 0 && (
              <Badge className="bg-primary text-primary-foreground">
                {selectedExtras.length} selected
              </Badge>
            )}
          </div>
          <CardDescription>
            Select any additional items you need
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {availableExtras.map((extra) => (
              <motion.label
                key={extra.id}
                htmlFor={extra.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedExtras.includes(extra.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50 hover:bg-accent'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Checkbox
                  id={extra.id}
                  checked={selectedExtras.includes(extra.id)}
                  onCheckedChange={() => handleExtraToggle(extra.id)}
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{extra.icon}</span>
                    <span className="text-sm font-medium">{extra.label}</span>
                  </div>
                </div>
              </motion.label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleSave}
            className="w-full bg-primary hover:bg-primary/90"
            size="lg"
          >
            <Check className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </motion.div>
      )}
    </div>
  );
}
