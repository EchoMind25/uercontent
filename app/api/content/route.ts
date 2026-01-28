import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';

const contentCreateSchema = z.object({
  platform: z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube']),
  contentType: z.enum(['Local', 'Market', 'Educational', 'Personal', 'Promotional']),
  topic: z.string().min(1),
  generatedText: z.string(),
  publishDate: z.string(),
  publishTime: z.string(),
  status: z.enum(['draft', 'approved', 'published', 'scheduled']).optional(),
  owner: z.string(),
});

const contentUpdateSchema = z.object({
  id: z.string().uuid(),
  platform: z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube']).optional(),
  contentType: z.enum(['Local', 'Market', 'Educational', 'Personal', 'Promotional']).optional(),
  topic: z.string().min(1).optional(),
  generatedText: z.string().optional(),
  publishDate: z.string().optional(),
  publishTime: z.string().optional(),
  status: z.enum(['draft', 'approved', 'published', 'scheduled']).optional(),
  owner: z.string().optional(),
});

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const platform = searchParams.get('platform');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const limit = parseInt(searchParams.get('limit') || '50', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  let query = supabase
    .from('content')
    .select('*')
    .eq('user_id', session.user.id)
    .order('publish_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (platform) query = query.eq('platform', platform);
  if (startDate) query = query.gte('publish_date', startDate);
  if (endDate) query = query.lte('publish_date', endDate);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Map snake_case DB columns to camelCase frontend types
  const items = (data || []).map((row) => ({
    id: row.id,
    platform: row.platform,
    contentType: row.content_type,
    topic: row.topic,
    generatedText: row.generated_text,
    publishDate: row.publish_date,
    publishTime: row.publish_time,
    status: row.status,
    owner: row.owner,
    calendarEventId: row.calendar_event_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));

  return NextResponse.json(items);
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
  const parsed = contentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.from('content').insert({
    user_id: session.user.id,
    platform: parsed.data.platform,
    content_type: parsed.data.contentType,
    topic: parsed.data.topic,
    generated_text: parsed.data.generatedText,
    publish_date: parsed.data.publishDate,
    publish_time: parsed.data.publishTime,
    status: parsed.data.status || 'draft',
    owner: parsed.data.owner,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    platform: data.platform,
    contentType: data.content_type,
    topic: data.topic,
    generatedText: data.generated_text,
    publishDate: data.publish_date,
    publishTime: data.publish_time,
    status: data.status,
    owner: data.owner,
    calendarEventId: data.calendar_event_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }, { status: 201 });
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
  const parsed = contentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { id, ...updates } = parsed.data;
  const dbUpdates = {
    ...(updates.platform !== undefined && { platform: updates.platform }),
    ...(updates.contentType !== undefined && { content_type: updates.contentType }),
    ...(updates.topic !== undefined && { topic: updates.topic }),
    ...(updates.generatedText !== undefined && { generated_text: updates.generatedText }),
    ...(updates.publishDate !== undefined && { publish_date: updates.publishDate }),
    ...(updates.publishTime !== undefined && { publish_time: updates.publishTime }),
    ...(updates.status !== undefined && { status: updates.status }),
    ...(updates.owner !== undefined && { owner: updates.owner }),
  };

  const { data, error } = await supabase
    .from('content')
    .update(dbUpdates)
    .eq('id', id)
    .eq('user_id', session.user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    platform: data.platform,
    contentType: data.content_type,
    topic: data.topic,
    generatedText: data.generated_text,
    publishDate: data.publish_date,
    publishTime: data.publish_time,
    status: data.status,
    owner: data.owner,
    calendarEventId: data.calendar_event_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  });
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
    .from('content')
    .delete()
    .eq('id', id)
    .eq('user_id', session.user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
