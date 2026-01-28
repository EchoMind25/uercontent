import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state'); // userId

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/settings?google=error`);
  }

  const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${siteUrl}/api/auth/google/callback`;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.refresh_token) {
      return NextResponse.redirect(`${siteUrl}/settings?google=error`);
    }

    const serviceSupabase = getSupabaseServiceRole();

    // Upsert refresh token into user_settings
    const { data: existing } = await serviceSupabase
      .from('user_settings')
      .select('id')
      .eq('user_id', state)
      .single();

    if (existing) {
      await serviceSupabase
        .from('user_settings')
        .update({ google_refresh_token: tokens.refresh_token })
        .eq('user_id', state);
    } else {
      await serviceSupabase
        .from('user_settings')
        .insert({
          user_id: state,
          google_refresh_token: tokens.refresh_token,
        });
    }

    return NextResponse.redirect(`${siteUrl}/settings?google=connected`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/settings?google=error`);
  }
}
