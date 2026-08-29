/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // 100% PURE CODE 2D MINECRAFT AVENGERS SIMULATION ENGINE
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

// ── World Dimensions & Procedural Terrain Setup ─────────────────────
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 440;
const BLOCK_SIZE = 16;
const COLS = Math.ceil(WORLD_WIDTH / BLOCK_SIZE);
const ROWS = Math.ceil(WORLD_HEIGHT / BLOCK_SIZE);

// Procedural ground elevation array (height in blocks from bottom)
const groundElevation = [];
function initElevation() {
  for (let c = 0; c < COLS; c++) {
    // Stepped rolling Minecraft hills with a lake at cols 32-40
    let h = 8;
    if (c >= 0 && c < 16) h = 10;                     // Stark Tower Plateau
    else if (c >= 16 && c < 22) h = 9;                 // Step down
    else if (c >= 22 && c < 30) h = 8;                 // Grass meadow
    else if (c >= 30 && c < 38) h = 5;                 // Water Basin / Lake
    else if (c >= 38 && c < 46) h = 9;                 // Thor Thunder Hill
    else if (c >= 46 && c < 54) h = 8;                 // Forest clearing
    else h = 11;                                       // Doom Castle Cliff
    groundElevation[c] = h;
  }
}
initElevation();

function getGroundY(pixelX) {
  const col = Math.max(0, Math.min(COLS - 1, Math.floor(pixelX / BLOCK_SIZE)));
  const blockHeight = groundElevation[col] || 8;
  return WORLD_HEIGHT - (blockHeight * BLOCK_SIZE);
}

// ── Minecraft Avengers Characters (100% Drawn in Code) ──────────────
const MINECRAFT_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    station: 'Stark Voxel Tower',
    image: './assets/iron_man.jpg',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.7)',
    skinType: 'iron-man',
    power: 'laser',
    x: 80,
    y: 0,
    targetX: 80,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.2,
    quote: 'JARVIS, compile master DAG into redstone repeaters.',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    station: 'Latverian Cobblestone Keep',
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.7)',
    skinType: 'doctor-doom',
    power: 'runes',
    x: 880,
    y: 0,
    targetX: 880,
    facing: -1,
    walkTimer: 0,
    isWalking: false,
    speed: 1.8,
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
    glowColor: 'rgba(0, 213, 232, 0.7)',
    skinType: 'thor',
    power: 'thunder',
    x: 680,
    y: 0,
    targetX: 680,
    facing: -1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.0,
    quote: 'By Mjolnir, summoned thunderstorm CI/CD and Swift packages!',
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    station: 'Obsidian Mountain Peak',
    image: './assets/thanos.jpg',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.7)',
    skinType: 'thanos',
    power: 'cosmic',
    x: 810,
    y: 0,
    targetX: 810,
    facing: -1,
    walkTimer: 0,
    isWalking: false,
    speed: 1.5,
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
    glowColor: 'rgba(59, 130, 246, 0.7)',
    skinType: 'captain-america',
    power: 'shield',
    x: 320,
    y: 0,
    targetX: 320,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.0,
    quote: 'Standards inspection ready. Sound off, soldiers.',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    station: 'Web Treehouse Outpost',
    image: './assets/spider_man.jpg',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.7)',
    skinType: 'spider-man',
    power: 'web',
    x: 420,
    y: 0,
    targetX: 420,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.5,
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
    glowColor: 'rgba(34, 197, 94, 0.7)',
    skinType: 'hulk',
    power: 'gamma',
    x: 230,
    y: 0,
    targetX: 230,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 1.6,
    quote: 'HULK SMASH VOXEL BLOCKS AND REFACTOR FOR MAX PERFORMANCE!',
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
    glowColor: 'rgba(168, 85, 247, 0.7)',
    skinType: 'doctor-strange',
    power: 'mandala',
    x: 750,
    y: 0,
    targetX: 750,
    facing: -1,
    walkTimer: 0,
    isWalking: false,
    speed: 1.9,
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
    glowColor: 'rgba(56, 189, 248, 0.7)',
    skinType: 'kang',
    power: 'chrono',
    x: 520,
    y: 0,
    targetX: 520,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 1.9,
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
    glowColor: 'rgba(192, 132, 252, 0.7)',
    skinType: 'black-widow',
    power: 'laser',
    x: 180,
    y: 0,
    targetX: 180,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.3,
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    spawned: false,
  }
};

