import express from 'express';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { StarkOrchestrator } from '../core/stark-orchestrator.js';
import { StarkCommsNetwork } from '../core/stark-comms.js';
import { StarkConfig } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const providerName = provider || 'antigravity';

    if (apiKey) {
      if (provider === 'claude-code') process.env.ANTHROPIC_API_KEY = apiKey;
      else if (provider === 'gemini') process.env.GEMINI_API_KEY = apiKey;
      else if (provider === 'openai' || provider === 'codex') process.env.OPENAI_API_KEY = apiKey;
      else if (provider === 'kimi') process.env.KIMI_API_KEY = apiKey;
    }
    if (model) {
      process.env.STARK_MODEL = model;
    }

    res.json({
      success: true,
      provider: providerName,
      status: 'connected',
      timestamp: Date.now(),
      message: `Successfully connected to ${providerName} bridge.`,
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
