/**
 * STARKNET / AVENGERS ASSEMBLE — Mission Control HUD Logic & Web Audio Synthesizer
 */

class StarkHUD {
  constructor() {
    this.ws = null;
    this.audioEnabled = true;
    this.audioCtx = null;
    this.heroes = [];
    this.activeMission = null;
    this.arcReactor = null;

    this.initElements();
    this.initAudio();
    this.initWebSocket();
    this.bindEvents();
    this.fetchInitialState();
  }

  initElements() {
    this.promptInput = document.getElementById('missionPromptInput');
    this.assembleBtn = document.getElementById('assembleBtn');
    this.heroGrid = document.getElementById('heroCardsGrid');
    this.commsFeed = document.getElementById('commsFeed');
    this.directivesList = document.getElementById('directivesList');
    this.arcPowerPct = document.getElementById('arcPowerPct');
    this.powerStatusBadge = document.getElementById('powerStatusBadge');
    this.consumedVal = document.getElementById('consumedVal');
    this.totalCapVal = document.getElementById('totalCapVal');
    this.providerBars = document.getElementById('providerBars');
    this.missionStatusBadge = document.getElementById('missionStatusBadge');
    this.soundToggleBtn = document.getElementById('soundToggleBtn');
    this.soundStatus = document.getElementById('soundStatus');
  }