// Initialize character Y coordinate on the terrain
for (const [k, v] of Object.entries(MINECRAFT_HEROES)) {
  v.y = getGroundY(v.x);
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
    showCosmicSpeechBubble('tony-stark', '2D Minecraft lateral world loaded. Click anywhere on the ground to move!');
  }, 1000);

  // Periodic autonomous movement & DAG pulses
  setInterval(triggerAutonomousHeroMovement, 5500);
  setInterval(triggerDAGSimulationPulse, 6500);
});

// ── Canvas Setup & Master Simulation Engine Loop ────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(simulationLoop);

  // Click on Minecraft ground to move selected hero
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = WORLD_WIDTH / rect.width;
    const scaleY = WORLD_HEIGHT / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked on a hero
    let clickedHero = null;
    for (const hero of Object.values(state.roamingAgents)) {
      if (Math.hypot(hero.x - clickX, (hero.y - 20) - clickY) < 26) {
        clickedHero = hero;
        break;
      }
    }

    if (clickedHero) {
      state.selectedAgentId = clickedHero.id;
      triggerHeroAttack(clickedHero);
      showCosmicSpeechBubble(clickedHero.id, clickedHero.quote);
      appendVerboseStream(`● [${clickedHero.callsign}] Selected at x:${Math.round(clickedHero.x)}.`);
    } else {
      const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
      if (hero) {
        hero.targetX = Math.max(20, Math.min(WORLD_WIDTH - 20, clickX));
        hero.facing = hero.targetX > hero.x ? 1 : -1;
        hero.isWalking = true;
        spawnPortalParticles(hero.targetX, getGroundY(hero.targetX), hero.themeColor);
        showCosmicSpeechBubble(hero.id, `Moving to x:${Math.round(hero.targetX)}`);
      }
    }
  });
}

function initWeatherParticles() {
  for (let i = 0; i < 40; i++) {
    state.particles.push({
      x: Math.random() * WORLD_WIDTH,
      y: Math.random() * WORLD_HEIGHT,
      speedY: Math.random() * 2 + 1.5,
      size: Math.random() * 2 + 1.5,
      color: ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7'][Math.floor(Math.random() * 4)],
    });
  }
}

// ── Main Render Loop ────────────────────────────────────────────────
function simulationLoop(time) {
  state.time = time;
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.min(w / WORLD_WIDTH, h / WORLD_HEIGHT);
  const offsetX = (w - (WORLD_WIDTH * scale)) / 2;
  const offsetY = (h - (WORLD_HEIGHT * scale)) / 2;

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  // 1. Draw 2D Sky & Drifting Clouds
  drawMinecraftSky(time);

  // 2. Draw Lateral Procedural Block World (Dirt, Stone, Ores, Grass, Water)
  drawMinecraftBlocks(time);

  // 3. Draw Lateral Minecraft Buildings (Stark Tower, Doom Castle, Thor Spire, Wakanda Bunker)
  drawMinecraftStructures(time);

  // 4. Draw Redstone DAG Mesh Links & Traveling Energy Packets
  drawRedstoneDAGMesh(time);

  // 5. Draw Thunderstorm Lightning Strikes
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.012) {
    drawVoxelLightning(680, 20, 680, getGroundY(680) - 30);
  }

  // 6. Update Character Movement & Physics
  updateHeroPhysics();

  // 7. Draw All 2D Minecraft Avengers Walking Characters
  for (const hero of Object.values(state.roamingAgents)) {
    drawMinecraftHeroSkin(hero, time);
  }

  // 8. Draw Weather Rain & Portal Particles
  drawWeatherAndParticles();

  // 9. Draw Active Attack Beams
  drawActiveAttacks();

  ctx.restore();
  requestAnimationFrame(simulationLoop);
}

