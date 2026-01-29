'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { platformColors, platformEmojis } from '@/lib/mock-data';
import { fetchContent } from '@/lib/api';
import { ContentItem } from '@/lib/types';
import { ContentViewEditDialog } from '@/components/content-view-edit-dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CalendarCheck } from 'lucide-react';

import {
  addDays,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  addWeeks,
  subWeeks,
  isToday as isDateToday,
} from 'date-fns';
import { cn } from '@/lib/utils';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [content, setContent] = useState<ContentItem[]>([]);

  // View/Edit dialog
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchContent().then((items) => {
      if (!cancelled) setContent(items);
    });
    return () => { cancelled = true; };
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

  const weekDays = useMemo(() => {
    const days: Date[] = [];
    let day = weekStart;
    while (day <= weekEnd) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [weekStart, weekEnd]);

  const getContentForDay = useCallback((date: Date): ContentItem[] => {
    return content.filter((item) => {
      const itemDate = new Date(item.publishDate);
      return isSameDay(itemDate, date);
    });
  }, [content]);

  const handlePreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  // --- Dialog handlers ---
  const handleItemClick = useCallback((item: ContentItem) => {
    setSelectedItem(item);
    setDialogOpen(true);
  }, []);

  const handleDialogUpdated = useCallback((updated: ContentItem) => {
    setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedItem(updated);
  }, []);

  const handleDialogDeleted = useCallback((id: string) => {
    setContent((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const handleDialogApproved = useCallback((updated: ContentItem) => {
    setContent((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    setSelectedItem(updated);
  }, []);

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
              isDateToday(day) ? 'bg-slate-900 text-white' : 'bg-slate-100'
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
                isDateToday(day) ? 'border-slate-900 border-2' : 'border-slate-200'
              )}
            >
              <div className="space-y-2">
                {dayContent.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center pt-4">
                    No content
                  </p>
                ) : (
                  dayContent.map((item) => {
                    const platformColor = platformColors[item.platform] || platformColors['IGFB'];
                    const emoji = platformEmojis[item.platform] || '';
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
                          {item.status === 'approved' && (
                            <CalendarCheck className="h-3 w-3 text-emerald-600 ml-auto" />
                          )}
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

      {/* View/Edit Dialog */}
      <ContentViewEditDialog
        item={selectedItem}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onUpdated={handleDialogUpdated}
        onDeleted={handleDialogDeleted}
        onApproved={handleDialogApproved}
      />
    </div>
  );
}
