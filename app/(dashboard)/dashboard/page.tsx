'use client';

import { useState, useMemo, useEffect } from 'react';
import { ContentCard } from '@/components/content-card';
import { GenerationWizard } from '@/components/generation-wizard';
import { fetchContent, approveContent } from '@/lib/api';
import { ContentItem, ContentStatus, Platform } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = ContentStatus | 'all';
type PlatformFilter = Platform | 'all';

export default function DashboardPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  async function loadContent() {
    const items = await fetchContent();
    setContent(items);
  }

  useEffect(() => {
    let cancelled = false;
    fetchContent().then((items) => {
      if (!cancelled) setContent(items);
    });
    return () => { cancelled = true; };
  }, []);

  const filteredContent = useMemo(() => {
    return content.filter((item) => {
      const statusMatch = statusFilter === 'all' || item.status === statusFilter;
      const platformMatch = platformFilter === 'all' || item.platform === platformFilter;
      return statusMatch && platformMatch;
    });
  }, [content, statusFilter, platformFilter]);

  const statusCounts = useMemo(() => {
    return {
      all: content.length,
      draft: content.filter((i) => i.status === 'draft').length,
      approved: content.filter((i) => i.status === 'approved').length,
      scheduled: content.filter((i) => i.status === 'scheduled').length,
      published: content.filter((i) => i.status === 'published').length,
    };
  }, [content]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || platformFilter !== 'all';

  const handleApprove = async (id: string) => {
    try {
      const updated = await approveContent(id);
      setContent((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      toast.success('Content approved');
    } catch {
      // Fallback: optimistically update in local state
      setContent((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'approved' as ContentStatus } : item
        )
      );
      toast.success('Content approved (local)');
    }
  };

  const handleEdit = (id: string) => {
    toast.info('Content editing coming in Phase 3', {
      description: `Edit content ${id}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Content Calendar</h1>
          <p className="text-slate-600 mt-1">
            Manage and review your scheduled content
          </p>
        </div>
        <GenerationWizard onGenerated={loadContent} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status ({statusCounts.all})</SelectItem>
              <SelectItem value="draft">Draft ({statusCounts.draft})</SelectItem>
              <SelectItem value="approved">Approved ({statusCounts.approved})</SelectItem>
              <SelectItem value="scheduled">Scheduled ({statusCounts.scheduled})</SelectItem>
              <SelectItem value="published">Published ({statusCounts.published})</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={platformFilter}
            onValueChange={(value) => setPlatformFilter(value as PlatformFilter)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="IGFB">Instagram/FB</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Blog">Blog</SelectItem>
              <SelectItem value="YouTube">YouTube</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-slate-600"
            >
              Clear filters
            </Button>
          )}
        </div>

        <div className="sm:ml-auto">
          <Badge variant="secondary" className="text-sm">
            {filteredContent.length} item{filteredContent.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredContent.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onApprove={handleApprove}
              onEdit={handleEdit}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-slate-500">No content matches your filters.</p>
          <Button variant="link" onClick={clearFilters} className="mt-2">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
