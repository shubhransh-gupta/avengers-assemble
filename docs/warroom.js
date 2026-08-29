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
  portalParticles: [], // Purple Nether portal particles
  activeAttacks: [],
  selectedAgentId: 'tony-stark',
  roamingAgents: {},
  thunderboltTimer: 0,
};

// ── Minecraft Avengers Voxel Characters & Skin Data ─────────────────
const MINECRAFT_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    stronghold: 'Stark Voxel Tower',
    avatar: '🦾',
    image: './assets/iron_man.jpg',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    skinType: 'iron-man',
    power: 'laser',
    pos: { x: 130, y: 110 },
    targetPos: { x: 130, y: 110 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.4,
    quote: 'JARVIS, decompose master prompt into redstone DAG blocks.',
    hearts: 10,
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    stronghold: 'Latverian Voxel Castle',
    avatar: '👑',
    image: './assets/doctor_doom.jpg',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.65)',
    skinType: 'doctor-doom',
    power: 'runes',
    pos: { x: 410, y: 140 },
    targetPos: { x: 410, y: 140 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.1,
    quote: 'Doom commands the syntax trees. Imperfect code shall be banished to the Nether.',
    hearts: 10,
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    role: 'DevOps & Package Manifest',
    stronghold: 'Thunderstorm Vortex',
    avatar: '⚡',
    image: './assets/thor.jpg',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.65)',
    skinType: 'thor',
    power: 'thunder',
    pos: { x: 270, y: 60 },
    targetPos: { x: 270, y: 60 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.3,
    quote: 'By Mjolnir, summoned thunderstorm CI/CD and Swift packages!',
    hearts: 10,
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    stronghold: 'Obsidian Mountain Peak',
    avatar: '🪐',
    image: './assets/thanos.jpg',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.65)',
    skinType: 'thanos',
    power: 'cosmic',
    pos: { x: 60, y: 80 },
    targetPos: { x: 60, y: 80 },
    walkTimer: 0,
    isWalking: false,
    speed: 0.9,
    quote: 'Rate limits, memory, and tokens in perfect equilibrium.',
    hearts: 10,
    spawned: true,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    role: 'Quantum Timeline Branching',
    stronghold: 'Quantum Chrono-Bridge',
    avatar: '⏳',
    image: './assets/kang_conqueror.jpg',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.65)',
    skinType: 'kang',
    power: 'chrono',
    pos: { x: 260, y: 200 },
    targetPos: { x: 260, y: 200 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.2,
    quote: 'Simulated 14 billion voxel timelines. Reality-616 targeted.',
    hearts: 10,
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    stronghold: 'Mystic End Portal Spire',
    avatar: '🔮',
    image: './assets/doctor_strange.jpg',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.65)',
    skinType: 'doctor-strange',
    power: 'mandala',
    pos: { x: 460, y: 90 },
    targetPos: { x: 460, y: 90 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.1,
    quote: 'Temporal snapshots preserved in the Ender matrix for instant rollback.',
    hearts: 10,
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    role: 'Vibranium QA Auditor',
    stronghold: 'Wakandan Outpost House',
    avatar: '🛡️',
    image: './assets/captain_america.jpg',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.65)',
    skinType: 'captain-america',
    power: 'shield',
    pos: { x: 180, y: 250 },
    targetPos: { x: 180, y: 250 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.2,
    quote: 'Standards inspection ready. Sound off, soldiers.',
    hearts: 10,
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    stronghold: 'Web Forest Outpost',
    avatar: '🕸️',
    image: './assets/spider_man.jpg',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.65)',
    skinType: 'spider-man',
    power: 'web',
    pos: { x: 390, y: 260 },
    targetPos: { x: 390, y: 260 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.5,
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    hearts: 10,
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    role: 'Gamma Logic Optimizer',
    stronghold: 'Emerald Gamma Meadow',
    avatar: '🟢',
    image: './assets/hulk.jpg',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.65)',
    skinType: 'hulk',
    power: 'gamma',
    pos: { x: 290, y: 230 },
    targetPos: { x: 290, y: 230 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.0,
    quote: 'HULK SMASH VOXEL BLOCKS AND REFACTOR FOR MAX PERFORMANCE!',
    hearts: 12,
    spawned: true,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    role: 'Security & CVE Recon',
    stronghold: 'Redstone Stealth Enclave',
    avatar: '🕷️',
    image: './assets/black_widow.jpg',
    themeColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.65)',
    skinType: 'black-widow',
    power: 'laser',
    pos: { x: 190, y: 190 },
    targetPos: { x: 190, y: 190 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.4,
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    hearts: 10,
    spawned: false,
  }
};

