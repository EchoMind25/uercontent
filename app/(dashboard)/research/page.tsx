'use client';

import { useState } from 'react';
import { ResearchUrlTable } from '@/components/research-url-table';
import { mockResearchUrls } from '@/lib/mock-data';
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

export default function ResearchPage() {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isScrapingAll, setIsScrapingAll] = useState(false);

  // Form state for add dialog
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newFrequency, setNewFrequency] = useState('');

  const handleAddUrl = () => {
    console.log('Add URL:', { url: newUrl, title: newTitle, category: newCategory, frequency: newFrequency });
    setAddDialogOpen(false);
    resetForm();
    toast.info('Feature coming in Phase 2', {
      description: 'Adding research URLs will be available soon.',
    });
  };

  const handleScrapeAll = async () => {
    setIsScrapingAll(true);
    console.log('Scrape all clicked');

    // Simulate scraping
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsScrapingAll(false);
    toast.info('Feature coming in Phase 3', {
      description: 'Web scraping will be available soon.',
    });
  };

  const resetForm = () => {
    setNewUrl('');
    setNewTitle('');
    setNewCategory('');
    setNewFrequency('');
  };

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
                        <SelectItem value="Market Research">Market Research</SelectItem>
                        <SelectItem value="Local News">Local News</SelectItem>
                        <SelectItem value="Industry Trends">Industry Trends</SelectItem>
                        <SelectItem value="Competitor Analysis">Competitor Analysis</SelectItem>
                        <SelectItem value="General">General</SelectItem>
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
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
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
      <ResearchUrlTable urls={mockResearchUrls} />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
        <span>
          {mockResearchUrls.length} source{mockResearchUrls.length !== 1 ? 's' : ''} configured
        </span>
        <span>
          {mockResearchUrls.filter((u) => u.isActive).length} active
        </span>
      </div>
    </div>
  );
}
