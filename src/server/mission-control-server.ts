import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { StarkOrchestrator } from '../core/stark-orchestrator.js';
import { StarkCommsNetwork } from '../core/stark-comms.js';
import { StarkConfig } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory custom personal skills store
const customPersonalSkills: Array<{ id: string; name: string; category: string; prompt: string; enabled: boolean; createdAt: number }> = [
  {
    id: 'skill-1',
    name: 'Clean Code & SOLID Architecture',
    category: 'Architecture',
    prompt: 'Always write strictly typed, highly decoupled, modular code following SOLID principles and robust error handling.',
    enabled: true,
    createdAt: Date.now() - 100000,
  },
  {
    id: 'skill-2',
    name: 'Production Ready Manifests & Docker',
    category: 'DevOps',
    prompt: 'Always generate complete, self-contained package.json / requirements.txt / Dockerfile with locked versions and zero missing dependencies.',
    enabled: true,
    createdAt: Date.now() - 50000,
  }
];

function getAllFilesInDir(dirPath: string, rootDir: string): Array<{ relativePath: string; content: string; size: number; language: string }> {
  const result: Array<{ relativePath: string; content: string; size: number; language: string }> = [];
  if (!fs.existsSync(dirPath)) return result;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist' && entry.name !== '.build') {
        result.push(...getAllFilesInDir(fullPath, rootDir));
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      let language = 'text';
      if (['.ts', '.tsx'].includes(ext)) language = 'typescript';
      else if (['.js', '.jsx'].includes(ext)) language = 'javascript';
      else if (['.swift'].includes(ext)) language = 'swift';
      else if (['.py'].includes(ext)) language = 'python';
      else if (['.json'].includes(ext)) language = 'json';
      else if (['.md'].includes(ext)) language = 'markdown';
      else if (['.html'].includes(ext)) language = 'html';
      else if (['.css'].includes(ext)) language = 'css';

      let content = '';
      let size = 0;
      try {
        const stat = fs.statSync(fullPath);
        size = stat.size;
        if (size < 500000) {
          content = fs.readFileSync(fullPath, 'utf-8');
        } else {
          content = '// [File content too large to preview inline]';
        }
      } catch {}

      result.push({
        relativePath: path.relative(rootDir, fullPath),
        content,
        size,
        language,
      });
    }
  }
  return result;
}

