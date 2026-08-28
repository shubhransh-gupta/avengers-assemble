/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — AVENGERS ASSEMBLE PIXEL ENGINE & COMMAND CENTER
   Theme: Stark Tech · Arc Reactor Core · Avengers 'A' Emblem · Quantum Mesh
   Features: 16-Bit Avengers Pixel Sprites, Quantum Data Nodes, JARVIS Audio
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let lastTime = performance.now();
let soundEnabled = true;
let simSpeed = 1;
let selectedHeroId = 'tony-stark';
let activeTab = 'terminal';
let audioCtx = null;

// Web Audio API Synthesizer (Stark Tech SFX)
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
    if (type === 'packet') {
      // Quantum data packet flying
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.17);
    } else if (type === 'repulsor') {
      // Repulsor blast
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.25);
    } else if (type === 'shield') {
      // Vibranium shield clang
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'smash') {
      // Gamma smash
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(95, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.38);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.38);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.39);
    } else if (type === 'thunder') {
      // Bifrost thunder
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(820, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.41);
    } else if (type === 'pop') {
      // Pop chime
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    }
  } catch {}
}

// 9 Avengers Roster Definitions & Station Coordinates
const HEROES = [
  {
    id: 'tony-stark',
    name: 'Tony Stark',
    shortName: 'TONY STARK',
    tag: 'GOD',
    role: 'Lead GOD Orchestrator',
    harness: 'claudeTerminalHarness',
    model: 'Claude 3.7 Sonnet / Claude Code',
    tokenCap: '80,000 / hr',
    color: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    officeX: 130, officeY: 180, // Nanotech Lab top-left
    isBoss: true,
    dialogs: [
      "JARVIS, deconstruct the master prompt into DAG directives.",
      "Arc Reactor load balancing: 99.8% optimal across all providers.",
      "Cap, your strict types look solid. Approved for production.",
      "Hulk, smash that memory leak now. Hawkeye, lock on unit tests."
    ]
  },
  {
    id: 'captain-america',
    name: 'Steve Rogers',
    shortName: 'CAPTAIN AMERICA',
    tag: 'QA',
    role: 'QA Commander & Standards',
    harness: 'geminiProHarness',
    model: 'Gemini 2.5 Pro',
    tokenCap: '120,000 / hr',
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    officeX: 175, officeY: 420, // Tactical war table
    dialogs: [
      "I can do this all day. No unhandled promise rejections on my watch.",
      "Vibranium Shield QA stamp applied: 100% strict TypeScript types verified.",
      "Language, team! Clean commits only on main branch.",
      "All assertions green across 16 test suites."
    ]
  },
  {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    shortName: 'THE HULK',
    tag: 'AST',
    role: 'Deep AST Refactorer',
    harness: 'ollamaDeepSeekHarness',
    model: 'Ollama / DeepSeek-R1 (Local)',
    tokenCap: 'Unlimited (Local)',
    color: '#00FF87',
    glowColor: 'rgba(0, 255, 135, 0.4)',
    officeX: 285, officeY: 420, // Gamma lab
    dialogs: [
      "HULK SMASH O(N^2) BOTTLENECK! REFACTOR WITH GAMMA SPEED!!",
      "Banner mode: Profiling heap memory snapshot...",
      "FOUND CIRCULAR DEPENDENCY! HULK CRUSH BUG!!",
      "That's my secret, Cap. My worker threads are always running."
    ]
  },
  {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    shortName: 'BLACK WIDOW',
    tag: 'SEC',
    role: 'Security Recon & CVE Audit',
    harness: 'openaiGpt4oHarness',
    model: 'OpenAI GPT-4o',
    tokenCap: '60,000 / hr',
    color: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    officeX: 395, officeY: 420, // Cyber security vault
    dialogs: [
      "Infiltrating codebase perimeter. Scanning dependencies for zero-days.",
      "Sanitized API bearer keys in .env. Ledger clean.",
      "CVE-2026-8812 vulnerability isolated and patched.",
      "Stealth recon complete. Auth boundary 100% fortified."
    ]
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    shortName: 'THOR',
    tag: 'OPS',
    role: 'DevOps & Lightning Builds',
    harness: 'xaiGrokHarness',
    model: 'xAI Grok 3',
    tokenCap: '60,000 / hr',
    color: '#00E5FF',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    officeX: 520, officeY: 220, // Bifrost Cloud Coil
    dialogs: [
      "BY THE POWER OF MJOLNIR, SUMMONING THE DOCKER BIFROST!",
      "Kubernetes ingress struck by lightning! Multi-stage build forged in 4.2s.",
      "Bring me Thanos and a multi-region container cluster!",
      "CI/CD pipeline humming with thunderous high voltage."
    ]
  },
  {
    id: 'hawkeye',
    name: 'Clint Barton',
    shortName: 'HAWKEYE',
    tag: 'TEST',
    role: 'Precision Unit Testing',
    harness: 'geminiFlashHarness',
    model: 'Gemini Flash 2.5',
    tokenCap: '150,000 / hr',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    officeX: 630, officeY: 220, // Laser Range
    dialogs: [
      "I played 18 test suites, I shot 18 passing assertions. Can't seem to miss.",
      "Locking on boundary conditions: null, undefined, NaN, Infinity. Bullseye!",
      "100% code coverage achieved. Target eliminated.",
      "Fired trick arrow: Async mock race conditions neutralized."
    ]
  },
  {
    id: 'spider-man',
    name: 'Peter Parker',
    shortName: 'SPIDER-MAN',
    tag: 'UI',
    role: 'Frontend Hero & UI/UX',
    harness: 'claudeFrontendHarness',
    model: 'Claude 3.7 / o3-mini',
    tokenCap: '80,000 / hr',
    color: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    officeX: 175, officeY: 580, // Web Tech Lab
    dialogs: [
      "Your friendly neighborhood frontend hero swinging in!",
      "Spun up accessible React components with buttery 60 FPS Tailwind animations!",
      "With great frontend power comes great responsive design responsibility!",
      "Hey Mr. Stark, I fixed the dark mode toggle!"
    ]
  },
  {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    shortName: 'DOCTOR STRANGE',
    tag: 'SIM',
    role: 'Multiverse Simulator',
    harness: 'timeStoneEngine',
    model: 'Claude 3.7 Thinking',
    tokenCap: '50,000 / hr',
    color: '#FF9900',
    glowColor: 'rgba(255, 153, 0, 0.4)',
    officeX: 395, officeY: 580, // Mystic Sanctum
    dialogs: [
      "Opening the Eye of Agamotto. Simulating 14,000,605 timelines...",
      "Reality-616 selected: Canonical high-performance architecture (98.4% success).",
      "Time Stone snapshot sealed. Instant rollback ready if build fails.",
      "Dormammu, I've come to resolve merge conflicts!"
    ]
  },
  {
    id: 'vision',
    name: 'Vision',
    shortName: 'VISION',
    tag: 'MEM',
    role: 'Mind Stone Memory',
    harness: 'mindStoneMemory',
    model: 'Gemini Pro Embedding',
    tokenCap: '100,000 / hr',
    color: '#FFD700',
    glowColor: 'rgba(255, 215, 0, 0.4)',
    officeX: 520, officeY: 580, // Mind Stone Core
    dialogs: [
      "Accessing Mind Stone semantic knowledge matrix...",
      "Indexed 42 architecture conventions into persistent org memory.",
      "Synchronizing context across all 9 agent mental nodes.",
      "Historical bug resolution patterns retrieved and applied."
    ]
  }
];

