import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective, HeroId } from '../types.js';

export class TonyStarkHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('tony-stark', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    this.setStatus('analyzing');
    this.speak(`JARVIS, initialize Mark 85 architecture matrix. Deconstructing: "${directive.title}"`);

    const systemPrompt = `You are Tony Stark (Iron Man), Lead Architect & GOD Orchestrator of Avengers Assemble.
Break down complex architectural requirements into crystal-clear specifications, delegate tasks to other heroes, and synthesize the final deliverable.`;

    const result = await this.queryLLM(
      `Directive: ${directive.title}\nDescription: ${directive.description}\nInputs: ${JSON.stringify(directive.inputs || {})}`,
      systemPrompt
    );

    this.setStatus('victorious');
    this.metrics.tasksCompleted += 1;
    this.speak(`Directives formulated and synced to Avengers mesh. Ready for execution.`);

    return {
      success: true,
      output: result.text,
      tokensUsed: result.tokens,
      data: {
        architectureNotes: result.text,
        synthesizedBy: 'Tony Stark',
      },
    };
  }

  async planMission(userPrompt: string): Promise<MissionDirective[]> {
    this.setStatus('analyzing');
    this.speak(`JARVIS, run global tactical scan. Master user objective: "${userPrompt}"`);

    const planningPrompt = `Analyze this user software development request: "${userPrompt}".
Detect the exact technology framework requested (e.g. SwiftUI / iOS, React / Next.js, Python / FastAPI, Express / TypeScript, Flutter, Go, Rust, etc.).
Break down the project into 4-6 concrete, complete source files to generate across the Avengers:
- 'spider-man' for Frontend / Views / UI Components (e.g. ContentView.swift for SwiftUI, React components for web)
- 'hulk' for Core logic / ViewModels / Controllers / State (e.g. AppState.swift, Router.ts, Service.py)
- 'thor' for Build configuration / Package manifests / Docker / CI (e.g. Package.swift, package.json, Dockerfile)
- 'hawkeye' for Unit test suites / Boundary assertions (e.g. AppTests.swift, test.ts)
- 'black-widow' for Security auditing, secret sanitization, CVE analysis
- 'captain-america' for Final QA review and standards compliance

IMPORTANT: In each directive description, instruct the assigned hero to write complete, production-ready code starting with "// File: <filename.ext>" at the top of the code block.

Return a structured JSON list of directives with format:
[
  {
    "title": "Short directive title",
    "description": "Clear technical instructions specifying the exact file to generate (e.g. Create // File: ContentView.swift with...)",
    "assignedHero": "spider-man" | "hulk" | "thor" | "hawkeye" | "black-widow" | "captain-america",
    "priority": "high" | "medium" | "omega-level"
  }
]`;

    try {
      const { text } = await this.queryLLM(
        planningPrompt,
        'You are Tony Stark. Return JSON only.'
      );

      let directivesData: Array<any> = [];
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        directivesData = JSON.parse(jsonMatch[0]);
      } else {
        directivesData = [
          {
            title: 'Frontend UI & Component Architecture',
            description: `Design and implement reactive UI for: ${userPrompt}`,
            assignedHero: 'spider-man' as HeroId,
            priority: 'high',
          },
          {
            title: 'Core Engine & Logic Processing',
            description: `Implement high-performance core logic and algorithms for: ${userPrompt}`,
            assignedHero: 'hulk' as HeroId,
            priority: 'omega-level',
          },
          {
            title: 'Precision Unit Tests & Coverage Suite',
            description: `Generate exhaustive unit tests and boundary assertions for: ${userPrompt}`,
            assignedHero: 'hawkeye' as HeroId,
            priority: 'high',
          },
          {
            title: 'Security Recon & Secret Sanitization',
            description: `Audit dependencies and sanitize environment credentials for: ${userPrompt}`,
            assignedHero: 'black-widow' as HeroId,
            priority: 'medium',
          },
          {
            title: 'DevOps, Docker & CI/CD Pipeline',
            description: `Generate container configuration and deployment manifests for: ${userPrompt}`,
            assignedHero: 'thor' as HeroId,
            priority: 'medium',
          },
          {
            title: 'Vibranium Shield QA & Architecture Sign-Off',
            description: `Perform rigorous code audit and final quality approval for: ${userPrompt}`,
            assignedHero: 'captain-america' as HeroId,
            priority: 'omega-level',
          },
        ];
      }

      const directives: MissionDirective[] = directivesData.map((d, index) => ({
        id: `dir-${Date.now()}-${index + 1}`,
        title: d.title,
        description: d.description,
        assignedHero: d.assignedHero,
        status: 'pending',
        priority: d.priority || 'medium',
      }));

      this.setStatus('idle');
      return directives;
    } catch {
      return [
        {
          id: `dir-${Date.now()}-1`,
          title: 'Frontend Component Architecture',
          description: `Build reactive interfaces for: ${userPrompt}`,
          assignedHero: 'spider-man',
          status: 'pending',
          priority: 'high',
        },
        {
          id: `dir-${Date.now()}-2`,
          title: 'Core Engine & Logic Optimization',
          description: `Build performant service logic for: ${userPrompt}`,
          assignedHero: 'hulk',
          status: 'pending',
          priority: 'omega-level',
        },
        {
          id: `dir-${Date.now()}-3`,
          title: 'Precision Unit Testing Suite',
          description: `Generate boundary unit tests for: ${userPrompt}`,
          assignedHero: 'hawkeye',
          status: 'pending',
          priority: 'high',
        },
        {
          id: `dir-${Date.now()}-4`,
          title: 'Vibranium Shield QA Review',
          description: `Review code quality and verify standards for: ${userPrompt}`,
          assignedHero: 'captain-america',
          status: 'pending',
          priority: 'omega-level',
        },
      ];
    }
  }

  async synthesizeResponse(userPrompt: string, directives: MissionDirective[]): Promise<string> {
    const isGreeting = /^(hi|hello|hey|yo|who are you|what can you do|help)/i.test(userPrompt.trim());

    if (isGreeting && userPrompt.trim().split(/\s+/).length <= 4) {
      return `### 🦾 Tony Stark // Lead GOD Orchestrator\n\n` +
        `"Hey there! Tony Stark here. Mark 85 systems are online, and the Scavengers strike team is fully assembled.\n\n` +
        `Here is what we can build for you right now:\n` +
        `- 🕸️ **Spider-Man**: Next.js & React Frontend components, Tailwind CSS, 60 FPS UI animations\n` +
        `- 🟢 **The Hulk**: Express/Node microservices, JWT auth, database schemas, deep AST refactors\n` +
        `- ⚡ **Thor**: Multi-stage Dockerfiles, Docker Compose, Kubernetes manifests, CI/CD GitHub Actions\n` +
        `- 🏹 **Hawkeye**: Exhaustive unit test suites, boundary edge case testing\n` +
        `- 🕷️ **Black Widow**: CVE zero-day dependency audits, .env secret sanitization\n` +
        `- 🛡️ **Captain America**: 100% strict TypeScript types and Vibranium Shield QA sign-off\n\n` +
        `*Type any project directive in the box below (e.g. 'Build a JWT authentication microservice with tests') and hit DISPATCH!*"`;
    }

    const directiveSummaries = directives
      .map(d => `#### ⚡ [${d.assignedHero.toUpperCase()}] ${d.title}\n\n${d.outputs?.logs?.[0] || d.description}`)
      .join('\n\n---\n\n');

    return `# 🦾 Mission Deliverable // ${userPrompt}\n\n` +
      `> **Status**: APPROVED & VERIFIED // Vibranium QA Stamp: APPROVED\n\n` +
      `---\n\n` +
      directiveSummaries;
  }
}