// Copy spawned characters into active roaming pool
for (const [k, v] of Object.entries(MINECRAFT_HEROES)) {
  if (v.spawned) state.roamingAgents[k] = { ...v };
}

// ── DOM References ──────────────────────────────────────────────────
let canvas, ctx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer;

// ── Initialization ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('minecraftCanvas');
  ctx = canvas.getContext('2d');

  verboseStreamFeed = document.getElementById('verboseStreamFeed');
  resultDeliverableView = document.getElementById('resultDeliverableView');
  quantumPromptInput = document.getElementById('quantumPromptInput');
  dispatchMissionBtn = document.getElementById('dispatchMissionBtn');
  multiverseStrongholdDock = document.getElementById('multiverseStrongholdDock');
  incursionSpeechLayer = document.getElementById('incursionSpeechLayer');

  initCanvas();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initVoxelRainParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Minecraft Avengers Voxel world online! Click any block to walk.');
  }, 1200);

  // Periodic autonomous walking & DAG pulse
  setInterval(triggerAutonomousHeroPatrol, 5000);
  setInterval(triggerDAGSimulationPulse, 6000);
});

// ── Canvas Setup & Simulation Engine Loop ───────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(simulationLoop);

  // Click on Minecraft terrain to command selected hero to walk to that block!
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(1, Math.min(canvas.width / 500, canvas.height / 320));
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    // Check if clicked directly on a hero
    let clickedHero = null;
    for (const hero of Object.values(state.roamingAgents)) {
      if (Math.hypot(hero.pos.x - clickX, hero.pos.y - clickY) < 18) {
        clickedHero = hero;
        break;
      }
    }

    if (clickedHero) {
      state.selectedAgentId = clickedHero.id;
      triggerHeroAttack(clickedHero);
      showCosmicSpeechBubble(clickedHero.id, clickedHero.quote);
      appendVerboseStream(`● [${clickedHero.callsign}] Selected at block (${Math.round(clickedHero.pos.x)}, ${Math.round(clickedHero.pos.y)}).`);
    } else {
      // Command selected or nearest hero to walk to block coordinate
      const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
      if (hero) {
        hero.targetPos = { x: clickX, y: clickY };
        hero.isWalking = true;
        spawnPortalParticles(clickX, clickY, hero.themeColor);
        showCosmicSpeechBubble(hero.id, `Walking to block (${Math.round(clickX)}, ${Math.round(clickY)})`);
      }
    }
  });
}

function initVoxelRainParticles() {
  for (let i = 0; i < 50; i++) {
    state.particles.push({
      x: Math.random() * 500,
      y: Math.random() * 320,
      size: Math.random() * 3 + 1.5,
      speedY: Math.random() * 1.5 + 0.8,
      color: ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7', '#10B981'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.7 + 0.3,
    });
  }
}

function simulationLoop(time) {
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.max(1, Math.min(w / 500, h / 320));

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Pixelated Voxel Rain / Storm Particles
  for (const p of state.particles) {
    p.y += p.speedY;
    if (p.y > 320) { p.y = 0; p.x = Math.random() * 500; }
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.globalAlpha = 1.0;
  }

  // 2. Lake Water Shimmer Waves
  const lakeX = 330;
  const lakeY = 240;
  const shimmer = ctx.createRadialGradient(lakeX, lakeY, 10, lakeX, lakeY, 120);
  shimmer.addColorStop(0, 'rgba(0, 240, 255, 0.22)');
  shimmer.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
  shimmer.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = shimmer;
  ctx.fillRect(lakeX - 120, lakeY - 40, 240, 80);

  // 3. Render Neural Redstone DAG Links
  renderDAGMeshLinks(time);

  // 4. Render Active DAG Data Pulses (Traveling Block Packets)
  renderDAGPulses();

  // 5. Pixelated Thunderstorm Lightning Strikes
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.015) {
    drawVoxelLightning(270, 20, 270, 160);
  }

  // 6. Update Hero Positions & Walking Cycles
  updateHeroes(time);

  // 7. Render All 3D Minecraft Voxel Heroes (Walking & Bobbing)
  for (const hero of Object.values(state.roamingAgents)) {
    renderMinecraftVoxelSkin(hero, time);
  }

  // 8. Render Portal Spawn Particles
  renderPortalParticles();

  // 9. Render Active Combat Attacks between Characters
  renderAttackEffects();

  ctx.restore();
  requestAnimationFrame(simulationLoop);
}

