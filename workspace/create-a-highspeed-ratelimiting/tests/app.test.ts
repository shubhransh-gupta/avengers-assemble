import { describe, it, expect } from 'vitest';
import { CoreEngine } from '../src/services/engine';

describe('CoreEngine', () => {
  it('should initialize and store state values', () => {
    const engine = new CoreEngine();
    engine.set('status', 'active');
    expect(engine.get('status')).toBe('active');
  });

  it('should compute optimal paths', () => {
    const engine = new CoreEngine();
    expect(engine.computeOptimalPath([1, 2, 3, 4])).toBe(10);
  });
});