/* ══════════════════════════════════════════════════════════════════════
   STARKNET / AVENGERS ASSEMBLE — Character Selector Logic & Audio SFX
   Theme: Quantum Violet, Arc Cyan, Vibranium Gold & Mint (No Red)
   ══════════════════════════════════════════════════════════════════════ */

const HEROES_DATA = [
  {
    id: 'tony-stark',
    name: 'Tony Stark',
    alias: 'Iron Man / JARVIS',
    avatar: '🦾',
    role: 'Lead GOD Orchestrator',
    rank: 'Omega-Class // Master Orchestrator',
    primaryColor: '#00F0FF',
    accentColor: '#A855F7',
    dimColor: 'rgba(0, 240, 255, 0.16)',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    weapon: 'Mark 85 Nanotech Armor & Arc Reactor Core v9',
    preferredModel: 'Claude 3.7 Sonnet / Claude Code',
    specialty: 'Task Decomposition & DAG Directive Scheduling',
    tokenCap: '80,000 / hr',
    hourlyLimit: '5h Rolling Sub',
    quote: '"I told you. I don\'t want to join your super-secret boy band. I\'m running the whole damn show."',
    defaultPrompt: 'Decompose full-stack authentication microservice into DAG tasks',
    stats: {
      velocity: 98,
      security: 92,
      precision: 94,
      refactor: 96,
      stability: 99,
      quantum: 100
    },
    sfx: 'repulsor',
    logs: [
      '[JARVIS]: Mark 85 Architecture Matrix initialized.',
      '[TONY]: Analyzing master prompt parameter...',
      '[TONY]: 6 discrete directives formulated & scheduled.',
      '[TONY]: Arc Reactor grid load balanced across all 9 heroes.',
      '[TELEMETRY]: Optimal DAG path verified. Dispatching mesh!'
    ]
  },
  {
    id: 'captain-america',
    name: 'Captain America',
    alias: 'Steve Rogers',
    avatar: '🛡️',
    role: 'QA Commander & Standards Enforcer',
    rank: 'Alpha-Class // Standards Enforcer',
    primaryColor: '#38BDF8',
    accentColor: '#FFFFFF',
    dimColor: 'rgba(56, 189, 248, 0.16)',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    weapon: 'Vibranium Shield & Strict TypeScript Linter',
    preferredModel: 'Gemini 2.5 Pro / Antigravity',
    specialty: 'Rigorous Code Review & Strict Type Safety Sign-Off',
    tokenCap: '120,000 / hr',
    hourlyLimit: 'Hourly Quota',
    quote: '"I can do this all day. No unhandled promise rejections on my watch, soldier."',
    defaultPrompt: 'Audit pull request for race conditions, memory leaks, and TypeScript strict mode',
    stats: {
      velocity: 88,
      security: 98,
      precision: 99,
      refactor: 90,
      stability: 100,
      quantum: 92
    },
    sfx: 'shield',
    logs: [
      '[CAP]: Sound off, team. Commencing strict standards audit.',
      '[CAP]: Inspecting AST trees for unhandled edge cases...',
      '[CAP]: Verified zero type escapes (no `any` without permit).',
      '[CAP]: Clean architecture & pure function boundaries verified.',
      '[CAP]: Vibranium Shield QA Stamp: APPROVED (100% Score).'
    ]
  },
  {
    id: 'hulk',
    name: 'Bruce Banner & Hulk',
    alias: 'Dr. Banner / The Hulk',
    avatar: '🟢',
    role: 'Deep AST Debugger & Gamma Refactorer',
    rank: 'Omega-Class // Gamma Performance Engine',
    primaryColor: '#00FF66',
    accentColor: '#76FF03',
    dimColor: 'rgba(0, 255, 102, 0.16)',
    glowColor: 'rgba(0, 255, 102, 0.65)',
    weapon: 'Gamma Radiation Core & AST Memory Smasher',
    preferredModel: 'Ollama / DeepSeek-R1 (Local)',
    specialty: 'O(N²) Bottleneck Smashing & Memory Leak Elimination',
    tokenCap: 'Unlimited (Local)',
    hourlyLimit: 'Local Hardware',
    quote: '"That\'s my secret, Cap. My code is always running."',
    defaultPrompt: 'Smash O(N^2) sorting bottlenecks and eliminate circular dependency memory leak',
    stats: {
      velocity: 95,
      security: 85,
      precision: 90,
      refactor: 100,
      stability: 89,
      quantum: 97
    },
    sfx: 'hulk',
    logs: [
      '[BANNER]: Analyzing memory heap snapshot and hot paths...',
      '[BANNER]: Found nested recursion causing stack overflow at N=10k.',
      '[HULK]: HULK SMASH BOTTLENECK!! REFACTORING WITH GAMMA SPEED!!',
      '[HULK]: Replaced O(N^2) nested loop with O(1) hash map lookup.',
      '[HULK]: 3 memory leaks crushed. Zero CPU throttling!'
    ]
  },
  {
    id: 'thor',
    name: 'Thor Odinson',
    alias: 'God of Thunder',
    avatar: '⚡',
    role: 'DevOps & Lightning Builds',
    rank: 'Omega-Class // Cloud Bifrost Architect',
    primaryColor: '#00E5FF',
    accentColor: '#FFD700',
    dimColor: 'rgba(0, 229, 255, 0.16)',
    glowColor: 'rgba(0, 229, 255, 0.65)',
    weapon: 'Mjolnir & Multi-Stage Docker Bifrost Builder',
    preferredModel: 'xAI Grok 3 / AWS Bedrock',
    specialty: 'Multi-Stage Dockerfiles, Kubernetes & CI/CD Ingress',
    tokenCap: '60,000 / hr',
    hourlyLimit: 'API Tier',
    quote: '"Bring me Thanos! ...and a production-grade Kubernetes cluster with automated ingress!"',
    defaultPrompt: 'Generate high-voltage multi-stage Dockerfile and GitHub Actions CI/CD matrix',
    stats: {
      velocity: 99,
      security: 90,
      precision: 88,
      refactor: 92,
      stability: 98,
      quantum: 95
    },
    sfx: 'thunder',
    logs: [
      '[THOR]: By the thunder of Mjolnir, summoning the Bifrost!',
      '[THOR]: Forging multi-stage Docker build cache layers...',
      '[THOR]: Calibrating Kubernetes ingress & horizontal pod autoscalers.',
      '[THOR]: High-voltage stress test executed: 50,000 req/sec sustained.',
      '[THOR]: Infrastructure ready. Cloud deployment struck by lightning!'
    ]
  },
  {
    id: 'black-widow',
    name: 'Black Widow',
    alias: 'Natasha Romanoff',
    avatar: '🕷️',
    role: 'Master of Security Recon & CVE Audit',
    rank: 'Alpha-Class // Stealth Audit & Defense',
    primaryColor: '#A855F7',
    accentColor: '#00FFC6',
    dimColor: 'rgba(168, 85, 247, 0.16)',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    weapon: 'Widow\'s Bite Taser & .env Secret Sanitizer',
    preferredModel: 'OpenAI GPT-4o / Codex',
    specialty: 'CVE Scanning, Zero-Day Defense, Sanitization',
    tokenCap: '60,000 / hr',
    hourlyLimit: 'Tier 4 TPM',
    quote: '"I\'ve got red in my ledger. I\'d like to wipe it out by patching every zero-day CVE."',
    defaultPrompt: 'Perform penetration test on auth perimeter and sanitize API credentials',
    stats: {
      velocity: 94,
      security: 100,
      precision: 96,
      refactor: 88,
      stability: 95,
      quantum: 91
    },
    sfx: 'taser',
    logs: [
      '[WIDOW]: Infiltrating codebase perimeter under stealth mode.',
      '[WIDOW]: Scanning third-party dependencies against OWASP databases...',
      '[WIDOW]: 2 unpinned transitive vulnerabilities isolated & patched.',
      '[WIDOW]: Masked API keys & sanitised bearer tokens in .env.',
      '[WIDOW]: Ledger clean. System secured with 0 exposed vectors.'
    ]
  },
  {
    id: 'hawkeye',
    name: 'Hawkeye',
    alias: 'Clint Barton',
    avatar: '🏹',
    role: 'Precision Sniper Unit Testing',
    rank: 'Alpha-Class // 100% Coverage Sniper',
    primaryColor: '#FFB800',
    accentColor: '#7C4DFF',
    dimColor: 'rgba(255, 184, 0, 0.16)',
    glowColor: 'rgba(255, 184, 0, 0.65)',
    weapon: 'Recurve Bow & 100% Boundary Trick Arrows',
    preferredModel: 'Gemini 2.5 Flash / Flash-Lite',
    specialty: 'Edge-Case Hunter, Null-Safety & Property-Based Tests',
    tokenCap: '150,000 / hr',
    hourlyLimit: 'High TPM Quota',
    quote: '"I played 18 tests, I shot 18 passing assertions. I can\'t seem to miss."',
    defaultPrompt: 'Generate exhaustive boundary condition unit test suite with 100% coverage',
    stats: {
      velocity: 93,
      security: 91,
      precision: 100,
      refactor: 86,
      stability: 96,
      quantum: 89
    },
    sfx: 'arrow',
    logs: [
      '[HAWKEYE]: Locking on target. Drawing precision trick arrow.',
      '[HAWKEYE]: Firing boundary assertions: null, undefined, NaN, Infinity.',
      '[HAWKEYE]: Tested async race conditions & network timeout fallbacks.',
      '[HAWKEYE]: 24/24 unit test assertions executed without failure.',
      '[HAWKEYE]: Bullseye. 100% code coverage achieved.'
    ]
  },
  {
    id: 'spider-man',
    name: 'Spider-Man',
    alias: 'Peter Parker',
    avatar: '🕸️',
    role: 'Frontend Hero & UI/UX Specialist',
    rank: 'Alpha-Class // React & Tailwind Matrix',
    primaryColor: '#38BDF8',
    accentColor: '#00FFC6',
    dimColor: 'rgba(56, 189, 248, 0.16)',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    weapon: 'Web-Shooters & Reactive Tailwind/Next.js Matrix',
    preferredModel: 'Claude 3.7 Sonnet / OpenAI o3-mini',
    specialty: 'Next.js, Framer Motion Micro-Interactions & Generative UI',
    tokenCap: '80,000 / hr',
    hourlyLimit: 'Pro Subscription',
    quote: '"With great frontend power comes great responsive design responsibility!"',
    defaultPrompt: 'Build reactive glassmorphic dashboard component with Tailwind and Framer Motion',
    stats: {
      velocity: 97,
      security: 88,
      precision: 92,
      refactor: 94,
      stability: 93,
      quantum: 96
    },
    sfx: 'web',
    logs: [
      '[SPIDEY]: Your friendly neighborhood frontend hero swinging in!',
      '[SPIDEY]: Spinning up accessible, WCAG-compliant React components...',
      '[SPIDEY]: Applying Tailwind CSS classes with dark/light mode tokens.',
      '[SPIDEY]: Hooked up 60 FPS micro-animations and responsive flex layout.',
      '[SPIDEY]: Web components spun, styled, and super reactive!'
    ]
  },
  {
    id: 'doctor-strange',
    name: 'Doctor Strange',
    alias: 'Stephen Strange',
    avatar: '🔮',
    role: 'Multiverse Simulator & Time Stone Master',
    rank: 'Cosmic-Class // Sorcerer Supreme',
    primaryColor: '#EAB308',
    accentColor: '#00E676',
    dimColor: 'rgba(234, 179, 8, 0.16)',
    glowColor: 'rgba(234, 179, 8, 0.65)',
    weapon: 'Eye of Agamotto & 14,000,605 Timeline Sandboxes',
    preferredModel: 'Claude 3.7 Sonnet (Thinking Mode)',
    specialty: 'Parallel Multiverse Simulation & Instant Time Stone Rollback',
    tokenCap: '50,000 / hr',
    hourlyLimit: 'Reasoning Quota',
    quote: '"I went forward in time to view alternate realities. To see all 14,000,605 possible outcomes of your pull request."',
    defaultPrompt: 'Simulate 3 competing microservice architectures and select highest probability timeline',
    stats: {
      velocity: 91,
      security: 96,
      precision: 97,
      refactor: 95,
      stability: 97,
      quantum: 100
    },
    sfx: 'mystic',
    logs: [
      '[STRANGE]: Opening the Eye of Agamotto. Unfolding timeline matrix...',
      '[STRANGE]: Reality-616: Canonical High-Performance (98.4% success)',
      '[STRANGE]: Reality-838: Extreme Redundancy Multi-Cluster (88.2% success)',
      '[STRANGE]: Reality-199999: Hyper-Parallel Gamma Execution (92.1% success)',
      '[STRANGE]: Timeline Reality-616 selected. Temporal checkpoint sealed.'
    ]
  },
  {
    id: 'vision',
    name: 'Vision',
    alias: 'Synthezoid',
    avatar: '💎',
    role: 'Mind Stone Knowledge Base & Semantic Sync',
    rank: 'Cosmic-Class // Synthetic Intelligence',
    primaryColor: '#FFD700',
    accentColor: '#00BFA5',
    dimColor: 'rgba(255, 215, 0, 0.16)',
    glowColor: 'rgba(255, 215, 0, 0.65)',
    weapon: 'Mind Stone Solar Beam & Org Memory Mesh',
    preferredModel: 'Gemini Pro 1.5 / Embedding API',
    specialty: 'Persistent Semantic Memory & Cross-Agent Knowledge Synchronization',
    tokenCap: '100,000 / hr',
    hourlyLimit: 'Knowledge Mesh',
    quote: '"Humans are odd. They think order and chaos are somehow opposites. I organize both into semantic embeddings."',
    defaultPrompt: 'Index architectural decision record into persistent semantic memory store',
    stats: {
      velocity: 96,
      security: 99,
      precision: 98,
      refactor: 97,
      stability: 100,
      quantum: 99
    },
    sfx: 'solar',
    logs: [
      '[VISION]: Accessing Mind Stone persistent knowledge grid...',
      '[VISION]: Cross-referencing 42 architectural conventions and bug patterns.',
      '[VISION]: Generated 1536-dimensional vector embedding for mission context.',
      '[VISION]: Synced persistent memory state to .stark/memory.json.',
      '[VISION]: 100% org knowledge synchronization achieved across team.'
    ]
  }
];

