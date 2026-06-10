/* ============================================================
   LifeReset66 — Focus Timer (Pomodoro-style)
   js/timer.js
   Depends on: window.Store, window.UI, window.XP
   ============================================================ */

window.Timer = (() => {
  /* ── Constants ─────────────────────────────────────────────── */
  const RING_CX = 125;
  const RING_CY = 125;
  const RING_R  = 110;
  const CIRCUMFERENCE = 2 * Math.PI * RING_R; // ≈ 691.15

  /* ── State ─────────────────────────────────────────────────── */
  const state = {
    isRunning: false,
    isPaused: false,
    currentDuration: 25 * 60,
    remainingTime: 25 * 60,
    intervalId: null,
    activePreset: 0, // index into PRESETS
  };

  /* ── Presets ───────────────────────────────────────────────── */
  const PRESETS = [
    { name: 'Focus',     duration: 25, icon: '🎯' },
    { name: 'Break',     duration: 5,  icon: '☕' },
    { name: 'Deep Work', duration: 50, icon: '🧠' },
  ];

  /* ── Helpers ───────────────────────────────────────────────── */
  function fmt(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function el(id) { return document.getElementById(id); }

  /* ── Render ────────────────────────────────────────────────── */
  function renderTimerPage() {
    const page = el('page-timer');
    if (!page) return;

    const stats = Store.getTimerStats();

    page.innerHTML = `
      <div class="timer-container">
        <!-- SVG Ring -->
        <div class="timer-ring-wrap" id="timer-ring-wrap">
          <svg class="timer-ring-svg" viewBox="0 0 250 250" width="250" height="250">
            <defs>
              <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stop-color="var(--accent-primary, #a855f7)" />
                <stop offset="100%" stop-color="var(--accent-secondary, #6366f1)" />
              </linearGradient>
              <filter id="ringGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <!-- Background circle -->
            <circle cx="${RING_CX}" cy="${RING_CY}" r="${RING_R}"
                    fill="none" stroke="var(--bg-tertiary, #2a2a3e)" stroke-width="8" />
            <!-- Progress circle -->
            <circle id="timer-progress-ring"
                    cx="${RING_CX}" cy="${RING_CY}" r="${RING_R}"
                    fill="none" stroke="url(#timerGrad)" stroke-width="8"
                    stroke-linecap="round"
                    stroke-dasharray="${CIRCUMFERENCE}"
                    stroke-dashoffset="0"
                    transform="rotate(-90 ${RING_CX} ${RING_CY})"
                    style="transition: stroke-dashoffset 0.4s ease;" />
          </svg>
          <!-- Time in center -->
          <div class="timer-time-display" id="timer-time-display">${fmt(state.remainingTime)}</div>
          <!-- Particle canvas -->
          <canvas id="timer-particles" class="timer-particles" width="250" height="250"></canvas>
        </div>

        <!-- Presets -->
        <div class="timer-presets" id="timer-presets">
          ${PRESETS.map((p, i) => `
            <button class="timer-preset-btn${i === state.activePreset ? ' active' : ''}"
                    data-index="${i}" id="timer-preset-${i}">
              <span class="preset-icon">${p.icon}</span>
              <span class="preset-label">${p.name}</span>
              <span class="preset-dur">${p.duration}m</span>
            </button>
          `).join('')}
        </div>

        <!-- Custom Duration -->
        <div class="timer-custom" id="timer-custom">
          <button class="timer-adj-btn" id="timer-minus" aria-label="Decrease duration">−</button>
          <input type="number" id="timer-custom-input" class="timer-custom-input"
                 min="1" max="120" value="${Math.round(state.currentDuration / 60)}" />
          <span class="timer-custom-unit">min</span>
          <button class="timer-adj-btn" id="timer-plus" aria-label="Increase duration">+</button>
        </div>

        <!-- Controls -->
        <div class="timer-controls" id="timer-controls">
          <button class="btn btn-primary timer-ctrl-btn" id="timer-start-btn">
            <span class="ctrl-icon">▶</span> Start
          </button>
          <button class="btn btn-secondary timer-ctrl-btn hidden" id="timer-pause-btn">
            <span class="ctrl-icon">⏸</span> Pause
          </button>
          <button class="btn btn-ghost timer-ctrl-btn hidden" id="timer-stop-btn">
            <span class="ctrl-icon">⏹</span> Reset
          </button>
        </div>

        <!-- Stats -->
        <div class="timer-stats">
          <div class="timer-stat" id="timer-stat-today">🎯 <span id="timer-sessions-today">${stats.totalSessions}</span> sessions today</div>
          <div class="timer-stat" id="timer-stat-total">Total: <span id="timer-total-sessions">${stats.totalSessions}</span> sessions · <span id="timer-total-minutes">${stats.totalMinutes}</span> min</div>
          <div class="timer-xp-indicator">+${typeof XP !== 'undefined' ? XP.TIMER_XP : 10} XP per session</div>
        </div>
      </div>
    `;

    bindEvents();
    updateDisplay();
  }

  /* ── Event Binding ─────────────────────────────────────────── */
  function bindEvents() {
    // Preset buttons
    const presetBtns = document.querySelectorAll('.timer-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (state.isRunning) return;
        const idx = parseInt(btn.dataset.index, 10);
        state.activePreset = idx;
        setDuration(PRESETS[idx].duration);
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const input = el('timer-custom-input');
        if (input) input.value = PRESETS[idx].duration;
      });
    });

    // +/- buttons
    const minus = el('timer-minus');
    const plus  = el('timer-plus');
    const input = el('timer-custom-input');

    if (minus) minus.addEventListener('click', () => {
      if (state.isRunning) return;
      const v = Math.max(1, parseInt(input.value, 10) - 1);
      input.value = v;
      deselectPresets();
      setDuration(v);
    });

    if (plus) plus.addEventListener('click', () => {
      if (state.isRunning) return;
      const v = Math.min(120, parseInt(input.value, 10) + 1);
      input.value = v;
      deselectPresets();
      setDuration(v);
    });

    if (input) input.addEventListener('change', () => {
      if (state.isRunning) return;
      let v = parseInt(input.value, 10);
      if (isNaN(v) || v < 1)   v = 1;
      if (v > 120) v = 120;
      input.value = v;
      deselectPresets();
      setDuration(v);
    });

    // Control buttons
    const startBtn = el('timer-start-btn');
    const pauseBtn = el('timer-pause-btn');
    const stopBtn  = el('timer-stop-btn');

    if (startBtn) startBtn.addEventListener('click', start);
    if (pauseBtn) pauseBtn.addEventListener('click', togglePause);
    if (stopBtn)  stopBtn.addEventListener('click', stop);
  }

  function deselectPresets() {
    state.activePreset = -1;
    document.querySelectorAll('.timer-preset-btn').forEach(b => b.classList.remove('active'));
  }

  /* ── Core Timer Logic ──────────────────────────────────────── */
  function start() {
    if (state.isRunning && !state.isPaused) return;
    state.isRunning = true;
    state.isPaused  = false;
    state.intervalId = setInterval(tick, 1000);

    // Button visibility
    toggleBtnVisibility(true);
    addRunningEffects();
    updateDisplay();
  }

  function togglePause() {
    if (!state.isRunning) return;
    state.isPaused = !state.isPaused;

    const pauseBtn = el('timer-pause-btn');
    const timeDisp = el('timer-time-display');

    if (state.isPaused) {
      clearInterval(state.intervalId);
      state.intervalId = null;
      if (pauseBtn) pauseBtn.innerHTML = '<span class="ctrl-icon">▶</span> Resume';
      if (timeDisp) timeDisp.classList.add('paused-pulse');
    } else {
      state.intervalId = setInterval(tick, 1000);
      if (pauseBtn) pauseBtn.innerHTML = '<span class="ctrl-icon">⏸</span> Pause';
      if (timeDisp) timeDisp.classList.remove('paused-pulse');
    }
  }

  function stop() {
    clearInterval(state.intervalId);
    state.intervalId  = null;
    state.isRunning   = false;
    state.isPaused    = false;
    state.remainingTime = state.currentDuration;

    toggleBtnVisibility(false);
    removeRunningEffects();

    const timeDisp = el('timer-time-display');
    if (timeDisp) timeDisp.classList.remove('paused-pulse');

    updateDisplay();
  }

  function tick() {
    if (state.isPaused) return;
    state.remainingTime--;
    updateDisplay();
    if (state.remainingTime <= 0) {
      complete();
    }
  }

  function complete() {
    clearInterval(state.intervalId);
    state.intervalId = null;
    state.isRunning  = false;
    state.isPaused   = false;

    const minutes = Math.round(state.currentDuration / 60);

    // Award XP
    if (typeof XP !== 'undefined' && XP.awardTimerXP) {
      XP.awardTimerXP();
    }

    // Record session
    Store.addTimerSession(minutes);

    // Celebration
    UI.showToast('⏱️ Session complete! Great focus!', 'success', 3000);
    UI.showXPToast(typeof XP !== 'undefined' ? XP.TIMER_XP : 10);

    // Particles
    spawnParticles();

    // Completion flash on ring
    const ringWrap = el('timer-ring-wrap');
    if (ringWrap) {
      ringWrap.classList.add('timer-complete-flash');
      setTimeout(() => ringWrap.classList.remove('timer-complete-flash'), 1200);
    }

    // Reset
    state.remainingTime = state.currentDuration;
    toggleBtnVisibility(false);
    removeRunningEffects();

    const timeDisp = el('timer-time-display');
    if (timeDisp) timeDisp.classList.remove('paused-pulse');

    updateDisplay();
    refreshStats();
  }

  /* ── Display ───────────────────────────────────────────────── */
  function setDuration(minutes) {
    if (state.isRunning) return;
    const secs = Math.max(60, Math.min(7200, minutes * 60));
    state.currentDuration = secs;
    state.remainingTime   = secs;
    updateDisplay();
  }

  function updateDisplay() {
    // Time text
    const timeDisp = el('timer-time-display');
    if (timeDisp) timeDisp.textContent = fmt(state.remainingTime);

    // Ring offset
    renderRing();
  }

  function renderRing() {
    const ring = el('timer-progress-ring');
    if (!ring) return;
    const progress = state.currentDuration > 0
      ? state.remainingTime / state.currentDuration
      : 1;
    const offset = CIRCUMFERENCE * (1 - progress);
    ring.style.strokeDashoffset = offset;
  }

  /* ── UI Helpers ────────────────────────────────────────────── */
  function toggleBtnVisibility(running) {
    const startBtn = el('timer-start-btn');
    const pauseBtn = el('timer-pause-btn');
    const stopBtn  = el('timer-stop-btn');
    if (running) {
      if (startBtn) startBtn.classList.add('hidden');
      if (pauseBtn) { pauseBtn.classList.remove('hidden'); pauseBtn.innerHTML = '<span class="ctrl-icon">⏸</span> Pause'; }
      if (stopBtn)  stopBtn.classList.remove('hidden');
    } else {
      if (startBtn) startBtn.classList.remove('hidden');
      if (pauseBtn) pauseBtn.classList.add('hidden');
      if (stopBtn)  stopBtn.classList.add('hidden');
    }
  }

  function addRunningEffects() {
    const wrap = el('timer-ring-wrap');
    if (wrap) wrap.classList.add('ring-running');
  }

  function removeRunningEffects() {
    const wrap = el('timer-ring-wrap');
    if (wrap) wrap.classList.remove('ring-running');
  }

  function refreshStats() {
    const stats = Store.getTimerStats();
    const todayEl   = el('timer-sessions-today');
    const totalEl   = el('timer-total-sessions');
    const minutesEl = el('timer-total-minutes');
    if (todayEl)   todayEl.textContent   = stats.totalSessions;
    if (totalEl)   totalEl.textContent   = stats.totalSessions;
    if (minutesEl) minutesEl.textContent = stats.totalMinutes;
  }

  /* ── Particles (completion burst) ──────────────────────────── */
  function spawnParticles() {
    const canvas = el('timer-particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;

    const colors = ['#a855f7', '#6366f1', '#f472b6', '#facc15', '#34d399'];
    const particles = [];

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.015 + Math.random() * 0.015,
      });
    }

    let rafId;
    function animate() {
      ctx.clearRect(0, 0, W, H);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.life -= p.decay;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (alive) {
        rafId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, W, H);
        cancelAnimationFrame(rafId);
      }
    }
    animate();
  }

  /* ── Inject scoped styles ──────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('timer-styles')) return;
    const style = document.createElement('style');
    style.id = 'timer-styles';
    style.textContent = `
      /* ---- Timer Container ---- */
      .timer-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
        padding: 2rem 1rem 3rem;
        max-width: 420px;
        margin: 0 auto;
      }

      /* ---- Ring Wrapper ---- */
      .timer-ring-wrap {
        position: relative;
        width: 250px;
        height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: filter 0.4s ease;
      }
      .timer-ring-wrap.ring-running {
        filter: drop-shadow(0 0 18px rgba(168, 85, 247, 0.45));
      }
      .timer-ring-wrap.timer-complete-flash {
        animation: completeFlash 1.2s ease;
      }
      @keyframes completeFlash {
        0%   { filter: drop-shadow(0 0 0 rgba(168,85,247,0)); }
        30%  { filter: drop-shadow(0 0 40px rgba(168,85,247,0.9)); }
        100% { filter: drop-shadow(0 0 0 rgba(168,85,247,0)); }
      }

      .timer-ring-svg {
        position: absolute;
        top: 0; left: 0;
      }

      .timer-particles {
        position: absolute;
        top: 0; left: 0;
        pointer-events: none;
      }

      /* ---- Time Display ---- */
      .timer-time-display {
        position: relative;
        z-index: 2;
        font-family: 'Orbitron', sans-serif;
        font-size: 2.8rem;
        font-weight: 700;
        color: var(--text-primary, #f1f1f1);
        letter-spacing: 0.04em;
        text-shadow: 0 0 20px rgba(168,85,247,0.3);
        user-select: none;
      }
      .timer-time-display.paused-pulse {
        animation: pausePulse 1.2s ease-in-out infinite;
      }
      @keyframes pausePulse {
        0%, 100% { opacity: 1; }
        50%      { opacity: 0.4; }
      }

      /* ---- Presets ---- */
      .timer-presets {
        display: flex;
        gap: 0.6rem;
        flex-wrap: wrap;
        justify-content: center;
      }
      .timer-preset-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.15rem;
        padding: 0.6rem 1rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 12px;
        background: var(--bg-secondary, #1e1e2e);
        color: var(--text-secondary, #a1a1b5);
        cursor: pointer;
        transition: all 0.25s ease;
        font-size: 0.82rem;
        min-width: 80px;
      }
      .timer-preset-btn:hover {
        border-color: var(--accent-primary, #a855f7);
        color: var(--text-primary, #f1f1f1);
        background: var(--bg-tertiary, #2a2a3e);
      }
      .timer-preset-btn.active {
        border-color: var(--accent-primary, #a855f7);
        background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.10));
        color: var(--text-primary, #f1f1f1);
        box-shadow: 0 0 12px rgba(168,85,247,0.25);
      }
      .preset-icon { font-size: 1.3rem; }
      .preset-label { font-weight: 600; }
      .preset-dur { font-size: 0.72rem; opacity: 0.7; }

      /* ---- Custom Duration ---- */
      .timer-custom {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .timer-adj-btn {
        width: 34px; height: 34px;
        border-radius: 50%;
        border: 1px solid var(--border-primary, #3a3a52);
        background: var(--bg-secondary, #1e1e2e);
        color: var(--text-primary, #f1f1f1);
        font-size: 1.2rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }
      .timer-adj-btn:hover {
        border-color: var(--accent-primary, #a855f7);
        background: var(--bg-tertiary, #2a2a3e);
      }
      .timer-custom-input {
        width: 56px;
        text-align: center;
        padding: 0.35rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 8px;
        background: var(--bg-secondary, #1e1e2e);
        color: var(--text-primary, #f1f1f1);
        font-family: 'Orbitron', sans-serif;
        font-size: 1rem;
        -moz-appearance: textfield;
      }
      .timer-custom-input::-webkit-inner-spin-button,
      .timer-custom-input::-webkit-outer-spin-button {
        -webkit-appearance: none; margin: 0;
      }
      .timer-custom-unit {
        color: var(--text-secondary, #a1a1b5);
        font-size: 0.85rem;
      }

      /* ---- Controls ---- */
      .timer-controls {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
      }
      .timer-ctrl-btn {
        padding: 0.65rem 1.6rem;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        cursor: pointer;
        transition: all 0.25s ease;
        border: none;
      }
      .timer-ctrl-btn.btn-primary {
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        color: #fff;
        box-shadow: 0 4px 16px rgba(168,85,247,0.35);
      }
      .timer-ctrl-btn.btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(168,85,247,0.5);
      }
      .timer-ctrl-btn.btn-secondary {
        background: var(--bg-tertiary, #2a2a3e);
        color: var(--text-primary, #f1f1f1);
        border: 1px solid var(--border-primary, #3a3a52);
      }
      .timer-ctrl-btn.btn-secondary:hover {
        border-color: var(--accent-primary, #a855f7);
      }
      .timer-ctrl-btn.btn-ghost {
        background: transparent;
        color: var(--text-secondary, #a1a1b5);
        border: 1px solid var(--border-primary, #3a3a52);
      }
      .timer-ctrl-btn.btn-ghost:hover {
        color: #ef4444;
        border-color: #ef4444;
      }
      .ctrl-icon { font-size: 0.85rem; }

      .hidden { display: none !important; }

      /* ---- Stats ---- */
      .timer-stats {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.85rem;
        color: var(--text-secondary, #a1a1b5);
      }
      .timer-xp-indicator {
        margin-top: 0.3rem;
        font-size: 0.8rem;
        font-weight: 600;
        background: linear-gradient(90deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Init on load ──────────────────────────────────────────── */
  injectStyles();

  /* ── Public API ────────────────────────────────────────────── */
  return {
    // State (read-only references)
    get isRunning()       { return state.isRunning; },
    get isPaused()        { return state.isPaused; },
    get currentDuration() { return state.currentDuration; },
    get remainingTime()   { return state.remainingTime; },
    get intervalId()      { return state.intervalId; },

    PRESETS,

    renderTimerPage,
    start,
    togglePause,
    stop,
    setDuration,
    tick,
    complete,
    updateDisplay,
    renderRing,
  };
})();
