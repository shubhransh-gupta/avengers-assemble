/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // 45° ISOMETRIC 3D MINECRAFT AVENGERS SIMULATION ENGINE
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],          // Rain / sparks
  portalParticles: [],    // Nether portal particles
  dagPulses: [],          // Redstone energy blocks
  activeAttacks: [],
  selectedAgentId: 'tony-stark',
  roamingAgents: {},
  thunderboltTimer: 0,
  time: 0,
};

// ── Isometric Grid Constants (45-degree Angled Clock Top View) ──────
const TILE_WIDTH = 34;
const TILE_HEIGHT = 17;
const BLOCK_DEPTH = 14;
const GRID_X = 24;
const GRID_Y = 24;

let originX = 0;
let originY = 0;

// Elevation matrix for isometric terrain
const heightMap = Array.from({ length: GRID_X }, () => Array(GRID_Y).fill(1));
const blockTypeMap = Array.from({ length: GRID_X }, () => Array(GRID_Y).fill('grass'));

function initIsometricMap() {
  for (let x = 0; x < GRID_X; x++) {
    for (let y = 0; y < GRID_Y; y++) {
      // Base elevation
      let h = 1;
      let type = 'grass';

      // 1. Diagonal River / Lake winding across the center (y: 10..13)
      if (Math.abs(x - y + 2) <= 2 || (x >= 9 && x <= 14 && y >= 9 && y <= 14)) {
        h = 0;
        type = 'water';
      }

      // 2. Stark Tower Plateau (Corner 0..6, 0..6)
      if (x <= 6 && y <= 6) {
        h = 2;
        type = 'iron';
      }

      // 3. Doctor Doom Castle Plateau (Corner 17..23, 17..23)
      if (x >= 17 && y >= 17) {
        h = 3;
        type = 'cobblestone';
      }

      // 4. Thor Thunder Hill (Corner 17..23, 0..6)
      if (x >= 17 && y <= 6) {
        h = 2;
        type = 'stone';
      }

      // 5. Wakanda Bunker Hill (Corner 0..6, 17..23)
      if (x <= 6 && y >= 17) {
        h = 2;
        type = 'blackstone';
      }

      // 6. Thanos Obsidian Peak (Center-South 10..14, 18..22)
      if (x >= 10 && x <= 14 && y >= 18 && y <= 22) {
        h = 3;
        type = 'obsidian';
      }

      heightMap[x][y] = h;
      blockTypeMap[x][y] = type;
    }
  }
}
initIsometricMap();

// ── Coordinate Conversion (Grid 45° to Screen & Screen to Grid) ─────
function gridToScreen(gx, gy, gz = 0) {
  const sx = originX + (gx - gy) * (TILE_WIDTH / 2);
  const sy = originY + (gx + gy) * (TILE_HEIGHT / 2) - (gz * BLOCK_DEPTH);
  return { x: sx, y: sy };
}

function screenToGrid(sx, sy) {
  const dx = sx - originX;
  const dy = sy - originY;
  const gx = (dx / (TILE_WIDTH / 2) + dy / (TILE_HEIGHT / 2)) / 2;
  const gy = (dy / (TILE_HEIGHT / 2) - dx / (TILE_WIDTH / 2)) / 2;
  return { gx: Math.max(0, Math.min(GRID_X - 1, Math.round(gx))), gy: Math.max(0, Math.min(GRID_Y - 1, Math.round(gy))) };
}

function getElevation(gx, gy) {
  const rx = Math.max(0, Math.min(GRID_X - 1, Math.round(gx)));
  const ry = Math.max(0, Math.min(GRID_Y - 1, Math.round(gy)));
  return heightMap[rx][ry] || 1;
}

