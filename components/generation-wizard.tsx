'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Sparkles, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

export function GenerationWizard() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    addDays(new Date(), 7) // Default to next week
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedDate) {
      toast.error('Please select a start date');
      return;
    }

    setIsGenerating(true);
    console.log('Generate week clicked for:', selectedDate);

    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsGenerating(false);
    setOpen(false);
    toast.info('Feature coming in Phase 4', {
      description: 'AI content generation will be available soon.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Sparkles className="h-4 w-4" />
          Generate Week
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Weekly Content</DialogTitle>
          <DialogDescription>
            Select the week to generate content for. AI will create posts for all platforms.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Label className="text-sm font-medium mb-3 block">
            <CalendarIcon className="inline h-4 w-4 mr-2" />
            Week Starting
          </Label>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </div>
          {selectedDate && (
            <p className="text-sm text-center text-muted-foreground mt-3">
              Content will be scheduled for{' '}
              <span className="font-medium">
                {format(selectedDate, 'MMM d')} - {format(addDays(selectedDate, 6), 'MMM d, yyyy')}
              </span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isGenerating || !selectedDate}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
