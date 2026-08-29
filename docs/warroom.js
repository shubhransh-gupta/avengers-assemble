/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // 100% 3D MINECRAFT AVENGERS & VALYRIAN LAVA SIMULATION
 * REAL 3D VOXEL TREES, BOILING LAVA LAKE & ALL SUPERHERO POWERS
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],          // Rain / cosmic sparks
  portalParticles: [],    // Nether portal particles
  lavaBubbles: [],        // Boiling lava bubbles & embers
  superpowerFx: [],       // Active Marvel superpower spells & beams
  xpOrbs: [],             // Minecraft XP Orbs
  dagPulses: [],          // Redstone energy blocks
  selectedAgentId: 'tony-stark',
  roamingAgents: {},
  thunderboltTimer: 0,
  powerShowcaseTimer: 0,
  time: 0,
  activeHotbarItem: 'diamond_sword',

  // Pedestal Swords in World
  swords: [
    { id: 'diamond_sword', name: 'Diamond Sword', type: 'diamond', gx: 15, gy: 10, gz: 1, color: '#4AEDD9', holder: null },
    { id: 'netherite_sword', name: 'Enchanted Netherite Sword', type: 'netherite', gx: 15, gy: 20, gz: 1, color: '#A855F7', holder: null },
  ],

  // Camera Pan & Zoom
  camera: {
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0,
    hasDragged: false,
  },
};

// Base Isometric Tile Metrics
const BASE_TILE_WIDTH = 48;
const BASE_TILE_HEIGHT = 24;
const BASE_BLOCK_DEPTH = 18;

// ── Procedural World Generator (Calculates Terrain for ANY (gx, gy)) ─
function getBlockData(gx, gy) {
  // 1. TAJ MAHAL OF INDIA (Center: gx 12..18, gy 12..18)
  if (gx >= 12 && gx <= 18 && gy >= 12 && gy <= 18) {
    return { h: 2, type: 'quartz' };
  }
  // Reflecting Water Pool in front of Taj Mahal (gx: 14..16, gy: 4..11)
  if (gx >= 14 && gx <= 16 && gy >= 4 && gy <= 11) {
    return { h: 0, type: 'water' };
  }
  // Sandstone Promenade flanking reflecting pool
  if ((gx === 13 || gx === 17) && gy >= 4 && gy <= 11) {
    return { h: 1, type: 'sandstone' };
  }

  // 2. STARK VOXEL TOWER (gx: 1..6, gy: 1..6)
  if (gx >= 1 && gx <= 6 && gy >= 1 && gy <= 6) {
    return { h: 3, type: 'iron' };
  }

  // 3. VALYRIAN / DOOM NETHER LAVA BIOME (gx: 22..30, gy: 22..30)
  if (gx >= 22 && gy >= 22) {
    // Castle keep
    if (gx >= 25 && gx <= 28 && gy >= 25 && gy <= 28) {
      return { h: 3, type: 'cobblestone' };
    }
    // Boiling Lava Lake & Falls surrounding Valyrian keep
    if ((gx >= 22 && gx <= 24 && gy >= 23 && gy <= 29) || (gy >= 22 && gy <= 24 && gx >= 23 && gx <= 29)) {
      return { h: 0, type: 'lava' };
    }
    // Magma / Obsidian crust
    if ((gx + gy) % 2 === 0) return { h: 2, type: 'magma' };
    return { h: 2, type: 'obsidian' };
  }

  // 4. THOR THUNDER HILL (gx: 24..29, gy: 1..6)
  if (gx >= 24 && gx <= 29 && gy >= 1 && gy <= 6) {
    return { h: 2, type: 'stone' };
  }

  // 5. WAKANDA VIBRANIUM BUNKER (gx: 1..6, gy: 24..29)
  if (gx >= 1 && gx <= 6 && gy >= 24 && gy <= 29) {
    return { h: 2, type: 'blackstone' };
  }

  // 6. THANOS OBSIDIAN PEAK (gx: 13..17, gy: 24..28)
  if (gx >= 13 && gx <= 17 && gy >= 24 && gy <= 28) {
    return { h: 3, type: 'obsidian' };
  }

  // 7. Natural Continuous Minecraft Green Meadows & Water Channels
  const wave = Math.sin(gx * 0.35) * Math.cos(gy * 0.35);
  let h = 1;
  if (wave > 0.45) h = 2;
  if (wave > 0.85) h = 3;

  // Diagonal Water Canal
  if (Math.abs(gx - gy - 8) <= 1 && !(gx >= 12 && gx <= 18 && gy >= 12 && gy <= 18) && !(gx >= 22 && gy >= 22)) {
    return { h: 0, type: 'water' };
  }

  return { h, type: 'grass' };
}

// ── Multi-Block 3D Voxel Minecraft Trees Generator ──────────────────
const VOXEL_TREES = [
  // Forest Cluster (West of Taj Mahal)
  { gx: 8, gy: 6, type: 'oak', height: 4 },
  { gx: 9, gy: 4, type: 'oak', height: 3 },
  { gx: 7, gy: 9, type: 'spruce', height: 5 },
  { gx: 10, gy: 10, type: 'oak', height: 4 },
  { gx: 6, gy: 12, type: 'birch', height: 4 },
  { gx: 8, gy: 14, type: 'oak', height: 3 },

  // Forest Cluster (East of Taj Mahal)
  { gx: 20, gy: 6, type: 'spruce', height: 5 },
  { gx: 22, gy: 8, type: 'spruce', height: 4 },
  { gx: 21, gy: 11, type: 'oak', height: 4 },
  { gx: 20, gy: 14, type: 'oak', height: 3 },
  { gx: 22, gy: 16, type: 'birch', height: 4 },

  // South Forest Cluster (Near Wakanda & Meadow)
  { gx: 8, gy: 20, type: 'oak', height: 4 },
  { gx: 10, gy: 22, type: 'spruce', height: 5 },
  { gx: 11, gy: 25, type: 'oak', height: 3 },
  { gx: 7, gy: 25, type: 'birch', height: 4 },

  // Spider-Man Web Treehouse Grove
  { gx: 10, gy: 7, type: 'giant_oak', height: 6 },
  { gx: 12, gy: 8, type: 'oak', height: 3 },
];

// ── Coordinate Conversion (Screen <-> Grid with Pan & Zoom) ─────────
function gridToScreen(gx, gy, gz = 0) {
  const tw = BASE_TILE_WIDTH * state.camera.zoom;
  const th = BASE_TILE_HEIGHT * state.camera.zoom;
  const bd = BASE_BLOCK_DEPTH * state.camera.zoom;

  const sx = originX + state.camera.panX + (gx - gy) * (tw / 2);
  const sy = originY + state.camera.panY + (gx + gy) * (th / 2) - (gz * bd);
  return { x: sx, y: sy };
}

