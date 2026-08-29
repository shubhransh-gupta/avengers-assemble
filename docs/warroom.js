/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // MINECRAFT AVENGERS VOXEL ARCADE ENGINE (docs/warroom.js)
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],
  dagPulses: [],       // Blocky redstone energy packets
  respawnPillars: [],  // Voxel beacon beams
  activeAttacks: [],
  roamingAgents: {},
  thunderboltTimer: 0,
};

// ── Minecraft Avengers Voxel Strongholds & MCU Heroes Catalog ───────
const MARVEL_CHAMBERS = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    chamberName: 'Stark Voxel Tower',
    image: './assets/iron_man.jpg',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    power: 'laser',
    screenPos: { top: '32%', left: '26%' },
    quote: 'JARVIS, decompose master prompt into redstone DAG blocks.',
    status: 'ONLINE',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    chamberName: 'Latverian Voxel Castle',
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.65)',
    power: 'runes',
    screenPos: { top: '44%', left: '82%' },
    quote: 'Doom commands the syntax trees. Imperfect code shall be banished to the Nether.',
    status: 'COMPILING',
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    role: 'DevOps & Package Manifest',
    chamberName: 'Thunderstorm Vortex',
    image: './assets/thor.jpg',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.65)',
    power: 'thunder',
    screenPos: { top: '18%', left: '54%' },
    quote: 'By Mjolnir, summoned thunderstorm CI/CD and Swift packages!',
    status: 'FORGING',
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    chamberName: 'Obsidian Mountain Peak',
    image: './assets/thanos.jpg',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.65)',
    power: 'cosmic',
    screenPos: { top: '25%', left: '12%' },
    quote: 'Rate limits, memory, and tokens in perfect equilibrium.',
    status: 'BALANCED',
    spawned: true,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    role: 'Quantum Timeline Branching',
    chamberName: 'Quantum Chrono-Bridge',
    image: './assets/kang_conqueror.jpg',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    power: 'chrono',
    screenPos: { top: '62%', left: '52%' },
    quote: 'Simulated 14 billion voxel timelines. Reality-616 targeted.',
    status: 'BRANCHING',
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    chamberName: 'Mystic End Portal Spire',
    image: './assets/doctor_strange.jpg',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    power: 'mandala',
    screenPos: { top: '28%', left: '92%' },
    quote: 'Temporal snapshots preserved in the Ender matrix for instant rollback.',
    status: 'SYNCHRONIZING',
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    role: 'Vibranium QA Auditor',
    chamberName: 'Wakandan Outpost House',
    image: './assets/captain_america.jpg',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    power: 'shield',
    screenPos: { top: '78%', left: '36%' },
    quote: 'Standards inspection ready. Sound off, soldiers.',
    status: 'INSPECTING',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    chamberName: 'Web Forest Outpost',
    image: './assets/spider_man.jpg',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    power: 'web',
    screenPos: { top: '82%', left: '78%' },
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    status: 'RENDER_READY',
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    role: 'Gamma Logic Optimizer',
    chamberName: 'Emerald Gamma Meadow',
    image: './assets/hulk.jpg',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    power: 'gamma',
    screenPos: { top: '72%', left: '58%' },
    quote: 'HULK SMASH VOXEL BLOCKS AND REFACTOR FOR MAX PERFORMANCE!',
    status: 'OPTIMIZING',
    spawned: true,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    role: 'Security & CVE Recon',
    chamberName: 'Redstone Stealth Enclave',
    image: './assets/black_widow.jpg',
    avatar: '🕷️',
    themeColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.65)',
    power: 'laser',
    screenPos: { top: '60%', left: '38%' },
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    status: 'STANDBY',
    spawned: false,
  }
};

// Copy spawned chambers into active pool
for (const [k, v] of Object.entries(MARVEL_CHAMBERS)) {
  if (v.spawned) state.roamingAgents[k] = { ...v };
}

// ── DOM References ──────────────────────────────────────────────────
let canvas, ctx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer, chambersLayer;

