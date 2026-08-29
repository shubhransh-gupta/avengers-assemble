/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // MARVEL BATTLEWORLD CHAMBERS & MULTIVERSE ENGINE (docs/warroom.js)
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],
  respawnPillars: [], // Beams of light descending into chambers
  activeAttacks: [],
  roamingAgents: {},
};

// ── Complete Marvel Multiverse Chambers & Heroes Catalog ────────────
const MARVEL_CHAMBERS = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    chamberName: 'Stark Holographic Citadel',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.55)',
    power: 'laser',
    screenPos: { top: '42%', left: '50%' },
    canvasPos: { x: 250, y: 135 },
    quote: 'JARVIS, decompose directives across the Battleworld mesh.',
    status: 'ONLINE',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    chamberName: 'Latverian Arcane Sanctum',
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    power: 'runes',
    screenPos: { top: '58%', left: '82%' },
    canvasPos: { x: 410, y: 185 },
    quote: 'Doom commands the syntax trees. Imperfect code shall be banished.',
    status: 'COMPILING',
    spawned: true,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    role: 'Quantum Timeline Branching',
    chamberName: 'Quantum Chrono-Chamber',
    image: './assets/kang_conqueror.jpg',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.55)',
    power: 'chrono',
    screenPos: { top: '52%', left: '18%' },
    canvasPos: { x: 90, y: 165 },
    quote: 'I have navigated 14 billion timelines. Reality-616 targeted.',
    status: 'BRANCHING',
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    role: 'DevOps & Package Manifest',
    chamberName: 'Asgardian Thunder Forge',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.55)',
    power: 'thunder',
    screenPos: { top: '25%', left: '86%' },
    canvasPos: { x: 430, y: 80 },
    quote: 'By Mjolnir, forged high-voltage Swift packages and CI/CD!',
    status: 'FORGING',
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    chamberName: 'Titan Gauntlet Sanctuary',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.55)',
    power: 'cosmic',
    screenPos: { top: '22%', left: '70%' },
    canvasPos: { x: 350, y: 70 },
    quote: 'Rate limits, memory, and tokens in perfect equilibrium.',
    status: 'BALANCED',
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    chamberName: 'Kamar-Taj Mystic Nexus',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.55)',
    power: 'mandala',
    screenPos: { top: '24%', left: '22%' },
    canvasPos: { x: 110, y: 75 },
    quote: 'Temporal snapshots preserved for instant rollback.',
    status: 'SYNCHRONIZING',
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    role: 'Vibranium QA Auditor',
    chamberName: 'Wakandan Bastion',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.55)',
    power: 'shield',
    screenPos: { top: '78%', left: '28%' },
    canvasPos: { x: 140, y: 250 },
    quote: 'Standards inspection ready. Sound off, strike team.',
    status: 'INSPECTING',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    chamberName: 'Web Vanguard Hub',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.55)',
    power: 'web',
    screenPos: { top: '80%', left: '72%' },
    canvasPos: { x: 360, y: 255 },
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    status: 'RENDER_READY',
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    role: 'Gamma Logic Optimizer',
    chamberName: 'Gamma Containment Lab',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.55)',
    power: 'gamma',
    screenPos: { top: '76%', left: '50%' },
    canvasPos: { x: 250, y: 245 },
    quote: 'HULK SMASH BOTTLENECKS AND REFACTOR WITH GAMMA POWER!',
    status: 'OPTIMIZING',
    spawned: true,
  },
  'vision': {
    id: 'vision',
    name: 'Vision',
    callsign: 'VISION',
    role: 'Org Knowledge Mesh',
    chamberName: 'Mind Stone Matrix',
    avatar: '💎',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.55)',
    power: 'laser',
    screenPos: { top: '64%', left: '38%' },
    canvasPos: { x: 190, y: 205 },
    quote: '100% org knowledge synchronization achieved across mental nodes.',
    status: 'STANDBY',
    spawned: false,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    role: 'Security & CVE Recon',
    chamberName: 'Red Enclave Stealth Hub',
    avatar: '🕷️',
    themeColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.55)',
    power: 'laser',
    screenPos: { top: '64%', left: '62%' },
    canvasPos: { x: 310, y: 205 },
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    status: 'STANDBY',
    spawned: false,
  },
  'scarlet-witch': {
    id: 'scarlet-witch',
    name: 'Wanda Maximoff',
    callsign: 'SCARLET WITCH',
    role: 'Reality Refactoring',
    chamberName: 'Chaos Magic Spire',
    avatar: '🔴',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    power: 'chaos',
    screenPos: { top: '35%', left: '35%' },
    canvasPos: { x: 175, y: 110 },
    quote: 'I can rewrite the codebase into any reality I choose.',
    status: 'STANDBY',
    spawned: false,
  }
};

