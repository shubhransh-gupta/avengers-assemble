import test from 'node:test';
import assert from 'node:assert/strict';
import { ArcReactorPowerGrid } from '../src/core/arc-reactor.js';
import { StarkConfig } from '../src/types.js';

const mockArcConfig: StarkConfig['arcReactor'] = {
  maxHourlyTokens: 10000,
  rollingWindowHours: 5,
  throttleThresholdPct: 80,
  autoFailover: true,
  providers: {
    'claude-code': {
      enabled: true,
      hourlyTokenLimit: 5000,
      priority: 1,
    },
    gemini: {
      enabled: true,
      hourlyTokenLimit: 8000,
      priority: 2,
    },
    mock: {
      enabled: true,
      hourlyTokenLimit: 999999,
      priority: 99,
    },
  },
};

test('ArcReactorPowerGrid - initial capacity and optimal provider', () => {
  const grid = new ArcReactorPowerGrid(mockArcConfig);
  const state = grid.getState();

  assert.equal(state.totalCapacityPerHour, 10000);
  assert.equal(state.currentConsumption, 0);
  assert.equal(state.hourlyPowerLevelPct, 100);
  assert.equal(state.isThrottled, false);

  const optimal = grid.getOptimalProvider('claude-code');
  assert.equal(optimal, 'claude-code');
});

test('ArcReactorPowerGrid - power consumption and failover routing', () => {
  const grid = new ArcReactorPowerGrid(mockArcConfig);

  const ok1 = grid.consumePower('claude-code', 4000);
  assert.equal(ok1, true);

  const ok2 = grid.consumePower('claude-code', 3000);
  assert.equal(ok2, false);

  const nextProvider = grid.getOptimalProvider('claude-code');
  assert.equal(nextProvider, 'gemini');
});
