'use client';

import { ContentItem } from '@/lib/types';
import { platformColors, platformEmojis, statusColors } from '@/lib/mock-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Check, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  item: ContentItem;
  selected?: boolean;
  onApprove?: (id: string) => void;
  onEdit?: (id: string) => void;
  onView?: (item: ContentItem) => void;
  onSelect?: (id: string, selected: boolean) => void;
  selectable?: boolean;
}

export function ContentCard({
  item,
  selected,
  onApprove,
  onEdit,
  onView,
  onSelect,
  selectable,
}: ContentCardProps) {
  const platformColor = platformColors[item.platform] || platformColors['IGFB'];
  const statusColor = statusColors[item.status] || statusColors['draft'];
  const emoji = platformEmojis[item.platform] || '';

  const handleApprove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApprove) onApprove(item.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) onEdit(item.id);
  };

  const handleCardClick = () => {
    if (onView) onView(item);
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(item.id, !selected);
  };

  // Truncate text to ~150 characters
  const truncatedText = item.generatedText.length > 150
    ? item.generatedText.substring(0, 150) + '...'
    : item.generatedText;

  return (
    <Card
      className={cn(
        'group hover:shadow-md transition-all duration-200 cursor-pointer',
        selected && 'ring-2 ring-blue-500 shadow-md'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {selectable && (
              <button
                onClick={handleSelect}
                className={cn(
                  'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0',
                  selected
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'border-slate-300 hover:border-blue-400'
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </button>
            )}
            <span className="text-xl" role="img" aria-label={item.platform}>
              {emoji}
            </span>
            <Badge
              variant="outline"
              className={cn(
                'text-xs font-medium',
                platformColor.bg,
                platformColor.text,
                platformColor.border
              )}
            >
              {item.platform}
            </Badge>
          </div>
          <Badge
            variant="secondary"
            className={cn('text-xs capitalize', statusColor.bg, statusColor.text)}
          >
            {item.status}
          </Badge>
        </div>
        <h3 className="font-semibold text-slate-900 mt-2 line-clamp-2">
          {item.topic}
        </h3>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-slate-600 mb-4 line-clamp-3">
          {truncatedText}
        </p>
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{item.publishDate}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{item.publishTime}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
              onClick={handleApprove}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className={cn(
              'text-slate-700',
              item.status === 'draft' ? 'flex-1' : 'w-full'
            )}
            onClick={handleEdit}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
        <p className="text-xs text-slate-400 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          Click to view full content
        </p>
      </CardContent>
    </Card>
  );
}