function screenToGrid(sx, sy) {
  const tw = BASE_TILE_WIDTH * state.camera.zoom;
  const th = BASE_TILE_HEIGHT * state.camera.zoom;

  const dx = sx - (originX + state.camera.panX);
  const dy = sy - (originY + state.camera.panY);
  const gx = (dx / (tw / 2) + dy / (th / 2)) / 2;
  const gy = (dy / (th / 2) - dx / (tw / 2)) / 2;
  return { gx: Math.round(gx), gy: Math.round(gy) };
}

function getElevation(gx, gy) {
  return getBlockData(Math.round(gx), Math.round(gy)).h;
}

// ── Minecraft Avengers Characters Catalog with Unique Powers ────────
const MINECRAFT_HEROES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    station: 'Stark Voxel Spire',
    image: './assets/iron_man.jpg',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.75)',
    skinType: 'iron-man',
    power: 'repulsor_unibeam',
    gx: 4, gy: 4,
    targetGx: 4, targetGy: 4,
    walkTimer: 0,
    isWalking: false,
    speed: 0.08,
    weapon: 'repulsors',
    quote: 'Repulsors primed at 100% capacity! JARVIS, target the DAG.',
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
    power: 'web_stream',
    gx: 10, gy: 7,
    targetGx: 10, targetGy: 7,
    walkTimer: 0,
    isWalking: false,
    speed: 0.09,
    weapon: 'web_shooters',
    quote: 'THWIP! Spun up high-speed web nets across the voxel canopy!',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    station: 'Valyrian Lava Keep',
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.75)',
    skinType: 'doctor-doom',
    power: 'valyrian_dragonflame',
    gx: 26, gy: 26,
    targetGx: 26, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    speed: 0.065,
    weapon: 'dragonflame',
    quote: 'Doom commands the Valyrian dragonflame and Nether lava pits!',
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
    power: 'mjolnir_lightning',
    gx: 26, gy: 4,
    targetGx: 26, targetGy: 4,
    walkTimer: 0,
    isWalking: false,
    speed: 0.075,
    weapon: 'mjolnir',
    quote: 'FEEL THE WRATH OF ASGARDIAN THUNDER AND MJOLNIR STRIKES!',
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    station: 'Taj Mahal Astral Spire',
    image: './assets/doctor_strange.jpg',
    avatar: '🔮',
    themeColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.75)',
    skinType: 'doctor-strange',
    power: 'eldritch_mandala',
    gx: 15, gy: 15,
    targetGx: 15, targetGy: 15,
    walkTimer: 0,
    isWalking: false,
    speed: 0.07,
    weapon: 'eldritch_magic',
    quote: 'By the Vishanti, casting fiery Eldritch portal shields!',
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
    power: 'infinity_beam',
    gx: 15, gy: 26,
    targetGx: 15, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    speed: 0.055,
    weapon: 'infinity_gauntlet',
    quote: 'All six Infinity Stones unleashed. Reality bends to my will.',
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
    power: 'gamma_smash',
    gx: 8, gy: 16,
    targetGx: 8, targetGy: 16,
    walkTimer: 0,
    isWalking: false,
    speed: 0.06,
    weapon: 'fists',
    quote: 'HULK SMASH 3D VOXEL EARTH WITH GAMMA SHOCKWAVES!',
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
    power: 'vibranium_shield_throw',
    gx: 4, gy: 26,
    targetGx: 4, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    speed: 0.075,
    weapon: 'shield',
    quote: 'Vibranium shield bouncing with precision trajectory!',
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
    power: 'chrono_portal',
    gx: 20, gy: 12,
    targetGx: 20, targetGy: 12,
    walkTimer: 0,
    isWalking: false,
    speed: 0.07,
    weapon: 'chrono_device',
    quote: 'Opening temporal rifts across 14 billion Minecraft branches.',
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
    power: 'widow_bite_shock',
    gx: 8, gy: 11,
    targetGx: 8, targetGy: 11,
    walkTimer: 0,
    isWalking: false,
    speed: 0.085,
    weapon: 'batons',
    quote: 'Widow bites charged. Neutralizing perimeter security threats.',
    spawned: false,
  }
};

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

  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', '3D Voxel Trees & Valyrian Lava Biome loaded! All Marvel superpowers active.');
  }, 1000);

  setInterval(triggerAutonomousHeroMovement, 5000);
  setInterval(triggerDAGSimulationPulse, 6000);
  setInterval(triggerRandomHeroSuperpower, 3500);
});

// ── Canvas Setup & Event Handling (Pan, Zoom & Click) ────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    originX = canvas.width / 2;
    originY = canvas.height * 0.15;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(simulationLoop);

  // Mouse Drag to Pan Camera
  canvas.addEventListener('mousedown', (e) => {
    state.camera.isDragging = true;
    state.camera.dragStartX = e.clientX - state.camera.panX;
    state.camera.dragStartY = e.clientY - state.camera.panY;
    state.camera.hasDragged = false;
  });

  window.addEventListener('mousemove', (e) => {
    if (!state.camera.isDragging) return;
    const newPanX = e.clientX - state.camera.dragStartX;
    const newPanY = e.clientY - state.camera.dragStartY;
    if (Math.hypot(newPanX - state.camera.panX, newPanY - state.camera.panY) > 5) {
      state.camera.hasDragged = true;
    }
    state.camera.panX = newPanX;
    state.camera.panY = newPanY;
  });

  window.addEventListener('mouseup', (e) => {
    if (state.camera.isDragging && !state.camera.hasDragged) {
      handleCanvasClick(e);
    }
    state.camera.isDragging = false;
  });

  // Wheel to Zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomCamera(zoomFactor);
  }, { passive: false });
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 1. Check if clicked on a Floating Sword in the Pedestal
  for (const sword of state.swords) {
    const sPos = gridToScreen(sword.gx, sword.gy, sword.gz + 1);
    if (Math.hypot(sPos.x - clickX, sPos.y - clickY) < 32 * state.camera.zoom) {
      equipSwordOnSelectedHero(sword);
      return;
    }
  }

  // 2. Check if clicked on a hero -> trigger their superpower!
  let clickedHero = null;
  for (const hero of Object.values(state.roamingAgents)) {
    const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 0.5);
    if (Math.hypot(pos.x - clickX, pos.y - clickY) < 32 * state.camera.zoom) {
      clickedHero = hero;
      break;
    }
  }

  if (clickedHero) {
    state.selectedAgentId = clickedHero.id;
    executeHeroSuperpower(clickedHero);
    showCosmicSpeechBubble(clickedHero.id, clickedHero.quote);
    appendVerboseStream(`⚡ [${clickedHero.callsign} SUPERPOWER] Unleashed ${clickedHero.power}!`);
  } else {
    const grid = screenToGrid(clickX, clickY);
    const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
    if (hero) {
      hero.targetGx = grid.gx;
      hero.targetGy = grid.gy;
      hero.isWalking = true;
      const targetScreen = gridToScreen(grid.gx, grid.gy, getElevation(grid.gx, grid.gy));
      spawnPortalParticles(targetScreen.x, targetScreen.y, hero.themeColor);
      showCosmicSpeechBubble(hero.id, `Moving to (${grid.gx}, ${grid.gy})`);

      for (const sword of state.swords) {
        if (Math.hypot(grid.gx - sword.gx, grid.gy - sword.gy) <= 1) {
          setTimeout(() => equipSwordOnSelectedHero(sword), 1500);
        }
      }
    }
  }
}