// Copy spawned chambers into active pool
for (const [k, v] of Object.entries(MARVEL_CHAMBERS)) {
  if (v.spawned) state.roamingAgents[k] = { ...v };
}

// ── DOM References ──────────────────────────────────────────────────
let effectsCanvas, effectsCtx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer, chambersLayer;

// ── Initialization ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  effectsCanvas = document.getElementById('valleyEffectsCanvas');
  effectsCtx = effectsCanvas.getContext('2d');

  verboseStreamFeed = document.getElementById('verboseStreamFeed');
  resultDeliverableView = document.getElementById('resultDeliverableView');
  quantumPromptInput = document.getElementById('quantumPromptInput');
  dispatchMissionBtn = document.getElementById('dispatchMissionBtn');
  multiverseStrongholdDock = document.getElementById('multiverseStrongholdDock');
  incursionSpeechLayer = document.getElementById('incursionSpeechLayer');
  chambersLayer = document.getElementById('chambersLayer');

  initEffectsCanvas();
  renderChambersOnLandscape();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'All 9 Battleworld Chambers synchronized across the incursion valley.');
  }, 1200);

  // Setup periodic random respawn light beams to feel living
  setInterval(triggerRandomRespawnSequence, 4500);
});

// ── Canvas Setup & Cinematic FX Loop ────────────────────────────────
function initEffectsCanvas() {
  function resize() {
    const rect = effectsCanvas.parentElement.getBoundingClientRect();
    effectsCanvas.width = rect.width;
    effectsCanvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(effectsLoop);
}

function initParticles() {
  for (let i = 0; i < 50; i++) {
    state.particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 2.5 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      color: ['#00F0FF', '#FF0055', '#FFC83B', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.8 + 0.2,
    });
  }
}

function effectsLoop(time) {
  const w = effectsCanvas.width;
  const h = effectsCanvas.height;
  effectsCtx.clearRect(0, 0, w, h);

  // 1. Floating Quantum Energy Sparks
  for (const p of state.particles) {
    p.y -= p.speedY;
    if (p.y < 0) p.y = h;
    effectsCtx.fillStyle = p.color;
    effectsCtx.globalAlpha = p.opacity;
    effectsCtx.beginPath();
    effectsCtx.arc(p.x % w, p.y, p.size, 0, Math.PI * 2);
    effectsCtx.fill();
    effectsCtx.globalAlpha = 1.0;
  }

  // 2. Lake Water Shimmer & Waves
  const lakeX = w * 0.50;
  const lakeY = h * 0.68;
  const shimmer = effectsCtx.createRadialGradient(lakeX, lakeY, 10, lakeX, lakeY, w * 0.28);
  shimmer.addColorStop(0, 'rgba(0, 240, 255, 0.14)');
  shimmer.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
  shimmer.addColorStop(1, 'rgba(0, 0, 0, 0)');
  effectsCtx.fillStyle = shimmer;
  effectsCtx.fillRect(lakeX - w * 0.28, lakeY - h * 0.15, w * 0.56, h * 0.3);

  // 3. Incursion Sky Lightning Branches
  if (Math.random() < 0.02) {
    drawLightningBranch(w * (0.2 + Math.random() * 0.6), 15, w * (0.2 + Math.random() * 0.6), h * 0.38);
  }

  // 4. Render Active Respawn Energy Pillars
  state.respawnPillars = state.respawnPillars.filter(pillar => {
    pillar.life -= 0.025;
    renderRespawnPillar(pillar, w, h);
    return pillar.life > 0;
  });

  // 5. Render Active Combat Attacks between Chambers
  state.activeAttacks = state.activeAttacks.filter(a => {
    a.life -= 0.03;
    renderAttackEffect(a, w, h);
    return a.life > 0;
  });

  requestAnimationFrame(effectsLoop);
}

function drawLightningBranch(x1, y1, x2, y2) {
  effectsCtx.strokeStyle = '#FF0055';
  effectsCtx.shadowColor = '#FF0055';
  effectsCtx.shadowBlur = 12;
  effectsCtx.lineWidth = 1.8;

  effectsCtx.beginPath();
  effectsCtx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  while (curY < y2) {
    curX += (Math.random() - 0.5) * 20;
    curY += Math.random() * 25 + 10;
    effectsCtx.lineTo(curX, curY);
  }
  effectsCtx.stroke();
  effectsCtx.shadowBlur = 0;
}

