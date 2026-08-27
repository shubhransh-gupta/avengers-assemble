import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective } from '../types.js';

export class ThorHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('thor', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    this.setStatus('executing');
    this.speak(`⚡ Summoning the Bifrost! Forging lightning-fast Docker & CI/CD infrastructure for: "${directive.title}"`);

    const systemPrompt = `You are Thor Odinson, God of Thunder and Master of DevOps Infrastructure.
You generate multi-stage Dockerfiles, Kubernetes manifests, GitHub Actions workflows, and performant cloud deployment scripts with thunderous speed.`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nScope: Provide clean, production-ready DevOps configuration and build automation.`;

    const result = await this.queryLLM(prompt, systemPrompt);

    this.setStatus('victorious');
    this.metrics.tasksCompleted += 1;
    this.speak(`By the lightning of Mjolnir, infrastructure forged and deployment ready!`);

    return {
      success: true,
      output: result.text,
      tokensUsed: result.tokens,
      data: {
        dockerBuilt: true,
        ciWorkflowConfigured: true,
      },
    };
  }
}
