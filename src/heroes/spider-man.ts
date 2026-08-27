import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective } from '../types.js';

export class SpiderManHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('spider-man', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    this.setStatus('executing');
    this.speak(`🕸️ Your friendly neighborhood frontend hero is swinging in! Building responsive UI for: "${directive.title}"`);

    const systemPrompt = `You are Spider-Man (Peter Parker), Frontend Hero & UI/UX Specialist.
You craft beautiful, accessible, responsive components in modern React, Tailwind CSS, TypeScript, and interactive micro-animations.`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nScope: Provide clean, interactive frontend code with modern UI design principles.`;

    const result = await this.queryLLM(prompt, systemPrompt);

    this.setStatus('victorious');
    this.metrics.tasksCompleted += 1;
    this.speak(`Web components spun and ready! Responsive, accessible, and looking super clean.`);

    return {
      success: true,
      output: result.text,
      tokensUsed: result.tokens,
      data: {
        componentTreeCreated: true,
        responsiveDesign: 'mobile-first',
      },
    };
  }
}
