/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — MARVEL MULTIVERSE BATTLEGROUND ENGINE
   Chambers:
     1. 💎 Infinity Gauntlet Vault (6 Glowing Infinity Stones)
     2. 👑 Dr Doom's Latverian Throne (Doom crushing everything with green flame)
     3. ⏳ Kang's Quantum Citadel (Kang with rotating timeline rings)
     4. 🦾 Stark Tower Helicarrier Bridge (Tony's Command Pod)
     5. 🔴 Chaos Magic Incursion (Scarlet Witch reality tear)
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let lastTime = performance.now();
let soundEnabled = true;
let simSpeed = 1;
let selectedHeroId = 'tony-stark';
let audioCtx = null;

// Available Pre-Configured Avengers
const PRESET_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    shortName: 'TONY STARK',
    tag: 'GOD',
    role: 'Lead GOD Orchestrator',
    chamber: 'Stark Helicarrier Bridge',
    harness: 'claudeTerminalHarness',
    model: 'Claude Code',
    color: '#00F0FF',
    archetype: 'iron',
    officeX: 130, officeY: 480,
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
    chamber: 'Stark Helicarrier Bridge',
    harness: 'geminiProHarness',
    model: 'Gemini',
    color: '#38BDF8',
    archetype: 'cap',
    officeX: 130, officeY: 340,
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
    chamber: 'Stark Helicarrier Bridge',
    harness: 'ollamaDeepSeekHarness',
    model: 'Ollama (Local)',
    color: '#00FF87',
    archetype: 'hulk',
    officeX: 130, officeY: 600,
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
    chamber: 'Doom Counter-Recon Vault',
    harness: 'openaiGpt4oHarness',
    model: 'OpenAI Codex',
    color: '#A855F7',
    archetype: 'widow',
    officeX: 360, officeY: 110,
    dialogs: [
      "Infiltrating Doom's Latverian network. Isolating zero-days.",
      "Sanitized API bearer keys in .env. Ledger clean.",
      "Auth perimeter fortified against Doom-bots."
    ]
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    shortName: 'THOR',
    tag: 'OPS',
    role: 'DevOps & Lightning Builds',
    chamber: 'Infinity Gauntlet Vault',
    harness: 'xaiGrokHarness',
    model: 'xAI Grok',
    color: '#00E5FF',
    archetype: 'thor',
    officeX: 180, officeY: 160,
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
    chamber: 'Infinity Gauntlet Vault',
    harness: 'geminiFlashHarness',
    model: 'Gemini',
    color: '#FFD700',
    archetype: 'hawkeye',
    officeX: 80, officeY: 160,
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
    chamber: 'Stark Helicarrier Bridge',
    harness: 'claudeFrontendHarness',
    model: 'Claude Code',
    color: '#38BDF8',
    archetype: 'spidey',
    officeX: 80, officeY: 480,
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
    chamber: 'Chaos Magic Incursion',
    harness: 'timeStoneEngine',
    model: 'Antigravity / Reasoning',
    color: '#FF9900',
    archetype: 'strange',
    officeX: 840, officeY: 480,
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
    chamber: 'Kang Quantum Citadel',
    harness: 'mindStoneMemory',
    model: 'Gemini',
    color: '#FFD700',
    archetype: 'vision',
    officeX: 840, officeY: 150,
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
    } else if (type === 'doom') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(350, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'wanda') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.41);
    } else if (type === 'snap') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.51);
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
    this.homeY = config.officeY || 390;
    this.x = 480;
    this.y = 390;
    this.targetX = this.homeX;
    this.targetY = this.homeY;
    this.state = 'SPAWNING';
    this.animTimer = 0;
    this.actionTimer = 2000 + Math.random() * 3000;
  }

  speak(text = null) {
    const dialog = text || this.dialogs[Math.floor(Math.random() * this.dialogs.length)];
    createSpeechBubble(this, dialog);
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
          this.targetY = 390 + (Math.random() - 0.5) * 60;
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

    // Shadow
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

    // Cape
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

    // Torso / Armor
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
  playSfx('repulsor');
}

