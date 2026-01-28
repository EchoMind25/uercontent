import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';

const researchUrlCreateSchema = z.object({
  url: z.string().url(),
  title: z.string().min(1),
  category: z.enum(['Market Research', 'Local News', 'Industry Trends', 'Competitor Analysis', 'General']),
  scrapeFrequency: z.enum(['daily', 'weekly', 'monthly']),
});

const researchUrlUpdateSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url().optional(),
  title: z.string().min(1).optional(),
  category: z.enum(['Market Research', 'Local News', 'Industry Trends', 'Competitor Analysis', 'General']).optional(),
  scrapeFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  isActive: z.boolean().optional(),
});

function mapRow(row: {
  id: string;
  url: string;
  title: string;
  category: string;
  scrape_frequency: string;
  is_active: boolean;
  last_scraped: string | null;
  created_at: string;
}) {
  return {
    id: row.id,
    url: row.url,
    title: row.title,
    category: row.category,
    scrapeFrequency: row.scrape_frequency,
    isActive: row.is_active,
    lastScraped: row.last_scraped,
    createdAt: row.created_at,
  };
}

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('research_urls')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(mapRow));
}

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
  const parsed = researchUrlCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.from('research_urls').insert({
    user_id: session.user.id,
    url: parsed.data.url,
    title: parsed.data.title,
    category: parsed.data.category,
    scrape_frequency: parsed.data.scrapeFrequency,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapRow(data), { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = researchUrlUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...updates } = parsed.data;
  const dbUpdates = {
    ...(updates.url !== undefined && { url: updates.url }),
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.category !== undefined && { category: updates.category }),
    ...(updates.scrapeFrequency !== undefined && { scrape_frequency: updates.scrapeFrequency }),
    ...(updates.isActive !== undefined && { is_active: updates.isActive }),
  };

  const { data, error } = await supabase
    .from('research_urls')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(mapRow(data));
}

export async function DELETE(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
  }

  const { error } = await supabase
    .from('research_urls')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
