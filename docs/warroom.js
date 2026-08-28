/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — AGENTIC AI WAR ROOM & MULTIVERSE CHAMBERS
   Features: 1-Click OAuth & ID Login, Antigravity Bridge, Cursor Connect,
   Codex, Gemini, Dynamic Hero Spawning, Custom Hero Forge, Sharp Fonts
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let lastTime = performance.now();
let soundEnabled = true;
let simSpeed = 1;
let selectedHeroId = 'tony-stark';
let audioCtx = null;

// Provider descriptions & OAuth labels
const PROVIDER_METADATA = {
  'antigravity': {
    name: 'Google Antigravity',
    icon: '🚀',
    desc: 'Connect via local AGY sidecar bridge to coordinate multi-agent DAG execution in Antigravity.',
    btnLabel: 'Connect Google Antigravity & Enter Platform',
    badge: '✓ Secure Direct Bridge',
    keyPlaceholder: 'Local AGY Daemon (Auto-detecting...)'
  },
  'cursor': {
    name: 'Cursor IDE',
    icon: '⚡',
    desc: 'Log in with your Cursor account / MCP configuration to dispatch tasks from Composer.',
    btnLabel: 'Log in with Cursor IDE & Enter Platform',
    badge: '✓ Cursor MCP Connected',
    keyPlaceholder: 'Cursor Session Token / API Key'
  },
  'claude-code': {
    name: 'Claude Code',
    icon: '🤖',
    desc: 'Authenticate with Anthropic CLI session or OAuth to drive Tony Stark GOD orchestration.',
    btnLabel: 'Connect Claude Code & Enter Platform',
    badge: '✓ Anthropic CLI Active',
    keyPlaceholder: 'sk-ant-api03-...'
  },
  'codex': {
    name: 'OpenAI Codex / Copilot',
    icon: '🔷',
    desc: 'Sign in with your OpenAI or GitHub Copilot account for security audits and deep AST refactors.',
    btnLabel: 'Connect OpenAI Codex & Enter Platform',
    badge: '✓ OpenAI / Copilot Auth',
    keyPlaceholder: 'sk-proj-...'
  },
  'gemini': {
    name: 'Google Gemini',
    icon: '✨',
    desc: 'Sign in with Google OAuth to harness 1M+ token context windows for QA and test generation.',
    btnLabel: 'Sign in with Google & Enter Platform',
    badge: '✓ Google OAuth 2.0',
    keyPlaceholder: 'AIzaSy...'
  },
  'kimi': {
    name: 'Kimi (Moonshot AI)',
    icon: '🌙',
    desc: 'Connect Moonshot AI account for 128k+ long-context multilingual reasoning.',
    btnLabel: 'Connect Kimi Moonshot & Enter Platform',
    badge: '✓ Moonshot API Ready',
    keyPlaceholder: 'sk-...'
  },
  'grok': {
    name: 'xAI Grok',
    icon: '⚡',
    desc: 'Connect with xAI session for real-time DevOps and infrastructure synthesis.',
    btnLabel: 'Connect xAI Grok & Enter Platform',
    badge: '✓ xAI API Ready',
    keyPlaceholder: 'xai-...'
  },
  'ollama': {
    name: 'Ollama (Local Offline)',
    icon: '🦙',
    desc: 'Direct connection to local Ollama daemon at http://localhost:11434 with zero API costs.',
    btnLabel: 'Connect Local Ollama Daemon & Enter Platform',
    badge: '✓ Localhost:11434',
    keyPlaceholder: 'http://localhost:11434'
  }
};

