/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // MARVEL BATTLEWORLD & MULTIVERSE INCURSIONS ENGINE
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  activeMissionId: null,
  arcReactorPowerPct: 99.8,
  particles: [],
  lightningBolts: [],
  incursionFractures: [],
};

// ── Marvel Multiverse Characters & Strongholds ──────────────────────
const MARVEL_ENTITIES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'TONY STARK',
    callsign: 'IRON MAN',
    role: 'GOD ORCHESTRATOR',
    sector: 'Stark Holographic Citadel',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    harness: 'StarkGodHarness (Claude/Gemini)',
    pos: { x: 75, y: 110 },
    suit: 'mark-85', // Red & Gold with glowing Cyan Arc Reactor
    state: 'commanding',
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'DOCTOR DOOM',
    callsign: 'VICTOR VON DOOM',
    role: 'LATVERIAN COMPILER & AST',
    sector: 'Latverian Spire',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    harness: 'LatverianASTEngine',
    pos: { x: 200, y: 90 },
    suit: 'doom-armor', // Titanium mask & Emerald cloak
    state: 'casting',
  },
  'thanos': {
    id: 'thanos',
    name: 'THANOS',
    callsign: 'THE MAD TITAN',
    role: 'RATE LIMIT & ARC BALANCER',
    sector: 'Sanctuary II Incursion',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.4)',
    harness: 'InfinityGauntletGrid',
    pos: { x: 330, y: 90 },
    suit: 'thanos-gold', // Golden armor & Infinity Gauntlet
    state: 'balancing',
  },
  'kang': {
    id: 'kang',
    name: 'KANG THE CONQUEROR',
    callsign: 'HE WHO REMAINS',
    role: 'MULTIVERSE BRANCHING',
    sector: 'Quantum Chrono-Nexus',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    harness: 'QuantumTimelineEngine',
    pos: { x: 430, y: 100 },
    suit: 'kang-armor', // Purple armor & Cyan chrono-visor
    state: 'timewarp',
  },
  'captain-america': {
    id: 'captain-america',
    name: 'STEVE ROGERS',
    callsign: 'CAPTAIN AMERICA',
    role: 'VIBRANIUM QA AUDITOR',
    sector: 'Wakandan Bastion',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    harness: 'VibraniumQAHarness',
    pos: { x: 80, y: 240 },
    suit: 'cap-stealth', // Blue tactical suit with round shield
    state: 'guarding',
  },
  'spider-man': {
    id: 'spider-man',
    name: 'PETER PARKER',
    callsign: 'SPIDER-MAN',
    role: 'FRONTEND ARCHITECT',
    sector: 'Web Vanguard Outpost',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    harness: 'SpideyUIEngine',
    pos: { x: 170, y: 235 },
    suit: 'spidey-nanotech', // Red & Blue Stark Suit
    state: 'slinging',
  },
  'hulk': {
    id: 'hulk',
    name: 'BRUCE BANNER',
    callsign: 'THE INCREDIBLE HULK',
    role: 'GAMMA LOGIC OPTIMIZER',
    sector: 'Gamma Waste Crags',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    harness: 'GammaLogicOptimizer',
    pos: { x: 260, y: 245 },
    suit: 'hulk-titan', // Massive green gamma titan
    state: 'smashing',
  },
  'thor': {
    id: 'thor',
    name: 'THOR ODINSON',
    callsign: 'GOD OF THUNDER',
    role: 'DEVOPS & SPM MANIFEST',
    sector: 'Asgardian Storm Peak',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.4)',
    harness: 'MjolnirDeployPipeline',
    pos: { x: 350, y: 235 },
    suit: 'thor-armor', // Silver armor, red cape, Mjolnir
    state: 'charging',
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'STEPHEN STRANGE',
    callsign: 'SORCERER SUPREME',
    role: 'TEMPORAL MEMORY & RECALL',
    sector: 'Kamar-Taj Sanctum',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    harness: 'EyeOfAgamottoMemory',
    pos: { x: 430, y: 240 },
    suit: 'strange-robes', // Blue sorcerer robes, red cloak
    state: 'meditating',
  },
  'vision': {
    id: 'vision',
    name: 'VISION',
    callsign: 'MIND STONE SYNAPSE',
    role: 'ORGANIZATIONAL KNOWLEDGE',
    sector: 'Mind Stone Matrix',
    avatar: '💎',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    harness: 'MindStoneMemoryMesh',
    pos: { x: 215, y: 165 },
    suit: 'vision-android', // Crimson & Green with yellow stone
    state: 'synthesizing',
  }
};