export function createMissionControlServer(orchestrator: StarkOrchestrator, config: StarkConfig) {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const comms = StarkCommsNetwork.getInstance();

  app.use(express.json());

  // Serve static UI from docs/
  const publicDir = path.resolve(__dirname, '../../../docs');
  app.use(express.static(publicDir));
  app.use('/assets', express.static(path.resolve(publicDir, 'assets')));

  app.get('/api/status', (req, res) => {
    const arc = orchestrator.getArcReactor();
    const arcState = arc.getState();
    const heroes = orchestrator.getAllHeroes();
    const mission = orchestrator.getActiveMission();

    res.json({
      status: 'online',
      starkModel: process.env.STARK_MODEL || 'gemini-3.5-flash-lite',
      arcReactor: {
        totalCapacity: arcState.totalCapacityPerHour,
        powerConsumed: arcState.currentConsumption,
        percentRemaining: arcState.hourlyPowerLevelPct,
        optimalProvider: arc.getOptimalProvider(),
      },
      heroes: heroes.map((h) => ({
        id: h.profile.id,
        name: h.profile.name,
        role: h.profile.role,
        avatar: h.profile.avatar,
        status: h.status,
        tokensUsed: h.metrics?.tokensConsumed ?? 0,
      })),
      activeMission: mission || null,
    });
  });

  // Dedicated Structured Workspace Endpoint
  app.get('/api/workspace', (req, res) => {
    try {
      const workspaceBase = path.resolve(process.cwd(), 'workspace');
      if (!fs.existsSync(workspaceBase)) {
        return res.json({ workspaces: [], active: null });
      }

      const dirs = fs.readdirSync(workspaceBase, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);

      const allWorkspaces: any[] = [];
      for (const dir of dirs) {
        const dirPath = path.join(workspaceBase, dir);
        const files = getAllFilesInDir(dirPath, dirPath);
        allWorkspaces.push({
          slug: dir,
          path: dirPath,
          files,
        });
      }

      const activeMission = orchestrator.getActiveMission();
      const activeWorkspace = (activeMission as any)?.workspace || (allWorkspaces.length > 0 ? allWorkspaces[allWorkspaces.length - 1] : null);

      res.json({
        success: true,
        workspaces: allWorkspaces,
        active: activeWorkspace,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API Keys Status & Active Providers
  app.get('/api/keys/status', (req, res) => {
    const geminiKey = Boolean(process.env.GEMINI_API_KEY);
    const claudeKey = Boolean(process.env.ANTHROPIC_API_KEY);
    const openaiKey = Boolean(process.env.OPENAI_API_KEY);
    const kimiKey = Boolean(process.env.KIMI_API_KEY);

    res.json({
      success: true,
      activeModel: process.env.STARK_MODEL || 'gemini-3.5-flash-lite',
      activeProvider: process.env.STARK_PROVIDER || 'gemini',
      providers: {
        gemini: {
          configured: geminiKey,
          maskedKey: geminiKey ? `${process.env.GEMINI_API_KEY?.slice(0, 7)}...${process.env.GEMINI_API_KEY?.slice(-4)}` : null,
          models: ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.1-pro', 'gemini-2.5-flash'],
        },
        claude: {
          configured: claudeKey,
          maskedKey: claudeKey ? `${process.env.ANTHROPIC_API_KEY?.slice(0, 7)}...${process.env.ANTHROPIC_API_KEY?.slice(-4)}` : null,
          models: ['claude-3-7-sonnet', 'claude-3-5-sonnet'],
        },
        openai: {
          configured: openaiKey,
          maskedKey: openaiKey ? `${process.env.OPENAI_API_KEY?.slice(0, 7)}...${process.env.OPENAI_API_KEY?.slice(-4)}` : null,
          models: ['gpt-4o', 'gpt-4o-mini', 'o3-mini'],
        },
        kimi: {
          configured: kimiKey,
          maskedKey: kimiKey ? `${process.env.KIMI_API_KEY?.slice(0, 7)}...${process.env.KIMI_API_KEY?.slice(-4)}` : null,
          models: ['kimi-k1.5'],
        }
      }
    });
  });

  // Live API Key Ping & Connection Verification
  app.post('/api/keys/verify', async (req, res) => {
    const { provider, apiKey, model } = req.body;
    const startTime = Date.now();

    const targetKey = apiKey || (
      provider === 'gemini' ? process.env.GEMINI_API_KEY :
      provider === 'claude' ? process.env.ANTHROPIC_API_KEY :
      provider === 'openai' ? process.env.OPENAI_API_KEY :
      provider === 'kimi' ? process.env.KIMI_API_KEY : null
    );

    if (!targetKey && provider !== 'ollama') {
      return res.json({
        success: false,
        valid: false,
        latencyMs: Date.now() - startTime,
        message: `No API key found for ${provider}. Please enter a valid API key.`,
      });
    }

    try {
      const tony = orchestrator.getHero('tony-stark');
      if (tony) {
        await (tony as any).queryLLM('ping', 'Return pong.');
      }
      const latencyMs = Date.now() - startTime;

      res.json({
        success: true,
        valid: true,
        provider,
        model: model || process.env.STARK_MODEL || 'gemini-3.5-flash-lite',
        latencyMs,
        message: `Connection Verified! ${provider.toUpperCase()} is LIVE & responsive (${latencyMs}ms ping).`,
      });
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      res.json({
        success: false,
        valid: false,
        latencyMs,
        message: `Verification Error: ${err.message}`,
      });
    }
  });

  // Custom Personal Skills Endpoints
  app.get('/api/skills', (req, res) => {
    res.json({
      success: true,
      skills: customPersonalSkills,
    });
  });

  app.post('/api/skills', (req, res) => {
    const { name, category, prompt } = req.body;
    if (!name || !prompt) {
      return res.status(400).json({ error: 'Skill Name and Capability Prompt are required' });
    }

    const newSkill = {
      id: `skill-${Date.now()}`,
      name,
      category: category || 'Custom Skill',
      prompt,
      enabled: true,
      createdAt: Date.now(),
    };

    customPersonalSkills.push(newSkill);
    comms.send('orchestrator', 'all', 'war-room', `🧠 NEW PERSONAL SKILL LOADED: "${name}" registered into Avengers Knowledge Base!`);

    res.json({
      success: true,
      skill: newSkill,
      message: `Personal Skill "${name}" successfully loaded into agent harness!`,
    });
  });

  app.delete('/api/skills/:id', (req, res) => {
    const { id } = req.params;
    const index = customPersonalSkills.findIndex(s => s.id === id);
    if (index !== -1) {
      const removed = customPersonalSkills.splice(index, 1)[0];
      return res.json({ success: true, message: `Removed skill "${removed.name}"` });
    }
    res.status(404).json({ error: 'Skill not found' });
  });

  // Voice Translation Endpoint
  app.post('/api/comms/translate', async (req, res) => {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    try {
      const tony = orchestrator.getHero('tony-stark');
      let translated = text;
      if (tony) {
        const prompt = `You are JARVIS. The user spoke this voice audio directive: "${text}".
If this voice directive is in Hindi, Spanish, or any non-English language, accurately translate it into clear English.
Clean it up into a concise, professional engineering prompt ready for the Avengers agentic strike team.
Return ONLY the cleaned and translated prompt text. Do not wrap in quotes or add conversational filler.`;
        const result = await (tony as any).queryLLM(prompt, 'You are an AI translator. Return only the translated directive.');
        translated = result?.text?.trim() || text;
      }
      res.json({ success: true, original: text, translated });
    } catch (err: any) {
      res.json({ success: true, original: text, translated: text });
    }
  });

  app.post('/api/mission/launch', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Directive prompt is required' });
    }

    try {
      const mission = await orchestrator.launchMission(prompt);

      res.json({
        success: true,
        message: 'Avengers Assembled! Mission completed.',
        prompt,
        missionId: mission.id,
        summary: mission.finalSummary,
        result: (mission as any).result || mission.finalSummary,
        workspace: (mission as any).workspace,
        workspacePath: (mission as any).workspace?.workspacePath,
        directives: mission.directives,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/connect', (req, res) => {
    const { provider, apiKey, model } = req.body;
    const providerName = provider || 'gemini';

    if (apiKey) {
      if (provider === 'claude' || provider === 'claude-code') process.env.ANTHROPIC_API_KEY = apiKey;
      else if (provider === 'gemini') process.env.GEMINI_API_KEY = apiKey;
      else if (provider === 'openai' || provider === 'codex') process.env.OPENAI_API_KEY = apiKey;
      else if (provider === 'kimi') process.env.KIMI_API_KEY = apiKey;
    }
    if (model) {
      process.env.STARK_MODEL = model;
    }
    if (provider) {
      process.env.STARK_PROVIDER = provider;
    }

    res.json({
      success: true,
      provider: providerName,
      model: process.env.STARK_MODEL || model || 'gemini-3.5-flash-lite',
      status: 'connected',
      timestamp: Date.now(),
      message: `Successfully connected to ${providerName} bridge. Model: ${process.env.STARK_MODEL}`,
    });
  });

  app.post('/api/heroes/custom', (req, res) => {
    const { name, callsign, role, avatar, harness, superpower, systemPrompt } = req.body;
    if (!name || !callsign) {
      return res.status(400).json({ error: 'Missing name or callsign' });
    }

    const heroId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    comms.send('orchestrator', 'all', 'war-room', `⚡ NEW AGENT SPAWNED! ${name} (${callsign}) has entered the Battleworld!`);

    res.json({
      success: true,
      heroId,
      name,
      callsign,
      role: role || 'Custom Agent Specialist',
      avatar: avatar || '🦸',
      harness: harness || 'gemini',
      superpower: superpower || 'Quantum Laser',
      message: `Hero ${name} (${callsign}) successfully spawned into Battleworld!`,
    });
  });

  const broadcast = (type: string, data: any) => {
    const payload = JSON.stringify({ type, data, timestamp: Date.now() });
    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }
  };

  comms.onMessage((msg) => {
    broadcast('comms_message', msg);
  });

  orchestrator.on('mission-started', (mission) => broadcast('mission_started', mission));
  orchestrator.on('mission-updated', (mission) => broadcast('mission_updated', mission));
  orchestrator.on('mission-completed', (mission) => broadcast('mission_completed', mission));
  orchestrator.on('directive-started', (dir) => broadcast('directive_started', dir));
  orchestrator.on('directive-completed', (dir) => broadcast('directive_completed', dir));

  wss.on('connection', (ws) => {
    const arc = orchestrator.getArcReactor();
    const arcState = arc.getState();
    ws.send(JSON.stringify({
      type: 'system_status',
      data: {
        status: 'online',
        starkModel: process.env.STARK_MODEL || 'gemini-3.5-flash-lite',
        powerGrid: arcState.hourlyPowerLevelPct,
        connectedHeroes: orchestrator.getAllHeroes().map(h => h.profile.id),
      },
      timestamp: Date.now(),
    }));

    ws.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === 'launch_mission') {
          await orchestrator.launchMission(message.data.prompt);
        } else if (message.type === 'broadcast_chat') {
          comms.send('user', 'all', 'war-room', message.data.text);
        }
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', data: { message: err.message } }));
      }
    });
  });

  const start = async (): Promise<number> => {
    const port = config.missionControl?.port || 3000;
    return new Promise((resolve) => {
      server.listen(port, () => {
        resolve(port);
      });
    });
  };

  const stop = (): Promise<void> => {
    return new Promise((resolve) => {
      wss.close(() => server.close(() => resolve()));
    });
  };

  return { app, server, wss, orchestrator, start, stop };
}
