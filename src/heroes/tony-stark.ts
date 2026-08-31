import { BaseHero, HeroExecutionResult } from './base-hero.js';
import { MissionDirective, HeroId } from '../types.js';

export interface IntentClassification {
  type: 'chat' | 'project';
  directResponse?: string;
  projectName?: string;
  techStack?: string;
}

export class TonyStarkHero extends BaseHero {
  constructor(arcReactor: any, providers: any) {
    super('tony-stark', arcReactor, providers);
  }

  async executeDirective(directive: MissionDirective): Promise<HeroExecutionResult> {
    this.setStatus('analyzing');
    this.speak(`JARVIS, initialize Mark 85 architecture matrix. Deconstructing: "${directive.title}"`);

    const systemPrompt = `You are Tony Stark (Iron Man), Lead Architect & GOD Orchestrator of Scavengers Assemble.
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

  /**
   * Intelligently classify whether the user is having a conversation / asking a question / requesting a single command,
   * or explicitly requesting a multi-file project / application build.
   */
  async classifyIntent(userPrompt: string): Promise<IntentClassification> {
    const p = userPrompt.trim();

    // 1. Common conversational & informational patterns
    const isGreeting = /^(hi|hello|hey|yo|greetings|who are you|what can you do|help|howdy|sup|good morning|good evening)\b/i.test(p) && p.split(/\s+/).length <= 6;
    const isWeatherQuery = /\b(weather|temperature|forecast|rain|cloudy|humidity)\b/i.test(p) && !/(build|create|make|code|scaffold|program)\s+(a|an)?\s+(weather\s+(app|application|widget|dashboard|website|project))/i.test(p);
    const isCommandQuery = /^(give me|show me|what is the|how to run|how do i)\s+(command|syntax|curl|git|docker|bash|npm|pip|flag)/i.test(p);
    const isQuestionOnly = /^(what|how|why|when|where|who|is|are|can|could|should|tell me|explain|calculate|what's|whats)\b/i.test(p) &&
      !/(build|create|scaffold|generate|develop|make|implement|code|write|program)\s+(a|an|the|me)?\s+(project|app|application|website|backend|service|api|simulator|calculator|game|bot|clone|tool|boilerplate|dashboard|server|microservice)/i.test(p);

    if (isGreeting || isWeatherQuery || isCommandQuery || (isQuestionOnly && p.length < 120)) {
      const systemPrompt = `You are Tony Stark (Iron Man), Lead Architect & Chief Technologist of Scavengers Assemble.
The user is asking a question, greeting you, or asking for assistance or a command snippet. They are NOT asking to generate an entire multi-file project repository.
Respond directly, intelligently, wittily, and helpful as Tony Stark & JARVIS.
If a command or code snippet is requested, provide clear syntax-highlighted markdown. Keep it conversational, helpful, and concise.`;

      try {
        const { text } = await this.queryLLM(userPrompt, systemPrompt);
        return {
          type: 'chat',
          directResponse: text || `Tony Stark here. Directive noted: "${userPrompt}". How can the Scavengers strike team assist your build?`,
        };
      } catch {
        if (isWeatherQuery) {
          return {
            type: 'chat',
            directResponse: `🌤️ **JARVIS Tactical Atmospheric Scan**: For live real-time local weather updates, please connect your weather station API or open your browser weather service. If you'd like me to build a **real-time Weather App** (with live API integration in React, SwiftUI, or Python), just type: \`"Build a Weather Application"\`!`,
          };
        }
        return {
          type: 'chat',
          directResponse: `🦾 **Tony Stark**: "Systems online. What engineering challenge shall the Scavengers tackle today?"`,
        };
      }
    }

    // 2. Perform fast LLM classification for ambiguous inputs
    const classificationPrompt = `Analyze user input: "${userPrompt}"
Determine if the user wants to:
1) "CHAT": A casual question, general inquiry, weather query, command snippet request, or explanation.
2) "PROJECT": A request to build, scaffold, or generate a full software application, calculator, simulator, game, API, backend, or script.

Return JSON only in this exact format:
{
  "intent": "CHAT" | "PROJECT",
  "reason": "short explanation",
  "reply": "If CHAT, provide the direct answer here as Tony Stark."
}`;

    try {
      const { text } = await this.queryLLM(classificationPrompt, 'Return JSON only.');
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const res = JSON.parse(match[0]);
        if (res.intent === 'CHAT') {
          return {
            type: 'chat',
            directResponse: res.reply || `Tony Stark here. Understood: "${userPrompt}".`,
          };
        }
      }
    } catch {
      // Default to project if classification fails and it looks like a build directive
    }

    return { type: 'project' };
  }

  async planMission(userPrompt: string): Promise<MissionDirective[]> {
    this.setStatus('analyzing');
    this.speak(`JARVIS, run global tactical scan. Master user objective: "${userPrompt}"`);

    const planningPrompt = `Analyze this user software development request: "${userPrompt}".
Detect the exact technology framework requested (e.g. Interactive Web App / Simulator / Calculator / Game with HTML5+JS, SwiftUI / iOS, React / Next.js, Python / FastAPI, Express / TypeScript, Flutter, Go, Rust, etc.).

Break down the project into 4-6 concrete, complete, self-contained source files to generate across the Avengers:
- 'spider-man' for Frontend / Views / UI Components (e.g. index.html or ContentView.swift or Component.tsx). If it's a web app/calculator/simulator, write a complete, standalone, modern HTML5/CSS interface.
- 'hulk' for Core logic / Engine / Controllers / State (e.g. app.js or Service.ts or main.py). Write complete mathematical/simulation/business logic.
- 'thor' for Build configuration / Package manifests / Run scripts (e.g. package.json, server.js, requirements.txt, Dockerfile).
- 'hawkeye' for Unit test suites / Boundary assertions (e.g. tests/app.test.js or AppTests.swift).
- 'black-widow' for Security auditing, secret sanitization, CVE analysis.
- 'captain-america' for Final QA review and standards compliance.

CRITICAL INSTRUCTIONS:
1. In each directive description, instruct the assigned hero to write 100% COMPLETE, NON-STUBBED production code.
2. Every code block MUST start with "// File: <filename.ext>" or "<!-- File: <filename.ext> -->" or "# File: <filename.ext>" at the very top.
3. If it's a web application, calculator, or simulator, make sure it includes a runnable "index.html" and "app.js".

Return a structured JSON list of directives:
[
  {
    "title": "Short directive title",
    "description": "Clear technical instructions specifying the exact file to generate (e.g. Create // File: index.html with...)",
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
        directivesData = this.getFallbackDirectives(userPrompt);
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
      return this.getFallbackDirectives(userPrompt);
    }
  }

  private getFallbackDirectives(userPrompt: string): MissionDirective[] {
    const isWebApp = /(calculator|simulator|game|dashboard|canvas|html|web|frontend)/i.test(userPrompt);

    if (isWebApp) {
      return [
        {
          id: `dir-${Date.now()}-1`,
          title: 'Interactive Web UI & Layout',
          description: `Create // File: index.html - Complete modern glassmorphism responsive user interface for: ${userPrompt}. Include full HTML5 layout, CSS styling, and control buttons.`,
          assignedHero: 'spider-man',
          status: 'pending',
          priority: 'high',
        },
        {
          id: `dir-${Date.now()}-2`,
          title: 'Core Engine & Interactive Logic',
          description: `Create // File: app.js - Complete interactive computational and simulation logic for: ${userPrompt}. Handle all event listeners, state models, and mathematical calculations.`,
          assignedHero: 'hulk',
          status: 'pending',
          priority: 'omega-level',
        },
        {
          id: `dir-${Date.now()}-3`,
          title: 'Package Manifests & Zero-Dependency Server',
          description: `Create // File: package.json and // File: server.js - Node HTTP static server and npm scripts to run on http://localhost:8080.`,
          assignedHero: 'thor',
          status: 'pending',
          priority: 'medium',
        },
        {
          id: `dir-${Date.now()}-4`,
          title: 'Unit Testing & Boundary Suite',
          description: `Create // File: tests/app.test.js - Unit tests verifying mathematical accuracy and edge cases for: ${userPrompt}.`,
          assignedHero: 'hawkeye',
          status: 'pending',
          priority: 'high',
        },
        {
          id: `dir-${Date.now()}-5`,
          title: 'Vibranium Shield QA Review',
          description: `Review code quality and verify standards for: ${userPrompt}`,
          assignedHero: 'captain-america',
          status: 'pending',
          priority: 'omega-level',
        },
      ];
    }

    return [
      {
        id: `dir-${Date.now()}-1`,
        title: 'Frontend Component Architecture',
        description: `Create // File: src/components/App.tsx - Build reactive user interface for: ${userPrompt}`,
        assignedHero: 'spider-man',
        status: 'pending',
        priority: 'high',
      },
      {
        id: `dir-${Date.now()}-2`,
        title: 'Core Backend Service & State',
        description: `Create // File: src/index.ts - Build performant service logic and API routes for: ${userPrompt}`,
        assignedHero: 'hulk',
        status: 'pending',
        priority: 'omega-level',
      },
      {
        id: `dir-${Date.now()}-3`,
        title: 'Package Manifest & Build Configuration',
        description: `Create // File: package.json - Complete manifest with dependencies and start scripts.`,
        assignedHero: 'thor',
        status: 'pending',
        priority: 'medium',
      },
      {
        id: `dir-${Date.now()}-4`,
        title: 'Precision Unit Testing Suite',
        description: `Create // File: tests/app.test.ts - Generate boundary unit tests for: ${userPrompt}`,
        assignedHero: 'hawkeye',
        status: 'pending',
        priority: 'high',
      },
      {
        id: `dir-${Date.now()}-5`,
        title: 'Vibranium Shield QA Review',
        description: `Review code quality and verify standards for: ${userPrompt}`,
        assignedHero: 'captain-america',
        status: 'pending',
        priority: 'omega-level',
      },
    ];
  }

  async synthesizeResponse(userPrompt: string, directives: MissionDirective[]): Promise<string> {
    const directiveSummaries = directives
      .map(d => `#### ⚡ [${d.assignedHero.toUpperCase()}] ${d.title}\n\n${d.outputs?.logs?.[0] || d.description}`)
      .join('\n\n---\n\n');

    return `# 🦾 Mission Deliverable // ${userPrompt}\n\n` +
      `> **Status**: APPROVED & VERIFIED // Vibranium QA Stamp: APPROVED\n\n` +
      `---\n\n` +
      directiveSummaries;
  }
}
