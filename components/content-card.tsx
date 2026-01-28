'use client';

import { ContentItem } from '@/lib/types';
import { platformColors, platformEmojis, statusColors } from '@/lib/mock-data';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Check, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  item: ContentItem;
  onApprove?: () => void;
  onEdit?: () => void;
}

export function ContentCard({ item, onApprove, onEdit }: ContentCardProps) {
  const platformColor = platformColors[item.platform];
  const statusColor = statusColors[item.status];
  const emoji = platformEmojis[item.platform];

  const handleApprove = () => {
    console.log('Approve clicked:', item.id);
    if (onApprove) {
      onApprove();
    }
    toast.info('Feature coming in Phase 2', {
      description: 'Content approval will be available soon.',
    });
  };

  const handleEdit = () => {
    console.log('Edit clicked:', item.id);
    if (onEdit) {
      onEdit();
    }
    toast.info('Feature coming in Phase 2', {
      description: 'Content editing will be available soon.',
    });
  };

  // Truncate text to ~150 characters
  const truncatedText = item.generatedText.length > 150
    ? item.generatedText.substring(0, 150) + '...'
    : item.generatedText;

  return (
    <Card className="group hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
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
      </CardContent>
    </Card>
  );
}