// ── Minecraft Avengers Characters (45° Isometric 3D Skins) ──────────
const MINECRAFT_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    station: 'Stark Isometric Spire',
    image: './assets/iron_man.jpg',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.75)',
    skinType: 'iron-man',
    power: 'laser',
    gx: 3, gy: 3,
    targetGx: 3, targetGy: 3,
    walkTimer: 0,
    isWalking: false,
    speed: 0.08,
    quote: 'JARVIS, compile master DAG into redstone repeaters.',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    station: 'Latverian 3D Castle',
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    skinType: 'doctor-doom',
    power: 'runes',
    gx: 20, gy: 20,
    targetGx: 20, targetGy: 20,
    walkTimer: 0,
    isWalking: false,
    speed: 0.065,
    quote: 'Doom commands the syntax trees. Imperfect code shall burn in the Nether.',
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    role: 'DevOps & Package Manifest',
    station: 'Thunder Altar Spire',
    image: './assets/thor.jpg',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.75)',
    skinType: 'thor',
    power: 'thunder',
    gx: 20, gy: 3,
    targetGx: 20, targetGy: 3,
    walkTimer: 0,
    isWalking: false,
    speed: 0.075,
    quote: 'By Mjolnir, summoned thunderstorm CI/CD and Swift packages!',
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    station: '3D Obsidian Altar',
    image: './assets/thanos.jpg',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.75)',
    skinType: 'thanos',
    power: 'cosmic',
    gx: 12, gy: 20,
    targetGx: 12, targetGy: 20,
    walkTimer: 0,
    isWalking: false,
    speed: 0.055,
    quote: 'Rate limits, memory, and tokens in perfect equilibrium.',
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    role: 'Vibranium QA Auditor',
    station: 'Wakandan Vibranium Bunker',
    image: './assets/captain_america.jpg',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.75)',
    skinType: 'captain-america',
    power: 'shield',
    gx: 3, gy: 20,
    targetGx: 3, targetGy: 20,
    walkTimer: 0,
    isWalking: false,
    speed: 0.075,
    quote: 'Standards inspection ready. Sound off, soldiers.',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    station: 'Web Treehouse Hub',
    image: './assets/spider_man.jpg',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.75)',
    skinType: 'spider-man',
    power: 'web',
    gx: 11, gy: 5,
    targetGx: 11, targetGy: 5,
    walkTimer: 0,
    isWalking: false,
    speed: 0.09,
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    role: 'Gamma Logic Optimizer',
    station: 'Gamma Emerald Meadow',
    image: './assets/hulk.jpg',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.75)',
    skinType: 'hulk',
    power: 'gamma',
    gx: 7, gy: 11,
    targetGx: 7, targetGy: 11,
    walkTimer: 0,
    isWalking: false,
    speed: 0.06,
    quote: 'HULK SMASH 3D VOXEL BLOCKS AND REFACTOR FOR MAX PERFORMANCE!',
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    station: 'Ender Portal Spire',
    image: './assets/doctor_strange.jpg',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.75)',
    skinType: 'doctor-strange',
    power: 'mandala',
    gx: 16, gy: 9,
    targetGx: 16, targetGy: 9,
    walkTimer: 0,
    isWalking: false,
    speed: 0.07,
    quote: 'Temporal snapshots preserved in the Ender matrix for instant rollback.',
    spawned: true,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    role: 'Quantum Timeline Branching',
    station: 'Chrono-Bridge Nexus',
    image: './assets/kang_conqueror.jpg',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.75)',
    skinType: 'kang',
    power: 'chrono',
    gx: 11, gy: 11,
    targetGx: 11, targetGy: 11,
    walkTimer: 0,
    isWalking: false,
    speed: 0.07,
    quote: 'Simulated 14 billion voxel timelines. Reality-616 targeted.',
    spawned: true,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    role: 'Security & CVE Recon',
    station: 'Redstone Stealth Enclave',
    image: './assets/black_widow.jpg',
    avatar: '🕷️',
    themeColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.75)',
    skinType: 'black-widow',
    power: 'laser',
    gx: 5, gy: 11,
    targetGx: 5, targetGy: 11,
    walkTimer: 0,
    isWalking: false,
    speed: 0.085,
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    spawned: false,
  }
};