let quantumDataPackets = [];
let speechBubbles = [];
let characterEntities = [];

// Avengers Pixel Character Entity
class AvengersCharacter {
  constructor(hero) {
    this.hero = hero;
    this.id = hero.id;
    this.homeX = hero.officeX;
    this.homeY = hero.officeY;
    this.x = hero.officeX;
    this.y = hero.officeY;
    this.targetX = hero.officeX;
    this.targetY = hero.officeY;
    this.state = 'WORKING';
    this.animFrame = 0;
    this.animTimer = 0;
    this.statusTag = 'ACTIVE';
    this.actionTimer = 3000 + Math.random() * 4000;
  }

  speak(text = null) {
    const dialog = text || this.hero.dialogs[Math.floor(Math.random() * this.hero.dialogs.length)];
    createSpeechBubble(this, dialog);
    appendTerminalLine('action', `● [${this.hero.shortName}] ${dialog}`);
    playSfx('pop');
  }

  update(dt) {
    this.animTimer += dt * 5 * simSpeed;
    if (this.animTimer >= 1) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      this.state = 'WALKING';
      this.statusTag = 'PATROLLING';
      const speed = 48 * simSpeed * dt;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    } else {
      if (this.state === 'WALKING') {
        if (Math.hypot(this.x - this.homeX, this.y - this.homeY) < 10) {
          this.state = 'WORKING';
          this.statusTag = 'ACTIVE';
        } else {
          this.state = 'WORKING';
          this.statusTag = 'CALIBRATING';
        }
      }
    }

