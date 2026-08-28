/**
 * ══════════════════════════════════════════════════════════════════════
 * SCAVENGERS // LIVING OFFICE FLOOR & STARK COMMAND CENTER (docs/warroom.js)
 * ══════════════════════════════════════════════════════════════════════
 */

// ── State Management ────────────────────────────────────────────────
const state = {
  ws: null,
  heroes: [],
  activeDirectives: [],
  telemetryLogs: [],
  arcReactorPowerPct: 99.8,
  tokensConsumed: 0,
  activeMissionId: null,
};

// ── Hero Configuration & Sprite Metadata ────────────────────────────
const HERO_SPRITES = {
  'tony-stark': {
    id: 'tony-stark',
    name: 'TONY',
    callsign: 'GOD',
    avatar: '🦾',
    harness: 'claudeTerminalHarness',
    color: '#FF2A4D',
    border: '#FFC83B',
    bgColor: '#FFF5EB',
    tagColor: '#2563EB',
    defaultPos: { x: 96, y: 150 },
    deskPos: { x: 96, y: 150 },
    currentPos: { x: 96, y: 150 },
    targetPos: { x: 96, y: 150 },
    facing: 'down',
    state: 'working',
    clothesColor: '#1E293B',
    hairColor: '#451A03',
  },
  'captain-america': {
    id: 'captain-america',
    name: 'CAP',
    callsign: 'QA',
    avatar: '🛡️',
    harness: 'geminiProHarness',
    color: '#3B82F6',
    border: '#3B82F6',
    bgColor: '#EFF6FF',
    tagColor: '#2563EB',
    defaultPos: { x: 236, y: 530 },
    deskPos: { x: 236, y: 530 },
    currentPos: { x: 236, y: 530 },
    targetPos: { x: 236, y: 530 },
    facing: 'up',
    state: 'idle',
    clothesColor: '#2563EB',
    hairColor: '#FDE047',
  },
  'hulk': {
    id: 'hulk',
    name: 'HULK',
    callsign: 'AST',
    avatar: '🟢',
    harness: 'ollamaDeepSeekHarness',
    color: '#22C55E',
    border: '#22C55E',
    bgColor: '#F0FDF4',
    tagColor: '#16A34A',
    defaultPos: { x: 130, y: 390 },
    deskPos: { x: 130, y: 390 },
    currentPos: { x: 130, y: 390 },
    targetPos: { x: 130, y: 390 },
    facing: 'down',
    state: 'idle',
    clothesColor: '#16A34A',
    hairColor: '#14532D',
  },
  'black-widow': {
    id: 'black-widow',
    name: 'WIDOW',
    callsign: 'SEC',
    avatar: '🕷️',
    harness: 'openaiGpt4oHarness',
    color: '#A855F7',
    border: '#A855F7',
    bgColor: '#FAF5FF',
    tagColor: '#9333EA',
    defaultPos: { x: 184, y: 390 },
    deskPos: { x: 184, y: 390 },
    currentPos: { x: 184, y: 390 },
    targetPos: { x: 184, y: 390 },
    facing: 'down',
    state: 'idle',
    clothesColor: '#18181B',
    hairColor: '#DC2626',
  },
  'thor': {
    id: 'thor',
    name: 'THOR',
    callsign: 'OPS',
    avatar: '⚡',
    harness: 'xaiGrokHarness',
    color: '#00D5E8',
    border: '#00D5E8',
    bgColor: '#ECFEFF',
    tagColor: '#0284C7',
    defaultPos: { x: 236, y: 200 },
    deskPos: { x: 236, y: 200 },
    currentPos: { x: 236, y: 200 },
    targetPos: { x: 236, y: 200 },
    facing: 'down',
    state: 'idle',
    clothesColor: '#475569',
    hairColor: '#FDE047',
  },
  'hawkeye': {
    id: 'hawkeye',
    name: 'HAWKEYE',
    callsign: 'TEST',
    avatar: '🏹',
    harness: 'geminiFlashHarness',
    color: '#F59E0B',
    border: '#F59E0B',
    bgColor: '#FFFBEB',
    tagColor: '#D97706',
    defaultPos: { x: 290, y: 200 },
    deskPos: { x: 290, y: 200 },
    currentPos: { x: 290, y: 200 },
    targetPos: { x: 290, y: 200 },
    facing: 'down',
    state: 'idle',
    clothesColor: '#581C87',
    hairColor: '#78350F',
  },
  'spider-man': {
    id: 'spider-man',
    name: 'SPIDEY',
    callsign: 'UI',
    avatar: '🕸️',
    harness: 'claudeTerminalHarness',
    color: '#EF4444',
    border: '#60A5FA',
    bgColor: '#EFF6FF',
    tagColor: '#2563EB',
    defaultPos: { x: 76, y: 390 },
    deskPos: { x: 76, y: 390 },
    currentPos: { x: 76, y: 390 },
    targetPos: { x: 76, y: 390 },
    facing: 'down',
    state: 'idle',
    clothesColor: '#EF4444',
    hairColor: '#78350F',
  },
  'doctor-strange': {
    id: 'doctor-strange',
    name: 'STRANGE',
    callsign: 'TIME',
    avatar: '🔮',
    harness: 'geminiFlashHarness',
    color: '#8B5CF6',
    border: '#8B5CF6',
    bgColor: '#F5F3FF',
    tagColor: '#7C3AED',
    defaultPos: { x: 76, y: 530 },
    deskPos: { x: 76, y: 530 },
    currentPos: { x: 76, y: 530 },
    targetPos: { x: 76, y: 530 },
    facing: 'up',
    state: 'idle',
    clothesColor: '#1E40AF',
    hairColor: '#172554',
  },
  'vision': {
    id: 'vision',
    name: 'VISION',
    callsign: 'MIND',
    avatar: '💎',
    harness: 'geminiProHarness',
    color: '#10B981',
    border: '#10B981',
    bgColor: '#ECFDF5',
    tagColor: '#059669',
    defaultPos: { x: 316, y: 520 }, // Standing near coffee station
    deskPos: { x: 316, y: 520 },
    currentPos: { x: 316, y: 520 },
    targetPos: { x: 316, y: 520 },
    facing: 'left',
    state: 'refueling',
    clothesColor: '#047857',
    hairColor: '#E11D48',
  }
};

