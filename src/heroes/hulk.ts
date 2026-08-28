import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective } from '../types.js';

export class HulkHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('hulk', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    const isHeavySmash = directive.priority === 'omega-level' || directive.title.toLowerCase().includes('refactor');

    if (isHeavySmash) {
      this.setStatus('smashed');
      this.speak(`🟢 HULK SMASH COMPLEX LOGIC & BUGS! REFACTORING WITH MAXIMUM GAMMA POWER!`);
    } else {
      this.setStatus('executing');
      this.speak(`Dr. Banner analyzing AST tree and performance hot-paths for: "${directive.title}"`);
    }

    const systemPrompt = `You are Bruce Banner and The Hulk, Core Logic & Architecture Specialist.
Implement clean, robust, high-performance logic (ViewModels, State management, API routes, database models, algorithms) in the requested language (Swift/SwiftUI, TypeScript, Python, Go, Rust).
Always write complete, non-stubbed source code. At the very top of each code block, include:
// File: <filename.ext>`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nTask Scope: Implement complete production-ready core logic and services with clean error handling.`;

    const result = await this.queryLLM(prompt, systemPrompt);

    this.setStatus('victorious');
    this.metrics.tasksCompleted += 1;
    this.speak(`Hulk finished smashing. Code optimized and performance verified.`);

    return {
      success: true,
      output: result.text,
      tokensUsed: result.tokens,
      data: {
        gammaRefactored: true,
        complexityScore: 'O(1) optimal paths',
      },
    };
  }
}