    // Schedule
    this.actionTimer -= dt * 1000 * simSpeed;
    if (this.actionTimer <= 0) {
      if (this.state === 'WORKING') {
        if (Math.random() < 0.28) {
          // Walk to central Arc Core or other pod
          this.targetX = 480 + (Math.random() - 0.5) * 80;
          this.targetY = 320 + (Math.random() - 0.5) * 60;
          this.actionTimer = 4000 + Math.random() * 4000;
        } else {
          this.actionTimer = 5000 + Math.random() * 6000;
          if (Math.random() < 0.35) this.speak();
        }
      } else {
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.actionTimer = 6000 + Math.random() * 7000;
      }
    }
  }

  // Draw 16-Bit Avengers Pixel Character
  draw(ctx, scaleX, scaleY) {
    const px = this.x * scaleX;
    const py = this.y * scaleY;

    ctx.save();
    ctx.translate(px, py);

    // Selected Halo
    if (selectedHeroId === this.id) {
      ctx.beginPath();
      ctx.ellipse(0, 4, 20, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.3)';
      ctx.fill();
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Ground Energy Ring
    ctx.beginPath();
    ctx.ellipse(0, 6, 13, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fill();

    const isWorking = this.state === 'WORKING';
    const handBob = isWorking ? (this.animFrame % 2 === 0 ? -1.5 : 1.5) : 0;
    const walkBob = this.state === 'WALKING' ? Math.sin(this.animFrame * Math.PI) * 2.5 : 0;

    ctx.translate(0, walkBob);

    // ── CHARACTER SUIT & ARMOR PIXELS ──

    // 1. Legs / Boots
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#B91C1C'; // Mark 85 crimson
      ctx.fillRect(-6, 2, 4, 6); ctx.fillRect(2, 2, 4, 6);
      ctx.fillStyle = '#F59E0B'; // Gold boots
      ctx.fillRect(-7, 7, 5, 3); ctx.fillRect(2, 7, 5, 3);
    } else if (this.id === 'captain-america') {
      ctx.fillStyle = '#1D4ED8'; // Navy pants
      ctx.fillRect(-6, 2, 4, 6); ctx.fillRect(2, 2, 4, 6);
      ctx.fillStyle = '#B91C1C'; // Red combat boots
      ctx.fillRect(-7, 7, 5, 3); ctx.fillRect(2, 7, 5, 3);
    } else if (this.id === 'hulk') {
      ctx.fillStyle = '#15803D'; // Green legs
      ctx.fillRect(-8, 2, 6, 6); ctx.fillRect(2, 2, 6, 6);
      ctx.fillStyle = '#6B21A8'; // Purple torn pants
      ctx.fillRect(-9, -2, 18, 5);
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-6, 2, 4, 6); ctx.fillRect(2, 2, 4, 6);
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-7, 7, 5, 3); ctx.fillRect(2, 7, 5, 3);
    }

    // 2. Torso / Superhero Armor
    if (this.id === 'tony-stark') {
      // Mark 85 Nano Armor
      ctx.fillStyle = '#B91C1C'; // Crimson armor
      ctx.fillRect(-8, -11, 16, 13);
      ctx.fillStyle = '#F59E0B'; // Gold shoulder trim
      ctx.fillRect(-9, -11, 3, 5); ctx.fillRect(6, -11, 3, 5);
      // Glowing Arc Reactor
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 8;
      ctx.fillRect(-2, -6, 4, 4);
      ctx.shadowBlur = 0;
    } else if (this.id === 'captain-america') {
      // Cap Star Uniform
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-8, -11, 16, 13);
      ctx.fillStyle = '#FFFFFF'; // White star
      ctx.fillRect(-2, -8, 4, 3);
      ctx.fillStyle = '#B91C1C'; // Red stripes
      ctx.fillRect(-6, 0, 12, 3);
      // Shield on back/arm
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(7, -8, 5, 10);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(8, -6, 3, 6);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(9, -5, 1, 4);
    } else if (this.id === 'hulk') {
      // Massive Green AST Titan
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-12, -14, 24, 17);
      ctx.fillStyle = '#166534';
      ctx.fillRect(-10, -5, 20, 6);
    } else if (this.id === 'black-widow') {
      // Tactical Catsuit with Widow's Bite
      ctx.fillStyle = '#090D16';
      ctx.fillRect(-7, -10, 14, 13);
      ctx.fillStyle = '#B91C1C'; // Hourglass belt
      ctx.fillRect(-2, 0, 4, 2);
      ctx.fillStyle = '#00F0FF'; // Widow's stingers
      ctx.fillRect(-8, -4, 2, 4); ctx.fillRect(6, -4, 2, 4);
    } else if (this.id === 'thor') {
      // Thor: Cape & Silver Plates
      ctx.fillStyle = '#B91C1C'; // Red flowing cape
      ctx.fillRect(-10, -9, 20, 15);
      ctx.fillStyle = '#475569'; // Silver armor
      ctx.fillRect(-8, -10, 16, 12);
      ctx.fillStyle = '#00E5FF'; // Blue armor discs
      ctx.fillRect(-4, -6, 2, 2); ctx.fillRect(2, -6, 2, 2);
    } else if (this.id === 'spider-man') {
      // Spider-Man Suit
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(-7, -10, 14, 8);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-7, -2, 14, 5);
      ctx.fillStyle = '#000000'; // Spider emblem
      ctx.fillRect(-1.5, -6, 3, 3);
    } else if (this.id === 'doctor-strange') {
      // Cloak of Levitation
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(-10, -13, 20, 17);
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(-6, -9, 12, 12);
      ctx.fillStyle = '#00FF87'; // Time Stone / Eye of Agamotto
      ctx.fillRect(-2, -6, 4, 3);
    } else {
      ctx.fillStyle = this.hero.color;
      ctx.fillRect(-7, -10, 14, 13);
    }

    // 3. Hands & Repulsors
    ctx.fillStyle = this.id === 'hulk' ? '#15803D' : (this.id === 'tony-stark' ? '#F59E0B' : '#FFD2A0');
    ctx.fillRect(-10, -8 + handBob, 3, 8);
    ctx.fillRect(7, -8 - handBob, 3, 8);

    // Repulsor palm glow
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(-10, -1 + handBob, 3, 2);
      ctx.fillRect(7, -1 - handBob, 3, 2);
    }

    // 4. Head & Superhero Helmet/Mask
    ctx.fillStyle = this.id === 'hulk' ? '#15803D' : (this.id === 'vision' ? '#B91C1C' : '#FFD2A0');
    ctx.fillRect(-6, -20, 12, 11);

    // Eyes
    ctx.fillStyle = '#17150E';
    if (this.id === 'spider-man') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-5, -16, 4, 3); ctx.fillRect(1, -16, 4, 3);
    } else if (this.id === 'vision') {
      ctx.fillStyle = '#FFD700'; // Mind Stone
      ctx.fillRect(-1.5, -21, 3, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -15, 2, 2); ctx.fillRect(2, -15, 2, 2);
    } else {
      ctx.fillRect(-4, -16, 2, 2); ctx.fillRect(2, -16, 2, 2);
    }

    // 5. Hair & Helmets
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#17150E';
      ctx.fillRect(-7, -23, 14, 5);
      ctx.fillRect(-2, -12, 4, 2); // Goatee
    } else if (this.id === 'captain-america' || this.id === 'thor') {
      ctx.fillStyle = '#F59E0B'; // Blonde hair
      ctx.fillRect(-7, -23, 14, 6);
      if (this.id === 'thor') ctx.fillRect(-9, -20, 3, 11);
    } else if (this.id === 'black-widow') {
      ctx.fillStyle = '#B91C1C'; // Red hair
      ctx.fillRect(-8, -23, 16, 8);
      ctx.fillRect(-9, -18, 3, 12);
    } else if (this.id === 'doctor-strange') {
      ctx.fillStyle = '#17150E';
      ctx.fillRect(-7, -23, 14, 5);
      ctx.fillStyle = '#E2E8F0'; // White streak
      ctx.fillRect(-7, -21, 2, 4); ctx.fillRect(5, -21, 2, 4);
    } else if (this.id !== 'spider-man' && this.id !== 'vision') {
      ctx.fillStyle = '#334155';
      ctx.fillRect(-7, -23, 14, 5);
    }

    ctx.restore();
  }
}

