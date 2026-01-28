import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function buildResearchContext(options: {
  categories?: string[];
  daysBack?: number;
  maxItems?: number;
}): Promise<string> {
  const { categories = [], daysBack = 7, maxItems = 10 } = options;

  const supabase = getSupabaseServiceRole();

  const sinceDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from('research_content')
    .select(`
      id,
      summary,
      scraped_at,
      research_urls!inner(category, title, url)
    `)
    .gte('scraped_at', sinceDate)
    .order('scraped_at', { ascending: false })
    .limit(maxItems);

  if (categories.length > 0) {
    query = query.in('research_urls.category', categories);
  }

  const { data: research } = await query;

  if (!research || research.length === 0) {
    return '';
  }

  let context = '## Recent Research Context\n\n';
  context += 'The following insights were gathered from recent research. Use them to inform your content:\n\n';

  for (const item of research) {
    const urlInfo = item.research_urls as unknown as {
      category: string;
      title: string;
      url: string;
    };
    context += `### ${urlInfo.category}: ${urlInfo.title}\n`;
    context += `Source: ${urlInfo.url}\n`;
    context += `${item.summary || 'No summary available.'}\n\n`;
  }

  return context;
}
