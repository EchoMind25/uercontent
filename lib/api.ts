import { ContentItem, ResearchUrl, UserSettings } from './types';
import { mockContent, mockResearchUrls, mockUserSettings } from './mock-data';

// --- Content ---

export async function fetchContent(params?: {
  status?: string;
  platform?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}): Promise<ContentItem[]> {
  try {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.platform) query.set('platform', params.platform);
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.offset) query.set('offset', params.offset.toString());

    const res = await fetch(`/api/content?${query.toString()}`);
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return mockContent;
  }
}

export async function createContent(item: Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentItem> {
  const res = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) throw new Error('Failed to create content');
  return await res.json();
}

export async function updateContent(update: { id: string } & Partial<ContentItem>): Promise<ContentItem> {
  const res = await fetch('/api/content', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update content');
  return await res.json();
}

export async function deleteContent(id: string): Promise<void> {
  const res = await fetch(`/api/content?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete content');
}

export async function approveContent(contentId: string): Promise<ContentItem> {
  const res = await fetch('/api/approve-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentId }),
  });
  if (!res.ok) throw new Error('Failed to approve content');
  return await res.json();
}

// --- Content Generation ---

export async function generateWeek(params: {
  startDate: string;
  platforms?: string[];
  researchFirst?: boolean;
  autoApprove?: boolean;
}): Promise<{
  jobId: string;
  status: string;
  itemsGenerated: number;
  itemsFailed: number;
  contentItems: Array<{ id: string; platform: string; topic: string; publishDate: string; status: string }>;
}> {
  const res = await fetch('/api/generate-week', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to generate content');
  return await res.json();
}

// --- Research URLs ---

export async function fetchResearchUrls(): Promise<ResearchUrl[]> {
  try {
    const res = await fetch('/api/research-urls');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return mockResearchUrls;
  }
}

export async function createResearchUrl(url: Omit<ResearchUrl, 'id' | 'createdAt' | 'lastScraped' | 'isActive'>): Promise<ResearchUrl> {
  const res = await fetch('/api/research-urls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(url),
  });
  if (!res.ok) throw new Error('Failed to create research URL');
  return await res.json();
}

export async function updateResearchUrl(update: { id: string } & Partial<ResearchUrl>): Promise<ResearchUrl> {
  const res = await fetch('/api/research-urls', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(update),
  });
  if (!res.ok) throw new Error('Failed to update research URL');
  return await res.json();
}

export async function deleteResearchUrl(id: string): Promise<void> {
  const res = await fetch(`/api/research-urls?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete research URL');
}

// --- Calendar Sync ---

export async function syncToCalendar(contentId: string, accessToken?: string): Promise<{
  success: boolean;
  calendarEventId: string;
  calendarUrl: string;
}> {
  const body: Record<string, string> = { contentId };
  if (accessToken) body.accessToken = accessToken;

  const res = await fetch('/api/sync-calendar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Failed to sync to calendar');
  return await res.json();
}

// --- Research Scraping ---

export async function scrapeResearchUrls(urlIds?: string[]): Promise<{
  scraped: number;
  failed: number;
  errors: string[];
}> {
  const res = await fetch('/api/research-urls/scrape-now', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urlIds }),
  });
  if (!res.ok) throw new Error('Failed to start scraping');
  return await res.json();
}

// --- Settings ---

export async function fetchSettings(): Promise<UserSettings> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('API error');
    return await res.json();
  } catch {
    return mockUserSettings;
  }
}

export async function saveSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const res = await fetch('/api/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return await res.json();
}