// Available Pre-Configured Avengers
const PRESET_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    shortName: 'TONY STARK',
    tag: 'GOD',
    role: 'Lead GOD Orchestrator',
    chamber: 'Development Chamber',
    harness: 'claudeTerminalHarness',
    model: 'Claude Code',
    color: '#00F0FF',
    archetype: 'iron',
    officeX: 130, officeY: 175,
    dialogs: [
      "JARVIS, deconstruct the master prompt into DAG directives.",
      "Arc Reactor load balancing: 99.8% optimal. Directives streaming.",
      "Cap, your strict types look solid. Approved.",
      "Hulk, smash that memory bottleneck now."
    ]
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    shortName: 'CAPTAIN AMERICA',
    tag: 'QA',
    role: 'QA Commander & Standards',
    chamber: 'QA & Testing Chamber',
    harness: 'geminiProHarness',
    model: 'Gemini',
    color: '#38BDF8',
    archetype: 'cap',
    officeX: 175, officeY: 420,
    dialogs: [
      "I can do this all day. No unhandled promise rejections on my watch.",
      "Vibranium Shield QA stamp applied: 100% strict TypeScript types verified.",
      "Language, team! Clean commits only on main branch.",
      "All assertions green across test suites."
    ]
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    shortName: 'THE HULK',
    tag: 'AST',
    role: 'Deep AST Refactorer',
    chamber: 'Development Chamber',
    harness: 'ollamaDeepSeekHarness',
    model: 'Ollama (Local)',
    color: '#00FF87',
    archetype: 'hulk',
    officeX: 285, officeY: 420,
    dialogs: [
      "HULK SMASH O(N^2) BOTTLENECK! REFACTOR WITH GAMMA SPEED!!",
      "Banner mode: Profiling heap memory snapshot...",
      "FOUND CIRCULAR DEPENDENCY! HULK CRUSH BUG!!"
    ]
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    shortName: 'BLACK WIDOW',
    tag: 'SEC',
    role: 'Security Recon & CVE Audit',
    chamber: 'Security & Audit Chamber',
    harness: 'openaiGpt4oHarness',
    model: 'OpenAI Codex',
    color: '#A855F7',
    archetype: 'widow',
    officeX: 395, officeY: 420,
    dialogs: [
      "Infiltrating codebase perimeter. Scanning dependencies for zero-days.",
      "Sanitized API bearer keys in .env. Ledger clean.",
      "CVE vulnerability isolated and patched. Auth perimeter fortified."
    ]
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    shortName: 'THOR',
    tag: 'OPS',
    role: 'DevOps & Lightning Builds',
    chamber: 'DevOps & PR Chamber',
    harness: 'xaiGrokHarness',
    model: 'xAI Grok',
    color: '#00E5FF',
    archetype: 'thor',
    officeX: 520, officeY: 220,
    dialogs: [
      "BY THE POWER OF MJOLNIR, SUMMONING THE DOCKER BIFROST!",
      "Kubernetes ingress struck by lightning! Multi-stage build forged in 4.2s.",
      "CI/CD pipeline humming with thunderous high voltage."
    ]
  },
  'hawkeye': {
    id: 'hawkeye',
    name: 'Clint Barton',
    shortName: 'HAWKEYE',
    tag: 'TEST',
    role: 'Precision Unit Testing',
    chamber: 'QA & Testing Chamber',
    harness: 'geminiFlashHarness',
    model: 'Gemini',
    color: '#FFD700',
    archetype: 'hawkeye',
    officeX: 630, officeY: 220,
    dialogs: [
      "I played 18 test suites, I shot 18 passing assertions. Can't seem to miss.",
      "Locking on boundary conditions: null, undefined, NaN, Infinity. Bullseye!"
    ]
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    shortName: 'SPIDER-MAN',
    tag: 'UI',
    role: 'Frontend Hero & UI/UX',
    chamber: 'Development Chamber',
    harness: 'claudeFrontendHarness',
    model: 'Claude Code',
    color: '#38BDF8',
    archetype: 'spidey',
    officeX: 175, officeY: 580,
    dialogs: [
      "Your friendly neighborhood frontend hero swinging in!",
      "Spun up accessible React components with buttery 60 FPS Tailwind animations!",
      "Hey Mr. Stark, I fixed the dark mode toggle!"
    ]
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    shortName: 'DOCTOR STRANGE',
    tag: 'SIM',
    role: 'Multiverse Simulator',
    chamber: 'Multiverse & Incursion Chamber',
    harness: 'timeStoneEngine',
    model: 'Antigravity / Reasoning',
    color: '#FF9900',
    archetype: 'strange',
    officeX: 780, officeY: 200,
    dialogs: [
      "Opening the Eye of Agamotto. Simulating 14,000,605 timelines...",
      "Reality-616 selected: Incursions averted with 98.4% success.",
      "Time Stone snapshot sealed. Instant rollback ready if build fails."
    ]
  },
  'vision': {
    id: 'vision',
    name: 'Vision',
    shortName: 'VISION',
    tag: 'MEM',
    role: 'Mind Stone Memory',
    chamber: 'Mind Stone Knowledge Chamber',
    harness: 'mindStoneMemory',
    model: 'Gemini',
    color: '#FFD700',
    archetype: 'vision',
    officeX: 520, officeY: 580,
    dialogs: [
      "Accessing Mind Stone semantic knowledge matrix...",
      "Indexed 42 architecture conventions into persistent org memory.",
      "Synchronizing context across all active agent mental nodes."
    ]
  }
};

let activeHeroes = [];
let quantumDataPackets = [];
let speechBubbles = [];
let spawnParticles = [];

// Audio Synthesizer
function getAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function playSfx(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudio();
    const now = ctx.currentTime;
    if (type === 'repulsor') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'beam') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.22);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.26);
    } else if (type === 'packet') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(1150, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.13);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(950, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    }
  } catch {}
}

