/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // 100% 3D MINECRAFT AVENGERS & CREATIVE BUILD MODE
 * UNIFIED ARCHITECTURE, DEFAULT 5-HERO SQUAD & ON-DEMAND SPECIALISTS
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'code', // 'chat' | 'code' | 'result'
  missionActive: false,
  buildMode: false,
  selectedBlockType: 'oak_plank',
  placedBlocks: {},     // Key: "gx,gy,gz" -> blockType
  hoverGrid: null,      // Current hovered {gx, gy}
  particles: [],        // Rain / cosmic sparks
  portalParticles: [],  // Nether portal particles
  blockParticles: [],   // Break / Place particles
  lavaBubbles: [],      // Boiling lava bubbles & embers
  superpowerFx: [],     // Active Marvel superpower spells & beams
  xpOrbs: [],           // Minecraft XP Orbs
  dagPulses: [],        // Redstone energy blocks
  selectedAgentId: 'tony-stark',
  roamingAgents: {},
  thunderboltTimer: 0,
  time: 0,
  activeHotbarItem: 'diamond_sword',

  // Pedestal Swords in World
  swords: [
    { id: 'diamond_sword', name: 'Diamond Sword', type: 'diamond', gx: 15, gy: 10, gz: 1, color: '#06B6D4', holder: null },
    { id: 'netherite_sword', name: 'Enchanted Netherite Sword', type: 'netherite', gx: 15, gy: 20, gz: 1, color: '#7C3AED', holder: null },
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

// Bridge Crossing Grid Locations
const BRIDGE_LOCATIONS = [
  { gx: 8, gy: 0 },
  { gx: 9, gy: 1 },
  { gx: 12, gy: 4 },
  { gx: 13, gy: 5 },
  { gx: 16, gy: 8 },
  { gx: 17, gy: 9 },
  { gx: 20, gy: 12 },
  { gx: 21, gy: 13 },
  { gx: 24, gy: 16 },
  { gx: 25, gy: 17 },
];

function isBridgeTile(gx, gy) {
  return BRIDGE_LOCATIONS.some(b => b.gx === gx && b.gy === gy);
}

// ── Procedural World Generator (Calculates Terrain for ANY (gx, gy)) ─
function getBlockData(gx, gy) {
  // Check user placed blocks at height 1 or 2 first
  if (state.placedBlocks[`${gx},${gy},1`]) {
    return { h: 1, type: state.placedBlocks[`${gx},${gy},1`] };
  }

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

  // 3. VOLCANO MOUNTAIN & LAVA RIVER BIOME (gx: 20..30, gy: 20..30)
  if (gx >= 20 && gy >= 20) {
    const dx = gx - 26;
    const dy = gy - 26;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Winding Lava River flowing down the mountain slope
    const isLavaRiver = (
      (gx === 24 && gy === 25) || (gx === 23 && gy === 24) ||
      (gx === 22 && gy === 24) || (gx === 21 && gy === 25) ||
      (gx === 20 && gy === 26) || (gx === 19 && gy === 27) ||
      (gx === 18 && gy === 27) || (gx === 25 && gy === 24)
    );
    if (isLavaRiver) {
      return { h: 1, type: 'lava' };
    }

    // Sunken Volcano Caldera Crater (Peak Summit)
    if (dist <= 1.4) {
      return { h: 4, type: 'lava' };
    }
    // Crater Rim
    if (dist <= 2.2) {
      return { h: 5, type: 'obsidian' };
    }
    // Upper Volcano Cone
    if (dist <= 3.5) {
      return { h: 4, type: (gx + gy) % 2 === 0 ? 'magma' : 'obsidian' };
    }
    // Mid Volcano Slope
    if (dist <= 5.0) {
      return { h: 3, type: (gx + gy) % 3 === 0 ? 'magma' : 'blackstone' };
    }
    // Outer Mountain Base
    if (dist <= 6.8) {
      return { h: 2, type: (gx + gy) % 2 === 0 ? 'cobblestone' : 'blackstone' };
    }
    return { h: 1, type: 'blackstone' };
  }

  // 4. DESERT ISLAND & THE GREAT PYRAMID OF GIZA (gx: 23..30, gy: 1..8)
  if (gx >= 23 && gx <= 30 && gy >= 1 && gy <= 8) {
    // Concentric Pyramid Tiers
    if (gx >= 25 && gx <= 28 && gy >= 3 && gy <= 6) {
      if (gx >= 26 && gx <= 27 && gy >= 4 && gy <= 5) {
        return { h: 5, type: 'gold_block' }; // Golden Pyramidion
      }
      return { h: 4, type: 'sandstone' };
    }
    if (gx >= 24 && gx <= 29 && gy >= 2 && gy <= 7) {
      return { h: 3, type: 'sandstone' };
    }
    return { h: 2, type: 'sand' };
  }

  // 5. STATUE OF LIBERTY HARBOR ISLAND (gx: 8..11, gy: 1..4)
  if (gx >= 8 && gx <= 11 && gy >= 1 && gy <= 4) {
    return { h: 2, type: 'stone' };
  }

  // 6. RASHTRAPATI BHAVAN & INDIA GATE PLAZA (gx: 1..9, gy: 18..24)
  if (gx >= 1 && gx <= 9 && gy >= 18 && gy <= 24) {
    if (gx >= 1 && gx <= 5 && gy >= 19 && gy <= 23) {
      return { h: 3, type: 'sandstone' };
    }
    if (gx >= 7 && gx <= 9 && gy >= 20 && gy <= 22) {
      return { h: 2, type: 'sandstone' };
    }
    return { h: 1, type: 'sandstone' };
  }

  // 7. THANOS OBSIDIAN PEAK (gx: 13..17, gy: 24..28)
  if (gx >= 13 && gx <= 17 && gy >= 24 && gy <= 28) {
    return { h: 3, type: 'obsidian' };
  }

  // 8. OAK WOODEN BRIDGES ACROSS RIVER
  if (isBridgeTile(gx, gy)) {
    return { h: 1, type: 'oak_plank' };
  }

  // 8. Natural River Channel (Diagonal)
  if (Math.abs(gx - gy - 8) <= 1 && !(gx >= 12 && gx <= 18 && gy >= 12 && gy <= 18) && !(gx >= 22 && gy >= 22)) {
    return { h: 0, type: 'water' };
  }

  // 9. Natural Continuous Minecraft Green Meadows
  const wave = Math.sin(gx * 0.35) * Math.cos(gy * 0.35);
  let h = 1;
  if (wave > 0.45) h = 2;
  if (wave > 0.85) h = 3;

  return { h, type: 'grass' };
}

// ── Multi-Block 3D Voxel Minecraft Trees ────────────────────────────
const VOXEL_TREES = [
  { gx: 8, gy: 6, type: 'oak', height: 4 },
  { gx: 9, gy: 4, type: 'oak', height: 3 },
  { gx: 7, gy: 9, type: 'spruce', height: 5 },
  { gx: 10, gy: 10, type: 'oak', height: 4 },
  { gx: 6, gy: 12, type: 'birch', height: 4 },
  { gx: 8, gy: 14, type: 'oak', height: 3 },
  { gx: 20, gy: 6, type: 'spruce', height: 5 },
  { gx: 22, gy: 8, type: 'spruce', height: 4 },
  { gx: 21, gy: 11, type: 'oak', height: 4 },
  { gx: 20, gy: 14, type: 'oak', height: 3 },
  { gx: 22, gy: 16, type: 'birch', height: 4 },
  { gx: 8, gy: 20, type: 'oak', height: 4 },
  { gx: 10, gy: 22, type: 'spruce', height: 5 },
  { gx: 11, gy: 25, type: 'oak', height: 3 },
  { gx: 7, gy: 25, type: 'birch', height: 4 },
  { gx: 10, gy: 7, type: 'giant_oak', height: 6 },
  { gx: 12, gy: 8, type: 'oak', height: 3 },
];

// ── Coordinate Conversion (Screen <-> Grid with Pan & Zoom) ─────────
let originX = 0, originY = 0;

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

// ── Minecraft Avengers Characters Catalog (5 Core + 5 Reserve) ───────
const MINECRAFT_HEROES = {
  // ── CORE STRIKE TEAM (5 DEFAULT SPAWNED) ─────────────────────────
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    category: 'core',
    role: 'God Orchestrator',
    station: 'Stark Voxel Spire',
    homeStation: { gx: 4, gy: 4 },
    image: './assets/iron_man.jpg',
    avatar: '🦾',
    themeColor: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    skinType: 'iron-man',
    power: 'repulsor_unibeam',
    gx: 4, gy: 4,
    targetGx: 4, targetGy: 4,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.08,
    weapon: 'repulsors',
    quote: 'Repulsors primed at 100% capacity! JARVIS, target the DAG.',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    category: 'core',
    role: 'Frontend UI Architect',
    station: 'Web Treehouse Hub',
    homeStation: { gx: 10, gy: 7 },
    image: './assets/spider_man.jpg',
    avatar: '🕸️',
    themeColor: '#DC2626',
    glowColor: 'rgba(220, 38, 38, 0.5)',
    skinType: 'spider-man',
    power: 'web_stream',
    gx: 10, gy: 7,
    targetGx: 10, targetGy: 7,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.09,
    weapon: 'web_shooters',
    quote: 'THWIP! Spun up high-speed web nets across the voxel canopy!',
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    category: 'core',
    role: 'DevOps & Package Manifest',
    station: 'Thunder Altar Spire',
    homeStation: { gx: 26, gy: 4 },
    image: './assets/thor.jpg',
    avatar: '⚡',
    themeColor: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.5)',
    skinType: 'thor',
    power: 'mjolnir_lightning',
    gx: 26, gy: 4,
    targetGx: 26, targetGy: 4,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.075,
    weapon: 'mjolnir',
    quote: 'FEEL THE WRATH OF ASGARDIAN THUNDER AND MJOLNIR STRIKES!',
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    category: 'core',
    role: 'Gamma Logic Optimizer',
    station: 'Gamma Emerald Meadow',
    homeStation: { gx: 8, gy: 16 },
    image: './assets/hulk.jpg',
    avatar: '🟢',
    themeColor: '#16A34A',
    glowColor: 'rgba(22, 163, 74, 0.5)',
    skinType: 'hulk',
    power: 'gamma_smash',
    gx: 8, gy: 16,
    targetGx: 8, targetGy: 16,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.06,
    weapon: 'fists',
    quote: 'HULK SMASH 3D VOXEL EARTH WITH GAMMA SHOCKWAVES!',
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    category: 'core',
    role: 'Vibranium QA Auditor',
    station: 'Wakandan Vibranium Bunker',
    homeStation: { gx: 4, gy: 26 },
    image: './assets/captain_america.jpg',
    avatar: '🛡️',
    themeColor: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    skinType: 'captain-america',
    power: 'vibranium_shield_throw',
    gx: 4, gy: 26,
    targetGx: 4, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.075,
    weapon: 'shield',
    quote: 'Vibranium shield bouncing with precision trajectory!',
    spawned: true,
  },

  // ── MULTIVERSE SPECIALISTS (SPAWNABLE ON-DEMAND TO ASSIST) ─────────
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    category: 'specialist',
    role: 'Temporal Memory & Assistance',
    station: 'Taj Mahal Astral Spire',
    homeStation: { gx: 15, gy: 15 },
    image: './assets/doctor_strange.jpg',
    avatar: '🔮',
    themeColor: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    skinType: 'doctor-strange',
    power: 'eldritch_mandala',
    gx: 15, gy: 15,
    targetGx: 15, targetGy: 15,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.07,
    weapon: 'eldritch_magic',
    quote: 'By the Vishanti, assisting Thor and the team across all temporal timelines!',
    spawned: false,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    category: 'specialist',
    role: 'Latverian AST & Compiler',
    station: 'Valyrian Lava Keep',
    homeStation: { gx: 26, gy: 26 },
    image: './assets/doctor_doom.jpg',
    avatar: '👑',
    themeColor: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.5)',
    skinType: 'doctor-doom',
    power: 'valyrian_dragonflame',
    gx: 26, gy: 26,
    targetGx: 26, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.065,
    weapon: 'dragonflame',
    quote: 'Doom commands the Valyrian dragonflame and high-speed compilers!',
    spawned: false,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    category: 'specialist',
    role: 'Power & Rate Balancer',
    station: '3D Obsidian Altar',
    homeStation: { gx: 15, gy: 26 },
    image: './assets/thanos.jpg',
    avatar: '🪐',
    themeColor: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.5)',
    skinType: 'thanos',
    power: 'infinity_beam',
    gx: 15, gy: 26,
    targetGx: 15, targetGy: 26,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.055,
    weapon: 'infinity_gauntlet',
    quote: 'All six Infinity Stones unleashed. Perfectly balanced.',
    spawned: false,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    category: 'specialist',
    role: 'Quantum Timeline Branching',
    station: 'Chrono-Bridge Nexus',
    homeStation: { gx: 20, gy: 12 },
    image: './assets/kang_conqueror.jpg',
    avatar: '⏳',
    themeColor: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.5)',
    skinType: 'kang',
    power: 'chrono_portal',
    gx: 20, gy: 12,
    targetGx: 20, targetGy: 12,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.07,
    weapon: 'chrono_device',
    quote: 'Opening temporal rifts across 14 billion Minecraft branches.',
    spawned: false,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    category: 'specialist',
    role: 'Security & CVE Recon',
    station: 'Redstone Stealth Enclave',
    homeStation: { gx: 8, gy: 11 },
    image: './assets/black_widow.jpg',
    avatar: '🕷️',
    themeColor: '#9333EA',
    glowColor: 'rgba(147, 51, 234, 0.5)',
    skinType: 'black-widow',
    power: 'widow_bite_shock',
    gx: 8, gy: 11,
    targetGx: 8, targetGy: 11,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
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
let multiverseStrongholdDock, incursionSpeechLayer, ellipsisDropdownMenu;
let missionProgressTrack;

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
  ellipsisDropdownMenu = document.getElementById('ellipsisDropdownMenu');
  missionProgressTrack = document.getElementById('missionProgressTrack');

  initCanvas();
  renderStrongholdDock();
  updateRosterBadge();
  setupEventListeners();
  initWebSocket();
  initWeatherParticles();

  // Close ellipsis menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#ellipsisMenuBtn') && !e.target.closest('#ellipsisDropdownMenu')) {
      closeEllipsisMenu();
    }
  });

  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Welcome to Battleworld! 5 core heroes assembled. Click [👥 Team] to spawn specialists on demand!');
  }, 1000);

  setInterval(triggerAutonomousHeroMovement, 5000);
  setInterval(triggerDAGSimulationPulse, 6000);
  setInterval(triggerRandomHeroSuperpower, 4000);
});

