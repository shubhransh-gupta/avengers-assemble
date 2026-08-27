import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class MockProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'mock';
  public readonly isLocal = true;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    const tokens = Math.floor(400 + Math.random() * 800);
    const heroMatch = (options?.systemPrompt || '').toLowerCase();

    let responseText = '';

    if (heroMatch.includes('tony') || heroMatch.includes('iron man')) {
      responseText = `[JARVIS Telemetry]: Analyzing mission parameter: "${prompt}"
Tony Stark Directive Deconstruction:
1. Architecture Matrix verified.
2. Delegating UI/UX components to Spider-Man.
3. Assigning core logic & algorithms to Hulk.
4. Setting up containerization & CI pipeline with Thor.
5. Commissioning unit test barrage to Hawkeye.
6. Handing security reconnaissance to Black Widow.
7. Requiring final sign-off & audit from Captain America.

Directives uploaded to the Avengers Mesh. Let's get to work.`;
    } else if (heroMatch.includes('captain america') || heroMatch.includes('steve rogers')) {
      responseText = `[Captain America - QA Review]:
Inspecting code changes against project standards...
✓ Clean architecture & modular separation verified.
✓ TypeScript strict mode compliance: 100%.
✓ No race conditions or unhandled promise rejections detected.
✓ Ethical and secure practices maintained.

Vibranium Shield QA Stamp: APPROVED. You did good, soldier.`;
    } else if (heroMatch.includes('hulk') || heroMatch.includes('banner')) {
      responseText = `[Bruce Banner & The Hulk]:
Analyzing AST tree & algorithmic bottlenecks...
Banner analysis complete: Identified recursion boundary and memoized hot path.
Optimizing time complexity from O(N^2) to O(N log N).
HULK SMASHED 3 MEMORY LEAKS AND MERGED PR!`;
    } else if (heroMatch.includes('black widow') || heroMatch.includes('natasha')) {
      responseText = `[Black Widow - Security Recon]:
Scanning environment files and dependencies for attack vectors...
✓ Secret leak inspection: 0 keys exposed.
✓ Sanitized .env variables.
✓ Audited third-party npm packages against CVE databases.
✓ Cross-Origin & sanitization headers configured.
Ledger clean. System secured.`;
    } else if (heroMatch.includes('thor')) {
      responseText = `[Thor - God of Thunder]:
By the power of Mjolnir, forged high-voltage deployment!
✓ Multi-stage Dockerfile built.
✓ Kubernetes deployment manifest & service ingress calibrated.
✓ CI/CD workflow activated.
All systems lightning-fast!`;
    } else if (heroMatch.includes('hawkeye') || heroMatch.includes('clint')) {
      responseText = `[Hawkeye - Precision Sniper]:
Zeroing in on edge cases and boundary assertions...
✓ 18 unit tests written and passing.
✓ 0 failing assertions.
✓ Code coverage achieved: 94.8%.
Never missed a bug. Target neutralized.`;
    } else if (heroMatch.includes('spider-man') || heroMatch.includes('peter')) {
      responseText = `[Spider-Man - Frontend Hero]:
Spun up a reactive, responsive user interface component!
✓ Tailwind CSS classes optimized.
✓ Framer-motion fluid micro-animations added.
✓ Dark/Light mode theme awareness synced.
Web components ready!`;
    } else if (heroMatch.includes('doctor strange')) {
      responseText = `[Doctor Strange - Time Stone]:
Opening the Eye of Agamotto...
Simulated 14,000,605 future architectural branches.
Selected optimal timeline branch (98.4% success probability).
Temporal snapshot preserved for instantaneous rollback.`;
    } else if (heroMatch.includes('vision')) {
      responseText = `[Vision - Mind Stone Knowledge]:
Synthesized project context with org knowledge base.
Indexed 4 architectural conventions and 2 previous bug resolutions.
Team memory synchronized across the mesh.`;
    } else {
      responseText = `[STARK Mission Execution]:
Successfully processed task: "${prompt}".
Generated modular implementation and verified with team protocols.`;
    }

    if (options?.streamCallback) {
      const chunks = responseText.split(' ');
      for (const chunk of chunks) {
        options.streamCallback(`${chunk} `);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    }

    return {
      content: responseText,
      tokensUsed: tokens,
      model: 'stark-simulator-v1',
      provider: 'mock',
    };
  }
}
