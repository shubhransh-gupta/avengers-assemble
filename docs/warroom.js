/* ══════════════════════════════════════════════════════════════════════
   STARK TOWER WAR ROOM — Munder-Difflin Style Office Floor Engine
   Features: Dedicated Desks, Glowing Monitors, Flying Envelopes,
   Roaming Avatars, Coffee Breaks, Typewriter Speech Bubbles & VFX
   ══════════════════════════════════════════════════════════════════════ */

let canvas, ctx;
let audioCtx = null;
let soundEnabled = true;
let simSpeed = 1;
let lastTime = performance.now();
let selectedHero = null;

// Audio Synthesizer (Web Audio API)
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
      // Whoosh envelope flying
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.16);
    } else if (type === 'pop') {
      // Speech bubble pop
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.08);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'typing') {
      // Subtle mechanical keyboard clack
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random()*120, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.045);
    } else if (type === 'repulsor') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.26);
    } else if (type === 'smash') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(now); osc.stop(now + 0.36);
    }
  } catch {}
}

// 9 Hero Workstations & Metadata
const HERO_ROSTER = [
  {
    id: 'tony-stark',
    name: 'Tony Stark',
    alias: 'Iron Man (Boss / Orchestrator)',
    avatar: '🦾',
    color: '#00D4FF',
    deskX: 0.18, deskY: 0.24,
    role: 'Lead GOD Orchestrator',
    model: 'Claude 3.7 Sonnet / Claude Code',
    tokenCap: '80,000 / hr',
    accessory: 'Mark 85 Helmet',
    dialogs: [
      "JARVIS, dispatch master task graph to all workstations.",
      "Arc Reactor power grid balance: 99.8% optimal. No 429s allowed.",
      "Hulk, refactor the sorting algorithm. Cap, audit the types.",
      "Just deployed 6 parallel directives in 420ms."
    ]
  },
  {
    id: 'captain-america',
    name: 'Steve Rogers',
    alias: 'Captain America',
    avatar: '🛡️',
    color: '#38BDF8',
    deskX: 0.82, deskY: 0.24,
    role: 'QA Commander & Standards',
    model: 'Gemini 2.5 Pro',
    tokenCap: '120,000 / hr',
    accessory: 'Vibranium Shield',
    dialogs: [
      "I can do this all day. No unhandled promise rejections on my watch.",
      "Vibranium Shield QA Stamp applied: 100% strict type safety verified.",
      "Language, team! Clean commits only on main branch.",
      "Pull request audited. Zero memory leaks detected."
    ]
  },
  {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    alias: 'The Hulk',
    avatar: '🟢',
    color: '#4ADE80',
    deskX: 0.15, deskY: 0.58,
    role: 'Deep AST Refactorer',
    model: 'Ollama / DeepSeek-R1 (Local)',
    tokenCap: 'Unlimited (Local)',
    accessory: 'Gamma Test Tube',
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
    alias: 'Black Widow',
    avatar: '🕷️',
    color: '#A855F7',
    deskX: 0.85, deskY: 0.58,
    role: 'Security Recon & CVE Audit',
    model: 'OpenAI GPT-4o',
    tokenCap: '60,000 / hr',
    accessory: 'Encrypted Flash Drive',
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
    alias: 'God of Thunder',
    avatar: '⚡',
    color: '#00E5FF',
    deskX: 0.32, deskY: 0.20,
    role: 'DevOps & Lightning Builds',
    model: 'xAI Grok 3',
    tokenCap: '60,000 / hr',
    accessory: 'Mjolnir Paperweight',
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
    alias: 'Hawkeye',
    avatar: '🏹',
    color: '#FFCA54',
    deskX: 0.68, deskY: 0.20,
    role: 'Precision Unit Testing',
    model: 'Gemini Flash 2.5',
    tokenCap: '150,000 / hr',
    accessory: 'Recurve Bow Stand',
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
    alias: 'Spider-Man',
    avatar: '🕸️',
    color: '#38BDF8',
    deskX: 0.25, deskY: 0.78,
    role: 'Frontend Hero & UI/UX',
    model: 'Claude 3.7 / o3-mini',
    tokenCap: '80,000 / hr',
    accessory: 'Web Fluid Canister',
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
    alias: 'Doctor Strange',
    avatar: '🔮',
    color: '#F59E0B',
    deskX: 0.75, deskY: 0.78,
    role: 'Multiverse Simulator',
    model: 'Claude 3.7 Thinking',
    tokenCap: '50,000 / hr',
    accessory: 'Eye of Agamotto',
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
    alias: 'Synthezoid',
    avatar: '💎',
    color: '#FFD700',
    deskX: 0.50, deskY: 0.80,
    role: 'Mind Stone Memory',
    model: 'Gemini Pro Embedding',
    tokenCap: '100,000 / hr',
    accessory: 'Solar Mind Crystal',
    dialogs: [
      "Accessing Mind Stone semantic knowledge matrix...",
      "Indexed 42 architecture conventions into persistent org memory.",
      "Synchronizing context across all 9 agent mental nodes.",
      "Historical bug resolution patterns retrieved and applied."
    ]
  }
];

