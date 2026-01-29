import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseRouteHandler, isSupabaseConfigured } from '@/lib/supabase/server';
import { getSupabaseServiceRole } from '@/lib/supabase/server';
import { generateContent, Platform } from '@/lib/ai/router';
import { buildResearchContext } from '@/lib/research/context-builder';
import { checkSimilarity, storeEmbedding } from '@/lib/vectors/similarity';
import { scrapeAllActive } from '@/lib/research/scraper';

const generateWeekSchema = z.object({
  startDate: z.string(), // YYYY-MM-DD format (Monday)
  platforms: z.array(z.enum(['IGFB', 'LinkedIn', 'Blog', 'YouTube', 'X'])).optional(),
  researchFirst: z.boolean().optional(),
  autoApprove: z.boolean().optional(),
});

// Content schedule template — which platforms publish on which days
const WEEKLY_SCHEDULE: Array<{
  dayOffset: number;
  platform: Platform;
  contentType: string;
  publishTime: string;
}> = [
  // Monday
  { dayOffset: 0, platform: 'IGFB', contentType: 'Local', publishTime: '9:00 AM' },
  { dayOffset: 0, platform: 'LinkedIn', contentType: 'Market', publishTime: '10:00 AM' },
  // Tuesday
  { dayOffset: 1, platform: 'IGFB', contentType: 'Educational', publishTime: '9:00 AM' },
  { dayOffset: 1, platform: 'Blog', contentType: 'Educational', publishTime: '2:00 PM' },
  // Wednesday
  { dayOffset: 2, platform: 'IGFB', contentType: 'Personal', publishTime: '9:00 AM' },
  { dayOffset: 2, platform: 'LinkedIn', contentType: 'Professional', publishTime: '10:00 AM' },
  // Thursday
  { dayOffset: 3, platform: 'IGFB', contentType: 'Market', publishTime: '9:00 AM' },
  { dayOffset: 3, platform: 'YouTube', contentType: 'Educational', publishTime: '3:00 PM' },
  // Friday
  { dayOffset: 4, platform: 'IGFB', contentType: 'Promotional', publishTime: '9:00 AM' },
  { dayOffset: 4, platform: 'LinkedIn', contentType: 'Insight', publishTime: '10:00 AM' },
  // Saturday
  { dayOffset: 5, platform: 'IGFB', contentType: 'Community', publishTime: '10:00 AM' },
  // Sunday
  { dayOffset: 6, platform: 'IGFB', contentType: 'Reflection', publishTime: '11:00 AM' },
];

// Topic idea pool per content type
const TOPIC_SEEDS: Record<string, string[]> = {
  Local: [
    'Hidden gem restaurants in Salt Lake Valley',
    'Best hiking trails near Utah neighborhoods',
    'Local events this weekend in Utah County',
    'New businesses opening in the Wasatch Front',
    'Utah seasonal activities families love',
  ],
  Market: [
    'Utah housing market update and trends',
    'Interest rate impact on Utah buyers',
    'Salt Lake County vs Utah County market comparison',
    'First-time buyer opportunities in Utah',
    'Inventory trends in the Wasatch Front',
  ],
  Educational: [
    'Home inspection tips for Utah buyers',
    'Understanding Utah property taxes',
    'How to prepare your Utah home for winter',
    'Mortgage pre-approval process explained',
    'What to know about HOAs in Utah',
  ],
  Personal: [
    'Why I love being a Utah realtor',
    'A day in my life as a real estate agent',
    'Lessons learned from my recent closings',
    'My favorite Utah neighborhoods and why',
    'What clients teach me about homeownership',
  ],
  Promotional: [
    'New listing spotlight in the Salt Lake area',
    'Open house this weekend',
    'Just sold celebration',
    'Client testimonial and success story',
    'Why work with Utah\'s Elite Realtors',
  ],
  Professional: [
    'Negotiation strategies that work in Utah',
    'How I help sellers maximize their home value',
    'The importance of local market knowledge',
    'Behind the scenes of a real estate transaction',
    'Professional development in real estate',
  ],
  Community: [
    'Supporting local Utah charities and events',
    'Neighborhood spotlight and community features',
    'Utah school district updates for families',
    'Local business partnerships and recommendations',
    'Community safety tips and resources',
  ],
  Reflection: [
    'Grateful for another week helping Utah families',
    'Sunday thoughts on the meaning of home',
    'Looking back at this week\'s wins',
    'What home means to different people',
    'The journey of finding your perfect home',
  ],
  Insight: [
    'Real estate technology trends in 2026',
    'How remote work is changing Utah housing',
    'Sustainability in Utah real estate',
    'The future of homebuying in Utah',
    'Investment property insights for Utah',
  ],
  Guide: [
    'Step-by-step guide to buying in Utah',
    'Complete guide to selling your Utah home',
    'Moving to Utah: everything you need to know',
    'Utah relocation guide for remote workers',
    'First-time homebuyer roadmap',
  ],
  Safety: [
    'Home safety checklist for Utah seasons',
    'Wildfire preparedness for Utah homeowners',
    'Winter storm preparation for your home',
    'Home security tips for Utah families',
    'Earthquake readiness in the Wasatch Front',
  ],
};