function equipSwordOnSelectedHero(sword) {
  const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
  if (!hero) return;

  hero.weapon = sword.type === 'diamond' ? 'diamond_sword' : 'netherite_sword';
  const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 1);
  spawnPortalParticles(pos.x, pos.y, sword.color);
  spawnXpOrbs(pos.x, pos.y, 8);

  const swordName = sword.type === 'diamond' ? '💎 DIAMOND SWORD' : '🔮 ENCHANTED NETHERITE SWORD';
  showCosmicSpeechBubble(hero.id, `⚔️ ${swordName} EQUIPPED! Attack Damage +12!`);
  appendVerboseStream(`⚔️ [WEAPON EQUIPPED] ${hero.name} drew the ${swordName}! Sharpness V activated!`);
}

window.spawnDiamondSwordPedestal = function () {
  const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
  if (!hero) return;

  const targetGx = Math.round(hero.gx) + 1;
  const targetGy = Math.round(hero.gy);

  state.swords.push({
    id: `sword_${Date.now()}`,
    name: 'Diamond Sword',
    type: 'diamond',
    gx: targetGx,
    gy: targetGy,
    gz: getElevation(targetGx, targetGy),
    color: '#4AEDD9',
    holder: null,
  });

  const pos = gridToScreen(targetGx, targetGy, getElevation(targetGx, targetGy) + 1);
  spawnPortalParticles(pos.x, pos.y, '#4AEDD9');
  showCosmicSpeechBubble('tony-stark', 'Spawned a Legendary Diamond Sword on the pedestal!');
  appendVerboseStream(`💎 [MINECRAFT ITEM] Legendary Diamond Sword materialized at (${targetGx}, ${targetGy})!`);
};

window.selectHotbarItem = function (itemKey) {
  state.activeHotbarItem = itemKey;
  document.querySelectorAll('.hotbar-slot').forEach(el => el.classList.remove('active'));
  const target = event.currentTarget;
  if (target) target.classList.add('active');

  const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
  if (hero) {
    if (itemKey === 'diamond_sword') hero.weapon = 'diamond_sword';
    else if (itemKey === 'diamond_axe') hero.weapon = 'diamond_axe';
    else if (itemKey === 'diamond_pick') hero.weapon = 'diamond_pick';
    else if (itemKey === 'spellbook') hero.weapon = 'spellbook';

    showCosmicSpeechBubble(hero.id, `Equipped ${itemKey.replace('_', ' ').toUpperCase()} from Hotbar!`);
  }
};

window.zoomCamera = function (factor) {
  state.camera.zoom = Math.max(0.6, Math.min(2.5, state.camera.zoom * factor));
};

window.resetCamera = function () {
  state.camera.zoom = 1.0;
  state.camera.panX = 0;
  state.camera.panY = 0;
};

function initWeatherParticles() {
  for (let i = 0; i < 45; i++) {
    state.particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speedY: Math.random() * 2 + 1.2,
      size: Math.random() * 2 + 1.5,
      color: ['#00F0FF', '#38BDF8', '#818CF8', '#A855F7', '#FFD700'][Math.floor(Math.random() * 5)],
    });
  }
}

// ── Master Render Loop ──────────────────────────────────────────────
function simulationLoop(time) {
  state.time = time;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // 1. Draw Space Sky
  drawSpaceSky(w, h, time);

  // 2. Compute Viewport Bounds to Tile 100% of Screen Edge-to-Edge
  const pTL = screenToGrid(-60, -60);
  const pTR = screenToGrid(w + 60, -60);
  const pBL = screenToGrid(-60, h + 100);
  const pBR = screenToGrid(w + 60, h + 100);

  const minGx = Math.min(pTL.gx, pTR.gx, pBL.gx, pBR.gx) - 4;
  const maxGx = Math.max(pTL.gx, pTR.gx, pBL.gx, pBR.gx) + 4;
  const minGy = Math.min(pTL.gy, pTR.gy, pBL.gy, pBR.gy) - 4;
  const maxGy = Math.max(pTL.gy, pTR.gy, pBL.gy, pBR.gy) + 4;

  // 3. Render 100% Screen-Filling Isometric Block Terrain (With Lava & Magma)
  for (let sum = minGx + minGy; sum <= maxGx + maxGy; sum++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const gy = sum - gx;
      if (gy < minGy || gy > maxGy) continue;

      const data = getBlockData(gx, gy);
      for (let z = 0; z <= data.h; z++) {
        drawIsometricBlock(gx, gy, z, data.type, time);
      }
    }
  }

  // 4. Draw Real Multi-Block 3D Voxel Minecraft Trees (Oak, Spruce & Birch)
  drawRealVoxelTrees(time);

  // 5. Draw 3D Minecraft Taj Mahal of India & Avengers Monuments
  drawTajMahalAndMonuments(time);

  // 6. Draw Valyrian Lava Falls & Dragonfire Pits
  drawValyrianLavaAndFire(time);

  // 7. Draw Decorative Minecraft Game Objects (Crafting Tables, Furnaces, Chests, Lanterns)
  drawDecorativeMinecraftObjects(time);

  // 8. Draw 3D Floating Diamond Swords on Pedestals
  drawFloatingMinecraftSwords(time);

  // 9. Draw Redstone DAG Mesh Links & Traveling Energy Packets
  drawRedstoneDAGMesh(time);

  // 10. Draw Thor Lightning Strikes
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.012) {
    const thorAltarPos = gridToScreen(26, 4, 5);
    drawVoxelLightning(thorAltarPos.x, 10, thorAltarPos.x, thorAltarPos.y);
  }

  // 11. Update Character Physics & Walking Cycles
  updateHeroPhysics();

  // 12. Draw All 3D Isometric Minecraft Walking Characters (Depth sorted)
  const sortedHeroes = Object.values(state.roamingAgents).sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  for (const hero of sortedHeroes) {
    drawMinecraftIsometricHero(hero, time);
  }

  // 13. Draw All Marvel Superpowers (Webs, Repulsors, Dragonflame, Mandalas, Beams)
  drawAllSuperpowerEffects(time);

  // 14. Draw Lava Bubbles, XP Orbs & Rain Particles
  drawWeatherAndParticles(w, h, time);

  requestAnimationFrame(simulationLoop);
}

