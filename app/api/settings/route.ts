import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';

const settingsUpdateSchema = z.object({
  weeklyGenerationDay: z.number().int().min(0).max(6).optional(),
  weeklyGenerationTime: z.string().optional(),
  autoApproveEnabled: z.boolean().optional(),
  notificationEmail: z.string().email().optional(),
  forbiddenPhrases: z.array(z.string()).optional(),
});

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user settings
  const { data: settings, error: settingsError } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  if (settingsError && settingsError.code !== 'PGRST116') {
    // PGRST116 = no rows found, which is fine for new users
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  // Get forbidden phrases
  const { data: phrases, error: phrasesError } = await supabase
    .from('phrase_patterns')
    .select('phrase')
    .eq('user_id', session.user.id)
    .eq('is_forbidden', true);

  if (phrasesError) {
    return NextResponse.json({ error: phrasesError.message }, { status: 500 });
  }

  return NextResponse.json({
    weeklyGenerationDay: settings?.weekly_generation_day ?? 0,
    weeklyGenerationTime: settings?.weekly_generation_time ?? '18:00',
    autoApproveEnabled: settings?.auto_approve_enabled ?? false,
    notificationEmail: settings?.notification_email ?? session.user.email ?? '',
    forbiddenPhrases: (phrases || []).map((p) => p.phrase),
    googleCalendarConnected: !!settings?.google_refresh_token,
  });
}

export async function PUT(request: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }

  const supabase = await getSupabaseRouteHandler();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  // Upsert user settings
  const settingsData = {
    user_id: session.user.id,
    ...(parsed.data.weeklyGenerationDay !== undefined && { weekly_generation_day: parsed.data.weeklyGenerationDay }),
    ...(parsed.data.weeklyGenerationTime !== undefined && { weekly_generation_time: parsed.data.weeklyGenerationTime }),
    ...(parsed.data.autoApproveEnabled !== undefined && { auto_approve_enabled: parsed.data.autoApproveEnabled }),
    ...(parsed.data.notificationEmail !== undefined && { notification_email: parsed.data.notificationEmail }),
  };

  const { error: settingsError } = await supabase
    .from('user_settings')
    .upsert(settingsData, { onConflict: 'user_id' });

  if (settingsError) {
    return NextResponse.json({ error: settingsError.message }, { status: 500 });
  }

  // Update forbidden phrases if provided
  if (parsed.data.forbiddenPhrases !== undefined) {
    // Delete existing phrases
    await supabase
      .from('phrase_patterns')
      .delete()
      .eq('user_id', session.user.id)
      .eq('is_forbidden', true);

    // Insert new phrases
    if (parsed.data.forbiddenPhrases.length > 0) {
      const { error: phrasesError } = await supabase
        .from('phrase_patterns')
        .insert(
          parsed.data.forbiddenPhrases.map((phrase) => ({
            user_id: session.user.id,
            phrase,
            is_forbidden: true,
          }))
        );

      if (phrasesError) {
        return NextResponse.json({ error: phrasesError.message }, { status: 500 });
      }
    }
  }

  // Return updated settings
  const { data: updatedSettings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', session.user.id)
    .single();

  const { data: updatedPhrases } = await supabase
    .from('phrase_patterns')
    .select('phrase')
    .eq('user_id', session.user.id)
    .eq('is_forbidden', true);

  return NextResponse.json({
    weeklyGenerationDay: updatedSettings?.weekly_generation_day ?? 0,
    weeklyGenerationTime: updatedSettings?.weekly_generation_time ?? '18:00',
    autoApproveEnabled: updatedSettings?.auto_approve_enabled ?? false,
    notificationEmail: updatedSettings?.notification_email ?? '',
    forbiddenPhrases: (updatedPhrases || []).map((p) => p.phrase),
    googleCalendarConnected: !!updatedSettings?.google_refresh_token,
  });
}