function pickTopic(contentType: string): string {
  const seeds = TOPIC_SEEDS[contentType] || TOPIC_SEEDS['Local'];
  return seeds[Math.floor(Math.random() * seeds.length)];
}

function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
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
  const parsed = generateWeekSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { startDate, platforms, researchFirst = true, autoApprove = false } = parsed.data;
  const serviceSupabase = getSupabaseServiceRole();

  // Create generation job
  const { data: job, error: jobError } = await serviceSupabase
    .from('generation_jobs')
    .insert({
      user_id: user.id,
      status: 'running',
      week_start_date: startDate,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (jobError) {
    return NextResponse.json({ error: 'Failed to create generation job' }, { status: 500 });
  }

  // Get user's forbidden phrases
  const { data: phrases } = await serviceSupabase
    .from('phrase_patterns')
    .select('phrase')
    .eq('user_id', user.id)
    .eq('is_forbidden', true);

  const forbiddenPhrases = (phrases || []).map((p) => p.phrase);

  // Optionally scrape research first
  if (researchFirst) {
    try {
      await scrapeAllActive();
    } catch {
      // Research scraping is non-critical
    }
  }

  // Build research context
  let researchContext = '';
  try {
    researchContext = await buildResearchContext({ daysBack: 14, maxItems: 10 });
  } catch {
    // Non-critical
  }

  // Filter schedule by requested platforms
  const schedule = platforms
    ? WEEKLY_SCHEDULE.filter((s) => platforms.includes(s.platform))
    : WEEKLY_SCHEDULE;

  const generatedItems: Array<{ id: string; platform: string; topic: string; publishDate: string; status: string }> = [];
  let failedCount = 0;

  for (const slot of schedule) {
    const publishDate = addDaysToDate(startDate, slot.dayOffset);
    const topic = pickTopic(slot.contentType);

    try {
      // Check similarity against existing content
      const { isSimilar } = await checkSimilarity(topic, '', user.id);
      const finalTopic = isSimilar ? `${topic} (fresh perspective)` : topic;

      // Generate content
      const generatedText = await generateContent(
        slot.platform,
        finalTopic,
        slot.contentType,
        researchContext,
        forbiddenPhrases
      );

      // Store in database
      const { data: contentItem, error: contentError } = await serviceSupabase
        .from('content')
        .insert({
          user_id: user.id,
          platform: slot.platform,
          content_type: slot.contentType,
          topic: finalTopic,
          generated_text: generatedText,
          publish_date: publishDate,
          publish_time: slot.publishTime,
          status: autoApprove ? 'approved' : 'draft',
          owner: 'Liz Sears',
        })
        .select('id, platform, topic, publish_date, status')
        .single();

      if (contentError) {
        failedCount++;
        continue;
      }

      generatedItems.push({
        id: contentItem.id,
        platform: contentItem.platform,
        topic: contentItem.topic,
        publishDate: contentItem.publish_date,
        status: contentItem.status,
      });

      // Store embedding asynchronously (non-blocking)
      storeEmbedding(contentItem.id, `${finalTopic} ${generatedText.substring(0, 500)}`).catch(() => {});
    } catch {
      failedCount++;
    }
  }

  // Update job status
  await serviceSupabase
    .from('generation_jobs')
    .update({
      status: failedCount === schedule.length ? 'failed' : 'completed',
      items_generated: generatedItems.length,
      error_message: failedCount > 0 ? `${failedCount} items failed to generate` : null,
      completed_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  return NextResponse.json({
    jobId: job.id,
    status: failedCount === schedule.length ? 'failed' : 'completed',
    itemsGenerated: generatedItems.length,
    itemsFailed: failedCount,
    contentItems: generatedItems,
  });
}
