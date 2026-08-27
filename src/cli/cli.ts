import { Command } from 'commander';
import { runAssembleCommand } from './assemble-cmd.js';
import { runHudCommand } from './hud-cmd.js';
import { runStatusCommand } from './status-cmd.js';

export function createCli(): Command {
  const program = new Command();

  program
    .name('avengers')
    .description("Earth's Mightiest Multi-Agent Coding Harness — Coordinated by Tony Stark")
    .version('1.0.0');

  program
    .command('assemble [prompt]')
    .alias('mission')
    .description('Assemble the Avengers and launch a multi-agent coding mission')
    .option('-c, --config <path>', 'Path to custom stark.config.json')
    .action((prompt, options) => {
      runAssembleCommand(prompt, options);
    });

  program
    .command('hud')
    .alias('tower')
    .alias('dashboard')
    .description('Launch the Stark Tower Mission Control Web HUD & Command Center')
    .option('-p, --port <port>', 'Custom port')
    .option('--no-open', 'Do not automatically open browser')
    .option('-c, --config <path>', 'Path to custom stark.config.json')
    .action((options) => {
      runHudCommand(options);
    });

  program
    .command('status')
    .alias('roster')
    .description('Display Arc Reactor power levels and active Avengers hero readiness')
    .option('-c, --config <path>', 'Path to custom stark.config.json')
    .action((options) => {
      runStatusCommand(options);
    });

  return program;
}
