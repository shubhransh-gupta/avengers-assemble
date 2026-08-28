import {
  HeroId,
  HeroProfile,
  HeroStatus,
  HeroMetrics,
  MissionDirective,
  ProviderType,
} from '../types.js';
import { HERO_PROFILES } from '../config.js';
import { StarkCommsNetwork } from '../core/stark-comms.js';
import { ArcReactorPowerGrid } from '../core/arc-reactor.js';
import { BaseProvider } from '../providers/base-provider.js';

export interface HeroExecutionResult {
  success: boolean;
  output: string;
  tokensUsed: number;
  data?: Record<string, any>;
}

export abstract class BaseHero {
  public readonly profile: HeroProfile;
  public status: HeroStatus = 'idle';
  public metrics: HeroMetrics = {
    tasksCompleted: 0,
    tokensConsumed: 0,
    rateLimitHits: 0,
    powerLevelPct: 100,
  };

  protected comms = StarkCommsNetwork.getInstance();
  protected arcReactor: ArcReactorPowerGrid;
  protected providers: Map<ProviderType, BaseProvider>;

  constructor(
    heroId: HeroId,
    arcReactor: ArcReactorPowerGrid,
    providers: Map<ProviderType, BaseProvider>
  ) {
    this.profile = HERO_PROFILES[heroId];
    this.arcReactor = arcReactor;
    this.providers = providers;
  }

  public setStatus(newStatus: HeroStatus): void {
    this.status = newStatus;
    this.comms.send('system', 'all', 'telemetry', `Hero ${this.profile.name} status: ${newStatus}`, {
      heroId: this.profile.id,
      status: newStatus,
      metrics: this.metrics,
    });
  }

  abstract executeDirective(directive: MissionDirective): Promise<HeroExecutionResult>;

  protected async queryLLM(
    prompt: string,
    systemPrompt: string,
    preferredProvider?: ProviderType
  ): Promise<{ text: string; tokens: number; provider: ProviderType }> {
    const geminiProvider = this.providers.get('gemini');
    let targetProviderType: ProviderType = 'gemini';

    const preferred = preferredProvider || this.profile.preferredProvider;
    if (preferred && this.providers.get(preferred) && this.arcReactor.canExecute(preferred)) {
      targetProviderType = preferred;
    } else if (geminiProvider && this.arcReactor.canExecute('gemini')) {
      targetProviderType = 'gemini';
    } else {
      targetProviderType = this.arcReactor.getOptimalProvider(preferred);
    }

    const provider = this.providers.get(targetProviderType) || geminiProvider;
    if (!provider) {
      throw new Error(`[Hero ${this.profile.name}] No AI provider available. Please ensure GEMINI_API_KEY is configured.`);
    }

    try {
      const response = await provider.execute(prompt, {
        systemPrompt: `${systemPrompt}\n\nYou are ${this.profile.name} (${this.profile.callsign}), ${this.profile.title}. Catchphrase: "${this.profile.catchphrase}"`,
      });

      this.arcReactor.consumePower(response.provider, response.tokensUsed);
      this.metrics.tokensConsumed += response.tokensUsed;
      this.metrics.powerLevelPct = Math.max(
        10,
        100 - Math.min(90, Math.floor(this.metrics.tokensConsumed / 500))
      );

      return {
        text: response.content,
        tokens: response.tokensUsed,
        provider: response.provider,
      };
    } catch (err: any) {
      if (targetProviderType !== 'gemini' && geminiProvider) {
        try {
          const geminiResp = await geminiProvider.execute(prompt, {
            systemPrompt: `${systemPrompt}\n\nYou are ${this.profile.name} (${this.profile.callsign}), ${this.profile.title}. Catchphrase: "${this.profile.catchphrase}"`,
          });
          return {
            text: geminiResp.content,
            tokens: geminiResp.tokensUsed,
            provider: 'gemini',
          };
        } catch (geminiErr: any) {
          throw new Error(`[Hero ${this.profile.name}] Live AI execution failed: ${geminiErr.message}`);
        }
      }
      throw new Error(`[Hero ${this.profile.name}] Live AI execution failed: ${err.message}`);
    }
  }

  public speak(message: string, channel: 'war-room' | 'directives' | 'qa-audit' | 'security-recon' = 'war-room'): void {
    this.comms.send(this.profile.id, 'all', channel, message);
  }
}
