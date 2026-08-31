import test from 'node:test';
import assert from 'node:assert/strict';
import { StarkOrchestrator } from '../src/core/stark-orchestrator.js';
import { DEFAULT_CONFIG } from '../src/config.js';

test('StarkOrchestrator - conversational / weather query direct response (no dummy workspace)', async () => {
  const orchestrator = new StarkOrchestrator(DEFAULT_CONFIG);

  const mission = await orchestrator.launchMission('What is the weather in Delhi?');

  assert.equal(mission.status, 'success');
  assert.equal((mission as any).isChatOnly, true);
  assert.equal(mission.directives.length, 0);
  assert.ok(mission.finalSummary && mission.finalSummary.length > 0);
});

test('StarkOrchestrator - project build generates runnable workspace with README.md', async () => {
  const orchestrator = new StarkOrchestrator(DEFAULT_CONFIG);

  const mission = await orchestrator.launchMission(
    'Create an interactive calculator app in HTML and JavaScript'
  );

  assert.equal(mission.status, 'success');
  assert.ok(mission.directives.length >= 4);
  assert.ok(mission.arcReactorPowerUsed > 0);
  assert.ok(mission.finalSummary?.includes('Vibranium QA Stamp') || mission.finalSummary?.includes('README.md') || mission.finalSummary?.includes('How to Run'));

  const workspace = (mission as any).workspace;
  assert.ok(workspace);
  assert.ok(workspace.files.some((f: any) => f.relativePath === 'README.md'));
});

test('StarkOrchestrator - full Avengers Assemble mission execution', async () => {
  const orchestrator = new StarkOrchestrator(DEFAULT_CONFIG);

  const mission = await orchestrator.launchMission(
    'Create a high-speed rate-limiting token bucket middleware and unit test suite'
  );

  assert.equal(mission.status, 'success');
  assert.ok(mission.directives.length >= 4);
  assert.ok(mission.arcReactorPowerUsed > 0);

  const capDirective = mission.directives.find((d) => d.assignedHero === 'captain-america');
  assert.ok(capDirective);
  assert.equal(capDirective?.status, 'completed');
  assert.equal(capDirective?.outputs?.qaReview?.approved, true);
});
