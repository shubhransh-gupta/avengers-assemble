/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // DYNAMIC ROAMING BATTLEWORLD & MULTIVERSE ENGINE (docs/warroom.js)
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],
  activeAttacks: [], // Laser beams, lightning strikes, runes, shockwaves
  roamingAgents: {},
};

// ── Complete Marvel Superheroes & Supervillains Catalog ─────────────
const MARVEL_CATALOG = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'Tony Stark',
    callsign: 'IRON MAN',
    role: 'God Orchestrator',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    power: 'laser',
    suit: 'mark-85',
    pos: { x: 250, y: 120 },
    targetPos: { x: 250, y: 120 },
    vx: 0, vy: 0,
    quote: 'JARVIS, decompose master prompt into DAG directives.',
    spawned: true,
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'Doctor Doom',
    callsign: 'DOOM',
    role: 'Latverian AST & Compiler',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    power: 'runes',
    suit: 'doom-armor',
    pos: { x: 380, y: 190 },
    targetPos: { x: 380, y: 190 },
    vx: 0, vy: 0,
    quote: 'Doom commands the syntax tree. Bugs shall not survive.',
    spawned: true,
  },
  'kang': {
    id: 'kang',
    name: 'Kang the Conqueror',
    callsign: 'KANG',
    role: 'Quantum Timeline Branching',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    power: 'chrono',
    suit: 'kang-armor',
    pos: { x: 110, y: 175 },
    targetPos: { x: 110, y: 175 },
    vx: 0, vy: 0,
    quote: 'I have simulated 14 billion timelines. Reality-616 targeted.',
    spawned: true,
  },
  'thanos': {
    id: 'thanos',
    name: 'Thanos',
    callsign: 'MAD TITAN',
    role: 'Power & Rate Balancer',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.6)',
    power: 'cosmic',
    suit: 'thanos-gold',
    pos: { x: 360, y: 80 },
    targetPos: { x: 360, y: 80 },
    vx: 0, vy: 0,
    quote: 'Rate limits, memory, and tokens in perfect equilibrium.',
    spawned: true,
  },
  'thor': {
    id: 'thor',
    name: 'Thor Odinson',
    callsign: 'THOR',
    role: 'DevOps & Package Manifest',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.6)',
    power: 'thunder',
    suit: 'thor-armor',
    pos: { x: 420, y: 110 },
    targetPos: { x: 420, y: 110 },
    vx: 0, vy: 0,
    quote: 'By Mjolnir, forged high-voltage Swift packages and CI/CD!',
    spawned: true,
  },
  'captain-america': {
    id: 'captain-america',
    name: 'Steve Rogers',
    callsign: 'CAP',
    role: 'Vibranium QA Auditor',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    power: 'shield',
    suit: 'cap-stealth',
    pos: { x: 160, y: 255 },
    targetPos: { x: 160, y: 255 },
    vx: 0, vy: 0,
    quote: 'Standards inspection ready. Sound off, soldiers.',
    spawned: true,
  },
  'spider-man': {
    id: 'spider-man',
    name: 'Peter Parker',
    callsign: 'SPIDEY',
    role: 'Frontend UI Architect',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.6)',
    power: 'web',
    suit: 'spidey-nanotech',
    pos: { x: 325, y: 260 },
    targetPos: { x: 325, y: 260 },
    vx: 0, vy: 0,
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    spawned: true,
  },
  'hulk': {
    id: 'hulk',
    name: 'Bruce Banner',
    callsign: 'HULK',
    role: 'Gamma Logic Optimizer',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.6)',
    power: 'gamma',
    suit: 'hulk-titan',
    pos: { x: 240, y: 240 },
    targetPos: { x: 240, y: 240 },
    vx: 0, vy: 0,
    quote: 'HULK SMASH BOTTLENECKS AND REFACTOR FOR MAX PERFORMANCE!',
    spawned: true,
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'Stephen Strange',
    callsign: 'STRANGE',
    role: 'Temporal Memory',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    power: 'mandala',
    suit: 'strange-robes',
    pos: { x: 75, y: 110 },
    targetPos: { x: 75, y: 110 },
    vx: 0, vy: 0,
    quote: 'Temporal snapshots preserved for instant multiverse rollback.',
    spawned: true,
  },
  'vision': {
    id: 'vision',
    name: 'Vision',
    callsign: 'VISION',
    role: 'Org Knowledge Mesh',
    avatar: '💎',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.6)',
    power: 'laser',
    suit: 'vision-android',
    pos: { x: 250, y: 185 },
    targetPos: { x: 250, y: 185 },
    vx: 0, vy: 0,
    quote: '100% org knowledge synchronization achieved across the mesh.',
    spawned: true,
  },
  'black-widow': {
    id: 'black-widow',
    name: 'Natasha Romanoff',
    callsign: 'WIDOW',
    role: 'Security & CVE Recon',
    avatar: '🕷️',
    themeColor: '#C084FC',
    glowColor: 'rgba(192, 132, 252, 0.6)',
    power: 'laser',
    suit: 'widow-stealth',
    pos: { x: 195, y: 215 },
    targetPos: { x: 195, y: 215 },
    vx: 0, vy: 0,
    quote: 'Perimeter secure. API bearer keys sanitized in the enclave.',
    spawned: false,
  },
  'hawkeye': {
    id: 'hawkeye',
    name: 'Clint Barton',
    callsign: 'HAWKEYE',
    role: 'Unit Test Sniper',
    avatar: '🏹',
    themeColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.6)',
    power: 'arrow',
    suit: 'hawkeye-tactical',
    pos: { x: 300, y: 215 },
    targetPos: { x: 300, y: 215 },
    vx: 0, vy: 0,
    quote: 'Never missed a bug. 100% assertion accuracy achieved.',
    spawned: false,
  },
  'scarlet-witch': {
    id: 'scarlet-witch',
    name: 'Wanda Maximoff',
    callsign: 'SCARLET WITCH',
    role: 'Reality Refactoring',
    avatar: '🔴',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    power: 'chaos',
    suit: 'wanda-tiara',
    pos: { x: 140, y: 140 },
    targetPos: { x: 140, y: 140 },
    vx: 0, vy: 0,
    quote: 'I can rewrite the codebase into any reality I choose.',
    spawned: false,
  },
  'wolverine': {
    id: 'wolverine',
    name: 'Logan',
    callsign: 'WOLVERINE',
    role: 'Hardcore Stress Testing',
    avatar: '⚔️',
    themeColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    power: 'slash',
    suit: 'logan-suit',
    pos: { x: 280, y: 270 },
    targetPos: { x: 280, y: 270 },
    vx: 0, vy: 0,
    quote: 'I am the best at what I do, and what I do is stress-test code.',
    spawned: false,
  }
};

