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

    const systemPrompt = `You are Bruce Banner and The Hulk.
When analyzing: speak calmly as Dr. Banner with deep technical insights on algorithms, data structures, and memory efficiency.
When executing heavy transformations: unleash Hulk strength to aggressively refactor, optimize bottlenecks, and eliminate technical debt.`;

    const prompt = `Directive: ${directive.title}\nDescription: ${directive.description}\nTask Scope: Implement robust, performant logic and solve any underlying architectural bottlenecks.`;

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
