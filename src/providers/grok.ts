import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class GrokProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'grok';
  public readonly isLocal = false;
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.XAI_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new Error('[GrokProvider] Missing XAI_API_KEY');
    }

    const model = options?.model || 'grok-beta';

    try {
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: options?.systemPrompt || 'You are Thor / Grok agent in Avengers Assemble harness.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`xAI API Error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      const usage = data.usage?.total_tokens || Math.round(text.length / 4);

      return {
        content: text,
        tokensUsed: usage,
        model,
        provider: 'grok',
      };
    } catch (err: any) {
      throw new Error(`[GrokProvider] Execution failed: ${err.message}`);
    }
  }
}