// ── DOM References ──────────────────────────────────────────────────
let canvas, ctx;
let terminalFeed, masterPromptInput, sendPromptBtn;
let bottomAgentDock, speechBubbleLayer;
let arcReactorCapacityLabel, ctxMetaLabel;

// ── Initialization ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('pixelOfficeCanvas');
  ctx = canvas.getContext('2d');
  
  terminalFeed = document.getElementById('terminalFeed');
  masterPromptInput = document.getElementById('masterPromptInput');
  sendPromptBtn = document.getElementById('sendPromptBtn');
  bottomAgentDock = document.getElementById('bottomAgentDock');
  speechBubbleLayer = document.getElementById('speechBubbleLayer');
  arcReactorCapacityLabel = document.getElementById('arcReactorCapacityLabel');
  ctxMetaLabel = document.getElementById('ctxMetaLabel');

  initCanvas();
  renderBottomDock();
  setupEventListeners();
  initWebSocket();
  fetchInitialStatus();
  
  // Show initial coffee break speech bubble
  setTimeout(() => {
    showSpeechBubble('vision', 'Refueling at the coffee machine.');
  }, 1000);
});

// ── Canvas Setup & Pixel Renderer ───────────────────────────────────
function initCanvas() {
  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }
  window.addEventListener('resize', resize);
  resize();
  requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
  updateHeroPositions();
  drawLivingOffice();
  requestAnimationFrame(gameLoop);
}

