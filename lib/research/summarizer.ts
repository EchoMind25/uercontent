import Anthropic from '@anthropic-ai/sdk';

export async function summarizeContent(
  content: string,
  category: string
): Promise<{
  text: string;
  keyPoints: Array<{ point: string; relevance: string }>;
}> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }

  const anthropic = new Anthropic({ apiKey });

  const prompt = `You are summarizing research content for Utah real estate content creation.

Category: ${category}

Content to summarize:
${content.substring(0, 8000)}

Extract:
1. A concise summary (150-200 words) of key insights relevant to Utah real estate professionals
2. 3-5 bullet points of actionable insights

Format as JSON:
{
  "summary": "...",
  "keyPoints": [
    { "point": "...", "relevance": "Why this matters for content" }
  ]
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [{ role: 'user', content: prompt }],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Extract JSON from response (handle markdown code blocks)
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      text: responseText.substring(0, 500),
      keyPoints: [],
    };
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    text: parsed.summary || responseText.substring(0, 500),
    keyPoints: parsed.keyPoints || [],
  };
}
