'use client';

import { useState, useEffect, useCallback } from 'react';
import { ContentItem, ContentStatus, Platform, ContentType } from '@/lib/types';
import { platformColors, platformEmojis, statusColors } from '@/lib/mock-data';
import { updateContent, approveContent, deleteContent } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Calendar,
  Clock,
  Check,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  CalendarCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ContentViewEditDialogProps {
  item: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (item: ContentItem) => void;
  onDeleted: (id: string) => void;
  onApproved: (item: ContentItem) => void;
}

type DialogMode = 'view' | 'edit';

const platforms: Platform[] = ['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X'];
const contentTypes: ContentType[] = [
  'Local', 'Market', 'Educational', 'Personal', 'Promotional',
  'Professional', 'Community', 'Reflection', 'Insight', 'Guide', 'Safety',
];

export function ContentViewEditDialog({
  item,
  open,
  onOpenChange,
  onUpdated,
  onDeleted,
  onApproved,
}: ContentViewEditDialogProps) {
  const [mode, setMode] = useState<DialogMode>('view');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit form state
  const [editTopic, setEditTopic] = useState('');
  const [editText, setEditText] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPlatform, setEditPlatform] = useState<Platform>('IGFB');
  const [editContentType, setEditContentType] = useState<ContentType>('Local');

  // Reset state when item changes or dialog opens
  useEffect(() => {
    if (item && open) {
      setEditTopic(item.topic);
      setEditText(item.generatedText);
      setEditDate(item.publishDate);
      setEditTime(item.publishTime);
      setEditPlatform(item.platform);
      setEditContentType(item.contentType);
      setMode('view');
      setConfirmDelete(false);
    }
  }, [item, open]);

  const handleClose = useCallback(() => {
    setMode('view');
    setConfirmDelete(false);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSwitchToEdit = useCallback(() => {
    setMode('edit');
    setConfirmDelete(false);
  }, []);

  const handleCancelEdit = useCallback(() => {
    if (item) {
      setEditTopic(item.topic);
      setEditText(item.generatedText);
      setEditDate(item.publishDate);
      setEditTime(item.publishTime);
      setEditPlatform(item.platform);
      setEditContentType(item.contentType);
    }
    setMode('view');
  }, [item]);

  const handleSave = useCallback(async () => {
    if (!item) return;
    setSaving(true);
    try {
      const updated = await updateContent({
        id: item.id,
        topic: editTopic,
        generatedText: editText,
        publishDate: editDate,
        publishTime: editTime,
        platform: editPlatform,
        contentType: editContentType,
      });
      onUpdated(updated);
      setMode('view');
      toast.success('Content updated');
    } catch {
      // Optimistic local update
      const localUpdated: ContentItem = {
        ...item,
        topic: editTopic,
        generatedText: editText,
        publishDate: editDate,
        publishTime: editTime,
        platform: editPlatform,
        contentType: editContentType,
      };
      onUpdated(localUpdated);
      setMode('view');
      toast.success('Content updated (local)');
    } finally {
      setSaving(false);
    }
  }, [item, editTopic, editText, editDate, editTime, editPlatform, editContentType, onUpdated]);

  const handleApprove = useCallback(async () => {
    if (!item) return;
    setApproving(true);
    try {
      const updated = await approveContent(item.id);
      onApproved(updated);
      toast.success('Content approved');
    } catch {
      const localUpdated: ContentItem = { ...item, status: 'approved' as ContentStatus };
      onApproved(localUpdated);
      toast.success('Content approved (local)');
    } finally {
      setApproving(false);
    }
  }, [item, onApproved]);

  const handleDelete = useCallback(async () => {
    if (!item) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await deleteContent(item.id);
      onDeleted(item.id);
      handleClose();
      toast.success('Content deleted');
    } catch {
      onDeleted(item.id);
      handleClose();
      toast.success('Content deleted (local)');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }, [item, confirmDelete, onDeleted, handleClose]);

  if (!item) return null;

  const platformColor = platformColors[item.platform] || platformColors['IGFB'];
  const statusColor = statusColors[item.status] || statusColors['draft'];
  const emoji = platformEmojis[item.platform] || '';
  const wordCount = item.generatedText.split(/\s+/).filter(Boolean).length;
  const charCount = item.generatedText.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl" role="img" aria-label={item.platform}>
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
              {mode === 'edit' ? editPlatform : item.platform}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {mode === 'edit' ? editContentType : item.contentType}
            </Badge>
            <Badge
              variant="secondary"
              className={cn('text-xs capitalize ml-auto', statusColor.bg, statusColor.text)}
            >
              {item.status}
            </Badge>
          </div>
          <DialogTitle className="text-xl">
            {mode === 'view' ? item.topic : 'Edit Content'}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {mode === 'edit' ? editDate : item.publishDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {mode === 'edit' ? editTime : item.publishTime}
            </span>
            <span className="text-slate-400">
              {wordCount} words / {charCount} chars
            </span>
          </DialogDescription>
        </DialogHeader>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 my-2">
          {mode === 'view' ? (
            <div className="bg-slate-50 rounded-lg p-5 max-h-[400px] overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {item.generatedText}
              </pre>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="edit-topic">Topic</Label>
                <Input
                  id="edit-topic"
                  value={editTopic}
                  onChange={(e) => setEditTopic(e.target.value)}
                  placeholder="Content topic"
                />
              </div>

              {/* Platform & Content Type Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={editPlatform} onValueChange={(v) => setEditPlatform(v as Platform)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((p) => (
                        <SelectItem key={p} value={p}>
                          {platformEmojis[p] || ''} {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Content Type</Label>
                  <Select value={editContentType} onValueChange={(v) => setEditContentType(v as ContentType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contentTypes.map((ct) => (
                        <SelectItem key={ct} value={ct}>
                          {ct}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date & Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-date">Publish Date</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-time">Publish Time</Label>
                  <Input
                    id="edit-time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    placeholder="9:00 AM"
                  />
                </div>
              </div>

              {/* Content Text */}
              <div className="space-y-2">
                <Label htmlFor="edit-text">Content</Label>
                <Textarea
                  id="edit-text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                  placeholder="Post content..."
                />
                <p className="text-xs text-slate-400">
                  {editText.split(/\s+/).filter(Boolean).length} words / {editText.length} chars
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex-shrink-0 gap-2 sm:gap-2">
          {mode === 'view' ? (
            <>
              {/* Left side: Delete */}
              <div className="flex gap-2 mr-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className={cn(
                    'text-red-600 hover:bg-red-50 hover:text-red-700',
                    confirmDelete && 'bg-red-50 border-red-300'
                  )}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1" />
                  )}
                  {confirmDelete ? 'Confirm Delete' : 'Delete'}
                </Button>
                {confirmDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                    className="text-slate-500"
                  >
                    Cancel
                  </Button>
                )}
              </div>

              {/* Right side: Edit + Approve */}
              <Button variant="outline" onClick={handleSwitchToEdit}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              {item.status === 'draft' && (
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {approving ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1.5" />
                  )}
                  Approve
                </Button>
              )}
              {item.status === 'approved' && (
                <Badge variant="secondary" className="flex items-center gap-1 py-2 px-3">
                  <CalendarCheck className="h-3.5 w-3.5" />
                  Approved
                </Badge>
              )}
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                <X className="h-4 w-4 mr-1.5" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                Save Changes
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
