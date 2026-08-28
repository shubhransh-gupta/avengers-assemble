/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — Autonomous 2.5D Real-Time Office Simulation
   Theme: Quantum Violet, Arc Cyan, Gold & Mint (No Red)
   Engine: 60 FPS Autonomous Agent AI, Pathfinding, Speech Bubbles & VFX
   ══════════════════════════════════════════════════════════════════════ */

// Audio Synthesizer
let audioCtx = null;
let soundEnabled = true;
let simSpeed = 1;

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
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.26);
    } else if (type === 'shield') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'smash') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.41);
    } else if (type === 'thunder') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(750, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.35);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    } else if (type === 'chirp') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(940, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.13);
    }
  } catch {}
}

// Hero Definitions & Dialog Lines
const HERO_TEMPLATES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    alias: 'Iron Man',
    avatar: '🦾',
    color: '#00f0ff',
    accent: '#a855f7',
    role: 'GOD Orchestrator',
    model: 'Claude 3.7 Sonnet',
    tokenCap: '80,000 / hr',
    homeZone: 'TONY_LAB',
    dialogs: [
      "JARVIS, initialize Mark 85 armor. Deconstruct the user directive!",
      "I'm running the whole show. Arc Reactor load balancing at 99.8%.",
      "Hulk, don't break the staging database! Smash the memory leak instead.",
      "Cap, your strict TypeScript types are slowing down my repulsors. But fine, approved.",
      "Deploying DAG task graph across all 9 agents."
    ]
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    alias: 'Captain America',
    avatar: '🛡️',
    color: '#38bdf8',
    accent: '#ffffff',
    role: 'QA Commander',
    model: 'Gemini 2.5 Pro',
    tokenCap: '120,000 / hr',
    homeZone: 'CAP_BRIEFING',
    dialogs: [
      "I can do this all day. No unhandled promise rejections on my watch.",
      "Strict mode validation passing. Vibranium Shield QA stamp applied!",
      "Language, team! Clean commits only on main branch.",
      "Tony, did you run the end-to-end integration tests before merging?",
      "Formation looks solid. All test assertions green."
    ]
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    alias: 'The Hulk',
    avatar: '🟢',
    color: '#00ff66',
    accent: '#76ff03',
    role: 'Deep AST Refactorer',
    model: 'Ollama / DeepSeek-R1',
    tokenCap: 'Unlimited (Local)',
    homeZone: 'HULK_GAMMA_CORE',
    dialogs: [
      "HULK SMASH O(N^2) BOTTLENECK! REFACTOR WITH GAMMA SPEED!!",
      "Banner mode: Profiling heap memory snapshot...",
      "FOUND CIRCULAR DEPENDENCY! HULK CRUSH BUG!!",
      "That's my secret, Cap. My worker threads are always running.",
      "Memory leak annihilated. Heap usage down 64%."
    ]
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    alias: 'Black Widow',
    avatar: '🕷️',
    color: '#a855f7',
    accent: '#00ffc6',
    role: 'Security Recon',
    model: 'OpenAI GPT-4o',
    tokenCap: '60,000 / hr',
    homeZone: 'WIDOW_SECURITY_VAULT',
    dialogs: [
      "Infiltrating codebase perimeter. Scanning dependencies for zero-days.",
      "Sanitized API bearer keys in .env. Ledger clean.",
      "CVE-2026-8812 vulnerability isolated and patched.",
      "Stealth recon complete. Auth boundary 100% fortified.",
      "Hawkeye, watch my flank on the ingress proxy."
    ]
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    alias: 'God of Thunder',
    avatar: '⚡',
    color: '#00e5ff',
    accent: '#ffd700',
    role: 'DevOps & Builds',
    model: 'xAI Grok 3',
    tokenCap: '60,000 / hr',
    homeZone: 'THOR_BIFROST_INGRESS',
    dialogs: [
      "BY THE POWER OF MJOLNIR, SUMMONING THE DOCKER BIFROST!",
      "Kubernetes ingress struck by lightning! Multi-stage build forged in 4.2s.",
      "Bring me Thanos and a multi-region container cluster!",
      "CI/CD pipeline humming with thunderous high voltage.",
      "Build caches primed across all cloud regions."
    ]
  },
  'hawkeye': {
    id: 'hawkeye',
    name: 'Clint Barton',
    alias: 'Hawkeye',
    avatar: '🏹',
    color: '#ffb800',
    accent: '#7c4dff',
    role: 'Precision Testing',
    model: 'Gemini Flash 2.5',
    tokenCap: '150,000 / hr',
    homeZone: 'HAWKEYE_RANGE',
    dialogs: [
      "I played 18 test suites, I shot 18 passing assertions. Can't seem to miss.",
      "Locking on boundary conditions: null, undefined, NaN, Infinity. Bullseye!",
      "100% code coverage achieved. Target eliminated.",
      "Fired trick arrow: Async mock race conditions neutralized.",
      "Precision unit testing complete. Ready for next target."
    ]
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    alias: 'Spider-Man',
    avatar: '🕸️',
    color: '#38bdf8',
    accent: '#00ffc6',
    role: 'Frontend Hero',
    model: 'Claude 3.7 / o3-mini',
    tokenCap: '80,000 / hr',
    homeZone: 'SPIDEY_WEB_LAB',
    dialogs: [
      "Your friendly neighborhood frontend hero swinging in!",
      "Spun up accessible React components with buttery 60 FPS Tailwind animations!",
      "With great frontend power comes great responsive design responsibility!",
      "Webbed up mobile responsive grid and glassmorphism cards.",
      "Hey Mr. Stark, I fixed the dark mode toggle!"
    ]
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    alias: 'Doctor Strange',
    avatar: '🔮',
    color: '#eab308',
    accent: '#00e676',
    role: 'Multiverse Simulator',
    model: 'Claude 3.7 Thinking',
    tokenCap: '50,000 / hr',
    homeZone: 'STRANGE_SANCTUM',
    dialogs: [
      "Opening the Eye of Agamotto. Simulating 14,000,605 timelines...",
      "Reality-616 selected: Canonical high-performance architecture (98.4% success).",
      "Time Stone snapshot sealed. Instant rollback ready if build fails.",
      "Mystic runes verified. Dimensional memory sandbox active.",
      "Dormammu, I've come to resolve merge conflicts!"
    ]
  },
  'vision': {
    id: 'vision',
    name: 'Vision',
    alias: 'Synthezoid',
    avatar: '💎',
    color: '#ffd700',
    accent: '#00bfa5',
    role: 'Mind Stone Memory',
    model: 'Gemini Pro Embedding',
    tokenCap: '100,000 / hr',
    homeZone: 'VISION_MEMORY_CORE',
    dialogs: [
      "Accessing Mind Stone semantic knowledge matrix...",
      "Indexed 42 architecture conventions into persistent org memory.",
      "Synchronizing context across all 9 agent mental nodes.",
      "Order and chaos unified into 1536-dimensional vector space.",
      "Historical bug resolution patterns retrieved and applied."
    ]
  }
};