// ── Initialization ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('simulationCanvas');
  ctx = canvas.getContext('2d');

  verboseStreamFeed = document.getElementById('verboseStreamFeed');
  resultDeliverableView = document.getElementById('resultDeliverableView');
  quantumPromptInput = document.getElementById('quantumPromptInput');
  dispatchMissionBtn = document.getElementById('dispatchMissionBtn');
  multiverseStrongholdDock = document.getElementById('multiverseStrongholdDock');
  incursionSpeechLayer = document.getElementById('incursionSpeechLayer');
  chambersLayer = document.getElementById('chambersLayer');

  initCanvas();
  renderChambersOnLandscape();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initVoxelRainParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Minecraft Avengers Voxel grid loaded. Ready Player 1.');
  }, 1200);

  // Periodic living pulses and random respawn beams
  setInterval(triggerRandomRespawnSequence, 4200);
  setInterval(triggerDAGSimulationPulse, 5500);
});

// ── Canvas Setup & Arcade Voxel Loop ────────────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(simulationLoop);
}

function initVoxelRainParticles() {
  for (let i = 0; i < 60; i++) {
    state.particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 3 + 2,
      speedY: Math.random() * 1.5 + 0.8,
      color: ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7', '#10B981'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.7 + 0.3,
    });
  }
}

function simulationLoop(time) {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // 1. Pixelated Voxel Rain / Magic Sparks
  for (const p of state.particles) {
    p.y += p.speedY;
    if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    // Draw pixel rectangle (Voxel block style)
    ctx.fillRect(p.x % w, p.y, p.size, p.size);
    ctx.globalAlpha = 1.0;
  }

  // 2. Voxel Lake Water Shimmer Waves
  const lakeX = w * 0.65;
  const lakeY = h * 0.76;
  const shimmer = ctx.createRadialGradient(lakeX, lakeY, 10, lakeX, lakeY, w * 0.25);
  shimmer.addColorStop(0, 'rgba(0, 240, 255, 0.2)');
  shimmer.addColorStop(0.5, 'rgba(56, 189, 248, 0.1)');
  shimmer.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(lakeX - w * 0.25, lakeY - h * 0.12, w * 0.50, h * 0.24);

  // 3. Render Neural Redstone DAG Links
  renderDAGMeshLinks(w, h, time);

  // 4. Render Active DAG Data Pulses (Blocky Packets)
  renderDAGPulses(w, h);

  // 5. Pixelated Thunderstorm Lightning Strikes
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.015) {
    drawVoxelLightning(w * 0.54, h * 0.05, w * 0.54, h * 0.52);
  }

  // 6. Render Active Voxel Beacon Beams
  state.respawnPillars = state.respawnPillars.filter(pillar => {
    pillar.life -= 0.024;
    renderVoxelBeacon(pillar, w, h);
    return pillar.life > 0;
  });

  // 7. Render Active Combat Attacks between Chambers
  state.activeAttacks = state.activeAttacks.filter(a => {
    a.life -= 0.035;
    renderAttackEffect(a, w, h);
    return a.life > 0;
  });

  requestAnimationFrame(simulationLoop);
}

// ── Neural Redstone DAG Mesh Stream Links ───────────────────────────
function renderDAGMeshLinks(w, h, time) {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  const sX = (parseFloat(stark.screenPos.left) / 100) * w;
  const sY = (parseFloat(stark.screenPos.top) / 100) * h;

  ctx.save();
  ctx.lineWidth = 2;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;

    const aX = (parseFloat(agent.screenPos.left) / 100) * w;
    const aY = (parseFloat(agent.screenPos.top) / 100) * h;

    const grad = ctx.createLinearGradient(sX, sY, aX, aY);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
    grad.addColorStop(1, agent.glowColor || 'rgba(168, 85, 247, 0.4)');

    ctx.strokeStyle = grad;
    ctx.shadowColor = agent.themeColor || '#00F0FF';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.lineTo(aX, aY);
    ctx.stroke();
  }

  ctx.restore();
}

function renderDAGPulses(w, h) {
  state.dagPulses = state.dagPulses.filter(pulse => {
    pulse.progress += 0.025;
    if (pulse.progress >= 1.0) return false;

    const curX = (pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress) * w;
    const curY = (pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress) * h;

    ctx.save();
    ctx.fillStyle = pulse.color;
    ctx.shadowColor = pulse.color;
    ctx.shadowBlur = 14;
    // Draw blocky pixel data packet
    ctx.fillRect(curX - 4, curY - 4, 8, 8);
    ctx.restore();

    return true;
  });
}