// ── Hero Walking Physics & Autonomous Navigation ────────────────────
function updateHeroes(time) {
  for (const hero of Object.values(state.roamingAgents)) {
    // Flying / Hovering for Iron Man & Doctor Strange
    if (hero.id === 'tony-stark' || hero.id === 'doctor-strange') {
      hero.pos.y += Math.sin(time * 0.005 + hero.pos.x) * 0.25;
    }

    const dx = hero.targetPos.x - hero.pos.x;
    const dy = hero.targetPos.y - hero.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      hero.isWalking = true;
      hero.walkTimer += 0.15 * hero.speed;
      hero.pos.x += (dx / dist) * hero.speed;
      hero.pos.y += (dy / dist) * hero.speed;
    } else {
      hero.isWalking = false;
      hero.walkTimer = 0;
    }
  }
}

function triggerAutonomousHeroPatrol() {
  const heroes = Object.values(state.roamingAgents);
  if (heroes.length === 0) return;
  const lucky = heroes[Math.floor(Math.random() * heroes.length)];

  // Pick random landmark to walk to
  const landmarks = [
    { x: 130, y: 110 }, // Stark Tower
    { x: 410, y: 140 }, // Doom Castle
    { x: 270, y: 60 },  // Thunder Vortex
    { x: 260, y: 200 }, // Chrono Bridge
    { x: 180, y: 250 }, // Wakandan Outpost
    { x: 390, y: 260 }, // Web Forest
    { x: 290, y: 230 }, // Gamma Meadow
  ];

  lucky.targetPos = landmarks[Math.floor(Math.random() * landmarks.length)];
  lucky.isWalking = true;
}

// ── 3D Minecraft Voxel Character Renderer ───────────────────────────
function renderMinecraftVoxelSkin(hero, time) {
  const x = hero.pos.x;
  const y = hero.pos.y;
  const isWalking = hero.isWalking;
  const walkPhase = hero.walkTimer;
  const swingAngle = isWalking ? Math.sin(walkPhase) * 0.6 : 0;
  const scale = hero.id === 'hulk' ? 1.6 : 1.0;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  // Bobbing during walk
  const bobY = isWalking ? Math.abs(Math.sin(walkPhase * 2)) * 2 : 0;

  // Ground Shadow (Voxel Rectangle)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(-8, 14, 16, 6);

  // Selection Indicator
  if (hero.id === state.selectedAgentId) {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -26 - bobY, 24, 44);
  }

  // 1. LEGS (Articulated Left & Right Leg Swinging)
  ctx.save();
  // Left Leg
  ctx.fillStyle = getLegColor(hero, true);
  ctx.save();
  ctx.translate(-3, 4 - bobY);
  ctx.rotate(swingAngle);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  // Right Leg
  ctx.fillStyle = getLegColor(hero, false);
  ctx.save();
  ctx.translate(3, 4 - bobY);
  ctx.rotate(-swingAngle);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();
  ctx.restore();

  // 2. TORSO / BODY
  ctx.save();
  ctx.translate(0, -6 - bobY);
  ctx.fillStyle = getTorsoColor(hero);
  ctx.fillRect(-6, 0, 12, 12);

  // Torso Front Details
  renderTorsoDetails(hero);
  ctx.restore();

  // 3. ARMS & HELD ITEMS (Articulated Left & Right Arm Swinging)
  // Left Arm
  ctx.save();
  ctx.translate(-8, -5 - bobY);
  ctx.rotate(-swingAngle);
  ctx.fillStyle = getArmColor(hero, true);
  ctx.fillRect(-2, 0, 4, 11);
  renderHeldItem(hero, 'left');
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(8, -5 - bobY);
  ctx.rotate(swingAngle);
  ctx.fillStyle = getArmColor(hero, false);
  ctx.fillRect(-2, 0, 4, 11);
  renderHeldItem(hero, 'right');
  ctx.restore();

  // 4. HEAD (3D Shaded Voxel Head Cube)
  ctx.save();
  ctx.translate(0, -16 - bobY);
  ctx.fillStyle = getHeadColor(hero);
  ctx.fillRect(-6, -6, 12, 10);

  // Face Skin & Eyes
  renderFaceDetails(hero);
  ctx.restore();

  // 5. MINECRAFT FLOATING NAME TAG & HEARTS
  ctx.restore();
  renderMinecraftNameTag(hero, x, y - 24 - (bobY * scale));
}

