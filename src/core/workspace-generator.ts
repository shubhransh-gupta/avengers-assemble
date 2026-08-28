import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';

export interface GeneratedFile {
  relativePath: string;
  absolutePath: string;
  language: string;
  sizeBytes: number;
  content: string;
  hero: string;
}

export interface WorkspaceProject {
  projectName: string;
  projectSlug: string;
  workspacePath: string;
  relativeWorkspacePath: string;
  files: GeneratedFile[];
  runInstructions: string[];
  techStack: string;
  createdAt: number;
}

export class WorkspaceGenerator extends EventEmitter {
  private baseWorkspaceDir: string;

  constructor(baseDir?: string) {
    super();
    this.baseWorkspaceDir = baseDir || path.resolve(process.cwd(), 'workspace');
    if (!fs.existsSync(this.baseWorkspaceDir)) {
      fs.mkdirSync(this.baseWorkspaceDir, { recursive: true });
    }
  }

  public generateProjectSlug(prompt: string): string {
    const clean = prompt
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join('-');
    return clean || 'generated-app-' + Date.now();
  }

  public detectTechStack(prompt: string): string {
    const p = prompt.toLowerCase();
    if (p.includes('swiftui') || p.includes('swift') || p.includes('ios')) return 'swiftui';
    if (p.includes('react') || p.includes('next.js') || p.includes('nextjs')) return 'react';
    if (p.includes('python') || p.includes('fastapi') || p.includes('flask')) return 'python';
    if (p.includes('vue') || p.includes('nuxt')) return 'vue';
    if (p.includes('flutter') || p.includes('dart')) return 'flutter';
    if (p.includes('go') || p.includes('golang')) return 'golang';
    if (p.includes('rust')) return 'rust';
    return 'typescript-node';
  }