function updateRosterBadge() {
  const badge = document.getElementById('rosterCountBadge');
  const count = Object.keys(state.roamingAgents).length;
  if (badge) {
    badge.innerText = `${count}/10 active`;
  }
}

// ── Ellipsis Menu Toggle ────────────────────────────────────────────
window.toggleEllipsisMenu = function () {
  if (!ellipsisDropdownMenu) return;
  const isShown = ellipsisDropdownMenu.style.display === 'flex';
  ellipsisDropdownMenu.style.display = isShown ? 'none' : 'flex';
};

window.closeEllipsisMenu = function () {
  if (ellipsisDropdownMenu) ellipsisDropdownMenu.style.display = 'none';
};

// ── Minecraft Creative Build Mode Toggle ────────────────────────────
window.toggleBuildMode = function () {
  state.buildMode = !state.buildMode;
  const btn = document.getElementById('buildModeToggleBtn');
  const indicator = document.getElementById('buildModeIndicator');
  const container = document.getElementById('viewportContainer');

  if (state.buildMode) {
    if (btn) btn.classList.add('active');
    if (indicator) indicator.style.display = 'inline-flex';
    if (container) container.classList.add('build-mode-active');
    showCosmicSpeechBubble('tony-stark', '🔨 Minecraft Creative Build Mode ACTIVE! Click terrain to place blocks, right-click to break.');
    appendVerboseStream(`🔨 [BUILD MODE ACTIVATED] Selected block: [${state.selectedBlockType.toUpperCase()}]. Click anywhere to place.`, 'code');
  } else {
    if (btn) btn.classList.remove('active');
    if (indicator) indicator.style.display = 'none';
    if (container) container.classList.remove('build-mode-active');
    showCosmicSpeechBubble('tony-stark', 'Exited Build Mode. Character exploration restored.');
    appendVerboseStream(`🕹️ [BUILD MODE DEACTIVATED] Normal exploration restored.`, 'code');
  }
};

// ── Canvas Setup & Event Handling (Pan, Zoom, Place & Break) ────────
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

  // Mouse Drag to Pan Camera / Update Hover Grid
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 2) {
      e.preventDefault();
      handleBlockBreak(e);
      return;
    }

    state.camera.isDragging = true;
    state.camera.dragStartX = e.clientX - state.camera.panX;
    state.camera.dragStartY = e.clientY - state.camera.panY;
    state.camera.hasDragged = false;
  });

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    state.hoverGrid = screenToGrid(clickX, clickY);

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
    if (state.camera.isDragging && !state.camera.hasDragged && e.button === 0) {
      handleCanvasClick(e);
    }
    state.camera.isDragging = false;
  });

  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    handleBlockBreak(e);
  });

  // Wheel to Zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    zoomCamera(zoomFactor);
  }, { passive: false });
}

function handleBlockBreak(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  const grid = screenToGrid(clickX, clickY);

  const key1 = `${grid.gx},${grid.gy},1`;
  const key2 = `${grid.gx},${grid.gy},2`;
  const key3 = `${grid.gx},${grid.gy},3`;

  if (state.placedBlocks[key3]) {
    delete state.placedBlocks[key3];
  } else if (state.placedBlocks[key2]) {
    delete state.placedBlocks[key2];
  } else if (state.placedBlocks[key1]) {
    delete state.placedBlocks[key1];
  } else {
    state.placedBlocks[key1] = 'air';
  }

  const p = gridToScreen(grid.gx, grid.gy, getElevation(grid.gx, grid.gy) + 1);
  spawnBlockParticles(p.x, p.y, '#64748B');
  appendVerboseStream(`💥 [MINED BLOCK] Removed block at (${grid.gx}, ${grid.gy})`, 'code');
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;

  // 1. If in Build Mode -> Place Selected Block!
  if (state.buildMode) {
    const grid = screenToGrid(clickX, clickY);
    const elev = getElevation(grid.gx, grid.gy);
    const targetZ = Math.min(6, elev + 1);
    const key = `${grid.gx},${grid.gy},${targetZ}`;
    state.placedBlocks[key] = state.selectedBlockType;

    const p = gridToScreen(grid.gx, grid.gy, targetZ);
    spawnBlockParticles(p.x, p.y, getBlockColor(state.selectedBlockType));
    spawnXpOrbs(p.x, p.y, 3);
    appendVerboseStream(`🧱 [BLOCK PLACED] Placed ${state.selectedBlockType.toUpperCase()} at (${grid.gx}, ${grid.gy}, ${targetZ})`, 'code');
    return;
  }

  // 2. Check if clicked on a Floating Sword in the Pedestal
  for (const sword of state.swords) {
    const sPos = gridToScreen(sword.gx, sword.gy, sword.gz + 1);
    if (Math.hypot(sPos.x - clickX, sPos.y - clickY) < 32 * state.camera.zoom) {
      equipSwordOnSelectedHero(sword);
      return;
    }
  }

  // 3. Check if clicked on a hero
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

    if (clickedHero.isWorking) {
      showCosmicSpeechBubble(clickedHero.id, `⚙️ I am currently coding "${clickedHero.activeTask || 'Directive'}"! Mesh synchronized.`);
      appendVerboseStream(`● [${clickedHero.callsign} BUSY] Executing active task: "${clickedHero.activeTask || 'Code Directive'}".`, 'code');
    } else {
      executeHeroSuperpower(clickedHero);
      showCosmicSpeechBubble(clickedHero.id, clickedHero.quote);
      appendVerboseStream(`⚡ [${clickedHero.callsign} SUPERPOWER] Unleashed ${clickedHero.power}!`, 'chat');
    }
  } else {
    const grid = screenToGrid(clickX, clickY);
    const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
    if (hero) {
      if (hero.isWorking) {
        showCosmicSpeechBubble(hero.id, `🔒 Locked to station while compiling task directives!`);
        return;
      }
      hero.targetGx = grid.gx;
      hero.targetGy = grid.gy;
      hero.isWalking = true;
      const targetScreen = gridToScreen(grid.gx, grid.gy, getElevation(grid.gx, grid.gy));
      spawnPortalParticles(targetScreen.x, targetScreen.y, hero.themeColor);
      showCosmicSpeechBubble(hero.id, `Moving to (${grid.gx}, ${grid.gy})`);
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
  appendVerboseStream(`⚔️ [WEAPON EQUIPPED] ${hero.name} drew the ${swordName}! Sharpness V activated!`, 'code');
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
    color: '#06B6D4',
    holder: null,
  });

  const pos = gridToScreen(targetGx, targetGy, getElevation(targetGx, targetGy) + 1);
  spawnPortalParticles(pos.x, pos.y, '#06B6D4');
  showCosmicSpeechBubble('tony-stark', 'Spawned a Legendary Diamond Sword on the pedestal!');
  appendVerboseStream(`💎 [MINECRAFT ITEM] Legendary Diamond Sword materialized at (${targetGx}, ${targetGy})!`, 'code');
};