// Special Office Landmarks
const OFFICE_LANDMARKS = {
  'CONFERENCE_TABLE': { name: 'Arc Reactor Conference Table', nx: 0.50, ny: 0.46 },
  'WATER_COOLER':     { name: 'Office Water Cooler & Coffee Bar', nx: 0.50, ny: 0.16 },
  'SERVER_RACK':       { name: 'High-Density Server Ingress', nx: 0.08, ny: 0.20 },
  'SECURITY_VAULT':    { name: 'Encrypted Security Terminal', nx: 0.92, ny: 0.20 }
};

// Simulation Entity Classes
class FlyingEnvelope {
  constructor(x1, y1, x2, y2, color, onArrival) {
    this.x1 = x1; this.y1 = y1;
    this.x2 = x2; this.y2 = y2;
    this.color = color || '#00D4FF';
    this.progress = 0;
    this.speed = 1.6;
    this.onArrival = onArrival;
    this.curveHeight = -40 - Math.random() * 30;
    playSfx('envelope');
  }

  update(dt) {
    this.progress += dt * this.speed * simSpeed;
    if (this.progress >= 1) {
      if (this.onArrival) this.onArrival();
      return false; // remove
    }
    return true;
  }

  draw(ctx) {
    const t = this.progress;
    // Quadratic bezier curve
    const cx = (this.x1 + this.x2) / 2;
    const cy = Math.min(this.y1, this.y2) + this.curveHeight;

    const x = (1-t)*(1-t)*this.x1 + 2*(1-t)*t*cx + t*t*this.x2;
    const y = (1-t)*(1-t)*this.y1 + 2*(1-t)*t*cy + t*t*this.y2;

    // Glowing Trail
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Envelope Icon
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✉️', x, y - 2);
  }
}

class AgentAvatar {
  constructor(data) {
    this.data = data;
    this.id = data.id;
    this.name = data.name;
    this.alias = data.alias;
    this.avatar = data.avatar;
    this.color = data.color;
    this.role = data.role;
    this.model = data.model;

    this.homeX = 0;
    this.homeY = 0;
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.state = 'AT_DESK'; // AT_DESK, WALKING, WATER_COOLER, TALKING, SMASHING
    this.stateTimer = 2000 + Math.random() * 4000;
    this.bob = Math.random() * Math.PI * 2;
    this.typingTimer = 0;
    this.codeParticles = [];
    this.statusTag = 'CODING';
  }

  initPositions(w, h) {
    this.homeX = w * this.data.deskX;
    this.homeY = h * this.data.deskY;
    this.x = this.homeX;
    this.y = this.homeY;
    this.targetX = this.homeX;
    this.targetY = this.homeY;
  }

  speak(customText = null) {
    const text = customText || this.data.dialogs[Math.floor(Math.random() * this.data.dialogs.length)];
    createSpeechBubble(this, text);
    addDrawerLog(this.alias.split(' ')[0], text);
    playSfx('pop');
  }

  update(dt) {
    this.bob += dt * 4;

    // Movement
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 5) {
      const speed = 75 * simSpeed * dt;
      this.x += (dx / dist) * speed;
      this.y += (dy / dist) * speed;
      this.state = 'WALKING';
    } else {
      if (this.state === 'WALKING') {
        // Arrived
        if (Math.hypot(this.x - this.homeX, this.y - this.homeY) < 10) {
          this.state = 'AT_DESK';
          this.statusTag = 'CODING';
        } else {
          this.state = 'WATER_COOLER';
          this.statusTag = 'COFFEE BREAK';
          if (Math.random() < 0.6) this.speak("Refueling coffee at the water cooler.");
        }
      }
    }