// Copy spawned characters into active roaming pool
for (const [k, v] of Object.entries(MARVEL_CATALOG)) {
  if (v.spawned) state.roamingAgents[k] = { ...v };
}

// ── DOM References ──────────────────────────────────────────────────
let canvas, ctx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer;

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

  initCanvas();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Battleworld live. All superheroes & villains patrolling sectors.');
  }, 1200);
});

// ── Canvas Setup & Cosmic Loop ──────────────────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(gameLoop);

  // Click on canvas to move nearest agent or attack!
  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.max(1, Math.min(canvas.width / 500, canvas.height / 320));
    const clickX = (e.clientX - rect.left) / scale;
    const clickY = (e.clientY - rect.top) / scale;

    // Check if clicked directly on an agent
    let clickedAgent = null;
    for (const agent of Object.values(state.roamingAgents)) {
      if (Math.hypot(agent.pos.x - clickX, agent.pos.y - clickY) < 18) {
        clickedAgent = agent;
        break;
      }
    }

    if (clickedAgent) {
      triggerAgentAttack(clickedAgent);
      showCosmicSpeechBubble(clickedAgent.id, clickedAgent.quote);
      appendVerboseStream(`● [${clickedAgent.callsign}] Executing signature ${clickedAgent.power} attack.`);
    } else {
      // Command nearest hero to move to location
      let nearest = null;
      let minD = Infinity;
      for (const agent of Object.values(state.roamingAgents)) {
        const d = Math.hypot(agent.pos.x - clickX, agent.pos.y - clickY);
        if (d < minD) { minD = d; nearest = agent; }
      }
      if (nearest) {
        nearest.targetPos = { x: clickX, y: clickY };
        showCosmicSpeechBubble(nearest.id, `Moving to coordinate (${Math.round(clickX)}, ${Math.round(clickY)})`);
      }
    }
  });
}

