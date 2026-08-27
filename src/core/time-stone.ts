import { TimelineBranch, HeroId } from '../types.js';

export class TimeStoneEngine {
  private static instance: TimeStoneEngine;
  private timelines: Map<string, TimelineBranch[]> = new Map();
  private snapshots: Map<string, Record<string, string>> = new Map();

  private constructor() {}

  public static getInstance(): TimeStoneEngine {
    if (!TimeStoneEngine.instance) {
      TimeStoneEngine.instance = new TimeStoneEngine();
    }
    return TimeStoneEngine.instance;
  }

  public spawnTimelines(
    missionId: string,
    variations: Array<{ name: string; hero: HeroId; description: string; previewCode: string }>
  ): TimelineBranch[] {
    const branches: TimelineBranch[] = variations.map((v, idx) => {
      const branchId = `timeline-${missionId}-${idx + 1}`;
      const prob = Math.floor(75 + Math.random() * 24);

      const branch: TimelineBranch = {
        id: branchId,
        name: v.name,
        createdHero: v.hero,
        description: v.description,
        probabilityOfSuccessPct: prob,
        status: 'simulating',
        diffPreview: v.previewCode,
      };

      return branch;
    });

    this.timelines.set(missionId, branches);
    return branches;
  }

  public selectOptimalTimeline(missionId: string): TimelineBranch | undefined {
    const branches = this.timelines.get(missionId);
    if (!branches || branches.length === 0) return undefined;

    branches.sort((a, b) => b.probabilityOfSuccessPct - a.probabilityOfSuccessPct);
    
    branches[0].status = 'merged';
    for (let i = 1; i < branches.length; i++) {
      branches[i].status = 'pruned';
    }

    return branches[0];
  }

  public saveSnapshot(snapshotId: string, files: Record<string, string>): void {
    this.snapshots.set(snapshotId, { ...files });
  }

  public rollback(snapshotId: string): Record<string, string> | undefined {
    return this.snapshots.get(snapshotId);
  }

  public getTimelines(missionId: string): TimelineBranch[] {
    return this.timelines.get(missionId) || [];
  }
}
