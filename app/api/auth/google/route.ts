import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';
import { isGoogleCalendarConfigured } from '@/lib/calendar/google-calendar';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ error: 'Google Calendar not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'));
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    state: user.id,
  });

  return NextResponse.redirect(authUrl);
}
