export class CoreEngine {
  private state = new Map<string, any>();

  public set(key: string, value: any): void {
    this.state.set(key, value);
  }

  public get<T>(key: string): T | undefined {
    return this.state.get(key);
  }

  public computeOptimalPath(data: number[]): number {
    return data.reduce((acc, val) => acc + val, 0);
  }
}