// ── 1. Cosmic Sky Background ────────────────────────────────────────
function drawSpaceSky(w, h, time) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#060114');
  skyGrad.addColorStop(0.5, '#120532');
  skyGrad.addColorStop(1, '#240A54');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 50; i++) {
    const sx = (i * 47 + 13) % w;
    const sy = (i * 29 + 7) % (h * 0.45);
    const blink = Math.sin(time * 0.003 + i) > 0 ? 2 : 1;
    ctx.fillRect(sx, sy, blink, blink);
  }
}

// ── 2. 3D Isometric Block Renderer ──────────────────────────────────
function drawIsometricBlock(gx, gy, gz, type, time) {
  const p = gridToScreen(gx, gy, gz);
  const hw = (BASE_TILE_WIDTH * state.camera.zoom) / 2;
  const hh = (BASE_TILE_HEIGHT * state.camera.zoom) / 2;
  const d = BASE_BLOCK_DEPTH * state.camera.zoom;

  let topColor = '#4D8C28';   // Vibrant Grass green
  let leftColor = '#79553A';  // Dirt left
  let rightColor = '#5D402A'; // Dirt right

  if (type === 'quartz') {
    topColor = '#FFFFFF'; leftColor = '#E2E8F0'; rightColor = '#CBD5E1';
  } else if (type === 'sandstone') {
    topColor = '#FDE68A'; leftColor = '#F59E0B'; rightColor = '#D97706';
  } else if (type === 'water') {
    topColor = '#00B4D8'; leftColor = '#0077B6'; rightColor = '#03045E';
  } else if (type === 'lava') {
    // 🌋 Boiling Valyrian Lava
    const pulse = Math.sin(time * 0.006 + gx + gy) * 0.15;
    topColor = pulse > 0 ? '#FF5722' : '#FF9800';
    leftColor = '#E65100';
    rightColor = '#BF360C';
  } else if (type === 'magma') {
    topColor = '#BF360C'; leftColor = '#870000'; rightColor = '#4A0000';
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
  } else if (type === 'wood_log') {
    topColor = '#8D6E63'; leftColor = '#5D4037'; rightColor = '#3E2723';
  } else if (type === 'oak_leaf') {
    topColor = '#2E6F22'; leftColor = '#225519'; rightColor = '#183D12';
  } else if (type === 'spruce_leaf') {
    topColor = '#1E4D2B'; leftColor = '#153920'; rightColor = '#0F2916';
  } else if (type === 'birch_log') {
    topColor = '#E0E0D1'; leftColor = '#C5C5B5'; rightColor = '#2A2A2A';
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

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 0.6;
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

  // Magma Glowing Cracks & Lava Glow
  if (type === 'lava' || type === 'magma') {
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(p.x - 2, p.y - 2, 4, 3);
  }
}

// ── 3. Real Multi-Block 3D Voxel Minecraft Trees ────────────────────
function drawRealVoxelTrees(time) {
  for (const tree of VOXEL_TREES) {
    const baseElev = getElevation(tree.gx, tree.gy);
    const logType = tree.type === 'birch' ? 'birch_log' : 'wood_log';
    const leafType = tree.type === 'spruce' ? 'spruce_leaf' : 'oak_leaf';

    // 1. Trunk (Stacked 3D wood log blocks)
    for (let z = 1; z <= tree.height; z++) {
      drawIsometricBlock(tree.gx, tree.gy, baseElev + z, logType, time);
    }

    // 2. Layer 1 Leaf Canopy (3x3 ring of leaf blocks)
    const leafZ1 = baseElev + tree.height;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue; // center has trunk
        drawIsometricBlock(tree.gx + dx, tree.gy + dy, leafZ1, leafType, time);
      }
    }

    // 3. Layer 2 Leaf Canopy (Cross / Top cluster)
    const leafZ2 = leafZ1 + 1;
    drawIsometricBlock(tree.gx, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx + 1, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx - 1, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx, tree.gy + 1, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx, tree.gy - 1, leafZ2, leafType, time);

    // 4. Cap Leaf Block
    drawIsometricBlock(tree.gx, tree.gy, leafZ2 + 1, leafType, time);
  }
}

