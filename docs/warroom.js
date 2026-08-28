/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — Munder-Difflin Pixel Engine & Command Center
   Authentic 16-bit Pixel Sprites, Office Architecture, PTY Terminal,
   Flying Envelopes, Interactive Prompt Dispatcher & IDE Setup Guide
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let lastTime = performance.now();
let soundEnabled = true;
let simSpeed = 1;
let selectedHeroId = 'tony-stark';
let activeTab = 'terminal';
let audioCtx = null;

// Sound Synthesizer
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
    if (type === 'envelope') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.14);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.15);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'typing') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220 + Math.random()*150, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.045);
    } else if (type === 'repulsor') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.16);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.23);
    }
  } catch {}
}

// 9 Hero Definitions & Workstation Placement (Relative Office Map Coordinates 0-1000)
const HEROES = [
  {
    id: 'tony-stark',
    name: 'Tony Stark',
    shortName: 'TONY',
    tag: 'GOD',
    role: 'Lead GOD Orchestrator',
    harness: 'claudeTerminalHarness',
    model: 'Claude 3.7 Sonnet / Claude Code',
    tokenCap: '80,000 / hr',
    color: '#00D4FF',
    officeX: 110, officeY: 180, // In boss office top-left
    isBoss: true,
    dialogs: [
      "JARVIS, deconstruct the master prompt into DAG directives.",
      "Arc Reactor load balancing: 99.8% optimal. No 429s allowed.",
      "Cap, your strict types look solid. Approved.",
      "Hulk, smash that memory bottleneck now."
    ]
  },
  {
    id: 'captain-america',
    name: 'Steve Rogers',
    shortName: 'CAP',
    tag: 'QA',
    role: 'QA Commander & Standards',
    harness: 'geminiProHarness',
    model: 'Gemini 2.5 Pro',
    tokenCap: '120,000 / hr',
    color: '#38BDF8',
    officeX: 175, officeY: 420,
    dialogs: [
      "I can do this all day. No unhandled promise rejections.",
      "Vibranium Shield QA stamp applied: 100% strict TypeScript.",
      "Language, team! Clean commits only on main branch.",
      "All assertions green across 16 test suites."
    ]
  },
  {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    shortName: 'HULK',
    tag: 'AST',
    role: 'Deep AST Refactorer',
    harness: 'ollamaDeepSeekHarness',
    model: 'Ollama / DeepSeek-R1 (Local)',
    tokenCap: 'Unlimited (Local)',
    color: '#4ADE80',
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
    shortName: 'WIDOW',
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
    color: '#FFCA54',
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
    shortName: 'SPIDEY',
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
    shortName: 'STRANGE',
    tag: 'SIM',
    role: 'Multiverse Simulator',
    harness: 'timeStoneEngine',
    model: 'Claude 3.7 Thinking',
    tokenCap: '50,000 / hr',
    color: '#F59E0B',
    officeX: 395, officeY: 580,
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
    officeX: 520, officeY: 580,
    dialogs: [
      "Accessing Mind Stone semantic knowledge matrix...",
      "Indexed 42 architecture conventions into persistent org memory.",
      "Synchronizing context across all 9 agent mental nodes.",
      "Historical bug resolution patterns retrieved and applied."
    ]
  }
];

// Flying Mail Envelopes
let flyingEnvelopes = [];
let speechBubbles = [];
let characterEntities = [];

class PixelCharacter {
  constructor(hero) {
    this.hero = hero;
    this.id = hero.id;
    this.homeX = hero.officeX;
    this.homeY = hero.officeY;
    this.x = hero.officeX;
    this.y = hero.officeY;
    this.targetX = hero.officeX;
    this.targetY = hero.officeY;
    this.state = 'WORKING'; // WORKING, WALKING, COFFEE, BREAK
    this.facing = 1; // 1 = down, 2 = up, 3 = left, 4 = right
    this.animFrame = 0;
    this.animTimer = 0;
    this.statusTag = 'working';
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

    // Pathfinding
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      this.state = 'WALKING';
      this.statusTag = 'walking';
      const speed = 45 * simSpeed * dt;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
    } else {
      if (this.state === 'WALKING') {
        if (Math.hypot(this.x - this.homeX, this.y - this.homeY) < 10) {
          this.state = 'WORKING';
          this.statusTag = 'working';
        } else {
          this.state = 'BREAK';
          this.statusTag = 'coffee break';
          if (Math.random() < 0.6) this.speak("Refueling at the coffee machine.");
        }
      }
    }