function triggerDAGSimulationPulse() {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  const sPos = { x: parseFloat(stark.screenPos.left) / 100, y: parseFloat(stark.screenPos.top) / 100 };

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;
    state.dagPulses.push({
      from: sPos,
      to: { x: parseFloat(agent.screenPos.left) / 100, y: parseFloat(agent.screenPos.top) / 100 },
      color: agent.themeColor || '#00F0FF',
      progress: 0,
    });
  }
}

// ── Voxel Pixelated Lightning Strike ────────────────────────────────
function drawVoxelLightning(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 20;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  while (curY < y2) {
    curX += (Math.floor(Math.random() * 3) - 1) * 16;
    curY += 20;
    ctx.lineTo(curX, curY);
  }
  ctx.stroke();
  ctx.restore();
}

function renderVoxelBeacon(pillar, w, h) {
  ctx.save();
  ctx.globalAlpha = Math.sin(pillar.life * Math.PI) * 0.9;
  const targetX = pillar.x * w;
  const targetY = pillar.y * h;

  // Blocky Voxel Beacon Beam
  const beamGrad = ctx.createLinearGradient(targetX, 0, targetX, targetY);
  beamGrad.addColorStop(0, pillar.color);
  beamGrad.addColorStop(0.7, '#FFFFFF');
  beamGrad.addColorStop(1, pillar.color);

  ctx.fillStyle = beamGrad;
  ctx.shadowColor = pillar.color;
  ctx.shadowBlur = 24;
  ctx.fillRect(targetX - 6, 0, 12, targetY);

  // Voxel Ground Impact Box
  ctx.strokeStyle = pillar.color;
  ctx.lineWidth = 3;
  const radius = 35 * (1.1 - pillar.life);
  ctx.strokeRect(targetX - radius, targetY - radius * 0.5, radius * 2, radius);

  ctx.restore();
}

function renderAttackEffect(attack, w, h) {
  ctx.save();
  ctx.globalAlpha = attack.life;
  ctx.strokeStyle = attack.color;
  ctx.shadowColor = attack.color;
  ctx.shadowBlur = 16;
  ctx.lineWidth = 3.5;

  ctx.beginPath();
  ctx.moveTo(attack.from.x * w, attack.from.y * h);
  ctx.lineTo(attack.to.x * w, attack.to.y * h);
  ctx.stroke();

  ctx.restore();
}

// ── Render Photorealistic Chambers on the Voxel Landscape ──────────
function renderChambersOnLandscape() {
  chambersLayer.innerHTML = '';

  for (const entity of Object.values(state.roamingAgents)) {
    const chamber = document.createElement('div');
    chamber.className = 'battleworld-chamber';
    chamber.id = `chamber-${entity.id}`;
    chamber.style.top = entity.screenPos.top;
    chamber.style.left = entity.screenPos.left;
    chamber.style.setProperty('--chamber-accent', entity.themeColor);
    chamber.style.setProperty('--chamber-glow', entity.glowColor);

    let avatarHtml = `<img src="${entity.image}" alt="${entity.name}" class="chamber-portrait-img" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🦸</text></svg>'" />`;

    chamber.innerHTML = `
      <div class="chamber-pod-frame">
        <div class="chamber-pulse-ring"></div>
        ${avatarHtml}
      </div>
      <div class="chamber-meta-pill">
        <span class="chamber-status-dot"></span>
        <span>${entity.callsign} // ${entity.role.split(' ')[0].toUpperCase()}</span>
      </div>
    `;

    chamber.addEventListener('click', () => {
      triggerChamberActivation(entity.id);
    });

    chambersLayer.appendChild(chamber);
  }
}

// ── Chamber Activation & Quantum Respawn ───────────────────────────
function triggerChamberActivation(entityId) {
  const entity = state.roamingAgents[entityId] || MARVEL_CHAMBERS[entityId];
  if (!entity) return;

  const chamberEl = document.getElementById(`chamber-${entityId}`);
  if (chamberEl) {
    chamberEl.classList.remove('chamber-respawn-active');
    void chamberEl.offsetWidth; // Trigger reflow
    chamberEl.classList.add('chamber-respawn-active');
  }

  // Add voxel beacon beam
  const numLeft = parseFloat(entity.screenPos.left) / 100;
  const numTop = parseFloat(entity.screenPos.top) / 100;
  state.respawnPillars.push({
    x: numLeft,
    y: numTop,
    color: entity.themeColor,
    life: 1.0,
  });

  // Pulse data packet back to Stark Tower
  const stark = state.roamingAgents['tony-stark'];
  if (stark && entityId !== 'tony-stark') {
    state.dagPulses.push({
      from: { x: numLeft, y: numTop },
      to: { x: parseFloat(stark.screenPos.left) / 100, y: parseFloat(stark.screenPos.top) / 100 },
      color: entity.themeColor,
      progress: 0,
    });
  }

  showCosmicSpeechBubble(entityId, entity.quote);
  appendVerboseStream(`● [${entity.callsign}] ${entity.chamberName} synchronized (${entity.status}).`);
}