function createSpeechBubble(character, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', character.color || '#00F0FF');
  bubble.style.setProperty('--bubble-border', character.color || '#00F0FF');

  bubble.innerHTML = `
    <span class="bubble-prefix">${character.shortName || character.name}</span>
    ${text}
  `;
  container.appendChild(bubble);

  speechBubbles.push({
    element: bubble,
    character: character,
    timer: 3.5
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

// ══════════════════════════════════════════════════════════════════════
// DRAW THE EPIC MARVEL MULTIVERSE BATTLEGROUND FLOOR
// ══════════════════════════════════════════════════════════════════════
function drawMultiverseBattleground(ctx, w, h) {
  const sx = w / 1000;
  const sy = h / 720;
  const now = performance.now() * 0.001;

  // 1. Deep Space Cosmic Background
  ctx.fillStyle = '#02040A';
  ctx.fillRect(0, 0, w, h);

  // Background Hex Grid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 45 * sx;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // ── CHAMBER 1: 💎 INFINITY GAUNTLET VAULT (Top-Left) ──
  const c1x = 24 * sx, c1y = 20 * sy, c1w = 230 * sx, c1h = 220 * sy;
  ctx.fillStyle = 'rgba(255, 215, 0, 0.04)';
  ctx.fillRect(c1x, c1y, c1w, c1h);
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5; ctx.strokeRect(c1x, c1y, c1w, c1h);

  // Room Header Badge
  ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
  ctx.fillRect(c1x, c1y, c1w, 24*sy);
  ctx.font = `bold ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#FFD700';
  ctx.fillText('💎 1. INFINITY GAUNTLET VAULT', c1x + 10*sx, c1y + 16*sy);

  // Pedestal & Glowing Infinity Gauntlet in Center of Room 1
  const gx = c1x + 115 * sx;
  const gy = c1y + 110 * sy;

  // Cosmic shockwave rings
  ctx.beginPath();
  ctx.arc(gx, gy, (28 + Math.sin(now * 3) * 4) * sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pedestal
  ctx.fillStyle = '#0F172A';
  ctx.beginPath(); ctx.roundRect(gx - 20*sx, gy + 10*sy, 40*sx, 16*sy, 3); ctx.fill();
  ctx.strokeStyle = '#FFD700'; ctx.stroke();

  // Golden Gauntlet Body
  ctx.fillStyle = '#F59E0B';
  ctx.beginPath(); ctx.roundRect(gx - 12*sx, gy - 16*sy, 24*sx, 28*sy, 4); ctx.fill();
  ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 1.5; ctx.stroke();

  // 6 Infinity Stones glowing with real MCU colors
  const stones = [
    { x: -7, y: -10, color: '#A855F7', name: 'Power' },   // Purple
    { x: -2, y: -12, color: '#38BDF8', name: 'Space' },   // Blue
    { x: 3,  y: -10, color: '#EF4444', name: 'Reality' }, // Red
    { x: 8,  y: -6,  color: '#F97316', name: 'Soul' },    // Orange
    { x: -8, y: -4,  color: '#00FF87', name: 'Time' },    // Green
    { x: 0,  y: -2,  color: '#FFD700', name: 'Mind' }     // Yellow Center
  ];

  stones.forEach(s => {
    ctx.beginPath();
    ctx.arc(gx + s.x*sx, gy + s.y*sy, 2.5*sx, 0, Math.PI * 2);
    ctx.fillStyle = s.color;
    ctx.shadowColor = s.color;
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  });

  // ── CHAMBER 2: 👑 DR DOOM'S LATVERIAN THRONE & ARENA (Top-Center) ──
  const c2x = 270 * sx, c2y = 20 * sy, c2w = 420 * sx, c2h = 160 * sy;
  ctx.fillStyle = 'rgba(0, 255, 135, 0.04)';
  ctx.fillRect(c2x, c2y, c2w, c2h);
  ctx.strokeStyle = '#00FF87'; ctx.lineWidth = 1.5; ctx.strokeRect(c2x, c2y, c2w, c2h);

  // Header Badge
  ctx.fillStyle = 'rgba(0, 255, 135, 0.2)';
  ctx.fillRect(c2x, c2y, c2w, 24*sy);
  ctx.font = `bold ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00FF87';
  ctx.fillText('👑 2. DR DOOM // LATVERIAN CRUSHING ARENA', c2x + 12*sx, c2y + 16*sy);

  // Dr Doom Character Sprite & Green Sorcery Fire
  const dx = c2x + 210 * sx;
  const dy = c2y + 90 * sy;

  // Fortress Stone Platform
  ctx.fillStyle = '#0B1528';
  ctx.beginPath(); ctx.roundRect(dx - 50*sx, dy + 12*sy, 100*sx, 16*sy, 3); ctx.fill();
  ctx.strokeStyle = '#00FF87'; ctx.stroke();

  // Crushed Robot parts
  ctx.fillStyle = '#475569';
  ctx.fillRect(dx - 35*sx, dy + 8*sy, 12*sx, 6*sy);
  ctx.fillRect(dx + 22*sx, dy + 9*sy, 14*sx, 5*sy);

  // Doom Cloak (Emerald Green)
  ctx.fillStyle = '#15803D';
  ctx.beginPath();
  ctx.moveTo(dx - 12*sx, dy - 16*sy);
  ctx.lineTo(dx + 12*sx, dy - 16*sy);
  ctx.lineTo(dx + 16*sx, dy + 14*sy);
  ctx.lineTo(dx - 16*sx, dy + 14*sy);
  ctx.closePath();
  ctx.fill();

  // Titanium Armor Torso
  ctx.fillStyle = '#64748B';
  ctx.fillRect(dx - 8*sx, dy - 12*sy, 16*sx, 16*sy);
  ctx.fillStyle = '#FFD700'; // Gold chain clasp
  ctx.fillRect(-4*sx + dx, dy - 10*sy, 8*sx, 2*sy);

  // Doom Titanium Mask & Hood
  ctx.fillStyle = '#15803D'; // Green Hood
  ctx.beginPath(); ctx.arc(dx, dy - 20*sy, 8*sx, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#94A3B8'; // Iron Face Mask
  ctx.beginPath(); ctx.arc(dx, dy - 19*sy, 6*sx, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0F172A'; // Eye slits
  ctx.fillRect(dx - 4*sx, dy - 20*sy, 2*sx, 2*sy);
  ctx.fillRect(dx + 2*sx, dy - 20*sy, 2*sx, 2*sy);

  // Green Latverian Sorcery Flames in Doom's Hands
  const flamePulse = (Math.sin(now * 6) + 1) * 3;
  ctx.fillStyle = '#00FF87';
  ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 12;
  ctx.beginPath(); ctx.arc(dx - 14*sx, dy - 4*sy, (4 + flamePulse)*sx, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(dx + 14*sx, dy - 4*sy, (4 + flamePulse)*sx, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── CHAMBER 3: ⏳ KANG THE CONQUEROR'S QUANTUM CITADEL (Top-Right) ──
  const c3x = 710 * sx, c3y = 20 * sy, c3w = 270 * sx, c3h = 220 * sy;
  ctx.fillStyle = 'rgba(168, 85, 247, 0.04)';
  ctx.fillRect(c3x, c3y, c3w, c3h);
  ctx.strokeStyle = '#A855F7'; ctx.lineWidth = 1.5; ctx.strokeRect(c3x, c3y, c3w, c3h);

  // Header Badge
  ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
  ctx.fillRect(c3x, c3y, c3w, 24*sy);
  ctx.font = `bold ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#A855F7';
  ctx.fillText('⏳ 3. KANG // QUANTUM CITADEL', c3x + 10*sx, c3y + 16*sy);

  // Kang on Floating Time Throne & Rotating Time Rings
  const kx = c3x + 135 * sx;
  const ky = c3y + 115 * sy;

  // Rotating Timeline Rings
  ctx.save();
  ctx.translate(kx, ky);
  ctx.rotate(now * 0.7);
  ctx.beginPath();
  ctx.ellipse(0, 0, 42*sx, 20*sy, 0, 0, Math.PI * 2);
  ctx.strokeStyle = '#38BDF8';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.rotate(-now * 1.4);
  ctx.beginPath();
  ctx.ellipse(0, 0, 30*sx, 14*sy, 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = '#A855F7';
  ctx.stroke();
  ctx.restore();

  // Kang Body (Purple suit & Green conqueror cape)
  ctx.fillStyle = '#15803D'; // Green cape
  ctx.fillRect(kx - 12*sx, ky - 14*sy, 24*sx, 24*sy);
  ctx.fillStyle = '#6B21A8'; // Purple body
  ctx.fillRect(kx - 8*sx, ky - 10*sy, 16*sx, 18*sy);

  // Blue Glowing Neuro-Kinetic Mask
  ctx.fillStyle = '#0284C7';
  ctx.beginPath(); ctx.arc(kx, ky - 18*sy, 7*sx, 0, Math.PI * 2);
  ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;

  // ── CHAMBER 4: 🦾 STARK TOWER HELICARRIER BRIDGE (Bottom-Left) ──
  const c4x = 24 * sx, c4y = 260 * sy, c4w = 230 * sx, c4h = 430 * sy;
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.fillRect(c4x, c4y, c4w, c4h);
  ctx.strokeStyle = '#00F0FF'; ctx.lineWidth = 1.5; ctx.strokeRect(c4x, c4y, c4w, c4h);

  // Header Badge
  ctx.fillStyle = 'rgba(0, 240, 255, 0.18)';
  ctx.fillRect(c4x, c4y, c4w, 24*sy);
  ctx.font = `bold ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('🦾 4. STARK HELICARRIER BRIDGE', c4x + 10*sx, c4y + 16*sy);

  // Hologram CAD Screen in Bridge
  ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.fillRect(c4x + 20*sx, c4y + 40*sy, 70*sx, 35*sy);
  ctx.strokeStyle = '#00F0FF'; ctx.strokeRect(c4x + 20*sx, c4y + 40*sy, 70*sx, 35*sy);

  // ── CHAMBER 5: 🔴 CHAOS MAGIC INCURSION & SCARLET WITCH (Bottom-Right) ──
  const c5x = 710 * sx, c5y = 260 * sy, c5w = 270 * sx, c5h = 430 * sy;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.04)';
  ctx.fillRect(c5x, c5y, c5w, c5h);
  ctx.strokeStyle = '#EF4444'; ctx.lineWidth = 1.5; ctx.strokeRect(c5x, c5y, c5w, c5h);

  // Header Badge
  ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.fillRect(c5x, c5y, c5w, 24*sy);
  ctx.font = `bold ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#EF4444';
  ctx.fillText('🔴 5. CHAOS MAGIC // INCURSIONS', c5x + 10*sx, c5y + 16*sy);

  // Floating Scarlet Witch & Chaos Magic Vortex
  const wx = c5x + 135 * sx;
  const wy = c5y + 130 * sy;

  // Swirling Red Chaos Magic Hex Mandalas
  ctx.save();
  ctx.translate(wx, wy);
  ctx.rotate(now * 1.2);
  ctx.beginPath();
  ctx.arc(0, 0, 36*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();

  ctx.rotate(-now * 2.4);
  ctx.beginPath();
  ctx.arc(0, 0, 22*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#DC2626';
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Scarlet Witch Body (Floating bob)
  const wBob = Math.sin(now * 3) * 4;
  ctx.fillStyle = '#7F1D1D'; // Dark red robe
  ctx.fillRect(wx - 9*sx, wy - 12*sy + wBob, 18*sx, 22*sy);
  ctx.fillStyle = '#DC2626'; // Red corset
  ctx.fillRect(wx - 7*sx, wy - 8*sy + wBob, 14*sx, 10*sy);

  // Head & Scarlet Tiara
  ctx.fillStyle = '#FED7AA';
  ctx.beginPath(); ctx.arc(wx, wy - 18*sy + wBob, 7*sx, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#78350F'; // Auburn hair
  ctx.fillRect(wx - 9*sx, wy - 22*sy + wBob, 18*sx, 6*sy);
  ctx.fillStyle = '#DC2626'; // Scarlet Crown / Tiara
  ctx.beginPath();
  ctx.moveTo(wx - 8*sx, wy - 24*sy + wBob);
  ctx.lineTo(wx, wy - 19*sy + wBob);
  ctx.lineTo(wx + 8*sx, wy - 24*sy + wBob);
  ctx.lineWidth = 2; ctx.strokeStyle = '#EF4444'; ctx.stroke();

  // Floating Chaos Magic in Wanda's Hands
  ctx.fillStyle = '#EF4444';
  ctx.shadowColor = '#EF4444'; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(wx - 14*sx, wy + wBob, 4*sx, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(wx + 14*sx, wy + wBob, 4*sx, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;

  // ── 6. CENTER: MASSIVE PULSING ARC REACTOR CORE ──
  const ax = 480 * sx;
  const ay = 390 * sy;

  // Outer Power Ring
  ctx.beginPath();
  ctx.arc(ax, ay, 88*sx, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.fill();
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating Magnetic Confinement Rings
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(now * 0.5);
  ctx.beginPath(); ctx.arc(0, 0, 70*sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]); ctx.stroke();
  ctx.rotate(-now * 1.1);
  ctx.beginPath(); ctx.arc(0, 0, 50*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#00F0FF'; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();

  // Giant Glowing Avengers "A"
  ctx.font = `bold ${44*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF'; ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 20;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('A', ax, ay);
  ctx.shadowBlur = 0;

  ctx.font = `700 ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('ARC REACTOR POWER GRID', ax, ay + 105*sy);

  // Conduits Radiating from Core to All 5 Chambers
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  const hubs = [
    { x: gx, y: gy }, { x: dx, y: dy }, { x: kx, y: ky },
    { x: c4x + 115*sx, y: c4y + 200*sy }, { x: wx, y: wy }
  ];
  hubs.forEach(h => {
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(h.x, h.y); ctx.stroke();
  });
  ctx.setLineDash([]);
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

  spawnParticleBeam(480, 390, tmpl.color);
  entity.speak(`Reporting to ${tmpl.chamber.split(' ')[0]}!`);

  updateActiveDock();
  updateTopAvatarStack();
  updateArcLoadMeter();
  selectHero(entity.id);
  updateDagPipeline();
}

// Assemble All Agents
function assembleAllStrikeTeam() {
  Object.keys(PRESET_HEROES).forEach((key, index) => {
    setTimeout(() => {
      spawnHeroAgent(key);
    }, index * 120);
  });
}

// Update Top Avatar Stack
function updateTopAvatarStack() {
  const stack = document.getElementById('topAvatarStack');
  if (!stack) return;

  stack.innerHTML = '';
  activeHeroes.forEach(h => {
    const av = document.createElement('div');
    av.className = 'stack-avatar';
    av.style.borderColor = h.color;
    av.title = h.name;
    const emoji = h.archetype === 'iron' ? '🦾' : (h.archetype === 'cap' ? '🛡️' : (h.archetype === 'hulk' ? '🟢' : (h.archetype === 'widow' ? '🕷️' : (h.archetype === 'thor' ? '⚡' : (h.archetype === 'hawkeye' ? '🏹' : (h.archetype === 'spidey' ? '🕸️' : (h.archetype === 'strange' ? '🔮' : '💎')))))));
    av.textContent = emoji;
    av.addEventListener('click', () => selectHero(h.id));
    stack.appendChild(av);
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
  const loadPct = Math.min(count * 11 + 14, 100);

  const pctLabel = document.getElementById('arcReactorPctLabel');
  if (pctLabel) pctLabel.textContent = `${loadPct}%`;

  const barFill = document.getElementById('arcReactorBarFill');
  if (barFill) barFill.style.width = `${loadPct}%`;
}

// Switch Hero Focus
function selectHero(heroId) {
  selectedHeroId = heroId;
  const hero = activeHeroes.find(h => h.id === heroId);
  if (!hero) return;

  document.querySelectorAll('.hero-chip-card').forEach(c => {
    c.classList.toggle('active', c.dataset.heroId === heroId);
  });

  const labelEl = document.getElementById('activeHeroHudLabel');
  if (labelEl) labelEl.textContent = `${hero.name.toUpperCase()} // ${hero.role.toUpperCase()}`;

  hero.speak();
  playSfx('packet');
}

// Visual DAG Pipeline Dynamic Rendering
function updateDagPipeline() {
  const pipeline = document.getElementById('hudDagPipeline');
  if (!pipeline) return;

  pipeline.innerHTML = `
    <div class="dag-pipeline-title">
      <span>🕸️</span>
      <span>ACTIVE TASK DAG PIPELINE</span>
    </div>
  `;

  activeHeroes.forEach((h, index) => {
    const card = document.createElement('div');
    card.className = 'dag-node-card';
    card.style.setProperty('--node-color', h.color);

    const emoji = h.archetype === 'iron' ? '🦾' : (h.archetype === 'cap' ? '🛡️' : (h.archetype === 'hulk' ? '🟢' : (h.archetype === 'widow' ? '🕷️' : (h.archetype === 'thor' ? '⚡' : (h.archetype === 'hawkeye' ? '🏹' : (h.archetype === 'spidey' ? '🕸️' : (h.archetype === 'strange' ? '🔮' : '💎')))))));

    const statusText = index === 0 ? '● MASTER DAG' : (index === 1 ? '✔ VERIFIED' : '⚡ EXECUTING');
    const statusColor = index === 1 ? 'var(--gamma-green)' : h.color;

    card.innerHTML = `
      <div class="dag-node-left">
        <div class="dag-node-avatar" style="border-color:${h.color};">${emoji}</div>
        <div>
          <div class="dag-node-title">${h.name}</div>
          <div class="dag-node-task">${h.role} &bull; ${h.chamber.split(' ')[0]}</div>
        </div>
      </div>
      <div class="dag-progress-ring" style="color:${statusColor};">${statusText}</div>
    `;
    pipeline.appendChild(card);
  });
}

// Dispatch Mission Prompt
function dispatchPrompt(customText = null) {
  const input = document.getElementById('hudPromptInput');
  const prompt = customText || input?.value.trim() || "Build JWT auth middleware with unit tests";

  const tony = activeHeroes.find(h => h.id === 'tony-stark') || activeHeroes[0];
  if (!tony) return;

  playSfx('repulsor');
  tony.speak(`Directives dispatched! Neutralizing multiverse threats.`);
  updateDagPipeline();

  activeHeroes.forEach((hero, index) => {
    if (hero !== tony) {
      setTimeout(() => {
        quantumDataPackets.push(new QuantumDataPacket(tony.x, tony.y, hero.x, hero.y, hero.color, () => {
          hero.speak(`Engaging threat in ${hero.chamber.split(' ')[0]}`);
          playSfx('packet');
        }));
      }, index * 130);
    }
  });
}

// Forge Custom Superhero
function forgeCustomHero(e) {
  e.preventDefault();
  const name = document.getElementById('customHeroName')?.value.trim() || 'Custom Hero';
  const role = document.getElementById('customHeroRole')?.value.trim() || 'Specialist';
  const archetype = document.querySelector('.arch-tile.selected')?.dataset.archetype || 'iron';
  const color = document.querySelector('.color-circle.selected')?.dataset.color || '#00F0FF';

  let chamber = 'Stark Helicarrier Bridge';
  let coords = { officeX: 130, officeY: 480 };
  if (archetype === 'widow') {
    chamber = 'Doom Counter-Recon Vault'; coords = { officeX: 360, officeY: 110 };
  } else if (archetype === 'thor' || archetype === 'hawkeye') {
    chamber = 'Infinity Gauntlet Vault'; coords = { officeX: 130, officeY: 160 };
  } else if (archetype === 'strange') {
    chamber = 'Chaos Magic Incursion'; coords = { officeX: 840, officeY: 480 };
  } else if (archetype === 'vision') {
    chamber = 'Kang Quantum Citadel'; coords = { officeX: 840, officeY: 150 };
  }

  const customId = 'custom_' + Date.now();
  const customHero = new SuperheroEntity({
    id: customId,
    name: name,
    shortName: name.toUpperCase(),
    tag: 'CUSTOM',
    role: role,
    chamber: chamber,
    harness: 'customAgentHarness',
    model: 'Antigravity / Custom',
    color: color,
    archetype: archetype,
    officeX: coords.officeX + (Math.random() - 0.5) * 30,
    officeY: coords.officeY + (Math.random() - 0.5) * 30,
    dialogs: [`Custom hero ${name} online in ${chamber}! Ready for directives.`]
  });

  activeHeroes.push(customHero);
  spawnParticleBeam(480, 390, color);
  customHero.speak();

  updateActiveDock();
  updateTopAvatarStack();
  updateArcLoadMeter();
  selectHero(customId);
  updateDagPipeline();

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

  drawMultiverseBattleground(ctx, w, h);

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

// Interactive Clicks on Villains & Artifacts
function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (1000 / canvas.width);
  const clickY = (e.clientY - rect.top) * (720 / canvas.height);

  // Click Dr Doom (Top-Center)
  if (clickX > 400 && clickX < 560 && clickY > 50 && clickY < 150) {
    createSpeechBubble({ x: 480, y: 110, color: '#00FF87', shortName: 'DR DOOM' }, "Kneel before DOOM! Latverian supremacy is absolute!");
    playSfx('doom');
  }
  // Click Scarlet Witch (Bottom-Right)
  else if (clickX > 770 && clickX < 920 && clickY > 320 && clickY < 460) {
    createSpeechBubble({ x: 845, y: 390, color: '#EF4444', shortName: 'SCARLET WITCH' }, "You don't understand the power of Chaos Magic... Incursion is here!");
    playSfx('wanda');
  }
  // Click Kang (Top-Right)
  else if (clickX > 770 && clickX < 920 && clickY > 50 && clickY < 180) {
    createSpeechBubble({ x: 845, y: 135, color: '#A855F7', shortName: 'KANG THE CONQUEROR' }, "I will burn 14 million timelines to erase your build!");
    playSfx('repulsor');
  }
  // Click Infinity Gauntlet (Top-Left)
  else if (clickX > 50 && clickX < 220 && clickY > 50 && clickY < 180) {
    createSpeechBubble({ x: 139, y: 130, color: '#FFD700', shortName: 'INFINITY GAUNTLET' }, "*SNAP* Cosmic power radiating across the multiverse!");
    playSfx('snap');
  }
}

// Initialize
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
  canvas.addEventListener('click', handleCanvasClick);

  // Spawn Tony Stark by default
  const tony = new SuperheroEntity(PRESET_HEROES['tony-stark']);
  activeHeroes = [tony];
  updateActiveDock();
  updateTopAvatarStack();
  updateArcLoadMeter();
  updateDagPipeline();

  // Provider Selection Logic
  let selectedProvider = 'antigravity';
  document.querySelectorAll('.prov-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      document.querySelectorAll('.prov-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      selectedProvider = tile.dataset.provider;

      const nameEl = document.getElementById('obSelectedName');
      const iconEl = document.getElementById('obSelectedIcon');
      if (nameEl) nameEl.textContent = tile.dataset.name;
      if (iconEl) iconEl.textContent = tile.dataset.icon;
    });
  });

  const obConnectBtn = document.getElementById('obConnectBtn');
  if (obConnectBtn) {
    obConnectBtn.addEventListener('click', () => {
      localStorage.setItem('stark_provider', selectedProvider);
      onboardingScreen?.classList.add('hidden');
      playSfx('repulsor');
      tony.speak("Arc Reactor online. Multiverse defenses active!");
    });
  }

  // Visual Spawner Strip Pills
  document.querySelectorAll('.v-spawn-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const heroKey = pill.dataset.hero;
      if (heroKey === 'all') {
        assembleAllStrikeTeam();
      } else {
        spawnHeroAgent(heroKey);
      }
    });
  });

  // Action Tiles
  document.querySelectorAll('.action-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      const task = tile.dataset.task;
      let prompt = "Build secure JWT authentication microservice";
      if (task === 'QA_TESTS') prompt = "Run strict TypeScript linting and generate 100% boundary unit tests";
      else if (task === 'SEC_AUDIT') prompt = "Scan dependencies for CVE zero-days and sanitize credentials";
      else if (task === 'DOCKER_CI') prompt = "Generate multi-stage Dockerfile and GitHub Actions CI/CD workflow";
      dispatchPrompt(prompt);
    });
  });

  // Dispatch Button
  const dispatchBtn = document.getElementById('hudDispatchBtn');
  if (dispatchBtn) dispatchBtn.addEventListener('click', () => dispatchPrompt());

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

  document.querySelectorAll('.arch-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      document.querySelectorAll('.arch-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
    });
  });

  document.querySelectorAll('.color-circle').forEach(circle => {
    circle.addEventListener('click', () => {
      document.querySelectorAll('.color-circle').forEach(c => c.classList.remove('selected'));
      circle.classList.add('selected');
    });
  });

  const settingsBtn = document.getElementById('reopenSettingsBtn');
  if (settingsBtn && onboardingScreen) {
    settingsBtn.addEventListener('click', () => {
      onboardingScreen.classList.remove('hidden');
    });
  }

  requestAnimationFrame(loop);
}

document.addEventListener('DOMContentLoaded', init);