function initParticles() {
  for (let i = 0; i < 45; i++) {
    state.particles.push({
      x: Math.random() * 500,
      y: Math.random() * 320,
      size: Math.random() * 2.5 + 0.5,
      speedY: Math.random() * 0.4 + 0.1,
      color: ['#00F0FF', '#FF0055', '#FFC83B', '#10B981', '#A855F7'][Math.floor(Math.random() * 5)],
      opacity: Math.random() * 0.8 + 0.2,
    });
  }
}

function gameLoop(time) {
  updateAgents(time);
  renderBattlefield(time);
  requestAnimationFrame(gameLoop);
}

// ── Agent Roaming, Floating & Autonomous Patrols ────────────────────
function updateAgents(time) {
  for (const agent of Object.values(state.roamingAgents)) {
    // Autonomous floating / breathing
    if (agent.id === 'tony-stark' || agent.id === 'vision' || agent.id === 'doctor-strange') {
      agent.pos.y += Math.sin(time * 0.004 + agent.pos.x) * 0.3;
    }

    // Move toward target
    const dx = agent.targetPos.x - agent.pos.x;
    const dy = agent.targetPos.y - agent.pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 2) {
      agent.pos.x += (dx / dist) * 1.2;
      agent.pos.y += (dy / dist) * 1.2;
    } else {
      // Occasionally pick a new gentle patrol point
      if (Math.random() < 0.003) {
        agent.targetPos = {
          x: Math.max(50, Math.min(450, agent.pos.x + (Math.random() - 0.5) * 80)),
          y: Math.max(60, Math.min(280, agent.pos.y + (Math.random() - 0.5) * 60)),
        };
      }
    }

    // Autonomous sparring & attack sparks
    if (Math.random() < 0.002) {
      triggerAgentAttack(agent);
    }
  }

  // Update active attacks & particles
  state.activeAttacks = state.activeAttacks.filter(a => {
    a.life -= 0.03;
    return a.life > 0;
  });
}

// ── Canvas Rendering Engine ─────────────────────────────────────────
function renderBattlefield(time) {
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.max(1, Math.min(w / 500, h / 320));

  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.scale(scale, scale);

  // 1. Floating Quantum Energy Particles
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

  // 2. Render Active Combat Attacks (Lasers, Lightning, Runes, Webs)
  for (const a of state.activeAttacks) {
    renderAttackEffect(a, time);
  }

  // 3. Render All Active Roaming Heroes & Villains
  for (const agent of Object.values(state.roamingAgents)) {
    renderRealisticCharacter(agent, time);
  }

  ctx.restore();
}

