/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // MARVEL BATTLEWORLD & MULTIVERSE INCURSIONS (docs/warroom.js)
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  consoleMode: 'verbose', // 'verbose' | 'result'
  particles: [],
  lightningFlashes: [],
  lakeRipples: [],
};

// ── Stronghold Entity Configurations ────────────────────────────────
const MARVEL_ENTITIES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'TONY STARK',
    callsign: 'IRON MAN',
    role: 'GOD ORCHESTRATOR',
    sector: 'Stark Holographic Citadel',
    avatar: '🦾',
    themeColor: '#00F0FF',
    glowColor: 'rgba(0, 240, 255, 0.5)',
    harness: 'StarkGodHarness (Gemini/Claude)',
    quote: 'JARVIS, decompose directives across the multiverse grid.',
    screenPos: { x: 0.50, y: 0.38 },
  },
  'doctor-doom': {
    id: 'doctor-doom',
    name: 'DOCTOR DOOM',
    callsign: 'VICTOR VON DOOM',
    role: 'LATVERIAN AST & COMPILER',
    sector: 'Latverian Spire',
    avatar: '👑',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    harness: 'LatverianASTEngine',
    quote: 'Doom commands the syntax trees. All code shall achieve absolute perfection.',
    screenPos: { x: 0.78, y: 0.60 },
  },
  'kang': {
    id: 'kang',
    name: 'KANG THE CONQUEROR',
    callsign: 'HE WHO REMAINS',
    role: 'QUANTUM TIMELINE BRANCHING',
    sector: 'Quantum Chrono-Nexus',
    avatar: '⏳',
    themeColor: '#38BDF8',
    glowColor: 'rgba(56, 189, 248, 0.5)',
    harness: 'QuantumTimelineEngine',
    quote: 'I have seen 14 billion timelines. Only this architecture survives.',
    screenPos: { x: 0.22, y: 0.55 },
  },
  'thanos': {
    id: 'thanos',
    name: 'THANOS',
    callsign: 'THE MAD TITAN',
    role: 'POWER & TOKEN BALANCER',
    sector: 'Sanctuary II Incursion',
    avatar: '🪐',
    themeColor: '#FFC83B',
    glowColor: 'rgba(255, 200, 59, 0.5)',
    harness: 'InfinityGauntletGrid',
    quote: 'Rate limits, memory, and compute — perfectly balanced, as all things should be.',
    screenPos: { x: 0.72, y: 0.25 },
  },
  'captain-america': {
    id: 'captain-america',
    name: 'STEVE ROGERS',
    callsign: 'CAPTAIN AMERICA',
    role: 'VIBRANIUM QA AUDITOR',
    sector: 'Wakandan Bastion',
    avatar: '🛡️',
    themeColor: '#3B82F6',
    glowColor: 'rgba(59, 130, 246, 0.5)',
    harness: 'VibraniumQAHarness',
    quote: 'I can review standards all day. Sound off, strike team.',
    screenPos: { x: 0.32, y: 0.80 },
  },
  'spider-man': {
    id: 'spider-man',
    name: 'PETER PARKER',
    callsign: 'SPIDER-MAN',
    role: 'FRONTEND ARCHITECT',
    sector: 'Web Vanguard Outpost',
    avatar: '🕸️',
    themeColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    harness: 'SpideyUIEngine',
    quote: 'Spun up reactive components with buttery 60 FPS animations!',
    screenPos: { x: 0.65, y: 0.82 },
  },
  'hulk': {
    id: 'hulk',
    name: 'BRUCE BANNER',
    callsign: 'THE HULK',
    role: 'GAMMA LOGIC OPTIMIZER',
    sector: 'Gamma Waste Crags',
    avatar: '🟢',
    themeColor: '#22C55E',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    harness: 'GammaLogicOptimizer',
    quote: 'HULK SMASH BOTTLENECKS AND ELIMINATE RECURSION LEAKS!',
    screenPos: { x: 0.48, y: 0.75 },
  },
  'thor': {
    id: 'thor',
    name: 'THOR ODINSON',
    callsign: 'GOD OF THUNDER',
    role: 'DEVOPS & PACKAGE MANIFEST',
    sector: 'Asgardian Storm Peak',
    avatar: '⚡',
    themeColor: '#00D5E8',
    glowColor: 'rgba(0, 213, 232, 0.5)',
    harness: 'MjolnirDeployPipeline',
    quote: 'By Mjolnir, forged high-voltage deployment pipelines and Swift packages!',
    screenPos: { x: 0.85, y: 0.35 },
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'STEPHEN STRANGE',
    callsign: 'SORCERER SUPREME',
    role: 'TEMPORAL MEMORY & RECALL',
    sector: 'Kamar-Taj Sanctum',
    avatar: '🔮',
    themeColor: '#A855F7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    harness: 'EyeOfAgamottoMemory',
    quote: 'Temporal snapshots preserved for instant multiverse rollback.',
    screenPos: { x: 0.15, y: 0.35 },
  },
  'vision': {
    id: 'vision',
    name: 'VISION',
    callsign: 'MIND STONE SYNAPSE',
    role: 'ORGANIZATIONAL KNOWLEDGE',
    sector: 'Mind Stone Matrix',
    avatar: '💎',
    themeColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.5)',
    harness: 'MindStoneMemoryMesh',
    quote: '100% org knowledge synchronization achieved across all mental nodes.',
    screenPos: { x: 0.50, y: 0.58 },
  }
};

