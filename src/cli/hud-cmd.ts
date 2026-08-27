import chalk from 'chalk';
import boxen from 'boxen';
import open from 'open';
import { StarkOrchestrator } from '../core/stark-orchestrator.js';
import { loadConfig } from '../config.js';
import { createMissionControlServer } from '../server/mission-control-server.js';

export async function runHudCommand(options: any = {}): Promise<void> {
  const config = loadConfig(options.config);
  const orchestrator = new StarkOrchestrator(config);
  const { start } = createMissionControlServer(orchestrator, config);

  const port = await start();
  const url = `http://localhost:${port}`;

  console.log(
    boxen(
      `${chalk.bold.red('🦾 STARK TOWER')} — ${chalk.bold.cyan('MISSION CONTROL HUD ONLINE')}\n\n` +
        `🌐 Dashboard URL: ${chalk.bold.underline.yellow(url)}\n` +
        `⚡ Arc Reactor Power: ${chalk.green('100% ONLINE')}\n` +
        `🛡️ Avengers Mesh: ${chalk.green('9 HEROES ACTIVE & CONNECTED')}\n\n` +
        `${chalk.dim('Press Ctrl+C to disconnect Stark telemetry')}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'round',
        borderColor: 'cyan',
      }
    )
  );

  if (!options.noOpen) {
    try {
      await open(url);
    } catch {
      // Ignored if headless
    }
  }
}