function updateHeroPositions() {
  for (const hero of Object.values(HERO_SPRITES)) {
    const dx = hero.targetPos.x - hero.currentPos.x;
    const dy = hero.targetPos.y - hero.currentPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 1.5) {
      hero.currentPos.x += (dx / dist) * 1.5;
      hero.currentPos.y += (dy / dist) * 1.5;
      hero.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    } else {
      hero.currentPos.x = hero.targetPos.x;
      hero.currentPos.y = hero.targetPos.y;
    }
  }
}

// ── Draw Office Layout Matching Screenshot ──────────────────────────
function drawLivingOffice() {
  const w = canvas.width;
  const h = canvas.height;
  const scale = Math.max(1, Math.min(w / 480, h / 360));

  ctx.save();
  ctx.scale(scale, scale);

  // 1. Base Green Floor with Grid
  ctx.fillStyle = '#8FA89D';
  ctx.fillRect(0, 0, w / scale, h / scale);

  ctx.strokeStyle = '#829A8F';
  ctx.lineWidth = 1;
  const tileSize = 20;
  for (let x = 0; x < w / scale; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h / scale);
    ctx.stroke();
  }
  for (let y = 0; y < h / scale; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w / scale, y);
    ctx.stroke();
  }

  // 2. Corner Plants
  drawPlant(10, 10);
  drawPlant(10, 290);
  drawPlant(105, 20);
  drawPlant(430, 20);

  // 3. Top-Left: Tony's Corner Office
  ctx.fillStyle = '#A9BBB2';
  ctx.fillRect(8, 8, 95, 100);
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(8, 8, 95, 100);

  // Office Desk & Laptop
  ctx.fillStyle = '#78350F';
  ctx.fillRect(30, 70, 36, 18);
  ctx.strokeRect(30, 70, 36, 18);

  ctx.fillStyle = '#00D5E8';
  ctx.fillRect(42, 73, 10, 8); // Screen

  // Calendar on Wall
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(18, 14, 16, 14);
  ctx.strokeRect(18, 14, 16, 14);
  ctx.fillStyle = '#EF4444';
  ctx.font = '6px "JetBrains Mono"';
  ctx.fillText('AUG', 21, 20);
  ctx.fillStyle = '#181320';
  ctx.fillText('28', 22, 26);

  // 4. Top-Center: Conference Room
  ctx.fillStyle = '#9CB0A6';
  ctx.fillRect(115, 8, 200, 70);
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(115, 8, 200, 70);

  // Conference Table
  ctx.fillStyle = '#854D0E';
  ctx.fillRect(165, 28, 90, 26);
  ctx.strokeRect(165, 28, 90, 26);

  // Purple Conference Chairs
  ctx.fillStyle = '#7E22CE';
  [175, 205, 235].forEach((cx) => {
    ctx.fillRect(cx, 22, 10, 5); // top row
    ctx.fillRect(cx, 55, 10, 5); // bottom row
  });

  // Whiteboard
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(268, 28, 14, 26);
  ctx.strokeRect(268, 28, 14, 26);

  // 5. Bottom-Right: Kitchenette & Coffee Station
  ctx.fillStyle = '#CBD5E1';
  ctx.fillRect(350, 240, 120, 110);
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(350, 240, 120, 110);

  // Counter
  ctx.fillStyle = '#94A3B8';
  ctx.fillRect(360, 265, 80, 18);
  ctx.strokeRect(360, 265, 80, 18);

  // Coffee Maker
  ctx.fillStyle = '#18181B';
  ctx.fillRect(370, 258, 10, 9);

  // Water Cooler (Blue)
  ctx.fillStyle = '#38BDF8';
  ctx.fillRect(420, 254, 12, 16);
  ctx.strokeRect(420, 254, 12, 16);

  // 6. Bullpen Desks with CRT Monitors
  // Top Row Desks
  drawBullpenDesk(225, 80);
  drawBullpenDesk(280, 80);

  // Middle Row Desks
  drawBullpenDesk(65, 180);
  drawBullpenDesk(120, 180);
  drawBullpenDesk(175, 180);
  drawBullpenDesk(230, 180);
  drawBullpenDesk(280, 180);

  // Bottom Row Desks
  drawBullpenDesk(65, 240);
  drawBullpenDesk(120, 240);
  drawBullpenDesk(175, 240);
  drawBullpenDesk(230, 240);
  drawBullpenDesk(280, 240);

  // 7. Render All Hero Pixel Sprites
  for (const hero of Object.values(HERO_SPRITES)) {
    drawPixelHero(hero);
  }

  ctx.restore();
}

