import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { createCalendarEvent, createCalendarEventWithRefreshToken, isGoogleCalendarConfigured } from '@/lib/calendar/google-calendar';

const syncSchema = z.object({
  contentId: z.string().uuid(),
  accessToken: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ error: 'Google Calendar not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = syncSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const serviceSupabase = getSupabaseServiceRole();

  // Get content item
  const { data: content, error: contentError } = await serviceSupabase
    .from('content')
    .select('*')
    .eq('id', parsed.data.contentId)
    .eq('user_id', session.user.id)
    .single();

  if (contentError || !content) {
    return NextResponse.json({ error: 'Content not found' }, { status: 404 });
  }

  // Determine access method: direct token or stored refresh token
  const accessToken = parsed.data.accessToken;
  let refreshToken: string | null = null;

  if (!accessToken) {
    const { data: settings } = await serviceSupabase
      .from('user_settings')
      .select('google_refresh_token')
      .eq('user_id', session.user.id)
      .single();

    refreshToken = settings?.google_refresh_token ?? null;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No Google Calendar access. Connect Google Calendar in Settings.' },
        { status: 403 }
      );
    }
  }

  try {
    let event: { eventId: string; htmlLink: string };

    if (accessToken) {
      event = await createCalendarEvent({
        accessToken,
        title: content.topic,
        description: content.generated_text,
        date: content.publish_date,
        time: content.publish_time,
        platform: content.platform,
      });
    } else {
      event = await createCalendarEventWithRefreshToken({
        refreshToken: refreshToken!,
        title: content.topic,
        description: content.generated_text,
        date: content.publish_date,
        time: content.publish_time,
        platform: content.platform,
      });
    }

    // Store calendar event ID in content record
    await serviceSupabase
      .from('content')
      .update({
        status: 'scheduled',
        calendar_event_id: event.eventId,
      })
      .eq('id', content.id);

    return NextResponse.json({
      success: true,
      calendarEventId: event.eventId,
      calendarUrl: event.htmlLink,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Calendar sync failed' },
      { status: 500 }
    );
  }
}