// Realistic Superhero Entity
class SuperheroEntity {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.shortName = config.shortName || config.name;
    this.tag = config.tag || 'AGENT';
    this.role = config.role;
    this.chamber = config.chamber;
    this.harness = config.harness;
    this.model = config.model;
    this.color = config.color || '#00F0FF';
    this.archetype = config.archetype || 'iron';
    this.dialogs = config.dialogs || ["Directive acknowledged. Ready for action."];

    this.homeX = config.officeX || 480;
    this.homeY = config.officeY || 340;
    this.x = 480;
    this.y = 340;
    this.targetX = this.homeX;
    this.targetY = this.homeY;
    this.state = 'SPAWNING';
    this.animTimer = 0;
    this.actionTimer = 2000 + Math.random() * 3000;
  }

  speak(text = null) {
    const dialog = text || this.dialogs[Math.floor(Math.random() * this.dialogs.length)];
    createSpeechBubble(this, dialog);
    appendTerminalLine('action', `● [${this.shortName}] ${dialog}`);
    playSfx('pop');
  }

  update(dt) {
    this.animTimer += dt * 4 * simSpeed;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      this.state = 'WALKING';
      const speed = 55 * simSpeed * dt;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    } else {
      this.state = 'WORKING';
    }

    this.actionTimer -= dt * 1000 * simSpeed;
    if (this.actionTimer <= 0) {
      if (this.state === 'WORKING') {
        if (Math.random() < 0.25) {
          this.targetX = 480 + (Math.random() - 0.5) * 80;
          this.targetY = 340 + (Math.random() - 0.5) * 60;
          this.actionTimer = 4000;
        } else {
          this.actionTimer = 5000 + Math.random() * 5000;
          if (Math.random() < 0.3) this.speak();
        }
      } else {
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.actionTimer = 6000;
      }
    }
  }

  draw(ctx, scaleX, scaleY) {
    const px = this.x * scaleX;
    const py = this.y * scaleY;
    const isWalking = this.state === 'WALKING';
    const bob = isWalking ? Math.sin(this.animTimer * 2) * 3 : 0;

    ctx.save();
    ctx.translate(px, py);

    // Ground Shadow
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // Selected Halo
    if (selectedHeroId === this.id) {
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 10, 0, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.translate(0, bob);

    // Cape rendering
    if (this.archetype === 'thor' || this.archetype === 'strange' || this.archetype === 'vision') {
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.bezierCurveTo(-14, 4, -12, 14, -8, 16);
      ctx.lineTo(8, 16);
      ctx.bezierCurveTo(12, 14, 14, 4, 10, -10);
      ctx.closePath();
      ctx.fillStyle = this.archetype === 'vision' ? '#EAB308' : '#DC2626';
      ctx.fill();
    }

    // Legs
    ctx.fillStyle = '#0F172A';
    if (this.archetype === 'iron') {
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-7, 2, 5, 11); ctx.fillRect(2, 2, 5, 11);
      ctx.fillStyle = '#D97706'; ctx.fillRect(-7, 4, 5, 3); ctx.fillRect(2, 4, 5, 3);
    } else if (this.archetype === 'cap') {
      ctx.fillStyle = '#1E3A8A'; ctx.fillRect(-7, 2, 5, 10); ctx.fillRect(2, 2, 5, 10);
      ctx.fillStyle = '#991B1B'; ctx.fillRect(-8, 9, 6, 4); ctx.fillRect(2, 9, 6, 4);
    } else if (this.archetype === 'hulk') {
      ctx.fillStyle = '#15803D'; ctx.fillRect(-10, 2, 8, 12); ctx.fillRect(2, 2, 8, 12);
      ctx.fillStyle = '#6B21A8'; ctx.fillRect(-11, -2, 22, 6);
    } else {
      ctx.fillRect(-7, 2, 5, 11); ctx.fillRect(2, 2, 5, 11);
    }

    // Torso / Superhero Armor
    if (this.archetype === 'iron') {
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath(); ctx.roundRect(-10, -14, 20, 17, 3); ctx.fill();
      ctx.fillStyle = '#F59E0B'; ctx.fillRect(-11, -14, 4, 6); ctx.fillRect(7, -14, 4, 6);
      ctx.beginPath(); ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
    } else if (this.archetype === 'cap') {
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath(); ctx.roundRect(-9, -14, 18, 17, 3); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3, -11, 6, 4);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(-7, -2, 14, 4);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-4, -2, 2, 4); ctx.fillRect(2, -2, 2, 4);
      // Shield
      ctx.beginPath(); ctx.arc(10, -5, 8, 0, Math.PI * 2); ctx.fillStyle = '#DC2626'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 6, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 4, 0, Math.PI * 2); ctx.fillStyle = '#1D4ED8'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 1.5, 0, Math.PI * 2); ctx.fillStyle = '#FFFFFF'; ctx.fill();
    } else if (this.archetype === 'hulk') {
      ctx.fillStyle = '#15803D';
      ctx.beginPath(); ctx.roundRect(-14, -18, 28, 22, 5); ctx.fill();
    } else if (this.archetype === 'widow') {
      ctx.fillStyle = '#0F172A';
      ctx.beginPath(); ctx.roundRect(-8, -13, 16, 16, 3); ctx.fill();
      ctx.fillStyle = '#DC2626'; ctx.fillRect(-2, 0, 4, 3);
      ctx.fillStyle = '#00F0FF'; ctx.fillRect(-10, -4, 2, 4); ctx.fillRect(8, -4, 2, 4);
    } else if (this.archetype === 'thor') {
      ctx.fillStyle = '#334155';
      ctx.beginPath(); ctx.roundRect(-9, -14, 18, 17, 3); ctx.fill();
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath(); ctx.arc(-4, -8, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -8, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (this.archetype === 'spidey') {
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.roundRect(-8, -14, 16, 10, 3); ctx.fill();
      ctx.fillStyle = '#1D4ED8'; ctx.fillRect(-8, -4, 16, 7);
    } else if (this.archetype === 'strange') {
      ctx.fillStyle = '#1E3A8A';
      ctx.beginPath(); ctx.roundRect(-8, -13, 16, 16, 3); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00FF87'; ctx.fill();
    } else {
      ctx.fillStyle = this.color;
      ctx.beginPath(); ctx.roundRect(-8, -13, 16, 16, 3); ctx.fill();
    }

    // Head
    ctx.fillStyle = this.archetype === 'hulk' ? '#15803D' : (this.archetype === 'vision' ? '#991B1B' : '#FED7AA');
    ctx.beginPath(); ctx.arc(0, -20, 7, 0, Math.PI * 2); ctx.fill();

    // Eyes
    if (this.archetype === 'spidey') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(-3.5, -20, 3, 2, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3.5, -20, 3, 2, 0.2, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-3.5, -20, 2, 2); ctx.fillRect(1.5, -20, 2, 2);
    }

    ctx.restore();
  }
}