    // State machine logic
    this.stateTimer -= dt * 1000 * simSpeed;
    if (this.stateTimer <= 0) {
      if (this.state === 'AT_DESK') {
        // Occasionally take a break or walk to water cooler
        if (Math.random() < 0.35) {
          const cooler = OFFICE_LANDMARKS['WATER_COOLER'];
          this.targetX = canvas.width * cooler.nx + (Math.random() - 0.5) * 60;
          this.targetY = canvas.height * cooler.ny + (Math.random() - 0.5) * 30;
          this.stateTimer = 4000 + Math.random() * 4000;
        } else {
          this.stateTimer = 5000 + Math.random() * 6000;
          if (Math.random() < 0.4) this.speak();
        }
      } else {
        // Return to desk
        this.targetX = this.homeX;
        this.targetY = this.homeY;
        this.stateTimer = 6000 + Math.random() * 8000;
      }
    }

    // Code particles at desk
    if (this.state === 'AT_DESK') {
      this.typingTimer += dt;
      if (this.typingTimer > 0.4) {
        this.typingTimer = 0;
        if (Math.random() < 0.5) {
          this.codeParticles.push({
            x: this.x + (Math.random()-0.5)*16,
            y: this.y - 12,
            vy: -15 - Math.random()*20,
            text: ['0', '1', '{}', '=>', 'TS', 'OK', '✔'][Math.floor(Math.random()*7)],
            alpha: 1
          });
        }
      }
    }

    // Update code particles
    for (let i = this.codeParticles.length - 1; i >= 0; i--) {
      const p = this.codeParticles[i];
      p.y += p.vy * dt;
      p.alpha -= dt * 1.5;
      if (p.alpha <= 0) this.codeParticles.splice(i, 1);
    }
  }

  draw(ctx) {
    // 1. Draw Code particles
    for (const p of this.codeParticles) {
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = this.color;
      ctx.globalAlpha = p.alpha * 0.8;
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    }

    const bobY = this.state === 'WALKING' ? Math.sin(this.bob) * 3 : 0;

    // 2. Selected Halo
    if (selectedHero === this) {
      ctx.beginPath();
      ctx.arc(this.x, this.y - 4 + bobY, 20, 0, Math.PI * 2);
      ctx.strokeStyle = '#FFCA54';
      ctx.lineWidth = 2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 3. Avatar Shadow & Body
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 12, 5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Emoji Character
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.avatar, this.x, this.y - 4 + bobY);

    // Name Label
    ctx.font = '600 10px "Space Grotesk", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(this.alias.split(' ')[0], this.x, this.y + 18);

    // Status Tag pill
    ctx.font = '700 8px "JetBrains Mono", monospace';
    ctx.fillStyle = this.color;
    ctx.fillText(this.statusTag, this.x, this.y + 28);
  }
}

// Global Simulation Store
let agents = [];
let flyingEnvelopes = [];
let speechBubbles = [];