// ── Minecraft Character Skin Palettes & Details ─────────────────────
function getHeadColor(hero) {
  switch (hero.skinType) {
    case 'iron-man': return '#B91C1C';
    case 'doctor-doom': return '#065F46';
    case 'thor': return '#FBBF24';
    case 'thanos': return '#8B5CF6';
    case 'kang': return '#581C87';
    case 'doctor-strange': return '#1E1B4B';
    case 'captain-america': return '#1E40AF';
    case 'spider-man': return '#DC2626';
    case 'hulk': return '#15803D';
    default: return '#1E293B';
  }
}

function getTorsoColor(hero) {
  switch (hero.skinType) {
    case 'iron-man': return '#DC2626';
    case 'doctor-doom': return '#047857';
    case 'thor': return '#475569';
    case 'thanos': return '#B45309';
    case 'kang': return '#065F46';
    case 'doctor-strange': return '#1D4ED8';
    case 'captain-america': return '#1D4ED8';
    case 'spider-man': return '#2563EB';
    case 'hulk': return '#16A34A';
    default: return '#334155';
  }
}

function getArmColor(hero, isLeft) {
  switch (hero.skinType) {
    case 'iron-man': return '#F59E0B';
    case 'doctor-doom': return '#94A3B8';
    case 'thor': return '#E2E8F0';
    case 'thanos': return isLeft ? '#FFC83B' : '#8B5CF6';
    case 'kang': return '#38BDF8';
    case 'doctor-strange': return '#DC2626';
    case 'captain-america': return '#DC2626';
    case 'spider-man': return '#DC2626';
    case 'hulk': return '#16A34A';
    default: return '#64748B';
  }
}

function getLegColor(hero, isLeft) {
  switch (hero.skinType) {
    case 'iron-man': return '#B91C1C';
    case 'doctor-doom': return '#065F46';
    case 'thor': return '#1E293B';
    case 'thanos': return '#78350F';
    case 'kang': return '#581C87';
    case 'doctor-strange': return '#1E1B4B';
    case 'captain-america': return '#1E3A8A';
    case 'spider-man': return '#1E40AF';
    case 'hulk': return '#7E22CE'; // Purple pants!
    default: return '#0F172A';
  }
}

function renderTorsoDetails(hero) {
  if (hero.skinType === 'iron-man') {
    // Glowing Cyan Triangular Arc Reactor Block
    ctx.fillStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 6;
    ctx.fillRect(-2, 3, 4, 4);
    ctx.shadowBlur = 0;
  } else if (hero.skinType === 'captain-america') {
    // White Star & Stripes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2, 2, 4, 3);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(-4, 7, 8, 3);
  } else if (hero.skinType === 'doctor-doom') {
    // Gold Cloak Clasps
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-4, 1, 3, 2); ctx.fillRect(1, 1, 3, 2);
  } else if (hero.skinType === 'doctor-strange') {
    // Eye of Agamotto amulet
    ctx.fillStyle = '#10B981';
    ctx.fillRect(-2, 2, 4, 3);
  }
}

function renderFaceDetails(hero) {
  if (hero.skinType === 'iron-man') {
    // Gold Faceplate & Glowing Visor Eyes
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-4, -4, 8, 6);
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(-3, -3, 2, 1.5); ctx.fillRect(1, -3, 2, 1.5);
  } else if (hero.skinType === 'doctor-doom') {
    // Titanium Mask Face
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-4, -4, 8, 7);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, -3, 2, 2); ctx.fillRect(1, -3, 2, 2);
  } else if (hero.skinType === 'kang') {
    // Glowing Cyan Visor Line
    ctx.fillStyle = '#38BDF8';
    ctx.fillRect(-4, -3, 8, 2);
  } else if (hero.skinType === 'spider-man') {
    // White Spider Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-4, -3, 3, 3); ctx.fillRect(1, -3, 3, 3);
  } else {
    // Standard Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-3, -3, 2, 2); ctx.fillRect(1, -3, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-2, -2, 1, 1); ctx.fillRect(2, -2, 1, 1);
  }
}