// ── 4. 3D Minecraft Taj Mahal of India & Avengers Monuments ─────────
function drawTajMahalAndMonuments(time) {
  const zoom = state.camera.zoom;

  // 1. Four Corner Slender Minarets
  const minaretCorners = [
    { gx: 12, gy: 12 },
    { gx: 18, gy: 12 },
    { gx: 12, gy: 18 },
    { gx: 18, gy: 18 },
  ];

  for (const mc of minaretCorners) {
    for (let z = 3; z <= 8; z++) {
      drawIsometricBlock(mc.gx, mc.gy, z, 'quartz', time);
    }
    const mp = gridToScreen(mc.gx, mc.gy, 9);
    ctx.fillStyle = '#FFD700';
    ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 8;
    ctx.fillRect(mp.x - 2 * zoom, mp.y - 12 * zoom, 4 * zoom, 12 * zoom);
    ctx.shadowBlur = 0;
  }

  // 2. Main Mausoleum Body
  for (let z = 3; z <= 6; z++) {
    for (let x = 13; x <= 17; x++) {
      for (let y = 13; y <= 17; y++) {
        const isPortal = (x === 15 && y === 13 && z <= 5);
        if (!isPortal) {
          drawIsometricBlock(x, y, z, 'quartz', time);
        } else {
          const pp = gridToScreen(x, y, z);
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(pp.x - 6 * zoom, pp.y - 10 * zoom, 12 * zoom, 16 * zoom);
        }
      }
    }
  }

  // 3. Central Grand Bulbous White Dome with Golden Spire
  for (let x = 14; x <= 16; x++) {
    for (let y = 14; y <= 16; y++) {
      drawIsometricBlock(x, y, 7, 'quartz', time);
    }
  }
  drawIsometricBlock(15, 15, 8, 'quartz', time);

  const domeSpirePos = gridToScreen(15, 15, 9);
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700'; ctx.shadowBlur = 18;
  ctx.fillRect(domeSpirePos.x - 3 * zoom, domeSpirePos.y - 24 * zoom, 6 * zoom, 24 * zoom);
  ctx.beginPath();
  ctx.arc(domeSpirePos.x, domeSpirePos.y - 26 * zoom, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Stark 3D Voxel Tower
  for (let z = 4; z <= 10; z++) {
    for (let x = 3; x <= 5; x++) {
      for (let y = 3; y <= 5; y++) {
        drawIsometricBlock(x, y, z, 'iron', time);
      }
    }
  }
  const beaconPos = gridToScreen(4, 4, 11);
  ctx.fillStyle = '#00F0FF';
  ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 22;
  ctx.fillRect(beaconPos.x - 4 * zoom, beaconPos.y - 22 * zoom, 8 * zoom, 22 * zoom);
  const beamGrad = ctx.createLinearGradient(0, beaconPos.y - 22 * zoom, 0, 0);
  beamGrad.addColorStop(0, 'rgba(0, 240, 255, 0.9)');
  beamGrad.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = beamGrad;
  ctx.fillRect(beaconPos.x - 6 * zoom, 0, 12 * zoom, beaconPos.y - 22 * zoom);
  ctx.shadowBlur = 0;

  // Doctor Doom Latverian / Valyrian 3D Castle Keep
  for (let z = 4; z <= 7; z++) {
    for (let x = 25; x <= 28; x++) {
      for (let y = 25; y <= 28; y++) {
        drawIsometricBlock(x, y, z, 'cobblestone', time);
      }
    }
  }
  const portalPos = gridToScreen(26, 25, 4);
  ctx.fillStyle = 'rgba(168, 85, 247, 0.9)';
  ctx.shadowColor = '#A855F7'; ctx.shadowBlur = 16;
  ctx.fillRect(portalPos.x - 12 * zoom, portalPos.y - 26 * zoom, 24 * zoom, 26 * zoom);
  ctx.shadowBlur = 0;

  // Thor Thunder Altar Spire
  for (let z = 3; z <= 5; z++) {
    drawIsometricBlock(26, 4, z, 'stone', time);
  }
  const spirePos = gridToScreen(26, 4, 5);
  ctx.fillStyle = '#FBBF24'; ctx.fillRect(spirePos.x - 5 * zoom, spirePos.y - 12 * zoom, 10 * zoom, 6 * zoom);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(spirePos.x - 2 * zoom, spirePos.y - 30 * zoom, 4 * zoom, 18 * zoom);

  // Wakandan Vibranium Bunker
  for (let z = 3; z <= 4; z++) {
    for (let x = 3; x <= 5; x++) {
      drawIsometricBlock(x, 26, z, 'blackstone', time);
    }
  }
  const bunkerPos = gridToScreen(4, 26, 4);
  ctx.fillStyle = '#A855F7'; ctx.fillRect(bunkerPos.x - 7 * zoom, bunkerPos.y - 12 * zoom, 14 * zoom, 12 * zoom);
}

// ── 5. Valyrian Lava Falls & Roaring Dragonfire Pits ─────────────────
function drawValyrianLavaAndFire(time) {
  const zoom = state.camera.zoom;

  // 1. Dragonfire Brazier Pit at Doom Castle (24, 24)
  const brazierPos = gridToScreen(24, 24, 3);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(brazierPos.x - 6 * zoom, brazierPos.y - 8 * zoom, 12 * zoom, 8 * zoom);
  // Roaring Green / Orange Valyrian Flame
  const flameH = (14 + Math.sin(time * 0.02) * 4) * zoom;
  const flameGrad = ctx.createLinearGradient(0, brazierPos.y - 8 * zoom, 0, brazierPos.y - 8 * zoom - flameH);
  flameGrad.addColorStop(0, '#10B981');
  flameGrad.addColorStop(0.5, '#34D399');
  flameGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
  ctx.fillStyle = flameGrad;
  ctx.shadowColor = '#10B981'; ctx.shadowBlur = 16;
  ctx.fillRect(brazierPos.x - 5 * zoom, brazierPos.y - 8 * zoom - flameH, 10 * zoom, flameH);
  ctx.shadowBlur = 0;

  // 2. Roaring Fire Pit at (28, 24)
  const firePos = gridToScreen(28, 24, 3);
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(firePos.x - 6 * zoom, firePos.y - 8 * zoom, 12 * zoom, 8 * zoom);
  const orangeFlameH = (14 + Math.cos(time * 0.025) * 4) * zoom;
  ctx.fillStyle = '#F97316';
  ctx.shadowColor = '#EF4444'; ctx.shadowBlur = 14;
  ctx.fillRect(firePos.x - 5 * zoom, firePos.y - 8 * zoom - orangeFlameH, 10 * zoom, orangeFlameH);
  ctx.shadowBlur = 0;

  // Spawn periodic lava bubbles
  if (Math.random() < 0.25) {
    const lPos = gridToScreen(22 + Math.random() * 6, 22 + Math.random() * 6, 0.5);
    state.lavaBubbles.push({
      x: lPos.x,
      y: lPos.y,
      vx: (Math.random() - 0.5) * 2,
      vy: -Math.random() * 2 - 1,
      size: Math.random() * 3 + 2,
      life: 1.0,
    });
  }
}

// ── 6. Decorative Minecraft Game Objects ─────────────────────────────
function drawDecorativeMinecraftObjects(time) {
  const zoom = state.camera.zoom;

  // Crafting Tables
  drawCraftingTable(10, 14, 1, zoom);
  drawCraftingTable(21, 14, 1, zoom);

  // Furnaces
  drawFurnace(10, 15, 1, zoom, time);
  drawFurnace(21, 15, 1, zoom, time);

  // Chest
  drawChest(11, 15, 1, zoom);

  // Enchanting Table
  drawEnchantingTable(15, 13, 2, zoom, time);

  // Lanterns & Torches
  drawMinecraftLantern(13, 5, 2, zoom, time);
  drawMinecraftLantern(17, 5, 2, zoom, time);
  drawMinecraftLantern(13, 11, 2, zoom, time);
  drawMinecraftLantern(17, 11, 2, zoom, time);
  drawMinecraftTorch(4, 4, 4, zoom, time);
  drawMinecraftTorch(26, 26, 4, zoom, time);
}

function drawCraftingTable(gx, gy, gz, zoom) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#A16207'; // Oak Wood
  ctx.fillRect(p.x - 8 * zoom, p.y - 14 * zoom, 16 * zoom, 14 * zoom);
  ctx.fillStyle = '#78350F';
  ctx.fillRect(p.x - 6 * zoom, p.y - 13 * zoom, 12 * zoom, 4 * zoom);
}

function drawFurnace(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#475569';
  ctx.fillRect(p.x - 8 * zoom, p.y - 14 * zoom, 16 * zoom, 14 * zoom);
  const flicker = Math.sin(time * 0.02) * 0.3 + 0.7;
  ctx.fillStyle = `rgba(249, 115, 22, ${flicker})`;
  ctx.fillRect(p.x - 4 * zoom, p.y - 8 * zoom, 8 * zoom, 6 * zoom);
}

function drawChest(gx, gy, gz, zoom) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(p.x - 7 * zoom, p.y - 12 * zoom, 14 * zoom, 12 * zoom);
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(p.x - 2 * zoom, p.y - 8 * zoom, 4 * zoom, 4 * zoom);
}

function drawEnchantingTable(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(p.x - 9 * zoom, p.y - 10 * zoom, 18 * zoom, 10 * zoom);
  ctx.fillStyle = '#DC2626';
  ctx.fillRect(p.x - 8 * zoom, p.y - 12 * zoom, 16 * zoom, 3 * zoom);

  const floatY = Math.sin(time * 0.005) * 4 * zoom;
  const rot = time * 0.003;
  ctx.save();
  ctx.translate(p.x, p.y - 20 * zoom + floatY);
  ctx.rotate(Math.sin(rot) * 0.3);
  ctx.fillStyle = '#9333EA';
  ctx.fillRect(-6 * zoom, -4 * zoom, 12 * zoom, 8 * zoom);
  ctx.fillStyle = '#FDE047';
  ctx.fillRect(-4 * zoom, -3 * zoom, 8 * zoom, 6 * zoom);
  ctx.restore();
}

