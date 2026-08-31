import { EventEmitter } from 'node:events';
import {
  Mission,
  MissionDirective,
  HeroId,
  ProviderType,
  StarkConfig,
} from '../types.js';
import { StarkCommsNetwork } from './stark-comms.js';
import { ArcReactorPowerGrid } from './arc-reactor.js';
import { WorkspaceGenerator } from './workspace-generator.js';
import { BaseProvider } from '../providers/base-provider.js';
import { MockProvider } from '../providers/mock-provider.js';
import { ClaudeCodeProvider } from '../providers/claude-code.js';
import { GeminiProvider } from '../providers/gemini.js';
import { OpenAIProvider } from '../providers/openai.js';
import { GrokProvider } from '../providers/grok.js';
import { OllamaProvider } from '../providers/ollama.js';

import { BaseHero } from '../heroes/base-hero.js';
import { TonyStarkHero } from '../heroes/tony-stark.js';
import { CaptainAmericaHero } from '../heroes/captain-america.js';
import { HulkHero } from '../heroes/hulk.js';
import { BlackWidowHero } from '../heroes/black-widow.js';
import { ThorHero } from '../heroes/thor.js';
import { HawkeyeHero } from '../heroes/hawkeye.js';
import { SpiderManHero } from '../heroes/spider-man.js';
import { DoctorStrangeHero } from '../heroes/doctor-strange.js';
import { VisionHero } from '../heroes/vision.js';

export class StarkOrchestrator extends EventEmitter {
  private config: StarkConfig;
  private comms = StarkCommsNetwork.getInstance();
  private arcReactor: ArcReactorPowerGrid;
  private workspaceGen: WorkspaceGenerator;
  private providers: Map<ProviderType, BaseProvider> = new Map();
  private heroes: Map<HeroId, BaseHero> = new Map();
  private activeMission?: Mission;

  constructor(config: StarkConfig) {
    super();
    this.config = config;
    this.arcReactor = new ArcReactorPowerGrid(config.arcReactor);
    this.workspaceGen = new WorkspaceGenerator();

    this.initProviders();
    this.initHeroes();
  }

  private initProviders(): void {
    const mock = new MockProvider();
    this.providers.set('mock', mock);

    const claudeCfg = this.config.arcReactor.providers['claude-code'];
    this.providers.set('claude-code', new ClaudeCodeProvider(claudeCfg?.apiKey));

    const geminiCfg = this.config.arcReactor.providers['gemini'];
    this.providers.set('gemini', new GeminiProvider(geminiCfg?.apiKey));

    const openaiCfg = this.config.arcReactor.providers['openai'];
    this.providers.set('openai', new OpenAIProvider(openaiCfg?.apiKey));

    const grokCfg = this.config.arcReactor.providers['grok'];
    this.providers.set('grok', new GrokProvider(grokCfg?.apiKey));

    const ollamaCfg = this.config.arcReactor.providers['ollama'];
    this.providers.set('ollama', new OllamaProvider(ollamaCfg?.baseUrl, ollamaCfg?.model));
  }

  private initHeroes(): void {
    const p = this.providers;
    const ar = this.arcReactor;

    this.heroes.set('tony-stark', new TonyStarkHero(ar, p));
    this.heroes.set('captain-america', new CaptainAmericaHero(ar, p));
    this.heroes.set('hulk', new HulkHero(ar, p));
    this.heroes.set('black-widow', new BlackWidowHero(ar, p));
    this.heroes.set('thor', new ThorHero(ar, p));
    this.heroes.set('hawkeye', new HawkeyeHero(ar, p));
    this.heroes.set('spider-man', new SpiderManHero(ar, p));
    this.heroes.set('doctor-strange', new DoctorStrangeHero(ar, p));
    this.heroes.set('vision', new VisionHero(ar, p));
  }

  public getHero(id: HeroId): BaseHero | undefined {
    return this.heroes.get(id);
  }

  public getAllHeroes(): BaseHero[] {
    return Array.from(this.heroes.values());
  }

  public getArcReactor(): ArcReactorPowerGrid {
    return this.arcReactor;
  }

