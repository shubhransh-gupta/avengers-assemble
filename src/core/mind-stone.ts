import fs from 'node:fs';
import path from 'node:path';
import { KnowledgeDocument, HeroId } from '../types.js';

export class MindStoneMemory {
  private static instance: MindStoneMemory;
  private memoryPath: string;
  private documents: Map<string, KnowledgeDocument> = new Map();

  private constructor(storagePath = '.stark/memory.json') {
    this.memoryPath = path.resolve(process.cwd(), storagePath);
    this.initStorage();
  }

  public static getInstance(storagePath?: string): MindStoneMemory {
    if (!MindStoneMemory.instance) {
      MindStoneMemory.instance = new MindStoneMemory(storagePath);
    }
    return MindStoneMemory.instance;
  }

  private initStorage(): void {
    try {
      const dir = path.dirname(this.memoryPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.memoryPath)) {
        const data = fs.readFileSync(this.memoryPath, 'utf8');
        const docs: KnowledgeDocument[] = JSON.parse(data);
        for (const doc of docs) {
          this.documents.set(doc.id, doc);
        }
      } else {
        this.store({
          title: 'Stark Architecture Standard v1',
          category: 'convention',
          authorHero: 'tony-stark',
          tags: ['architecture', 'standard', 'starknet'],
          content: 'Always prefer modular TypeScript with clean interface boundaries. QA review must pass Captain America standards before production deployment.',
        });
      }
    } catch (err) {
      console.warn('[VISION] Failed to load Mind Stone memory store:', err);
    }
  }

  public store(doc: Omit<KnowledgeDocument, 'id' | 'createdAt'>): KnowledgeDocument {
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    this.documents.set(newDoc.id, newDoc);
    this.persist();
    return newDoc;
  }

  public search(query: string, limit = 5): KnowledgeDocument[] {
    const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const results: Array<{ doc: KnowledgeDocument; score: number }> = [];

    for (const doc of this.documents.values()) {
      let score = 0;
      const text = `${doc.title} ${doc.content} ${doc.tags.join(' ')}`.toLowerCase();

      for (const token of queryTokens) {
        if (text.includes(token)) score += 1;
        if (doc.tags.includes(token)) score += 2;
        if (doc.title.toLowerCase().includes(token)) score += 3;
      }

      if (score > 0) {
        results.push({ doc, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit).map((r) => r.doc);
  }

  public getAll(): KnowledgeDocument[] {
    return Array.from(this.documents.values());
  }

  private persist(): void {
    try {
      const data = JSON.stringify(Array.from(this.documents.values()), null, 2);
      fs.writeFileSync(this.memoryPath, data, 'utf8');
    } catch (err) {
      console.warn('[VISION] Failed to persist Mind Stone memory:', err);
    }
  }
}