// War Room Zones / Workstations (Coordinates normalized 0-1)
const ROOM_ZONES = {
  'ARC_CORE':              { name: 'Arc Reactor Power Core', nx: 0.50, ny: 0.50, color: '#00f0ff', icon: '⚡' },
  'TONY_LAB':              { name: "Tony's Nanotech Lab", nx: 0.22, ny: 0.26, color: '#00f0ff', icon: '🦾' },
  'CAP_BRIEFING':          { name: "Cap's Briefing Table", nx: 0.78, ny: 0.26, color: '#38bdf8', icon: '🛡️' },
  'HULK_GAMMA_CORE':       { name: 'Gamma AST Testing Pad', nx: 0.16, ny: 0.74, color: '#00ff66', icon: '🟢' },
  'WIDOW_SECURITY_VAULT':   { name: 'Cyber Recon Security Vault', nx: 0.84, ny: 0.74, color: '#a855f7', icon: '🕷️' },
  'THOR_BIFROST_INGRESS':   { name: 'Bifrost Cloud Server', nx: 0.36, ny: 0.18, color: '#00e5ff', icon: '⚡' },
  'HAWKEYE_RANGE':         { name: 'Unit Test Target Range', nx: 0.64, ny: 0.18, color: '#ffb800', icon: '🏹' },
  'SPIDEY_WEB_LAB':        { name: 'Frontend Tailwind Matrix', nx: 0.32, ny: 0.82, color: '#38bdf8', icon: '🕸️' },
  'STRANGE_SANCTUM':       { name: 'Mystic Multiverse Sanctum', nx: 0.68, ny: 0.82, color: '#eab308', icon: '🔮' },
  'VISION_MEMORY_CORE':    { name: 'Mind Stone Memory Vault', nx: 0.50, ny: 0.20, color: '#ffd700', icon: '💎' },
  'ELEVATOR_GATE':         { name: 'Stark Tower Elevator Gate', nx: 0.50, ny: 0.08, color: '#a855f7', icon: '🚪' }
};

