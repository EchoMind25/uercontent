import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';
import { scrapeAndStore, scrapeAllActive } from '@/lib/research/scraper';

const scrapeSchema = z.object({
  urlIds: z.array(z.string().uuid()).optional(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = scrapeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    if (parsed.data.urlIds && parsed.data.urlIds.length > 0) {
      // Scrape specific URLs
      const results = [];
      const errors: string[] = [];

      for (const urlId of parsed.data.urlIds) {
        try {
          const result = await scrapeAndStore(urlId);
          results.push(result);
        } catch (err) {
          errors.push(`${urlId}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }

      return NextResponse.json({
        scraped: results.length,
        failed: errors.length,
        results,
        errors,
      });
    } else {
      // Scrape all active URLs
      const result = await scrapeAllActive();
      return NextResponse.json(result);
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Scraping failed' },
      { status: 500 }
    );
  }
}
