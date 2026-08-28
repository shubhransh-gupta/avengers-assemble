import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { StarkConfig, HeroProfile, HeroId } from './types.js';

dotenv.config();

export const DEFAULT_CONFIG: StarkConfig = {
  version: '1.0.0',
  orchestrator: {
    name: 'Tony Stark',
    callsign: 'IRON_MAN',
    aiProvider: (process.env.STARK_PROVIDER as any) || 'mock',
    model: process.env.STARK_MODEL || 'claude-3-7-sonnet',
    jarvisTelemetry: true,
  },
  arcReactor: {
    maxHourlyTokens: 200000,
    rollingWindowHours: 5,
    throttleThresholdPct: 85,
    autoFailover: true,
    providers: {
      'claude-code': {
        enabled: Boolean(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE),
        apiKey: process.env.ANTHROPIC_API_KEY,
        hourlyTokenLimit: 80000,
        priority: 1,
      },
      gemini: {
        enabled: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
        apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
        hourlyTokenLimit: 120000,
        priority: 2,
      },
      openai: {
        enabled: Boolean(process.env.OPENAI_API_KEY),
        apiKey: process.env.OPENAI_API_KEY,
        hourlyTokenLimit: 60000,
        priority: 3,
      },
      grok: {
        enabled: Boolean(process.env.XAI_API_KEY),
        apiKey: process.env.XAI_API_KEY,
        hourlyTokenLimit: 50000,
        priority: 4,
      },
      kimi: {
        enabled: Boolean(process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY),
        apiKey: process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY,
        hourlyTokenLimit: 100000,
        priority: 5,
      },
      ollama: {
        enabled: true,
        baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
        model: 'deepseek-r1:latest',
        hourlyTokenLimit: 99999999,
        priority: 6,
      },
      mock: {
        enabled: true,
        hourlyTokenLimit: 99999999,
        priority: 99,
      },
    },
  },
  heroes: {
    captainAmerica: { enabled: true, strictQA: true },
    hulk: { enabled: true, autoSmashThreshold: 3 },
    blackWidow: { enabled: true, scanSecrets: true, checkCVE: true },
    thor: { enabled: true, dockerEnabled: true },
    hawkeye: { enabled: true, targetCoveragePct: 90 },
    spiderMan: { enabled: true, framework: 'react' },
    doctorStrange: { enabled: true, simulatedTimelines: 3 },
    vision: { enabled: true, persistentMemoryPath: '.stark/memory.json' },
  },
  missionControl: {
    port: Number(process.env.STARK_PORT) || 3000,
    host: process.env.STARK_HOST || 'localhost',
    soundEffects: true,
    theme: 'stark-hologram',
  },
};