// Simulation State
let canvas, ctx;
let agents = [];
let particles = [];
let rogueBugs = [];
let speechBubbles = [];
let selectedAgent = null;
let lastTime = performance.now();
let assembleAlarm = false;

// Agent Entity Class
class AgentEntity {
  constructor(template, x, y) {
    this.template = template;
    this.id = template.id + '_' + Math.floor(Math.random()*1000);
    this.name = template.name;
    this.alias = template.alias;
    this.avatar = template.avatar;
    this.color = template.color;
    this.accent = template.accent;
    this.role = template.role;
    this.model = template.model;
    this.homeZone = template.homeZone;

    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.vx = 0;
    this.vy = 0;
    this.baseSpeed = 1.4 + Math.random() * 0.5;
    this.state = 'ROAMING'; // ROAMING, WORKING, TALKING, SMASHING, ASSEMBLED
    this.actionTimer = 0;
    this.actionDuration = 3000 + Math.random() * 4000;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.currentZoneName = 'Main Floor';
    this.facing = Math.random() > 0.5 ? 1 : -1;
    this.energyTrail = [];
    this.statusText = 'Patrolling Floor';

    this.chooseNextDestination();
  }

  chooseNextDestination() {
    if (assembleAlarm) {
      const arc = ROOM_ZONES['ARC_CORE'];
      const angle = Math.random() * Math.PI * 2;
      const radius = 60 + Math.random() * 40;
      this.targetX = (canvas.width * arc.nx) + Math.cos(angle) * radius;
      this.targetY = (canvas.height * arc.ny) + Math.sin(angle) * radius;
      this.statusText = 'Assembling at Arc Reactor Core!';
      return;
    }

    // Go to home zone or random zone
    const zoneKeys = Object.keys(ROOM_ZONES).filter(k => k !== 'ELEVATOR_GATE');
    const pickHome = Math.random() < 0.45;
    const chosenKey = pickHome ? this.homeZone : zoneKeys[Math.floor(Math.random() * zoneKeys.length)];
    const zone = ROOM_ZONES[chosenKey];

    const padding = 45;
    this.targetX = (canvas.width * zone.nx) + (Math.random() - 0.5) * padding * 2;
    this.targetY = (canvas.height * zone.ny) + (Math.random() - 0.5) * padding * 2;
    this.currentZoneName = zone.name;
    this.state = 'WALKING';
    this.statusText = `Heading to ${zone.name}`;
  }

  speak(customText = null) {
    const text = customText || this.template.dialogs[Math.floor(Math.random() * this.template.dialogs.length)];
    createSpeechBubble(this, text);
    addFeedItem(this.alias, text);
    playSfx(this.getSfxType());
  }

  getSfxType() {
    if (this.template.id === 'tony-stark') return 'repulsor';
    if (this.template.id === 'captain-america') return 'shield';
    if (this.template.id === 'hulk') return 'smash';
    if (this.template.id === 'thor') return 'thunder';
    return 'chirp';
  }

  update(dt) {
    this.bobOffset += dt * 3.5;

    // Movement Pathfinding
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      this.facing = dx > 0 ? 1 : -1;
      const speed = this.baseSpeed * simSpeed * 60 * dt;
      this.vx = (dx / dist) * speed;
      this.vy = (dy / dist) * speed;
      this.x += this.vx;
      this.y += this.vy;

      // Add energy trail for flying/fast heroes
      if (Math.random() < 0.4) {
        this.energyTrail.push({
          x: this.x,
          y: this.y + 12,
          radius: 4,
          color: this.color,
          alpha: 0.6
        });
      }
    } else {
      // Arrived at destination
      if (this.state === 'WALKING' || this.state === 'ROAMING') {
        this.state = 'WORKING';
        this.actionTimer = 0;
        this.actionDuration = 2500 + Math.random() * 3500;
        this.statusText = `Executing tasks at ${this.currentZoneName}`;

        if (Math.random() < 0.6) {
          this.triggerZoneVFX();
        }
      }
    }

