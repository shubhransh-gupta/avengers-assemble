/**
 * STARKNET / AVENGERS ASSEMBLE — Core Types & Contracts
 * Earth's Mightiest Multi-Agent Coding Harness
 */

export type HeroId =
  | 'tony-stark'
  | 'captain-america'
  | 'hulk'
  | 'black-widow'
  | 'thor'
  | 'hawkeye'
  | 'spider-man'
  | 'doctor-strange'
  | 'vision';

export type HeroStatus =
  | 'idle'
  | 'analyzing'
  | 'executing'
  | 'reviewing'
  | 'smashed'
  | 'victorious'
  | 'failed'
  | 'cooldown';

export type ProviderType =
  | 'claude-code'
  | 'gemini'
  | 'openai'
  | 'grok'
  | 'ollama'
  | 'mock';

export interface HeroMetrics {
  tasksCompleted: number;
  tokensConsumed: number;
  rateLimitHits: number;
  powerLevelPct: number; // 0 - 100%
  lastActiveTimestamp?: number;
}

export interface HeroProfile {
  id: HeroId;
  name: string;
  callsign: string;
  title: string;
  role: string;
  avatar: string; // emoji or svg identifier
  color: string; // hex / theme color
  catchphrase: string;
  preferredProvider: ProviderType;
  tools: string[];
}

export interface MissionDirective {
  id: string;
  title: string;
  description: string;
  assignedHero: HeroId;
  status: 'pending' | 'in-progress' | 'auditing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'omega-level';
  inputs?: Record<string, any>;
  outputs?: {
    codeSnippets?: Array<{ filePath: string; content: string; diff?: string }>;
    logs?: string[];
    qaReview?: QAReviewResult;
    securityAudit?: SecurityAuditResult;
    testResults?: TestExecutionResult;
  };
  dependencies?: string[]; // IDs of preceding directives
  startedAt?: number;
  completedAt?: number;
}

export interface QAReviewResult {
  approved: boolean;
  score: number; // 0 - 100
  capComments: string[];
  suggestedFixes?: string[];
}

export interface SecurityAuditResult {
  passed: boolean;
  vulnerabilitiesFound: Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location?: string;
  }>;
  sanitizedSecrets: string[];
}

export interface TestExecutionResult {
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coveragePct: number;
  testNames: string[];
}

export interface Mission {
  id: string;
  name: string;
  userPrompt: string;
  status: 'planning' | 'assembling' | 'in-flight' | 'review' | 'success' | 'aborted';
  directives: MissionDirective[];
  activeHeroCount: number;
  arcReactorPowerUsed: number;
  timelineBranches?: TimelineBranch[];
  finalSummary?: string;
  createdAt: number;
  updatedAt: number;
}

export interface TimelineBranch {
  id: string;
  name: string;
  createdHero: HeroId;
  description: string;
  probabilityOfSuccessPct: number;
  status: 'simulating' | 'viable' | 'pruned' | 'merged';
  diffPreview: string;
}

export interface CommsMessage {
  id: string;
  fromHero: HeroId | 'user' | 'system' | 'orchestrator';
  toHero: HeroId | 'all' | 'orchestrator';
  channel: 'war-room' | 'directives' | 'qa-audit' | 'security-recon' | 'telemetry';
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface ProviderConfig {
  enabled: boolean;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  hourlyTokenLimit?: number;
  priority?: number;
}

export interface ArcReactorState {
  totalCapacityPerHour: number;
  currentConsumption: number;
  hourlyPowerLevelPct: number; // 0 - 100%
  isThrottled: boolean;
  providerStatus: Record<ProviderType, {
    enabled: boolean;
    hourlyLimit: number;
    usedInCurrentWindow: number;
    powerRemainingPct: number;
    coolingDownUntil?: number;
  }>;
}

export interface StarkConfig {
  version?: string;
  orchestrator: {
    name: string;
    callsign: string;
    aiProvider: ProviderType;
    model: string;
    jarvisTelemetry: boolean;
  };
  arcReactor: {
    maxHourlyTokens: number;
    rollingWindowHours: number;
    throttleThresholdPct: number;
    autoFailover: boolean;
    providers: Partial<Record<ProviderType, ProviderConfig>>;
  };
  heroes: {
    captainAmerica?: { enabled: boolean; strictQA?: boolean };
    hulk?: { enabled: boolean; autoSmashThreshold?: number };
    blackWidow?: { enabled: boolean; scanSecrets?: boolean; checkCVE?: boolean };
    thor?: { enabled: boolean; dockerEnabled?: boolean };
    hawkeye?: { enabled: boolean; targetCoveragePct?: number };
    spiderMan?: { enabled: boolean; framework?: string };
    doctorStrange?: { enabled: boolean; simulatedTimelines?: number };
    vision?: { enabled: boolean; persistentMemoryPath?: string };
  };
  missionControl: {
    port: number;
    host: string;
    soundEffects: boolean;
    theme: string;
  };
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: 'convention' | 'architecture' | 'bug-resolution' | 'hero-memo';
  content: string;
  tags: string[];
  createdAt: number;
  authorHero: HeroId;
}