function renderRespawnPillar(pillar, w, h) {
  effectsCtx.save();
  effectsCtx.globalAlpha = Math.sin(pillar.life * Math.PI) * 0.75;
  const targetX = pillar.x * w;
  const targetY = pillar.y * h;

  // Energy Beam from Sky to Chamber
  const beamGrad = effectsCtx.createLinearGradient(targetX, 0, targetX, targetY);
  beamGrad.addColorStop(0, pillar.color);
  beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
  effectsCtx.fillStyle = beamGrad;
  effectsCtx.shadowColor = pillar.color;
  effectsCtx.shadowBlur = 20;
  effectsCtx.fillRect(targetX - 4, 0, 8, targetY);

  // Ground Impact Ring
  effectsCtx.strokeStyle = pillar.color;
  effectsCtx.lineWidth = 2.5;
  effectsCtx.beginPath();
  effectsCtx.arc(targetX, targetY, 35 * (1.1 - pillar.life), 0, Math.PI * 2);
  effectsCtx.stroke();

  effectsCtx.restore();
}

function renderAttackEffect(attack, w, h) {
  effectsCtx.save();
  effectsCtx.globalAlpha = attack.life;
  effectsCtx.strokeStyle = attack.color;
  effectsCtx.shadowColor = attack.color;
  effectsCtx.shadowBlur = 14;
  effectsCtx.lineWidth = 2.5;

  effectsCtx.beginPath();
  effectsCtx.moveTo(attack.from.x * w, attack.from.y * h);
  effectsCtx.lineTo(attack.to.x * w, attack.to.y * h);
  effectsCtx.stroke();

  effectsCtx.restore();
}

// ── Render Meaningful Chambers on the Landscape ─────────────────────
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

    let avatarHtml = entity.image
      ? `<img src="${entity.image}" alt="${entity.name}" class="chamber-portrait-img" />`
      : `<span class="chamber-emoji-icon">${entity.avatar}</span>`;

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

// ── Chamber Activation & Random Respawn ─────────────────────────────
function triggerChamberActivation(entityId) {
  const entity = state.roamingAgents[entityId] || MARVEL_CHAMBERS[entityId];
  if (!entity) return;

  const chamberEl = document.getElementById(`chamber-${entityId}`);
  if (chamberEl) {
    chamberEl.classList.remove('chamber-respawn-active');
    void chamberEl.offsetWidth; // Trigger reflow
    chamberEl.classList.add('chamber-respawn-active');
  }

  // Add respawn light beam
  const numLeft = parseFloat(entity.screenPos.left) / 100;
  const numTop = parseFloat(entity.screenPos.top) / 100;
  state.respawnPillars.push({
    x: numLeft,
    y: numTop,
    color: entity.themeColor,
    life: 1.0,
  });

  // Trigger attack from this chamber to another
  const others = Object.values(state.roamingAgents).filter(a => a.id !== entityId);
  if (others.length > 0) {
    const target = others[Math.floor(Math.random() * others.length)];
    state.activeAttacks.push({
      from: { x: numLeft, y: numTop },
      to: { x: parseFloat(target.screenPos.left) / 100, y: parseFloat(target.screenPos.top) / 100 },
      color: entity.themeColor,
      life: 1.0,
    });
  }

  showCosmicSpeechBubble(entityId, entity.quote);
  appendVerboseStream(`● [${entity.callsign}] ${entity.chamberName} active (${entity.status}).`);
}

function triggerRandomRespawnSequence() {
  const agents = Object.values(state.roamingAgents);
  if (agents.length === 0) return;
  const lucky = agents[Math.floor(Math.random() * agents.length)];
  triggerChamberActivation(lucky.id);
}

// ── Multiverse Clash (All Chambers Synchronized Attack) ─────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [MULTIVERSE CLASH] All 9 Chambers unleashing synchronized energy grids!`);
  showCosmicSpeechBubble('tony-stark', 'All Multiverse Chambers, execute synchronized protocol!');

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
    card.style.borderColor = isSpawned ? hero.themeColor : '#231445';

    card.innerHTML = `
      <div class="roster-avatar">${hero.avatar}</div>
      <div class="roster-name">${hero.name}</div>
      <div class="roster-callsign">[${hero.callsign}]</div>
      <div style="font-size:9px; color:${isSpawned ? '#10B981' : '#8B78B0'}; font-weight:700;">
        ${isSpawned ? '● ONLINE' : '➕ SPAWN CHAMBER'}
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
  appendVerboseStream(`⚡ [CHAMBER INITIALIZED] ${hero.chamberName} brought online for ${hero.name}!`);
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
    chamberName: `${name} Sanctum`,
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.6)',
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
  appendVerboseStream(`🚀 [CUSTOM SANCTUM FORGED] ${newHero.chamberName} brought online!`);
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

  const rect = effectsCanvas.getBoundingClientRect();
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
      <div class="stronghold-icon">${entity.avatar}</div>
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
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the Battleworld mesh...`);

  showCosmicSpeechBubble('tony-stark', `Analyzing directive: "${prompt.slice(0, 35)}..."`);

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
    console.log('⚡ Connected to Stark Incursion Comms');
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
