'use client';

import { ResearchUrl } from '@/lib/types';
import { frequencyColors } from '@/lib/colors';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ResearchUrlTableProps {
  urls: ResearchUrl[];
  onToggleActive?: (id: string, isActive: boolean) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ResearchUrlTable({ urls, onToggleActive, onEdit, onDelete }: ResearchUrlTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">URL</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead>Last Scraped</TableHead>
            <TableHead className="text-center">Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {urls.map((url) => (
            <TableRow key={url.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-slate-900">{url.title}</span>
                  <a
                    href={url.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 truncate max-w-[280px]"
                  >
                    {url.url}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{url.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={frequencyColors[url.scrapeFrequency]}>
                  {url.scrapeFrequency}
                </Badge>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {url.lastScraped
                  ? formatDistanceToNow(new Date(url.lastScraped), { addSuffix: true })
                  : 'Never'}
              </TableCell>
              <TableCell className="text-center">
                <Switch
                  checked={url.isActive}
                  onCheckedChange={(checked) => onToggleActive?.(url.id, checked)}
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(url.id)}
                  >
                    <Pencil className="h-4 w-4 text-slate-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete?.(url.id)}
                  >
                    <Trash2 className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
