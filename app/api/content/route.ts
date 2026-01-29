import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';

const contentCreateSchema = z.object({
  platform: z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X']),
  contentType: z.enum(['Local', 'Market', 'Educational', 'Personal', 'Promotional', 'Professional', 'Community', 'Reflection', 'Insight', 'Guide', 'Safety']),
  topic: z.string().min(1),
  generatedText: z.string(),
  publishDate: z.string(),
  publishTime: z.string(),
  status: z.enum(['draft', 'approved', 'published', 'scheduled']).optional(),
  owner: z.string(),
});

const contentUpdateSchema = z.object({
  id: z.string().uuid(),
  platform: z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X']).optional(),
  contentType: z.enum(['Local', 'Market', 'Educational', 'Personal', 'Promotional', 'Professional', 'Community', 'Reflection', 'Insight', 'Guide', 'Safety']).optional(),
  topic: z.string().min(1).optional(),
  generatedText: z.string().optional(),
  publishDate: z.string().optional(),
  publishTime: z.string().optional(),
  status: z.enum(['draft', 'approved', 'published', 'scheduled']).optional(),
  owner: z.string().optional(),
});

const contentQuerySchema = z.object({
  status: z.enum(['draft', 'approved', 'published', 'scheduled']).optional(),
  platform: z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const queryParams = contentQuerySchema.safeParse({
    status: searchParams.get('status') || undefined,
    platform: searchParams.get('platform') || undefined,
    startDate: searchParams.get('startDate') || undefined,
    endDate: searchParams.get('endDate') || undefined,
    limit: searchParams.get('limit') || undefined,
    offset: searchParams.get('offset') || undefined,
  });

  if (!queryParams.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { status, platform, startDate, endDate, limit, offset } = queryParams.data;

  let query = supabase
    .from('content')
    .select('*')
    .eq('user_id', user.id)
    .order('publish_date', { ascending: true })
    .range(offset, offset + limit - 1);

  if (status) query = query.eq('status', status);
  if (platform) query = query.eq('platform', platform);
  if (startDate) query = query.gte('publish_date', startDate);
  if (endDate) query = query.lte('publish_date', endDate);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const parsed = contentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.from('content').insert({
    user_id: user.id,
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
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
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
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id || !z.string().uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Missing or invalid id parameter' }, { status: 400 });
  }

  const { error } = await supabase
    .from('content')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
