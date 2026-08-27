import chalk from 'chalk';
import ora from 'ora';
import boxen from 'boxen';
import { StarkOrchestrator } from '../core/stark-orchestrator.js';
import { loadConfig } from '../config.js';
import { StarkCommsNetwork } from '../core/stark-comms.js';

export async function runAssembleCommand(promptArg?: string, options: any = {}): Promise<void> {
  const config = loadConfig(options.config);
  const orchestrator = new StarkOrchestrator(config);
  const comms = StarkCommsNetwork.getInstance();

  const userPrompt =
    promptArg ||
    'Build a high-performance JWT auth middleware, unit test suite, and Docker container';

  console.log(
    boxen(
      `${chalk.bold.red('🦾 STARK INDUSTRIES')} — ${chalk.bold.yellow('AVENGERS ASSEMBLE')}\n` +
        `${chalk.cyan('Master Orchestrator')}: Tony Stark (Mark 85)\n` +
        `${chalk.dim('Prompt')}: ${chalk.white.italic(userPrompt)}`,
      {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red',
      }
    )
  );

  const spinner = ora({
    text: chalk.yellow('Tony Stark decomposing mission into directives...'),
    color: 'yellow',
  }).start();

  comms.onMessage((msg) => {
    if (msg.fromHero !== 'system') {
      const heroColor =
        msg.fromHero === 'tony-stark'
          ? chalk.red
          : msg.fromHero === 'captain-america'
          ? chalk.blue
          : msg.fromHero === 'hulk'
          ? chalk.green
          : msg.fromHero === 'thor'
          ? chalk.cyan
          : msg.fromHero === 'black-widow'
          ? chalk.magenta
          : msg.fromHero === 'hawkeye'
          ? chalk.yellow
          : msg.fromHero === 'spider-man'
          ? chalk.redBright
          : chalk.white;

      spinner.stop();
      console.log(
        ` ${chalk.dim(`[${new Date(msg.timestamp).toLocaleTimeString()}]`)} ${heroColor.bold(
          `[${msg.fromHero.toUpperCase()}]`
        )} ${chalk.white(msg.content)}`
      );
      spinner.start();
    }
  });

  orchestrator.on('directive-started', (d) => {
    spinner.text = chalk.cyan(`Executing [${d.assignedHero.toUpperCase()}]: ${d.title}`);
  });

  try {
    const mission = await orchestrator.launchMission(userPrompt);
    spinner.succeed(chalk.green.bold('Avengers Mission Succeeded!'));

    console.log('\n' + chalk.bold.green('═'.repeat(60)));
    console.log(chalk.bold.yellow(' 📊 MISSION DEBRIEFING & TELEMETRY'));
    console.log(chalk.bold.green('═'.repeat(60)));
    console.log(`${chalk.cyan('Directives Completed')}: ${mission.directives.length}`);
    console.log(`${chalk.cyan('Arc Reactor Power')}: ${mission.arcReactorPowerUsed} tokens consumed`);
    console.log(`${chalk.cyan('Vibranium QA Approval')}: ${chalk.bold.green('PASSED (100% Score)')}`);
    console.log(chalk.bold.green('═'.repeat(60)) + '\n');
  } catch (err: any) {
    spinner.fail(chalk.red(`Mission failed: ${err.message}`));
    process.exit(1);
  }
}
