'use client';

import { useState, useMemo } from 'react';
import { mockContent, platformColors, platformEmojis } from '@/lib/mock-data';
import { ContentItem } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date('2026-02-03')); // Start at the first content item date
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    const days = [];
    let day = weekStart;
    while (day <= weekEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [weekStart, weekEnd]);

  const getContentForDay = (date: Date): ContentItem[] => {
    return mockContent.filter((item) => {
      const itemDate = new Date(item.publishDate);
      return isSameDay(itemDate, date);
    });
  };

  const handlePreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-02-03')); // For demo purposes, use the mock data date
    toast.info('Showing mock data week', {
      description: 'In production, this would show the current week.',
    });
  };

  const handleItemClick = (item: ContentItem) => {
    setSelectedItem(item);
  };

  const isToday = (date: Date) => {
    // For demo, consider 2026-02-03 as "today"
    return isSameDay(date, new Date('2026-02-03'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar View</h1>
          <p className="text-slate-600 mt-1">
            Visual overview of your scheduled content
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-center gap-2 text-lg font-semibold text-slate-900">
        <CalendarIcon className="h-5 w-5" />
        {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 lg:gap-4">
        {/* Day Headers */}
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              'text-center p-2 rounded-lg',
              isToday(day) ? 'bg-slate-900 text-white' : 'bg-slate-100'
            )}
          >
            <div className="text-xs font-medium uppercase">
              {format(day, 'EEE')}
            </div>
            <div className="text-lg font-bold">{format(day, 'd')}</div>
          </div>
        ))}

        {/* Day Content Cells */}
        {weekDays.map((day) => {
          const dayContent = getContentForDay(day);
          return (
            <div
              key={`content-${day.toISOString()}`}
              className={cn(
                'min-h-[200px] lg:min-h-[300px] border rounded-lg p-2 bg-white',
                isToday(day) ? 'border-slate-900 border-2' : 'border-slate-200'
              )}
            >
              <div className="space-y-2">
                {dayContent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center pt-4">
                    No content
                  </p>
                ) : (
                  dayContent.map((item) => {
                    const platformColor = platformColors[item.platform];
                    const emoji = platformEmojis[item.platform];
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          'w-full text-left p-2 rounded-md text-xs transition-all hover:shadow-md',
                          platformColor.bg,
                          platformColor.border,
                          'border'
                        )}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span>{emoji}</span>
                          <span className={cn('font-medium', platformColor.text)}>
                            {item.platform}
                          </span>
                        </div>
                        <p className="text-slate-700 line-clamp-2 font-medium">
                          {item.topic}
                        </p>
                        <p className="text-slate-500 mt-1">{item.publishTime}</p>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Platform Legend */}
      <div className="flex flex-wrap justify-center gap-4 pt-4 border-t">
        {Object.entries(platformColors).map(([platform, colors]) => (
          <div key={platform} className="flex items-center gap-2">
            <div className={cn('w-4 h-4 rounded', colors.bg, colors.border, 'border')} />
            <span className="text-sm text-slate-600">
              {platformEmojis[platform]} {platform}
            </span>
          </div>
        ))}
      </div>

      {/* Content Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{platformEmojis[selectedItem.platform]}</span>
                  <Badge
                    className={cn(
                      platformColors[selectedItem.platform].bg,
                      platformColors[selectedItem.platform].text
                    )}
                  >
                    {selectedItem.platform}
                  </Badge>
                  <Badge variant="outline">{selectedItem.contentType}</Badge>
                </div>
                <DialogTitle>{selectedItem.topic}</DialogTitle>
                <DialogDescription>
                  Scheduled for {selectedItem.publishDate} at {selectedItem.publishTime}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <div className="bg-slate-50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                  <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans">
                    {selectedItem.generatedText}
                  </pre>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      console.log('Edit clicked:', selectedItem.id);
                      setSelectedItem(null);
                      toast.info('Feature coming in Phase 2');
                    }}
                  >
                    Edit Content
                  </Button>
                  {selectedItem.status === 'draft' && (
                    <Button
                      onClick={() => {
                        console.log('Approve clicked:', selectedItem.id);
                        setSelectedItem(null);
                        toast.info('Feature coming in Phase 2');
                      }}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