// Draw Office Desks, Carpets & Furniture
function drawOfficeFloor(ctx, w, h) {
  // 1. Floor Background & Subtle Tile Grid
  ctx.fillStyle = '#080B12';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = '#121722';
  ctx.lineWidth = 1;
  const tileSize = 38;
  for (let x = 0; x < w; x += tileSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += tileSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 2. Central Conference Carpet Area
  const conf = OFFICE_LANDMARKS['CONFERENCE_TABLE'];
  const cx = w * conf.nx;
  const cy = h * conf.ny;

  ctx.beginPath();
  ctx.ellipse(cx, cy, 140, 85, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#0D111A';
  ctx.fill();
  ctx.strokeStyle = '#232B3A';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glass Conference Table with Glowing Center
  ctx.beginPath();
  ctx.ellipse(cx, cy, 90, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 212, 255, 0.05)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 212, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Glowing Mini Arc Core in Conference Table
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#00D4FF';
  ctx.shadowColor = '#00D4FF';
  ctx.shadowBlur = 18;
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = '700 9px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#00D4FF';
  ctx.textAlign = 'center';
  ctx.fillText('STARK WAR ROOM HUB', cx, cy + 32);

  // 3. Water Cooler Area
  const cooler = OFFICE_LANDMARKS['WATER_COOLER'];
  const kx = w * cooler.nx;
  const ky = h * cooler.ny;

  ctx.fillStyle = '#121722';
  ctx.beginPath();
  ctx.roundRect(kx - 35, ky - 18, 70, 36, 6);
  ctx.fill();
  ctx.strokeStyle = '#232B3A';
  ctx.stroke();

  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🚰', kx - 12, ky + 2);
  ctx.fillText('☕', kx + 14, ky + 2);

  ctx.font = '600 8.5px "JetBrains Mono", monospace';
  ctx.fillStyle = '#A7B0C0';
  ctx.fillText('BREAK ZONE', kx, ky + 28);

  // 4. Draw Individual Hero Desks
  HERO_ROSTER.forEach(hero => {
    const dx = w * hero.deskX;
    const dy = h * hero.deskY;

    // Desk Carpet mat
    ctx.fillStyle = '#0F1420';
    ctx.beginPath();
    ctx.roundRect(dx - 32, dy - 26, 64, 52, 6);
    ctx.fill();
    ctx.strokeStyle = '#182030';
    ctx.stroke();

    // Wooden Desk Top
    ctx.fillStyle = '#1A2336';
    ctx.beginPath();
    ctx.roundRect(dx - 26, dy - 18, 52, 26, 4);
    ctx.fill();
    ctx.strokeStyle = hero.color;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Glowing Computer Monitor
    ctx.fillStyle = '#0A0D14';
    ctx.beginPath();
    ctx.roundRect(dx - 12, dy - 16, 24, 12, 2);
    ctx.fill();

    // Screen Glow
    ctx.fillStyle = hero.color;
    ctx.globalAlpha = 0.7;
    ctx.fillRect(dx - 10, dy - 14, 20, 8);
    ctx.globalAlpha = 1;

    // Swivel Chair
    ctx.beginPath();
    ctx.arc(dx, dy + 14, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#232B3A';
    ctx.fill();
    ctx.strokeStyle = '#303B52';
    ctx.stroke();
  });
}

// HTML Speech Bubble Overlay
function createSpeechBubble(agent, text) {
  const container = document.getElementById('speechBubbleLayer');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'speech-bubble';
  bubble.style.setProperty('--bubble-color', agent.color);

  bubble.innerHTML = `
    <div class="bubble-author">${agent.alias.split(' ')[0]}</div>
    <div class="bubble-text">${text}</div>
  `;

  container.appendChild(bubble);

  speechBubbles.push({
    element: bubble,
    agent: agent,
    timer: 4.0
  });
}

function updateSpeechBubbles(dt) {
  for (let i = speechBubbles.length - 1; i >= 0; i--) {
    const b = speechBubbles[i];
    b.timer -= dt * simSpeed;
    if (b.timer <= 0) {
      b.element.remove();
      speechBubbles.splice(i, 1);
    } else {
      b.element.style.left = b.agent.x + 'px';
      b.element.style.top = (b.agent.y - 12) + 'px';
    }
  }
}

// Side Drawer Logs
function addDrawerLog(author, text) {
  const feed = document.getElementById('drawerFeed');
  if (!feed) return;
  const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const div = document.createElement('div');
  div.className = 'drawer-row';
  div.innerHTML = `<span style="color:#717A8C;">[${time}]</span> <span class="author">${author}</span>: ${text}`;
  feed.appendChild(div);
  feed.scrollTop = feed.scrollHeight;

  while (feed.children.length > 30) {
    feed.removeChild(feed.firstChild);
  }
}

// Dispatch Mission & Launch Envelopes
function dispatchMission(customPrompt) {
  const prompt = customPrompt || document.getElementById('commandInput')?.value || 'Deconstruct authentication microservice into DAG directives';
  const tony = agents.find(a => a.id === 'tony-stark');
  if (!tony) return;

  playSfx('repulsor');
  tony.speak(`Assembling Strike Team for: "${prompt}"`);
  addDrawerLog('JARVIS', `Master prompt assigned to Tony Stark.`);

  // Launch envelopes from Tony to other heroes
  setTimeout(() => {
    agents.forEach((agent, i) => {
      if (agent.id !== 'tony-stark') {
        setTimeout(() => {
          flyingEnvelopes.push(new FlyingEnvelope(tony.x, tony.y, agent.x, agent.y, agent.color, () => {
            agent.state = 'AT_DESK';
            agent.targetX = agent.homeX;
            agent.targetY = agent.homeY;
            agent.statusTag = 'EXECUTING';
            agent.speak(`Directive received! Running ${agent.model}`);
            playSfx('typing');
          }));
        }, i * 160);
      }
    });
  }, 500);
}

// Inspect Hero on Click
function inspectAgent(agent) {
  selectedHero = agent;
  const card = document.getElementById('heroInspectorCard');
  if (!card) return;

  card.style.display = 'flex';
  document.getElementById('inspAvatar').textContent = agent.avatar;
  document.getElementById('inspName').textContent = agent.name;
  document.getElementById('inspRole').textContent = agent.role;
  document.getElementById('inspModel').textContent = agent.model;
  document.getElementById('inspCap').textContent = agent.data.tokenCap;
  document.getElementById('inspAccessory').textContent = agent.data.accessory;
  document.getElementById('inspStatus').textContent = agent.statusTag;
}

// 60 FPS Loop
function loop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  // 1. Draw Office Floor
  drawOfficeFloor(ctx, canvas.width, canvas.height);

  // 2. Update & Draw Flying Envelopes
  for (let i = flyingEnvelopes.length - 1; i >= 0; i--) {
    const env = flyingEnvelopes[i];
    if (!env.update(dt)) {
      flyingEnvelopes.splice(i, 1);
    } else {
      env.draw(ctx);
    }
  }

  // 3. Update & Draw Agents
  agents.forEach(a => {
    a.update(dt);
    a.draw(ctx);
  });

  // 4. Update Speech Bubbles
  updateSpeechBubbles(dt);

  requestAnimationFrame(loop);
}

// Initialize
function initOffice() {
  canvas = document.getElementById('warroomCanvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    agents.forEach(a => a.initPositions(canvas.width, canvas.height));
  }

  // Create 9 Agents
  agents = HERO_ROSTER.map(data => new AgentAvatar(data));
  resize();
  window.addEventListener('resize', resize);

  // Click on agent to inspect
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let clicked = null;
    for (const a of agents) {
      if (Math.hypot(a.x - x, a.y - y) < 26) {
        clicked = a;
        break;
      }
    }

    if (clicked) {
      inspectAgent(clicked);
      clicked.speak();
    } else if (selectedHero) {
      selectedHero.targetX = x;
      selectedHero.targetY = y;
      selectedHero.state = 'WALKING';
      selectedHero.statusTag = 'DISPATCHED';
      playSfx('typing');
    }
  });

  requestAnimationFrame(loop);

  // Auto-welcome
  setTimeout(() => {
    addDrawerLog('JARVIS', 'Stark Tower Autonomous Office Floor online.');
    agents[0].speak("Office floor initialized. All 9 agents at stations.");
  }, 400);
}

document.addEventListener('DOMContentLoaded', () => {
  initOffice();

  const dispatchBtn = document.getElementById('dispatchMissionBtn');
  if (dispatchBtn) dispatchBtn.addEventListener('click', () => dispatchMission());

  const cmdInput = document.getElementById('commandInput');
  if (cmdInput) {
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') dispatchMission();
    });
  }

  const assembleBtn = document.getElementById('assembleAllBtn');
  if (assembleBtn) {
    assembleBtn.addEventListener('click', () => {
      const conf = OFFICE_LANDMARKS['CONFERENCE_TABLE'];
      addDrawerLog('CAP', 'All agents assemble at Conference Table!');
      agents.forEach((a, i) => {
        const angle = (Math.PI * 2 / agents.length) * i;
        a.targetX = canvas.width * conf.nx + Math.cos(angle) * 75;
        a.targetY = canvas.height * conf.ny + Math.sin(angle) * 45;
        a.state = 'WALKING';
        a.statusTag = 'ASSEMBLED';
      });
      agents[0].speak("Scavengers Assemble!");
      playSfx('repulsor');
    });
  }

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
});
