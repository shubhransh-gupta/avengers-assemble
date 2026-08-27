import { EventEmitter } from 'node:events';
import { CommsMessage, HeroId } from '../types.js';

export type CommsListener = (msg: CommsMessage) => void;

export class StarkCommsNetwork {
  private static instance: StarkCommsNetwork;
  private emitter = new EventEmitter();
  private history: CommsMessage[] = [];
  private maxHistory = 500;

  private constructor() {
    this.emitter.setMaxListeners(100);
  }

  public static getInstance(): StarkCommsNetwork {
    if (!StarkCommsNetwork.instance) {
      StarkCommsNetwork.instance = new StarkCommsNetwork();
    }
    return StarkCommsNetwork.instance;
  }

  public send(
    fromHero: HeroId | 'user' | 'system' | 'orchestrator',
    toHero: HeroId | 'all' | 'orchestrator',
    channel: CommsMessage['channel'],
    content: string,
    metadata?: Record<string, any>
  ): CommsMessage {
    const msg: CommsMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fromHero,
      toHero,
      channel,
      content,
      timestamp: Date.now(),
      metadata,
    };

    this.history.push(msg);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    this.emitter.emit('message', msg);
    this.emitter.emit(`channel:${channel}`, msg);
    if (toHero !== 'all') {
      this.emitter.emit(`hero:${toHero}`, msg);
    }

    return msg;
  }

  public onMessage(listener: CommsListener): () => void {
    this.emitter.on('message', listener);
    return () => this.emitter.off('message', listener);
  }

  public onChannel(channel: CommsMessage['channel'], listener: CommsListener): () => void {
    const event = `channel:${channel}`;
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  public onHero(heroId: HeroId, listener: CommsListener): () => void {
    const event = `hero:${heroId}`;
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  public getHistory(limit = 100): CommsMessage[] {
    return this.history.slice(-limit);
  }

  public clear(): void {
    this.history = [];
  }
}