window.selectHotbarItem = function (itemKey) {
  state.activeHotbarItem = itemKey;
  document.querySelectorAll('.hotbar-slot').forEach(el => el.classList.remove('active'));
  const target = event.currentTarget;
  if (target) target.classList.add('active');

  if (['oak_plank', 'quartz', 'stone', 'diamond_block', 'obsidian', 'lava_bucket', 'water_bucket'].includes(itemKey)) {
    state.selectedBlockType = itemKey.replace('_bucket', '');
    if (!state.buildMode) toggleBuildMode();
  } else {
    const hero = state.roamingAgents[state.selectedAgentId] || Object.values(state.roamingAgents)[0];
    if (hero) {
      if (itemKey === 'diamond_sword') hero.weapon = 'diamond_sword';
      showCosmicSpeechBubble(hero.id, `Equipped ${itemKey.replace('_', ' ').toUpperCase()} from Hotbar!`);
    }
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
      color: ['#38BDF8', '#818CF8', '#A855F7', '#FCD34D', '#06B6D4'][Math.floor(Math.random() * 5)],
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

  // 2. Compute Viewport Bounds to Tile 100% of Screen
  const pTL = screenToGrid(-60, -60);
  const pTR = screenToGrid(w + 60, -60);
  const pBL = screenToGrid(-60, h + 100);
  const pBR = screenToGrid(w + 60, h + 100);

  const minGx = Math.min(pTL.gx, pTR.gx, pBL.gx, pBR.gx) - 4;
  const maxGx = Math.max(pTL.gx, pTR.gx, pBL.gx, pBR.gx) + 4;
  const minGy = Math.min(pTL.gy, pTR.gy, pBL.gy, pBR.gy) - 4;
  const maxGy = Math.max(pTL.gy, pTR.gy, pBL.gy, pBR.gy) + 4;

  // 3. Render 100% Screen-Filling Isometric Block Terrain
  for (let sum = minGx + minGy; sum <= maxGx + maxGy; sum++) {
    for (let gx = minGx; gx <= maxGx; gx++) {
      const gy = sum - gx;
      if (gy < minGy || gy > maxGy) continue;

      const data = getBlockData(gx, gy);
      if (data.type !== 'air') {
        for (let z = 0; z <= data.h; z++) {
          drawIsometricBlock(gx, gy, z, data.type, time);
        }
      }
    }
  }

  // 4. Render User-Placed Blocks on Top
  drawCustomPlacedBlocks(time);

  // 5. Draw Bridge Guard Rails
  drawBridgeRailings(time);

  // 6. Draw Real Multi-Block 3D Voxel Minecraft Trees
  drawRealVoxelTrees(time);

  // 7. Draw 3D Minecraft Taj Mahal of India & World Monuments
  drawTajMahalAndMonuments(time);
  drawPyramidOfGizaAndSphinx(time);
  drawStatueOfLiberty(time);
  drawIndiaGateAndRashtrapatiBhavan(time);

  // 8. Draw Volcano Mountain Eruptions & Cascading Lava River
  drawValyrianLavaAndFire(time);

  // 9. Draw Decorative Minecraft Game Objects
  drawDecorativeMinecraftObjects(time);

  // 10. Draw 3D Floating Diamond Swords on Pedestals
  drawFloatingMinecraftSwords(time);

  // 11. Draw Ghost Placement Preview in Build Mode
  if (state.buildMode && state.hoverGrid) {
    drawGhostPlacementBlock(state.hoverGrid.gx, state.hoverGrid.gy, state.selectedBlockType);
  }

  // 12. Draw Redstone DAG Mesh Links & Traveling Energy Packets
  drawRedstoneDAGMesh(time);

  // 13. Draw Thor Lightning Strikes
  state.thunderboltTimer++;
  if (state.thunderboltTimer % 180 === 0 || Math.random() < 0.012) {
    const thorAltarPos = gridToScreen(26, 4, 5);
    drawVoxelLightning(thorAltarPos.x, 10, thorAltarPos.x, thorAltarPos.y);
  }

  // 14. Update Character Physics & Walking Cycles
  updateHeroPhysics();

  // 15. Draw All 3D Isometric Minecraft Walking Characters
  const sortedHeroes = Object.values(state.roamingAgents).sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
  for (const hero of sortedHeroes) {
    drawMinecraftIsometricHero(hero, time);
  }

  // 16. Draw All Marvel Superpowers
  drawAllSuperpowerEffects(time);

  // 17. Draw Particles
  drawWeatherAndParticles(w, h, time);

  requestAnimationFrame(simulationLoop);
}

// ── 1. Cosmic Sky Background ────────────────────────────────────────
function drawSpaceSky(w, h, time) {
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0F0826');
  skyGrad.addColorStop(0.5, '#1A103C');
  skyGrad.addColorStop(1, '#2D1B69');
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
function drawIsometricBlock(gx, gy, gz, type, time, alpha = 1.0) {
  const p = gridToScreen(gx, gy, gz);
  const hw = (BASE_TILE_WIDTH * state.camera.zoom) / 2;
  const hh = (BASE_TILE_HEIGHT * state.camera.zoom) / 2;
  const d = BASE_BLOCK_DEPTH * state.camera.zoom;

  let topColor = '#4D8C28';
  let leftColor = '#79553A';
  let rightColor = '#5D402A';

  if (type === 'quartz') {
    topColor = '#FFFFFF'; leftColor = '#E2E8F0'; rightColor = '#CBD5E1';
  } else if (type === 'sandstone') {
    topColor = '#FDE68A'; leftColor = '#F59E0B'; rightColor = '#D97706';
  } else if (type === 'water') {
    topColor = '#00B4D8'; leftColor = '#0077B6'; rightColor = '#03045E';
  } else if (type === 'lava') {
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
  } else if (type === 'oak_plank') {
    topColor = '#B45309'; leftColor = '#92400E'; rightColor = '#78350F';
  } else if (type === 'diamond_block') {
    topColor = '#06B6D4'; leftColor = '#0891B2'; rightColor = '#0E7490';
  } else if (type === 'oak_leaf') {
    topColor = '#2E6F22'; leftColor = '#225519'; rightColor = '#183D12';
  } else if (type === 'spruce_leaf') {
    topColor = '#1E4D2B'; leftColor = '#153920'; rightColor = '#0F2916';
  } else if (type === 'birch_log') {
    topColor = '#E0E0D1'; leftColor = '#C5C5B5'; rightColor = '#2A2A2A';
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // TOP FACE
  ctx.fillStyle = topColor;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y - hh);
  ctx.lineTo(p.x + hw, p.y);
  ctx.lineTo(p.x, p.y + hh);
  ctx.lineTo(p.x - hw, p.y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  // LEFT FACE
  ctx.fillStyle = leftColor;
  ctx.beginPath();
  ctx.moveTo(p.x - hw, p.y);
  ctx.lineTo(p.x, p.y + hh);
  ctx.lineTo(p.x, p.y + hh + d);
  ctx.lineTo(p.x - hw, p.y + d);
  ctx.closePath();
  ctx.fill();

  // RIGHT FACE
  ctx.fillStyle = rightColor;
  ctx.beginPath();
  ctx.moveTo(p.x, p.y + hh);
  ctx.lineTo(p.x + hw, p.y);
  ctx.lineTo(p.x + hw, p.y + d);
  ctx.lineTo(p.x, p.y + hh + d);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function getBlockColor(type) {
  if (type === 'quartz') return '#FFFFFF';
  if (type === 'stone') return '#64748B';
  if (type === 'oak_plank') return '#B45309';
  if (type === 'diamond_block') return '#06B6D4';
  if (type === 'obsidian') return '#312E81';
  if (type === 'lava') return '#FF5722';
  if (type === 'water') return '#00B4D8';
  return '#22C55E';
}

function drawCustomPlacedBlocks(time) {
  for (const [key, type] of Object.entries(state.placedBlocks)) {
    if (type === 'air') continue;
    const [gx, gy, gz] = key.split(',').map(Number);
    drawIsometricBlock(gx, gy, gz, type, time);
  }
}

function drawGhostPlacementBlock(gx, gy, type) {
  const elev = getElevation(gx, gy);
  drawIsometricBlock(gx, gy, elev + 1, type, 0, 0.45);
}

function drawBridgeRailings(time) {
  const zoom = state.camera.zoom;
  for (const b of BRIDGE_LOCATIONS) {
    const p1 = gridToScreen(b.gx - 0.4, b.gy, 1.3);
    const p2 = gridToScreen(b.gx + 0.4, b.gy, 1.3);

    ctx.fillStyle = '#78350F';
    ctx.fillRect(p1.x - 1.5 * zoom, p1.y - 8 * zoom, 3 * zoom, 8 * zoom);
    ctx.fillRect(p2.x - 1.5 * zoom, p2.y - 8 * zoom, 3 * zoom, 8 * zoom);
  }
}

// ── 3. Multi-Block 3D Voxel Minecraft Trees ─────────────────────────
function drawRealVoxelTrees(time) {
  for (const tree of VOXEL_TREES) {
    const baseElev = getElevation(tree.gx, tree.gy);
    const logType = tree.type === 'birch' ? 'birch_log' : 'wood_log';
    const leafType = tree.type === 'spruce' ? 'spruce_leaf' : 'oak_leaf';

    for (let z = 1; z <= tree.height; z++) {
      drawIsometricBlock(tree.gx, tree.gy, baseElev + z, logType, time);
    }

    const leafZ1 = baseElev + tree.height;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        drawIsometricBlock(tree.gx + dx, tree.gy + dy, leafZ1, leafType, time);
      }
    }

    const leafZ2 = leafZ1 + 1;
    drawIsometricBlock(tree.gx, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx + 1, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx - 1, tree.gy, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx, tree.gy + 1, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx, tree.gy - 1, leafZ2, leafType, time);
    drawIsometricBlock(tree.gx, tree.gy, leafZ2 + 1, leafType, time);
  }
}

// ── 4. 3D Minecraft Taj Mahal of India & Avengers Monuments ─────────
function drawTajMahalAndMonuments(time) {
  const zoom = state.camera.zoom;

  // A. Four Corner Minarets with Balconies & Chhatri Cupolas
  const minaretCorners = [
    { gx: 12, gy: 12 },
    { gx: 18, gy: 12 },
    { gx: 12, gy: 18 },
    { gx: 18, gy: 18 },
  ];

  for (const mc of minaretCorners) {
    // Slender white marble shaft
    for (let z = 3; z <= 7; z++) {
      drawIsometricBlock(mc.gx, mc.gy, z, 'quartz', time);
    }
    // Mid Balcony Ring at z=5
    const bPos = gridToScreen(mc.gx, mc.gy, 5);
    ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 2 * zoom;
    ctx.strokeRect(bPos.x - 8 * zoom, bPos.y - 6 * zoom, 16 * zoom, 4 * zoom);

    // Top Cupola (Chhatri) at z=8 with Golden Finial
    const mp = gridToScreen(mc.gx, mc.gy, 8);
    // Delicate pillared dome
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(mp.x, mp.y - 8 * zoom, 5 * zoom, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0'; ctx.lineWidth = 1;
    ctx.stroke();

    // Golden Spire / Kalash
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(mp.x - 1 * zoom, mp.y - 14 * zoom, 2 * zoom, 6 * zoom);
    ctx.beginPath();
    ctx.arc(mp.x, mp.y - 15 * zoom, 2 * zoom, 0, Math.PI * 2);
    ctx.fill();
  }

  // B. Main Mausoleum Body (Symmetrical White Marble with Chamfers)
  for (let z = 3; z <= 5; z++) {
    for (let x = 13; x <= 17; x++) {
      for (let y = 13; y <= 17; y++) {
        // Chamfered 4 corners for octagonal Mughal layout
        const isCorner = (x === 13 && y === 13) || (x === 17 && y === 13) || (x === 13 && y === 17) || (x === 17 && y === 17);
        if (!isCorner) {
          drawIsometricBlock(x, y, z, 'quartz', time);
        }
      }
    }
  }

  // C. Grand Recessed Arched Portal (Pishtaq / Grand Iwan) on Front Facade
  const portalPos = gridToScreen(15, 13, 3);
  // Recessed dark marble chamber arch
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(portalPos.x - 10 * zoom, portalPos.y);
  ctx.lineTo(portalPos.x - 10 * zoom, portalPos.y - 18 * zoom);
  ctx.quadraticCurveTo(portalPos.x, portalPos.y - 28 * zoom, portalPos.x + 10 * zoom, portalPos.y - 18 * zoom);
  ctx.lineTo(portalPos.x + 10 * zoom, portalPos.y);
  ctx.closePath();
  ctx.fill();

  // White marble pointed arch frame
  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 3 * zoom;
  ctx.stroke();

  // Side Niches (Double-Decker Iwans on flanking bays)
  const leftNiche = gridToScreen(14, 13, 3);
  const rightNiche = gridToScreen(16, 13, 3);
  [leftNiche, rightNiche].forEach(n => {
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(n.x - 4 * zoom, n.y - 8 * zoom, 8 * zoom, 8 * zoom);
    ctx.fillRect(n.x - 4 * zoom, n.y - 20 * zoom, 8 * zoom, 8 * zoom);
  });

  // D. Four Subsidiary Domed Chhatris surrounding central dome
  const chhatriSpots = [
    { gx: 13.5, gy: 14.5 },
    { gx: 16.5, gy: 14.5 },
    { gx: 13.5, gy: 16.5 },
    { gx: 16.5, gy: 16.5 },
  ];
  chhatriSpots.forEach(cp => {
    const p = gridToScreen(cp.gx, cp.gy, 6);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 6 * zoom, 4.5 * zoom, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0'; ctx.stroke();

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(p.x - 1 * zoom, p.y - 11 * zoom, 2 * zoom, 5 * zoom);
  });

  // E. Main Bulbous Lotus Onion Dome (Amrud / Gumbad)
  for (let x = 14; x <= 16; x++) {
    for (let y = 14; y <= 16; y++) {
      drawIsometricBlock(x, y, 6, 'quartz', time);
    }
  }

  const domePos = gridToScreen(15, 15, 7);
  // High cylindrical marble drum
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(domePos.x - 14 * zoom, domePos.y - 10 * zoom, 28 * zoom, 10 * zoom);

  // Bulbous Onion Dome Curve
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(domePos.x - 16 * zoom, domePos.y - 10 * zoom);
  ctx.bezierCurveTo(
    domePos.x - 22 * zoom, domePos.y - 26 * zoom,
    domePos.x - 8 * zoom, domePos.y - 42 * zoom,
    domePos.x, domePos.y - 48 * zoom
  );
  ctx.bezierCurveTo(
    domePos.x + 8 * zoom, domePos.y - 42 * zoom,
    domePos.x + 22 * zoom, domePos.y - 26 * zoom,
    domePos.x + 16 * zoom, domePos.y - 10 * zoom
  );
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Majestic Golden Spire / Kalash Finial with Sunbeam Bloom
  const apexY = domePos.y - 48 * zoom;
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = '#F59E0B'; ctx.shadowBlur = 18;
  ctx.fillRect(domePos.x - 2 * zoom, apexY - 22 * zoom, 4 * zoom, 22 * zoom);
  ctx.beginPath();
  ctx.arc(domePos.x, apexY - 24 * zoom, 4.5 * zoom, 0, Math.PI * 2);
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
  ctx.fillStyle = '#2563EB';
  ctx.shadowColor = '#3B82F6'; ctx.shadowBlur = 22;
  ctx.fillRect(beaconPos.x - 4 * zoom, beaconPos.y - 22 * zoom, 8 * zoom, 22 * zoom);
  ctx.shadowBlur = 0;

  // Thor Thunder Altar Spire
  for (let z = 3; z <= 5; z++) {
    drawIsometricBlock(26, 4, z, 'stone', time);
  }
  const spirePos = gridToScreen(26, 4, 5);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(spirePos.x - 5 * zoom, spirePos.y - 12 * zoom, 10 * zoom, 6 * zoom);
  ctx.fillStyle = '#94A3B8'; ctx.fillRect(spirePos.x - 2 * zoom, spirePos.y - 30 * zoom, 4 * zoom, 18 * zoom);

  // Wakandan Vibranium Bunker
  for (let z = 3; z <= 4; z++) {
    for (let x = 3; x <= 5; x++) {
      drawIsometricBlock(x, 26, z, 'blackstone', time);
    }
  }
}

// ── 4B. The Great Pyramid of Giza & Desert Island ────────────────────
function drawPyramidOfGizaAndSphinx(time) {
  const zoom = state.camera.zoom;

  // 1. Concentric Stepped Sandstone Pyramid
  // Base Tier (z=2): gx 24..29, gy 2..7
  // Tier 2 (z=3): gx 25..28, gy 3..6
  for (let x = 25; x <= 28; x++) {
    for (let y = 3; y <= 6; y++) {
      drawIsometricBlock(x, y, 3, 'sandstone', time);
    }
  }
  // Tier 3 (z=4): gx 26..27, gy 4..5
  for (let x = 26; x <= 27; x++) {
    for (let y = 4; y <= 5; y++) {
      drawIsometricBlock(x, y, 4, 'sandstone', time);
    }
  }

  // 2. Shining Golden Pyramidion Capstone at Peak (z=5..6)
  const peakPos = gridToScreen(26.5, 4.5, 5);
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(peakPos.x, peakPos.y - 20 * zoom);
  ctx.lineTo(peakPos.x - 14 * zoom, peakPos.y + 4 * zoom);
  ctx.lineTo(peakPos.x + 14 * zoom, peakPos.y + 4 * zoom);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  // 3. Sandstone Great Sphinx of Giza facing East
  const sphinxPos = gridToScreen(23.5, 4.5, 2.5);
  // Lion Body
  ctx.fillStyle = '#D97706';
  ctx.fillRect(sphinxPos.x - 12 * zoom, sphinxPos.y - 6 * zoom, 24 * zoom, 12 * zoom);
  // Pharaoh Head with Nemes Headdress
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(sphinxPos.x + 4 * zoom, sphinxPos.y - 18 * zoom, 10 * zoom, 12 * zoom);
  // Golden Uraeus Crown
  ctx.fillStyle = '#EF4444';
  ctx.fillRect(sphinxPos.x + 8 * zoom, sphinxPos.y - 22 * zoom, 4 * zoom, 4 * zoom);

  // 4. Desert Palm Trees
  const palmPos = gridToScreen(24, 7.5, 2);
  ctx.fillStyle = '#78350F';
  ctx.fillRect(palmPos.x - 2 * zoom, palmPos.y - 24 * zoom, 4 * zoom, 24 * zoom);
  ctx.fillStyle = '#16A34A';
  // Drooping Palm Fronds
  ctx.beginPath();
  ctx.ellipse(palmPos.x, palmPos.y - 26 * zoom, 14 * zoom, 6 * zoom, Math.PI / 6, 0, Math.PI * 2);
  ctx.ellipse(palmPos.x, palmPos.y - 26 * zoom, 14 * zoom, 6 * zoom, -Math.PI / 6, 0, Math.PI * 2);
  ctx.fill();
}

// ── 4C. Statue of Liberty (New York Harbor) ──────────────────────────
function drawStatueOfLiberty(time) {
  const zoom = state.camera.zoom;
  const basePos = gridToScreen(9.5, 2.5, 2);

  // 1. Star-Shaped Fort Wood Granite Pedestal Base (z=2..4)
  ctx.fillStyle = '#64748B';
  ctx.beginPath();
  ctx.moveTo(basePos.x, basePos.y - 12 * zoom);
  ctx.lineTo(basePos.x + 14 * zoom, basePos.y);
  ctx.lineTo(basePos.x, basePos.y + 12 * zoom);
  ctx.lineTo(basePos.x - 14 * zoom, basePos.y);
  ctx.closePath();
  ctx.fill();

  // Granite Pedestal Shaft
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(basePos.x - 8 * zoom, basePos.y - 28 * zoom, 16 * zoom, 22 * zoom);
  ctx.strokeStyle = '#CBD5E1'; ctx.lineWidth = 1.5 * zoom;
  ctx.strokeRect(basePos.x - 8 * zoom, basePos.y - 28 * zoom, 16 * zoom, 22 * zoom);

  // 2. Patina Copper-Green Lady Liberty Body (z=5..8)
  const statueY = basePos.y - 28 * zoom;
  // Draped Copper Robes
  ctx.fillStyle = '#10B981';
  ctx.beginPath();
  ctx.moveTo(statueY, statueY);
  ctx.moveTo(basePos.x - 6 * zoom, statueY);
  ctx.lineTo(basePos.x - 8 * zoom, statueY - 32 * zoom);
  ctx.lineTo(basePos.x + 8 * zoom, statueY - 32 * zoom);
  ctx.lineTo(basePos.x + 6 * zoom, statueY);
  ctx.closePath();
  ctx.fill();

  // Head with 7-Spike Radiant Solar Crown
  const headY = statueY - 36 * zoom;
  ctx.fillStyle = '#34D399';
  ctx.beginPath();
  ctx.arc(basePos.x, headY, 5 * zoom, 0, Math.PI * 2);
  ctx.fill();

  // 7 Crown Spikes
  ctx.strokeStyle = '#34D399';
  ctx.lineWidth = 1.5 * zoom;
  for (let i = -3; i <= 3; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 8;
    ctx.beginPath();
    ctx.moveTo(basePos.x, headY);
    ctx.lineTo(basePos.x + Math.cos(angle) * 11 * zoom, headY + Math.sin(angle) * 11 * zoom);
    ctx.stroke();
  }

  // 3. Raised Right Arm with Golden Torch of Liberty
  const torchArmX = basePos.x + 8 * zoom;
  const torchArmY = statueY - 26 * zoom;
  ctx.strokeStyle = '#10B981'; ctx.lineWidth = 2.5 * zoom;
  ctx.beginPath();
  ctx.moveTo(basePos.x + 4 * zoom, statueY - 26 * zoom);
  ctx.lineTo(torchArmX + 4 * zoom, torchArmY - 20 * zoom);
  ctx.stroke();

  // Glowing Golden Torch Beacon with Dynamic Light
  const flameY = torchArmY - 24 * zoom;
  ctx.fillStyle = '#F59E0B';
  ctx.shadowColor = '#FBBF24';
  ctx.shadowBlur = 20 + Math.sin(time * 0.05) * 6;
  ctx.beginPath();
  ctx.arc(torchArmX + 4 * zoom, flameY, 4.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 4. Left Arm holding Tablet of Declaration
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(basePos.x - 10 * zoom, statueY - 22 * zoom, 5 * zoom, 8 * zoom);
}

// ── 4D. India Gate, Rashtrapati Bhavan & Indian National Flag ────────
function drawIndiaGateAndRashtrapatiBhavan(time) {
  const zoom = state.camera.zoom;

  // 1. INDIA GATE (gx: 8, gy: 21, z: 2..6)
  const gatePos = gridToScreen(8, 21, 2);
  // Red & Yellow Sandstone Arch Pillars
  ctx.fillStyle = '#B45309';
  ctx.fillRect(gatePos.x - 18 * zoom, gatePos.y - 44 * zoom, 36 * zoom, 44 * zoom);

  // Grand Open Vaulted Central Arch
  ctx.fillStyle = '#0F172A';
  ctx.beginPath();
  ctx.moveTo(gatePos.x - 8 * zoom, gatePos.y);
  ctx.lineTo(gatePos.x - 8 * zoom, gatePos.y - 26 * zoom);
  ctx.quadraticCurveTo(gatePos.x, gatePos.y - 36 * zoom, gatePos.x + 8 * zoom, gatePos.y - 26 * zoom);
  ctx.lineTo(gatePos.x + 8 * zoom, gatePos.y);
  ctx.closePath();
  ctx.fill();

  // Yellow Sandstone Trim & Inscription Band
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(gatePos.x - 20 * zoom, gatePos.y - 48 * zoom, 40 * zoom, 6 * zoom);
  ctx.fillRect(gatePos.x - 14 * zoom, gatePos.y - 54 * zoom, 28 * zoom, 6 * zoom);

  // Amar Jawan Jyoti Eternal Flame under the Arch
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(gatePos.x - 3 * zoom, gatePos.y - 4 * zoom, 6 * zoom, 4 * zoom);
  // Inverted Rifle & Helmet
  ctx.fillStyle = '#0F172A';
  ctx.fillRect(gatePos.x - 0.5 * zoom, gatePos.y - 10 * zoom, 1 * zoom, 6 * zoom);
  ctx.beginPath();
  ctx.arc(gatePos.x, gatePos.y - 11 * zoom, 2 * zoom, 0, Math.PI * 2);
  ctx.fill();
  // Eternal Flame
  ctx.fillStyle = '#F97316';
  ctx.shadowColor = '#EF4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(gatePos.x, gatePos.y - 14 * zoom, 2.5 * zoom, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. RASHTRAPATI BHAVAN (gx: 3, gy: 21, z: 2..5)
  const bhavanPos = gridToScreen(3, 21, 2);
  // Colonnaded Sandstone Facade
  ctx.fillStyle = '#B45309';
  ctx.fillRect(bhavanPos.x - 24 * zoom, bhavanPos.y - 26 * zoom, 48 * zoom, 26 * zoom);
  // Jaipur Colonnade Pillars
  ctx.fillStyle = '#FBBF24';
  for (let c = -18; c <= 18; c += 6) {
    ctx.fillRect(bhavanPos.x + c * zoom, bhavanPos.y - 26 * zoom, 2 * zoom, 26 * zoom);
  }
  // Massive Buddhist Stupa-Inspired Copper Dome
  const domeBhavanY = bhavanPos.y - 26 * zoom;
  ctx.fillStyle = '#0284C7';
  ctx.beginPath();
  ctx.arc(bhavanPos.x, domeBhavanY, 14 * zoom, Math.PI, 0);
  ctx.fill();
  ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 1.5 * zoom;
  ctx.stroke();

  // Dome Spire
  ctx.fillStyle = '#F59E0B';
  ctx.fillRect(bhavanPos.x - 1.5 * zoom, domeBhavanY - 20 * zoom, 3 * zoom, 8 * zoom);

  // 3. INDIAN NATIONAL TRICOLOR FLAG (TIRANGA)
  const flagPolePos = gridToScreen(6, 19, 2);
  // White High-Mast Flagpole (z=2..9)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(flagPolePos.x - 1.5 * zoom, flagPolePos.y - 56 * zoom, 3 * zoom, 56 * zoom);

  // Fluttering Tiranga Flag Banner with Sine Wave Wind
  const flagY = flagPolePos.y - 54 * zoom;
  const flagW = 28 * zoom;
  const flagH = 6 * zoom;
  const waveOffset = Math.sin(time * 0.08) * 3 * zoom;

  // Top Band: Saffron (Kesari)
  ctx.fillStyle = '#FF9933';
  ctx.beginPath();
  ctx.moveTo(flagPolePos.x + 1.5 * zoom, flagY);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + flagH + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom, flagY + flagH);
  ctx.closePath();
  ctx.fill();

  // Middle Band: White
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(flagPolePos.x + 1.5 * zoom, flagY + flagH);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + flagH + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + flagH * 2 + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom, flagY + flagH * 2);
  ctx.closePath();
  ctx.fill();

  // Ashoka Chakra (Navy Blue 24-spoke wheel in center of white band)
  const chakraX = flagPolePos.x + 1.5 * zoom + flagW / 2;
  const chakraY = flagY + flagH * 1.5 + waveOffset / 2;
  ctx.strokeStyle = '#000080';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(chakraX, chakraY, 2.5 * zoom, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom Band: India Green
  ctx.fillStyle = '#138808';
  ctx.beginPath();
  ctx.moveTo(flagPolePos.x + 1.5 * zoom, flagY + flagH * 2);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + flagH * 2 + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom + flagW, flagY + flagH * 3 + waveOffset);
  ctx.lineTo(flagPolePos.x + 1.5 * zoom, flagY + flagH * 3);
  ctx.closePath();
  ctx.fill();
}

// ── 5. Volcano Mountain Eruptions & Cascading Lava River ─────────────
function drawValyrianLavaAndFire(time) {
  const zoom = state.camera.zoom;

  // 1. Volcano Summit Caldera Crater (gx: 26, gy: 26, z: 5)
  const calderaPos = gridToScreen(26, 26, 5);

  // Pulsating Volcanic Core Glow
  const glowPulse = 16 + Math.sin(time * 0.05) * 8;
  ctx.fillStyle = '#FF5722';
  ctx.shadowColor = '#EF4444';
  ctx.shadowBlur = glowPulse;
  ctx.beginPath();
  ctx.ellipse(calderaPos.x, calderaPos.y - 6 * zoom, 24 * zoom, 14 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FBBF24';
  ctx.beginPath();
  ctx.ellipse(calderaPos.x, calderaPos.y - 6 * zoom, 14 * zoom, 8 * zoom, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // 2. Active Volcanic Eruptions (Shooting Lava Bombs & Fiery Embers)
  if (Math.random() < 0.6) {
    const angle = (Math.random() - 0.5) * 1.8;
    const speed = Math.random() * 5 + 4;
    state.lavaBubbles.push({
      x: calderaPos.x + (Math.random() - 0.5) * 12 * zoom,
      y: calderaPos.y - 8 * zoom,
      vx: Math.sin(angle) * speed,
      vy: -Math.cos(angle) * speed - 3,
      size: Math.random() * 5 + 3,
      color: Math.random() < 0.5 ? '#F97316' : (Math.random() < 0.8 ? '#EF4444' : '#FBBF24'),
      gravity: 0.18,
      life: 1.0,
      decay: 0.015 + Math.random() * 0.01,
    });
  }

  // 3. Volcanic Smoke Voxels
  if (Math.random() < 0.35) {
    state.lavaBubbles.push({
      x: calderaPos.x + (Math.random() - 0.5) * 16 * zoom,
      y: calderaPos.y - 12 * zoom,
      vx: (Math.random() - 0.5) * 1.2,
      vy: -Math.random() * 2 - 1.5,
      size: Math.random() * 8 + 6,
      color: 'rgba(51, 65, 85, 0.6)',
      gravity: -0.02,
      life: 1.0,
      decay: 0.012,
    });
  }

  // 4. Cascading Lava River Bubbles
  const riverPoints = [
    { gx: 24, gy: 25 },
    { gx: 23, gy: 24 },
    { gx: 22, gy: 24 },
    { gx: 21, gy: 25 },
    { gx: 20, gy: 26 },
    { gx: 19, gy: 27 },
  ];
  if (Math.random() < 0.4) {
    const pt = riverPoints[Math.floor(Math.random() * riverPoints.length)];
    const rPos = gridToScreen(pt.gx + (Math.random() - 0.5) * 0.6, pt.gy + (Math.random() - 0.5) * 0.6, 1.2);
    state.lavaBubbles.push({
      x: rPos.x,
      y: rPos.y,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.5 - 0.5,
      size: Math.random() * 3 + 2,
      color: '#F97316',
      gravity: 0.05,
      life: 1.0,
      decay: 0.03,
    });
  }
}

// ── 6. Decorative Minecraft Game Objects ─────────────────────────────
function drawDecorativeMinecraftObjects(time) {
  const zoom = state.camera.zoom;

  drawCraftingTable(10, 14, 1, zoom);
  drawCraftingTable(21, 14, 1, zoom);

  drawFurnace(10, 15, 1, zoom, time);
  drawFurnace(21, 15, 1, zoom, time);

  drawChest(11, 15, 1, zoom);
  drawEnchantingTable(15, 13, 2, zoom, time);

  drawMinecraftLantern(13, 5, 2, zoom, time);
  drawMinecraftLantern(17, 5, 2, zoom, time);
  drawMinecraftLantern(13, 11, 2, zoom, time);
  drawMinecraftLantern(17, 11, 2, zoom, time);
}

function drawCraftingTable(gx, gy, gz, zoom) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#A16207';
  ctx.fillRect(p.x - 8 * zoom, p.y - 14 * zoom, 16 * zoom, 14 * zoom);
}

function drawFurnace(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#475569';
  ctx.fillRect(p.x - 8 * zoom, p.y - 14 * zoom, 16 * zoom, 14 * zoom);
}

function drawChest(gx, gy, gz, zoom) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#92400E';
  ctx.fillRect(p.x - 7 * zoom, p.y - 12 * zoom, 14 * zoom, 12 * zoom);
}

function drawEnchantingTable(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#1E1B4B';
  ctx.fillRect(p.x - 9 * zoom, p.y - 10 * zoom, 18 * zoom, 10 * zoom);
}

function drawMinecraftLantern(gx, gy, gz, zoom, time) {
  const p = gridToScreen(gx, gy, gz);
  ctx.fillStyle = '#334155';
  ctx.fillRect(p.x - 1.5 * zoom, p.y - 16 * zoom, 3 * zoom, 16 * zoom);
  const flicker = Math.sin(time * 0.015 + gx) * 0.2 + 0.8;
  ctx.fillStyle = `rgba(251, 191, 36, ${flicker})`;
  ctx.fillRect(p.x - 3.5 * zoom, p.y - 22 * zoom, 7 * zoom, 8 * zoom);
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

    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-6 * zoom, 2 * zoom, 12 * zoom, 2.5 * zoom);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-1.5 * zoom, 4.5 * zoom, 3 * zoom, 6 * zoom);
    ctx.shadowBlur = 0;

    ctx.restore();
  }
}

