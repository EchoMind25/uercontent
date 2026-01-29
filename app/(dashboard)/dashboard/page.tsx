'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { ContentCard } from '@/components/content-card';
import { ContentViewEditDialog } from '@/components/content-view-edit-dialog';
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
import { Filter, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type StatusFilter = ContentStatus | 'all';
type PlatformFilter = Platform | 'all';

export default function DashboardPage() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>('all');

  // View/Edit dialog state
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchMode, setBatchMode] = useState(false);
  const [batchApproving, setBatchApproving] = useState(false);

  const loadContent = useCallback(async () => {
    const items = await fetchContent();
    setContent(items);
  }, []);

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

  const draftIds = useMemo(() => {
    return new Set(filteredContent.filter((i) => i.status === 'draft').map((i) => i.id));
  }, [filteredContent]);

  const selectedDraftCount = useMemo(() => {
    return [...selectedIds].filter((id) => draftIds.has(id)).length;
  }, [selectedIds, draftIds]);

  const clearFilters = () => {
    setStatusFilter('all');
    setPlatformFilter('all');
  };

  const hasActiveFilters = statusFilter !== 'all' || platformFilter !== 'all';

  // --- View/Edit Handlers ---
  const handleView = useCallback((item: ContentItem) => {
    if (batchMode) return;
    setSelectedItem(item);
    setDialogOpen(true);
  }, [batchMode]);

  const handleEdit = useCallback((id: string) => {
    const item = content.find((c) => c.id === id);
    if (item) {
      setSelectedItem(item);
      setDialogOpen(true);
    }
  }, [content]);

  const handleDialogUpdated = useCallback((updated: ContentItem) => {
    setContent((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedItem(updated);
  }, []);

  const handleDialogDeleted = useCallback((id: string) => {
    setContent((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDialogApproved = useCallback((updated: ContentItem) => {
    setContent((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    setSelectedItem(updated);
  }, []);

  // --- Single Approve ---
  const handleApprove = useCallback(async (id: string) => {
    try {
      const updated = await approveContent(id);
      setContent((prev) => prev.map((item) => (item.id === id ? updated : item)));
      toast.success('Content approved');
    } catch {
      setContent((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: 'approved' as ContentStatus } : item
        )
      );
      toast.success('Content approved (local)');
    }
  }, []);

  // --- Batch Selection ---
  const handleSelect = useCallback((id: string, isSelected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isSelected) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const handleSelectAllDrafts = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = [...draftIds].every((id) => next.has(id));
      if (allSelected) {
        draftIds.forEach((id) => next.delete(id));
      } else {
        draftIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [draftIds]);

  const handleBatchApprove = useCallback(async () => {
    const idsToApprove = [...selectedIds].filter((id) => draftIds.has(id));
    if (idsToApprove.length === 0) {
      toast.info('No draft items selected');
      return;
    }

    setBatchApproving(true);
    let successCount = 0;
    let failCount = 0;

    for (const id of idsToApprove) {
      try {
        const updated = await approveContent(id);
        setContent((prev) => prev.map((item) => (item.id === id ? updated : item)));
        successCount++;
      } catch {
        setContent((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: 'approved' as ContentStatus } : item
          )
        );
        successCount++;
        failCount++;
      }
    }

    setBatchApproving(false);
    setSelectedIds(new Set());
    setBatchMode(false);

    if (failCount > 0) {
      toast.success(`Approved ${successCount} items (${failCount} local-only)`);
    } else {
      toast.success(`Approved ${successCount} items`);
    }
  }, [selectedIds, draftIds]);

  const toggleBatchMode = useCallback(() => {
    setBatchMode((prev) => {
      if (prev) {
        setSelectedIds(new Set());
      }
      return !prev;
    });
  }, []);

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
        <div className="flex items-center gap-2">
          {statusCounts.draft > 0 && (
            <Button
              variant={batchMode ? 'default' : 'outline'}
              size="sm"
              onClick={toggleBatchMode}
            >
              <CheckCheck className="h-4 w-4 mr-1.5" />
              {batchMode ? 'Exit Batch' : 'Batch Approve'}
            </Button>
          )}
          <GenerationWizard onGenerated={loadContent} />
        </div>
      </div>

      {/* Batch Actions Bar */}
      {batchMode && (
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="text-sm text-blue-800 font-medium">
            {selectedDraftCount} draft{selectedDraftCount !== 1 ? 's' : ''} selected
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAllDrafts}
            className="text-blue-700"
          >
            {[...draftIds].every((id) => selectedIds.has(id)) ? 'Deselect All' : 'Select All Drafts'}
          </Button>
          <Button
            size="sm"
            onClick={handleBatchApprove}
            disabled={selectedDraftCount === 0 || batchApproving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white ml-auto"
          >
            {batchApproving ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-1.5" />
                Approve Selected ({selectedDraftCount})
              </>
            )}
          </Button>
        </div>
      )}

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
              <SelectItem value="X">X (Twitter)</SelectItem>
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
              selected={selectedIds.has(item.id)}
              selectable={batchMode}
              onApprove={handleApprove}
              onEdit={handleEdit}
              onView={handleView}
              onSelect={handleSelect}
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
