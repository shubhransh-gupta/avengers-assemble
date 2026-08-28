# 🦾 Contributing to Avengers Assemble

First off — **welcome, hero.** Every contribution, no matter how small, helps defend codebases across the multiverse.

> *"Part of the journey is the end."* — Tony Stark

## 🚀 Quick Start

```bash
git clone https://github.com/shubhransh-gupta/scavengers-assemble.git
cd scavengers-assemble
npm install
npm test       # Make sure all 6 tests pass before you start
```

## 🦸 Ways to Contribute

| Type | Details |
|:---|:---|
| 🆕 New Hero Agent | Add a new Avenger (Ant-Man, Wanda, Falcon, Black Panther) |
| 🔌 New LLM Provider | Add adapter for Mistral, Cohere, Groq, DeepSeek API |
| 🎨 HUD Improvements | Enhance the Stark Tower cyberpunk dashboard |
| 🧪 Tests | Add test coverage for uncovered paths |
| 📝 Docs | Improve README, add tutorials, examples |
| 🐛 Bug Fixes | Squash bugs — Hawkeye style |
| ⚡ Performance | Optimize Arc Reactor scheduling or token management |

## 📋 Pull Request Process

1. **Fork & branch**: `git checkout -b feat/add-antman-hero`
2. **Write tests** for any new functionality
3. **Run the full suite**: `npm test` — all 6 tests must pass
4. **Build TypeScript**: `npm run build` — zero errors
5. **Write a clear PR description** with what changed and why
6. **Captain America will review** — be patient, the shield takes time

## 🦸 Adding a New Hero Agent

1. Create `src/heroes/your-hero.ts` extending `BaseHero`
2. Implement `executeDirective(directive: MissionDirective): Promise<HeroExecutionResult>`
3. Add the `HeroId` to `src/types.ts`
4. Add the `HeroProfile` to `src/config.ts`
5. Register in `src/core/stark-orchestrator.ts`
6. Write unit tests in `test/`

## 🔌 Adding a New Provider

1. Create `src/providers/your-provider.ts` extending `BaseProvider`
2. Implement `isAvailable()` and `execute(prompt, options)`
3. Add the `ProviderType` to `src/types.ts`
4. Register in `src/config.ts` provider initialization

## Code Style

- **TypeScript strict mode** — no `any` without justification
- **ESM modules** — use `.js` extensions in imports
- Keep heroes in character — Tony is sarcastic, Cap is earnest, Hulk SMASHES

## 🛡️ Code of Conduct

Be excellent to each other. This is a place for all heroes, regardless of background.

Questions? Open a [Discussion](https://github.com/shubhransh-gupta/scavengers-assemble/discussions).