function drawMinecraftLantern(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#334155';
  ctx.fillRect(p.x - 1.5 * zoom, p.y - 16 * zoom, 3 * zoom, 16 * zoom);
  const flicker = Math.sin(time * 0.015 + gx) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(251, 191, 36, ${flicker})`;
  ctx.shadowColor = '#F59E0B'; ctx.shadowBlur = 10;
  ctx.fillRect(p.x - 3.5 * zoom, p.y - 22 * zoom, 7 * zoom, 8 * zoom);
  ctx.shadowBlur = 0;
}

function drawMinecraftTorch(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#78350F';
  ctx.fillRect(p.x - 1.5 * zoom, p.y - 12 * zoom, 3 * zoom, 12 * zoom);
  ctx.fillStyle = '#F97316';
  ctx.shadowColor = '#EF4444'; ctx.shadowBlur = 8;
  ctx.fillRect(p.x - 2 * zoom, p.y - 15 * zoom, 4 * zoom, 4 * zoom);
  ctx.shadowBlur = 0;
}

// ── 7. 3D Floating Diamond & Netherite Swords on Pedestals ──────────
function drawFloatingMinecraftSwords(time) {
  const zoom = state.camera.zoom;

  for (const sword of state.swords) {
    const p = gridToScreen(sword.gx, sword.gy, sword.gz);
    const floatY = Math.sin(time * 0.005 + sword.gx) * (5 * zoom);
    const rot = time * 0.004;

    ctx.fillStyle = '#334155';
    ctx.fillRect(p.x - 6 * zoom, p.y - 6 * zoom, 12 * zoom, 6 * zoom);

    ctx.save();
    ctx.translate(p.x, p.y - 24 * zoom + floatY);
    ctx.rotate(rot);

    ctx.fillStyle = sword.color;
    ctx.shadowColor = sword.color;
    ctx.shadowBlur = 14;
    ctx.fillRect(-2 * zoom, -14 * zoom, 4 * zoom, 16 * zoom);

    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-6 * zoom, 2 * zoom, 12 * zoom, 2.5 * zoom);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-1.5 * zoom, 4.5 * zoom, 3 * zoom, 6 * zoom);
    ctx.shadowBlur = 0;

    ctx.restore();

    ctx.font = `${Math.max(6, 7 * zoom)}px "Press Start 2P", monospace`;
    ctx.fillStyle = sword.color;
    ctx.textAlign = 'center';
    ctx.fillText(sword.name.toUpperCase(), p.x, p.y - 38 * zoom + floatY);
    ctx.textAlign = 'left';
  }
}

// ── 8. Superpower Showcase Engine for ALL Marvel Heroes ─────────────
function triggerRandomHeroSuperpower() {
  const heroes = Object.values(state.roamingAgents);
  if (heroes.length === 0) return;
  const hero = heroes[Math.floor(Math.random() * heroes.length)];
  executeHeroSuperpower(hero);
}

function executeHeroSuperpower(hero) {
  const startPos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 1);

  // Pick target or landmark
  let targetPos;
  const others = Object.values(state.roamingAgents).filter(a => a.id !== hero.id);
  if (others.length > 0) {
    const target = others[Math.floor(Math.random() * others.length)];
    targetPos = gridToScreen(target.gx, target.gy, getElevation(target.gx, target.gy) + 1);
  } else {
    targetPos = gridToScreen(15, 15, 3);
  }

  state.superpowerFx.push({
    heroId: hero.id,
    power: hero.power,
    from: startPos,
    to: targetPos,
    color: hero.themeColor,
    life: 1.0,
    maxLife: 1.0,
  });

  // Spawn visual celebration
  spawnPortalParticles(startPos.x, startPos.y, hero.themeColor);
  spawnXpOrbs(startPos.x, startPos.y, 4);
}

function drawAllSuperpowerEffects(time) {
  const zoom = state.camera.zoom;

  state.superpowerFx = state.superpowerFx.filter(fx => {
    fx.life -= 0.025;
    const alpha = Math.max(0, fx.life);

    ctx.save();
    ctx.globalAlpha = alpha;

    if (fx.power === 'repulsor_unibeam') {
      // 🦾 IRON MAN: Cyan Repulsor Laser & Chest Beam
      ctx.strokeStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    } else if (fx.power === 'web_stream') {
      // 🕸️ SPIDER-MAN: White Web Lines with Cross Webbing
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#EF4444';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      const midX = (fx.from.x + fx.to.x) / 2;
      const midY = (fx.from.y + fx.to.y) / 2 - 20 * zoom;
      ctx.quadraticCurveTo(midX, midY, fx.to.x, fx.to.y);
      ctx.stroke();
      // Web net circle at target
      ctx.beginPath();
      ctx.arc(fx.to.x, fx.to.y, 16 * zoom, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.power === 'valyrian_dragonflame') {
      // 👑 DOCTOR DOOM: Emerald Valyrian Dragonfire Stream
      ctx.strokeStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    } else if (fx.power === 'mjolnir_lightning') {
      // ⚡ THOR: Lightning Arc to Target
      drawVoxelLightning(fx.from.x, fx.from.y, fx.to.x, fx.to.y);
    } else if (fx.power === 'eldritch_mandala') {
      // 🔮 DOCTOR STRANGE: Spinning Fiery Orange Eldritch Mandala Shield
      ctx.strokeStyle = '#F59E0B';
      ctx.shadowColor = '#F59E0B';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.arc(fx.from.x, fx.from.y - 12 * zoom, 22 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(fx.from.x - 14 * zoom, fx.from.y - 26 * zoom, 28 * zoom, 28 * zoom);
    } else if (fx.power === 'infinity_beam') {
      // 🪐 THANOS: Rainbow 6-Gem Infinity Gauntlet Cosmic Beam
      const colors = ['#38BDF8', '#DC2626', '#10B981', '#A855F7', '#F59E0B', '#FBBF24'];
      for (let c = 0; c < colors.length; c++) {
        ctx.strokeStyle = colors[c];
        ctx.lineWidth = 2 * zoom;
        ctx.beginPath();
        ctx.moveTo(fx.from.x, fx.from.y - 6 + c * 2);
        ctx.lineTo(fx.to.x, fx.to.y - 6 + c * 2);
        ctx.stroke();
      }
    } else if (fx.power === 'gamma_smash') {
      // 🟢 HULK: Green Ground Shockwave Rings
      ctx.strokeStyle = '#22C55E';
      ctx.shadowColor = '#22C55E';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 4 * zoom;
      const radius = (1.0 - fx.life) * 45 * zoom;
      ctx.beginPath();
      ctx.arc(fx.from.x, fx.from.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.power === 'vibranium_shield_throw') {
      // 🛡️ CAPTAIN AMERICA: Bouncing Vibranium Shield
      const curX = fx.from.x + (fx.to.x - fx.from.x) * (1 - fx.life);
      const curY = fx.from.y + (fx.to.y - fx.from.y) * (1 - fx.life);
      ctx.fillStyle = '#DC2626';
      ctx.beginPath();
      ctx.arc(curX, curY, 8 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(curX, curY, 5 * zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2563EB';
      ctx.beginPath();
      ctx.arc(curX, curY, 2.5 * zoom, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.power === 'chrono_portal') {
      // ⏳ KANG: Blue Chrono-Warp Ring
      ctx.strokeStyle = '#38BDF8';
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 16;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.ellipse(fx.from.x, fx.from.y, 24 * zoom, 12 * zoom, Math.PI / 4, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Default Energy Line
      ctx.strokeStyle = fx.color || '#00F0FF';
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    }

    ctx.restore();
    return fx.life > 0;
  });
}

// ── 9. Character Physics & Walk Cycles ──────────────────────────────
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

  const spots = [
    { gx: 15, gy: 15 }, // Taj Mahal Center
    { gx: 15, gy: 10 }, // Diamond Sword Pedestal
    { gx: 10, gy: 14 }, // Crafting Table
    { gx: 15, gy: 7 },  // Reflecting Pool Front
    { gx: 4, gy: 4 },   // Stark Tower
    { gx: 26, gy: 26 }, // Doom Castle / Valyrian Lava Keep
    { gx: 26, gy: 4 },  // Thor Altar
    { gx: 4, gy: 26 },  // Wakanda Bunker
    { gx: 15, gy: 26 }, // Thanos Altar
    { gx: 10, gy: 7 },  // Spider-Man Outpost
    { gx: 8, gy: 16 },  // Gamma Meadow
  ];
  const target = spots[Math.floor(Math.random() * spots.length)];
  lucky.targetGx = target.gx;
  lucky.targetGy = target.gy;
  lucky.isWalking = true;
}

// ── 10. 3D Isometric Minecraft Hero Skin Renderer ───────────────────
function drawMinecraftIsometricHero(hero, time) {
  const gz = getElevation(hero.gx, hero.gy);
  const pos = gridToScreen(hero.gx, hero.gy, gz);
  const isWalking = hero.isWalking;
  const swing = isWalking ? Math.sin(hero.walkTimer) * 0.6 : 0;
  const bobY = isWalking ? Math.abs(Math.sin(hero.walkTimer * 2)) * 2 : 0;
  const scale = (hero.id === 'hulk' ? 1.4 : 1.05) * state.camera.zoom;

  ctx.save();
  ctx.translate(pos.x, pos.y - bobY * state.camera.zoom);
  ctx.scale(scale, scale);

  // Selection Indicator
  if (hero.id === state.selectedAgentId) {
    ctx.strokeStyle = '#00F0FF';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-13, -44, 26, 46);
  }

  // 1. LEGS
  ctx.fillStyle = getLegColor(hero);
  ctx.save();
  ctx.translate(-3, -12);
  ctx.rotate(swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  ctx.save();
  ctx.translate(3, -12);
  ctx.rotate(-swing);
  ctx.fillRect(-2, 0, 4, 12);
  ctx.restore();

  // 2. TORSO
  ctx.save();
  ctx.translate(0, -24);
  ctx.fillStyle = getTorsoColor(hero);
  ctx.fillRect(-5, 0, 10, 12);
  renderTorsoDetails(hero);
  ctx.restore();

  // 3. ARMS & WEAPONS
  ctx.save();
  ctx.translate(-7, -22);
  ctx.rotate(-swing);
  ctx.fillStyle = getArmColor(hero, true);
  ctx.fillRect(-2, 0, 4, 11);
  ctx.restore();

  ctx.save();
  ctx.translate(7, -22);
  ctx.rotate(swing);
  ctx.fillStyle = getArmColor(hero, false);
  ctx.fillRect(-2, 0, 4, 11);
  renderHeldItem(hero, swing);
  ctx.restore();

  // 4. HEAD
  ctx.save();
  ctx.translate(0, -32);
  ctx.fillStyle = getHeadColor(hero);
  ctx.fillRect(-5, -6, 10, 10);
  renderFaceDetails(hero);
  ctx.restore();

  ctx.restore();

  // 5. MINECRAFT FLOATING NAME TAG
  renderMinecraftNameTag(hero, pos.x, pos.y - (46 + bobY) * state.camera.zoom);
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
    ctx.fillStyle = '#00F0FF'; ctx.fillRect(-2, 3, 4, 4);
  } else if (hero.skinType === 'captain-america') {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2, 2, 4, 3);
  } else if (hero.skinType === 'doctor-doom') {
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(-3, 2, 2, 2); ctx.fillRect(1, 2, 2, 2);
  }
}

function renderFaceDetails(hero) {
  if (hero.skinType === 'iron-man') {
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(-3, -4, 6, 6);
    ctx.fillStyle = '#00F0FF'; ctx.fillRect(-2, -3, 1.5, 1.5); ctx.fillRect(1, -3, 1.5, 1.5);
  } else if (hero.skinType === 'doctor-doom') {
    ctx.fillStyle = '#94A3B8'; ctx.fillRect(-3, -4, 6, 6);
    ctx.fillStyle = '#000000'; ctx.fillRect(-2, -3, 1.5, 1.5); ctx.fillRect(1, -3, 1.5, 1.5);
  } else if (hero.skinType === 'spider-man') {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-3, -3, 2.5, 2.5); ctx.fillRect(0.5, -3, 2.5, 2.5);
  } else {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2.5, -3, 2, 2); ctx.fillRect(0.5, -3, 2, 2);
    ctx.fillStyle = '#000000'; ctx.fillRect(-1.5, -2, 1, 1); ctx.fillRect(1.5, -2, 1, 1);
  }
}

function renderHeldItem(hero, swing) {
  if (hero.weapon === 'diamond_sword') {
    ctx.save();
    ctx.translate(2, 6);
    ctx.rotate(0.6 + swing);
    ctx.fillStyle = '#4AEDD9';
    ctx.shadowColor = '#4AEDD9'; ctx.shadowBlur = 8;
    ctx.fillRect(0, -12, 3, 14);
    ctx.fillStyle = '#FBBF24';
    ctx.fillRect(-2, 2, 7, 2);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, 4, 3, 4);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else if (hero.weapon === 'netherite_sword') {
    ctx.save();
    ctx.translate(2, 6);
    ctx.rotate(0.6 + swing);
    ctx.fillStyle = '#A855F7';
    ctx.shadowColor = '#A855F7'; ctx.shadowBlur = 8;
    ctx.fillRect(0, -12, 3, 14);
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(-2, 2, 7, 2);
    ctx.fillStyle = '#78350F'; ctx.fillRect(0, 4, 3, 4);
    ctx.shadowBlur = 0;
    ctx.restore();
  } else if (hero.skinType === 'thor') {
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
  ctx.font = `${Math.max(7, 8 * state.camera.zoom)}px "Press Start 2P", monospace`;
  const textWidth = ctx.measureText(label).width;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(x - (textWidth / 2) - 4, y - 9, textWidth + 8, 12);
  ctx.strokeStyle = hero.themeColor || '#00F0FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - (textWidth / 2) - 4, y - 9, textWidth + 8, 12);

  ctx.fillStyle = '#000000';
  ctx.fillText(label, x - (textWidth / 2) + 1, y);
  ctx.fillStyle = hero.themeColor || '#FFFFFF';
  ctx.fillText(label, x - (textWidth / 2), y - 1);

  ctx.restore();
}

// ── 11. Redstone DAG Mesh & Energy Packets ──────────────────────────
function drawRedstoneDAGMesh(time) {
  const stark = state.roamingAgents['tony-stark'];
  if (!stark) return;

  const sPos = gridToScreen(stark.gx, stark.gy, getElevation(stark.gx, stark.gy) + 1);

  ctx.save();
  ctx.lineWidth = 1.6 * state.camera.zoom;

  for (const [id, agent] of Object.entries(state.roamingAgents)) {
    if (id === 'tony-stark') continue;

    const aPos = gridToScreen(agent.gx, agent.gy, getElevation(agent.gx, agent.gy) + 1);

    const grad = ctx.createLinearGradient(sPos.x, sPos.y, aPos.x, aPos.y);
    grad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
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

  state.dagPulses = state.dagPulses.filter(pulse => {
    pulse.progress += 0.035;
    if (pulse.progress >= 1.0) return false;

    const curX = pulse.from.x + (pulse.to.x - pulse.from.x) * pulse.progress;
    const curY = pulse.from.y + (pulse.to.y - pulse.from.y) * pulse.progress;

    ctx.save();
    ctx.fillStyle = pulse.color;
    ctx.shadowColor = pulse.color;
    ctx.shadowBlur = 12;
    const sz = 6 * state.camera.zoom;
    ctx.fillRect(curX - sz / 2, curY - sz / 2, sz, sz);
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

// ── 12. Lightning & Particles ───────────────────────────────────────
function drawVoxelLightning(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.shadowColor = '#00F0FF';
  ctx.shadowBlur = 18;
  ctx.lineWidth = 3 * state.camera.zoom;

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  let curX = x1;
  let curY = y1;
  while (curY < y2) {
    curX += (Math.floor(Math.random() * 3) - 1) * (12 * state.camera.zoom);
    curY += 16 * state.camera.zoom;
    ctx.lineTo(curX, curY);
  }
  ctx.stroke();
  ctx.restore();
}

function spawnPortalParticles(x, y, color) {
  for (let i = 0; i < 18; i++) {
    state.portalParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 3 + 2,
      color: color || '#A855F7',
      life: 1.0,
    });
  }
}

function spawnXpOrbs(x, y, count = 6) {
  for (let i = 0; i < count; i++) {
    state.xpOrbs.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 3 + 3,
      color: '#4ADE80',
      life: 1.0,
    });
  }
}

function drawWeatherAndParticles(w, h, time) {
  for (const p of state.particles) {
    p.y += p.speedY;
    if (p.y > h) { p.y = 0; p.x = Math.random() * w; }
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }

  // Boiling Lava Bubbles
  state.lavaBubbles = state.lavaBubbles.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.life -= 0.03;

    ctx.save();
    ctx.globalAlpha = b.life;
    ctx.fillStyle = '#FF9800';
    ctx.shadowColor = '#FF5722';
    ctx.shadowBlur = 8;
    ctx.fillRect(b.x, b.y, b.size * state.camera.zoom, b.size * state.camera.zoom);
    ctx.restore();

    return b.life > 0;
  });

  // Portal particles
  state.portalParticles = state.portalParticles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.04;

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size * state.camera.zoom, p.size * state.camera.zoom);
    ctx.restore();

    return p.life > 0;
  });

  // XP Orbs
  state.xpOrbs = state.xpOrbs.filter(orb => {
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.vy += 0.12;
    orb.life -= 0.02;

    ctx.save();
    ctx.globalAlpha = orb.life;
    ctx.fillStyle = '#4ADE80';
    ctx.shadowColor = '#22C55E';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size * state.camera.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return orb.life > 0;
  });
}

// ── Multiverse Clash ────────────────────────────────────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL BATTLE CLASH] All Minecraft Avengers drawing Diamond Swords & launching combat grid!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers Assemble! Defend the Taj Mahal & Valyrian Grid!');

  for (const hero of Object.values(state.roamingAgents)) {
    hero.weapon = 'diamond_sword';
    executeHeroSuperpower(hero);
    const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
    spawnPortalParticles(pos.x, pos.y, hero.themeColor);
    spawnXpOrbs(pos.x, pos.y, 4);
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
        ${isSpawned ? '● ACTIVE' : '➕ SPAWN NOW'}
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
    gx: 10 + Math.random() * 10,
    gy: 10 + Math.random() * 10,
    targetGx: 10 + Math.random() * 10,
    targetGy: 10 + Math.random() * 10,
    spawned: true,
  };

  state.selectedAgentId = heroId;
  const pos = gridToScreen(state.roamingAgents[heroId].gx, state.roamingAgents[heroId].gy, getElevation(state.roamingAgents[heroId].gx, state.roamingAgents[heroId].gy));
  spawnPortalParticles(pos.x, pos.y, hero.themeColor);
  spawnXpOrbs(pos.x, pos.y, 6);
  renderStrongholdDock();
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [VOXEL HERO MATERIALIZED] ${hero.name} spawned into the Minecraft world!`);
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
  const customGx = 12 + Math.random() * 6;
  const customGy = 12 + Math.random() * 6;

  const newHero = {
    id: heroId,
    name,
    callsign,
    role,
    station: `${name} Taj Mahal Pod`,
    image: './assets/iron_man.jpg',
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.75)',
    skinType: 'custom',
    power,
    weapon: 'diamond_sword',
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
  bubble.style.top = `${pos.y - 48 * state.camera.zoom}px`;

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
      executeHeroSuperpower(entity);
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
    else if (tagName.includes('MINECRAFT')) color = '#4AEDD9';

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
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the Minecraft world...`);

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
    console.log('⚡ Connected to Stark 100% Edge-to-Edge Minecraft Comms');
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
            executeHeroSuperpower(hero);
            const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
            spawnPortalParticles(pos.x, pos.y, hero.themeColor);
          }
          showCosmicSpeechBubble(speaker, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.targetGx = 4 + (Math.random() - 0.5) * 2;
          hero.targetGy = 4 + (Math.random() - 0.5) * 2;
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