// Quantum Data Packet
class QuantumDataPacket {
  constructor(x1, y1, x2, y2, color, onArrival) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.color = color || '#00F0FF';
    this.progress = 0;
    this.speed = 1.9;
    this.onArrival = onArrival;
    this.curveHeight = -55 - Math.random() * 30;
    playSfx('packet');
  }

  update(dt) {
    this.progress += dt * this.speed * simSpeed;
    if (this.progress >= 1) {
      if (this.onArrival) this.onArrival();
      return false;
    }
    return true;
  }

  draw(ctx, scaleX, scaleY) {
    const t = this.progress;
    const cx = (this.x1 + this.x2) / 2;
    const cy = Math.min(this.y1, this.y2) + this.curveHeight;

    const nx = (1-t)*(1-t)*this.x1 + 2*(1-t)*t*cx + t*t*this.x2;
    const ny = (1-t)*(1-t)*this.y1 + 2*(1-t)*t*cy + t*t*this.y2;

    const px = nx * scaleX;
    const py = ny * scaleY;

    ctx.save();
    ctx.translate(px, py);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// Particle Beams for Spawning
function spawnParticleBeam(x, y, color) {
  for (let i = 0; i < 20; i++) {
    spawnParticles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 60,
      vy: (Math.random() - 0.5) * 60,
      color: color,
      alpha: 1,
      radius: Math.random() * 3 + 1.5
    });
  }
  playSfx('beam');
}

// Speech Bubble Management
function createSpeechBubble(character, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', character.color);
  bubble.style.setProperty('--bubble-border', character.color);

  bubble.innerHTML = `
    <span class="bubble-prefix">${character.shortName}</span>
    ${text}
  `;
  container.appendChild(bubble);

  speechBubbles.push({
    element: bubble,
    character: character,
    timer: 4.0
  });
}

function updateSpeechBubbles(dt, scaleX, scaleY) {
  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];
    b.timer -= dt * simSpeed;
    if (b.timer <= 0) {
      b.element.remove();
      speechBubbles.splice(i, 1);
    } else {
      b.element.style.left = (b.character.x * scaleX) + 'px';
      b.element.style.top = (b.character.y * scaleY) + 'px';
    }
  }
}

