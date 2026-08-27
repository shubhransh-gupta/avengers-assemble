import { ProviderType } from '../types.js';

export interface ProviderExecutionOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  streamCallback?: (chunk: string) => void;
}

export interface ProviderResponse {
  content: string;
  tokensUsed: number;
  model: string;
  provider: ProviderType;
  finishReason?: string;
}

export abstract class BaseProvider {
  public abstract readonly providerType: ProviderType;
  public abstract readonly isLocal: boolean;

  abstract isAvailable(): Promise<boolean>;

  abstract execute(
    prompt: string,
    options?: ProviderExecutionOptions
  ): Promise<ProviderResponse>;
}