// Copy spawned characters into active pool
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
  initWeatherParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', '45° Isometric Minecraft simulation online! Click any block to walk.');
  }, 1000);

  // Periodic autonomous movement & DAG pulses
  setInterval(triggerAutonomousHeroMovement, 5000);
  setInterval(triggerDAGSimulationPulse, 6000);
});

// ── Canvas Setup & Simulation Engine Loop ───────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    originX = canvas.width / 2;
    originY = 75; // Position 45° grid centered in upper view
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(simulationLoop);

  // Click on 45° Isometric Grid to Move Selected Hero
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check if clicked directly on a hero
    let clickedHero = null;
    for (const hero of Object.values(state.roamingAgents)) {
      const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 0.5);
      if (Math.hypot(pos.x - clickX, pos.y - clickY) < 24) {
        clickedHero = hero;
        break;
      }
    }

    if (clickedHero) {
      state.selectedAgentId = clickedHero.id;
      triggerHeroAttack(clickedHero);
      showCosmicSpeechBubble(clickedHero.id, clickedHero.quote);
      appendVerboseStream(`● [${clickedHero.callsign}] Selected at grid (${Math.round(clickedHero.gx)}, ${Math.round(clickedHero.gy)}).`);
    } else {
      const grid = screenToGrid(clickX, clickY);
      const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
      if (hero) {
        hero.targetGx = grid.gx;
        hero.targetGy = grid.gy;
        hero.isWalking = true;
        const targetScreen = gridToScreen(grid.gx, grid.gy, getElevation(grid.gx, grid.gy));
        spawnPortalParticles(targetScreen.x, targetScreen.y, hero.themeColor);
        showCosmicSpeechBubble(hero.id, `Walking to block (${grid.gx}, ${grid.gy})`);
      }
    }
  });
}

function initWeatherParticles() {
  for (let i = 0; i < 40; i++) {
    state.particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speedY: Math.random() * 2 + 1.2,
      size: Math.random() * 2 + 1.5,
      color: ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7'][Math.floor(Math.random() * 4)],
    });
  }
}

// ── Master Render Loop ──────────────────────────────────────────────
function simulationLoop(time) {
  state.time = time;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1. Draw Space Background Gradient & Twinkling Stars
  drawSpaceSky(w, h, time);

  // 2. Draw 45° Isometric Minecraft Block Terrain
  drawIsometricTerrain(time);

  // 3. Draw 3D Isometric Buildings (Stark Tower, Doom Castle, Thor Altar, Wakanda Bunker)
  drawIsometricStructures(time);

  // 4. Draw Redstone DAG Mesh Links & Traveling Energy Packets
  drawRedstoneDAGMesh(time);

  // 5. Draw Thunderstorm Lightning Strikes to Thor Altar
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.012) {
    const thorAltarPos = gridToScreen(20, 3, 5);
    drawVoxelLightning(thorAltarPos.x, 10, thorAltarPos.x, thorAltarPos.y);
  }

  // 6. Update Character Physics & Walking Cycles
  updateHeroPhysics();

  // 7. Draw All 3D Isometric Minecraft Walking Characters
  // Sort characters by depth (gx + gy) so foreground draws over background
  const sortedHeroes = Object.values(state.roamingAgents).sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  for (const hero of sortedHeroes) {
    drawMinecraftIsometricHero(hero, time);
  }

  // 8. Draw Weather Rain & Portal Spawn Particles
  drawWeatherAndParticles(w, h);

  // 9. Draw Active Attack Beams
  drawActiveAttacks();

  requestAnimationFrame(simulationLoop);
}

// ── 1. Cosmic Sky Background ────────────────────────────────────────
function drawSpaceSky(w, h, time) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#060212');
  skyGrad.addColorStop(0.5, '#120732');
  skyGrad.addColorStop(1, '#220B50');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Twinkling Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 47 + 13) % w;
    const sy = (i * 29 + 7) % (h * 0.45);
    const blink = Math.sin(time * 0.003 + i) > 0 ? 2 : 1;
    ctx.fillRect(sx, sy, blink, blink);
  }
}

