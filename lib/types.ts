// Content item types
export type Platform = 'IGFB' | 'LinkedIn' | 'Blog' | 'YouTube' | 'X';
export type ContentType = 'Local' | 'Market' | 'Educational' | 'Personal' | 'Promotional' | 'Professional' | 'Community' | 'Reflection' | 'Insight' | 'Guide' | 'Safety';
export type ContentStatus = 'draft' | 'approved' | 'published' | 'scheduled';

export interface ContentItem {
  id: string;
  platform: Platform;
  contentType: ContentType;
  topic: string;
  generatedText: string;
  publishDate: string;
  publishTime: string;
  status: ContentStatus;
  owner: string;
  calendarEventId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Research URL types
export type ScrapeFrequency = 'daily' | 'weekly' | 'monthly';
export type UrlCategory = 'Market Research' | 'Local News' | 'Industry Trends' | 'Competitor Analysis' | 'General';

export interface ResearchUrl {
  id: string;
  url: string;
  title: string;
  category: UrlCategory;
  scrapeFrequency: ScrapeFrequency;
  isActive: boolean;
  lastScraped: string | null;
  createdAt?: string;
}

// User settings
export interface UserSettings {
  weeklyGenerationDay: number; // 0-6, Sunday-Saturday
  weeklyGenerationTime: string; // HH:MM format
  autoApproveEnabled: boolean;
  notificationEmail: string;
  forbiddenPhrases: string[];
  googleCalendarConnected?: boolean;
}

// Calendar types
export interface CalendarDay {
  date: Date;
  items: ContentItem[];
}