  public parseFilesFromDirective(
    directiveTitle: string,
    hero: string,
    output: string,
    techStack: string
  ): Array<{ filename: string; content: string; language: string }> {
    const files: Array<{ filename: string; content: string; language: string }> = [];

    // Pattern 1: ```lang // File: path/filename.ext or ### File: filename.ext
    const codeBlockRegex = /```([a-zA-Z0-9_\-\.]*)\s*(?:\/\/\s*File:\s*([^\n\r]+)|#+\s*File:\s*([^\n\r]+)|#+\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+))?\n([\s\S]*?)```/g;

    let match;
    let fallbackIndex = 1;

    while ((match = codeBlockRegex.exec(output)) !== null) {
      const lang = match[1]?.trim() || '';
      let filename = match[2]?.trim() || match[3]?.trim() || match[4]?.trim() || '';
      const code = match[5]?.trim() || '';

      if (!code) continue;

      // If no explicit filename was captured in codeblock header, check first line of code
      if (!filename) {
        const firstLineMatch = code.match(/^(?:\/\/|#|\/\*)\s*(?:File|Filename|Path):\s*([a-zA-Z0-9_\-\.\/]+\.[a-zA-Z0-9]+)/i);
        if (firstLineMatch) {
          filename = firstLineMatch[1].trim();
        }
      }

      // If still no filename, deduce from techStack and language
      if (!filename) {
        if (techStack === 'swiftui' || lang.toLowerCase() === 'swift') {
          if (code.includes('@main') || code.includes(': App')) filename = 'App.swift';
          else if (code.includes('View') || code.includes('body: some View')) filename = `ContentView${fallbackIndex > 1 ? fallbackIndex : ''}.swift`;
          else if (code.includes('ObservableObject') || code.includes('@Observable')) filename = `ViewModel${fallbackIndex > 1 ? fallbackIndex : ''}.swift`;
          else if (code.includes('struct') || code.includes('Identifiable')) filename = `Models${fallbackIndex > 1 ? fallbackIndex : ''}.swift`;
          else if (code.includes('XCTestCase')) filename = 'AppTests.swift';
          else filename = `Source${fallbackIndex}.swift`;
        } else if (lang.toLowerCase() === 'typescript' || lang.toLowerCase() === 'ts') {
          if (code.includes('describe(') || code.includes('test(')) filename = `tests/app.test.ts`;
          else if (code.includes('express') || code.includes('Router')) filename = `src/routes.ts`;
          else if (code.includes('React') || code.includes('export default function')) filename = `src/components/Component${fallbackIndex}.tsx`;
          else filename = `src/index${fallbackIndex > 1 ? fallbackIndex : ''}.ts`;
        } else if (lang.toLowerCase() === 'dockerfile' || directiveTitle.toLowerCase().includes('docker')) {
          filename = 'Dockerfile';
        } else if (lang.toLowerCase() === 'yaml' || lang.toLowerCase() === 'yml') {
          filename = '.github/workflows/ci.yml';
        } else if (lang.toLowerCase() === 'json') {
          filename = 'package.json';
        } else {
          const ext = lang ? `.${lang}` : '.txt';
          filename = `file_${fallbackIndex}${ext}`;
        }
        fallbackIndex++;
      }

      // Clean up filename
      filename = filename.replace(/^[\.\/]+/, '').trim();
      files.push({ filename, content: code, language: lang || 'text' });
    }

    return files;
  }

  public async createWorkspaceProject(
    prompt: string,
    directives: Array<{ title: string; assignedHero: string; output: string }>
  ): Promise<WorkspaceProject> {
    const slug = this.generateProjectSlug(prompt);
    const techStack = this.detectTechStack(prompt);
    const projectDir = path.resolve(this.baseWorkspaceDir, slug);

    if (!fs.existsSync(projectDir)) {
      fs.mkdirSync(projectDir, { recursive: true });
    }

    const files: GeneratedFile[] = [];

    // Parse and write files from each hero's output
    for (const dir of directives) {
      const parsedFiles = this.parseFilesFromDirective(dir.title, dir.assignedHero, dir.output, techStack);

      for (const pf of parsedFiles) {
        const fullPath = path.resolve(projectDir, pf.filename);
        const parentDir = path.dirname(fullPath);

        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }

        fs.writeFileSync(fullPath, pf.content, 'utf8');

        const genFile: GeneratedFile = {
          relativePath: path.relative(projectDir, fullPath),
          absolutePath: fullPath,
          language: pf.language,
          sizeBytes: Buffer.byteLength(pf.content, 'utf8'),
          content: pf.content,
          hero: dir.assignedHero,
        };

        files.push(genFile);
        this.emit('file_written', genFile);
      }
    }

    // Generate standard README.md if not created
    const readmePath = path.resolve(projectDir, 'README.md');
    if (!fs.existsSync(readmePath)) {
      const readmeContent = this.generateProjectReadme(prompt, slug, techStack, files);
      fs.writeFileSync(readmePath, readmeContent, 'utf8');
      files.push({
        relativePath: 'README.md',
        absolutePath: readmePath,
        language: 'markdown',
        sizeBytes: Buffer.byteLength(readmeContent, 'utf8'),
        content: readmeContent,
        hero: 'tony-stark',
      });
    }

    // Build run instructions
    const runInstructions = this.getRunInstructions(techStack, slug, projectDir);

    const project: WorkspaceProject = {
      projectName: slug.replace(/-/g, ' ').toUpperCase(),
      projectSlug: slug,
      workspacePath: projectDir,
      relativeWorkspacePath: `./workspace/${slug}`,
      files,
      runInstructions,
      techStack,
      createdAt: Date.now(),
    };

    return project;
  }

  private getRunInstructions(techStack: string, slug: string, projectDir: string): string[] {
    switch (techStack) {
      case 'swiftui':
        return [
          `cd workspace/${slug}`,
          `open . # Opens project folder in Finder / Xcode`,
          `# Drag into Xcode or run with Swift Playgrounds / swift build`,
        ];
      case 'react':
        return [
          `cd workspace/${slug}`,
          `npm install`,
          `npm run dev`,
        ];
      case 'python':
        return [
          `cd workspace/${slug}`,
          `python3 -m venv venv && source venv/bin/activate`,
          `pip install -r requirements.txt`,
          `python3 main.py`,
        ];
      default:
        return [
          `cd workspace/${slug}`,
          `npm install`,
          `npm start`,
        ];
    }
  }

  private generateProjectReadme(prompt: string, slug: string, techStack: string, files: GeneratedFile[]): string {
    const fileList = files.map(f => `- **\`${f.relativePath}\`** (${f.language}) — *Crafted by ${f.hero}*`).join('\n');
    return `# 🦾 ${slug.replace(/-/g, ' ').toUpperCase()}

> **Created by SCAVENGERS Assemble Multi-Agent Engine**
> **Master Directive**: "${prompt}"
> **Tech Stack**: \`${techStack.toUpperCase()}\`

---

## 📁 Generated Project Files

${fileList}

---

## 🚀 How to Run

\`\`\`bash
cd workspace/${slug}
${this.getRunInstructions(techStack, slug, '').join('\n')}
\`\`\`

---
*Vibranium Shield QA Verified. Built with Scavengers AI Multi-Agent Harness.*
`;
  }
}