// ── 8. Superpower Showcase Engine for ALL Marvel Heroes ─────────────
function triggerRandomHeroSuperpower() {
  if (state.missionActive) return;
  const heroes = Object.values(state.roamingAgents);
  if (heroes.length === 0) return;
  const hero = heroes[Math.floor(Math.random() * heroes.length)];
  if (!hero.isWorking) executeHeroSuperpower(hero);
}

function executeHeroSuperpower(hero) {
  const startPos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy) + 1);

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
      ctx.strokeStyle = '#2563EB';
      ctx.shadowColor = '#3B82F6';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 4 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    } else if (fx.power === 'web_stream') {
      ctx.strokeStyle = '#FFFFFF';
      ctx.shadowColor = '#DC2626';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    } else if (fx.power === 'valyrian_dragonflame') {
      ctx.strokeStyle = '#10B981';
      ctx.shadowColor = '#10B981';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 5 * zoom;
      ctx.beginPath();
      ctx.moveTo(fx.from.x, fx.from.y);
      ctx.lineTo(fx.to.x, fx.to.y);
      ctx.stroke();
    } else if (fx.power === 'mjolnir_lightning') {
      drawVoxelLightning(fx.from.x, fx.from.y, fx.to.x, fx.to.y);
    } else if (fx.power === 'eldritch_mandala') {
      ctx.strokeStyle = '#D97706';
      ctx.shadowColor = '#D97706';
      ctx.shadowBlur = 18;
      ctx.lineWidth = 3 * zoom;
      ctx.beginPath();
      ctx.arc(fx.from.x, fx.from.y - 12 * zoom, 22 * zoom, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeRect(fx.from.x - 14 * zoom, fx.from.y - 26 * zoom, 28 * zoom, 28 * zoom);
    } else {
      ctx.strokeStyle = fx.color || '#2563EB';
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
  if (state.missionActive) return;
  const heroes = Object.values(state.roamingAgents).filter(h => !h.isWorking);
  if (heroes.length === 0) return;
  const lucky = heroes[Math.floor(Math.random() * heroes.length)];

  const spots = [
    { gx: 15, gy: 15 },
    { gx: 15, gy: 10 },
    { gx: 10, gy: 14 },
    { gx: 8, gy: 0 },   // Bridge
    { gx: 12, gy: 4 },  // Bridge
    { gx: 16, gy: 8 },  // Bridge
    { gx: 4, gy: 4 },
    { gx: 26, gy: 26 },
    { gx: 26, gy: 4 },
    { gx: 10, gy: 7 },
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

  if (hero.id === state.selectedAgentId) {
    ctx.strokeStyle = '#2563EB';
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

  renderMinecraftNameTag(hero, pos.x, pos.y - (46 + bobY) * state.camera.zoom);
}

function getHeadColor(hero) {
  switch (hero.skinType) {
    case 'iron-man': return '#B91C1C';
    case 'doctor-doom': return '#065F46';
    case 'thor': return '#FBBF24';
    case 'thanos': return '#7C3AED';
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
    case 'thanos': return isLeft ? '#FFC83B' : '#7C3AED';
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
    ctx.fillStyle = '#38BDF8'; ctx.fillRect(-2, 3, 4, 4);
  } else if (hero.skinType === 'captain-america') {
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(-2, 2, 4, 3);
  }
}

function renderFaceDetails(hero) {
  if (hero.skinType === 'iron-man') {
    ctx.fillStyle = '#FBBF24'; ctx.fillRect(-3, -4, 6, 6);
    ctx.fillStyle = '#38BDF8'; ctx.fillRect(-2, -3, 1.5, 1.5); ctx.fillRect(1, -3, 1.5, 1.5);
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
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(0, -12, 3, 14);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(-2, 2, 7, 2);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(0, 4, 3, 4);
    ctx.restore();
  }
}

function renderMinecraftNameTag(hero, x, y) {
  ctx.save();
  const label = hero.isWorking ? `[${hero.callsign}] ⚙️ CODING` : `[${hero.callsign}]`;
  ctx.font = `600 ${Math.max(9, 10 * state.camera.zoom)}px "Space Grotesk", sans-serif`;
  const textWidth = ctx.measureText(label).width;

  ctx.fillStyle = '#FFFFFF';
  ctx.shadowColor = 'rgba(0,0,0,0.15)'; ctx.shadowBlur = 6;
  ctx.fillRect(x - (textWidth / 2) - 4, y - 11, textWidth + 8, 14);
  ctx.shadowBlur = 0;

  ctx.strokeStyle = hero.themeColor || '#2563EB';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - (textWidth / 2) - 4, y - 11, textWidth + 8, 14);

  ctx.fillStyle = hero.themeColor || '#0F172A';
  ctx.fillText(label, x - (textWidth / 2), y);

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
    grad.addColorStop(0, 'rgba(37, 99, 235, 0.45)');
    grad.addColorStop(1, agent.glowColor || 'rgba(124, 58, 237, 0.35)');

    ctx.strokeStyle = grad;
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
      color: agent.themeColor || '#2563EB',
      progress: 0,
    });
  }
}