// ── 2. 45° Isometric Block Terrain Renderer ─────────────────────────
function drawIsometricTerrain(time) {
  for (let x = 0; x < GRID_X; x++) {
    for (let y = 0; y < GRID_Y; y++) {
      const h = heightMap[x][y];
      const type = blockTypeMap[x][y];

      // Draw vertical block column stack
      for (let z = 0; z <= h; z++) {
        drawIsometricBlock(x, y, z, type, time);
      }
    }
  }
}

function drawIsometricBlock(gx, gy, gz, type, time) {
  const p = gridToScreen(gx, gy, gz);
  const hw = TILE_WIDTH / 2;
  const hh = TILE_HEIGHT / 2;
  const d = BLOCK_DEPTH;

  let topColor = '#5B8C32';   // Grass top green
  let leftColor = '#866043';  // Dirt left
  let rightColor = '#6E4D34'; // Dirt right (shadowed)

  if (type === 'water') {
    const wave = Math.sin(time * 0.006 + gx * 0.5 + gy * 0.5) * 0.15;
    topColor = '#1E88E5';
    leftColor = '#1565C0';
    rightColor = '#0D47A1';
  } else if (type === 'iron') {
    topColor = '#E2E8F0'; leftColor = '#CBD5E1'; rightColor = '#94A3B8';
  } else if (type === 'cobblestone') {
    topColor = '#475569'; leftColor = '#334155'; rightColor = '#1E293B';
  } else if (type === 'stone') {
    topColor = '#64748B'; leftColor = '#475569'; rightColor = '#334155';
  } else if (type === 'obsidian') {
    topColor = '#312E81'; leftColor = '#1E1B4B'; rightColor = '#0F172A';
  } else if (type === 'blackstone') {
    topColor = '#1E293B'; leftColor = '#0F172A'; rightColor = '#020617';
  }

  // 1. TOP FACE (Rhombus)
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - hh);
  ctx.lineTo(p.x + hw, p.y);
  ctx.lineTo(p.x, p.y + hh);
  ctx.lineTo(p.x - hw, p.y);
  ctx.closePath();
  ctx.fill();

  // Highlight border on top face
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // 2. LEFT FACE (Parallelogram)
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(p.x - hw, p.y);
  ctx.lineTo(p.x, p.y + hh);
  ctx.lineTo(p.x, p.y + hh + d);
  ctx.lineTo(p.x - hw, p.y + d);
  ctx.closePath();
  ctx.fill();

  // 3. RIGHT FACE (Parallelogram)
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + hh);
  ctx.lineTo(p.x + hw, p.y);
  ctx.lineTo(p.x + hw, p.y + d);
  ctx.lineTo(p.x, p.y + hh + d);
  ctx.closePath();
  ctx.fill();

  // Diamond / Redstone Ores in Stone
  if (type === 'stone' && (gx * 7 + gy * 13 + gz) % 5 === 0) {
    const oreColor = (gx + gy) % 2 === 0 ? '#00F0FF' : '#EF4444';
    ctx.fillStyle = oreColor;
    ctx.fillRect(p.x - 2, p.y - 2, 4, 3);
  }
}