function triggerRandomRespawnSequence() {
  const agents = Object.values(state.roamingAgents);
  if (agents.length === 0) return;
  const lucky = agents[Math.floor(Math.random() * agents.length)];
  triggerChamberActivation(lucky.id);
}

// ── Multiverse Clash (All Chambers Synchronized Attack) ─────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL CLASH] All Minecraft Avengers Strongholds unleashing full combat grid!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers, assemble and engage full voxel power!');

  for (const agent of Object.values(state.roamingAgents)) {
    triggerChamberActivation(agent.id);
  }
};

// ── Spawn Character Modal & Roster Selection ────────────────────────
window.openSpawnModal = function () {
  const grid = document.getElementById('spawnRosterGrid');
  grid.innerHTML = '';

  for (const [id, hero] of Object.entries(MARVEL_CHAMBERS)) {
    const isSpawned = Boolean(state.roamingAgents[id]);
    const card = document.createElement('div');
    card.className = 'roster-spawn-card';
    card.style.borderColor = isSpawned ? hero.themeColor : '#2F175A';

    card.innerHTML = `
      <div class="roster-avatar-frame">
        <img src="${hero.image}" alt="${hero.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🦸</text></svg>'" />
      </div>
      <div class="roster-name">${hero.name}</div>
      <div class="roster-callsign">[${hero.callsign}]</div>
      <div style="font-size:8px; font-family:var(--font-arcade); color:${isSpawned ? '#10B981' : '#9D84C7'}; font-weight:700;">
        ${isSpawned ? '● SPAWNED' : '➕ CLICK TO SPAWN'}
      </div>
    `;

    card.addEventListener('click', () => {
      spawnHeroDirect(id);
      closeModals();
    });

    grid.appendChild(card);
  }

  document.getElementById('spawnRosterModal').style.display = 'flex';
};

window.spawnHeroDirect = function (heroId) {
  const hero = MARVEL_CHAMBERS[heroId];
  if (!hero) return;

  state.roamingAgents[heroId] = { ...hero };
  renderChambersOnLandscape();
  renderStrongholdDock();
  triggerChamberActivation(heroId);
  appendVerboseStream(`⚡ [HERO MATERIALIZED] ${hero.chamberName} initialized for ${hero.name}!`);
};

// ── Custom Character Creator ────────────────────────────────────────
window.openCustomHeroModal = function () {
  document.getElementById('customHeroModal').style.display = 'flex';
};

window.closeModals = function () {
  document.getElementById('spawnRosterModal').style.display = 'none';
  document.getElementById('customHeroModal').style.display = 'none';
};

window.submitCustomHero = async function () {
  const name = document.getElementById('customHeroName').value.trim();
  const callsign = document.getElementById('customHeroCallsign').value.trim().toUpperCase();
  const role = document.getElementById('customHeroRole').value;
  const avatar = document.getElementById('customHeroAvatar').value.trim() || '🦸';
  const harness = document.getElementById('customHeroHarness').value;
  const power = document.getElementById('customHeroPower').value;
  const directive = document.getElementById('customHeroDirective').value.trim();

  if (!name || !callsign) {
    alert('Please enter both Character Name and Callsign!');
    return;
  }

  const heroId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newHero = {
    id: heroId,
    name,
    callsign,
    role,
    chamberName: `${name} Voxel Outpost`,
    image: './assets/iron_man.jpg', // fallback image
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    power,
    screenPos: { top: `${35 + Math.random() * 40}%`, left: `${30 + Math.random() * 40}%` },
    quote: directive || `Agent ${name} operational. Ready for directives.`,
    status: 'ONLINE',
    spawned: true,
  };

  MARVEL_CHAMBERS[heroId] = newHero;
  state.roamingAgents[heroId] = newHero;

  try {
    await fetch('/api/heroes/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, callsign, role, avatar, harness, superpower: power, systemPrompt: directive }),
    });
  } catch {}

  renderChambersOnLandscape();
  renderStrongholdDock();
  closeModals();
  triggerChamberActivation(heroId);
  showCosmicSpeechBubble(heroId, newHero.quote);
  appendVerboseStream(`🚀 [CUSTOM VOXEL HERO SPAWNED] ${newHero.chamberName} online!`);
};