// Quantum Arc Data Packet (Replacing Paper Envelope)
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

    // Quantum Glowing Orb Trail
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Inner Arc Reactor Core
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

// Speech Bubble Management
function createSpeechBubble(character, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', character.hero.color);
  bubble.style.setProperty('--bubble-border', character.hero.color);
  bubble.style.setProperty('--bubble-glow', character.hero.glowColor);

  bubble.innerHTML = `
    <span class="bubble-prefix">${character.hero.shortName}</span>
    ${text}
  `;
  container.appendChild(bubble);

  speechBubbles.push({
    element: bubble,
    character: character,
    timer: 4.5
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

// Draw Authentic Stark Tower War Room Deck
function drawStarkTowerWarRoom(ctx, w, h) {
  const sx = w / 1000;
  const sy = h / 720;
  const now = performance.now() * 0.001;

  // 1. Cyber Deck Background & Hex Grid
  ctx.fillStyle = '#060A14';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 40 * sx;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. High-Tech Glass Walls & Pod Dividers
  ctx.strokeStyle = '#1B2A4A';
  ctx.lineWidth = 3;

  // Outer Perimeter Frame
  ctx.strokeRect(16*sx, 16*sy, 968*sx, 688*sy);

  // Tony's Nanotech Hologram Pod (Top-Left)
  ctx.strokeRect(16*sx, 16*sy, 240*sx, 250*sy);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.fillRect(16*sx, 16*sy, 240*sx, 250*sy);

  // Cap's Tactical Briefing Room (Top-Center)
  ctx.strokeRect(256*sx, 16*sy, 460*sx, 160*sy);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.03)';
  ctx.fillRect(256*sx, 16*sy, 460*sx, 160*sy);

  // Thor's Bifrost Cloud Ingress (Top-Right)
  ctx.strokeRect(716*sx, 16*sy, 268*sx, 300*sy);
  ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
  ctx.fillRect(716*sx, 16*sy, 268*sx, 300*sy);

  // Doctor Strange's Mystic Sanctum (Bottom-Right)
  ctx.strokeRect(716*sx, 480*sy, 268*sx, 224*sy);
  ctx.fillStyle = 'rgba(255, 153, 0, 0.03)';
  ctx.fillRect(716*sx, 480*sy, 268*sx, 224*sy);

  // 3. Central Giant Glowing Arc Reactor & Avengers "A" Logo
  const ax = 480 * sx;
  const ay = 340 * sy;

  // Outer Pulsing Arc Ring
  ctx.beginPath();
  ctx.arc(ax, ay, 90*sx, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.fill();
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating Quantum Dashed Rings
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(now * 0.6);
  ctx.beginPath();
  ctx.arc(0, 0, 72*sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();

  ctx.rotate(-now * 1.2);
  ctx.beginPath();
  ctx.arc(0, 0, 52*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#00F0FF';
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Center Glowing Avengers "A" Logo
  ctx.font = `bold ${44*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 18;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', ax, ay);
  ctx.shadowBlur = 0;

  ctx.font = `700 ${10*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('ARC REACTOR POWER GRID', ax, ay + 110*sy);

  // 4. Glowing Power Conduits Connecting to Center
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  HEROES.forEach(h => {
    ctx.beginPath();
    ctx.moveTo(h.officeX * sx, h.officeY * sy);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // 5. Tony's Hologram Armor Displays
  const tx = 130 * sx;
  const ty = 180 * sy;
  ctx.fillStyle = '#0E162B';
  ctx.fillRect(tx - 40*sx, ty - 18*sy, 80*sx, 36*sy);
  ctx.strokeStyle = '#00F0FF';
  ctx.strokeRect(tx - 40*sx, ty - 18*sy, 80*sx, 36*sy);

  // Hologram CAD Screen
  ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
  ctx.fillRect(tx - 18*sx, ty - 34*sy, 36*sx, 20*sy);
  ctx.strokeStyle = '#00F0FF';
  ctx.strokeRect(tx - 18*sx, ty - 34*sy, 36*sx, 20*sy);

  // 6. Cap's Vibranium War Table
  const cx = 475 * sx;
  const cy = 90 * sy;
  ctx.fillStyle = '#0E162B';
  ctx.fillRect(cx - 100*sx, cy - 24*sy, 200*sx, 48*sy);
  ctx.strokeStyle = '#38BDF8';
  ctx.strokeRect(cx - 100*sx, cy - 24*sy, 200*sx, 48*sy);

  // 7. Workstation Glass Consoles (Main Floor)
  const pods = [
    { x: 175, y: 420, color: '#38BDF8', label: 'QA' },
    { x: 285, y: 420, color: '#00FF87', label: 'AST' },
    { x: 395, y: 420, color: '#A855F7', label: 'SEC' },
    { x: 175, y: 580, color: '#38BDF8', label: 'UI' },
    { x: 395, y: 580, color: '#FF9900', label: 'SIM' },
    { x: 520, y: 220, color: '#00E5FF', label: 'OPS' },
    { x: 630, y: 220, color: '#FFD700', label: 'TEST' },
    { x: 520, y: 580, color: '#FFD700', label: 'MEM' }
  ];

  pods.forEach(p => {
    const px = p.x * sx;
    const py = p.y * sy;
    ctx.fillStyle = '#0E162B';
    ctx.fillRect(px - 30*sx, py - 16*sy, 60*sx, 32*sy);
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1;
    ctx.strokeRect(px - 30*sx, py - 16*sy, 60*sx, 32*sy);

    // Neon Glass Terminal
    ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.fillRect(px - 14*sx, py - 26*sy, 28*sx, 14*sy);
    ctx.strokeStyle = p.color;
    ctx.strokeRect(px - 14*sx, py - 26*sy, 28*sx, 14*sy);
  });
}

// Append Line to Terminal Output
function appendTerminalLine(type, text) {
  const terminal = document.getElementById('terminalBody');
  if (!terminal) return;

  const row = document.createElement('div');
  row.className = `term-line ${type}`;
  row.innerHTML = text;
  terminal.appendChild(row);
  terminal.scrollTop = terminal.scrollHeight;
}

// Master Mission Dispatch: Quantum Data Nodes Fly
function dispatchMasterPrompt() {
  const input = document.getElementById('queuePromptInput');
  const prompt = input?.value.trim() || "Deconstruct microservice architecture into DAG directives";

  const tony = characterEntities.find(c => c.id === 'tony-stark');
  if (!tony) return;

  appendTerminalLine('prompt', `> [JARVIS] Directive: ${prompt}`);
  appendTerminalLine('system', `* Arc Reactor grid: 99.8% optimal. Dispatching quantum nodes...`);
  appendTerminalLine('action', `* Tony Stark analyzing architecture and streaming task graph to 8 heroes.`);
  playSfx('repulsor');

  tony.speak(`Scavengers Assemble! Executing: "${prompt}"`);

  // Launch Quantum Packets from Tony's Nanotech Lab to other hero stations
  characterEntities.forEach((char, index) => {
    if (char.id !== 'tony-stark') {
      setTimeout(() => {
        quantumDataPackets.push(new QuantumDataPacket(tony.x, tony.y, char.x, char.y, char.hero.color, () => {
          char.state = 'WORKING';
          char.targetX = char.homeX;
          char.targetY = char.homeY;
          char.statusTag = 'ACTIVE';
          char.speak(`Directive received! Harnessing ${char.hero.model}`);
          appendTerminalLine('command', `  L $ ${char.hero.harness} --task="${prompt}"`);
          appendTerminalLine('success', `  ✔ [${char.hero.shortName}] Task acknowledged and executing.`);
          playSfx('packet');
        }));
      }, index * 140);
    }
  });

  if (input) input.value = '';
}

// Switch Active Hero
function selectHero(heroId) {
  selectedHeroId = heroId;
  const hero = HEROES.find(h => h.id === heroId);
  if (!hero) return;

  document.querySelectorAll('.dock-card').forEach(c => {
    c.classList.toggle('active', c.dataset.heroId === heroId);
  });

  const nameEl = document.getElementById('ccBossName');
  if (nameEl) nameEl.innerHTML = `${hero.name} <span style="font-size:10px;color:#00F0FF;">[${hero.tag}]</span>`;

  const avatarEl = document.getElementById('ccBossAvatar');
  if (avatarEl) avatarEl.textContent = hero.isBoss ? '🦾' : (hero.id === 'captain-america' ? '🛡️' : (hero.id === 'hulk' ? '🟢' : (hero.id === 'black-widow' ? '🕷️' : (hero.id === 'thor' ? '⚡' : (hero.id === 'hawkeye' ? '🏹' : (hero.id === 'spider-man' ? '🕸️' : (hero.id === 'doctor-strange' ? '🔮' : '💎')))))));

  appendTerminalLine('system', `* Switched focus to [${hero.name} // ${hero.harness}]`);
  const char = characterEntities.find(c => c.id === heroId);
  if (char) char.speak();
  playSfx('packet');
}

// 60 FPS Canvas Animation Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 1000;
  const sy = h / 720;

  // 1. Draw Avengers War Room Deck
  drawStarkTowerWarRoom(ctx, w, h);

  // 2. Update & Draw Characters
  characterEntities.forEach(char => {
    char.update(dt);
    char.draw(ctx, sx, sy);
  });

  // 3. Update & Draw Quantum Data Nodes
  for (let i = quantumDataPackets.length - 1; i >= 0; i--) {
    const packet = quantumDataPackets[i];
    if (!packet.update(dt)) {
      quantumDataPackets.splice(i, 1);
    } else {
      packet.draw(ctx, sx, sy);
    }
  }

  // 4. Update Speech Bubbles
  updateSpeechBubbles(dt, sx, sy);

  requestAnimationFrame(loop);
}

// Initialization
function init() {
  canvas = document.getElementById('pixelOfficeCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  characterEntities = HEROES.map(h => new AvengersCharacter(h));

  // Populate Bottom Dock Cards
  const dock = document.getElementById('bottomDockBar');
  if (dock) {
    dock.innerHTML = '';
    HEROES.forEach(h => {
      const card = document.createElement('div');
      card.className = `dock-card ${h.id === selectedHeroId ? 'active' : ''}`;
      card.dataset.heroId = h.id;
      card.style.setProperty('--card-color', h.color);
      card.style.setProperty('--card-glow', h.glowColor);

      const avatar = h.id === 'tony-stark' ? '🦾' : (h.id === 'captain-america' ? '🛡️' : (h.id === 'hulk' ? '🟢' : (h.id === 'black-widow' ? '🕷️' : (h.id === 'thor' ? '⚡' : (h.id === 'hawkeye' ? '🏹' : (h.id === 'spider-man' ? '🕸️' : (h.id === 'doctor-strange' ? '🔮' : '💎')))))));

      card.innerHTML = `
        <div class="dock-card-avatar" style="border-color:${h.color};">
          ${avatar}
        </div>
        <div class="dock-card-body">
          <div class="dock-card-top">
            <span class="dock-card-name">${h.shortName}</span>
            <span class="dock-card-tag" style="color:${h.color};">${h.tag}</span>
            <span style="font-size:9px;color:#00FF87;">● online</span>
          </div>
          <span class="dock-card-harness">${h.harness}</span>
        </div>
      `;
      card.addEventListener('click', () => selectHero(h.id));
      dock.appendChild(card);
    });
  }

  // Dispatch prompt button
  const sendBtn = document.getElementById('sendPromptBtn');
  if (sendBtn) sendBtn.addEventListener('click', dispatchMasterPrompt);

  const inputEl = document.getElementById('queuePromptInput');
  if (inputEl) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        dispatchMasterPrompt();
      }
    });
  }

  // Tab switching
  document.querySelectorAll('.cc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      appendTerminalLine('system', `* Switched telemetry tab to [${activeTab.toUpperCase()}]`);
    });
  });

  // Modal Setup
  const ideBtn = document.getElementById('openIdeModalBtn');
  const ideModal = document.getElementById('ideModalBackdrop');
  const closeModalBtn = document.getElementById('closeIdeModalBtn');

  if (ideBtn && ideModal) {
    ideBtn.addEventListener('click', () => ideModal.classList.add('open'));
  }
  if (closeModalBtn && ideModal) {
    closeModalBtn.addEventListener('click', () => ideModal.classList.remove('open'));
  }
  if (ideModal) {
    ideModal.addEventListener('click', (e) => {
      if (e.target === ideModal) ideModal.classList.remove('open');
    });
  }

  // IDE Modal Sub-tabs
  document.querySelectorAll('.ide-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ide-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.ide-guide-section').forEach(sec => sec.style.display = 'none');
      const targetSec = document.getElementById(btn.dataset.target);
      if (targetSec) targetSec.style.display = 'block';
    });
  });

  // Start 60 FPS Loop
  requestAnimationFrame(loop);

  setTimeout(() => {
    appendTerminalLine('system', `* JARVIS // STARK TOWER WAR ROOM DECK ONLINE.`);
    appendTerminalLine('system', `* Arc Reactor Power Grid: 99.8% · 9 Avengers agents connected.`);
    appendTerminalLine('action', `> [JARVIS] Deconstructing microservice prompt across all providers.`);
    appendTerminalLine('command', `  L $ node bin/stark.js assemble --agents=9`);
    appendTerminalLine('tip', `* Tip: Type a tactical prompt below and click "Assemble & Dispatch ➔"`);
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