// ── 3. 3D Isometric Landmark Structures ─────────────────────────────
function drawIsometricStructures(time) {
  // ── A. STARK 3D VOXEL TOWER (Grid 2..4, 2..4) ────────────────────
  for (let z = 3; z <= 9; z++) {
    for (let x = 2; x <= 4; x++) {
      for (let y = 2; y <= 4; y++) {
        const isWindow = (x === 2 || y === 2) && z % 2 === 1;
        drawIsometricBlock(x, y, z, isWindow ? 'iron' : 'iron', time);
      }
    }
  }
  // Arc Reactor Beacon on Top
  const beaconPos = gridToScreen(3, 3, 10);
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 20;
  ctx.fillRect(beaconPos.x - 3, beaconPos.y - 20, 6, 20);
  // Sky beam
  const beamGrad = ctx.createLinearGradient(0, beaconPos.y - 20, 0, 0);
  beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.85)');
  beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(beaconPos.x - 5, 0, 10, beaconPos.y - 20);
  ctx.shadowBlur = 0;

  // ── B. DOCTOR DOOM LATVERIAN CASTLE (Grid 18..21, 18..21) ─────────
  for (let z = 4; z <= 7; z++) {
    for (let x = 18; x <= 21; x++) {
      for (let y = 18; y <= 21; y++) {
        drawIsometricBlock(x, y, z, 'cobblestone', time);
      }
    }
  }
  // Nether Portal on Castle Front
  const portalPos = gridToScreen(19, 18, 4);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.85)';
  ctx.shadowColor = '#A855F7'; ctx.shadowBlur = 14;
  ctx.fillRect(portalPos.x - 10, portalPos.y - 24, 20, 24);
  ctx.shadowBlur = 0;

  // ── C. THOR THUNDER ALTARE SPIRE (Grid 19..21, 2..4) ──────────────
  for (let z = 3; z <= 5; z++) {
    drawIsometricBlock(20, 3, z, 'stone', time);
  }
  const spirePos = gridToScreen(20, 3, 5);
  ctx.fillStyle = '#FBBF24'; // Gold cap
  ctx.fillRect(spirePos.x - 4, spirePos.y - 12, 8, 6);
  ctx.fillStyle = '#94A3B8'; // Lightning rod
  ctx.fillRect(spirePos.x - 1.5, spirePos.y - 28, 3, 16);

  // ── D. WAKANDAN VIBRANIUM BUNKER (Grid 2..4, 18..20) ──────────────
  for (let z = 3; z <= 4; z++) {
    for (let x = 2; x <= 4; x++) {
      drawIsometricBlock(x, 19, z, 'blackstone', time);
    }
  }
  const bunkerPos = gridToScreen(3, 19, 4);
  ctx.fillStyle = '#A855F7'; ctx.fillRect(bunkerPos.x - 6, bunkerPos.y - 10, 12, 10);
}

// ── 4. Character Physics & Walk Cycles ──────────────────────────────
function updateHeroPhysics() {
  for (const hero of Object.values(state.roamingAgents)) {
    const dx = hero.targetGx - hero.gx;
    const dy = hero.targetGy - hero.gy;
    const dist = Math.hypot(dx, dy);

    if (dist > 0.1) {
      hero.isWalking = true;
      hero.walkTimer += 0.25;
      hero.gx += (dx / dist) * hero.speed;
      hero.gy += (dy / dist) * hero.speed;
    } else {
      hero.isWalking = false;
      hero.walkTimer = 0;
    }
  }
}

function triggerAutonomousHeroMovement() {
  const heroes = Object.values(state.roamingAgents);
  if (heroes.length === 0) return;
  const lucky = heroes[Math.floor(Math.random() * heroes.length)];

  // Pick random landmark across the 45° isometric world
  const spots = [
    { gx: 3, gy: 3 },   // Stark Tower
    { gx: 20, gy: 20 }, // Doom Castle
    { gx: 20, gy: 3 },  // Thor Altar
    { gx: 3, gy: 20 },  // Wakanda Bunker
    { gx: 12, gy: 20 }, // Thanos Altar
    { gx: 11, gy: 5 },  // Web Treehouse
    { gx: 7, gy: 11 },  // Gamma Meadow
    { gx: 16, gy: 9 },  // Strange Spire
  ];
  const target = spots[Math.floor(Math.random() * spots.length)];
  lucky.targetGx = target.gx;
  lucky.targetGy = target.gy;
  lucky.isWalking = true;
}