// ── DOM References ──────────────────────────────────────────────────
let canvas, ctx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer;
let arcReactorGridPill, incursionStatusPill;

// ── Initialization ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('battleworldCanvas');
  ctx = canvas.getContext('2d');

  verboseStreamFeed = document.getElementById('verboseStreamFeed');
  resultDeliverableView = document.getElementById('resultDeliverableView');
  quantumPromptInput = document.getElementById('quantumPromptInput');
  dispatchMissionBtn = document.getElementById('dispatchMissionBtn');
  multiverseStrongholdDock = document.getElementById('multiverseStrongholdDock');
  incursionSpeechLayer = document.getElementById('incursionSpeechLayer');
  arcReactorGridPill = document.getElementById('arcReactorGridPill');
  incursionStatusPill = document.getElementById('incursionStatusPill');

  initCanvas();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initCosmicParticles();
  
  // Show initial dramatic incursion line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Multiverse battleworld initialized. Strike team assembled.');
  }, 1200);
});

// ── Canvas Setup & Cosmic Game Loop ─────────────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(cosmicGameLoop);
}

function initCosmicParticles() {
  for (let i = 0; i < 45; i++) {
    state.particles.push({
      x: Math.random() * 500,
      y: Math.random() * 320,
      size: Math.random() * 2 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      color: ['#00F0FF', '#A855F7', '#FFC83B', '#10B981'][Math.floor(Math.random() * 4)],
      opacity: Math.random() * 0.7 + 0.3,
    });
  }
}

function cosmicGameLoop(time) {
  drawBattleworldValley(time);
  requestAnimationFrame(cosmicGameLoop);
}

// ── Draw Battleworld Cosmic Incursions Valley ────────────────────────
function drawBattleworldValley(time) {
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.max(1, Math.min(w / 500, h / 320));

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Cosmic Deep Sky & Incursion Fractures
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 180);
  skyGradient.addColorStop(0, '#060114');
  skyGradient.addColorStop(0.5, '#12042C');
  skyGradient.addColorStop(1, '#1A083D');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, w / scale, h / scale);

  // Incursion Cosmic Fracture in Sky
  drawIncursionFracture(240, 20, 290, 80, time);

  // Floating Quantum Particles
  for (const p of state.particles) {
    p.y -= p.speedY;
    if (p.y < 0) p.y = 320;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }

  // 2. Distant Obsidian Mountain Peaks
  ctx.fillStyle = '#0F0624';
  ctx.beginPath();
  ctx.moveTo(0, 140);
  ctx.lineTo(80, 70);
  ctx.lineTo(150, 110);
  ctx.lineTo(230, 50);
  ctx.lineTo(310, 95);
  ctx.lineTo(390, 40);
  ctx.lineTo(500, 120);
  ctx.lineTo(500, 320);
  ctx.lineTo(0, 320);
  ctx.closePath();
  ctx.fill();

  // Mid-ground Jagged Fissure Valley
  ctx.fillStyle = '#080214';
  ctx.beginPath();
  ctx.moveTo(0, 160);
  ctx.lineTo(100, 120);
  ctx.lineTo(200, 145);
  ctx.lineTo(320, 115);
  ctx.lineTo(440, 140);
  ctx.lineTo(500, 155);
  ctx.lineTo(500, 320);
  ctx.lineTo(0, 320);
  ctx.closePath();
  ctx.fill();

  // Glowing Quantum Lava / Fissure Streams
  ctx.strokeStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 200);
  ctx.quadraticCurveTo(140, 190, 240, 220);
  ctx.quadraticCurveTo(360, 250, 500, 210);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Render Sector Strongholds
  drawStarkCitadel(75, 110, time);
  drawDoomSpire(200, 90, time);
  drawThanosSanctuary(330, 90, time);
  drawKangNexus(430, 100, time);

  // 4. Render All Realistic Marvel Heroes & Villains
  for (const entity of Object.values(MARVEL_ENTITIES)) {
    drawMarvelEntity(entity, time);
  }

  ctx.restore();
}