// ── 12. Lightning & Particles ───────────────────────────────────────
function drawVoxelLightning(x1, y1, x2, y2) {
  ctx.save();
  ctx.strokeStyle = '#38BDF8';
  ctx.shadowColor = '#0284C7';
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
      color: color || '#7C3AED',
      life: 1.0,
    });
  }
}

function spawnBlockParticles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    state.blockParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 3,
      vy: -Math.random() * 3 - 1,
      size: Math.random() * 3 + 2,
      color: color || '#B45309',
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
      color: '#10B981',
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

  // Block particles
  state.blockParticles = state.blockParticles.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 0.04;

    ctx.save();
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size * state.camera.zoom, p.size * state.camera.zoom);
    ctx.restore();

    return p.life > 0;
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
    ctx.fillStyle = '#10B981';
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size * state.camera.zoom, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    return orb.life > 0;
  });
}

// ── Multiverse Clash ────────────────────────────────────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [VOXEL BATTLE CLASH] All active Avengers drawing Diamond Swords & launching combat grid!`, 'code');
  showCosmicSpeechBubble('tony-stark', 'Avengers Assemble! Defend the Taj Mahal & Valyrian Grid!');

  for (const hero of Object.values(state.roamingAgents)) {
    hero.weapon = 'diamond_sword';
    executeHeroSuperpower(hero);
    const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
    spawnPortalParticles(pos.x, pos.y, hero.themeColor);
    spawnXpOrbs(pos.x, pos.y, 4);
  }
};