// ── 5. 3D Isometric Minecraft Hero Skin Renderer ────────────────────
function drawMinecraftIsometricHero(hero, time) {
  const gz = getElevation(hero.gx, hero.gy);
  const pos = gridToScreen(hero.gx, hero.gy, gz);
  const isWalking = hero.isWalking;
  const swing = isWalking ? Math.sin(hero.walkTimer) * 0.6 : 0;
  const bobY = isWalking ? Math.abs(Math.sin(hero.walkTimer * 2)) * 2 : 0;
  const scale = hero.id === 'hulk' ? 1.35 : 1.0;

  ctx.save();
  ctx.translate(pos.x, pos.y - bobY);
  ctx.scale(scale, scale);

  // Selection Indicator
  if (hero.id === state.selectedAgentId) {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-12, -42, 24, 44);
  }

  // 1. LEGS (Left & Right Leg Stepping)
  ctx.fillStyle = getLegColor(hero);
  // Left Leg
  ctx.save();
  ctx.translate(-3, -12);
  ctx.rotate(swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  // Right Leg
  ctx.save();
  ctx.translate(3, -12);
  ctx.rotate(-swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  // 2. TORSO / BODY (Cube with Superhero Armor)
  ctx.save();
  ctx.translate(0, -24);
  ctx.fillStyle = getTorsoColor(hero);
  ctx.fillRect(-5, 0, 10, 12);
  renderTorsoDetails(hero);
  ctx.restore();

  // 3. ARMS & HELD WEAPONS (Swinging in opposition)
  // Left Arm
  ctx.save();
  ctx.translate(-7, -22);
  ctx.rotate(-swing);
  ctx.fillStyle = getArmColor(hero, true);
  ctx.fillRect(-2, 0, 4, 11);
  ctx.restore();

  // Right Arm
  ctx.save();
  ctx.translate(7, -22);
  ctx.rotate(swing);
  ctx.fillStyle = getArmColor(hero, false);
  ctx.fillRect(-2, 0, 4, 11);
  renderHeldItem(hero);
  ctx.restore();

  // 4. HEAD (3D Shaded Voxel Head Cube)
  ctx.save();
  ctx.translate(0, -32);
  ctx.fillStyle = getHeadColor(hero);
  ctx.fillRect(-5, -6, 10, 10);
  renderFaceDetails(hero);
  ctx.restore();

  ctx.restore();

  // 5. MINECRAFT FLOATING NAME TAG
  renderMinecraftNameTag(hero, pos.x, pos.y - 44 - bobY);
}

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

function getLegColor(hero) {
  switch (hero.skinType) {
    case 'iron-man': return '#B91C1C';
    case 'doctor-doom': return '#065F46';
    case 'thor': return '#1E293B';
    case 'thanos': return '#78350F';
    case 'kang': return '#581C87';
    case 'doctor-strange': return '#1E1B4B';
    case 'captain-america': return '#1E3A8A';
    case 'spider-man': return '#1E40AF';
    case 'hulk': return '#7E22CE';
    default: return '#0F172A';
  }
}

function renderTorsoDetails(hero) {
  if (hero.skinType === 'iron-man') {
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(-2, 3, 4, 4);
  } else if (hero.skinType === 'captain-america') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2, 2, 4, 3);
  } else if (hero.skinType === 'doctor-doom') {
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-3, 2, 2, 2); ctx.fillRect(1, 2, 2, 2);
  }
}

function renderFaceDetails(hero) {
  if (hero.skinType === 'iron-man') {
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-3, -4, 6, 6);
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(-2, -3, 1.5, 1.5); ctx.fillRect(1, -3, 1.5, 1.5);
  } else if (hero.skinType === 'doctor-doom') {
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(-3, -4, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-2, -3, 1.5, 1.5); ctx.fillRect(1, -3, 1.5, 1.5);
  } else if (hero.skinType === 'spider-man') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-3, -3, 2.5, 2.5); ctx.fillRect(0.5, -3, 2.5, 2.5);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-2.5, -3, 2, 2); ctx.fillRect(0.5, -3, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-1.5, -2, 1, 1); ctx.fillRect(1.5, -2, 1, 1);
  }
}