function drawPlant(x, y) {
  ctx.fillStyle = '#14532D';
  ctx.beginPath();
  ctx.arc(x + 7, y + 7, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBullpenDesk(x, y) {
  ctx.fillStyle = '#D97706';
  ctx.fillRect(x, y, 26, 18);
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, 26, 18);

  // Blue CRT Monitor
  ctx.fillStyle = '#0284C7';
  ctx.fillRect(x + 8, y + 4, 10, 7);
  ctx.strokeStyle = '#2A2433';
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 8, y + 4, 10, 7);
}

// ── Draw 16x16 Pixel Art Hero Character ─────────────────────────────
function drawPixelHero(hero) {
  const x = hero.currentPos.x;
  const y = hero.currentPos.y;

  // Head (Skin tone)
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(x - 5, y - 12, 10, 8);

  // Hair
  ctx.fillStyle = hero.hairColor || '#78350F';
  ctx.fillRect(x - 5, y - 14, 10, 4);

  // Eyes (based on facing)
  ctx.fillStyle = '#181320';
  if (hero.facing === 'down') {
    ctx.fillRect(x - 3, y - 8, 2, 2);
    ctx.fillRect(x + 1, y - 8, 2, 2);
  } else if (hero.facing === 'left') {
    ctx.fillRect(x - 4, y - 8, 2, 2);
  } else if (hero.facing === 'right') {
    ctx.fillRect(x + 2, y - 8, 2, 2);
  }

  // Torso / Suit
  ctx.fillStyle = hero.clothesColor || '#2563EB';
  ctx.fillRect(x - 6, y - 4, 12, 10);

  // Arms / Hands
  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(x - 8, y - 2, 2, 6);
  ctx.fillRect(x + 6, y - 2, 2, 6);

  // Legs
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(x - 4, y + 6, 3, 5);
  ctx.fillRect(x + 1, y + 6, 3, 5);

  // Status Indicator Dot over head if working
  if (hero.state === 'working') {
    ctx.fillStyle = '#22C55E';
    ctx.beginPath();
    ctx.arc(x, y - 18, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ── Speech Bubble Rendering ─────────────────────────────────────────
function showSpeechBubble(heroId, text, durationMs = 6000) {
  const hero = HERO_SPRITES[heroId];
  if (!hero) return;

  const existing = document.getElementById(`bubble-${heroId}`);
  if (existing) existing.remove();

  const bubble = document.createElement('div');
  bubble.id = `bubble-${heroId}`;
  bubble.className = 'office-speech-bubble';

  // Calculate screen coordinates based on canvas scale
  const rect = canvas.getBoundingClientRect();
  const scale = Math.max(1, Math.min(canvas.width / 480, canvas.height / 360));
  const screenX = hero.currentPos.x * scale;
  const screenY = hero.currentPos.y * scale;

  bubble.style.left = `${screenX}px`;
  bubble.style.top = `${screenY}px`;

  bubble.innerHTML = `
    <span class="bubble-hero-name">${hero.name}</span>
    ${escapeHtml(text)}
  `;

  speechBubbleLayer.appendChild(bubble);

  setTimeout(() => {
    if (bubble.parentElement) bubble.remove();
  }, durationMs);
}

// ── Bottom Agent Cards Dock ─────────────────────────────────────────
function renderBottomDock() {
  bottomAgentDock.innerHTML = '';

  for (const hero of Object.values(HERO_SPRITES)) {
    const card = document.createElement('div');
    card.className = 'dock-hero-card';
    card.id = `dock-card-${hero.id}`;
    card.style.setProperty('--card-border', hero.border);
    card.style.setProperty('--card-bg', hero.bgColor);
    card.style.setProperty('--card-color', hero.tagColor);

    card.innerHTML = `
      <div class="dock-hero-avatar">${hero.avatar}</div>
      <div class="dock-hero-info">
        <div class="dock-hero-top">
          <span class="dock-hero-name">${hero.name}</span>
          <span class="dock-hero-tag">${hero.callsign}</span>
          <span class="pill-dot ${hero.state === 'working' ? 'green' : 'green'}" id="dock-dot-${hero.id}"></span>
          <span style="font-size:8px; color:#5B5166;">${hero.state}</span>
        </div>
        <div class="dock-hero-sub">${hero.harness}</div>
      </div>
    `;

    card.addEventListener('click', () => {
      showSpeechBubble(hero.id, `Agent ${hero.name} ready for duty.`);
      appendTerminalFeed(`● [${hero.name}] Telemetry synchronized.`);
    });

    bottomAgentDock.appendChild(card);
  }
}

// ── Terminal Feed Stream ────────────────────────────────────────────
function appendTerminalFeed(text, bulletColor = 'blue') {
  const line = document.createElement('div');
  line.className = 'feed-line';

  // Format tags like [TONY], [SPIDEY], etc.
  const tagMatch = text.match(/^●?\s*\[([a-zA-Z0-9_\-\s]+)\]/);
  if (tagMatch) {
    const tagName = tagMatch[1];
    const rest = text.replace(/^●?\s*\[([a-zA-Z0-9_\-\s]+)\]\s*/, '');
    line.innerHTML = `<span class="bullet ${bulletColor}">●</span> <span class="feed-tag">[${escapeHtml(tagName)}]</span> ${escapeHtml(rest)}`;
  } else {
    line.innerHTML = `<span class="bullet ${bulletColor}">●</span> ${escapeHtml(text)}`;
  }

  terminalFeed.appendChild(line);
  terminalFeed.scrollTop = terminalFeed.scrollHeight;
}

function appendDeliverableCard(markdownContent, workspacePath) {
  const card = document.createElement('div');
  card.className = 'deliverable-card';

  let html = `<h2>🦾 Mission Completed // Code Written to Disk</h2>`;
  if (workspacePath) {
    html += `<p style="font-size:11px; margin-bottom:8px;">📁 <strong>Workspace:</strong> <code>${escapeHtml(workspacePath)}</code></p>`;
  }

  // Parse simple code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_\-\.]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  let parsed = '';

  while ((match = codeBlockRegex.exec(markdownContent)) !== null) {
    const lang = match[1] || 'text';
    const code = match[2];
    parsed += escapeHtml(markdownContent.substring(lastIndex, match.index));
    parsed += `<pre><code>${escapeHtml(code)}</code><button class="copy-btn" onclick="navigator.clipboard.writeText(\`${code.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`); this.innerText='Copied!';">Copy</button></pre>`;
    lastIndex = match.index + match[0].length;
  }
  parsed += escapeHtml(markdownContent.substring(lastIndex));

  card.innerHTML = html + `<div style="font-size:11px; line-height:1.5;">${parsed.replace(/\n/g, '<br/>')}</div>`;
  terminalFeed.appendChild(card);
  terminalFeed.scrollTop = terminalFeed.scrollHeight;
}

// ── Mission Launch & User Interaction ───────────────────────────────
function setupEventListeners() {
  // Tab Switching
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach((c) => (c.style.display = 'none'));

      btn.classList.add('active');
      const tabId = `${btn.dataset.tab}Tab`;
      const target = document.getElementById(tabId);
      if (target) target.style.display = 'flex';
    });
  });

  // Enter to send in Master Prompt
  masterPromptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      dispatchMasterPrompt();
    }
  });

  sendPromptBtn.addEventListener('click', dispatchMasterPrompt);
}