// ── Draw Incursion Sky Fracture ─────────────────────────────────────
function drawIncursionFracture(x1, y1, x2, y2, time) {
  ctx.strokeStyle = '#FF0077';
  ctx.shadowColor = '#FF0077';
  ctx.shadowBlur = 12;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  const midX = (x1 + x2) / 2 + Math.sin(time * 0.003) * 6;
  const midY = (y1 + y2) / 2 + Math.cos(time * 0.003) * 4;
  ctx.lineTo(midX, midY);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ── Stronghold Landmark Visuals ─────────────────────────────────────
function drawStarkCitadel(x, y, time) {
  // Holographic Arc Reactor Pyramid
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
  ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y - 35);
  ctx.lineTo(x - 30, y + 15);
  ctx.lineTo(x + 30, y + 15);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Floating Core
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y - 10 + Math.sin(time * 0.005) * 3, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawDoomSpire(x, y, time) {
  // Latverian Arcane Tower
  ctx.fillStyle = '#171129';
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 16, y - 30, 32, 45);
  ctx.strokeRect(x - 16, y - 30, 32, 45);

  // Emerald Brazier Flame
  ctx.fillStyle = '#10B981';
  ctx.shadowColor = '#10B981';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(x, y - 35, 3 + Math.sin(time * 0.008) * 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function drawThanosSanctuary(x, y, time) {
  // Golden Cosmic Altar
  ctx.fillStyle = '#311D05';
  ctx.strokeStyle = '#FFC83B';
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 20, y - 22, 40, 35);
  ctx.strokeRect(x - 20, y - 22, 40, 35);

  // 6 Infinity Stone Glows
  const colors = ['#A855F7', '#38BDF8', '#EF4444', '#FFC83B', '#10B981', '#F97316'];
  colors.forEach((c, idx) => {
    ctx.fillStyle = c;
    ctx.shadowColor = c;
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(x - 15 + idx * 6, y - 28, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}

function drawKangNexus(x, y, time) {
  // Rotating Chrono-Rings
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y - 10, 24, 8, time * 0.002, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(x, y - 10, 20, 6, -time * 0.002, 0, Math.PI * 2);
  ctx.stroke();
}

// ── Realistic Marvel Character Renderers ────────────────────────────
function drawMarvelEntity(entity, time) {
  const x = entity.pos.x;
  const y = entity.pos.y;

  ctx.save();

  switch (entity.suit) {
    case 'mark-85': // Iron Man (Red & Gold with glowing cyan arc reactor)
      // Head
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(x - 5, y - 16, 10, 8);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(x - 4, y - 14, 8, 4);
      // Cyan Visor Glow
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 4;
      ctx.fillRect(x - 3, y - 13, 2, 1.5);
      ctx.fillRect(x + 1, y - 13, 2, 1.5);
      // Torso & Arc Reactor
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(x - 7, y - 8, 14, 12);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(x - 7, y - 8, 3, 12);
      ctx.fillRect(x + 4, y - 8, 3, 12);
      // Chest Unibeam
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(x, y - 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      // Repulsor Hover Glow under boots
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(x - 4, y + 8, 3, 3);
      ctx.fillRect(x + 1, y + 8, 3, 3);
      break;

    case 'doom-armor': // Doctor Doom (Titanium mask + emerald cloak)
      // Emerald Hood & Titanium Mask
      ctx.fillStyle = '#065F46';
      ctx.fillRect(x - 7, y - 18, 14, 10);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(x - 4, y - 14, 8, 6);
      // Mask Eyes
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 3, y - 12, 2, 2);
      ctx.fillRect(x + 1, y - 12, 2, 2);
      // Emerald Cloak Body & Gold Clasp
      ctx.fillStyle = '#047857';
      ctx.fillRect(x - 8, y - 8, 16, 15);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(x - 4, y - 7, 8, 2);
      break;

    case 'thanos-gold': // Thanos (Gold armor + purple skin + Infinity Gauntlet)
      // Purple Head & Gold Helmet
      ctx.fillStyle = '#8B5CF6';
      ctx.fillRect(x - 7, y - 18, 14, 9);
      ctx.fillStyle = '#D97706';
      ctx.fillRect(x - 7, y - 18, 14, 4);
      // Massive Golden Armor Torso
      ctx.fillStyle = '#B45309';
      ctx.fillRect(x - 9, y - 9, 18, 14);
      // Infinity Gauntlet (Left hand)
      ctx.fillStyle = '#FFC83B';
      ctx.shadowColor = '#FFC83B';
      ctx.shadowBlur = 6;
      ctx.fillRect(x - 13, y - 4, 4, 8);
      ctx.shadowBlur = 0;
      break;

    case 'kang-armor': // Kang (Purple armor + cyan faceplate visor)
      ctx.fillStyle = '#581C87';
      ctx.fillRect(x - 6, y - 17, 12, 9);
      // Cyan Visor Line
      ctx.fillStyle = '#38BDF8';
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 5;
      ctx.fillRect(x - 4, y - 13, 8, 3);
      ctx.shadowBlur = 0;
      // Green/Purple Tunic
      ctx.fillStyle = '#065F46';
      ctx.fillRect(x - 7, y - 8, 14, 13);
      break;

    case 'cap-stealth': // Captain America (Blue suit + Vibranium shield)
      // Blonde Hair / Helmet
      ctx.fillStyle = '#1E40AF';
      ctx.fillRect(x - 5, y - 16, 10, 8);
      // Blue Tactical Suit
      ctx.fillStyle = '#1D4ED8';
      ctx.fillRect(x - 6, y - 8, 12, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 1, y - 5, 2, 2); // Star
      // Round Vibranium Shield
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(x - 8, y - 1, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - 8, y - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(x - 8, y - 1, 2, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'spidey-nanotech': // Spider-Man (Red & Blue suit)
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x - 5, y - 15, 10, 8);
      // White Big Spidey Eyes
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x - 4, y - 13, 3, 3);
      ctx.fillRect(x + 1, y - 13, 3, 3);
      // Red & Blue Body
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(x - 6, y - 7, 12, 12);
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x - 3, y - 7, 6, 12);
      break;

    case 'hulk-titan': // Hulk (Massive Gamma Titan)
      ctx.fillStyle = '#15803D';
      ctx.fillRect(x - 9, y - 22, 18, 11);
      ctx.fillStyle = '#14532D';
      ctx.fillRect(x - 9, y - 22, 18, 4); // Dark hair
      // Massive Green Torso
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(x - 12, y - 11, 24, 16);
      // Purple Pants
      ctx.fillStyle = '#7E22CE';
      ctx.fillRect(x - 10, y + 5, 20, 8);
      break;

    case 'thor-armor': // Thor (Armor, red cape, Mjolnir)
      ctx.fillStyle = '#FDE047'; // Blonde hair
      ctx.fillRect(x - 5, y - 16, 10, 8);
      // Red Cape behind
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(x - 8, y - 7, 16, 15);
      // Silver Armor Torso
      ctx.fillStyle = '#64748B';
      ctx.fillRect(x - 6, y - 7, 12, 12);
      // Mjolnir Hammer
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(x + 8, y - 4, 6, 4);
      ctx.fillStyle = '#78350F';
      ctx.fillRect(x + 10, y, 2, 6);
      break;

    case 'strange-robes': // Doctor Strange (Robes + Tao mandala)
      ctx.fillStyle = '#1E3A8A';
      ctx.fillRect(x - 6, y - 15, 12, 14);
      // Red Cloak of Levitation
      ctx.fillStyle = '#DC2626';
      ctx.fillRect(x - 8, y - 13, 2, 14);
      ctx.fillRect(x + 6, y - 13, 2, 14);
      // Glowing Tao Mandala Spell in Hand
      ctx.strokeStyle = '#F97316';
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(x + 8, y, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    default:
      ctx.fillStyle = entity.themeColor || '#00F0FF';
      ctx.fillRect(x - 5, y - 10, 10, 14);
      break;
  }

  ctx.restore();
}

// ── Speech Bubble Rendering ─────────────────────────────────────────
function showCosmicSpeechBubble(entityId, text, durationMs = 6000) {
  const entity = MARVEL_ENTITIES[entityId];
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
  const scale = Math.max(1, Math.min(canvas.width / 500, canvas.height / 320));
  const screenX = entity.pos.x * scale;
  const screenY = entity.pos.y * scale;

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

  for (const entity of Object.values(MARVEL_ENTITIES)) {
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
        <div class="stronghold-sub">${entity.sector}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      showCosmicSpeechBubble(entity.id, `${entity.role} operational in ${entity.sector}.`);
      appendVerboseStream(`● [${entity.callsign}] Telemetry active & synchronized with Stark Mesh.`);
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

    entry.innerHTML = `<span class="stream-bullet" style="color:${color}">●</span> <span class="stream-hero-tag" style="color:${color}">[${escapeHtml(tagName)}]</span> ${escapeHtml(rest)}`;
  } else {
    entry.innerHTML = `<span class="stream-bullet cyan">●</span> ${escapeHtml(text)}`;
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
        if (MARVEL_ENTITIES[speaker]) {
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
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
