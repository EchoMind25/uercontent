import OpenAI from 'openai';
import { getSupabaseServiceRole } from '@/lib/supabase/server';

export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const openai = new OpenAI({ apiKey });

  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text.substring(0, 8000),
  });

  return response.data[0].embedding;
}

export async function checkSimilarity(
  topic: string,
  content: string,
  userId?: string
): Promise<{
  isSimilar: boolean;
  similarItems: Array<{ id: string; topic: string; similarity: number }>;
}> {
  try {
    const embedding = await generateEmbedding(`${topic} ${content.substring(0, 500)}`);
    const supabase = getSupabaseServiceRole();

    const { data: similar } = await supabase.rpc('match_content', {
      query_embedding: embedding,
      match_threshold: 0.75,
      match_count: 3,
      ...(userId && { filter_user_id: userId }),
    });

    const isSimilar = !!(similar && similar.length > 0 && similar[0].similarity > 0.75);

    return {
      isSimilar,
      similarItems: similar || [],
    };
  } catch {
    // If similarity check fails (no embeddings, no OpenAI key, etc.), allow generation
    return { isSimilar: false, similarItems: [] };
  }
}

export async function storeEmbedding(contentId: string, text: string): Promise<void> {
  try {
    const embedding = await generateEmbedding(text);
    const supabase = getSupabaseServiceRole();

    await supabase
      .from('content')
      .update({ embedding } as Record<string, unknown>)
      .eq('id', contentId);
  } catch {
    // Embedding storage is non-critical — silently fail
  }
}
