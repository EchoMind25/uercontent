import OpenAI from 'openai';

export async function generateGPTContent(params: {
  platform: 'IGFB' | 'YouTube';
  topic: string;
  contentType: string;
  researchContext: string;
  forbiddenPhrases?: string[];
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not configured');

  const openai = new OpenAI({ apiKey });
  const { platform, topic, contentType, researchContext, forbiddenPhrases = [] } = params;

  const platformGuide = platform === 'IGFB'
    ? 'Instagram/Facebook post: 150-250 words. Engaging opening hook, personal insight, call to action. Use line breaks for readability. Include 3-5 relevant hashtags at the end.'
    : 'YouTube video script outline: 300-500 words. Include: Hook (15 seconds), Intro, 3 Main Points, Call to Action. Write in a natural speaking style.';

  const systemPrompt = `You are writing social media content for Liz Sears at Utah's Elite Realtors.

Voice: Warm, approachable, knowledgeable about Utah real estate.
${platformGuide}

Rules:
- NEVER use em dash (\u2014)
- Avoid these phrases: ${forbiddenPhrases.join(', ')}
- Keep it authentic and conversational
- Reference Utah-specific details when relevant`;

  const userPrompt = `${researchContext ? `Research context:\n${researchContext}\n\n---\n\n` : ''}Topic: ${topic}
Content Type: ${contentType}

Write the ${platform} content now.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.85,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  return completion.choices[0].message.content || '';
}
