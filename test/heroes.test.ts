import test from 'node:test';
import assert from 'node:assert/strict';
import { StarkCommsNetwork } from '../src/core/stark-comms.js';
import { TimeStoneEngine } from '../src/core/time-stone.js';
import { MindStoneMemory } from '../src/core/mind-stone.js';

test('StarkCommsNetwork - message routing and channel subscription', () => {
  const comms = StarkCommsNetwork.getInstance();
  let received = false;

  const unsubscribe = comms.onChannel('qa-audit', (msg) => {
    if (msg.fromHero === 'captain-america') {
      received = true;
    }
  });

  comms.send('captain-america', 'all', 'qa-audit', 'Standards review initiated.');
  assert.equal(received, true);
  unsubscribe();
});

test('TimeStoneEngine - multiverse branching and optimal timeline selection', () => {
  const timeStone = TimeStoneEngine.getInstance();
  const branches = timeStone.spawnTimelines('test-mission-1', [
    { name: 'Timeline A', hero: 'tony-stark', description: 'Async streaming', previewCode: 'code A' },
    { name: 'Timeline B', hero: 'hulk', description: 'Parallel gamma workers', previewCode: 'code B' },
  ]);

  assert.equal(branches.length, 2);
  const optimal = timeStone.selectOptimalTimeline('test-mission-1');
  assert.ok(optimal);
  assert.equal(optimal?.status, 'merged');
});

test('MindStoneMemory - persistent indexing and semantic keyword search', () => {
  const memory = MindStoneMemory.getInstance('.stark/test-memory.json');
  memory.store({
    title: 'PostgreSQL Connection Pooling Standard',
    category: 'convention',
    authorHero: 'tony-stark',
    tags: ['postgres', 'pooling', 'database'],
    content: 'Always use max 20 connections per pod with health check probes.',
  });

  const searchResults = memory.search('postgres pooling');
  assert.ok(searchResults.length > 0);
  assert.ok(searchResults[0].title.includes('PostgreSQL'));
});