    // Update Energy Trail
    for (let i = this.energyTrail.length - 1; i >= 0; i--) {
      this.energyTrail[i].alpha -= dt * 2;
      this.energyTrail[i].radius += dt * 3;
      if (this.energyTrail[i].alpha <= 0) {
        this.energyTrail.splice(i, 1);
      }
    }

    // Action timer
    if (this.state === 'WORKING') {
      this.actionTimer += dt * 1000 * simSpeed;
      if (this.actionTimer >= this.actionDuration) {
        if (!assembleAlarm) {
          this.chooseNextDestination();
        }
      }
    }
  }

  triggerZoneVFX() {
    if (this.template.id === 'tony-stark') {
      // Repulsor blast particles
      spawnParticleBurst(this.x, this.y, '#00f0ff', 12, 4);
      playSfx('repulsor');
    } else if (this.template.id === 'hulk') {
      // Gamma earth-shattering stomp
      spawnParticleBurst(this.x, this.y, '#00ff66', 20, 6);
      playSfx('smash');
    } else if (this.template.id === 'thor') {
      // Lightning arc
      spawnLightning(this.x, this.y, this.x + (Math.random()-0.5)*80, this.y - 60);
      playSfx('thunder');
    } else if (this.template.id === 'doctor-strange') {
      // Mystic orange portal runes
      spawnParticleBurst(this.x, this.y, '#ffa500', 16, 3);
    } else if (this.template.id === 'spider-man') {
      // Web strands
      spawnWebStrand(this.x, this.y, this.x, 0);
    }

    if (Math.random() < 0.35) {
      this.speak();
    }
  }

  draw(ctx) {
    // 1. Draw Energy Trail
    for (const t of this.energyTrail) {
      ctx.beginPath();
      ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = t.alpha * 0.4;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // 2. Ground Shadow & Aura
    const bob = Math.sin(this.bobOffset) * 4;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 16, 16, 7, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Glowing Character Aura Ring
    ctx.beginPath();
    ctx.arc(this.x, this.y + bob, 22, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // 3. Draw Character Avatar & Name
    ctx.save();
    ctx.translate(this.x, this.y + bob);

    // Selected indicator
    if (selectedAgent === this) {
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Emoji Avatar
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.avatar, 0, -2);

    // Name Tag
    ctx.font = '600 11px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(this.alias, 0, 22);
    ctx.shadowBlur = 0;

    // Role subtag
    ctx.font = '500 9px "JetBrains Mono", monospace';
    ctx.fillStyle = this.color;
    ctx.fillText(this.role.split(' ')[0], 0, 33);

    ctx.restore();
  }
}

// Visual Particles & Effects
function spawnParticleBurst(x, y, color, count = 12, speed = 3) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const s = Math.random() * speed + 1;
    particles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * s,
      vy: Math.sin(angle) * s,
      color: color,
      radius: Math.random() * 3 + 1.5,
      alpha: 1,
      decay: 1.5 + Math.random() * 1.5
    });
  }
}

function spawnLightning(x1, y1, x2, y2) {
  particles.push({
    type: 'lightning',
    x1, y1, x2, y2,
    alpha: 1,
    decay: 4,
    color: '#00e5ff'
  });
}

function spawnWebStrand(x1, y1, x2, y2) {
  particles.push({
    type: 'web',
    x1, y1, x2, y2,
    alpha: 1,
    decay: 1.2,
    color: 'rgba(255, 255, 255, 0.7)'
  });
}

// Speech Bubble Overlay System
function createSpeechBubble(agent, text) {
  // Remove existing bubble for agent
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', agent.color);
  bubble.style.setProperty('--bubble-glow', agent.color + '44');

  bubble.innerHTML = `
    <div class="bubble-author">${agent.alias}</div>
    <div class="bubble-text">${text}</div>
  `;

  container.appendChild(bubble);

  const bubbleObj = {
    element: bubble,
    agent: agent,
    timer: 4.5
  };
  speechBubbles.push(bubbleObj);
}

function updateSpeechBubbles(dt) {
  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];
    b.timer -= dt * simSpeed;

    if (b.timer <= 0) {
      b.element.remove();
      speechBubbles.splice(i, 1);
    } else {
      // Position bubble exactly above agent head
      b.element.style.left = b.agent.x + 'px';
      b.element.style.top = (b.agent.y - 18) + 'px';
    }
  }
}

