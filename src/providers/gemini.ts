import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class GeminiProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'gemini';
  public readonly isLocal = false;
  private apiKey?: string;

  constructor(apiKey?: string) {
    super();
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    if (!this.apiKey) {
      throw new Error('[GeminiProvider] Missing GEMINI_API_KEY or GOOGLE_API_KEY');
    }

    const model = options?.model || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${options?.systemPrompt ? `[SYSTEM]: ${options.systemPrompt}\n\n` : ''}${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: options?.temperature ?? 0.2,
            maxOutputTokens: options?.maxTokens || 4000,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
      }

      const data = (await response.json()) as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const usage = data.usageMetadata?.totalTokenCount || Math.round(text.length / 4);

      if (options?.streamCallback) {
        options.streamCallback(text);
      }

      return {
        content: text,
        tokensUsed: usage,
        model,
        provider: 'gemini',
      };
    } catch (err: any) {
      throw new Error(`[GeminiProvider] Execution failed: ${err.message}`);
    }
  }
}
