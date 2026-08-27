import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class ClaudeCodeProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'claude-code';
  public readonly isLocal = false;
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new Error('[ClaudeCodeProvider] Missing ANTHROPIC_API_KEY');
    }

    const model = options?.model || 'claude-3-7-sonnet-20250219';

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: options?.maxTokens || 4000,
          system: options?.systemPrompt || 'You are an elite coding agent in the Avengers Assemble harness.',
          messages: [{ role: 'user', content: prompt }],
          temperature: options?.temperature ?? 0.2,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API Error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as any;
      const text = data.content?.[0]?.text || '';
      const usage = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

      if (options?.streamCallback) {
        options.streamCallback(text);
      }

      return {
        content: text,
        tokensUsed: usage || Math.round(text.length / 4),
        model,
        provider: 'claude-code',
      };
    } catch (err: any) {
      throw new Error(`[ClaudeCodeProvider] Execution failed: ${err.message}`);
    }
  }
}
