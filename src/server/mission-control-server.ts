import express from 'express';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { WebSocketServer, WebSocket } from 'ws';
import { fileURLToPath } from 'node:url';
import { StarkOrchestrator } from '../core/stark-orchestrator.js';
import { StarkCommsNetwork } from '../core/stark-comms.js';
import { MindStoneMemory } from '../core/mind-stone.js';
import { TimeStoneEngine } from '../core/time-stone.js';
import { StarkConfig } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createMissionControlServer(
  orchestrator: StarkOrchestrator,
  config: StarkConfig
): { app: express.Application; server: http.Server; start: () => Promise<number> } {
  const app = express();
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const comms = StarkCommsNetwork.getInstance();
  const mindStone = MindStoneMemory.getInstance();
  const timeStone = TimeStoneEngine.getInstance();

  app.use(express.json());

  const candidate0 = path.resolve(process.cwd(), 'docs');
  const candidate1 = path.resolve(__dirname, '../../../docs');
  const candidate2 = path.resolve(__dirname, '../../docs');
  const candidate3 = path.resolve(__dirname, '../docs');
  const candidate4 = path.resolve(__dirname, '../../../public');
  const staticDir = [candidate0, candidate1, candidate2, candidate3, candidate4].find((p) => fs.existsSync(p)) || candidate0;
  app.use(express.static(staticDir));

  app.get('/api/status', (req, res) => {
    const arcReactor = orchestrator.getArcReactor().getState();
    const activeMission = orchestrator.getActiveMission();
    const heroes = orchestrator.getAllHeroes().map((h) => ({
      profile: h.profile,
      status: h.status,
      metrics: h.metrics,
    }));

    res.json({
      status: 'online',
      callsign: config.orchestrator.callsign,
      arcReactor,
      activeMission,
      heroes,
      commsCount: comms.getHistory().length,
    });
  });

  app.get('/api/heroes', (req, res) => {
    const heroes = orchestrator.getAllHeroes().map((h) => ({
      profile: h.profile,
      status: h.status,
      metrics: h.metrics,
    }));
    res.json(heroes);
  });

  app.get('/api/comms', (req, res) => {
    const limit = Number(req.query.limit) || 100;
    res.json(comms.getHistory(limit));
  });

  app.get('/api/memory', (req, res) => {
    res.json(mindStone.getAll());
  });

  app.post('/api/mission/launch', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Missing mission prompt' });
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
        directives: mission.directives,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/connect', (req, res) => {
    const { provider, apiKey, model } = req.body;
    const providerName = provider || 'antigravity';
    
    // Save to runtime config
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

  orchestrator.getArcReactor().on('power-consumed', (data) => broadcast('arc_reactor_update', data.state));

  wss.on('connection', (ws) => {
    ws.send(
      JSON.stringify({
        type: 'initial_state',
        data: {
          arcReactor: orchestrator.getArcReactor().getState(),
          activeMission: orchestrator.getActiveMission(),
          heroes: orchestrator.getAllHeroes().map((h) => ({
            profile: h.profile,
            status: h.status,
            metrics: h.metrics,
          })),
          history: comms.getHistory(50),
          memory: mindStone.getAll(),
        },
      })
    );

    ws.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (message.type === 'launch_mission' && message.prompt) {
          orchestrator.launchMission(message.prompt);
        }
      } catch (err) {
        console.error('[WebSocket] Error parsing client message:', err);
      }
    });
  });

  const start = (): Promise<number> => {
    const port = config.missionControl.port || 3000;
    const host = config.missionControl.host || 'localhost';

    return new Promise((resolve) => {
      server.listen(port, () => {
        resolve(port);
      });
    });
  };

  return { app, server, start };
}