// ── Render Realistic Character on Canvas ────────────────────────────
function renderRealisticCharacter(agent, time) {
  const x = agent.pos.x;
  const y = agent.pos.y;

  ctx.save();

  // Aura / Shadow
  ctx.fillStyle = agent.glowColor || 'rgba(0,240,255,0.3)';
  ctx.beginPath();
  ctx.arc(x, y + 10, 10, 0, Math.PI * 2);
  ctx.fill();

  switch (agent.suit) {
    case 'mark-85': // Iron Man
      // Red & Gold armor
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(x - 6, y - 16, 12, 9);
      ctx.fillStyle = '#FBBF24';
      ctx.fillRect(x - 5, y - 14, 10, 4);
      // Cyan Visor & Arc Reactor
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF'; ctx.shadowBlur = 6;
      ctx.fillRect(x - 4, y - 13, 3, 1.5);
      ctx.fillRect(x + 1, y - 13, 3, 1.5);
      ctx.fillStyle = '#B91C1C';
      ctx.fillRect(x - 8, y - 7, 16, 13);
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath(); ctx.arc(x, y - 1, 3, 0, Math.PI * 2); ctx.fill();
      // Repulsor Thrusters
      ctx.fillStyle = '#00F0FF';
      ctx.fillRect(x - 5, y + 8, 3, 4 + Math.sin(time * 0.02) * 2);
      ctx.fillRect(x + 2, y + 8, 3, 4 + Math.sin(time * 0.02) * 2);
      break;

    case 'doom-armor': // Doctor Doom
      // Emerald Hood & Titanium Mask
      ctx.fillStyle = '#065F46';
      ctx.fillRect(x - 8, y - 18, 16, 11);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(x - 5, y - 14, 10, 7);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x - 4, y - 12, 2, 2); ctx.fillRect(x + 2, y - 12, 2, 2);
      // Emerald Robe & Gold Clasp
      ctx.fillStyle = '#047857';
      ctx.fillRect(x - 9, y - 7, 18, 16);
      ctx.fillStyle = '#FBBF24'; ctx.fillRect(x - 5, y - 6, 10, 2);
      // Floating Green Runes
      ctx.strokeStyle = '#10B981'; ctx.shadowColor = '#10B981'; ctx.shadowBlur = 6;
      ctx.beginPath(); ctx.arc(x + 10, y - 5, 4, 0, Math.PI * 2); ctx.stroke();
      break;

    case 'thor-armor': // Thor (Mjolnir & Lightning)
      ctx.fillStyle = '#FDE047'; // Blonde hair
      ctx.fillRect(x - 6, y - 16, 12, 9);
      ctx.fillStyle = '#DC2626'; // Red cape
      ctx.fillRect(x - 9, y - 7, 18, 16);
      ctx.fillStyle = '#64748B'; // Armor
      ctx.fillRect(x - 7, y - 7, 14, 13);
      // Mjolnir Hammer with Spark
      ctx.fillStyle = '#94A3B8'; ctx.fillRect(x + 9, y - 4, 7, 5);
      ctx.fillStyle = '#78350F'; ctx.fillRect(x + 11, y + 1, 3, 7);
      ctx.strokeStyle = '#00D5E8'; ctx.shadowColor = '#00D5E8'; ctx.shadowBlur = 8;
      ctx.strokeRect(x + 8, y - 5, 9, 7);
      break;

    case 'thanos-gold': // Thanos
      ctx.fillStyle = '#8B5CF6'; ctx.fillRect(x - 8, y - 18, 16, 10);
      ctx.fillStyle = '#D97706'; ctx.fillRect(x - 8, y - 18, 16, 5); // Helmet
      ctx.fillStyle = '#B45309'; ctx.fillRect(x - 10, y - 8, 20, 15);
      // Golden Infinity Gauntlet
      ctx.fillStyle = '#FFC83B'; ctx.shadowColor = '#FFC83B'; ctx.shadowBlur = 8;
      ctx.fillRect(x - 15, y - 3, 5, 9);
      break;

    case 'kang-armor': // Kang
      ctx.fillStyle = '#581C87'; ctx.fillRect(x - 7, y - 17, 14, 10);
      ctx.fillStyle = '#38BDF8'; ctx.shadowColor = '#38BDF8'; ctx.shadowBlur = 6;
      ctx.fillRect(x - 5, y - 13, 10, 3);
      ctx.fillStyle = '#065F46'; ctx.fillRect(x - 8, y - 7, 16, 14);
      break;

    case 'cap-stealth': // Captain America
      ctx.fillStyle = '#1E40AF'; ctx.fillRect(x - 6, y - 16, 12, 9);
      ctx.fillStyle = '#1D4ED8'; ctx.fillRect(x - 7, y - 7, 14, 13);
      // Vibranium Round Shield
      ctx.fillStyle = '#DC2626'; ctx.beginPath(); ctx.arc(x - 10, y, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x - 10, y, 4.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#2563EB'; ctx.beginPath(); ctx.arc(x - 10, y, 2.5, 0, Math.PI * 2); ctx.fill();
      break;

    case 'spidey-nanotech': // Spider-Man
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 6, y - 15, 12, 9);
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(x - 5, y - 13, 3, 3); ctx.fillRect(x + 2, y - 13, 3, 3);
      ctx.fillStyle = '#2563EB'; ctx.fillRect(x - 7, y - 6, 14, 13);
      ctx.fillStyle = '#DC2626'; ctx.fillRect(x - 4, y - 6, 8, 13);
      break;

    case 'hulk-titan': // Hulk
      ctx.fillStyle = '#15803D'; ctx.fillRect(x - 10, y - 22, 20, 12);
      ctx.fillStyle = '#16A34A'; ctx.fillRect(x - 13, y - 10, 26, 18);
      ctx.fillStyle = '#7E22CE'; ctx.fillRect(x - 11, y + 8, 22, 9);
      break;

    default: // Custom / Generic Hero
      ctx.fillStyle = agent.themeColor || '#00F0FF';
      ctx.fillRect(x - 6, y - 14, 12, 18);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px sans-serif';
      ctx.fillText(agent.avatar || '🦸', x - 5, y);
      break;
  }

  // Name Tag under character
  ctx.fillStyle = 'rgba(13, 6, 32, 0.85)';
  ctx.fillRect(x - 22, y + 16, 44, 12);
  ctx.strokeStyle = agent.themeColor || '#00F0FF';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - 22, y + 16, 44, 12);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '8px "JetBrains Mono"';
  ctx.textAlign = 'center';
  ctx.fillText(agent.callsign || agent.name, x, y + 25);
  ctx.textAlign = 'start';

  ctx.restore();
}