// Live Activity Feed
function addFeedItem(author, text) {
  const feed = document.getElementById('feedItems');
  if (!feed) return;
  const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const row = document.createElement('div');
  row.className = 'feed-row';
  row.innerHTML = `<span style="color:#64748b;">[${time}]</span> <span class="author">${author}</span>: ${text}`;
  feed.appendChild(row);
  feed.scrollTop = feed.scrollHeight;

  // Limit feed items
  while (feed.children.length > 25) {
    feed.removeChild(feed.firstChild);
  }
}

// Draw the Futuristic Stark Tower Headquarters Floor Map
function drawFloorMap(ctx, w, h) {
  // 1. Grid Background
  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
  ctx.lineWidth = 1;
  const gridSize = 45;
  for (let x = 0; x < w; x += gridSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. Draw Zones / Rooms
  Object.keys(ROOM_ZONES).forEach(key => {
    const z = ROOM_ZONES[key];
    const zx = w * z.nx;
    const zy = h * z.ny;

    if (key === 'ARC_CORE') {
      // Central Arc Reactor Core Platform
      const now = performance.now() * 0.001;
      ctx.beginPath();
      ctx.arc(zx, zy, 70, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.06)';
      ctx.fill();
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating dashed energy rings
      ctx.save();
      ctx.translate(zx, zy);
      ctx.rotate(now * 0.6);
      ctx.beginPath();
      ctx.arc(0, 0, 55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();

      ctx.rotate(-now * 1.2);
      ctx.beginPath();
      ctx.arc(0, 0, 40, 0, Math.PI * 2);
      ctx.strokeStyle = '#00f0ff';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Glowing Arc Core
      ctx.beginPath();
      ctx.arc(zx, zy, 20, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 25;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = '700 11px "Space Grotesk", sans-serif';
      ctx.fillStyle = '#00f0ff';
      ctx.textAlign = 'center';
      ctx.fillText('ARC REACTOR POWER GRID', zx, zy + 88);

    } else if (key === 'ELEVATOR_GATE') {
      // Spawning Gate
      ctx.fillStyle = 'rgba(168, 85, 247, 0.12)';
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(zx - 40, zy - 15, 80, 30, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#c084fc';
      ctx.textAlign = 'center';
      ctx.fillText('🚪 ELEVATOR SPAWN GATE', zx, zy + 4);

    } else {
      // Workstation Pad
      ctx.beginPath();
      ctx.arc(zx, zy, 38, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(8, 15, 30, 0.7)';
      ctx.fill();
      ctx.strokeStyle = z.color;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Holo icon & name
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(z.icon, zx, zy - 6);

      ctx.font = '600 9.5px "Space Grotesk", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.fillText(z.name, zx, zy + 48);
    }
  });

  // 3. Draw Connecting Glowing Energy Conduits to Central Arc Core
  const arc = ROOM_ZONES['ARC_CORE'];
  const ax = w * arc.nx;
  const ay = h * arc.ny;

  ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  Object.keys(ROOM_ZONES).forEach(k => {
    if (k !== 'ARC_CORE') {
      const z = ROOM_ZONES[k];
      ctx.beginPath();
      ctx.moveTo(w * z.nx, h * z.ny);
      ctx.lineTo(ax, ay);
      ctx.stroke();
    }
  });
  ctx.setLineDash([]);
}

// Spawning Rogue CVE Bugs for Heroes to Fight
class RogueBug {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.targetX = (canvas.width * 0.5) + (Math.random() - 0.5) * 200;
    this.targetY = (canvas.height * 0.5) + (Math.random() - 0.5) * 200;
    this.speed = 1.2 * simSpeed;
    this.color = '#ff2a4d';
    this.hp = 100;
    this.alive = true;
    this.label = 'CVE-' + Math.floor(Math.random()*9000 + 1000);
  }

  update(dt) {
    if (!this.alive) return;
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      this.x += (dx / dist) * this.speed * 60 * dt;
      this.y += (dy / dist) * this.speed * 60 * dt;
    }

    // Check collision with heroes
    for (const a of agents) {
      const d = Math.hypot(a.x - this.x, a.y - this.y);
      if (d < 35) {
        this.alive = false;
        spawnParticleBurst(this.x, this.y, '#00ff87', 16, 5);
        addFeedItem(a.alias, `Eliminated threat ${this.label}!`);
        playSfx(a.getSfxType());
        break;
      }
    }
  }

  draw(ctx) {
    if (!this.alive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('👾', 0, 0);

    ctx.font = '700 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#ff2a4d';
    ctx.fillText(this.label, 0, 14);
    ctx.restore();
  }
}

// Hero Interaction & Speech Collisions
function checkAgentProximity() {
  for (let i = 0; i < agents.length; i++) {
    for (let j = i + 1; j < agents.length; j++) {
      const a1 = agents[i];
      const a2 = agents[j];
      const dist = Math.hypot(a1.x - a2.x, a1.y - a2.y);

      if (dist < 42 && a1.state !== 'TALKING' && a2.state !== 'TALKING' && Math.random() < 0.008) {
        a1.state = 'TALKING';
        a2.state = 'TALKING';
        a1.actionTimer = 0; a2.actionTimer = 0;
        a1.actionDuration = 3500; a2.actionDuration = 3500;

        a1.speak();
        setTimeout(() => {
          if (a2) a2.speak();
        }, 1200);
      }
    }
  }
}

// Inspector Card Update
function inspectAgent(agent) {
  selectedAgent = agent;
  const inspector = document.getElementById('heroInspectorCard');
  if (!inspector) return;

  inspector.style.display = 'flex';
  document.getElementById('inspAvatar').textContent = agent.avatar;
  document.getElementById('inspName').textContent = agent.name;
  document.getElementById('inspRole').textContent = agent.role;
  document.getElementById('inspModel').textContent = agent.model;
  document.getElementById('inspZone').textContent = agent.currentZoneName;
  document.getElementById('inspStatus').textContent = agent.statusText;
  document.getElementById('inspCap').textContent = agent.template.tokenCap;
}

// Spawn an extra agent clone
function spawnHero(heroId) {
  const tmpl = HERO_TEMPLATES[heroId] || Object.values(HERO_TEMPLATES)[0];
  const gate = ROOM_ZONES['ELEVATOR_GATE'];
  const startX = (canvas.width * gate.nx) + (Math.random() - 0.5) * 30;
  const startY = (canvas.height * gate.ny) + 15;

  const agent = new AgentEntity(tmpl, startX, startY);
  agents.push(agent);

  spawnParticleBurst(startX, startY, tmpl.color, 15, 4);
  playSfx('repulsor');
  addFeedItem('STARK-NET', `Spawned ${agent.alias} onto War Room floor.`);
  agent.speak("Reporting for duty!");
}

// Trigger "Scavengers Assemble" Central Huddle
function triggerAssemble() {
  assembleAlarm = !assembleAlarm;
  const btn = document.getElementById('assembleAlarmBtn');
  if (btn) {
    btn.textContent = assembleAlarm ? '⚡ Disperse Strike Team' : '⚡ Assemble Strike Team';
    btn.classList.toggle('warning', assembleAlarm);
  }

  addFeedItem('JARVIS', assembleAlarm ? '🚨 EMERGENCY DIRECTIVE: ALL HEROES ASSEMBLE!' : 'Directive complete. Resuming patrol.');
  playSfx('repulsor');

  agents.forEach(a => {
    a.chooseNextDestination();
    if (assembleAlarm) a.speak("Scavengers Assemble!");
  });
}

// Trigger Bug Invasion
function triggerBugAlert() {
  addFeedItem('SECURITY', '⚠️ INTRUSION DETECTED: Rogue CVE bugs detected on floor!');
  playSfx('thunder');

  for (let i = 0; i < 6; i++) {
    const x = Math.random() < 0.5 ? 20 : canvas.width - 20;
    const y = Math.random() * canvas.height;
    rogueBugs.push(new RogueBug(x, y));
  }

  // Guide closest heroes to attack bugs
  agents.forEach((a, i) => {
    if (rogueBugs[i % rogueBugs.length]) {
      const bug = rogueBugs[i % rogueBugs.length];
      a.targetX = bug.x;
      a.targetY = bug.y;
      a.state = 'WALKING';
      a.statusText = `Attacking ${bug.label}!`;
    }
  });
}

// Main 60 FPS Animation Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // 1. Draw Floor
  drawFloorMap(ctx, canvas.width, canvas.height);

  // 2. Update & Draw Rogue Bugs
  for (let i = rogueBugs.length - 1; i >= 0; i--) {
    const bug = rogueBugs[i];
    bug.update(dt);
    bug.draw(ctx);
    if (!bug.alive) rogueBugs.splice(i, 1);
  }

  // 3. Update & Draw Agents
  agents.forEach(agent => {
    agent.update(dt);
    agent.draw(ctx);
  });

  // Check agent interactions
  checkAgentProximity();

  // 4. Update & Draw Visual Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.alpha -= dt * (p.decay || 2);

    if (p.type === 'lightning') {
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = p.alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (p.type === 'web') {
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = p.alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else {
      p.x += p.vx * 60 * dt;
      p.y += p.vy * 60 * dt;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.alpha, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    if (p.alpha <= 0) particles.splice(i, 1);
  }

  // 5. Update HTML Speech Bubbles
  updateSpeechBubbles(dt);

  requestAnimationFrame(loop);
}

// Initialization
function initWarRoom() {
  canvas = document.getElementById('warroomCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Initialize 9 Primary Avenger Agents
  const keys = Object.keys(HERO_TEMPLATES);
  keys.forEach((k, index) => {
    const tmpl = HERO_TEMPLATES[k];
    const zone = ROOM_ZONES[tmpl.homeZone] || ROOM_ZONES['ARC_CORE'];
    const startX = (canvas.width * zone.nx) + (Math.random() - 0.5) * 40;
    const startY = (canvas.height * zone.ny) + (Math.random() - 0.5) * 40;
    const agent = new AgentEntity(tmpl, startX, startY);
    agents.push(agent);
  });

  // Populate Spawn Dock
  const dock = document.getElementById('dockHeroList');
  if (dock) {
    dock.innerHTML = '';
    keys.forEach(k => {
      const tmpl = HERO_TEMPLATES[k];
      const chip = document.createElement('div');
      chip.className = 'hero-spawn-chip';
      chip.innerHTML = `<span>${tmpl.avatar}</span> <span>${tmpl.alias}</span>`;
      chip.addEventListener('click', () => spawnHero(k));
      dock.appendChild(chip);
    });
  }

  // Canvas Click Handler: Select hero or direct them
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked an agent
    let clicked = null;
    for (const a of agents) {
      if (Math.hypot(a.x - clickX, a.y - clickY) < 28) {
        clicked = a;
        break;
      }
    }

    if (clicked) {
      inspectAgent(clicked);
      clicked.speak();
    } else if (selectedAgent) {
      // Direct selected agent to walk to click position
      selectedAgent.targetX = clickX;
      selectedAgent.targetY = clickY;
      selectedAgent.state = 'WALKING';
      selectedAgent.statusText = `Dispatched to coordinates (${Math.round(clickX)}, ${Math.round(clickY)})`;
      addFeedItem(selectedAgent.alias, `Moving to target coordinates.`);
      playSfx('repulsor');
    }
  });

  // Start Autonomous Loop
  requestAnimationFrame(loop);

  // Initial welcome message
  setTimeout(() => {
    addFeedItem('JARVIS', 'Stark Tower War Room 60 FPS Autonomous Simulation Initialized.');
    agents[0].speak("All systems nominal. Let's build something extraordinary.");
  }, 600);
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initWarRoom();

  // Control Listeners
  const assembleBtn = document.getElementById('assembleAlarmBtn');
  if (assembleBtn) assembleBtn.addEventListener('click', triggerAssemble);

  const bugBtn = document.getElementById('spawnBugBtn');
  if (bugBtn) bugBtn.addEventListener('click', triggerBugAlert);

  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = soundEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
    });
  }

  const speedBtn = document.getElementById('speedToggleBtn');
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      simSpeed = simSpeed === 1 ? 2 : (simSpeed === 2 ? 5 : 1);
      speedBtn.textContent = `⚡ Speed: ${simSpeed}x`;
    });
  }

  // Custom directive dispatch in inspector
  const sendTaskBtn = document.getElementById('inspSendTaskBtn');
  const taskInput = document.getElementById('inspTaskInput');
  if (sendTaskBtn && taskInput) {
    sendTaskBtn.addEventListener('click', () => {
      if (selectedAgent && taskInput.value.trim()) {
        selectedAgent.speak(`Directive acknowledged: "${taskInput.value.trim()}"`);
        taskInput.value = '';
      }
    });
  }
});
