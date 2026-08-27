import test from 'node:test';
import assert from 'node:assert/strict';
import { StarkOrchestrator } from '../src/core/stark-orchestrator.js';
import { DEFAULT_CONFIG } from '../src/config.js';

test('StarkOrchestrator - full Avengers Assemble mission execution', async () => {
  const orchestrator = new StarkOrchestrator(DEFAULT_CONFIG);

  const mission = await orchestrator.launchMission(
    'Create a high-speed rate-limiting token bucket middleware and unit test suite'
  );

  assert.equal(mission.status, 'success');
  assert.ok(mission.directives.length >= 4);
  assert.ok(mission.arcReactorPowerUsed > 0);
  assert.ok(mission.finalSummary?.includes('Vibranium QA Stamp'));

  const capDirective = mission.directives.find((d) => d.assignedHero === 'captain-america');
  assert.ok(capDirective);
  assert.equal(capDirective?.status, 'completed');
  assert.equal(capDirective?.outputs?.qaReview?.approved, true);
});
