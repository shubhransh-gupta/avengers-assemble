import chalk from 'chalk';
import { loadConfig, HERO_PROFILES } from '../config.js';
import { ArcReactorPowerGrid } from '../core/arc-reactor.js';
import { HeroId } from '../types.js';

export function runStatusCommand(options: any = {}): void {
  const config = loadConfig(options.config);
  const arcReactor = new ArcReactorPowerGrid(config.arcReactor);
  const state = arcReactor.getState();

  console.log('\n' + chalk.bold.red('🦾 STARK INDUSTRIES — ARC REACTOR & HERO STATUS'));
  console.log(chalk.gray('─'.repeat(65)));

  console.log(
    `${chalk.bold('Arc Reactor Total Capacity')}: ${chalk.yellow(
      state.totalCapacityPerHour.toLocaleString()
    )} tokens/hour`
  );
  console.log(
    `${chalk.bold('Power Grid Output Level')}: ${
      state.hourlyPowerLevelPct > 50
        ? chalk.green.bold(`${state.hourlyPowerLevelPct}% [OPTIMAL]`)
        : chalk.red.bold(`${state.hourlyPowerLevelPct}% [THROTTLED]`)
    }`
  );
  console.log(
    `${chalk.bold('Active Providers Connected')}: ${Object.keys(state.providerStatus)
      .filter((p: any) => state.providerStatus[p as keyof typeof state.providerStatus].enabled)
      .join(', ')}`
  );

  console.log('\n' + chalk.bold.cyan('🦸 ACTIVE AVENGERS HERO ROSTER'));
  console.log(chalk.gray('─'.repeat(65)));

  const heroIds = Object.keys(HERO_PROFILES) as HeroId[];
  for (const id of heroIds) {
    const p = HERO_PROFILES[id];
    console.log(
      ` ${p.avatar} ${chalk.bold(p.name.padEnd(24))} | ${chalk.yellow(
        p.callsign.padEnd(16)
      )} | Provider: ${chalk.cyan(p.preferredProvider)}`
    );
    console.log(`    ${chalk.dim(p.title)}`);
  }
  console.log(chalk.gray('─'.repeat(65)) + '\n');
}
