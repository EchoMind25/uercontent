import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';

const approveSchema = z.object({
  contentId: z.string().uuid(),
});

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
  const parsed = approveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('content')
    .update({ status: 'approved' })
    .eq('id', parsed.data.contentId)
    .eq('user_id', user.id)
    .eq('status', 'draft')
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Content not found or not in draft status' }, { status: 404 });
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