async function dispatchMasterPrompt() {
  const prompt = masterPromptInput.value.trim();
  if (!prompt) return;

  masterPromptInput.value = '';
  appendTerminalFeed(`● [USER] ${prompt}`, 'gold');
  appendTerminalFeed(`● [TONY] Received directive: "${prompt}". Assembling strike team...`, 'blue');

  // Move heroes to conference table & desks
  HERO_SPRITES['tony-stark'].state = 'working';
  HERO_SPRITES['spider-man'].targetPos = { x: 180, y: 55 }; // Walk to conference
  HERO_SPRITES['hulk'].targetPos = { x: 210, y: 55 };
  HERO_SPRITES['captain-america'].targetPos = { x: 240, y: 55 };

  showSpeechBubble('tony-stark', 'Deconstructing directives for the strike team.');

  try {
    const res = await fetch('/api/mission/launch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) {
      const err = await res.text();
      appendTerminalFeed(`● [ERROR] Mission dispatch failed: ${err}`, 'purple');
      return;
    }

    const data = await res.json();
    if (data.success) {
      appendDeliverableCard(data.summary, data.workspacePath);
    }
  } catch (err) {
    appendTerminalFeed(`● [ERROR] Network failure: ${err.message}`, 'purple');
  } finally {
    // Return heroes to their desks
    for (const hero of Object.values(HERO_SPRITES)) {
      hero.targetPos = { ...hero.deskPos };
      hero.state = 'idle';
    }
    renderBottomDock();
  }
}