// ── 1. Sky & Atmospheric Weather ────────────────────────────────────
function drawMinecraftSky(time) {
  // Midnight Purple / Dark Space Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, WORLD_HEIGHT);
  skyGrad.addColorStop(0, '#070214');
  skyGrad.addColorStop(0.5, '#120732');
  skyGrad.addColorStop(1, '#240F58');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  // Twinkling Pixel Stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 45; i++) {
    const sx = (i * 37 + 13) % WORLD_WIDTH;
    const sy = (i * 19 + 7) % (WORLD_HEIGHT * 0.55);
    const blink = Math.sin(time * 0.003 + i) > 0 ? 2 : 1;
    ctx.fillRect(sx, sy, blink, blink);
  }

  // Giant Blocky Voxel Moon
  ctx.fillStyle = '#E2E8F0';
  ctx.fillRect(WORLD_WIDTH - 120, 24, 32, 32);
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(WORLD_WIDTH - 112, 32, 10, 10);
  ctx.fillRect(WORLD_WIDTH - 102, 44, 8, 8);

  // Drifting Voxel Clouds
  const cloudOffset1 = (time * 0.015) % (WORLD_WIDTH + 200) - 100;
  const cloudOffset2 = (time * 0.025 + 300) % (WORLD_WIDTH + 200) - 100;
  drawVoxelCloud(cloudOffset1, 45, 90, 20);
  drawVoxelCloud(cloudOffset2, 80, 130, 24);
}

function drawVoxelCloud(x, y, w, h) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
  ctx.fillRect(x, y, w, h);
  ctx.fillRect(x + 12, y - 8, w - 24, 8);
  ctx.fillRect(x + 24, y + h, w - 48, 6);
}