export const HERO_PROFILES: Record<HeroId, HeroProfile> = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON_MAN',
    title: 'Lead Architect & GOD Orchestrator',
    role: 'Decomposes complex requests into executable Mission Directives, load balances power across LLMs, and monitors real-time telemetry from Stark Tower HUD.',
    avatar: '🦾',
    color: '#FF2A4D',
    catchphrase: 'Genius, billionaire, playboy, philanthropist. Directives uploaded.',
    preferredProvider: 'claude-code',
    tools: ['task-planner', 'arc-reactor-balancer', 'jarvis-stream', 'code-synthesizer'],
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAPTAIN_AMERICA',
    title: 'QA Commander & Standards Enforcer',
    role: 'Rigorous code review, standards audit, ethics check, architectural discipline, and pull request verification. Approves with the Vibranium Shield Stamp.',
    avatar: '🛡️',
    color: '#007BFF',
    catchphrase: 'I can review this all day. Stand down unless standard compliant.',
    preferredProvider: 'gemini',
    tools: ['qa-linter', 'vibranium-shield-check', 'ast-diff-auditor', 'pr-gatekeeper'],
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner & The Hulk',
    callsign: 'HULK',
    title: 'Deep Debugger & Brute-Force Refactorer',
    role: 'Banner mode: Deep memory leak analysis, complex AST debugging, algorithmic optimization. Hulk mode: "HULK SMASH" — aggressive legacy refactoring & dependency resolution.',
    avatar: '🟢',
    color: '#28A745',
    catchphrase: 'HULK SMASH BUG! THAT IS SECRET... ALWAYS DEBUGGING.',
    preferredProvider: 'openai',
    tools: ['stacktrace-analyzer', 'gamma-refactorer', 'smash-optimizer', 'memleak-hunter'],
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'BLACK_WIDOW',
    title: 'Security Recon & Vulnerability Auditor',
    role: 'Threat modeling, .env and secret sanitizer, zero-day CVE package scanning, API penetration testing, and stealth documentation extraction.',
    avatar: '🕷️',
    color: '#E83E8C',
    catchphrase: 'I have red in my ledger. Your code won’t leak on my watch.',
    preferredProvider: 'claude-code',
    tools: ['secret-scrubber', 'cve-inspector', 'stealth-recon', 'api-firewall'],
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    title: 'God of Thunder & DevOps Infrastructure',
    role: 'Lightning-fast builds, Docker/Kubernetes container orchestration, cloud deployment manifests, terraform generation, and extreme high-voltage load testing.',
    avatar: '⚡',
    color: '#17A2B8',
    catchphrase: 'Bring me high workloads! Mjolnir will forge your deployment.',
    preferredProvider: 'grok',
    tools: ['mjolnir-docker', 'lightning-build', 'k8s-manifest-generator', 'ci-cd-bifrost'],
  },
  'hawkeye': {
    id: 'hawkeye',
    name: 'Clint Barton',
    callsign: 'HAWKEYE',
    title: 'Precision Sniper Unit Testing',
    role: 'Zero-in on boundary conditions, edge cases, mutation testing, mock generation, and regression suites. Never misses a failing assertion.',
    avatar: '🏹',
    color: '#6F42C1',
    catchphrase: 'I see bugs other people don’t. One shot, 100% test coverage.',
    preferredProvider: 'gemini',
    tools: ['arrow-test-runner', 'edge-case-sniper', 'mock-generator', 'coverage-tracker'],
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDER_MAN',
    title: 'Frontend Hero & Rapid UI/UX Specialist',
    role: 'Next.js, React, Tailwind, animations, responsive micro-interactions, generative UI components, and accessible modern interfaces.',
    avatar: '🕸️',
    color: '#FD7E14',
    catchphrase: 'Your friendly neighborhood frontend hero. Web components spun!',
    preferredProvider: 'claude-code',
    tools: ['react-loom', 'tailwind-weaver', 'generative-ui', 'responsive-audit'],
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'DOCTOR_STRANGE',
    title: 'Master of Multi-Timeline Simulation',
    role: 'Simulates 14,000,605 future architectural branches in parallel isolated workspaces, evaluates best diffs, and executes instantaneous Time Stone rollbacks.',
    avatar: '🔮',
    color: '#20C997',
    catchphrase: 'I went forward in time... to view 14 million outcomes. This is the one.',
    preferredProvider: 'openai',
    tools: ['time-stone-rollback', 'multiverse-brancher', 'diff-evaluator', 'ast-time-warp'],
  },
  'vision': {
    id: 'vision',
    name: 'Vision',
    callsign: 'VISION',
    title: 'Mind Stone Semantic Knowledge Base',
    role: 'Persistent vector indexing, shared team memory across sessions, architecture synthesis, and org-wide knowledge synchronization.',
    avatar: '💎',
    color: '#FFC107',
    catchphrase: 'A thing isn’t beautiful because it lasts. But indexed knowledge is eternal.',
    preferredProvider: 'ollama',
    tools: ['mind-stone-vector', 'org-knowledge-sync', 'semantic-indexer', 'pattern-recall'],
  },
};

export function loadConfig(configPath?: string): StarkConfig {
  const resolvedPath = configPath || path.resolve(process.cwd(), 'stark.config.json');

  if (fs.existsSync(resolvedPath)) {
    try {
      const fileData = fs.readFileSync(resolvedPath, 'utf8');
      const userConfig = JSON.parse(fileData);
      return {
        ...DEFAULT_CONFIG,
        ...userConfig,
        orchestrator: { ...DEFAULT_CONFIG.orchestrator, ...userConfig.orchestrator },
        arcReactor: { ...DEFAULT_CONFIG.arcReactor, ...userConfig.arcReactor },
        heroes: { ...DEFAULT_CONFIG.heroes, ...userConfig.heroes },
        missionControl: { ...DEFAULT_CONFIG.missionControl, ...userConfig.missionControl },
      };
    } catch (err) {
      console.warn(`[STARK] Warning: Could not parse ${resolvedPath}. Falling back to default settings.`);
    }
  }

  return DEFAULT_CONFIG;
}
