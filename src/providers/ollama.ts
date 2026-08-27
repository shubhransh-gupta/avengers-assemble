import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class OllamaProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'ollama';
  public readonly isLocal = true;
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', defaultModel = 'deepseek-r1:latest') {
    super();
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/api/tags`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    const model = options?.model || this.defaultModel;

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: options?.systemPrompt,
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama Error (${response.status})`);
      }

      const data = (await response.json()) as any;
      const text = data.response || '';
      const usage = (data.prompt_eval_count || 0) + (data.eval_count || 0) || Math.round(text.length / 4);

      return {
        content: text,
        tokensUsed: usage,
        model,
        provider: 'ollama',
      };
    } catch (err: any) {
      throw new Error(`[OllamaProvider] Execution failed: ${err.message}`);
    }
  }
}