// ── 2. Pure Code 2D Minecraft Lateral Block World ───────────────────
function drawMinecraftBlocks(time) {
  for (let c = 0; c < COLS; c++) {
    const colX = c * BLOCK_SIZE;
    const surfaceH = groundElevation[c] || 8;
    const surfaceY = WORLD_HEIGHT - (surfaceH * BLOCK_SIZE);

    // Is this column the Water Lake? (cols 30-37)
    const isWater = c >= 30 && c <= 37;

    for (let r = 0; r < surfaceH; r++) {
      const blockY = WORLD_HEIGHT - ((r + 1) * BLOCK_SIZE);

      if (r === surfaceH - 1) {
        if (isWater) {
          // Animated Water Surface
          const wave = Math.sin(time * 0.005 + c) * 2;
          ctx.fillStyle = '#1E88E5';
          ctx.fillRect(colX, blockY + 4 + wave, BLOCK_SIZE, BLOCK_SIZE - 4 - wave);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect(colX, blockY + 4 + wave, BLOCK_SIZE, 2);
        } else {
          // Grass Block Surface (Green top with brown dirt base)
          ctx.fillStyle = '#5B8C32'; // Top green
          ctx.fillRect(colX, blockY, BLOCK_SIZE, 5);
          ctx.fillStyle = '#466B26'; // Grass side overhang
          ctx.fillRect(colX + 2, blockY + 5, 4, 3);
          ctx.fillRect(colX + 10, blockY + 5, 4, 2);

          ctx.fillStyle = '#866043'; // Dirt body
          ctx.fillRect(colX, blockY + 5, BLOCK_SIZE, BLOCK_SIZE - 5);

          // Flowers / Tall Grass on top
          if (c % 4 === 1 && !isWater) {
            ctx.fillStyle = '#EF4444'; // Red Poppy
            ctx.fillRect(colX + 6, blockY - 6, 4, 6);
            ctx.fillStyle = '#22C55E';
            ctx.fillRect(colX + 7, blockY - 2, 2, 2);
          } else if (c % 5 === 3 && !isWater) {
            ctx.fillStyle = '#FBBF24'; // Yellow Dandelion
            ctx.fillRect(colX + 6, blockY - 5, 4, 5);
          }
        }
      } else if (r >= surfaceH - 3) {
        // Dirt Layer
        ctx.fillStyle = '#866043';
        ctx.fillRect(colX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        // Dirt darker speckles
        ctx.fillStyle = '#6E4D34';
        ctx.fillRect(colX + 3, blockY + 3, 3, 3);
        ctx.fillRect(colX + 10, blockY + 9, 3, 3);
      } else if (r === 0) {
        // Bedrock Layer
        ctx.fillStyle = '#1A1A1A';
        ctx.fillRect(colX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fillStyle = '#333333';
        ctx.fillRect(colX + 4, blockY + 4, 8, 8);
      } else {
        // Stone Layer with Ores
        ctx.fillStyle = '#686868';
        ctx.fillRect(colX, blockY, BLOCK_SIZE, BLOCK_SIZE);
        ctx.fillStyle = '#555555';
        ctx.fillRect(colX + 2, blockY + 2, 4, 4);

        // Procedural Ores (Diamond, Redstone, Gold, Iron)
        if ((c * 7 + r * 13) % 17 === 0) {
          ctx.fillStyle = '#00F0FF'; // Diamond Ore
          ctx.fillRect(colX + 4, blockY + 4, 3, 3);
          ctx.fillRect(colX + 10, blockY + 9, 3, 3);
        } else if ((c * 5 + r * 11) % 13 === 0) {
          ctx.fillStyle = '#EF4444'; // Redstone Ore
          ctx.fillRect(colX + 5, blockY + 5, 4, 4);
        } else if ((c * 9 + r * 3) % 11 === 0) {
          ctx.fillStyle = '#FBBF24'; // Gold Ore
          ctx.fillRect(colX + 6, blockY + 3, 3, 3);
        }
      }

      // Block Grid Border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(colX, blockY, BLOCK_SIZE, BLOCK_SIZE);
    }
  }
}

// ── 3. Pure Code 2D Minecraft Buildings / Structures ────────────────
function drawMinecraftStructures(time) {
  // ── A. STARK VOXEL TOWER (Left side: x: 30 to 140) ───────────────
  const starkBaseY = getGroundY(80);
  const towerW = 90;
  const towerH = 170;
  const towerX = 35;
  const towerY = starkBaseY - towerH;

  // Modern Steel & Cyan Glass Frame
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(towerX, towerY, towerW, towerH);
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 2;
  ctx.strokeRect(towerX, towerY, towerW, towerH);

  // Multi-floor Glass Windows with Interior Lights
  for (let floor = 0; floor < 5; floor++) {
    const fy = towerY + 16 + (floor * 28);
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.fillRect(towerX + 8, fy, towerW - 16, 20);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
    ctx.strokeRect(towerX + 8, fy, towerW - 16, 20);

    // Glowing server lights inside
    ctx.fillStyle = floor % 2 === 0 ? '#00F0FF' : '#38BDF8';
    ctx.fillRect(towerX + 16, fy + 8, 6, 6);
    ctx.fillRect(towerX + 32, fy + 8, 6, 6);
    ctx.fillRect(towerX + 48, fy + 8, 6, 6);
  }

  // Rooftop Arc Reactor Beacon Spire
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 18;
  ctx.fillRect(towerX + (towerW / 2) - 4, towerY - 24, 8, 24);
  // Beacon beam shooting up into the sky
  const beaconGrad = ctx.createLinearGradient(0, towerY - 24, 0, 0);
  beaconGrad.addColorStop(0, 'rgba(0, 240, 255, 0.8)');
  beaconGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = beaconGrad;
  ctx.fillRect(towerX + (towerW / 2) - 6, 0, 12, towerY - 24);
  ctx.shadowBlur = 0;

  // STARK "A" LOGO
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px "Press Start 2P", monospace';
  ctx.fillText('STARK', towerX + 22, towerY + 12);

  // ── B. WAKANDAN VIBRANIUM BUNKER (x: 280 to 360) ──────────────────
  const bunkerBaseY = getGroundY(320);
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(285, bunkerBaseY - 48, 70, 48);
  ctx.strokeStyle = '#A855F7';
  ctx.lineWidth = 2;
  ctx.strokeRect(285, bunkerBaseY - 48, 70, 48);

  // Glowing Purple Vibranium Core Window
  ctx.fillStyle = 'rgba(168, 85, 247, 0.5)';
  ctx.fillRect(305, bunkerBaseY - 36, 30, 22);
  ctx.fillStyle = '#C084FC';
  ctx.fillRect(315, bunkerBaseY - 28, 10, 10);

  // ── C. SPIDER-MAN WEB TREEHOUSE (x: 390 to 450) ───────────────────
  const treeBaseY = getGroundY(420);
  // Oak Trunk
  ctx.fillStyle = '#6D4C41';
  ctx.fillRect(412, treeBaseY - 80, 16, 80);
  // Voxel Leaf Canopy
  ctx.fillStyle = '#2E7D32';
  ctx.fillRect(380, treeBaseY - 120, 80, 45);
  ctx.fillRect(395, treeBaseY - 135, 50, 15);
  // Hanging Web Blocks
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fillRect(390, treeBaseY - 75, 12, 18);
  ctx.fillRect(435, treeBaseY - 70, 10, 14);

  // ── D. THOR THUNDER SPIRE (x: 650 to 710) ─────────────────────────
  const altarBaseY = getGroundY(680);
  ctx.fillStyle = '#334155';
  ctx.fillRect(660, altarBaseY - 40, 40, 40);
  ctx.fillStyle = '#FBBF24'; // Gold altar cap
  ctx.fillRect(665, altarBaseY - 50, 30, 10);
  // Lightning Rod Spire
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(678, altarBaseY - 75, 4, 25);

  // ── E. DOCTOR DOOM LATVERIAN CASTLE (Right side: x: 840 to 940) ────
  const castleBaseY = getGroundY(890);
  const castleX = 840;
  const castleY = castleBaseY - 140;

  // Dark Cobblestone Tower Body
  ctx.fillStyle = '#374151';
  ctx.fillRect(castleX, castleY, 90, 140);
  ctx.strokeStyle = '#10B981';
  ctx.lineWidth = 2;
  ctx.strokeRect(castleX, castleY, 90, 140);

  // Battlements / Crenellations
  for (let b = 0; b < 5; b++) {
    ctx.fillStyle = '#1F2937';
    ctx.fillRect(castleX + (b * 18), castleY - 12, 12, 12);
  }

  // Nether Portal (Purple Swirl)
  ctx.fillStyle = '#090318';
  ctx.fillRect(castleX + 22, castleBaseY - 60, 44, 60);
  ctx.strokeStyle = '#381A6E';
  ctx.strokeRect(castleX + 22, castleBaseY - 60, 44, 60);

  // Animated Purple Portal Vortex
  const portalGrad = ctx.createLinearGradient(0, castleBaseY - 60, 0, castleBaseY);
  portalGrad.addColorStop(0, '#A855F7');
  portalGrad.addColorStop(0.5, '#7E22CE');
  portalGrad.addColorStop(1, '#3B0764');
  ctx.fillStyle = portalGrad;
  ctx.fillRect(castleX + 26, castleBaseY - 56, 36, 56);

  // Emerald Latverian Banner
  ctx.fillStyle = '#10B981';
  ctx.fillRect(castleX + 38, castleY + 16, 14, 28);
}

// ── 4. Character Physics & Walk Cycles ──────────────────────────────
function updateHeroPhysics() {
  for (const hero of Object.values(state.roamingAgents)) {
    const groundY = getGroundY(hero.x);
    hero.y = groundY;

    const dx = hero.targetX - hero.x;
    if (Math.abs(dx) > 3) {
      hero.isWalking = true;
      hero.facing = dx > 0 ? 1 : -1;
      hero.walkTimer += 0.22 * hero.speed;
      hero.x += Math.sign(dx) * hero.speed;
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

  // Pick random landmark across the horizontal map
  const destinations = [80, 230, 320, 420, 520, 680, 750, 810, 880];
  lucky.targetX = destinations[Math.floor(Math.random() * destinations.length)];
  lucky.isWalking = true;
}

// ── 5. Pure Code 2D Minecraft Hero Skin Renderer ────────────────────
function drawMinecraftHeroSkin(hero, time) {
  const x = hero.x;
  const y = hero.y;
  const facing = hero.facing || 1;
  const isWalking = hero.isWalking;
  const swing = isWalking ? Math.sin(hero.walkTimer) * 0.7 : 0;
  const scale = hero.id === 'hulk' ? 1.4 : 1.0;
  const bobY = isWalking ? Math.abs(Math.sin(hero.walkTimer * 2)) * 2 : 0;

  ctx.save();
  ctx.translate(x, y - (bobY * scale));
  ctx.scale(facing * scale, scale);

  // Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(-6, 0, 12, 3);

  // Selection Box
  if (hero.id === state.selectedAgentId) {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-10, -32, 20, 32);
  }

  // 1. LEGS (Left & Right Leg stepping)
  ctx.save();
  // Back Leg
  ctx.fillStyle = getLegColor(hero, false);
  ctx.save();
  ctx.translate(-2, -12);
  ctx.rotate(-swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  // Front Leg
  ctx.fillStyle = getLegColor(hero, true);
  ctx.save();
  ctx.translate(2, -12);
  ctx.rotate(swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();
  ctx.restore();

  // 2. TORSO / ARMOR (8x12 block)
  ctx.save();
  ctx.translate(0, -22);
  ctx.fillStyle = getTorsoColor(hero);
  ctx.fillRect(-4, 0, 8, 10);
  renderTorsoDetails(hero);
  ctx.restore();

  // 3. ARMS & HELD ITEMS (Swinging in opposition)
  // Back Arm
  ctx.save();
  ctx.translate(-4, -20);
  ctx.rotate(swing);
  ctx.fillStyle = getArmColor(hero, false);
  ctx.fillRect(-2, 0, 4, 10);
  ctx.restore();

  // Front Arm
  ctx.save();
  ctx.translate(4, -20);
  ctx.rotate(-swing);
  ctx.fillStyle = getArmColor(hero, true);
  ctx.fillRect(-2, 0, 4, 10);
  renderHeldItem(hero);
  ctx.restore();

  // 4. HEAD (8x8 block)
  ctx.save();
  ctx.translate(0, -28);
  ctx.fillStyle = getHeadColor(hero);
  ctx.fillRect(-4, -4, 8, 8);
  renderFaceDetails(hero);
  ctx.restore();

  ctx.restore();

  // 5. MINECRAFT FLOATING NAME TAG
  renderMinecraftNameTag(hero, x, y - 36 - (bobY * scale));
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

function getArmColor(hero, isFront) {
  switch (hero.skinType) {
    case 'iron-man': return '#F59E0B';
    case 'doctor-doom': return '#94A3B8';
    case 'thor': return '#E2E8F0';
    case 'thanos': return isFront ? '#FFC83B' : '#8B5CF6';
    case 'kang': return '#38BDF8';
    case 'doctor-strange': return '#DC2626';
    case 'captain-america': return '#DC2626';
    case 'spider-man': return '#DC2626';
    case 'hulk': return '#16A34A';
    default: return '#64748B';
  }
}

function getLegColor(hero, isFront) {
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
    // Glowing Arc Reactor
    ctx.fillStyle = '#00F0FF';
    ctx.fillRect(-1, 2, 3, 3);
  } else if (hero.skinType === 'captain-america') {
    // White Star
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(-1, 1, 3, 2);
  } else if (hero.skinType === 'doctor-doom') {
    // Gold Clasps
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-3, 1, 2, 2); ctx.fillRect(1, 1, 2, 2);
  }
}

function renderFaceDetails(hero) {
  if (hero.skinType === 'iron-man') {
    ctx.fillStyle = '#FBBF24'; // Gold Faceplate
    ctx.fillRect(-2, -3, 6, 5);
    ctx.fillStyle = '#00F0FF'; // Visor Eyes
    ctx.fillRect(1, -2, 2, 1.5);
  } else if (hero.skinType === 'doctor-doom') {
    ctx.fillStyle = '#94A3B8'; // Iron mask
    ctx.fillRect(-2, -3, 6, 6);
    ctx.fillStyle = '#000000';
    ctx.fillRect(1, -2, 2, 1.5);
  } else if (hero.skinType === 'spider-man') {
    ctx.fillStyle = '#FFFFFF'; // Spider Eye
    ctx.fillRect(0, -2, 3, 2.5);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(1, -2, 2, 2);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, -1, 1, 1);
  }
}

function renderHeldItem(hero) {
  if (hero.skinType === 'thor') {
    // Mjolnir Hammer
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(2, 6, 6, 5);
    ctx.fillStyle = '#78350F'; ctx.fillRect(4, 11, 2, 5);
  } else if (hero.skinType === 'captain-america') {
    // Vibranium Shield
    ctx.fillStyle = '#DC2626'; ctx.fillRect(2, 3, 6, 7);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(3, 4, 4, 5);
    ctx.fillStyle = '#2563EB'; ctx.fillRect(4, 5, 2, 3);
  } else if (hero.skinType === 'thanos') {
    // Golden Infinity Gauntlet with 6 gems
    ctx.fillStyle = '#FFC83B'; ctx.fillRect(2, 5, 5, 6);
    ctx.fillStyle = '#A855F7'; ctx.fillRect(3, 6, 1.5, 1.5);
    ctx.fillStyle = '#00F0FF'; ctx.fillRect(4, 8, 1.5, 1.5);
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

  ctx.save();
  ctx.lineWidth = 1.5;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;

    const grad = ctx.createLinearGradient(stark.x, stark.y - 18, agent.x, agent.y - 18);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.45)');
    grad.addColorStop(1, agent.glowColor || 'rgba(168, 85, 247, 0.35)');

    ctx.strokeStyle = grad;
    ctx.shadowColor = agent.themeColor || '#00F0FF';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    ctx.moveTo(stark.x, stark.y - 18);
    ctx.lineTo(agent.x, agent.y - 18);
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
    ctx.shadowBlur = 10;
    ctx.fillRect(curX - 2.5, curY - 2.5, 5, 5);
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
      from: { x: stark.x, y: stark.y - 18 },
      to: { x: agent.x, y: agent.y - 18 },
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
    state.activeAttacks.push({
      from: { x: hero.x, y: hero.y - 18 },
      to: { x: target.x, y: target.y - 18 },
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

function drawWeatherAndParticles() {
  // Rain
  for (const p of state.particles) {
    p.y += p.speedY;
    if (p.y > WORLD_HEIGHT) { p.y = 0; p.x = Math.random() * WORLD_WIDTH; }
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

// ── Multiverse Clash (All Heroes Execute Attack) ────────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL BATTLE CLASH] All Minecraft Avengers unleashing full combat grid!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers Assemble! Engage 2D voxel redstone battle grid!');

  for (const hero of Object.values(state.roamingAgents)) {
    triggerHeroAttack(hero);
    spawnPortalParticles(hero.x, hero.y, hero.themeColor);
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
    x: 100 + Math.random() * 700,
    targetX: 100 + Math.random() * 700,
  };
  state.roamingAgents[heroId].y = getGroundY(state.roamingAgents[heroId].x);

  state.selectedAgentId = heroId;
  spawnPortalParticles(state.roamingAgents[heroId].x, state.roamingAgents[heroId].y, hero.themeColor);
  renderStrongholdDock();
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [VOXEL HERO SPAWNED] ${hero.name} materialized in the 2D Minecraft world!`);
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
  const customX = 300 + Math.random() * 300;
  const newHero = {
    id: heroId,
    name,
    callsign,
    role,
    station: `${name} Research Pod`,
    image: './assets/iron_man.jpg',
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.7)',
    skinType: 'custom',
    power,
    x: customX,
    y: getGroundY(customX),
    targetX: customX,
    facing: 1,
    walkTimer: 0,
    isWalking: false,
    speed: 2.0,
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

  spawnPortalParticles(customX, getGroundY(customX), '#00F0FF');
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

  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / WORLD_WIDTH, rect.height / WORLD_HEIGHT);
  const offsetX = (rect.width - (WORLD_WIDTH * scale)) / 2;
  const offsetY = (rect.height - (WORLD_HEIGHT * scale)) / 2;

  const screenX = offsetX + (entity.x * scale);
  const screenY = offsetY + ((entity.y - 36) * scale);

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
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the 2D Minecraft world...`);

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
    console.log('⚡ Connected to Stark 2D Minecraft Incursion Comms');
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
            spawnPortalParticles(hero.x, hero.y, hero.themeColor);
          }
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.targetX = 80 + (Math.random() - 0.5) * 40; // Walk to Stark Tower!
          hero.isWalking = true;
          spawnPortalParticles(hero.x, hero.y, hero.themeColor);
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