function renderHeldItem(hero, hand) {
  if (hero.skinType === 'thor' && hand === 'right') {
    // 3D Pixelated Mjolnir Hammer
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(2, 6, 7, 6);
    ctx.fillStyle = '#78350F'; ctx.fillRect(4, 12, 3, 6);
    ctx.strokeStyle = '#00D5E8'; ctx.strokeRect(2, 6, 7, 6);
  } else if (hero.skinType === 'captain-america' && hand === 'left') {
    // 3D Vibranium Shield on arm
    ctx.fillStyle = '#DC2626'; ctx.fillRect(-8, 3, 8, 8);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-7, 4, 6, 6);
    ctx.fillStyle = '#2563EB'; ctx.fillRect(-6, 5, 4, 4);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-5, 6, 2, 2);
  } else if (hero.skinType === 'thanos' && hand === 'left') {
    // 3D Golden Infinity Gauntlet with 6 glowing gems
    ctx.fillStyle = '#FFC83B'; ctx.fillRect(-4, 7, 6, 7);
    ctx.fillStyle = '#A855F7'; ctx.fillRect(-3, 8, 1.5, 1.5);
    ctx.fillStyle = '#00F0FF'; ctx.fillRect(-1, 8, 1.5, 1.5);
    ctx.fillStyle = '#EF4444'; ctx.fillRect(1, 8, 1.5, 1.5);
  }
}

// ── Minecraft Name Tag & Hearts ─────────────────────────────────────
function renderMinecraftNameTag(hero, x, y) {
  ctx.save();
  const label = hero.callsign;
  ctx.font = '8px "Press Start 2P", monospace';
  const textWidth = ctx.measureText(label).width;

  // Black Minecraft tag background with border
  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(x - (textWidth / 2) - 4, y - 10, textWidth + 8, 12);
  ctx.strokeStyle = hero.themeColor || '#00F0FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - (textWidth / 2) - 4, y - 10, textWidth + 8, 12);

  // Minecraft text with drop shadow
  ctx.fillStyle = '#000000';
  ctx.fillText(label, x - (textWidth / 2) + 1, y - 1);
  ctx.fillStyle = hero.themeColor || '#FFFFFF';
  ctx.fillText(label, x - (textWidth / 2), y - 2);

  ctx.restore();
}

// ── Redstone DAG Laser Mesh & Data Pulses ───────────────────────────
function renderDAGMeshLinks(time) {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  ctx.save();
  ctx.lineWidth = 1.8;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;

    const grad = ctx.createLinearGradient(stark.pos.x, stark.pos.y, agent.pos.x, agent.pos.y);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(1, agent.glowColor || 'rgba(168, 85, 247, 0.35)');

    ctx.strokeStyle = grad;
    ctx.shadowColor = agent.themeColor || '#00F0FF';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(stark.pos.x, stark.pos.y);
    ctx.lineTo(agent.pos.x, agent.pos.y);
    ctx.stroke();
  }

  ctx.restore();
}

function renderDAGPulses() {
  state.dagPulses = state.dagPulses.filter(pulse => {
    pulse.progress += 0.03;
    if (pulse.progress >= 1.0) return false;

    const curX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
    const curY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

    ctx.save();
    ctx.fillStyle = pulse.color;
    ctx.shadowColor = pulse.color;
    ctx.shadowBlur = 12;
    // Draw voxel block packet
    ctx.fillRect(curX - 3, curY - 3, 6, 6);
    ctx.restore();

    return true;
  });
}

function triggerDAGSimulationPulse() {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;
    state.dagPulses.push({
      from: { ...stark.pos },
      to: { ...agent.pos },
      color: agent.themeColor || '#00F0FF',
      progress: 0,
    });
  }
}

// ── Voxel Lightning & Attacks ───────────────────────────────────────
function drawVoxelLightning(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  while (curY < y2) {
    curX += (Math.floor(Math.random() * 3) - 1) * 14;
    curY += 18;
    ctx.lineTo(curX, curY);
  }
  ctx.stroke();
  ctx.restore();
}

function triggerHeroAttack(hero) {
  const others = Object.values(state.roamingAgents).filter(a => a.id !== hero.id);
  if (others.length > 0) {
    const target = others[Math.floor(Math.random() * others.length)];
    state.activeAttacks.push({
      from: { ...hero.pos },
      to: { ...target.pos },
      type: hero.power,
      color: hero.themeColor,
      life: 1.0,
    });
  }
}

