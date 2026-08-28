import { BaseProvider, ProviderExecutionOptions, ProviderResponse } from './base-provider.js';
import { ProviderType } from '../types.js';

export class MockProvider extends BaseProvider {
  public readonly providerType: ProviderType = 'mock';
  public readonly isLocal = true;

  async isAvailable(): Promise<boolean> {
    return true;
  }

  async execute(prompt: string, options?: ProviderExecutionOptions): Promise<ProviderResponse> {
    const tokens = Math.floor(400 + Math.random() * 800);
    const heroMatch = (options?.systemPrompt || '').toLowerCase();

    let responseText = '';

    const isSwift = prompt.toLowerCase().includes('swift') || prompt.toLowerCase().includes('ios');

    if (heroMatch.includes('tony') || heroMatch.includes('iron man')) {
      responseText = `[JARVIS Telemetry]: Analyzing mission parameter: "${prompt}"
Tony Stark Directive Deconstruction:
1. Architecture Matrix verified.
2. Delegating UI/UX components to Spider-Man.
3. Assigning core logic & state management to Hulk.
4. Setting up containerization & package manifest with Thor.
5. Commissioning unit test barrage to Hawkeye.
6. Handing security reconnaissance to Black Widow.
7. Requiring final sign-off & audit from Captain America.

Directives uploaded to the Avengers Mesh. Let's build.`;
    } else if (heroMatch.includes('captain america') || heroMatch.includes('steve rogers')) {
      responseText = `[Captain America - QA Review]:
Inspecting code changes against project standards...
✓ Clean architecture & modular separation verified.
✓ Strict type safety compliance: 100%.
✓ No race conditions or unhandled error states.
✓ Standards & security compliance certified.

Vibranium Shield QA Stamp: APPROVED. You did good, soldier.`;
    } else if (heroMatch.includes('hulk') || heroMatch.includes('banner')) {
      if (isSwift) {
        responseText = `\`\`\`swift
// File: AppState.swift
import SwiftUI
import Foundation

@MainActor
public class AppState: ObservableObject {
    @Published public var count: Int = 0
    @Published public var title: String = "Scavengers App"
    @Published public var items: [String] = ["Avengers Tower", "Quantum Realm", "Latveria"]
    
    public init() {}
    
    public func increment() {
        count += 1
    }
    
    public func decrement() {
        if count > 0 {
            count -= 1
        }
    }
    
    public func reset() {
        count = 0
    }
}
\`\`\``;
      } else {
        responseText = `\`\`\`typescript
// File: src/services/engine.ts
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
\`\`\``;
      }
    } else if (heroMatch.includes('thor')) {
      if (isSwift) {
        responseText = `\`\`\`swift
// File: Package.swift
// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "ScavengersSwiftApp",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "ScavengersSwiftApp", targets: ["App"])
    ],
    dependencies: [],
    targets: [
        .target(name: "App", dependencies: []),
        .testTarget(name: "AppTests", dependencies: ["App"])
    ]
)
\`\`\``;
      } else {
        responseText = `\`\`\`dockerfile
// File: Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json tsconfig.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
\`\`\``;
      }
    } else if (heroMatch.includes('hawkeye') || heroMatch.includes('clint')) {
      if (isSwift) {
        responseText = `\`\`\`swift
// File: AppTests.swift
import XCTest
@testable import App

final class AppTests: XCTestCase {
    @MainActor
    func testIncrement() {
        let state = AppState()
        XCTAssertEqual(state.count, 0)
        state.increment()
        XCTAssertEqual(state.count, 1)
    }
    
    @MainActor
    func testDecrementBoundary() {
        let state = AppState()
        state.decrement()
        XCTAssertEqual(state.count, 0)
    }
}
\`\`\``;
      } else {
        responseText = `\`\`\`typescript
// File: tests/app.test.ts
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
\`\`\``;
      }
    } else if (heroMatch.includes('spider-man') || heroMatch.includes('peter')) {
      if (isSwift) {
        responseText = `\`\`\`swift
// File: ContentView.swift
import SwiftUI

public struct ContentView: View {
    @StateObject private var appState = AppState()
    
    public init() {}
    
    public var body: some View {
        VStack(spacing: 24) {
            Text("🦾 SCAVENGERS ASSEMBLE")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.accentColor)
            
            Text("Counter: \(appState.count)")
                .font(.system(size: 48, weight: .black, design: .monospaced))
            
            HStack(spacing: 16) {
                Button(action: { appState.decrement() }) {
                    Image(systemName: "minus.circle.fill")
                        .font(.system(size: 32))
                }
                
                Button(action: { appState.increment() }) {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 32))
                }
            }
        }
        .padding(32)
    }
}
\`\`\``;
      } else {
        responseText = `\`\`\`tsx
// File: src/components/App.tsx
import React, { useState } from 'react';

export const App: React.FC = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-4 text-cyan-400">🦾 Scavengers App</h1>
      <p className="text-5xl font-mono mb-6">{count}</p>
      <div className="flex gap-4">
        <button onClick={() => setCount(c => c - 1)} className="px-4 py-2 bg-slate-800 rounded-lg">-</button>
        <button onClick={() => setCount(c => c + 1)} className="px-4 py-2 bg-cyan-500 rounded-lg">+</button>
      </div>
    </div>
  );
};
\`\`\``;
      }
    } else if (heroMatch.includes('doctor strange')) {
      responseText = `[Doctor Strange - Time Stone]:
Opening the Eye of Agamotto...
Simulated 14,000,605 future architectural branches.
Selected optimal timeline branch (98.4% success probability).
Temporal snapshot preserved for instantaneous rollback.`;
    } else if (heroMatch.includes('vision')) {
      responseText = `[Vision - Mind Stone Knowledge]:
Synthesized project context with org knowledge base.
Indexed 4 architectural conventions and 2 previous bug resolutions.
Team memory synchronized across the mesh.`;
    } else {
      responseText = `[STARK Mission Execution]:
Successfully processed task: "${prompt}".
Generated modular implementation and verified with team protocols.`;
    }

    if (options?.streamCallback) {
      const chunks = responseText.split(' ');
      for (const chunk of chunks) {
        options.streamCallback(`${chunk} `);
        await new Promise((resolve) => setTimeout(resolve, 15));
      }
    }

    return {
      content: responseText,
      tokensUsed: tokens,
      model: 'stark-simulator-v1',
      provider: 'mock',
    };
  }
}
