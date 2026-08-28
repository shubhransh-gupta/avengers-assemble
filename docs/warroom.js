/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — ULTRA-REALISTIC AVENGERS & MULTIVERSE ENGINE
   Rooms: 1. Dr Doom Events  2. Secret Wars Events  3. Incursions
   Features: High-Fidelity Character Rendering, Dimensional Rifts,
   Holographic Incursion Radars, Quantum Data Nodes & JARVIS Telemetry
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let lastTime = performance.now();
let soundEnabled = true;
let simSpeed = 1;
let selectedHeroId = 'tony-stark';
let activeTab = 'terminal';
let audioCtx = null;

// Stark Web Audio Synthesizer
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
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(920, now + 0.18);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.26);
    } else if (type === 'shield') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(780, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.32);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.33);
    } else if (type === 'incursion') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.45);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.46);
    } else if (type === 'packet') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    }
  } catch {}
}

// 9 Avengers Roster Definitions
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
    officeX: 130, officeY: 175,
    isBoss: true,
    dialogs: [
      "JARVIS, deconstruct the master prompt into DAG directives.",
      "Arc Reactor load balancing: 99.8% optimal. Incursion timeline sealed.",
      "Cap, your strict types look solid. Approved.",
      "Hulk, smash that memory bottleneck now."
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
    officeX: 175, officeY: 420,
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
    officeX: 285, officeY: 420,
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
    officeX: 395, officeY: 420,
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
    officeX: 520, officeY: 220,
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
    officeX: 630, officeY: 220,
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
    officeX: 175, officeY: 580,
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
    officeX: 395, officeY: 580,
    dialogs: [
      "Opening the Eye of Agamotto. Simulating 14,000,605 timelines...",
      "Reality-616 selected: Incursions averted with 98.4% success.",
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
    officeX: 520, officeY: 580,
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

// High-Fidelity Realistic Superhero Character Entity
class RealisticSuperhero {
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
    this.animTimer = 0;
    this.actionTimer = 3000 + Math.random() * 4000;
    this.auraPulse = Math.random() * Math.PI * 2;
  }

  speak(text = null) {
    const dialog = text || this.hero.dialogs[Math.floor(Math.random() * this.hero.dialogs.length)];
    createSpeechBubble(this, dialog);
    appendTerminalLine('action', `● [${this.hero.shortName}] ${dialog}`);
    playSfx('pop');
  }

  update(dt) {
    this.animTimer += dt * 4 * simSpeed;
    this.auraPulse += dt * 3;

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      this.state = 'WALKING';
      const speed = 50 * simSpeed * dt;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    } else {
      if (this.state === 'WALKING') {
        this.state = 'WORKING';
      }
    }

    this.actionTimer -= dt * 1000 * simSpeed;
    if (this.actionTimer <= 0) {
      if (this.state === 'WORKING') {
        if (Math.random() < 0.3) {
          // Roam towards Incursions room, Secret Wars nexus, or Arc Core
          const targets = [
            { x: 850, y: 150 }, // Incursions Room
            { x: 480, y: 80 },  // Secret Wars Room
            { x: 130, y: 175 }, // Dr Doom Room
            { x: 480, y: 340 }  // Center Arc Core
          ];
          const chosen = targets[Math.floor(Math.random() * targets.length)];
          this.targetX = chosen.x + (Math.random() - 0.5) * 50;
          this.targetY = chosen.y + (Math.random() - 0.5) * 40;
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

  // Draw Realistic Superhero Model (Polished vector rendering with shading & speculars)
  draw(ctx, scaleX, scaleY) {
    const px = this.x * scaleX;
    const py = this.y * scaleY;
    const isWalking = this.state === 'WALKING';
    const bob = isWalking ? Math.sin(this.animTimer * 2) * 3 : 0;
    const breath = Math.sin(this.auraPulse) * 0.5;

    ctx.save();
    ctx.translate(px, py);

    // 1. Soft Dynamic Shadow
    ctx.beginPath();
    ctx.ellipse(0, 14, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fill();

    // 2. Selection Ring & Hero Aura
    if (selectedHeroId === this.id) {
      ctx.beginPath();
      ctx.ellipse(0, 8, 22, 10, 0, 0, Math.PI * 2);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    ctx.translate(0, bob);

    // 3. CAPE RENDERING (Thor, Strange, Vision)
    if (this.id === 'thor' || this.id === 'doctor-strange' || this.id === 'vision') {
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.bezierCurveTo(-14, 4, -12, 14, -8, 16);
      ctx.lineTo(8, 16);
      ctx.bezierCurveTo(12, 14, 14, 4, 10, -10);
      ctx.closePath();
      ctx.fillStyle = this.id === 'vision' ? '#EAB308' : '#DC2626';
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.stroke();
    }

    // 4. LEGS & BOOTS
    ctx.fillStyle = '#0F172A';
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#991B1B'; // Crimson armor legs
      ctx.fillRect(-7, 2, 5, 11);
      ctx.fillRect(2, 2, 5, 11);
      ctx.fillStyle = '#D97706'; // Gold knee pads
      ctx.fillRect(-7, 4, 5, 3); ctx.fillRect(2, 4, 5, 3);
    } else if (this.id === 'captain-america') {
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(-7, 2, 5, 10);
      ctx.fillRect(2, 2, 5, 10);
      ctx.fillStyle = '#991B1B'; // Red leather boots
      ctx.fillRect(-8, 9, 6, 4); ctx.fillRect(2, 9, 6, 4);
    } else if (this.id === 'hulk') {
      ctx.fillStyle = '#15803D'; // Green legs
      ctx.fillRect(-10, 2, 8, 12);
      ctx.fillRect(2, 2, 8, 12);
      ctx.fillStyle = '#6B21A8'; // Purple pants
      ctx.fillRect(-11, -2, 22, 6);
    } else {
      ctx.fillRect(-7, 2, 5, 11);
      ctx.fillRect(2, 2, 5, 11);
    }

    // 5. TORSO & SUIT DETAILS
    if (this.id === 'tony-stark') {
      // Mark 85 Nano Armor Torso
      ctx.fillStyle = '#B91C1C';
      ctx.beginPath();
      ctx.roundRect(-10, -14, 20, 17, 3);
      ctx.fill();
      // Gold shoulder & chest plates
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-11, -14, 4, 6); ctx.fillRect(7, -14, 4, 6);
      // Glowing Arc Reactor
      ctx.beginPath();
      ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    } else if (this.id === 'captain-america') {
      // Cap Star Uniform
      ctx.fillStyle = '#1D4ED8';
      ctx.beginPath();
      ctx.roundRect(-9, -14, 18, 17, 3);
      ctx.fill();
      // White Star
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -11, 6, 4);
      // Red & White abdomen stripes
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-7, -2, 14, 4);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -2, 2, 4); ctx.fillRect(2, -2, 2, 4);
      // Vibranium Shield on back
      ctx.beginPath();
      ctx.arc(10, -5, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#DC2626'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#1D4ED8'; ctx.fill();
      ctx.beginPath(); ctx.arc(10, -5, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF'; ctx.fill();
    } else if (this.id === 'hulk') {
      // Massive Green Gamma Titan
      ctx.fillStyle = '#15803D';
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 22, 5);
      ctx.fill();
      // Muscle chest definition
      ctx.strokeStyle = '#14532D';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-10, -14, 20, 10);
    } else if (this.id === 'black-widow') {
      // Sleek Tactical Catsuit
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.roundRect(-8, -13, 16, 16, 3);
      ctx.fill();
      // Red Hourglass Belt
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-2, 0, 4, 3);
      // Widow's Bite blue gauntlets
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(-10, -4, 2, 4); ctx.fillRect(8, -4, 2, 4);
    } else if (this.id === 'thor') {
      // Asgardian Silver Battle Armor
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(-9, -14, 18, 17, 3);
      ctx.fill();
      // Glowing blue armor discs
      ctx.fillStyle = '#00E5FF';
      ctx.beginPath(); ctx.arc(-4, -8, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -8, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(-4, -2, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(4, -2, 2.5, 0, Math.PI * 2); ctx.fill();
    } else if (this.id === 'spider-man') {
      // Webbed Red & Blue Suit
      ctx.fillStyle = '#DC2626';
      ctx.beginPath(); ctx.roundRect(-8, -14, 16, 10, 3); ctx.fill();
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-8, -4, 16, 7);
      // Black Spider Icon
      ctx.fillStyle = '#000000';
      ctx.fillRect(-2, -9, 4, 4);
    } else if (this.id === 'doctor-strange') {
      // Sorcerer Robes & Eye of Agamotto
      ctx.fillStyle = '#1E3A8A';
      ctx.beginPath(); ctx.roundRect(-8, -13, 16, 16, 3); ctx.fill();
      // Eye of Agamotto (Time Stone glow)
      ctx.beginPath(); ctx.arc(0, -6, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00FF87';
      ctx.shadowColor = '#00FF87'; ctx.shadowBlur = 8;
      ctx.fill(); ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = this.hero.color;
      ctx.beginPath(); ctx.roundRect(-8, -13, 16, 16, 3); ctx.fill();
    }

    // 6. HEAD, HELMET, MASK & HAIR
    ctx.fillStyle = this.id === 'hulk' ? '#15803D' : (this.id === 'vision' ? '#991B1B' : '#FED7AA');
    ctx.beginPath();
    ctx.arc(0, -20, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    if (this.id === 'spider-man') {
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(-3.5, -20, 3, 2, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(3.5, -20, 3, 2, 0.2, 0, Math.PI * 2); ctx.fill();
    } else if (this.id === 'vision') {
      // Glowing Mind Stone
      ctx.beginPath(); ctx.arc(0, -25, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 10; ctx.fill(); ctx.shadowBlur = 0;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -20, 2, 2); ctx.fillRect(1, -20, 2, 2);
    } else {
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-3.5, -20, 2, 2); ctx.fillRect(1.5, -20, 2, 2);
    }

    // Hair / Facial Details
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#1C1917';
      ctx.beginPath(); ctx.arc(0, -23, 7.5, Math.PI, 0); ctx.fill(); // Swept hair
      ctx.fillRect(-2, -15, 4, 2); // Goatee
    } else if (this.id === 'captain-america' || this.id === 'thor') {
      ctx.fillStyle = '#F59E0B'; // Blonde hair
      ctx.beginPath(); ctx.arc(0, -23, 7.5, Math.PI, 0); ctx.fill();
      if (this.id === 'thor') {
        ctx.fillRect(-8, -20, 3, 10); ctx.fillRect(5, -20, 3, 10); // Long hair
      }
    } else if (this.id === 'black-widow') {
      ctx.fillStyle = '#B91C1C'; // Auburn hair
      ctx.beginPath(); ctx.arc(0, -23, 8.5, Math.PI, 0); ctx.fill();
      ctx.fillRect(-9, -20, 3, 12); ctx.fillRect(6, -20, 3, 12);
    } else if (this.id === 'doctor-strange') {
      ctx.fillStyle = '#1C1917';
      ctx.beginPath(); ctx.arc(0, -23, 7.5, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#E2E8F0'; // White temples
      ctx.fillRect(-7, -21, 2, 4); ctx.fillRect(5, -21, 2, 4);
    }

    ctx.restore();
  }
}

// Quantum Data Packet Entity
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

// Speech Bubble Management
function createSpeechBubble(character, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', character.hero.color);
  bubble.style.setProperty('--bubble-border', character.hero.color);

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

// Draw Realistic Stark Tower Floor Map with the 3 Named Event Rooms
function drawRealisticWarRoom(ctx, w, h) {
  const sx = w / 1000;
  const sy = h / 720;
  const now = performance.now() * 0.001;

  // 1. Dark Metallic Titanium Hex Deck
  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, w, h);

  // Hex / Grid Energy Lines
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
  ctx.lineWidth = 1;
  const gridSize = 45 * sx;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. Outer War Room Frame
  ctx.strokeStyle = '#1E293B';
  ctx.lineWidth = 3;
  ctx.strokeRect(14*sx, 14*sy, 972*sx, 692*sy);

  // ── ROOM 1: DR DOOM EVENTS (Top-Left) ──
  const r1x = 14 * sx, r1y = 14 * sy, r1w = 236 * sx, r1h = 240 * sy;
  ctx.fillStyle = 'rgba(16, 185, 129, 0.04)'; // Latverian Emerald Tint
  ctx.fillRect(r1x, r1y, r1w, r1h);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(r1x, r1y, r1w, r1h);

  // Room 1 Header Banner
  ctx.fillStyle = 'rgba(16, 185, 129, 0.18)';
  ctx.fillRect(r1x, r1y, r1w, 26*sy);
  ctx.font = `bold ${11*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#10B981';
  ctx.fillText('🔮 1. DR DOOM EVENTS // CHRONO-SPIRE', r1x + 12*sx, r1y + 18*sy);

  // Latverian Anomaly Core in Room 1
  ctx.beginPath();
  ctx.arc(r1x + 120*sx, r1y + 140*sy, 32*sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ── ROOM 2: SECRET WARS EVENTS (Top-Center) ──
  const r2x = 260 * sx, r2y = 14 * sy, r2w = 440 * sx, r2h = 160 * sy;
  ctx.fillStyle = 'rgba(245, 158, 11, 0.04)'; // Beyonder Gold Tint
  ctx.fillRect(r2x, r2y, r2w, r2h);
  ctx.strokeStyle = '#F59E0B';
  ctx.lineWidth = 2;
  ctx.strokeRect(r2x, r2y, r2w, r2h);

  // Room 2 Header Banner
  ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
  ctx.fillRect(r2x, r2y, r2w, 26*sy);
  ctx.font = `bold ${11*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#F59E0B';
  ctx.fillText('⚡ 2. SECRET WARS EVENTS // BATTLEWORLD NEXUS', r2x + 14*sx, r2y + 18*sy);

  // Holographic Battleworld Map Table in Room 2
  ctx.fillStyle = '#0B132B';
  ctx.fillRect(r2x + 60*sx, r2y + 50*sy, r2w - 120*sx, 75*sy);
  ctx.strokeStyle = '#F59E0B';
  ctx.strokeRect(r2x + 60*sx, r2y + 50*sy, r2w - 120*sx, 75*sy);
  // Hologram Grid inside table
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
  ctx.strokeRect(r2x + 80*sx, r2y + 60*sy, r2w - 160*sx, 55*sy);

  // ── ROOM 3: INCURSIONS (Top-Right & Dimensional Chamber) ──
  const r3x = 710 * sx, r3y = 14 * sy, r3w = 276 * sx, r3h = 280 * sy;
  ctx.fillStyle = 'rgba(239, 68, 68, 0.05)'; // Red Incursion Alert Tint
  ctx.fillRect(r3x, r3y, r3w, r3h);
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.strokeRect(r3x, r3y, r3w, r3h);

  // Room 3 Header Banner
  ctx.fillStyle = 'rgba(239, 68, 68, 0.2)';
  ctx.fillRect(r3x, r3y, r3w, 26*sy);
  ctx.font = `bold ${11*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#EF4444';
  ctx.fillText('🌌 3. INCURSIONS // COLLISION RADAR', r3x + 12*sx, r3y + 18*sy);

  // Collapsing Multiverse Rift Hologram in Room 3
  const rx = r3x + 138 * sx;
  const ry = r3y + 150 * sy;
  ctx.save();
  ctx.translate(rx, ry);
  ctx.rotate(now * 0.8);
  ctx.beginPath();
  ctx.arc(0, 0, 48*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#EF4444';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  ctx.stroke();
  ctx.rotate(-now * 1.6);
  ctx.beginPath();
  ctx.arc(0, 0, 28*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#A855F7';
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // ── 4. CENTRAL ARC REACTOR & AVENGERS CREST ──
  const ax = 480 * sx;
  const ay = 360 * sy;

  // Outer Pulsing Arc Power Ring
  ctx.beginPath();
  ctx.arc(ax, ay, 95*sx, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 240, 255, 0.03)';
  ctx.fill();
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Rotating Quantum Turbine Rings
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(now * 0.5);
  ctx.beginPath();
  ctx.arc(0, 0, 78*sx, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.stroke();

  ctx.rotate(-now * 1.1);
  ctx.beginPath();
  ctx.arc(0, 0, 56*sx, 0, Math.PI * 2);
  ctx.strokeStyle = '#00F0FF';
  ctx.setLineDash([4, 4]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Giant Glowing Avengers "A"
  ctx.font = `bold ${48*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 20;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('A', ax, ay);
  ctx.shadowBlur = 0;

  ctx.font = `700 ${10.5*sx}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = '#00F0FF';
  ctx.fillText('ARC REACTOR POWER GRID', ax, ay + 115*sy);

  // 5. Glowing Power Conduits Connecting All Rooms
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([6, 6]);
  HEROES.forEach(h => {
    ctx.beginPath();
    ctx.moveTo(h.officeX * sx, h.officeY * sy);
    ctx.lineTo(ax, ay);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // 6. Superhero Workstation Pods (Main Floor)
  const pods = [
    { x: 175, y: 420, color: '#38BDF8', label: 'QA BRIEFING' },
    { x: 285, y: 420, color: '#00FF87', label: 'GAMMA CORE' },
    { x: 395, y: 420, color: '#A855F7', label: 'CYBER VAULT' },
    { x: 175, y: 580, color: '#38BDF8', label: 'WEB TECH' },
    { x: 395, y: 580, color: '#FF9900', label: 'MYSTIC RUNES' },
    { x: 520, y: 220, color: '#00E5FF', label: 'BIFROST COIL' },
    { x: 630, y: 220, color: '#FFD700', label: 'TARGET RANGE' },
    { x: 520, y: 580, color: '#FFD700', label: 'MIND STONE' }
  ];

  pods.forEach(p => {
    const px = p.x * sx;
    const py = p.y * sy;
    ctx.fillStyle = '#0D152A';
    ctx.beginPath(); ctx.roundRect(px - 32*sx, py - 18*sy, 64*sx, 36*sy, 4); ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Hologram Monitor Glow
    ctx.fillStyle = 'rgba(0, 240, 255, 0.2)';
    ctx.beginPath(); ctx.roundRect(px - 16*sx, py - 28*sy, 32*sx, 16*sy, 2); ctx.fill();
    ctx.strokeStyle = p.color;
    ctx.stroke();
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

// Master Mission Dispatch
function dispatchMasterPrompt() {
  const input = document.getElementById('queuePromptInput');
  const prompt = input?.value.trim() || "Deconstruct multi-agent task into DAG directives";

  const tony = characterEntities.find(c => c.id === 'tony-stark');
  if (!tony) return;

  appendTerminalLine('prompt', `> [JARVIS] Directive: ${prompt}`);
  appendTerminalLine('system', `* Dr. Doom Chrono-Spire & Incursions Radar monitored.`);
  appendTerminalLine('action', `* Tony Stark streaming task graph to all 8 Avengers.`);
  playSfx('repulsor');

  tony.speak(`Scavengers Assemble! Executing: "${prompt}"`);

  // Launch Quantum Packets
  characterEntities.forEach((char, index) => {
    if (char.id !== 'tony-stark') {
      setTimeout(() => {
        quantumDataPackets.push(new QuantumDataPacket(tony.x, tony.y, char.x, char.y, char.hero.color, () => {
          char.state = 'WORKING';
          char.targetX = char.homeX;
          char.targetY = char.homeY;
          char.speak(`Directive received! Harnessing ${char.hero.model}`);
          appendTerminalLine('command', `  L $ ${char.hero.harness} --task="${prompt}"`);
          appendTerminalLine('success', `  ✔ [${char.hero.shortName}] Active on directive.`);
          playSfx('packet');
        }));
      }, index * 130);
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

  appendTerminalLine('system', `* Focused on [${hero.name} // ${hero.harness}]`);
  const char = characterEntities.find(c => c.id === heroId);
  if (char) char.speak();
  playSfx('packet');
}

// 60 FPS Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 1000;
  const sy = h / 720;

  // 1. Draw Realistic War Room with the 3 Named Rooms
  drawRealisticWarRoom(ctx, w, h);

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

// Initialize
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

  characterEntities = HEROES.map(h => new RealisticSuperhero(h));

  // Populate Bottom Dock Cards
  const dock = document.getElementById('bottomDockBar');
  if (dock) {
    dock.innerHTML = '';
    HEROES.forEach(h => {
      const card = document.createElement('div');
      card.className = `dock-card ${h.id === selectedHeroId ? 'active' : ''}`;
      card.dataset.heroId = h.id;
      card.style.setProperty('--card-color', h.color);

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
    appendTerminalLine('system', `* STARK TOWER // MULTIVERSE WAR ROOM ONLINE.`);
    appendTerminalLine('system', `* Monitoring: 1. Dr Doom Events · 2. Secret Wars · 3. Incursions`);
    appendTerminalLine('action', `> [JARVIS] All 9 Avengers active on Arc Reactor Power Grid.`);
    appendTerminalLine('command', `  L $ node bin/stark.js assemble --multiverse`);
    appendTerminalLine('tip', `* Tip: Type a prompt below and hit Assemble & Dispatch ➔`);
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