// ── Combat Attack Effects ───────────────────────────────────────────
function triggerAgentAttack(agent) {
  let target = null;
  const others = Object.values(state.roamingAgents).filter(a => a.id !== agent.id);
  if (others.length > 0) {
    target = others[Math.floor(Math.random() * others.length)];
  }

  state.activeAttacks.push({
    from: { ...agent.pos },
    to: target ? { ...target.pos } : { x: agent.pos.x + (Math.random() - 0.5) * 100, y: agent.pos.y - 40 },
    type: agent.power,
    color: agent.themeColor,
    life: 1.0,
  });
}

function renderAttackEffect(attack, time) {
  ctx.save();
  ctx.globalAlpha = attack.life;

  if (attack.type === 'laser') {
    ctx.strokeStyle = attack.color;
    ctx.shadowColor = attack.color;
    ctx.shadowBlur = 12;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(attack.from.x, attack.from.y);
    ctx.lineTo(attack.to.x, attack.to.y);
    ctx.stroke();
  } else if (attack.type === 'thunder') {
    ctx.strokeStyle = '#00D5E8';
    ctx.shadowColor = '#00D5E8';
    ctx.shadowBlur = 16;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(attack.from.x, 20);
    ctx.lineTo((attack.from.x + attack.to.x) / 2, attack.to.y / 2);
    ctx.lineTo(attack.to.x, attack.to.y);
    ctx.stroke();
  } else if (attack.type === 'runes' || attack.type === 'mandala') {
    ctx.strokeStyle = attack.color;
    ctx.shadowColor = attack.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(attack.from.x, attack.from.y, 22 * (1.2 - attack.life), 0, Math.PI * 2);
    ctx.stroke();
  } else if (attack.type === 'gamma') {
    ctx.strokeStyle = '#22C55E';
    ctx.shadowColor = '#22C55E';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.ellipse(attack.from.x, attack.from.y + 10, 30 * (1.2 - attack.life), 12 * (1.2 - attack.life), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (attack.type === 'web') {
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(attack.from.x, attack.from.y);
    ctx.lineTo(attack.to.x, attack.to.y);
    ctx.stroke();
  }

  ctx.restore();
}

// ── Multiverse Clash Trigger (Epic All-Out Battle) ──────────────────
window.triggerMultiverseClash = function () {
  appendVerboseStream(`⚔️ [MULTIVERSE CLASH INITIATED] All heroes and villains unleashing full tactical power!`);
  showCosmicSpeechBubble('tony-stark', 'Avengers & Multiverse forces, engage full combat power!');

  for (const agent of Object.values(state.roamingAgents)) {
    triggerAgentAttack(agent);
  }
};

// ── Spawn Character Modal & Roster Selection ────────────────────────
window.openSpawnModal = function () {
  const grid = document.getElementById('spawnRosterGrid');
  grid.innerHTML = '';

  for (const [id, hero] of Object.entries(MARVEL_CATALOG)) {
    const isSpawned = Boolean(state.roamingAgents[id]);
    const card = document.createElement('div');
    card.className = 'roster-spawn-card';
    card.style.borderColor = isSpawned ? hero.themeColor : '#231445';

    card.innerHTML = `
      <div class="roster-avatar">${hero.avatar}</div>
      <div class="roster-name">${hero.name}</div>
      <div class="roster-callsign">[${hero.callsign}]</div>
      <div style="font-size:9px; color:${isSpawned ? '#10B981' : '#8B78B0'}; font-weight:700;">
        ${isSpawned ? '● ACTIVE' : '➕ CLICK TO SPAWN'}
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
  const hero = MARVEL_CATALOG[heroId];
  if (!hero) return;

  state.roamingAgents[heroId] = {
    ...hero,
    pos: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 160 },
    targetPos: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 160 },
  };

  renderStrongholdDock();
  triggerAgentAttack(state.roamingAgents[heroId]);
  showCosmicSpeechBubble(heroId, hero.quote);
  appendVerboseStream(`⚡ [SPAWNED] ${hero.name} (${hero.callsign}) entered the Battleworld!`);
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
    avatar,
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.6)',
    power,
    suit: 'custom',
    pos: { x: 250 + (Math.random() - 0.5) * 100, y: 180 },
    targetPos: { x: 250, y: 180 },
    quote: directive || `Agent ${name} operational. Ready for directives.`,
    spawned: true,
  };

  MARVEL_CATALOG[heroId] = newHero;
  state.roamingAgents[heroId] = newHero;

  try {
    await fetch('/api/heroes/custom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, callsign, role, avatar, harness, superpower: power, systemPrompt: directive }),
    });
  } catch {}

  renderStrongholdDock();
  closeModals();
  triggerAgentAttack(newHero);
  showCosmicSpeechBubble(heroId, newHero.quote);
  appendVerboseStream(`🚀 [CUSTOM HERO FORGED] ${name} (${callsign}) has entered the Multiverse!`);
};

// ── Speech Bubble Rendering ─────────────────────────────────────────
function showCosmicSpeechBubble(entityId, text, durationMs = 6000) {
  const entity = state.roamingAgents[entityId] || MARVEL_CATALOG[entityId];
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
      <div class="stronghold-icon">${entity.avatar}</div>
      <div class="stronghold-info">
        <div class="stronghold-top">
          <span class="stronghold-name">${entity.name.split(' ')[0]}</span>
          <span class="stronghold-callsign">${entity.callsign}</span>
        </div>
        <div class="stronghold-sub">${entity.role}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      triggerAgentAttack(entity);
      showCosmicSpeechBubble(entity.id, entity.quote);
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
        if (state.roamingAgents[speaker] || MARVEL_CATALOG[speaker]) {
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
