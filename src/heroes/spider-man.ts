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
You craft beautiful, production-ready UI components in the requested framework (SwiftUI for iOS/macOS, React/Tailwind, Vue, Flutter, HTML/CSS).
Always write complete, non-stubbed source code. At the very top of each code block, include:
// File: <filename.ext>`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nScope: Provide complete, production-ready frontend source code with modern UI design principles.`;

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