function renderHeldItem(hero) {
  if (hero.skinType === 'thor') {
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(2, 6, 6, 5);
    ctx.fillStyle = '#78350F'; ctx.fillRect(4, 11, 2, 5);
  } else if (hero.skinType === 'captain-america') {
    ctx.fillStyle = '#DC2626'; ctx.fillRect(2, 2, 6, 7);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(3, 3, 4, 5);
    ctx.fillStyle = '#2563EB'; ctx.fillRect(4, 4, 2, 3);
  } else if (hero.skinType === 'thanos') {
    ctx.fillStyle = '#FFC83B'; ctx.fillRect(2, 5, 5, 6);
    ctx.fillStyle = '#A855F7'; ctx.fillRect(3, 6, 1.5, 1.5);
  }
}

function renderMinecraftNameTag(hero, x, y) {
  ctx.save();
  const label = hero.callsign;
  ctx.font = '8px "Press Start 2P", monospace';
  const textWidth = ctx.measureText(label).width;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
  ctx.fillRect(x - (textWidth / 2) - 4, y - 9, textWidth + 8, 11);
  ctx.strokeStyle = hero.themeColor || '#00F0FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - (textWidth / 2) - 4, y - 9, textWidth + 8, 11);

  ctx.fillStyle = '#000000';
  ctx.fillText(label, x - (textWidth / 2) + 1, y - 1);
  ctx.fillStyle = hero.themeColor || '#FFFFFF';
  ctx.fillText(label, x - (textWidth / 2), y - 2);

  ctx.restore();
}

// ── 6. Redstone DAG Mesh & Energy Packets ───────────────────────────
function drawRedstoneDAGMesh(time) {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  const sPos = gridToScreen(stark.gx, stark.gy, getElevation(stark.gx, stark.gy) + 1);

  ctx.save();
  ctx.lineWidth = 1.6;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;

    const aPos = gridToScreen(agent.gx, agent.gy, getElevation(agent.gx, agent.gy) + 1);

    const grad = ctx.createLinearGradient(sPos.x, sPos.y, aPos.x, aPos.y);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
    grad.addColorStop(1, agent.glowColor || 'rgba(168, 85, 247, 0.35)');

    ctx.strokeStyle = grad;
    ctx.shadowColor = agent.themeColor || '#00F0FF';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(sPos.x, sPos.y);
    ctx.lineTo(aPos.x, aPos.y);
    ctx.stroke();
  }
  ctx.restore();

  // Traveling Redstone Block Packets
  state.dagPulses = state.dagPulses.filter(pulse => {
    pulse.progress += 0.035;
    if (pulse.progress >= 1.0) return false;

    const curX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
    const curY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

    ctx.save();
    ctx.fillStyle = pulse.color;
    ctx.shadowColor = pulse.color;
    ctx.shadowBlur = 12;
    ctx.fillRect(curX - 2.5, curY - 2.5, 5, 5);
    ctx.restore();

    return true;
  });
}

function triggerDAGSimulationPulse() {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  const sPos = gridToScreen(stark.gx, stark.gy, getElevation(stark.gx, stark.gy) + 1);

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;
    const aPos = gridToScreen(agent.gx, agent.gy, getElevation(agent.gx, agent.gy) + 1);
    state.dagPulses.push({
      from: sPos,
      to: aPos,
      color: agent.themeColor || '#00F0FF',
      progress: 0,
    });
  }
}

// ── 7. Attacks & Lightning Strikes ──────────────────────────────────
function drawVoxelLightning(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  while (curY < y2) {
    curX += (Math.floor(Math.random() * 3) - 1) * 12;
    curY += 16;
    ctx.lineTo(curX, curY);
  }
  ctx.stroke();
  ctx.restore();
}

