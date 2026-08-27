import { EventEmitter } from 'node:events';
import { ProviderType, ArcReactorState, StarkConfig } from '../types.js';

interface TokenEvent {
  timestamp: number;
  tokens: number;
  provider: ProviderType;
}

export class ArcReactorPowerGrid extends EventEmitter {
  private config: StarkConfig['arcReactor'];
  private tokenHistory: TokenEvent[] = [];
  private cooldowns: Map<ProviderType, number> = new Map();

  constructor(config: StarkConfig['arcReactor']) {
    super();
    this.config = config;
  }

  public consumePower(provider: ProviderType, tokens: number): boolean {
    const now = Date.now();
    this.cleanExpiredEvents(now);

    const providerConfig = this.config.providers[provider];
    if (!providerConfig || !providerConfig.enabled) {
      return false;
    }

    const currentUsage = this.getProviderUsageInWindow(provider, now);
    const limit = providerConfig.hourlyTokenLimit || this.config.maxHourlyTokens;

    if (currentUsage + tokens > limit) {
      const cooldownUntil = now + 1000 * 60 * 15;
      this.cooldowns.set(provider, cooldownUntil);
      this.emit('throttle', { provider, currentUsage, limit, cooldownUntil });
      return false;
    }

    this.tokenHistory.push({
      timestamp: now,
      tokens,
      provider,
    });

    this.emit('power-consumed', { provider, tokens, state: this.getState() });
    return true;
  }

  public canExecute(provider: ProviderType, estimatedTokens = 2000): boolean {
    const now = Date.now();
    this.cleanExpiredEvents(now);

    const cooldownUntil = this.cooldowns.get(provider);
    if (cooldownUntil && now < cooldownUntil) {
      return false;
    } else if (cooldownUntil && now >= cooldownUntil) {
      this.cooldowns.delete(provider);
    }

    const providerConfig = this.config.providers[provider];
    if (!providerConfig || !providerConfig.enabled) {
      return false;
    }

    const usage = this.getProviderUsageInWindow(provider, now);
    const limit = providerConfig.hourlyTokenLimit || this.config.maxHourlyTokens;
    return usage + estimatedTokens <= limit;
  }

  public getOptimalProvider(preferred: ProviderType = 'claude-code'): ProviderType {
    if (this.canExecute(preferred)) {
      return preferred;
    }

    const availableProviders: Array<{ provider: ProviderType; priority: number; remainingPct: number }> = [];

    for (const [key, pConfig] of Object.entries(this.config.providers) as Array<[ProviderType, any]>) {
      if (pConfig && pConfig.enabled && this.canExecute(key)) {
        const state = this.getProviderState(key);
        availableProviders.push({
          provider: key,
          priority: pConfig.priority || 99,
          remainingPct: state.powerRemainingPct,
        });
      }
    }

    if (availableProviders.length === 0) {
      return 'mock';
    }

    availableProviders.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return b.remainingPct - a.remainingPct;
    });

    return availableProviders[0].provider;
  }

  public getState(): ArcReactorState {
    const now = Date.now();
    this.cleanExpiredEvents(now);

    let totalTokens = 0;
    const providerStatus: ArcReactorState['providerStatus'] = {} as any;

    const allProviders: ProviderType[] = ['claude-code', 'gemini', 'openai', 'grok', 'ollama', 'mock'];

    for (const p of allProviders) {
      const pConfig = this.config.providers[p];
      const limit = pConfig?.hourlyTokenLimit || this.config.maxHourlyTokens;
      const used = this.getProviderUsageInWindow(p, now);
      totalTokens += used;

      const coolingDownUntil = this.cooldowns.get(p);
      const isCooling = Boolean(coolingDownUntil && now < coolingDownUntil);

      providerStatus[p] = {
        enabled: Boolean(pConfig?.enabled),
        hourlyLimit: limit,
        usedInCurrentWindow: used,
        powerRemainingPct: Math.max(0, Math.round(((limit - used) / limit) * 100)),
        coolingDownUntil: isCooling ? coolingDownUntil : undefined,
      };
    }

    const totalCap = this.config.maxHourlyTokens;
    const powerLevelPct = Math.max(0, Math.min(100, Math.round(((totalCap - totalTokens) / totalCap) * 100)));

    return {
      totalCapacityPerHour: totalCap,
      currentConsumption: totalTokens,
      hourlyPowerLevelPct: powerLevelPct,
      isThrottled: powerLevelPct < (100 - this.config.throttleThresholdPct),
      providerStatus,
    };
  }

  private getProviderUsageInWindow(provider: ProviderType, now: number): number {
    const windowMs = this.config.rollingWindowHours * 60 * 60 * 1000;
    const windowStart = now - windowMs;

    return this.tokenHistory
      .filter((e) => e.provider === provider && e.timestamp >= windowStart)
      .reduce((sum, e) => sum + e.tokens, 0);
  }

  private getProviderState(provider: ProviderType) {
    const now = Date.now();
    const pConfig = this.config.providers[provider];
    const limit = pConfig?.hourlyTokenLimit || this.config.maxHourlyTokens;
    const used = this.getProviderUsageInWindow(provider, now);
    return {
      used,
      limit,
      powerRemainingPct: Math.max(0, Math.round(((limit - used) / limit) * 100)),
    };
  }

  private cleanExpiredEvents(now: number): void {
    const windowMs = this.config.rollingWindowHours * 60 * 60 * 1000;
    const windowStart = now - windowMs;
    this.tokenHistory = this.tokenHistory.filter((e) => e.timestamp >= windowStart);
  }
}