// ── DOM References ──────────────────────────────────────────────────
let effectsCanvas, effectsCtx;
let verboseStreamFeed, resultDeliverableView;
let quantumPromptInput, dispatchMissionBtn;
let multiverseStrongholdDock, incursionSpeechLayer;

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

  initEffectsCanvas();
  renderStrongholdDock();
  setupEventListeners();
  initWebSocket();
  initCosmicParticles();

  // Show opening dramatic line
  setTimeout(() => {
    showCosmicSpeechBubble('tony-stark', 'Incursions detected across the valley. Strike team assembled.');
  }, 1000);
});

// ── Canvas Effects Loop ─────────────────────────────────────────────
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

function initCosmicParticles() {
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

  // 1. Draw Floating Energy Sparks
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

  // 2. Random Incursion Lightning Flashes in Sky
  if (Math.random() < 0.02) {
    drawLightningBranch(w * (0.2 + Math.random() * 0.6), 20, w * (0.2 + Math.random() * 0.6), h * 0.35);
  }

  // 3. Lake Center Shimmer Glow
  const lakeX = w * 0.50;
  const lakeY = h * 0.68;
  const shimmer = effectsCtx.createRadialGradient(lakeX, lakeY, 10, lakeX, lakeY, w * 0.25);
  shimmer.addColorStop(0, 'rgba(0, 240, 255, 0.12)');
  shimmer.addColorStop(0.5, 'rgba(168, 85, 247, 0.08)');
  shimmer.addColorStop(1, 'rgba(0, 0, 0, 0)');
  effectsCtx.fillStyle = shimmer;
  effectsCtx.fillRect(lakeX - w * 0.25, lakeY - h * 0.15, w * 0.5, h * 0.3);

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

// ── Interactive Entity Trigger ──────────────────────────────────────
window.triggerEntityComms = function (entityId) {
  const entity = MARVEL_ENTITIES[entityId];
  if (!entity) return;

  showCosmicSpeechBubble(entityId, entity.quote);
  appendVerboseStream(`● [${entity.callsign}] ${entity.role} operational in ${entity.sector}.`);
};

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

  const rect = effectsCanvas.getBoundingClientRect();
  const screenX = rect.width * entity.screenPos.x;
  const screenY = rect.height * entity.screenPos.y;

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
      triggerEntityComms(entity.id);
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
