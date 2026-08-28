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

  const warroomUrl = `http://localhost:${port}/warroom.html`;

  if (!options.noOpen) {
    try {
      const { exec } = await import('node:child_process');
      // Attempt to open in a dedicated standalone app window without address bar / tabs
      const appCmd = process.platform === 'darwin'
        ? `open -na "Google Chrome" --args --app="${warroomUrl}" --window-size=1440,900 || open -na "Brave Browser" --args --app="${warroomUrl}" --window-size=1440,900 || open "${warroomUrl}"`
        : process.platform === 'win32'
        ? `start chrome --app="${warroomUrl}" --window-size=1440,900 || start msedge --app="${warroomUrl}" || start "${warroomUrl}"`
        : `google-chrome --app="${warroomUrl}" --window-size=1440,900 || brave --app="${warroomUrl}" || xdg-open "${warroomUrl}"`;

      exec(appCmd, async (err) => {
        if (err) {
          try {
            await open(warroomUrl);
          } catch {}
        }
      });
    } catch {
      // Ignored if headless
    }
  }
}