// ── Speech Bubble Rendering ─────────────────────────────────────────
function showCosmicSpeechBubble(entityId, text, durationMs = 6000) {
  const entity = state.roamingAgents[entityId] || MARVEL_CHAMBERS[entityId];
  if (!entity) return;

  const existing = document.getElementById(`bubble-${entityId}`);
  if (existing) existing.remove();

  const bubble = document.createElement('div');
  bubble.id = `bubble-${entityId}`;
  bubble.className = 'cosmic-speech-bubble';
  bubble.style.setProperty('--bubble-color', entity.themeColor);
  bubble.style.setProperty('--bubble-border', entity.themeColor);
  bubble.style.setProperty('--bubble-glow', entity.glowColor);

  const rect = canvas.getBoundingClientRect();
  const screenX = rect.width * (parseFloat(entity.screenPos.left) / 100);
  const screenY = rect.height * (parseFloat(entity.screenPos.top) / 100);

  bubble.style.left = `${screenX}px`;
  bubble.style.top = `${screenY}px`;

  bubble.innerHTML = `
    <span class="bubble-speaker">[${entity.callsign}]</span>
    ${escapeHtml(text)}
  `;

  incursionSpeechLayer.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentElement) bubble.remove();
  }, durationMs);
}

// ── Stronghold Dock Cards ───────────────────────────────────────────
function renderStrongholdDock() {
  multiverseStrongholdDock.innerHTML = '';

  for (const entity of Object.values(state.roamingAgents)) {
    const card = document.createElement('div');
    card.className = 'stronghold-card';
    card.id = `stronghold-${entity.id}`;
    card.style.setProperty('--card-accent', entity.themeColor);
    card.style.setProperty('--card-glow', entity.glowColor);

    card.innerHTML = `
      <div class="stronghold-thumb-frame">
        <img src="${entity.image}" alt="${entity.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🦸</text></svg>'" />
      </div>
      <div class="stronghold-info">
        <div class="stronghold-top">
          <span class="stronghold-name">${entity.name.split(' ')[0]}</span>
          <span class="stronghold-callsign">${entity.callsign}</span>
        </div>
        <div class="stronghold-sub">${entity.chamberName}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      triggerChamberActivation(entity.id);
    });

    multiverseStrongholdDock.appendChild(card);
  }
}

// ── Console Mode Toggle (VERBOSE vs RESULT) ─────────────────────────
window.setConsoleMode = function (mode) {
  state.consoleMode = mode;
  const btnVerbose = document.getElementById('btnModeVerbose');
  const btnResult = document.getElementById('btnModeResult');
  const descLabel = document.getElementById('modeDescriptionLabel');

  if (mode === 'verbose') {
    btnVerbose.classList.add('active');
    btnResult.classList.remove('active');
    verboseStreamFeed.style.display = 'flex';
    resultDeliverableView.style.display = 'none';
    descLabel.innerText = 'Real-time inter-agent thoughts & DAG directives';
  } else {
    btnResult.classList.add('active');
    btnVerbose.classList.remove('active');
    resultDeliverableView.style.display = 'flex';
    verboseStreamFeed.style.display = 'none';
    descLabel.innerText = 'Only final code deliverables & project workspace paths';
  }
};

window.fillPrompt = function (text) {
  quantumPromptInput.value = text;
  quantumPromptInput.focus();
};

window.clearTerminal = function () {
  verboseStreamFeed.innerHTML = '';
  appendVerboseStream(`● [TONY STARK] Terminal cleared. Ready for next master directive.`);
};

// ── Feed Updaters ───────────────────────────────────────────────────
function appendVerboseStream(text) {
  const entry = document.createElement('div');
  entry.className = 'stream-entry';

  const tagMatch = text.match(/^●?\s*\[([a-zA-Z0-9_\-\s]+)\]/);
  if (tagMatch) {
    const tagName = tagMatch[1];
    const rest = text.replace(/^●?\s*\[([a-zA-Z0-9_\-\s]+)\]\s*/, '');
    let color = '#00F0FF';
    if (tagName.includes('HULK')) color = '#22C55E';
    else if (tagName.includes('DOOM')) color = '#10B981';
    else if (tagName.includes('THANOS')) color = '#FFC83B';
    else if (tagName.includes('SPIDEY') || tagName.includes('SPIDER')) color = '#EF4444';
    else if (tagName.includes('STRANGE') || tagName.includes('WIDOW')) color = '#A855F7';
    else if (tagName.includes('THOR')) color = '#00D5E8';
    else if (tagName.includes('CAP')) color = '#3B82F6';

    entry.innerHTML = `<span class="stream-bullet" style="color:${color}">●</span> <span class="stream-hero-tag" style="color:${color}">[${escapeHtml(tagName)}]</span> ${escapeHtml(rest)}`;
  } else {
    entry.innerHTML = `<span class="stream-bullet" style="color:#00F0FF">●</span> ${escapeHtml(text)}`;
  }

  verboseStreamFeed.appendChild(entry);
  verboseStreamFeed.scrollTop = verboseStreamFeed.scrollHeight;
}

function updateResultDeliverable(markdownContent, workspacePath) {
  resultDeliverableView.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'deliverable-hero-card';

  let html = `<h2>🏆 Mission Deliverable & Source Files</h2>`;
  if (workspacePath) {
    html += `
      <div class="workspace-path-banner">
        <span>📁 <strong>Saved on Disk:</strong> <code>${escapeHtml(workspacePath)}</code></span>
        <button class="code-copy-btn" onclick="navigator.clipboard.writeText('${workspacePath.replace(/\\/g, '\\\\')}'); this.innerText='Copied!';">Copy Path</button>
      </div>
    `;
  }

  // Parse code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let parsed = '';

  while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2];
    parsed += escapeHtml(markdownContent.substring(lastIndex, match.index));
    parsed += `<pre><code>${escapeHtml(code)}</code><button class="code-copy-btn" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); this.innerText='Copied!';">Copy</button></pre>`;
    lastIndex = match.index + match[0].length;
  }
  parsed += escapeHtml(markdownContent.substring(lastIndex));

  card.innerHTML = html + `<div style="font-size:11.5px; line-height:1.6; color:#CBD5E1;">${parsed.replace(/\n/g, '<br/>')}</div>`;
  resultDeliverableView.appendChild(card);
}

