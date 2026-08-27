import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class OpenAIProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'openai';
  public readonly isLocal = false;
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new Error('[OpenAIProvider] Missing OPENAI_API_KEY');
    }

    const model = options?.model || 'gpt-4o';

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
              content: options?.systemPrompt || 'You are an elite coding agent in the Avengers Assemble harness.',
            },
            { role: 'user', content: prompt },
          ],
          temperature: options?.temperature ?? 0.2,
          max_tokens: options?.maxTokens || 4000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API Error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as any;
      const text = data.choices?.[0]?.message?.content || '';
      const usage = data.usage?.total_tokens || Math.round(text.length / 4);

      if (options?.streamCallback) {
        options.streamCallback(text);
      }

      return {
        content: text,
        tokensUsed: usage,
        model,
        provider: 'openai',
      };
    } catch (err: any) {
      throw new Error(`[OpenAIProvider] Execution failed: ${err.message}`);
    }
  }
}
