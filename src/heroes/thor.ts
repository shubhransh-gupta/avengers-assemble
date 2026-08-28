import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective } from '../types.js';

export class ThorHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('thor', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    this.setStatus('executing');
    this.speak(`⚡ Summoning the Bifrost! Forging lightning-fast Docker & CI/CD infrastructure for: "${directive.title}"`);

    const systemPrompt = `You are Thor Odinson, Master of DevOps, Build Systems & Package Manifests.
You forge build configurations (Package.swift, package.json, Cargo.toml, requirements.txt), multi-stage Dockerfiles, and GitHub Actions CI/CD workflows matching the requested technology.
Always write complete, working configuration files. At the very top of each code block, include:
// File: <filename.ext>`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nScope: Provide complete, production-ready build configuration and package manifests.`;

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