    // Autonomous schedule
    this.actionTimer -= dt * 1000 * simSpeed;
    if (this.actionTimer <= 0) {
      if (this.state === 'WORKING') {
        if (Math.random() < 0.3) {
          // Walk to kitchen / break room (coords around 780, 580)
          this.targetX = 760 + (Math.random() - 0.5) * 40;
          this.targetY = 560 + (Math.random() - 0.5) * 30;
          this.actionTimer = 4000 + Math.random() * 4000;
        } else {
          this.actionTimer = 6000 + Math.random() * 6000;
          if (Math.random() < 0.4) this.speak();
        }
      } else {
        // Return to desk
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.actionTimer = 7000 + Math.random() * 8000;
      }
    }
  }

  // Draw 16-Bit Pixel Character Sprite directly on Canvas
  draw(ctx, scaleX, scaleY) {
    const px = this.x * scaleX;
    const py = this.y * scaleY;
    const s = 1.8; // sprite scale

    ctx.save();
    ctx.translate(px, py);

    // Selected indicator
    if (selectedHeroId === this.id) {
      ctx.fillStyle = 'rgba(255, 202, 84, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 6, 12, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── CHARACTER SPRITE PIXELS ──
    const isTyping = this.state === 'WORKING';
    const handBob = isTyping ? (this.animFrame % 2 === 0 ? -1 : 1) : 0;
    const walkBob = this.state === 'WALKING' ? Math.sin(this.animFrame * Math.PI) * 2 : 0;

    ctx.translate(0, walkBob);

    // 1. Legs / Shoes
    ctx.fillStyle = '#2B3A42';
    ctx.fillRect(-6, 2, 4, 6);
    ctx.fillRect(2, 2, 4, 6);
    ctx.fillStyle = '#17150E';
    ctx.fillRect(-7, 7, 5, 3);
    ctx.fillRect(2, 7, 5, 3);

    // 2. Torso / Clothes (Specific to hero)
    if (this.id === 'tony-stark') {
      // Tony: Black business suit with glowing cyan Arc Reactor
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(-8, -10, 16, 13);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-3, -10, 6, 6);
      ctx.fillStyle = '#00D4FF';
      ctx.fillRect(-1.5, -6, 3, 3); // Arc Reactor
    } else if (this.id === 'captain-america') {
      // Cap: Blue tactical suit with star
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-8, -10, 16, 13);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-2, -8, 4, 3);
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(-6, 0, 12, 3);
    } else if (this.id === 'hulk') {
      // Hulk: Green skin & purple torn shirt
      ctx.fillStyle = '#15803D';
      ctx.fillRect(-10, -12, 20, 15);
      ctx.fillStyle = '#7E22CE';
      ctx.fillRect(-8, -4, 16, 8);
    } else if (this.id === 'black-widow') {
      // Widow: Black stealth suit with violet belt
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(-7, -10, 14, 13);
      ctx.fillStyle = '#A855F7';
      ctx.fillRect(-6, 0, 12, 2);
    } else if (this.id === 'thor') {
      // Thor: Red cape + silver armor
      ctx.fillStyle = '#DC2626'; // Cape behind
      ctx.fillRect(-10, -8, 20, 14);
      ctx.fillStyle = '#64748B'; // Armor
      ctx.fillRect(-8, -10, 16, 12);
      ctx.fillStyle = '#00E5FF';
      ctx.fillRect(-4, -6, 2, 2);
      ctx.fillRect(2, -6, 2, 2);
    } else if (this.id === 'spider-man') {
      // Spider-Man: Red & blue suit
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-7, -10, 14, 8);
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(-7, -2, 14, 5);
    } else if (this.id === 'doctor-strange') {
      // Strange: High red collar cape & blue robes
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(-9, -12, 18, 16);
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(-6, -9, 12, 12);
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(-2, -6, 4, 3);
    } else {
      // Generic / Vision / Hawkeye
      ctx.fillStyle = this.hero.color;
      ctx.fillRect(-7, -10, 14, 13);
    }

    // 3. Arms & Hands
    ctx.fillStyle = this.id === 'hulk' ? '#15803D' : '#FFD2A0';
    ctx.fillRect(-10, -8 + handBob, 3, 8);
    ctx.fillRect(7, -8 - handBob, 3, 8);

    // 4. Head & Face
    ctx.fillStyle = this.id === 'hulk' ? '#15803D' : (this.id === 'vision' ? '#DC2626' : '#FFD2A0');
    ctx.fillRect(-6, -20, 12, 11);

    // Eyes
    ctx.fillStyle = '#17150E';
    if (this.id === 'spider-man') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -16, 3, 3);
      ctx.fillRect(1, -16, 3, 3);
    } else if (this.id === 'vision') {
      ctx.fillStyle = '#FBBF24'; // Mind stone
      ctx.fillRect(-1.5, -20, 3, 3);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(-4, -15, 2, 2);
      ctx.fillRect(2, -15, 2, 2);
    } else {
      ctx.fillRect(-4, -16, 2, 2);
      ctx.fillRect(2, -16, 2, 2);
    }

    // 5. Hair / Beard / Helmet
    if (this.id === 'tony-stark') {
      ctx.fillStyle = '#17150E';
      ctx.fillRect(-7, -23, 14, 5); // Hair
      ctx.fillRect(-2, -12, 4, 2); // Goatee
    } else if (this.id === 'captain-america' || this.id === 'thor') {
      ctx.fillStyle = '#FBBF24'; // Blonde hair
      ctx.fillRect(-7, -23, 14, 6);
      if (this.id === 'thor') ctx.fillRect(-8, -20, 2, 10); // Long hair
    } else if (this.id === 'black-widow') {
      ctx.fillStyle = '#B91C1C'; // Red hair
      ctx.fillRect(-8, -23, 16, 8);
      ctx.fillRect(-9, -18, 3, 12);
    } else if (this.id === 'doctor-strange') {
      ctx.fillStyle = '#17150E';
      ctx.fillRect(-7, -23, 14, 5);
      ctx.fillStyle = '#E2E8F0'; // White streak
      ctx.fillRect(-7, -21, 2, 4);
      ctx.fillRect(5, -21, 2, 4);
    } else if (this.id !== 'spider-man' && this.id !== 'vision') {
      ctx.fillStyle = '#4B5563';
      ctx.fillRect(-7, -23, 14, 5);
    }

    ctx.restore();
  }
}