let currentIndex = 0;
let audioCtx = null;
let soundEnabled = true;

// Web Audio API Synthesizer
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playHeroSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'repulsor') {
      // Iron Man Repulsor Blast
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (type === 'shield') {
      // Vibranium Shield Clang
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(600, now);
      osc1.frequency.exponentialRampToValueAtTime(180, now + 0.5);
      osc2.frequency.setValueAtTime(1200, now);
      osc2.frequency.exponentialRampToValueAtTime(400, now + 0.5);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start(now); osc2.start(now);
      osc1.stop(now + 0.51); osc2.stop(now + 0.51);
    } else if (type === 'hulk') {
      // Gamma Earthquake Rumble
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(75, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.45);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.46);
    } else if (type === 'thunder') {
      // Lightning Crackle
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.4);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.41);
    } else {
      // High-Tech Cyber Switch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Web audio blocked before user gesture
  }
}

// Background Particle Canvas
function initAmbientCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = [];
  for (let i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.5 + 0.2
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const hero = HEROES_DATA[currentIndex];

    ctx.fillStyle = hero.primaryColor;
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.globalAlpha = p.alpha * 0.7;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Radial center glow
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height * 0.45, 10,
      canvas.width / 2, canvas.height * 0.45, 500
    );
    grad.addColorStop(0, hero.dimColor);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    requestAnimationFrame(render);
  }
  render();
}