function renderAttackEffects() {
  state.activeAttacks = state.activeAttacks.filter(attack => {
    attack.life -= 0.035;
    ctx.save();
    ctx.globalAlpha = attack.life;
    ctx.strokeStyle = attack.color;
    ctx.shadowColor = attack.color;
    ctx.shadowBlur = 14;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(attack.from.x, attack.from.y);
    ctx.lineTo(attack.to.x, attack.to.y);
    ctx.stroke();
    ctx.restore();
    return attack.life > 0;
  });
}

function spawnPortalParticles(x, y, color) {
  for (let i = 0; i < 15; i++) {
    state.portalParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 2,
      color: color || '#A855F7',
      life: 1.0,
    });
  }
}

function renderPortalParticles() {
  state.portalParticles = state.portalParticles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.restore();

    return p.life > 0;
  });
}

// ── Multiverse Clash (All Heroes Execute Attack) ────────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL CLASH INITIATED] All Minecraft Avengers unleashing full combat grid!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers Assemble! Engage voxel redstone combat power!');

  for (const hero of Object.values(state.roamingAgents)) {
    triggerHeroAttack(hero);
    spawnPortalParticles(hero.pos.x, hero.pos.y, hero.themeColor);
  }
};

// ── Spawn Character Modal & Roster Selection ────────────────────────
window.openSpawnModal = function () {
  const grid = document.getElementById('spawnRosterGrid');
  grid.innerHTML = '';

  for (const [id, hero] of Object.entries(MINECRAFT_HEROES)) {
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
  const hero = MINECRAFT_HEROES[heroId];
  if (!hero) return;

  state.roamingAgents[heroId] = {
    ...hero,
    pos: { x: 150 + Math.random() * 200, y: 120 + Math.random() * 100 },
    targetPos: { x: 150 + Math.random() * 200, y: 120 + Math.random() * 100 },
  };

  state.selectedAgentId = heroId;
  spawnPortalParticles(state.roamingAgents[heroId].pos.x, state.roamingAgents[heroId].pos.y, hero.themeColor);
  renderStrongholdDock();
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [VOXEL HERO SPAWNED] ${hero.name} entered the Minecraft battlefield!`);
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
    stronghold: `${name} Outpost`,
    image: './assets/iron_man.jpg',
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.65)',
    skinType: 'custom',
    power,
    pos: { x: 250, y: 180 },
    targetPos: { x: 250, y: 180 },
    walkTimer: 0,
    isWalking: false,
    speed: 1.2,
    quote: directive || `Agent ${name} operational. Ready for directives.`,
    hearts: 10,
    spawned: true,
  };

  MINECRAFT_HEROES[heroId] = newHero;
  state.roamingAgents[heroId] = newHero;
  state.selectedAgentId = heroId;

  try {
    await fetch('/api/heroes/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, callsign, role, avatar, harness, superpower: power, systemPrompt: directive }),
    });
  } catch {}

  spawnPortalParticles(250, 180, '#00F0FF');
  renderStrongholdDock();
  closeModals();
  showCosmicSpeechBubble(heroId, newHero.quote);
  appendVerboseStream(`🚀 [CUSTOM VOXEL HERO SPAWNED] ${newHero.stronghold} active for ${name}!`);
};

// ── Speech Bubble Rendering ─────────────────────────────────────────
function showCosmicSpeechBubble(entityId, text, durationMs = 6000) {
  const entity = state.roamingAgents[entityId] || MINECRAFT_HEROES[entityId];
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
        <div class="stronghold-sub">${entity.stronghold}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      state.selectedAgentId = entity.id;
      triggerHeroAttack(entity);
      showCosmicSpeechBubble(entity.id, entity.quote);
      appendVerboseStream(`● [${entity.callsign}] Focus locked on ${entity.stronghold}.`);
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
        if (state.roamingAgents[speaker] || MINECRAFT_HEROES[speaker]) {
          const hero = state.roamingAgents[speaker];
          if (hero) {
            triggerHeroAttack(hero);
            spawnPortalParticles(hero.pos.x, hero.pos.y, hero.themeColor);
          }
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.targetPos = { x: 130 + (Math.random() - 0.5) * 60, y: 110 + (Math.random() - 0.5) * 40 }; // Walk to Stark Tower!
          hero.isWalking = true;
          spawnPortalParticles(hero.pos.x, hero.pos.y, hero.themeColor);
        }
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