  public getActiveMission(): Mission | undefined {
    return this.activeMission;
  }

  public async launchMission(userPrompt: string): Promise<Mission> {
    const missionId = `mission-${Date.now()}`;
    const tony = this.heroes.get('tony-stark') as TonyStarkHero;

    this.comms.send('orchestrator', 'all', 'war-room', `🤖 Tactical intelligence scan: "${userPrompt}"`);

    // 1. Classify Intent (Chat/Q&A/Command vs Project Build)
    const classification = await tony.classifyIntent(userPrompt);

    if (classification.type === 'chat') {
      const directReply = classification.directResponse || `Tony Stark here. Understood: "${userPrompt}".`;

      this.comms.send('tony-stark', 'all', 'war-room', `[TONY STARK] ${directReply}`);

      const chatMission: Mission = {
        id: missionId,
        name: `Inquiry: ${userPrompt.substring(0, 24)}...`,
        userPrompt,
        status: 'success',
        directives: [],
        activeHeroCount: 1,
        arcReactorPowerUsed: 40,
        finalSummary: directReply,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      (chatMission as any).isChatOnly = true;
      (chatMission as any).result = directReply;
      (chatMission as any).summary = directReply;

      this.activeMission = chatMission;
      this.emit('mission-started', chatMission);
      this.emit('mission-completed', chatMission);

      return chatMission;
    }

    // 2. Full Multi-Agent Project Generation Workflow
    this.comms.send('orchestrator', 'all', 'war-room', `🚀 AVENGERS ASSEMBLE! Initiating multi-file project build for: "${userPrompt}"`);

    const mission: Mission = {
      id: missionId,
      name: `Operation: ${userPrompt.substring(0, 32)}...`,
      userPrompt,
      status: 'planning',
      directives: [],
      activeHeroCount: 0,
      arcReactorPowerUsed: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.activeMission = mission;
    this.emit('mission-started', mission);

    const directives = await tony.planMission(userPrompt);
    mission.directives = directives;
    mission.status = 'assembling';
    mission.updatedAt = Date.now();
    this.emit('mission-updated', mission);

    const strange = this.heroes.get('doctor-strange') as DoctorStrangeHero;
    if (strange && this.config.heroes.doctorStrange?.enabled) {
      const strangeResult = await strange.executeDirective({
        id: `${missionId}-multiverse`,
        title: 'Multiverse Timeline Simulation',
        description: 'Simulate alternate implementation realities',
        assignedHero: 'doctor-strange',
        status: 'in-progress',
        priority: 'medium',
      });
      mission.timelineBranches = strangeResult.data?.timelineBranches;
    }

    const vision = this.heroes.get('vision') as VisionHero;
    if (vision && this.config.heroes.vision?.enabled) {
      await vision.executeDirective({
        id: `${missionId}-memory`,
        title: 'Mind Stone Semantic Recall',
        description: 'Synchronize org knowledge and previous bug solutions',
        assignedHero: 'vision',
        status: 'in-progress',
        priority: 'low',
      });
    }

    this.comms.send('orchestrator', 'all', 'war-room', `[THOUGHT // TONY STARK] Decomposed "${userPrompt.slice(0, 50)}..." into ${directives.length} parallel directives. Deploying strike team.`);

    mission.status = 'in-flight';
    mission.updatedAt = Date.now();
    this.emit('mission-updated', mission);

    const nonCapDirectives = directives.filter((d) => d.assignedHero !== 'captain-america');
    const capDirective = directives.find((d) => d.assignedHero === 'captain-america');

    for (const directive of nonCapDirectives) {
      const hero = this.heroes.get(directive.assignedHero);
      if (!hero) continue;

      directive.status = 'in-progress';
      directive.startedAt = Date.now();
      this.comms.send(hero.profile.id, 'all', 'directives', `[ACTION // ${hero.profile.name.toUpperCase()}] Writing source code for "${directive.title}"...`);
      this.emit('directive-started', directive);
      this.emit('mission-updated', mission);

      try {
        const result = await hero.executeDirective(directive);
        directive.status = 'completed';
        directive.completedAt = Date.now();
        directive.outputs = {
          logs: [result.output],
          qaReview: result.data?.qaReview,
          securityAudit: result.data?.securityAudit,
          testResults: result.data?.testResults,
        };
        mission.arcReactorPowerUsed += result.tokensUsed;
        this.comms.send(hero.profile.id, 'all', 'directives', `[COMPLETED // ${hero.profile.name.toUpperCase()}] Finished "${directive.title}". Tokens: ${result.tokensUsed}.`);
      } catch (err: any) {
        directive.status = 'failed';
        directive.outputs = { logs: [`Error: ${err.message}`] };
        this.comms.send(hero.profile.id, 'all', 'directives', `[ERROR // ${hero.profile.name.toUpperCase()}] ${err.message}`);
      }

      this.emit('directive-completed', directive);
      this.emit('mission-updated', mission);
    }

    if (capDirective) {
      mission.status = 'review';
      const cap = this.heroes.get('captain-america') as CaptainAmericaHero;
      capDirective.status = 'in-progress';
      capDirective.startedAt = Date.now();
      this.comms.send('captain-america', 'all', 'qa-audit', `[THOUGHT // CAPTAIN AMERICA] Reviewing architecture, code standards, and type safety across all generated directives...`);
      this.emit('directive-started', capDirective);

      capDirective.inputs = {
        directiveOutputs: nonCapDirectives.map((d) => ({
          hero: d.assignedHero,
          title: d.title,
          codeSummary: d.outputs?.logs?.[0] ? d.outputs.logs[0].slice(0, 1500) : 'Completed',
        })),
      };
      const capResult = await cap.executeDirective(capDirective);
      capDirective.status = 'completed';
      capDirective.completedAt = Date.now();
      capDirective.outputs = {
        logs: [capResult.output],
        qaReview: capResult.data?.qaReview,
      };
      mission.arcReactorPowerUsed += capResult.tokensUsed;
      this.comms.send('captain-america', 'all', 'qa-audit', `[VERIFIED // CAPTAIN AMERICA] Code reviewed. Vibranium QA Stamp issued!`);
      this.emit('directive-completed', capDirective);
    }

    const synthesizedResult = await tony.synthesizeResponse(userPrompt, directives);

    let fullResult = synthesizedResult;
    try {
      const workspaceProject = await this.workspaceGen.createWorkspaceProject(
        userPrompt,
        directives.map((d) => ({
          title: d.title,
          assignedHero: d.assignedHero,
          output: d.outputs?.logs?.[0] || d.description,
        }))
      );

      if (workspaceProject.files.length > 0) {
        const fileList = workspaceProject.files
          .map((f) => `- 📄 **\`${f.relativePath}\`** (${Math.round((f.sizeBytes / 1024) * 10) / 10} KB) — *Crafted by ${f.hero.toUpperCase()}*`)
          .join('\n');

        fullResult += `\n\n---\n\n### 📁 Generated Project Files Written to Disk\n` +
          `**Workspace Location**: \`${workspaceProject.workspacePath}\`\n\n` +
          `${fileList}\n\n` +
          `### 🚀 How to Run Your Project\n\`\`\`bash\n${workspaceProject.runInstructions.join('\n')}\n\`\`\``;

        (mission as any).workspace = workspaceProject;
        this.comms.send('orchestrator', 'all', 'war-room', `[WORKSPACE SAVED] Project written to disk at: ${workspaceProject.workspacePath} (${workspaceProject.files.length} files)`);
      }
    } catch (err: any) {
      console.warn('[Orchestrator] Warning: could not write workspace files:', err.message);
    }

    mission.status = 'success';
    mission.updatedAt = Date.now();
    mission.finalSummary = fullResult;
    (mission as any).result = fullResult;
    (mission as any).summary = fullResult;

    this.comms.send('orchestrator', 'all', 'war-room', `🏆 MISSION ACCOMPLISHED! All ${directives.length} directives executed.`);
    this.emit('mission-completed', mission);

    return mission;
  }
}