  initAudio() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    } catch (e) {
      console.warn('Web Audio not supported');
    }
  }

  playSFX(type) {
    if (!this.audioEnabled || !this.audioCtx) return;
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;

    if (type === 'repulsor') {
      // Iron Man Repulsor blast / charge
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'chime') {
      // JARVIS telemetry chime
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'shield') {
      // Captain America Vibranium shield clang
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  }

  bindEvents() {
    this.assembleBtn.addEventListener('click', () => this.launchMission());
    this.promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.launchMission();
    });

    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const prompt = e.target.getAttribute('data-prompt');
        this.promptInput.value = prompt;
        this.launchMission();
      });
    });

    // Sound toggle
    this.soundToggleBtn.addEventListener('click', () => {
      this.audioEnabled = !this.audioEnabled;
      this.soundStatus.textContent = this.audioEnabled ? 'ON' : 'OFF';
      if (this.audioEnabled) this.playSFX('chime');
    });
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[STARK HUD] Connected to Stark Tower telemetry WebSocket.');
        document.getElementById('systemStatusText').textContent = 'ORCHESTRATOR: ONLINE';
      };

      this.ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          this.handleSocketEvent(type, data);
        } catch (err) {
          console.error('[STARK HUD] Error parsing WS payload', err);
        }
      };

      this.ws.onclose = () => {
        document.getElementById('systemStatusText').textContent = 'TELEMETRY: RECONNECTING...';
        setTimeout(() => this.initWebSocket(), 3000);
      };
    } catch (e) {
      console.warn('[STARK HUD] WebSocket error, fallback to REST polling');
    }
  }

  async fetchInitialState() {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        if (data.heroes) this.renderHeroes(data.heroes);
        if (data.arcReactor) this.renderArcReactor(data.arcReactor);
        if (data.activeMission) this.renderMission(data.activeMission);
      }
    } catch (err) {
      console.warn('[STARK HUD] Could not fetch initial REST state', err);
    }
  }

  handleSocketEvent(type, data) {
    if (type === 'initial_state') {
      if (data.heroes) this.renderHeroes(data.heroes);
      if (data.arcReactor) this.renderArcReactor(data.arcReactor);
      if (data.activeMission) this.renderMission(data.activeMission);
    } else if (type === 'comms_message') {
      this.addCommsMessage(data);
      if (data.fromHero === 'tony-stark') this.playSFX('repulsor');
      else if (data.fromHero === 'captain-america') this.playSFX('shield');
      else this.playSFX('chime');
    } else if (type === 'mission_started' || type === 'mission_updated' || type === 'mission_completed') {
      this.renderMission(data);
    } else if (type === 'arc_reactor_update') {
      this.renderArcReactor(data);
    }
  }

  async launchMission() {
    const prompt = this.promptInput.value.trim();
    if (!prompt) return;

    this.playSFX('repulsor');
    this.missionStatusBadge.textContent = 'ASSEMBLING';
    this.missionStatusBadge.className = 'badge red';

    try {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'launch_mission', prompt }));
      } else {
        await fetch('/api/mission/launch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
        });
      }
    } catch (err) {
      console.error('[STARK HUD] Failed to launch mission', err);
    }
  }

  renderHeroes(heroes) {
    this.heroes = heroes;
    this.heroGrid.innerHTML = heroes
      .map(
        (h) => `
      <div class="hero-card hero-${h.profile.id}">
        <div class="hero-top">
          <div class="hero-avatar">${h.profile.avatar}</div>
          <div class="hero-meta">
            <h4>${h.profile.name}</h4>
            <span class="hero-callsign">${h.profile.callsign}</span>
          </div>
        </div>
        <p class="hero-desc">${h.profile.role}</p>
        <div class="hero-quote">"${h.profile.catchphrase}"</div>
        <div class="hero-status-row">
          <span>Status: <strong style="color:${this.getStatusColor(h.status)}">${h.status.toUpperCase()}</strong></span>
          <span>Power: <strong class="green">${h.metrics.powerLevelPct}%</strong></span>
        </div>
      </div>
    `
      )
      .join('');
  }

  getStatusColor(status) {
    switch (status) {
      case 'analyzing':
      case 'executing':
        return '#00F0FF';
      case 'reviewing':
        return '#FFC107';
      case 'victorious':
        return '#28C840';
      case 'smashed':
        return '#28C840';
      case 'failed':
        return '#FF2A4D';
      default:
        return '#63728F';
    }
  }

  renderArcReactor(state) {
    this.arcReactor = state;
    this.arcPowerPct.textContent = `${state.hourlyPowerLevelPct}%`;
    this.totalCapVal.textContent = state.totalCapacityPerHour.toLocaleString();
    this.consumedVal.textContent = state.currentConsumption.toLocaleString();

    if (state.isThrottled) {
      this.powerStatusBadge.textContent = 'THROTTLED';
      this.powerStatusBadge.className = 'badge red';
    } else {
      this.powerStatusBadge.textContent = `OPTIMAL (${state.hourlyPowerLevelPct}%)`;
      this.powerStatusBadge.className = 'badge green';
    }

    const providers = state.providerStatus || {};
    this.providerBars.innerHTML = Object.entries(providers)
      .filter(([_, p]) => p.enabled)
      .map(
        ([name, p]) => `
      <div class="provider-bar-row">
        <div class="p-label-row">
          <span>${name.toUpperCase()}</span>
          <span>${p.powerRemainingPct}% (${p.usedInCurrentWindow.toLocaleString()} / ${p.hourlyLimit.toLocaleString()} tok)</span>
        </div>
        <div class="p-bar-track">
          <div class="p-bar-fill" style="width: ${p.powerRemainingPct}%"></div>
        </div>
      </div>
    `
      )
      .join('');
  }

  renderMission(mission) {
    this.activeMission = mission;
    this.missionStatusBadge.textContent = (mission.status || 'STANDBY').toUpperCase();
    this.missionStatusBadge.className =
      mission.status === 'success' ? 'badge green' : mission.status === 'in-flight' ? 'badge cyan' : 'badge yellow';

    if (!mission.directives || mission.directives.length === 0) {
      this.directivesList.innerHTML = `
        <div class="directive-placeholder">
          <p>⚡ Directives synthesizing in Tony Stark's architecture matrix...</p>
        </div>
      `;
      return;
    }

    this.directivesList.innerHTML = mission.directives
      .map(
        (d) => `
      <div class="directive-item">
        <div class="directive-top">
          <span class="directive-title">${d.title}</span>
          <span class="badge ${d.status === 'completed' ? 'green' : d.status === 'in-progress' ? 'cyan' : 'yellow'}">
            ${d.status.toUpperCase()}
          </span>
        </div>
        <div class="directive-hero">Assigned Hero: ${d.assignedHero.toUpperCase()} | Priority: ${d.priority.toUpperCase()}</div>
      </div>
    `
      )
      .join('');
  }

  addCommsMessage(msg) {
    const item = document.createElement('div');
    item.className = `comms-item ${msg.fromHero === 'system' ? 'system' : `hero-${msg.fromHero}`}`;
    const timeStr = new Date(msg.timestamp).toLocaleTimeString();

    item.innerHTML = `
      <span class="comms-time">[${timeStr}]</span>
      <span class="comms-author">[${msg.fromHero.toUpperCase()}]</span>
      <span class="comms-msg">${msg.content}</span>
    `;

    this.commsFeed.appendChild(item);
    this.commsFeed.scrollTop = this.commsFeed.scrollHeight;
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.starkHUD = new StarkHUD();
});