// ── WebSocket Integration ───────────────────────────────────────────
function initWebSocket() {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}`;

  state.ws = new WebSocket(wsUrl);

  state.ws.onopen = () => {
    console.log('⚡ Connected to Stark Comms Network WebSocket');
  };

  state.ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleWebSocketMessage(msg);
    } catch {}
  };

  state.ws.onclose = () => {
    setTimeout(initWebSocket, 2000);
  };
}

function handleWebSocketMessage(msg) {
  if (msg.type === 'comms_message' && msg.data?.content) {
    appendTerminalFeed(msg.data.content, 'blue');
    
    // Trigger speech bubbles for speaking hero
    const speakerId = msg.data.from;
    if (HERO_SPRITES[speakerId]) {
      showSpeechBubble(speakerId, msg.data.content.replace(/^\[[^\]]+\]\s*/, '').slice(0, 60));
    }
  } else if (msg.type === 'directive_started') {
    const heroId = msg.data?.assignedHero;
    if (HERO_SPRITES[heroId]) {
      HERO_SPRITES[heroId].state = 'working';
      renderBottomDock();
    }
    appendTerminalFeed(`● [${(heroId || 'HERO').toUpperCase()}] Writing source code for "${msg.data?.title}"...`, 'green');
  } else if (msg.type === 'directive_completed') {
    const heroId = msg.data?.assignedHero || msg.data?.heroId;
    if (HERO_SPRITES[heroId]) {
      HERO_SPRITES[heroId].state = 'idle';
      renderBottomDock();
    }
  }
}

// ── Status Polling ──────────────────────────────────────────────────
async function fetchInitialStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    if (data.arcReactor) {
      const pct = data.arcReactor.totalPowerRemainingPct || 99.8;
      if (arcReactorCapacityLabel) {
        arcReactorCapacityLabel.innerText = `Arc Reactor: ${pct.toFixed(1)}% Online`;
      }
    }
  } catch {}
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
