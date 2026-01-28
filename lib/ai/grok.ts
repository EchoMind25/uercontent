export async function generateGrokContent(params: {
  topic: string;
  contentType: string;
  researchContext: string;
  forbiddenPhrases?: string[];
}): Promise<string> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) throw new Error('GROK_API_KEY is not configured');

  const { topic, contentType, researchContext, forbiddenPhrases = [] } = params;

  const systemPrompt = `You are writing an X (Twitter) post for Liz Sears at Utah's Elite Realtors.

Rules:
- Maximum 280 characters
- Punchy, engaging, and direct
- Include relevant hashtag(s) if space allows
- Avoid: ${forbiddenPhrases.join(', ')}
- Reference Utah real estate when relevant`;

  const userPrompt = `${researchContext ? `Context: ${researchContext.substring(0, 500)}\n\n` : ''}Topic: ${topic}
Type: ${contentType}

Write an X post.`;

  // Grok uses OpenAI-compatible API format
  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'grok-3',
      temperature: 0.85,
      max_tokens: 256,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Grok API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content || '';
}