// Hexagon Radar Chart Renderer
function drawRadarChart(hero) {
  const canvas = document.getElementById('radarCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 75;

  ctx.clearRect(0, 0, w, h);

  const keys = ['velocity', 'security', 'precision', 'refactor', 'stability', 'quantum'];
  const labels = ['Velocity', 'Security', 'Testing', 'Refactor', 'Stability', 'Quantum'];
  const total = keys.length;

  // Background Web
  for (let level = 1; level <= 4; level++) {
    const r = (radius / 4) * level;
    ctx.beginPath();
    for (let i = 0; i < total; i++) {
      const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
      const x = cx + r * Math.cos(angle);
      const y = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Radial Spokes
  for (let i = 0; i < total; i++) {
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.stroke();

    // Labels in clean high-tech sans-serif style
    const lx = cx + (radius + 20) * Math.cos(angle);
    const ly = cy + (radius + 14) * Math.sin(angle);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '600 11px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labels[i], lx, ly);
  }

  // Hero Stat Shape
  ctx.beginPath();
  for (let i = 0; i < total; i++) {
    const statVal = hero.stats[keys[i]] / 100;
    const r = radius * statVal;
    const angle = (Math.PI * 2 / total) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = hero.dimColor;
  ctx.fill();
  ctx.strokeStyle = hero.primaryColor;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = hero.primaryColor;
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// Update Active Character Display
function selectHero(index, playAudio = true) {
  currentIndex = (index + HEROES_DATA.length) % HEROES_DATA.length;
  const hero = HEROES_DATA[currentIndex];

  // Update CSS Variables for Dynamic Color Theme
  document.documentElement.style.setProperty('--hero-color', hero.primaryColor);
  document.documentElement.style.setProperty('--hero-color-dim', hero.dimColor);
  document.documentElement.style.setProperty('--hero-color-glow', hero.glowColor);
  document.documentElement.style.setProperty('--hero-accent', hero.accentColor);

  // Update Center Stage
  const avatarEl = document.getElementById('heroAvatarCrest');
  if (avatarEl) avatarEl.textContent = hero.avatar;

  const rankEl = document.getElementById('heroRankTag');
  if (rankEl) rankEl.textContent = hero.rank;

  const titleEl = document.getElementById('heroMainTitle');
  if (titleEl) titleEl.textContent = hero.name;

  const callsignEl = document.getElementById('heroCallsign');
  if (callsignEl) callsignEl.textContent = hero.alias;

  const quoteEl = document.getElementById('heroQuoteText');
  if (quoteEl) quoteEl.textContent = hero.quote;

  // Update Tech Matrix
  const modelEl = document.getElementById('heroPreferredModel');
  if (modelEl) modelEl.textContent = hero.preferredModel;

  const weaponEl = document.getElementById('heroWeapon');
  if (weaponEl) weaponEl.textContent = hero.weapon;

  const specialtyEl = document.getElementById('heroSpecialty');
  if (specialtyEl) specialtyEl.textContent = hero.specialty;

  const tokenCapEl = document.getElementById('heroTokenCap');
  if (tokenCapEl) tokenCapEl.textContent = hero.tokenCap;

  const promptInput = document.getElementById('directivePromptInput');
  if (promptInput) promptInput.value = hero.defaultPrompt;

  // Update Stat Meters
  updateStatMeter('statVelocity', hero.stats.velocity);
  updateStatMeter('statSecurity', hero.stats.security);
  updateStatMeter('statPrecision', hero.stats.precision);
  updateStatMeter('statRefactor', hero.stats.refactor);

  // Draw Radar
  drawRadarChart(hero);

  // Update Dock Carousel Active State
  const cards = document.querySelectorAll('.hero-thumb-card');
  cards.forEach((card, i) => {
    if (i === currentIndex) {
      card.classList.add('active');
      card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    } else {
      card.classList.remove('active');
    }
  });

  // Render logs
  renderLogs(hero.logs);

  if (playAudio) {
    playHeroSound(hero.sfx);
  }
}

function updateStatMeter(id, val) {
  const el = document.getElementById(id);
  const fill = document.getElementById(id + 'Fill');
  if (el) el.textContent = val + '%';
  if (fill) fill.style.width = val + '%';
}

function renderLogs(logs) {
  const terminal = document.getElementById('heroLiveTerminal');
  if (!terminal) return;
  terminal.innerHTML = '';
  logs.forEach((line) => {
    const div = document.createElement('div');
    div.innerHTML = line.replace(/(\[[A-Z0-9_-]+\]:)/g, '<span class="t-tag">$1</span>');
    terminal.appendChild(div);
  });
  terminal.scrollTop = terminal.scrollHeight;
}

// Deploy Directive Execution Simulation
function deployCurrentDirective() {
  const hero = HEROES_DATA[currentIndex];
  const input = document.getElementById('directivePromptInput');
  const userText = input ? input.value : hero.defaultPrompt;
  const terminal = document.getElementById('heroLiveTerminal');
  if (!terminal) return;

  playHeroSound(hero.sfx);

  terminal.innerHTML = `<div class="t-tag">⚡ [TACTICAL DISPATCH]: Deploying ${hero.name}...</div>
<div>Directive: "${userText}"</div>`;

  let step = 0;
  const steps = [
    `[${hero.alias.toUpperCase()}]: Directive acknowledged. Initializing runtime context.`,
    `[${hero.alias.toUpperCase()}]: Engaging ${hero.preferredModel}...`,
    `[${hero.alias.toUpperCase()}]: Executing: ${hero.specialty}`,
    `[VIBRANIUM-QA]: Standards validation score: 99.8%.`,
    `<span class="t-success">✔ [SUCCESS]: Directive resolved with 0 errors & full safety verification!</span>`
  ];

  const interval = setInterval(() => {
    if (step < steps.length) {
      const div = document.createElement('div');
      div.innerHTML = steps[step].replace(/(\[[A-Z0-9_-]+\]:)/g, '<span class="t-tag">$1</span>');
      terminal.appendChild(div);
      terminal.scrollTop = terminal.scrollHeight;
      step++;
    } else {
      clearInterval(interval);
    }
  }, 380);
}

// Populate Bottom Carousel Dock
function initDock() {
  const carousel = document.getElementById('dockCarousel');
  if (!carousel) return;
  carousel.innerHTML = '';

  HEROES_DATA.forEach((hero, index) => {
    const card = document.createElement('div');
    card.className = `hero-thumb-card ${index === 0 ? 'active' : ''}`;
    card.innerHTML = `
      <div class="thumb-avatar">${hero.avatar}</div>
      <div class="thumb-info">
        <span class="thumb-name">${hero.name}</span>
        <span class="thumb-role">${hero.role.split('&')[0].trim()}</span>
      </div>
    `;
    card.addEventListener('click', () => selectHero(index, true));
    carousel.appendChild(card);
  });
}

// Initialize Everything
document.addEventListener('DOMContentLoaded', () => {
  initDock();
  initAmbientCanvas();
  selectHero(0, false);

  // Prev / Next Button Listeners
  const prevBtn = document.getElementById('dockPrevBtn');
  const nextBtn = document.getElementById('dockNextBtn');
  if (prevBtn) prevBtn.addEventListener('click', () => selectHero(currentIndex - 1, true));
  if (nextBtn) nextBtn.addEventListener('click', () => selectHero(currentIndex + 1, true));

  // Deploy Action Button
  const deployBtn = document.getElementById('deployActionBtn');
  if (deployBtn) deployBtn.addEventListener('click', deployCurrentDirective);

  // Voice Line Audio Button
  const voiceBtn = document.getElementById('voiceLineBtn');
  if (voiceBtn) voiceBtn.addEventListener('click', () => playHeroSound(HEROES_DATA[currentIndex].sfx));

  // Sound Toggle Button
  const soundBtn = document.getElementById('soundToggleBtn');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = soundEnabled ? '🔊 SFX: ON' : '🔇 SFX: OFF';
    });
  }

  // Keyboard Shortcuts (Arrow Left/Right, 1-9)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') {
      selectHero(currentIndex - 1, true);
    } else if (e.key === 'ArrowRight') {
      selectHero(currentIndex + 1, true);
    } else if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key, 10) - 1;
      if (idx < HEROES_DATA.length) selectHero(idx, true);
    }
  });
});
