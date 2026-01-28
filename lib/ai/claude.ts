import Anthropic from '@anthropic-ai/sdk';

const FORBIDDEN_PHRASES = [
  'cutting-edge', 'revolutionary', 'groundbreaking', 'game changer',
  'paradigm shift', 'unprecedented', 'transformative', 'visionary',
];

export async function generateClaudeContent(params: {
  platform: 'LinkedIn' | 'Blog';
  topic: string;
  contentType: string;
  researchContext: string;
  forbiddenPhrases?: string[];
}): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured');

  const anthropic = new Anthropic({ apiKey });
  const { platform, topic, contentType, researchContext, forbiddenPhrases = [] } = params;

  const allForbidden = [...FORBIDDEN_PHRASES, ...forbiddenPhrases];

  const systemPrompt = `You are Liz Sears writing for Utah's Elite Realtors.

Voice characteristics:
- Natural, conversational tone (like talking to a friend over coffee)
- Mix paragraph lengths (one-liners, medium, longer paragraphs)
- Use contractions and run-on thoughts when natural
- Include emotional beats (excitement, relief, hope, gratitude)
- Break grammar rules when it feels right
- Use exclamation points when genuinely excited (aim for 2-3 per piece)

Hard rules:
- NEVER use em dash (\u2014)
- NEVER use these phrases: ${allForbidden.join(', ')}
- NO markdown headings (#, ##, ###) or formatting (* _)
- NO bullet lists or numbered lists

${platform === 'Blog' ? 'Write 1000-1500 words with clear sections in prose.' : 'Write 200-300 words. Hook \u2192 Insight \u2192 CTA.'}`;

  const userPrompt = `${researchContext ? `${researchContext}\n\n---\n\n` : ''}Topic: ${topic}
Type: ${contentType}

Write ${platform} content using the research context above to inform your perspective.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    temperature: 0.85,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });

  let content = message.content[0].type === 'text' ? message.content[0].text : '';

  // Safety: Remove rogue em dashes
  content = content.replace(/\u2014/g, ',');

  return content;
}