// ── Spawn & Despawn Roster System (5 Core Default + On-Demand Specialists) ──
window.openSpawnModal = function () {
  const grid = document.getElementById('spawnRosterGrid');
  grid.innerHTML = '';

  const activeCount = Object.keys(state.roamingAgents).length;
  const modalTitle = document.getElementById('modalRosterTitle');
  if (modalTitle) {
    modalTitle.innerHTML = `👥 MULTIVERSE TEAM // ACTIVE HEROES: ${activeCount}/10`;
  }

  for (const [id, hero] of Object.entries(MINECRAFT_HEROES)) {
    const isSpawned = Boolean(state.roamingAgents[id]);
    const liveHero = state.roamingAgents[id];
    const isBusy = liveHero?.isWorking || false;
    const isProtected = (id === 'tony-stark');

    const card = document.createElement('div');
    card.className = 'roster-spawn-card';
    card.style.borderColor = isSpawned ? (hero.themeColor || '#2563EB') : '#E2E8F0';

    let actionBtnHtml = '';
    if (!isSpawned) {
      actionBtnHtml = `<button class="roster-action-btn spawn" onclick="spawnHeroDirect('${id}')">➕ SPAWN TO WORLD</button>`;
    } else if (isProtected || isBusy) {
      actionBtnHtml = `<button class="roster-action-btn locked" title="Agent is working on an active task or is Player 1" disabled>🔒 ${isProtected ? 'PLAYER 1' : 'ACTIVE ON TASK'}</button>`;
    } else {
      actionBtnHtml = `<button class="roster-action-btn despawn" onclick="despawnHeroDirect('${id}')">❌ DESPAWN TO BASE</button>`;
    }

    const badgeCategory = hero.category === 'core' ? '<span style="font-size:8.5px; font-weight:700; color:#2563EB; background:#EFF6FF; padding:1px 5px; border-radius:4px;">CORE SQUAD</span>' : '<span style="font-size:8.5px; font-weight:700; color:#D97706; background:#FEF3C7; padding:1px 5px; border-radius:4px;">SPECIALIST</span>';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; width:100%; align-items:center;">
        ${badgeCategory}
        <span style="font-size:9px; font-family:var(--font-mono); font-weight:600; color:${isSpawned ? '#059669' : '#94A3B8'};">${isSpawned ? '● ONLINE' : '○ RESERVE'}</span>
      </div>
      <div class="roster-avatar-frame">
        <img src="${hero.image}" alt="${hero.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 100 100\\'><text y=\\'.9em\\' font-size=\\'90\\'>🦸</text></svg>'" />
      </div>
      <div class="roster-name">${hero.name}</div>
      <div class="roster-callsign">[${hero.callsign}]</div>
      <div style="font-size:10px; font-family:var(--font-body); color:var(--ink-muted);">${hero.role}</div>
      ${actionBtnHtml}
    `;

    grid.appendChild(card);
  }

  document.getElementById('spawnRosterModal').style.display = 'flex';
};

window.spawnHeroDirect = function (heroId) {
  const hero = MINECRAFT_HEROES[heroId];
  if (!hero) return;

  const targetGx = hero.homeStation ? hero.homeStation.gx : (10 + Math.random() * 8);
  const targetGy = hero.homeStation ? hero.homeStation.gy : (10 + Math.random() * 8);

  state.roamingAgents[heroId] = {
    ...hero,
    gx: targetGx,
    gy: targetGy,
    targetGx: targetGx,
    targetGy: targetGy,
    spawned: true,
  };

  state.selectedAgentId = heroId;
  const pos = gridToScreen(targetGx, targetGy, getElevation(targetGx, targetGy));
  spawnPortalParticles(pos.x, pos.y, hero.themeColor);
  spawnXpOrbs(pos.x, pos.y, 6);
  renderStrongholdDock();
  updateRosterBadge();
  openSpawnModal();
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [HERO SPAWNED] ${hero.name} (${hero.callsign}) entered the world to assist with ${hero.role}!`, 'code');
};

window.despawnHeroDirect = function (heroId) {
  const liveHero = state.roamingAgents[heroId];
  if (!liveHero) return;

  if (heroId === 'tony-stark' || liveHero.isWorking) {
    alert(`Cannot despawn ${liveHero.name} while active on mission directives!`);
    return;
  }

  const pos = gridToScreen(liveHero.gx, liveHero.gy, getElevation(liveHero.gx, liveHero.gy));
  spawnPortalParticles(pos.x, pos.y, '#7C3AED');

  delete state.roamingAgents[heroId];
  if (state.selectedAgentId === heroId) {
    state.selectedAgentId = 'tony-stark';
  }

  renderStrongholdDock();
  updateRosterBadge();
  openSpawnModal();
  appendVerboseStream(`🚪 [HERO DESPAWNED] ${liveHero.name} stepped through Nether portal to reserve base.`, 'code');
};

// ── Custom Character Creator ────────────────────────────────────────
window.openCustomHeroModal = function () {
  document.getElementById('customHeroModal').style.display = 'flex';
};

window.closeModals = function () {
  document.querySelectorAll('.battleworld-modal-backdrop').forEach(modal => {
    modal.style.display = 'none';
  });
  if (typeof isRecordingVoice !== 'undefined' && isRecordingVoice) {
    stopVoiceComms();
  }
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
    category: 'specialist',
    role,
    station: `${name} Taj Mahal Pod`,
    homeStation: { gx: customGx, gy: customGy },
    image: './assets/iron_man.jpg',
    avatar,
    themeColor: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.5)',
    skinType: 'custom',
    power,
    weapon: 'diamond_sword',
    gx: customGx,
    gy: customGy,
    targetGx: customGx,
    targetGy: customGy,
    walkTimer: 0,
    isWalking: false,
    isWorking: false,
    activeTask: '',
    speed: 0.075,
    quote: directive || `Agent ${name} operational. Ready to assist.`,
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
  spawnPortalParticles(pos.x, pos.y, '#2563EB');
  renderStrongholdDock();
  updateRosterBadge();
  closeModals();
  showCosmicSpeechBubble(heroId, newHero.quote);
  appendVerboseStream(`🚀 [CUSTOM VOXEL HERO SPAWNED] ${newHero.station} active for ${name}!`, 'code');
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

// ── Stronghold Dock Cards (With "➕ Spawn Specialist" Action) ─────────
function renderStrongholdDock() {
  multiverseStrongholdDock.innerHTML = '';

  for (const entity of Object.values(state.roamingAgents)) {
    const card = document.createElement('div');
    card.className = 'stronghold-card';
    card.id = `stronghold-${entity.id}`;
    card.style.setProperty('--card-accent', entity.themeColor);

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
      appendVerboseStream(`● [${entity.callsign}] Focus locked on ${entity.station}.`, 'chat');
    });

    multiverseStrongholdDock.appendChild(card);
  }

  // Append "+ Spawn Specialist" Card
  const addCard = document.createElement('div');
  addCard.className = 'stronghold-card add-specialist-card';
  addCard.title = 'Spawn additional multiverse heroes to assist';
  addCard.innerHTML = `
    <div style="font-family:var(--font-display); font-size:11px; font-weight:700; color:#2563EB; display:flex; align-items:center; gap:6px;">
      <span style="font-size:14px;">➕</span> Spawn Specialist
    </div>
  `;
  addCard.addEventListener('click', () => openSpawnModal());
  multiverseStrongholdDock.appendChild(addCard);
}

// ── Console Mode Toggle (CHAT vs CODE vs RESULT) ────────────────────
window.setConsoleMode = function (mode) {
  state.consoleMode = mode;
  const btnChat   = document.getElementById('btnModeChat');
  const btnCode   = document.getElementById('btnModeCode');
  const btnResult = document.getElementById('btnModeResult');
  const descLabel = document.getElementById('modeDescriptionLabel');
  const badge     = document.getElementById('resultBadgeReady');

  [btnChat, btnCode, btnResult].forEach(b => b && b.classList.remove('active'));

  if (mode === 'chat') {
    if (btnChat) btnChat.classList.add('active');
    verboseStreamFeed.style.display = 'flex';
    resultDeliverableView.style.display = 'none';
    descLabel.innerText = '💬 All inter-agent thoughts, deliberations & DAG communications';
    verboseStreamFeed.querySelectorAll('.stream-entry').forEach(el => {
      el.style.display = (el.dataset.kind === 'code') ? 'none' : 'flex';
    });
  } else if (mode === 'code') {
    if (btnCode) btnCode.classList.add('active');
    verboseStreamFeed.style.display = 'flex';
    resultDeliverableView.style.display = 'none';
    descLabel.innerText = '🖥️ Code output only: file writes, workspace paths & directive results';
    verboseStreamFeed.querySelectorAll('.stream-entry').forEach(el => {
      el.style.display = (el.dataset.kind === 'chat') ? 'none' : 'flex';
    });
  } else {
    if (btnResult) btnResult.classList.add('active');
    resultDeliverableView.style.display = 'flex';
    verboseStreamFeed.style.display = 'none';
    descLabel.innerText = '🏆 Final deliverable files and project run instructions';
    if (badge) badge.style.display = 'none';
  }
};

window.fillPrompt = function (text) {
  quantumPromptInput.value = text;
  quantumPromptInput.focus();
};

window.clearTerminal = function () {
  verboseStreamFeed.innerHTML = '';
  appendVerboseStream(`● [TONY STARK] Terminal cleared. Ready for next master directive.`, 'code');
};

