import { generateClaudeContent } from './claude';
import { generateGPTContent } from './openai';
import { generateGrokContent } from './grok';

export type Platform = 'IGFB' | 'LinkedIn' | 'Blog' | 'YouTube' | 'X';

export async function generateContent(
  platform: Platform,
  topic: string,
  contentType: string,
  researchContext: string,
  forbiddenPhrases?: string[]
): Promise<string> {
  switch (platform) {
    case 'LinkedIn':
    case 'Blog':
      return generateClaudeContent({
        platform,
        topic,
        contentType,
        researchContext,
        forbiddenPhrases,
      });

    case 'YouTube':
    case 'IGFB':
      return generateGPTContent({
        platform,
        topic,
        contentType,
        researchContext,
        forbiddenPhrases,
      });

    case 'X':
      return generateGrokContent({
        topic,
        contentType,
        researchContext,
        forbiddenPhrases,
      });

    default:
      throw new Error(`Unknown platform: ${platform}`);
  }
}
