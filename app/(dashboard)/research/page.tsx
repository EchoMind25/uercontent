'use client';

import { useState, useEffect, useCallback } from 'react';
import { ResearchUrlTable } from '@/components/research-url-table';
import { fetchResearchUrls, createResearchUrl, updateResearchUrl, deleteResearchUrl, scrapeResearchUrls } from '@/lib/api';
import { ResearchUrl, UrlCategory, ScrapeFrequency } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, RefreshCw, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';

const categories: UrlCategory[] = [
  'Market Research',
  'Local News',
  'Industry Trends',
  'Competitor Analysis',
  'General',
];

const frequencies: ScrapeFrequency[] = ['daily', 'weekly', 'monthly'];

export default function ResearchPage() {
  const [urls, setUrls] = useState<ResearchUrl[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isScrapingAll, setIsScrapingAll] = useState(false);

  // Form state for add dialog
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newFrequency, setNewFrequency] = useState('');

  // Form state for edit dialog
  const [editingUrl, setEditingUrl] = useState<ResearchUrl | null>(null);
  const [editUrl, setEditUrl] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editFrequency, setEditFrequency] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  async function loadUrls() {
    const data = await fetchResearchUrls();
    setUrls(data);
  }

  useEffect(() => {
    let cancelled = false;
    fetchResearchUrls().then((data) => {
      if (!cancelled) setUrls(data);
    });
    return () => { cancelled = true; };
  }, []);

  const handleAddUrl = async () => {
    if (!newUrl || !newTitle || !newCategory || !newFrequency) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const created = await createResearchUrl({
        url: newUrl,
        title: newTitle,
        category: newCategory as UrlCategory,
        scrapeFrequency: newFrequency as ScrapeFrequency,
      });
      setUrls((prev) => [...prev, created]);
      toast.success('Research URL added');
    } catch {
      const localUrl: ResearchUrl = {
        id: crypto.randomUUID(),
        url: newUrl,
        title: newTitle,
        category: newCategory as UrlCategory,
        scrapeFrequency: newFrequency as ScrapeFrequency,
        isActive: true,
        lastScraped: null,
      };
      setUrls((prev) => [...prev, localUrl]);
      toast.success('Research URL added (local)');
    }

    setAddDialogOpen(false);
    resetAddForm();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const updated = await updateResearchUrl({ id, isActive });
      setUrls((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success(isActive ? 'URL activated' : 'URL deactivated');
    } catch {
      setUrls((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive } : u))
      );
      toast.success(isActive ? 'URL activated (local)' : 'URL deactivated (local)');
    }
  };

  const handleEdit = useCallback((id: string) => {
    const url = urls.find((u) => u.id === id);
    if (!url) return;
    setEditingUrl(url);
    setEditUrl(url.url);
    setEditTitle(url.title);
    setEditCategory(url.category);
    setEditFrequency(url.scrapeFrequency);
    setEditDialogOpen(true);
  }, [urls]);

  const handleSaveEdit = async () => {
    if (!editingUrl) return;
    if (!editUrl || !editTitle || !editCategory || !editFrequency) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await updateResearchUrl({
        id: editingUrl.id,
        url: editUrl,
        title: editTitle,
        category: editCategory as UrlCategory,
        scrapeFrequency: editFrequency as ScrapeFrequency,
      });
      setUrls((prev) => prev.map((u) => (u.id === editingUrl.id ? updated : u)));
      toast.success('Research URL updated');
    } catch {
      const localUpdated: ResearchUrl = {
        ...editingUrl,
        url: editUrl,
        title: editTitle,
        category: editCategory as UrlCategory,
        scrapeFrequency: editFrequency as ScrapeFrequency,
      };
      setUrls((prev) => prev.map((u) => (u.id === editingUrl.id ? localUpdated : u)));
      toast.success('Research URL updated (local)');
    } finally {
      setIsSavingEdit(false);
      setEditDialogOpen(false);
      setEditingUrl(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResearchUrl(id);
      setUrls((prev) => prev.filter((u) => u.id !== id));
      toast.success('Research URL deleted');
    } catch {
      setUrls((prev) => prev.filter((u) => u.id !== id));
      toast.success('Research URL deleted (local)');
    }
  };

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);

    try {
      const result = await scrapeResearchUrls();
      toast.success(`Scraping complete`, {
        description: `${result.scraped} scraped, ${result.failed} failed.`,
      });
      await loadUrls();
    } catch {
      toast.info('Supabase not configured', {
        description: 'Scraping requires Supabase and API keys to be configured.',
      });
    } finally {
      setIsScrapingAll(false);
    }
  };

  const resetAddForm = () => {
    setNewUrl('');
    setNewTitle('');
    setNewCategory('');
    setNewFrequency('');
  };

  const activeCount = urls.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Research Sources</h1>
          <p className="text-slate-600 mt-1">
            Manage URLs for market research and content inspiration
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleScrapeAll}
            disabled={isScrapingAll}
          >
            {isScrapingAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Scrape All Now
              </>
            )}
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add URL
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Research URL</DialogTitle>
                <DialogDescription>
                  Add a new URL to scrape for content research and market insights.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="url"
                      placeholder="https://example.com/real-estate-news"
                      value={newUrl}
                      onChange={(e) => setNewUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Descriptive name for this source"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={newCategory} onValueChange={setNewCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Scrape Frequency</Label>
                    <Select value={newFrequency} onValueChange={setNewFrequency}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {frequencies.map((freq) => (
                          <SelectItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUrl}>Add URL</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Globe className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">How Research Sources Work</h3>
            <p className="text-sm text-blue-700 mt-1">
              Add URLs from real estate news sites, market data sources, and AnswerThePublic.
              Our AI will scrape these sources to generate relevant, timely content ideas for your social media posts.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <ResearchUrlTable
        urls={urls}
        onToggleActive={handleToggleActive}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
        <span>
          {urls.length} source{urls.length !== 1 ? 's' : ''} configured
        </span>
        <span>
          {activeCount} active
        </span>
      </div>

      {/* Edit URL Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Research URL</DialogTitle>
            <DialogDescription>
              Update this research source&apos;s details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="edit-url"
                  placeholder="https://example.com/real-estate-news"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Descriptive name for this source"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-frequency">Scrape Frequency</Label>
                <Select value={editFrequency} onValueChange={setEditFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq}>{freq.charAt(0).toUpperCase() + freq.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSavingEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
              {isSavingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