// Draw the High-Tech Chamber Floor Map
function drawChamberFloor(ctx, w, h) {
  const sx = w / 1000;
  const sy = h / 720;
  const now = performance.now() * 0.001;

  ctx.fillStyle = '#040711';
  ctx.fillRect(0, 0, w, h);

  // Hex Deck Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 45 * sx;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 1. DEVELOPMENT CHAMBER (Top-Left)
  const c1x = 14 * sx, c1y = 14 * sy, c1w = 236 * sx, c1h = 240 * sy;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.fillRect(c1x, c1y, c1w, c1h);
  ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 1.5; ctx.strokeRect(c1x, c1y, c1w, c1h);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.15)'; ctx.fillRect(c1x, c1y, c1w, 24*sy);
  ctx.font = `bold ${10.5*sx}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#00F0FF';
  ctx.fillText('💻 1. DEVELOPMENT CHAMBER', c1x + 10*sx, c1y + 16*sy);

  // 2. QA & TESTING CHAMBER (Bottom-Left)
  const c2x = 14 * sx, c2y = 264 * sy, c2w = 236 * sx, c2h = 240 * sy;
  ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
  ctx.fillRect(c2x, c2y, c2w, c2h);
  ctx.strokeStyle = '#38BDF8'; ctx.lineWidth = 1.5; ctx.strokeRect(c2x, c2y, c2w, c2h);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.15)'; ctx.fillRect(c2x, c2y, c2w, 24*sy);
  ctx.font = `bold ${10.5*sx}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#38BDF8';
  ctx.fillText('🛡️ 2. QA & TESTING CHAMBER', c2x + 10*sx, c2y + 16*sy);

  // 3. SECURITY & AUDIT CHAMBER (Top-Center)
  const c3x = 260 * sx, c3y = 14 * sy, c3w = 440 * sx, c3h = 160 * sy;
  ctx.fillStyle = 'rgba(168, 85, 247, 0.03)';
  ctx.fillRect(c3x, c3y, c3w, c3h);
  ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 1.5; ctx.strokeRect(c3x, c3y, c3w, c3h);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.15)'; ctx.fillRect(c3x, c3y, c3w, 24*sy);
  ctx.font = `bold ${10.5*sx}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#A855F7';
  ctx.fillText('🔒 3. SECURITY & AUDIT CHAMBER', c3x + 12*sx, c3y + 16*sy);

  // 4. DEVOPS & PR CHAMBER (Top-Right)
  const c4x = 710 * sx, c4y = 14 * sy, c4w = 276 * sx, c4h = 280 * sy;
  ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
  ctx.fillRect(c4x, c4y, c4w, c4h);
  ctx.strokeStyle = '#00E5FF'; ctx.lineWidth = 1.5; ctx.strokeRect(c4x, c4y, c4w, c4h);
  ctx.fillStyle = 'rgba(0, 229, 255, 0.15)'; ctx.fillRect(c4x, c4y, c4w, 24*sy);
  ctx.font = `bold ${10.5*sx}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#00E5FF';
  ctx.fillText('🚀 4. DEVOPS & PR CHAMBER', c4x + 12*sx, c4y + 16*sy);

  // 5. MULTIVERSE & INCURSION CHAMBER (Bottom-Right)
  const c5x = 710 * sx, c5y = 304 * sy, c5w = 276 * sx, c5h = 400 * sy;
  ctx.fillStyle = 'rgba(255, 153, 0, 0.03)';
  ctx.fillRect(c5x, c5y, c5w, c5h);
  ctx.strokeStyle = '#FF9900'; ctx.lineWidth = 1.5; ctx.strokeRect(c5x, c5y, c5w, c5h);
  ctx.fillStyle = 'rgba(255, 153, 0, 0.15)'; ctx.fillRect(c5x, c5y, c5w, 24*sy);
  ctx.font = `bold ${10.5*sx}px "Space Grotesk", sans-serif`; ctx.fillStyle = '#FF9900';
  ctx.fillText('🔮 5. MULTIVERSE & INCURSIONS', c5x + 12*sx, c5y + 16*sy);

  // Central Arc Reactor Grid
  const ax = 480 * sx;
  const ay = 360 * sy;

  ctx.beginPath(); ctx.arc(ax, ay, 90*sx, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)'; ctx.fill();
  ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 2; ctx.stroke();

  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(now * 0.5);
  ctx.beginPath(); ctx.arc(0, 0, 72*sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.stroke();
  ctx.rotate(-now * 1.1);
  ctx.beginPath(); ctx.arc(0, 0, 52*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#00F0FF'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();

  ctx.font = `bold ${44*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF'; ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 18;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', ax, ay);
  ctx.shadowBlur = 0;

  ctx.font = `700 ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('ARC REACTOR POWER GRID', ax, ay + 110*sy);

  // Conduits
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  activeHeroes.forEach(h => {
    ctx.beginPath(); ctx.moveTo(h.officeX * sx, h.officeY * sy); ctx.lineTo(ax, ay); ctx.stroke();
  });
  ctx.setLineDash([]);
}

// Append Line to Terminal Feed
function appendTerminalLine(type, text) {
  const terminal = document.getElementById('telemetryFeed');
  if (!terminal) return;
  const row = document.createElement('div');
  row.className = `term-row ${type}`;
  row.innerHTML = text;
  terminal.appendChild(row);
  terminal.scrollTop = terminal.scrollHeight;
}

// Spawn Agent into Active Floor
function spawnHeroAgent(heroKey) {
  if (activeHeroes.some(h => h.id === heroKey)) {
    selectHero(heroKey);
    return;
  }

  const tmpl = PRESET_HEROES[heroKey];
  if (!tmpl) return;

  const entity = new SuperheroEntity(tmpl);
  activeHeroes.push(entity);

  spawnParticleBeam(480, 340, tmpl.color);
  appendTerminalLine('action', `⚡ Beamed [${tmpl.name}] into ${tmpl.chamber}.`);
  entity.speak(`Reporting to ${tmpl.chamber}!`);

  updateActiveDock();
  updateArcLoadMeter();
  selectHero(entity.id);
}

// Assemble All Agents
function assembleAllStrikeTeam() {
  Object.keys(PRESET_HEROES).forEach((key, index) => {
    setTimeout(() => {
      spawnHeroAgent(key);
    }, index * 120);
  });
}

// Update Bottom Active Dock
function updateActiveDock() {
  const dock = document.getElementById('bottomDockBar');
  if (!dock) return;

  dock.innerHTML = '';
  activeHeroes.forEach(h => {
    const card = document.createElement('div');
    card.className = `hero-chip-card ${h.id === selectedHeroId ? 'active' : ''}`;
    card.dataset.heroId = h.id;
    card.style.setProperty('--card-color', h.color);

    const avatar = h.archetype === 'iron' ? '🦾' : (h.archetype === 'cap' ? '🛡️' : (h.archetype === 'hulk' ? '🟢' : (h.archetype === 'widow' ? '🕷️' : (h.archetype === 'thor' ? '⚡' : (h.archetype === 'hawkeye' ? '🏹' : (h.archetype === 'spidey' ? '🕸️' : (h.archetype === 'strange' ? '🔮' : '💎')))))));

    card.innerHTML = `
      <div class="hero-chip-avatar" style="border-color:${h.color};">
        ${avatar}
      </div>
      <div class="hero-chip-info">
        <div class="hero-chip-name">${h.shortName}</div>
        <div class="hero-chip-sub" style="color:${h.color};">${h.chamber.split(' ')[0]} &bull; ${h.tag}</div>
      </div>
    `;
    card.addEventListener('click', () => selectHero(h.id));
    dock.appendChild(card);
  });
}

// Update Arc Reactor Load Meter
function updateArcLoadMeter() {
  const count = activeHeroes.length;
  const loadPct = Math.min(count * 11 + 10, 100);
  const meter = document.getElementById('arcReactorLoadText');
  if (meter) meter.textContent = `Arc Reactor: ${loadPct}% (${count} Active)`;

  const agentCountEl = document.getElementById('activeAgentCountText');
  if (agentCountEl) agentCountEl.textContent = `${count} Hero Agents Online`;
}

// Switch Hero Focus
function selectHero(heroId) {
  selectedHeroId = heroId;
  const hero = activeHeroes.find(h => h.id === heroId);
  if (!hero) return;

  document.querySelectorAll('.hero-chip-card').forEach(c => {
    c.classList.toggle('active', c.dataset.heroId === heroId);
  });

  const nameEl = document.getElementById('activeHeroName');
  if (nameEl) nameEl.textContent = `${hero.name} [${hero.tag}]`;

  appendTerminalLine('system', `* Focus shifted to [${hero.name} // ${hero.chamber}]`);
  hero.speak();
  playSfx('packet');
}

// Dispatch Mission Prompt
function dispatchPrompt(customText = null) {
  const input = document.getElementById('promptTextarea');
  const prompt = customText || input?.value.trim() || "Build JWT auth middleware and generate unit tests";

  const tony = activeHeroes.find(h => h.id === 'tony-stark') || activeHeroes[0];
  if (!tony) return;

  appendTerminalLine('prompt', `> Directive: "${prompt}"`);
  appendTerminalLine('system', `* Tony Stark deconstructing DAG across ${activeHeroes.length} active chambers.`);
  playSfx('repulsor');

  tony.speak(`Directives dispatched to strike team!`);

  activeHeroes.forEach((hero, index) => {
    if (hero !== tony) {
      setTimeout(() => {
        quantumDataPackets.push(new QuantumDataPacket(tony.x, tony.y, hero.x, hero.y, hero.color, () => {
          hero.speak(`Executing in ${hero.chamber}`);
          appendTerminalLine('command', `  L $ ${hero.harness || 'agentRunner'} --task="${prompt}"`);
          appendTerminalLine('success', `  ✔ [${hero.shortName}] Active.`);
          playSfx('packet');
        }));
      }, index * 130);
    }
  });

  if (input) input.value = '';
}

// Forge Custom Superhero Entity
function forgeCustomHero(e) {
  e.preventDefault();
  const name = document.getElementById('customHeroName')?.value.trim() || 'Custom Hero';
  const role = document.getElementById('customHeroRole')?.value.trim() || 'Specialist';
  const chamber = document.getElementById('customHeroChamber')?.value || 'Development Chamber';
  const archetype = document.getElementById('customHeroArchetype')?.value || 'iron';
  const color = document.getElementById('customHeroColor')?.value || '#00F0FF';
  const model = document.getElementById('customHeroModel')?.value || 'Claude Code';

  let coords = { officeX: 200, officeY: 200 };
  if (chamber.includes('QA')) coords = { officeX: 175, officeY: 420 };
  else if (chamber.includes('Security')) coords = { officeX: 395, officeY: 420 };
  else if (chamber.includes('DevOps')) coords = { officeX: 520, officeY: 220 };
  else if (chamber.includes('Multiverse')) coords = { officeX: 780, officeY: 200 };

  const customId = 'custom_' + Date.now();
  const customHero = new SuperheroEntity({
    id: customId,
    name: name,
    shortName: name.toUpperCase(),
    tag: 'CUSTOM',
    role: role,
    chamber: chamber,
    harness: 'customAgentHarness',
    model: model,
    color: color,
    archetype: archetype,
    officeX: coords.officeX + (Math.random() - 0.5) * 30,
    officeY: coords.officeY + (Math.random() - 0.5) * 30,
    dialogs: [`Custom agent ${name} online in ${chamber}! Ready for directives.`]
  });

  activeHeroes.push(customHero);
  spawnParticleBeam(480, 340, color);
  appendTerminalLine('action', `🎨 Forged and deployed custom superhero [${name}] to ${chamber}!`);
  customHero.speak();

  updateActiveDock();
  updateArcLoadMeter();
  selectHero(customId);

  document.getElementById('customHeroModalBackdrop')?.classList.remove('open');
}

// 60 FPS Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 1000;
  const sy = h / 720;

  drawChamberFloor(ctx, w, h);

  for (let i = spawnParticles.length - 1; i >= 0; i--) {
    const p = spawnParticles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.alpha -= dt * 2.5;
    ctx.beginPath(); ctx.arc(p.x * sx, p.y * sy, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(p.alpha, 0); ctx.fill(); ctx.globalAlpha = 1;
    if (p.alpha <= 0) spawnParticles.splice(i, 1);
  }

  activeHeroes.forEach(h => {
    h.update(dt);
    h.draw(ctx, sx, sy);
  });

  for (let i = quantumDataPackets.length - 1; i >= 0; i--) {
    const packet = quantumDataPackets[i];
    if (!packet.update(dt)) {
      quantumDataPackets.splice(i, 1);
    } else {
      packet.draw(ctx, sx, sy);
    }
  }

  updateSpeechBubbles(dt, sx, sy);
  requestAnimationFrame(loop);
}

// Initialize Onboarding & War Room
function init() {
  const savedProvider = localStorage.getItem('stark_provider');
  const onboardingScreen = document.getElementById('onboardingScreen');

  if (savedProvider && onboardingScreen) {
    onboardingScreen.classList.add('hidden');
  }

  canvas = document.getElementById('pixelOfficeCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Spawn Tony Stark by default
  const tony = new SuperheroEntity(PRESET_HEROES['tony-stark']);
  activeHeroes = [tony];
  updateActiveDock();
  updateArcLoadMeter();

  // Provider Selection Logic
  let selectedProvider = 'antigravity';

  function updateProviderView(providerKey) {
    selectedProvider = providerKey;
    const meta = PROVIDER_METADATA[providerKey] || PROVIDER_METADATA['antigravity'];

    // Update OAuth Panel
    const disp = document.getElementById('oauthProviderDisplay');
    if (disp) disp.innerHTML = `<span>${meta.icon}</span><span>${meta.name} Integration</span>`;

    const desc = document.getElementById('oauthDesc');
    if (desc) desc.textContent = meta.desc;

    const btnLabel = document.getElementById('oauthBtnLabel');
    if (btnLabel) btnLabel.textContent = meta.btnLabel;

    // Update Manual Form
    const keyLabel = document.getElementById('apiKeyLabel');
    if (keyLabel) keyLabel.textContent = `${meta.name} API Key / Session:`;

    const keyInput = document.getElementById('manualApiKeyInput');
    if (keyInput) keyInput.placeholder = meta.keyPlaceholder;
  }

  document.querySelectorAll('.provider-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.provider-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateProviderView(card.dataset.provider);
    });
  });

  // Auth Mode Tabs (OAuth vs Manual)
  const tabOAuth = document.getElementById('tabOAuthMode');
  const tabManual = document.getElementById('tabManualMode');
  const oauthPanel = document.getElementById('oauthPanel');
  const manualForm = document.getElementById('manualKeyForm');

  if (tabOAuth && tabManual && oauthPanel && manualForm) {
    tabOAuth.addEventListener('click', () => {
      tabOAuth.classList.add('active');
      tabManual.classList.remove('active');
      oauthPanel.style.display = 'flex';
      manualForm.style.display = 'none';
    });

    tabManual.addEventListener('click', () => {
      tabManual.classList.add('active');
      tabOAuth.classList.remove('active');
      oauthPanel.style.display = 'none';
      manualForm.style.display = 'flex';
    });
  }

  // 1-Click Connect (OAuth / IDE Login)
  const oauthBtn = document.getElementById('oauthConnectBtn');
  if (oauthBtn) {
    oauthBtn.addEventListener('click', () => {
      localStorage.setItem('stark_provider', selectedProvider);
      onboardingScreen?.classList.add('hidden');
      playSfx('beam');
      const meta = PROVIDER_METADATA[selectedProvider] || PROVIDER_METADATA['antigravity'];
      appendTerminalLine('system', `* Connected via 1-Click ID Login: [${meta.name.toUpperCase()}]`);
      tony.speak(`Connected to ${meta.name}! Ready for directives.`);
    });
  }

  // Manual Connect
  const manualBtn = document.getElementById('manualConnectBtn');
  if (manualBtn) {
    manualBtn.addEventListener('click', () => {
      const customModel = document.getElementById('manualCustomModelInput')?.value.trim();
      localStorage.setItem('stark_provider', selectedProvider);
      if (customModel) localStorage.setItem('stark_model', customModel);

      onboardingScreen?.classList.add('hidden');
      playSfx('beam');
      const meta = PROVIDER_METADATA[selectedProvider] || PROVIDER_METADATA['antigravity'];
      appendTerminalLine('system', `* Initialized credentials for [${meta.name.toUpperCase()}]`);
      tony.speak(`Arc Reactor initialized with ${meta.name}!`);
    });
  }

  // Quick Preset Spawner Chips
  document.querySelectorAll('.spawn-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const heroKey = chip.dataset.hero;
      if (heroKey === 'all') {
        assembleAllStrikeTeam();
      } else {
        spawnHeroAgent(heroKey);
      }
    });
  });

  // Custom Hero Modal
  const openCustomBtn = document.getElementById('openCustomHeroModalBtn');
  const customModal = document.getElementById('customHeroModalBackdrop');
  const closeCustomBtn = document.getElementById('closeCustomHeroModalBtn');
  const customForm = document.getElementById('customHeroForm');

  if (openCustomBtn && customModal) {
    openCustomBtn.addEventListener('click', () => customModal.classList.add('open'));
  }
  if (closeCustomBtn && customModal) {
    closeCustomBtn.addEventListener('click', () => customModal.classList.remove('open'));
  }
  if (customForm) {
    customForm.addEventListener('submit', forgeCustomHero);
  }

  // Prompt Dispatcher
  const dispatchBtn = document.getElementById('dispatchPromptBtn');
  if (dispatchBtn) dispatchBtn.addEventListener('click', () => dispatchPrompt());

  document.querySelectorAll('.template-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      dispatchPrompt(pill.dataset.prompt);
    });
  });

  // Settings re-open onboarding
  const settingsBtn = document.getElementById('reopenSettingsBtn');
  if (settingsBtn && onboardingScreen) {
    settingsBtn.addEventListener('click', () => {
      onboardingScreen.classList.remove('hidden');
    });
  }

  requestAnimationFrame(loop);

  setTimeout(() => {
    appendTerminalLine('system', `* STARK TOWER // AGENTIC AI WAR ROOM ONLINE.`);
    appendTerminalLine('system', `* Tony Stark active in Development Chamber. Click "+ Spawn Heroes" to expand.`);
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