// ── Mission Launch & User Interaction ───────────────────────────────
function setupEventListeners() {
  quantumPromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      dispatchMasterMission();
    }
  });

  dispatchMissionBtn.addEventListener('click', dispatchMasterMission);
}

async function dispatchMasterMission() {
  const prompt = quantumPromptInput.value.trim();
  if (!prompt) return;

  quantumPromptInput.value = '';
  appendVerboseStream(`● [USER DIRECTIVE] ${prompt}`);
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the Voxel Battleworld mesh...`);

  showCosmicSpeechBubble('tony-stark', `Analyzing directive: "${prompt.slice(0, 35)}..."`);
  triggerDAGSimulationPulse();

  try {
    const res = await fetch('/api/mission/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.text();
      appendVerboseStream(`● [STARK ERROR] Mission execution failed: ${err}`);
      return;
    }

    const data = await res.json();
    if (data.success) {
      appendVerboseStream(`● [WORKSPACE SAVED] Project written to: ${data.workspacePath}`);
      updateResultDeliverable(data.summary, data.workspacePath);
    }
  } catch (err) {
    appendVerboseStream(`● [NETWORK ERROR] ${err.message}`);
  }
}

// ── WebSocket Live Streaming ─────────────────────────────────────────
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  state.ws = new WebSocket(wsUrl);

  state.ws.onopen = () => {
    console.log('⚡ Connected to Stark Voxel Incursion Comms');
  };

  state.ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'comms_message' && msg.data?.content) {
        appendVerboseStream(msg.data.content);
        const speaker = msg.data.from;
        if (state.roamingAgents[speaker] || MARVEL_CHAMBERS[speaker]) {
          triggerChamberActivation(speaker);
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        if (heroId) triggerChamberActivation(heroId);
        appendVerboseStream(`● [${(heroId || 'HERO').toUpperCase()}] Writing source code for "${msg.data?.title}"...`);
      }
    } catch {}
  };

  state.ws.onclose = () => {
    setTimeout(initWebSocket, 2500);
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