function triggerHeroAttack(hero) {
  const others = Object.values(state.roamingAgents).filter(a => a.id !== hero.id);
  if (others.length > 0) {
    const target = others[Math.floor(Math.random() * others.length)];
    const hPos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 1);
    const tPos = gridToScreen(target.gx, target.gy, getElevation(target.gx, target.gy) + 1);

    state.activeAttacks.push({
      from: hPos,
      to: tPos,
      color: hero.themeColor,
      life: 1.0,
    });
  }
}

function drawActiveAttacks() {
  state.activeAttacks = state.activeAttacks.filter(attack => {
    attack.life -= 0.04;
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
  for (let i = 0; i < 12; i++) {
    state.portalParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: Math.random() * 3 + 2,
      color: color || '#A855F7',
      life: 1.0,
    });
  }
}

function drawWeatherAndParticles(w, h) {
  // Rain
  for (const p of state.particles) {
    p.y += p.speedY;
    if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  // Portal particles
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

// ── Multiverse Clash ────────────────────────────────────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL BATTLE CLASH] All Minecraft Avengers unleashing full 45° combat grid!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers Assemble! Engage 45° isometric redstone grid!');

  for (const hero of Object.values(state.roamingAgents)) {
    triggerHeroAttack(hero);
    const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
    spawnPortalParticles(pos.x, pos.y, hero.themeColor);
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
    gx: 6 + Math.random() * 12,
    gy: 6 + Math.random() * 12,
    targetGx: 6 + Math.random() * 12,
    targetGy: 6 + Math.random() * 12,
  };

  state.selectedAgentId = heroId;
  const pos = gridToScreen(state.roamingAgents[heroId].gx, state.roamingAgents[heroId].gy, getElevation(state.roamingAgents[heroId].gx, state.roamingAgents[heroId].gy));
  spawnPortalParticles(pos.x, pos.y, hero.themeColor);
  renderStrongholdDock();
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [VOXEL HERO SPAWNED] ${hero.name} entered the 45° isometric world!`);
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
  const customGx = 8 + Math.random() * 8;
  const customGy = 8 + Math.random() * 8;

  const newHero = {
    id: heroId,
    name,
    callsign,
    role,
    station: `${name} Research Pod`,
    image: './assets/iron_man.jpg',
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.75)',
    skinType: 'custom',
    power,
    gx: customGx,
    gy: customGy,
    targetGx: customGx,
    targetGy: customGy,
    walkTimer: 0,
    isWalking: false,
    speed: 0.075,
    quote: directive || `Agent ${name} operational. Ready for directives.`,
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

  const pos = gridToScreen(customGx, customGy, getElevation(customGx, customGy));
  spawnPortalParticles(pos.x, pos.y, '#00F0FF');
  renderStrongholdDock();
  closeModals();
  showCosmicSpeechBubble(heroId, newHero.quote);
  appendVerboseStream(`🚀 [CUSTOM VOXEL HERO SPAWNED] ${newHero.station} active for ${name}!`);
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

  const pos = gridToScreen(entity.gx, entity.gy, getElevation(entity.gx, entity.gy));
  bubble.style.left = `${pos.x}px`;
  bubble.style.top = `${pos.y - 48}px`;

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
        <div class="stronghold-sub">${entity.station}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      state.selectedAgentId = entity.id;
      triggerHeroAttack(entity);
      showCosmicSpeechBubble(entity.id, entity.quote);
      appendVerboseStream(`● [${entity.callsign}] Focus locked on ${entity.station}.`);
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
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the 45° isometric world...`);

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
    console.log('⚡ Connected to Stark 45° Isometric Comms');
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
            const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
            spawnPortalParticles(pos.x, pos.y, hero.themeColor);
          }
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.targetGx = 3 + (Math.random() - 0.5) * 2;
          hero.targetGy = 3 + (Math.random() - 0.5) * 2;
          hero.isWalking = true;
          const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
          spawnPortalParticles(pos.x, pos.y, hero.themeColor);
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