// Flying Envelope Sprite
class FlyingEnvelope {
  constructor(x1, y1, x2, y2, color, onArrival) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.color = color || '#A855F7';
    this.progress = 0;
    this.speed = 1.8;
    this.onArrival = onArrival;
    this.curveHeight = -50 - Math.random() * 30;
    playSfx('envelope');
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

    // Glowing envelope pixel rect
    ctx.save();
    ctx.translate(px, py);

    // Trail
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.fillRect(-8, -6, 16, 12);
    ctx.shadowBlur = 0;

    // Pixel envelope details
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-7, -5, 14, 10);
    ctx.fillStyle = '#A855F7';
    ctx.beginPath();
    ctx.moveTo(-7, -5); ctx.lineTo(0, 1); ctx.lineTo(7, -5);
    ctx.strokeStyle = '#A855F7';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}

// Speech Bubble Management
function createSpeechBubble(character, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.innerHTML = `
    <span class="bubble-prefix">${character.hero.name}</span>
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

// Draw Authentic Retro Office Floor Layout (Matching Screenshot)
function drawOfficeEnvironment(ctx, w, h) {
  const sx = w / 1000;
  const sy = h / 720;

  // 1. Floor Tiles
  ctx.fillStyle = '#A4B8A2'; // Retro green-tinted office floor
  ctx.fillRect(0, 0, w, h);

  // Floor grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  const tile = 32 * sx;
  for (let x = 0; x < w; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. Thick Exterior Walls & Inner Office Dividers
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#17150E';
  ctx.lineWidth = 4;

  // Outer Border Wall
  ctx.strokeRect(16*sx, 16*sy, 968*sx, 688*sy);

  // Boss Office Wall (Top-Left room)
  ctx.strokeRect(16*sx, 16*sy, 220*sx, 240*sy);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(16*sx, 16*sy, 220*sx, 240*sy);

  // Conference Room Wall (Top-Center)
  ctx.strokeRect(236*sx, 16*sy, 480*sx, 150*sy);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(236*sx, 16*sy, 480*sx, 150*sy);

  // Kitchen / Break Room (Bottom-Right)
  ctx.strokeRect(716*sx, 480*sy, 268*sx, 224*sy);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(716*sx, 480*sy, 268*sx, 224*sy);

  // Copy Machine / Storage Room (Right-Center)
  ctx.strokeRect(716*sx, 16*sy, 268*sx, 300*sy);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(716*sx, 16*sy, 268*sx, 300*sy);

  // Floor inside rooms
  ctx.fillStyle = '#B4C5B2';
  ctx.fillRect(20*sx, 20*sy, 212*sx, 232*sy); // Boss floor
  ctx.fillRect(240*sx, 20*sy, 472*sx, 142*sy); // Conf floor
  ctx.fillRect(720*sx, 484*sy, 260*sx, 216*sy); // Kitchen floor
  ctx.fillRect(720*sx, 20*sy, 260*sx, 292*sy); // Copy room floor

  // 3. Furniture: Boss Desk (Top-Left)
  const bx = 110 * sx;
  const by = 180 * sy;
  ctx.fillStyle = '#8D6E63'; // Wood desk
  ctx.fillRect(bx - 36*sx, by - 16*sy, 72*sx, 32*sy);
  ctx.strokeRect(bx - 36*sx, by - 16*sy, 72*sx, 32*sy);
  // Boss CRT Monitor
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(bx - 14*sx, by - 26*sy, 28*sx, 16*sy);
  ctx.fillStyle = '#00D4FF';
  ctx.fillRect(bx - 12*sx, by - 24*sy, 24*sx, 12*sy);
  // Coffee mug
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(bx - 26*sx, by - 8*sy, 8*sx, 8*sy);

  // Wall Clock & Calendar above Boss
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeRect(40*sx, 32*sy, 32*sx, 32*sy);
  ctx.fillRect(40*sx, 32*sy, 32*sx, 32*sy);
  ctx.font = `${10*sx}px "JetBrains Mono"`;
  ctx.fillStyle = '#DC2626';
  ctx.fillText('AUG', 44*sx, 44*sy);
  ctx.fillStyle = '#17150E';
  ctx.fillText('28', 48*sx, 58*sy);

  // 4. Furniture: Conference Table (Top-Center)
  const cx = 475 * sx;
  const cy = 90 * sy;
  ctx.fillStyle = '#A0522D';
  ctx.fillRect(cx - 100*sx, cy - 24*sy, 200*sx, 48*sy);
  ctx.strokeRect(cx - 100*sx, cy - 24*sy, 200*sx, 48*sy);
  // 6 Purple Chairs around table
  ctx.fillStyle = '#7E22CE';
  [-70, 0, 70].forEach(ox => {
    ctx.fillRect(cx + ox*sx - 10*sx, cy - 38*sy, 20*sx, 12*sy);
    ctx.strokeRect(cx + ox*sx - 10*sx, cy - 38*sy, 20*sx, 12*sy);
    ctx.fillRect(cx + ox*sx - 10*sx, cy + 26*sy, 20*sx, 12*sy);
    ctx.strokeRect(cx + ox*sx - 10*sx, cy + 26*sy, 20*sx, 12*sy);
  });
  // Whiteboard / Easel
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx + 120*sx, cy - 30*sy, 34*sx, 40*sy);
  ctx.strokeRect(cx + 120*sx, cy - 30*sy, 34*sx, 40*sy);

  // 5. Furniture: Kitchen Counter & Coffee Station (Bottom-Right)
  const kx = 850 * sx;
  const ky = 620 * sy;
  ctx.fillStyle = '#CBD5E1'; // Steel sink counter
  ctx.fillRect(kx - 90*sx, ky - 18*sy, 180*sx, 36*sy);
  ctx.strokeRect(kx - 90*sx, ky - 18*sy, 180*sx, 36*sy);
  // Coffee Maker with pot
  ctx.fillStyle = '#17150E';
  ctx.fillRect(kx - 60*sx, ky - 34*sy, 22*sx, 22*sy);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(kx - 56*sx, ky - 26*sy, 14*sx, 12*sy);
  // Water Cooler with blue tank
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(kx + 50*sx, ky - 44*sy, 24*sx, 36*sy);
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(kx + 54*sx, ky - 40*sy, 16*sx, 18*sy);

  // 6. Open Office Workstation Desks (Main Floor)
  const desks = [
    { x: 175, y: 420 }, { x: 285, y: 420 }, { x: 395, y: 420 },
    { x: 175, y: 580 }, { x: 285, y: 580 }, { x: 395, y: 580 },
    { x: 520, y: 220 }, { x: 630, y: 220 },
    { x: 520, y: 420 }, { x: 630, y: 420 },
    { x: 520, y: 580 }, { x: 630, y: 580 }
  ];

  desks.forEach(d => {
    const dx = d.x * sx;
    const dy = d.y * sy;
    // Wooden Desk
    ctx.fillStyle = '#D97706';
    ctx.fillRect(dx - 28*sx, dy - 14*sy, 56*sx, 28*sy);
    ctx.strokeRect(dx - 28*sx, dy - 14*sy, 56*sx, 28*sy);
    // CRT Monitor
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(dx - 10*sx, dy - 22*sy, 20*sx, 12*sy);
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(dx - 8*sx, dy - 20*sy, 16*sx, 8*sy);
    // Swivel Chair
    ctx.fillStyle = '#B45309';
    ctx.fillRect(dx - 10*sx, dy + 16*sy, 20*sx, 10*sy);
    ctx.strokeRect(dx - 10*sx, dy + 16*sy, 20*sx, 10*sy);
  });

  // Green corner plants
  const plants = [{x: 40, y: 680}, {x: 250, y: 50}, {x: 950, y: 50}];
  plants.forEach(p => {
    ctx.fillStyle = '#15803D';
    ctx.beginPath();
    ctx.arc(p.x * sx, p.y * sy, 14*sx, 0, Math.PI * 2);
    ctx.fill();
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

// Master Prompt Dispatch: Envelopes Fly to All Heroes
function dispatchMasterPrompt() {
  const input = document.getElementById('queuePromptInput');
  const prompt = input?.value.trim() || "Let's ask each of the 9 agents what they are up to. In short,";

  const tony = characterEntities.find(c => c.id === 'tony-stark');
  if (!tony) return;

  appendTerminalLine('prompt', `> ${prompt}`);
  appendTerminalLine('system', `* Brewed for 0.4s`);
  appendTerminalLine('action', `* On it — sending all 9 agents the directive...`);
  playSfx('repulsor');

  tony.speak(`Dispatching DAG task graph to strike team.`);

  // Launch flying envelopes from Tony's office to all other desks
  characterEntities.forEach((char, index) => {
    if (char.id !== 'tony-stark') {
      setTimeout(() => {
        flyingEnvelopes.push(new FlyingEnvelope(tony.x, tony.y, char.x, char.y, char.hero.color, () => {
          char.state = 'WORKING';
          char.targetX = char.homeX;
          char.targetY = char.homeY;
          char.statusTag = 'working';
          char.speak(`Directive received! Running ${char.hero.model}`);
          appendTerminalLine('command', `  L $ ${char.hero.harness} --task="${prompt}"`);
          appendTerminalLine('success', `  ✔ [${char.hero.shortName}] Task acknowledged and executing.`);
          playSfx('typing');
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

  // Update Dock Cards Active state
  document.querySelectorAll('.dock-card').forEach(c => {
    c.classList.toggle('active', c.dataset.heroId === heroId);
  });

  // Update Header Boss Info
  const nameEl = document.getElementById('ccBossName');
  if (nameEl) nameEl.innerHTML = `${hero.name} <span style="font-size:10px;color:#00D4FF;">[${hero.tag}]</span>`;

  const avatarEl = document.getElementById('ccBossAvatar');
  if (avatarEl) avatarEl.textContent = hero.isBoss ? '🦾' : '🦸';

  appendTerminalLine('system', `* Switched context to [${hero.name} // ${hero.harness}]`);
  const char = characterEntities.find(c => c.id === heroId);
  if (char) char.speak();
}

// 60 FPS Canvas Animation Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  const w = canvas.width;
  const h = canvas.height;
  const sx = w / 1000;
  const sy = h / 720;

  // 1. Draw Office Architecture
  drawOfficeEnvironment(ctx, w, h);

  // 2. Update & Draw Characters
  characterEntities.forEach(char => {
    char.update(dt);
    char.draw(ctx, sx, sy);
  });

  // 3. Update & Draw Flying Envelopes
  for (let i = flyingEnvelopes.length - 1; i >= 0; i--) {
    const env = flyingEnvelopes[i];
    if (!env.update(dt)) {
      flyingEnvelopes.splice(i, 1);
    } else {
      env.draw(ctx, sx, sy);
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

  // Create Characters
  characterEntities = HEROES.map(h => new PixelCharacter(h));

  // Populate Bottom Dock Cards
  const dock = document.getElementById('bottomDockBar');
  if (dock) {
    dock.innerHTML = '';
    HEROES.forEach(h => {
      const card = document.createElement('div');
      card.className = `dock-card ${h.id === selectedHeroId ? 'active' : ''}`;
      card.dataset.heroId = h.id;
      card.innerHTML = `
        <div class="dock-card-avatar" style="border-color:${h.color};">
          ${h.id === 'tony-stark' ? '🦾' : (h.id === 'captain-america' ? '🛡️' : (h.id === 'hulk' ? '🟢' : (h.id === 'black-widow' ? '🕷️' : (h.id === 'thor' ? '⚡' : (h.id === 'hawkeye' ? '🏹' : (h.id === 'spider-man' ? '🕸️' : (h.id === 'doctor-strange' ? '🔮' : '💎')))))))}
        </div>
        <div class="dock-card-body">
          <div class="dock-card-top">
            <span class="dock-card-name">${h.shortName}</span>
            <span class="dock-card-tag" style="color:${h.color};">${h.tag}</span>
            <span style="font-size:9px;color:#15803D;">● idle</span>
          </div>
          <span class="dock-card-harness">${h.harness}</span>
        </div>
      `;
      card.addEventListener('click', () => selectHero(h.id));
      dock.appendChild(card);
    });
  }

  // Event Listeners
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

  // Tab switching in terminal
  document.querySelectorAll('.cc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cc-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      appendTerminalLine('system', `* Switched tab to [${activeTab.toUpperCase()}]`);
    });
  });

  // Modal Open / Close for `<> IDE`
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

  // Initial welcome terminal lines
  setTimeout(() => {
    appendTerminalLine('system', `* STARK TOWER WAR ROOM — Multi-Agent Harness Initialized.`);
    appendTerminalLine('system', `* 9 agents online across Claude, Gemini, GPT-4o, Grok, and Ollama.`);
    appendTerminalLine('action', `> Let's ask each of the 9 agents what are they up to. In short,`);
    appendTerminalLine('system', `* On it — sending each of the 9 agents a short "what are you up to?" query.`);
    appendTerminalLine('command', `  L $ cd /Users/shubhranshgupta/codebase/AIprojects/LKO/agentharness`);
    appendTerminalLine('command', `  L $ node bin/stark.js assemble --agents=9`);
    appendTerminalLine('tip', `* Ruminating.. (14s · 656 tokens) L Tip: Type a prompt below and hit Send ➔ to dispatch`);
  }, 300);
}

document.addEventListener('DOMContentLoaded', init);