// ── Message Kind Classifier ──────────────────────────────────────────
function classifyStreamKind(text) {
  const CHAT_PATTERNS = [
    /\[THOUGHT\s*\/\//,
    /\[ACTION\s*\/\//,
    /\[COMPLETED\s*\/\//,
    /\[VERIFIED\s*\/\//,
    /\[ERROR\s*\/\//,
    /AVENGERS ASSEMBLE/,
    /DEPLOYING STRIKE TEAM/,
    /DECOMPOSED.*PARALLEL DIRECTIVES/,
    /MULTI.*VERSE TIMELINE/,
    /MIND STONE SEMANTIC/,
    /VIBRANIUM.*QA/,
    /REVIEWING ARCHITECTURE/,
    /SUPERPOWER/,
    /VOXEL BATTLE CLASH/,
    /FOCUS LOCKED/,
  ];

  for (const pat of CHAT_PATTERNS) {
    if (pat.test(text)) return 'chat';
  }

  const CODE_PATTERNS = [
    /WORKSPACE SAVED/i,
    /WORKSPACE LOCATION/i,
    /PROJECT WRITTEN/i,
    /GENERATED PROJECT FILES/i,
    /WRITING SOURCE CODE FOR/i,
    /USER DIRECTIVE/i,
    /MISSION DIRECTIVE/i,
    /STARK ERROR/i,
    /NETWORK ERROR/i,
    /BUILD MODE/i,
    /BLOCK PLACED/i,
    /MINED BLOCK/i,
    /HERO SPAWNED/i,
    /HERO DESPAWNED/i,
    /DIRECTIVE.*COMPLETED/i,
  ];

  for (const pat of CODE_PATTERNS) {
    if (pat.test(text)) return 'code';
  }

  return 'chat';
}

function appendVerboseStream(text, kind = 'auto') {
  const resolvedKind = (kind === 'auto') ? classifyStreamKind(text) : kind;

  const entry = document.createElement('div');
  entry.className = 'stream-entry';
  entry.dataset.kind = resolvedKind;

  const currentMode = state.consoleMode;
  if (currentMode === 'code' && resolvedKind === 'chat') {
    entry.style.display = 'none';
  } else if (currentMode === 'chat' && resolvedKind === 'code') {
    entry.style.display = 'none';
  }

  const tagMatch = text.match(/^●?\s*\[([a-zA-Z0-9_\-\s\/]+)\]/);
  if (tagMatch) {
    const tagName = tagMatch[1];
    const rest = text.replace(/^●?\s*\[([a-zA-Z0-9_\-\s\/]+)\]\s*/, '');
    let color = '#2563EB';
    if (tagName.includes('HULK')) color = '#16A34A';
    else if (tagName.includes('DOOM')) color = '#059669';
    else if (tagName.includes('THANOS')) color = '#7C3AED';
    else if (tagName.includes('SPIDEY') || tagName.includes('SPIDER')) color = '#DC2626';
    else if (tagName.includes('STRANGE') || tagName.includes('WIDOW')) color = '#9333EA';
    else if (tagName.includes('THOR')) color = '#0284C7';
    else if (tagName.includes('CAP')) color = '#2563EB';
    else if (tagName.includes('MINECRAFT') || tagName.includes('BUILD') || tagName.includes('WORKSPACE')) color = '#0284C7';
    else if (tagName.includes('USER DIRECTIVE')) color = '#D97706';
    else if (tagName.includes('ERROR') || tagName.includes('NETWORK')) color = '#DC2626';

    entry.innerHTML = `<span class="stream-bullet" style="color:${color}">●</span> <span class="stream-hero-tag" style="color:${color}">[${escapeHtml(tagName)}]</span> ${escapeHtml(rest)}`;
  } else {
    entry.innerHTML = `<span class="stream-bullet" style="color:#2563EB">●</span> ${escapeHtml(text)}`;
  }

  verboseStreamFeed.appendChild(entry);
  verboseStreamFeed.scrollTop = verboseStreamFeed.scrollHeight;
}

function updateResultDeliverable(summaryText, workspaceData, workspacePath) {
  resultDeliverableView.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'deliverable-hero-card';

  const actualPath = workspacePath || workspaceData?.workspacePath || './workspace/generated-app';
  const runCmds = workspaceData?.runInstructions || [
    `cd ${actualPath}`,
    `npm install`,
    `npm start`,
  ];

  let html = `
    <h2>🏆 Mission Deliverables & Source Code Repository</h2>
    
    <div class="workspace-path-banner">
      <span>📁 <strong>Saved on Local Disk:</strong> <code>${escapeHtml(actualPath)}</code></span>
      <button class="code-copy-btn" onclick="navigator.clipboard.writeText('${actualPath.replace(/\\/g, '\\\\')}'); this.innerText='Copied!';">Copy Path</button>
    </div>

    <div style="background:#0F172A; border-radius:6px; padding:12px; margin:10px 0;">
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
        <span style="font-family:var(--font-display); font-size:11px; font-weight:700; color:#34D399;">🚀 RUN YOUR APP (TERMINAL):</span>
        <button class="code-copy-btn" style="position:static;" onclick="navigator.clipboard.writeText(\`${runCmds.join('\n')}\`); this.innerText='Copied!';">Copy Run Script</button>
      </div>
      <pre style="margin:0; background:#000000;"><code style="color:#4ADE80;">${escapeHtml(runCmds.join('\n'))}</code></pre>
    </div>
  `;

  if (workspaceData?.files && workspaceData.files.length > 0) {
    html += `<div style="font-family:var(--font-display); font-size:11.5px; font-weight:700; color:#0F172A; margin:14px 0 6px;">📂 GENERATED REPOSITORY FILES:</div>`;
    for (const file of workspaceData.files) {
      html += `
        <div style="margin-bottom:12px;">
          <div style="display:flex; align-items:center; justify-content:space-between; font-family:var(--font-mono); font-size:11px; color:#334155; padding:4px 0;">
            <span>📄 <strong>${escapeHtml(file.relativePath)}</strong> (${file.language})</span>
            <span style="font-size:10px; color:#64748B;">Crafted by [${escapeHtml(file.hero.toUpperCase())}]</span>
          </div>
          <pre><code>${escapeHtml(file.content)}</code><button class="code-copy-btn" onclick="navigator.clipboard.writeText(\`${file.content.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); this.innerText='Copied!';">Copy File</button></pre>
        </div>
      `;
    }
  } else {
    const codeBlockRegex = /```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let parsed = '';

    while ((match = codeBlockRegex.exec(summaryText)) !== null) {
      const lang = match[1] || 'text';
      const code = match[2];
      parsed += escapeHtml(summaryText.substring(lastIndex, match.index));
      parsed += `<pre><code>${escapeHtml(code)}</code><button class="code-copy-btn" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); this.innerText='Copied!';">Copy</button></pre>`;
      lastIndex = match.index + match[0].length;
    }
    parsed += escapeHtml(summaryText.substring(lastIndex));
    html += `<div style="font-size:12px; line-height:1.6; color:#334155;">${parsed.replace(/\n/g, '<br/>')}</div>`;
  }

  card.innerHTML = html;
  resultDeliverableView.appendChild(card);

  const badge = document.getElementById('resultBadgeReady');
  if (badge) badge.style.display = 'block';
  setConsoleMode('result');
  showCompletionToast('Mission Accomplished! Source files ready in Result tab.');
}

function showCompletionToast(message) {
  const existing = document.querySelector('.completion-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'completion-toast';
  toast.innerHTML = `<span>🎉</span> ${escapeHtml(message)}`;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
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
  state.missionActive = true;
  if (missionProgressTrack) missionProgressTrack.style.display = 'block';

  setConsoleMode('code');

  appendVerboseStream(`● [USER DIRECTIVE] ${prompt}`, 'code');
  appendVerboseStream(`● [TONY STARK] Deconstructing directive across the Minecraft world...`, 'chat');

  showCosmicSpeechBubble('tony-stark', `Analyzing directive: "${prompt.slice(0, 35)}..."`);
  triggerDAGSimulationPulse();

  for (const [id, hero] of Object.entries(state.roamingAgents)) {
    if (hero.homeStation) {
      hero.targetGx = hero.homeStation.gx;
      hero.targetGy = hero.homeStation.gy;
      hero.isWalking = true;
    }
  }

  try {
    const res = await fetch('/api/mission/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    state.missionActive = false;
    if (missionProgressTrack) missionProgressTrack.style.display = 'none';

    if (!res.ok) {
      const err = await res.text();
      appendVerboseStream(`● [STARK ERROR] Mission execution failed: ${err}`, 'code');
      return;
    }

    const data = await res.json();
    if (data.success) {
      const wPath = data.workspacePath || data.workspace?.workspacePath || './workspace';
      appendVerboseStream(`● [WORKSPACE SAVED] Project written to: ${wPath}`, 'code');
      updateResultDeliverable(data.summary || data.result, data.workspace, wPath);
    }
  } catch (err) {
    state.missionActive = false;
    if (missionProgressTrack) missionProgressTrack.style.display = 'none';
    appendVerboseStream(`● [NETWORK ERROR] ${err.message}`, 'code');
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
        const content = msg.data.content;
        const kind = classifyStreamKind(content);
        appendVerboseStream(content, kind);

        const speaker = msg.data.from;
        if (state.roamingAgents[speaker] || MINECRAFT_HEROES[speaker]) {
          const hero = state.roamingAgents[speaker];
          if (hero) {
            executeHeroSuperpower(hero);
            const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
            spawnPortalParticles(pos.x, pos.y, hero.themeColor);
          }
          showCosmicSpeechBubble(speaker, content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 70));
        }
      } else if (msg.type === 'directive_started') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.isWorking = true;
          hero.activeTask = msg.data?.title || 'Code Directive';
          if (hero.homeStation) {
            hero.targetGx = hero.homeStation.gx;
            hero.targetGy = hero.homeStation.gy;
          }
          hero.isWalking = true;
          const pos = gridToScreen(hero.gx, hero.gy, getElevation(hero.gx, hero.gy));
          spawnPortalParticles(pos.x, pos.y, hero.themeColor);
        }
        appendVerboseStream(`● [${(heroId || 'HERO').toUpperCase()}] Writing source code for "${msg.data?.title}"...`, 'code');
      } else if (msg.type === 'directive_completed') {
        const heroId = msg.data?.assignedHero;
        const hero = state.roamingAgents[heroId];
        if (hero) {
          hero.isWorking = false;
          hero.activeTask = '';
        }
        if (msg.data?.title) {
          appendVerboseStream(`● [${(heroId || 'HERO').toUpperCase()}] ✅ Completed: "${msg.data.title}"`, 'code');
        }
      } else if (msg.type === 'mission_started') {
        state.missionActive = true;
        if (missionProgressTrack) missionProgressTrack.style.display = 'block';
        appendVerboseStream(`● [MISSION STARTED] ${msg.data?.name || 'New Mission'}`, 'chat');
      } else if (msg.type === 'mission_completed') {
        state.missionActive = false;
        if (missionProgressTrack) missionProgressTrack.style.display = 'none';
        for (const h of Object.values(state.roamingAgents)) {
          h.isWorking = false;
          h.activeTask = '';
        }
        appendVerboseStream(`● [MISSION COMPLETED] All directives executed. Workspace ready.`, 'code');
        if (msg.data?.workspace || msg.data?.finalSummary) {
          updateResultDeliverable(msg.data.finalSummary || msg.data.result, msg.data.workspace, msg.data.workspace?.workspacePath);
        }
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

// ── Workspace Explorer Modal Controller ──────────────────────────────
let cachedWorkspaces = [];
let activeModalWorkspace = null;
let activeModalFile = null;

window.openWorkspaceExplorer = async function () {
  const modal = document.getElementById('workspaceExplorerModal');
  if (!modal) return;
  modal.style.display = 'flex';

  try {
    const res = await fetch('/api/workspace');
    if (!res.ok) throw new Error('Failed to fetch workspaces');
    const data = await res.json();
    cachedWorkspaces = data.workspaces || [];

    const dropdown = document.getElementById('workspaceSelectorDropdown');
    dropdown.innerHTML = '';

    if (cachedWorkspaces.length === 0) {
      dropdown.innerHTML = '<option value="">(No workspaces generated yet - run a mission directive first)</option>';
      document.getElementById('modalWorkspacePathText').innerText = './workspace';
      document.getElementById('modalWorkspaceFileList').innerHTML = '<div style="padding:14px; color:var(--ink-muted); font-size:11px;">No files generated yet. Dispatch a mission in the console to create a codebase.</div>';
      document.getElementById('modalCodePreviewContent').innerText = '// No project files found';
      return;
    }

    cachedWorkspaces.forEach(ws => {
      const opt = document.createElement('option');
      opt.value = ws.slug;
      opt.innerText = `${ws.slug} (${ws.files.length} files)`;
      dropdown.appendChild(opt);
    });

    const activeSlug = data.active?.slug || cachedWorkspaces[cachedWorkspaces.length - 1]?.slug;
    dropdown.value = activeSlug;
    loadSelectedWorkspace(activeSlug);
  } catch (err) {
    appendVerboseStream(`● [WORKSPACE ERROR] Could not load workspaces: ${err.message}`, 'code');
  }
};

window.loadSelectedWorkspace = function (slug) {
  activeModalWorkspace = cachedWorkspaces.find(w => w.slug === slug) || cachedWorkspaces[0];
  if (!activeModalWorkspace) return;

  document.getElementById('modalWorkspacePathText').innerText = activeModalWorkspace.path;
  
  // Detect framework / run script
  let runScript = 'npm install && npm start';
  const fileNames = activeModalWorkspace.files.map(f => f.relativePath.toLowerCase());
  if (fileNames.some(f => f.includes('package.swift'))) runScript = 'swift build && swift run';
  else if (fileNames.some(f => f.includes('requirements.txt') || f.includes('main.py'))) runScript = 'pip install -r requirements.txt && python main.py';
  
  document.getElementById('modalRunScriptText').innerText = runScript;

  // Render File List
  const listContainer = document.getElementById('modalWorkspaceFileList');
  listContainer.innerHTML = '<div class="workspace-sidebar-header">REPOSITORY FILES</div>';

  activeModalWorkspace.files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = `workspace-file-item ${index === 0 ? 'active' : ''}`;
    item.innerHTML = `<span>📄</span> <span style="overflow:hidden; text-overflow:ellipsis;">${escapeHtml(file.relativePath)}</span>`;
    item.onclick = () => {
      document.querySelectorAll('.workspace-file-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      displayModalFileContent(file);
    };
    listContainer.appendChild(item);
  });

  if (activeModalWorkspace.files.length > 0) {
    displayModalFileContent(activeModalWorkspace.files[0]);
  } else {
    document.getElementById('modalActiveFileName').innerText = 'No files';
    document.getElementById('modalCodePreviewContent').innerText = '// Empty repository';
  }
};

function displayModalFileContent(file) {
  activeModalFile = file;
  document.getElementById('modalActiveFileName').innerText = `${file.relativePath} (${file.language})`;
  document.getElementById('modalCodePreviewContent').innerText = file.content;
}

window.copyActiveWorkspacePath = function () {
  if (activeModalWorkspace?.path) {
    navigator.clipboard.writeText(activeModalWorkspace.path);
    showCompletionToast('Workspace disk path copied to clipboard!');
  }
};

window.copyCurrentFileContent = function () {
  if (activeModalFile?.content) {
    navigator.clipboard.writeText(activeModalFile.content);
    showCompletionToast(`Copied ${activeModalFile.relativePath} to clipboard!`);
  }
};

window.copyModalRunScript = function () {
  const script = document.getElementById('modalRunScriptText').innerText;
  if (script) {
    navigator.clipboard.writeText(script);
    showCompletionToast('Terminal run script copied to clipboard!');
  }
};

// ── Voice Comms Speech Recognition & Translator ─────────────────────
let recognition = null;
let isRecordingVoice = false;

window.toggleVoiceComms = function () {
  const modal = document.getElementById('voiceCommsModal');
  modal.style.display = 'flex';
  startVoiceRecognition();
};

window.startVoiceRecognition = function () {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const transcriptBox = document.getElementById('voiceTranscriptBox');
  const statusPill = document.getElementById('voiceStatusPill');
  const statusText = document.getElementById('voiceStatusText');

  if (!SpeechRecognition) {
    statusText.innerText = 'MIC NOT SUPPORTED IN THIS BROWSER';
    statusPill.style.background = '#FEF2F2';
    statusPill.style.color = '#DC2626';
    transcriptBox.placeholder = 'Speech recognition not available. Please type your directive manually.';
    return;
  }

  try {
    if (recognition) {
      recognition.abort();
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US'; // Supports multilingual speech

    recognition.onstart = () => {
      isRecordingVoice = true;
      statusText.innerText = 'RECORDING COMMS... SPEAK NOW';
      statusPill.style.background = '#FEF2F2';
      statusPill.style.color = '#DC2626';
      transcriptBox.value = '';
    };

    recognition.onresult = (event) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      transcriptBox.value = currentTranscript.trim();
    };

    recognition.onerror = (event) => {
      console.warn('Voice Comms recognition error:', event.error);
      statusText.innerText = `MIC ERROR: ${event.error.toUpperCase()}`;
    };

    recognition.onend = () => {
      isRecordingVoice = false;
      statusText.innerText = 'VOICE RECORDING CAPTURED';
      statusPill.style.background = '#EFF6FF';
      statusPill.style.color = '#2563EB';
    };

    recognition.start();
  } catch (err) {
    statusText.innerText = 'MIC INITIALIZATION ERROR';
  }
};

window.stopVoiceComms = function () {
  if (recognition) {
    try { recognition.stop(); } catch {}
  }
  isRecordingVoice = false;
  document.getElementById('voiceCommsModal').style.display = 'none';
};

window.insertVoiceTranscriptIntoInput = async function () {
  let text = document.getElementById('voiceTranscriptBox').value.trim();
  if (!text) return;

  // Translate/clean via server
  try {
    const res = await fetch('/api/comms/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.translated) text = data.translated;
  } catch {}

  quantumPromptInput.value = text;
  quantumPromptInput.focus();
  stopVoiceComms();
  showCompletionToast('Voice directive inserted into Quantum Console!');
};

window.dispatchVoiceDirective = async function () {
  let text = document.getElementById('voiceTranscriptBox').value.trim();
  if (!text) return;

  stopVoiceComms();

  // Translate & clean up
  try {
    const res = await fetch('/api/comms/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    const data = await res.json();
    if (data.translated) text = data.translated;
  } catch {}

  quantumPromptInput.value = text;
  dispatchMasterMission();
};

// ── Settings Dialog, Themes & AI Key Controllers ─────────────────────
window.applyAppTheme = function (themeName) {
  document.body.className = `theme-${themeName}`;
  localStorage.setItem('stark_theme', themeName);

  ['Daylight', 'Light', 'Dark'].forEach(t => {
    const card = document.getElementById(`themeCard${t}`);
    if (card) card.classList.remove('active');
  });

  const capName = themeName.charAt(0).toUpperCase() + themeName.slice(1);
  const activeCard = document.getElementById(`themeCard${capName}`);
  if (activeCard) activeCard.classList.add('active');

  const badge = document.getElementById('currentThemeBadge');
  if (badge) {
    if (themeName === 'daylight') badge.innerText = '☀️ DAYLIGHT';
    else if (themeName === 'light') badge.innerText = '⛅ LIGHT';
    else badge.innerText = '🌙 DARK';
  }
};

// Initialize Theme from localStorage
(function initTheme() {
  const saved = localStorage.getItem('stark_theme') || 'daylight';
  applyAppTheme(saved);
})();

window.openSettingsModal = function (defaultTab = 'theme') {
  const modal = document.getElementById('settingsModal');
  if (modal) modal.style.display = 'flex';
  switchSettingsTab(defaultTab);
  loadApiKeysStatus();
  loadPersonalSkillsList();
};

window.switchSettingsTab = function (tabKey) {
  const tabs = ['theme', 'keys', 'skills', 'sim'];
  tabs.forEach(t => {
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    const btn = document.getElementById(`tabBtn${cap}`);
    const panel = document.getElementById(`tabPanel${cap}`);
    if (btn) btn.classList.remove('active');
    if (panel) panel.classList.remove('active');
  });

  const cap = tabKey.charAt(0).toUpperCase() + tabKey.slice(1);
  const targetBtn = document.getElementById(`tabBtn${cap}`);
  const targetPanel = document.getElementById(`tabPanel${cap}`);
  if (targetBtn) targetBtn.classList.add('active');
  if (targetPanel) targetPanel.classList.add('active');
};

// Load API Keys Status & Configured Providers
window.loadApiKeysStatus = async function () {
  try {
    const res = await fetch('/api/keys/status');
    if (!res.ok) return;
    const data = await res.json();

    const modelSelect = document.getElementById('settingsActiveModelSelect');
    if (modelSelect && data.activeModel) {
      modelSelect.value = data.activeModel;
    }

    const footerModelText = document.getElementById('footerModelName');
    if (footerModelText && data.activeModel) {
      footerModelText.innerText = data.activeModel;
    }

    // Update Gemini Badge
    const geminiBadge = document.getElementById('badgeGeminiStatus');
    if (geminiBadge) {
      const isLive = data.providers?.gemini?.configured;
      geminiBadge.className = `provider-status-badge ${isLive ? 'live' : 'off'}`;
      geminiBadge.innerText = isLive ? '● CONNECTED' : '○ NOT CONFIGURED';
    }

    // Update Claude Badge
    const claudeBadge = document.getElementById('badgeClaudeStatus');
    if (claudeBadge) {
      const isLive = data.providers?.claude?.configured;
      claudeBadge.className = `provider-status-badge ${isLive ? 'live' : 'off'}`;
      claudeBadge.innerText = isLive ? '● CONNECTED' : '○ NOT CONFIGURED';
    }

    // Update OpenAI Badge
    const openaiBadge = document.getElementById('badgeOpenaiStatus');
    if (openaiBadge) {
      const isLive = data.providers?.openai?.configured;
      openaiBadge.className = `provider-status-badge ${isLive ? 'live' : 'off'}`;
      openaiBadge.innerText = isLive ? '● CONNECTED' : '○ NOT CONFIGURED';
    }
  } catch {}
};

window.verifyProviderKey = async function (provider) {
  const cap = provider.charAt(0).toUpperCase() + provider.slice(1);
  const input = document.getElementById(`input${cap}Key`);
  const statusBox = document.getElementById(`statusResult${cap}`);
  const apiKey = input ? input.value.trim() : '';

  if (statusBox) statusBox.innerHTML = '<span style="color:var(--primary-blue);">⚡ Testing connection & checking live health...</span>';

  try {
    const res = await fetch('/api/keys/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, apiKey }),
    });
    const data = await res.json();
    if (data.valid) {
      if (statusBox) statusBox.innerHTML = `<span style="color:#059669; font-weight:700;">✅ Key is LIVE & Verified! Latency: ${data.latencyMs}ms</span>`;
      const badge = document.getElementById(`badge${cap}Status`);
      if (badge) {
        badge.className = 'provider-status-badge live';
        badge.innerText = '● CONNECTED';
      }
      showCompletionToast(`${provider.toUpperCase()} API Key Verified & Active!`);
    } else {
      if (statusBox) statusBox.innerHTML = `<span style="color:#DC2626;">❌ ${data.message}</span>`;
    }
  } catch (err) {
    if (statusBox) statusBox.innerHTML = `<span style="color:#DC2626;">❌ Verification error: ${err.message}</span>`;
  }
};

window.saveApiKeysAndModel = async function () {
  const modelSelect = document.getElementById('settingsActiveModelSelect');
  const selectedModel = modelSelect ? modelSelect.value : 'gemini-3.5-flash-lite';

  const geminiKey = document.getElementById('inputGeminiKey')?.value.trim();
  const claudeKey = document.getElementById('inputClaudeKey')?.value.trim();
  const openaiKey = document.getElementById('inputOpenaiKey')?.value.trim();

  let activeProvider = 'gemini';
  let activeKey = geminiKey;
  if (selectedModel.includes('claude')) {
    activeProvider = 'claude';
    activeKey = claudeKey;
  } else if (selectedModel.includes('gpt') || selectedModel.includes('o3')) {
    activeProvider = 'openai';
    activeKey = openaiKey;
  }

  try {
    const res = await fetch('/api/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: activeProvider,
        apiKey: activeKey,
        model: selectedModel,
      }),
    });

    if (res.ok) {
      const footerModelText = document.getElementById('footerModelName');
      if (footerModelText) footerModelText.innerText = selectedModel;

      showCompletionToast(`Configuration updated: ${selectedModel} is now ACTIVE.`);
      appendVerboseStream(`⚡ [SYSTEM CONFIGURATION] Active model set to [${selectedModel.toUpperCase()}]. Providers synced.`, 'code');
      loadApiKeysStatus();
      closeModals();
    }
  } catch (err) {
    alert(`Could not save configuration: ${err.message}`);
  }
};

// ── Custom Personal Skills Controller ────────────────────────────────
window.loadPersonalSkillsList = async function () {
  const container = document.getElementById('personalSkillsListContainer');
  if (!container) return;

  try {
    const res = await fetch('/api/skills');
    if (!res.ok) return;
    const data = await res.json();
    const skills = data.skills || [];

    if (skills.length === 0) {
      container.innerHTML = '<div style="font-size:11px; color:var(--ink-muted); padding:10px;">No custom personal skills loaded yet. Add your first skill below!</div>';
      return;
    }

    container.innerHTML = '';
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'personal-skill-card';
      card.innerHTML = `
        <div class="skill-info">
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="skill-name">${escapeHtml(skill.name)}</span>
            <span style="font-size:8.5px; font-weight:700; background:#EFF6FF; color:#2563EB; padding:1px 5px; border-radius:4px;">${escapeHtml(skill.category)}</span>
          </div>
          <div class="skill-desc">${escapeHtml(skill.prompt)}</div>
        </div>
        <button class="roster-action-btn despawn" style="width:auto; padding:4px 8px; margin:0;" onclick="deletePersonalSkill('${skill.id}')">🗑️ Remove</button>
      `;
      container.appendChild(card);
    });
  } catch {}
};

window.submitNewPersonalSkill = async function () {
  const nameInput = document.getElementById('newSkillName');
  const catInput = document.getElementById('newSkillCategory');
  const promptInput = document.getElementById('newSkillPrompt');

  const name = nameInput?.value.trim();
  const category = catInput?.value.trim() || 'Custom Skill';
  const prompt = promptInput?.value.trim();

  if (!name || !prompt) {
    alert('Please enter both Skill Name and System Instructions!');
    return;
  }

  try {
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, prompt }),
    });

    if (res.ok) {
      if (nameInput) nameInput.value = '';
      if (catInput) catInput.value = '';
      if (promptInput) promptInput.value = '';

      showCompletionToast(`Personal Skill "${name}" registered successfully!`);
      appendVerboseStream(`🧠 [NEW PERSONAL SKILL LOADED] "${name}" capabilities activated across all Avengers!`, 'code');
      loadPersonalSkillsList();
    }
  } catch (err) {
    alert(`Could not load skill: ${err.message}`);
  }
};

window.deletePersonalSkill = async function (skillId) {
  try {
    await fetch(`/api/skills/${skillId}`, { method: 'DELETE' });
    showCompletionToast('Personal skill removed.');
    loadPersonalSkillsList();
  } catch {}
};
