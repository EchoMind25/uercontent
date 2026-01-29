import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { summarizeContent } from './summarizer';

const JINA_READER_URL = 'https://r.jina.ai';

export async function scrapeUrl(url: string): Promise<{
  content: string;
  title: string;
  wordCount: number;
}> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'X-Return-Format': 'markdown',
  };

  if (process.env.JINA_API_KEY) {
    headers['Authorization'] = `Bearer ${process.env.JINA_API_KEY}`;
  }

  const response = await fetch(`${JINA_READER_URL}/${url}`, { headers });

  if (!response.ok) {
    throw new Error(`Failed to scrape ${url}: ${response.statusText}`);
  }

  const data = await response.json().catch(() => null);
  if (!data) {
    throw new Error(`Invalid JSON response from ${url}`);
  }

  return {
    content: data.data?.content || '',
    title: data.data?.title || url,
    wordCount: (data.data?.content || '').split(/\s+/).length,
  };
}

export async function scrapeAndStore(urlId: string): Promise<{
  id: string;
  summary: string | null;
  isNew: boolean;
}> {
  const supabase = getSupabaseServiceRole();

  // Get URL config
  const { data: urlConfig, error: urlError } = await supabase
    .from('research_urls')
    .select('*')
    .eq('id', urlId)
    .single();

  if (urlError || !urlConfig) {
    throw new Error(`URL not found: ${urlId}`);
  }

  // Scrape the URL
  const scraped = await scrapeUrl(urlConfig.url);

  if (!scraped.content) {
    throw new Error(`No content extracted from ${urlConfig.url}`);
  }

  // Check for existing scrape of this URL
  const { data: existing } = await supabase
    .from('research_content')
    .select('id, summary')
    .eq('research_url_id', urlId)
    .order('scraped_at', { ascending: false })
    .limit(1)
    .single();

  // Summarize with Claude (if API key available)
  let summary: string | null = null;
  try {
    const result = await summarizeContent(scraped.content, urlConfig.category);
    summary = result.text;
  } catch {
    // Summarization failed — store without summary
    summary = `Scraped ${scraped.wordCount} words from ${urlConfig.title}`;
  }

  // Store the scraped content
  const { data: stored, error: storeError } = await supabase
    .from('research_content')
    .insert({
      research_url_id: urlId,
      raw_content: scraped.content.substring(0, 50000), // Cap storage
      summary,
    })
    .select('id, summary')
    .single();

  if (storeError) {
    throw new Error(`Failed to store content: ${storeError.message}`);
  }

  // Update URL last_scraped timestamp
  await supabase
    .from('research_urls')
    .update({ last_scraped: new Date().toISOString() })
    .eq('id', urlId);

  return {
    id: stored.id,
    summary: stored.summary,
    isNew: !existing,
  };
}

export async function scrapeAllActive(): Promise<{
  scraped: number;
  failed: number;
  errors: string[];
}> {
  const supabase = getSupabaseServiceRole();

  const { data: urls, error } = await supabase
    .from('research_urls')
    .select('id, title, url')
    .eq('is_active', true);

  if (error || !urls) {
    throw new Error('Failed to fetch active URLs');
  }

  let scraped = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const url of urls) {
    try {
      await scrapeAndStore(url.id);
      scraped++;
    } catch (err) {
      failed++;
      errors.push(`${url.title}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  return { scraped, failed, errors };
}
