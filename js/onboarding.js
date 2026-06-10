/* ============================================================
   LifeReset66 — Multi-Step Onboarding Wizard
   js/onboarding.js
   Depends on: window.Store, window.UI
   ============================================================ */

window.Onboarding = (() => {
  /* ── State ─────────────────────────────────────────────────── */
  let currentStep = 0;
  const totalSteps = 6;
  const selections = {
    name: '',
    avatar: '🧑',
    categories: [],
    habits: [],
    hardMode: false,
  };

  /* ── Avatar options ────────────────────────────────────────── */
  const AVATARS = [
    '🧑','👤','🦊','🐺','🦁','🐲','🦅','🐍','🦇','⚡',
    '🔥','💎','🗡️','🛡️','👑','🎯','🧙‍♂️','🥷','🤖','🦸',
  ];

  /* ── Category definitions ──────────────────────────────────── */
  const CATEGORIES = [
    { id: 'fitness',      icon: '💪', name: 'Fitness',      desc: 'Build strength & endurance' },
    { id: 'mind',         icon: '🧠', name: 'Mind',         desc: 'Sharpen your mental edge' },
    { id: 'learning',     icon: '📚', name: 'Learning',     desc: 'Grow your knowledge' },
    { id: 'wellness',     icon: '🧘', name: 'Wellness',     desc: 'Nurture body & soul' },
    { id: 'productivity', icon: '💼', name: 'Productivity', desc: 'Maximize your output' },
    { id: 'creativity',   icon: '🎨', name: 'Creativity',   desc: 'Express & create' },
  ];

  /* ── Habit suggestions by category ─────────────────────────── */
  const HABIT_POOL = {
    fitness:      [
      { name: 'Morning Workout', icon: '💪' },
      { name: '10K Steps',       icon: '🚶' },
      { name: 'Stretch Routine', icon: '🤸' },
      { name: 'Cold Shower',     icon: '🚿' },
      { name: 'Drink 2L Water',  icon: '💧' },
    ],
    mind:         [
      { name: 'Read 20 Pages',        icon: '📖' },
      { name: 'Journal',              icon: '✍️' },
      { name: 'Meditation',           icon: '🧘' },
      { name: 'Learn Something New',  icon: '🎯' },
      { name: 'Brain Games',          icon: '🧩' },
    ],
    learning:     [
      { name: 'Study Session',   icon: '📚' },
      { name: 'Practice Skill',  icon: '🎯' },
      { name: 'Watch Tutorial',  icon: '🖥️' },
      { name: 'Take Notes',      icon: '📝' },
      { name: 'Teach Someone',   icon: '🗣️' },
    ],
    wellness:     [
      { name: 'Sleep 8 Hours',  icon: '😴' },
      { name: 'Healthy Meal',   icon: '🥗' },
      { name: 'No Junk Food',   icon: '🚫' },
      { name: 'Skincare',       icon: '🧴' },
      { name: 'Gratitude',      icon: '🙏' },
    ],
    productivity: [
      { name: 'Deep Work Block',  icon: '💼' },
      { name: 'Plan Tomorrow',    icon: '📊' },
      { name: 'Inbox Zero',       icon: '📧' },
      { name: 'No Social Media',  icon: '📵' },
      { name: 'Complete Top 3',   icon: '✅' },
    ],
    creativity:   [
      { name: 'Create Something', icon: '🎨' },
      { name: 'Practice Art',     icon: '✏️' },
      { name: 'Write 500 Words',  icon: '✍️' },
      { name: 'Play Music',       icon: '🎵' },
      { name: 'Photography',      icon: '📸' },
    ],
  };

  /* ── Helpers ───────────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }

  function getContainer() {
    let c = el('onboarding-overlay');
    if (!c) {
      c = document.createElement('div');
      c.id = 'onboarding-overlay';
      c.className = 'ob-overlay';
      document.body.appendChild(c);
    }
    return c;
  }

  /* ── Public: start ─────────────────────────────────────────── */
  function start() {
    currentStep = 0;
    selections.name = '';
    selections.avatar = '🧑';
    selections.categories = [];
    selections.habits = [];
    selections.hardMode = false;
    injectStyles();
    renderStep();
  }

  /* ── Navigation ────────────────────────────────────────────── */
  function nextStep() {
    if (currentStep >= totalSteps - 1) return;
    const dir = 'right';
    currentStep++;
    renderStep(dir);
  }

  function prevStep() {
    if (currentStep <= 0) return;
    const dir = 'left';
    currentStep--;
    renderStep(dir);
  }

  function goToStep(index) {
    if (index < 0 || index >= totalSteps) return;
    const dir = index > currentStep ? 'right' : 'left';
    currentStep = index;
    renderStep(dir);
  }

  /* ── Render dispatcher ─────────────────────────────────────── */
  function renderStep(direction) {
    const container = getContainer();
    const renderers = [
      renderWelcome,
      renderNameAvatar,
      renderCategories,
      renderHabits,
      renderDifficulty,
      renderLaunch,
    ];

    // Build step content
    const stepHTML = renderers[currentStep]();
    const dots = buildDots();
    const backBtn = currentStep > 0
      ? `<button class="ob-back-btn" id="ob-back-btn">← Back</button>`
      : '';

    // Animation class
    let animClass = '';
    if (direction === 'right') animClass = 'ob-slide-in-right';
    else if (direction === 'left') animClass = 'ob-slide-in-left';
    else if (currentStep === 0) animClass = 'ob-fade-in';
    else if (currentStep === totalSteps - 1) animClass = 'ob-scale-in';
    else animClass = 'ob-fade-in';

    container.innerHTML = `
      <div class="ob-step ${animClass}" id="ob-step-inner">
        ${backBtn}
        ${stepHTML}
        ${dots}
      </div>
    `;

    // Bind back btn
    const backEl = el('ob-back-btn');
    if (backEl) backEl.addEventListener('click', prevStep);

    // Per-step bindings
    switch (currentStep) {
      case 0: bindWelcome(); break;
      case 1: bindNameAvatar(); break;
      case 2: bindCategories(); break;
      case 3: bindHabits(); break;
      case 4: bindDifficulty(); break;
      case 5: bindLaunch(); break;
    }
  }

  /* ── Dots ──────────────────────────────────────────────────── */
  function buildDots() {
    let html = '<div class="ob-dots">';
    for (let i = 0; i < totalSteps; i++) {
      const cls = i === currentStep ? 'ob-dot active'
                : i < currentStep  ? 'ob-dot completed'
                : 'ob-dot';
      html += `<span class="${cls}"></span>`;
    }
    html += '</div>';
    return html;
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 0 — Welcome
     ═══════════════════════════════════════════════════════════ */
  function renderWelcome() {
    return `
      <div class="ob-welcome">
        <div class="ob-logo-glow" id="ob-logo">⚡</div>
        <h1 class="ob-app-name">LifeReset<span class="ob-66">66</span></h1>
        <p class="ob-tagline ob-fade-text">Transform your life in 66 days</p>
        <p class="ob-subtitle ob-fade-text-delayed">Build unbreakable habits through the power of gamification</p>
        <button class="ob-cta-btn ob-pulse" id="ob-begin-btn">Begin Your Journey →</button>
      </div>
    `;
  }
  function bindWelcome() {
    const btn = el('ob-begin-btn');
    if (btn) btn.addEventListener('click', nextStep);
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 1 — Name & Avatar
     ═══════════════════════════════════════════════════════════ */
  function renderNameAvatar() {
    const avatarGrid = AVATARS.map(a => {
      const sel = a === selections.avatar ? ' selected' : '';
      return `<button class="ob-avatar-btn${sel}" data-avatar="${a}">${a}</button>`;
    }).join('');

    return `
      <div class="ob-step-content">
        <h2 class="ob-heading">What should we call you?</h2>
        <input type="text" id="ob-name-input" class="ob-text-input"
               placeholder="Enter your name" value="${selections.name}" maxlength="24" autocomplete="off" />
        <h3 class="ob-subheading">Choose your avatar</h3>
        <div class="ob-avatar-preview" id="ob-avatar-preview">${selections.avatar}</div>
        <div class="ob-emoji-picker" id="ob-emoji-picker">${avatarGrid}</div>
        <button class="ob-next-btn" id="ob-next-btn" ${selections.name ? '' : 'disabled'}>Next →</button>
      </div>
    `;
  }
  function bindNameAvatar() {
    const input   = el('ob-name-input');
    const nextBtn = el('ob-next-btn');
    const preview = el('ob-avatar-preview');

    input.addEventListener('input', () => {
      selections.name = input.value.trim();
      nextBtn.disabled = !selections.name;
    });

    document.querySelectorAll('.ob-avatar-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selections.avatar = btn.dataset.avatar;
        document.querySelectorAll('.ob-avatar-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        if (preview) preview.textContent = selections.avatar;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (selections.name) nextStep();
    });

    // Auto-focus
    setTimeout(() => input.focus(), 300);
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 2 — Categories
     ═══════════════════════════════════════════════════════════ */
  function renderCategories() {
    const cards = CATEGORIES.map(cat => {
      const sel = selections.categories.includes(cat.id) ? ' selected' : '';
      return `
        <div class="ob-category-card${sel}" data-cat="${cat.id}" id="ob-cat-${cat.id}">
          <span class="ob-cat-icon">${cat.icon}</span>
          <span class="ob-cat-name">${cat.name}</span>
          <span class="ob-cat-desc">${cat.desc}</span>
        </div>`;
    }).join('');

    return `
      <div class="ob-step-content">
        <h2 class="ob-heading">Choose your quest paths</h2>
        <p class="ob-hint">Select 1–3 categories to focus on</p>
        <div class="ob-category-grid">${cards}</div>
        <button class="ob-next-btn" id="ob-next-btn"
                ${selections.categories.length >= 1 ? '' : 'disabled'}>Next →</button>
      </div>
    `;
  }
  function bindCategories() {
    const nextBtn = el('ob-next-btn');

    document.querySelectorAll('.ob-category-card').forEach(card => {
      card.addEventListener('click', () => {
        const catId = card.dataset.cat;
        const idx = selections.categories.indexOf(catId);
        if (idx > -1) {
          selections.categories.splice(idx, 1);
          card.classList.remove('selected');
        } else {
          if (selections.categories.length >= 3) {
            UI.showToast('Maximum 3 categories', 'warning', 2000);
            return;
          }
          selections.categories.push(catId);
          card.classList.add('selected');
        }
        nextBtn.disabled = selections.categories.length < 1;
      });
    });

    nextBtn.addEventListener('click', () => {
      if (selections.categories.length >= 1) nextStep();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 3 — Habits
     ═══════════════════════════════════════════════════════════ */
  function getHabitSuggestions(categories) {
    const list = [];
    categories.forEach(catId => {
      const pool = HABIT_POOL[catId];
      if (pool) {
        pool.forEach(h => list.push({ ...h, category: catId }));
      }
    });
    return list;
  }

  function renderHabits() {
    const suggestions = getHabitSuggestions(selections.categories);

    // Pre-select first 2 per category on first visit
    if (selections.habits.length === 0) {
      const perCat = {};
      suggestions.forEach(h => {
        if (!perCat[h.category]) perCat[h.category] = 0;
        if (perCat[h.category] < 2) {
          selections.habits.push({ ...h });
          perCat[h.category]++;
        }
      });
    }

    const habitBtns = suggestions.map(h => {
      const isActive = selections.habits.some(s => s.name === h.name && s.category === h.category);
      return `<button class="ob-habit-toggle${isActive ? ' active' : ''}"
                      data-name="${h.name}" data-icon="${h.icon}" data-category="${h.category}">
                <span class="ob-ht-icon">${h.icon}</span>
                <span class="ob-ht-name">${h.name}</span>
              </button>`;
    }).join('');

    const warning = selections.habits.length > 7
      ? '<p class="ob-warn">⚠️ More than 7 habits may be hard to maintain. Consider focusing.</p>'
      : '';

    return `
      <div class="ob-step-content">
        <h2 class="ob-heading">Build your daily quest list</h2>
        <p class="ob-hint">Recommended: 3–5 habits</p>
        <div class="ob-habit-list" id="ob-habit-list">${habitBtns}</div>
        ${warning}
        <button class="ob-add-custom-btn" id="ob-add-custom-btn">+ Add Custom Habit</button>
        <div class="ob-custom-habit-row hidden" id="ob-custom-row">
          <input type="text" id="ob-custom-habit-input" class="ob-text-input"
                 placeholder="Habit name" maxlength="32" />
          <button class="ob-small-btn" id="ob-custom-add-confirm">Add</button>
        </div>
        <p class="ob-selected-count" id="ob-habit-count">${selections.habits.length} habits selected</p>
        <button class="ob-next-btn" id="ob-next-btn"
                ${selections.habits.length > 0 ? '' : 'disabled'}>Next →</button>
      </div>
    `;
  }
  function bindHabits() {
    const nextBtn  = el('ob-next-btn');
    const countEl  = el('ob-habit-count');

    function updateCount() {
      const n = selections.habits.length;
      countEl.textContent = `${n} habit${n !== 1 ? 's' : ''} selected`;
      nextBtn.disabled = n === 0;

      // Show/hide warning
      const existingWarn = document.querySelector('.ob-warn');
      if (n > 7 && !existingWarn) {
        const w = document.createElement('p');
        w.className = 'ob-warn';
        w.textContent = '⚠️ More than 7 habits may be hard to maintain. Consider focusing.';
        el('ob-habit-list').insertAdjacentElement('afterend', w);
      } else if (n <= 7 && existingWarn) {
        existingWarn.remove();
      }
    }

    document.querySelectorAll('.ob-habit-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const name     = btn.dataset.name;
        const icon     = btn.dataset.icon;
        const category = btn.dataset.category;
        const idx = selections.habits.findIndex(h => h.name === name && h.category === category);
        if (idx > -1) {
          selections.habits.splice(idx, 1);
          btn.classList.remove('active');
        } else {
          selections.habits.push({ name, icon, category });
          btn.classList.add('active');
        }
        updateCount();
      });
    });

    // Custom habit
    const addCustomBtn = el('ob-add-custom-btn');
    const customRow    = el('ob-custom-row');
    const customInput  = el('ob-custom-habit-input');
    const confirmBtn   = el('ob-custom-add-confirm');

    addCustomBtn.addEventListener('click', () => {
      customRow.classList.toggle('hidden');
      if (!customRow.classList.contains('hidden')) {
        setTimeout(() => customInput.focus(), 100);
      }
    });

    confirmBtn.addEventListener('click', () => {
      const val = customInput.value.trim();
      if (!val) return;
      // Add to list
      selections.habits.push({ name: val, icon: '⭐', category: 'custom' });
      // Add button to UI
      const newBtn = document.createElement('button');
      newBtn.className = 'ob-habit-toggle active';
      newBtn.dataset.name = val;
      newBtn.dataset.icon = '⭐';
      newBtn.dataset.category = 'custom';
      newBtn.innerHTML = `<span class="ob-ht-icon">⭐</span><span class="ob-ht-name">${val}</span>`;
      newBtn.addEventListener('click', () => {
        const i = selections.habits.findIndex(h => h.name === val && h.category === 'custom');
        if (i > -1) {
          selections.habits.splice(i, 1);
          newBtn.classList.remove('active');
        } else {
          selections.habits.push({ name: val, icon: '⭐', category: 'custom' });
          newBtn.classList.add('active');
        }
        updateCount();
      });
      el('ob-habit-list').appendChild(newBtn);
      customInput.value = '';
      updateCount();
    });

    nextBtn.addEventListener('click', () => {
      if (selections.habits.length > 0) nextStep();
    });
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 4 — Difficulty
     ═══════════════════════════════════════════════════════════ */
  function renderDifficulty() {
    const normalSel = !selections.hardMode ? ' selected' : '';
    const hardSel   =  selections.hardMode ? ' selected' : '';

    return `
      <div class="ob-step-content">
        <h2 class="ob-heading">Choose your difficulty</h2>
        <div class="ob-difficulty-grid">
          <div class="ob-diff-card${normalSel}" data-mode="normal" id="ob-diff-normal">
            <span class="ob-diff-icon">🎮</span>
            <h3 class="ob-diff-title">Normal Mode</h3>
            <p class="ob-diff-desc">Forgiving and flexible. Build habits at your own pace.</p>
            <ul class="ob-diff-perks">
              <li>✓ Standard XP rewards</li>
              <li>✓ Streaks pause on missed days</li>
              <li>✓ Great for beginners</li>
            </ul>
          </div>
          <div class="ob-diff-card ob-diff-hard${hardSel}" data-mode="hard" id="ob-diff-hard">
            <span class="ob-diff-icon">🔥</span>
            <h3 class="ob-diff-title">Hard Mode</h3>
            <p class="ob-diff-desc">No mercy. Maximum growth through discipline.</p>
            <ul class="ob-diff-perks">
              <li>⚡ 1.5x XP multiplier</li>
              <li>💀 Missed days break streaks</li>
              <li>🏆 For serious warriors</li>
            </ul>
          </div>
        </div>
        <button class="ob-next-btn" id="ob-next-btn">Next →</button>
      </div>
    `;
  }
  function bindDifficulty() {
    const normalCard = el('ob-diff-normal');
    const hardCard   = el('ob-diff-hard');
    const nextBtn    = el('ob-next-btn');

    function selectMode(hard) {
      selections.hardMode = hard;
      normalCard.classList.toggle('selected', !hard);
      hardCard.classList.toggle('selected', hard);
    }

    normalCard.addEventListener('click', () => selectMode(false));
    hardCard.addEventListener('click',   () => selectMode(true));
    nextBtn.addEventListener('click', nextStep);
  }

  /* ═══════════════════════════════════════════════════════════
     STEP 5 — Launch
     ═══════════════════════════════════════════════════════════ */
  function renderLaunch() {
    const catBadges = selections.categories.map(cId => {
      const cat = CATEGORIES.find(c => c.id === cId);
      return cat ? `<span class="ob-badge">${cat.icon} ${cat.name}</span>` : '';
    }).join('');

    const habitList = selections.habits.map(h =>
      `<li>${h.icon} ${h.name}</li>`
    ).join('');

    const modeLabel = selections.hardMode
      ? '🔥 Hard Mode'
      : '🎮 Normal Mode';

    return `
      <div class="ob-step-content ob-launch">
        <h2 class="ob-heading ob-dramatic">Your Journey Begins Now</h2>
        <div class="ob-summary-card">
          <div class="ob-summary-header">
            <span class="ob-summary-avatar">${selections.avatar}</span>
            <span class="ob-summary-name">${selections.name}</span>
          </div>
          <div class="ob-summary-badges">${catBadges}</div>
          <ul class="ob-summary-habits">${habitList}</ul>
          <div class="ob-summary-mode">${modeLabel}</div>
        </div>
        <div class="ob-day-counter" id="ob-day-counter">
          <span class="ob-day-num">1</span>
          <span class="ob-day-divider">/</span>
          <span class="ob-day-total">66</span>
        </div>
        <button class="ob-cta-btn ob-launch-btn ob-pulse" id="ob-launch-btn">🚀 Launch Mission</button>
      </div>
    `;
  }
  function bindLaunch() {
    const btn = el('ob-launch-btn');
    if (btn) btn.addEventListener('click', complete);
  }

  /* ── Complete onboarding ───────────────────────────────────── */
  function complete() {
    // Save user data
    Store.updateUser({
      name: selections.name,
      avatar: selections.avatar,
      hardMode: selections.hardMode,
      startDate: new Date().toISOString(),
      onboardingComplete: true,
    });

    // Add habits
    selections.habits.forEach(h => {
      Store.addHabit(h.name, h.icon, h.category);
    });

    Store.save();

    // Confetti celebration
    spawnConfetti();

    // Remove overlay after a brief delay
    setTimeout(() => {
      const overlay = el('onboarding-overlay');
      if (overlay) {
        overlay.classList.add('ob-exit');
        setTimeout(() => overlay.remove(), 600);
      }
      UI.showPage('page-home');
      UI.showToast('🎉 Welcome, ' + selections.name + '! Your 66-day journey begins!', 'success', 4000);
    }, 1800);
  }

  /* ── Confetti ──────────────────────────────────────────────── */
  function spawnConfetti() {
    const canvas = document.createElement('canvas');
    canvas.className = 'ob-confetti-canvas';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const colors = ['#a855f7','#6366f1','#f472b6','#facc15','#34d399','#38bdf8','#fb923c'];
    const pieces = [];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.5,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vy: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 3,
        rot: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1,
      });
    }

    let rafId;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of pieces) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rot += p.rotSpeed;
        if (p.y > canvas.height + 20) { p.life = 0; continue; }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, p.life);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive) {
        rafId = requestAnimationFrame(draw);
      } else {
        cancelAnimationFrame(rafId);
        canvas.remove();
      }
    }
    draw();
  }

  /* ── Styles ────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('onboarding-styles')) return;
    const s = document.createElement('style');
    s.id = 'onboarding-styles';
    s.textContent = `
      /* ---- Overlay ---- */
      .ob-overlay {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: var(--bg-primary, #12121a);
        display: flex;
        align-items: center;
        justify-content: center;
        overflow-y: auto;
        transition: opacity 0.5s ease;
      }
      .ob-overlay.ob-exit {
        opacity: 0;
        pointer-events: none;
      }

      /* ---- Step container ---- */
      .ob-step {
        width: 100%;
        max-width: 520px;
        padding: 2rem 1.5rem 3rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
      }

      /* ---- Animations ---- */
      .ob-slide-in-right  { animation: obSlideRight 0.4s ease both; }
      .ob-slide-in-left   { animation: obSlideLeft  0.4s ease both; }
      .ob-fade-in          { animation: obFadeIn     0.6s ease both; }
      .ob-scale-in         { animation: obScaleIn    0.5s ease both; }

      @keyframes obSlideRight {
        from { transform: translateX(60px); opacity: 0; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      @keyframes obSlideLeft {
        from { transform: translateX(-60px); opacity: 0; }
        to   { transform: translateX(0);     opacity: 1; }
      }
      @keyframes obFadeIn {
        from { opacity: 0; }
        to   { opacity: 1; }
      }
      @keyframes obScaleIn {
        from { transform: scale(0.85); opacity: 0; }
        to   { transform: scale(1);    opacity: 1; }
      }

      /* ---- Back button ---- */
      .ob-back-btn {
        position: absolute;
        top: 1rem;
        left: 1rem;
        background: none;
        border: none;
        color: var(--text-secondary, #a1a1b5);
        font-size: 0.9rem;
        cursor: pointer;
        transition: color 0.2s;
      }
      .ob-back-btn:hover { color: var(--text-primary, #f1f1f1); }

      /* ---- Dots ---- */
      .ob-dots {
        display: flex;
        gap: 0.5rem;
        margin-top: 2rem;
      }
      .ob-dot {
        width: 10px; height: 10px;
        border-radius: 50%;
        border: 2px solid var(--border-primary, #3a3a52);
        background: transparent;
        transition: all 0.3s ease;
      }
      .ob-dot.completed {
        background: var(--accent-primary, #a855f7);
        border-color: var(--accent-primary, #a855f7);
      }
      .ob-dot.active {
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        border-color: transparent;
        box-shadow: 0 0 8px rgba(168,85,247,0.5);
      }

      /* ---- Welcome ---- */
      .ob-welcome {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;
      }
      .ob-logo-glow {
        font-size: 4.5rem;
        animation: logoGlow 2.5s ease-in-out infinite alternate;
      }
      @keyframes logoGlow {
        from { text-shadow: 0 0 20px rgba(168,85,247,0.4), 0 0 60px rgba(168,85,247,0.15); filter: brightness(1); }
        to   { text-shadow: 0 0 35px rgba(168,85,247,0.8), 0 0 80px rgba(99,102,241,0.3);  filter: brightness(1.15); }
      }
      .ob-app-name {
        font-family: 'Orbitron', sans-serif;
        font-size: 2.4rem;
        font-weight: 800;
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: 0.04em;
      }
      .ob-66 { opacity: 0.85; }
      .ob-tagline {
        font-size: 1.15rem;
        color: var(--text-primary, #f1f1f1);
        font-weight: 500;
      }
      .ob-subtitle {
        font-size: 0.9rem;
        color: var(--text-secondary, #a1a1b5);
        max-width: 340px;
      }
      .ob-fade-text { animation: obFadeIn 1s ease 0.3s both; }
      .ob-fade-text-delayed { animation: obFadeIn 1s ease 0.8s both; }

      /* ---- CTA Button ---- */
      .ob-cta-btn {
        margin-top: 1.5rem;
        padding: 0.9rem 2.4rem;
        border: none;
        border-radius: 14px;
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        color: #fff;
        font-size: 1.05rem;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 24px rgba(168,85,247,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .ob-cta-btn:hover {
        transform: translateY(-2px) scale(1.03);
        box-shadow: 0 6px 32px rgba(168,85,247,0.55);
      }
      .ob-pulse {
        animation: ctaPulse 2s ease-in-out infinite;
      }
      @keyframes ctaPulse {
        0%, 100% { box-shadow: 0 4px 24px rgba(168,85,247,0.4); }
        50%      { box-shadow: 0 4px 36px rgba(168,85,247,0.7); }
      }

      /* ---- Next button ---- */
      .ob-next-btn {
        margin-top: 1.5rem;
        padding: 0.75rem 2rem;
        border: none;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        color: #fff;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.25s ease;
        box-shadow: 0 4px 16px rgba(168,85,247,0.3);
      }
      .ob-next-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 24px rgba(168,85,247,0.5);
      }
      .ob-next-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* ---- Step content ---- */
      .ob-step-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.9rem;
        width: 100%;
        text-align: center;
      }
      .ob-heading {
        font-family: 'Orbitron', sans-serif;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text-primary, #f1f1f1);
      }
      .ob-subheading {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text-secondary, #a1a1b5);
        margin-top: 0.5rem;
      }
      .ob-hint {
        font-size: 0.85rem;
        color: var(--text-secondary, #a1a1b5);
      }

      /* ---- Text input ---- */
      .ob-text-input {
        width: 100%;
        max-width: 320px;
        padding: 0.75rem 1rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 12px;
        background: rgba(255,255,255,0.04);
        backdrop-filter: blur(10px);
        color: var(--text-primary, #f1f1f1);
        font-size: 1rem;
        outline: none;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .ob-text-input:focus {
        border-color: var(--accent-primary, #a855f7);
        box-shadow: 0 0 0 3px rgba(168,85,247,0.15);
      }

      /* ---- Avatar ---- */
      .ob-avatar-preview {
        font-size: 3.5rem;
        width: 80px; height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(168,85,247,0.1);
        border: 2px solid var(--accent-primary, #a855f7);
        box-shadow: 0 0 20px rgba(168,85,247,0.2);
      }
      .ob-emoji-picker {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 0.5rem;
        max-width: 320px;
      }
      .ob-avatar-btn {
        width: 52px; height: 52px;
        font-size: 1.6rem;
        border: 2px solid var(--border-primary, #3a3a52);
        border-radius: 12px;
        background: var(--bg-secondary, #1e1e2e);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ob-avatar-btn:hover {
        border-color: var(--accent-primary, #a855f7);
        transform: scale(1.1);
      }
      .ob-avatar-btn.selected {
        border-color: var(--accent-primary, #a855f7);
        background: linear-gradient(135deg, rgba(168,85,247,0.2), rgba(99,102,241,0.15));
        box-shadow: 0 0 14px rgba(168,85,247,0.4);
      }

      /* ---- Categories ---- */
      .ob-category-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;
        width: 100%;
        max-width: 400px;
      }
      .ob-category-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 1rem 0.5rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 14px;
        background: var(--bg-secondary, #1e1e2e);
        cursor: pointer;
        transition: all 0.25s ease;
      }
      .ob-category-card:hover {
        border-color: var(--accent-primary, #a855f7);
        transform: translateY(-2px);
      }
      .ob-category-card.selected {
        border-color: var(--accent-primary, #a855f7);
        background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(99,102,241,0.08));
        box-shadow: 0 0 16px rgba(168,85,247,0.25);
      }
      .ob-cat-icon { font-size: 1.8rem; }
      .ob-cat-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--text-primary, #f1f1f1);
      }
      .ob-cat-desc {
        font-size: 0.72rem;
        color: var(--text-secondary, #a1a1b5);
      }

      /* ---- Habits ---- */
      .ob-habit-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        justify-content: center;
        max-width: 440px;
      }
      .ob-habit-toggle {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.5rem 0.9rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 10px;
        background: var(--bg-secondary, #1e1e2e);
        color: var(--text-secondary, #a1a1b5);
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s ease;
      }
      .ob-habit-toggle:hover {
        border-color: var(--accent-primary, #a855f7);
        color: var(--text-primary, #f1f1f1);
      }
      .ob-habit-toggle.active {
        border-color: var(--accent-primary, #a855f7);
        background: linear-gradient(135deg, rgba(168,85,247,0.15), rgba(99,102,241,0.1));
        color: var(--text-primary, #f1f1f1);
        box-shadow: 0 0 10px rgba(168,85,247,0.15);
      }
      .ob-ht-icon { font-size: 1.1rem; }
      .ob-ht-name { font-weight: 500; }

      .ob-add-custom-btn {
        background: none;
        border: 1px dashed var(--border-primary, #3a3a52);
        border-radius: 10px;
        padding: 0.5rem 1rem;
        color: var(--accent-primary, #a855f7);
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
      }
      .ob-add-custom-btn:hover {
        border-color: var(--accent-primary, #a855f7);
        background: rgba(168,85,247,0.05);
      }
      .ob-custom-habit-row {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .ob-custom-habit-row.hidden { display: none; }
      .ob-small-btn {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 8px;
        background: var(--accent-primary, #a855f7);
        color: #fff;
        font-weight: 600;
        cursor: pointer;
        font-size: 0.85rem;
      }
      .ob-selected-count {
        font-size: 0.8rem;
        color: var(--text-secondary, #a1a1b5);
      }
      .ob-warn {
        font-size: 0.8rem;
        color: #facc15;
        padding: 0.3rem 0.8rem;
        border-radius: 8px;
        background: rgba(250,204,21,0.08);
      }

      /* ---- Difficulty ---- */
      .ob-difficulty-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        width: 100%;
        max-width: 440px;
      }
      .ob-diff-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        padding: 1.3rem 1rem;
        border: 2px solid var(--border-primary, #3a3a52);
        border-radius: 16px;
        background: var(--bg-secondary, #1e1e2e);
        cursor: pointer;
        transition: all 0.25s ease;
        text-align: center;
      }
      .ob-diff-card:hover {
        border-color: var(--accent-primary, #a855f7);
        transform: translateY(-3px);
      }
      .ob-diff-card.selected {
        border-color: var(--accent-primary, #a855f7);
        background: linear-gradient(135deg, rgba(168,85,247,0.12), rgba(99,102,241,0.08));
        box-shadow: 0 0 20px rgba(168,85,247,0.3);
      }
      .ob-diff-hard {
        border-color: rgba(239,68,68,0.3);
      }
      .ob-diff-hard:hover,
      .ob-diff-hard.selected {
        border-color: #ef4444;
        background: linear-gradient(135deg, rgba(239,68,68,0.1), rgba(249,115,22,0.08));
        box-shadow: 0 0 20px rgba(239,68,68,0.25);
      }
      .ob-diff-icon { font-size: 2.4rem; }
      .ob-diff-title {
        font-family: 'Orbitron', sans-serif;
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-primary, #f1f1f1);
      }
      .ob-diff-desc {
        font-size: 0.78rem;
        color: var(--text-secondary, #a1a1b5);
      }
      .ob-diff-perks {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: left;
        font-size: 0.78rem;
        color: var(--text-secondary, #a1a1b5);
      }
      .ob-diff-perks li {
        padding: 0.15rem 0;
      }

      /* ---- Launch ---- */
      .ob-launch {
        gap: 1.2rem;
      }
      .ob-dramatic {
        animation: obScaleIn 0.5s ease both;
      }
      .ob-summary-card {
        width: 100%;
        max-width: 360px;
        padding: 1.2rem;
        border: 1px solid var(--border-primary, #3a3a52);
        border-radius: 16px;
        background: var(--bg-secondary, #1e1e2e);
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
      }
      .ob-summary-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 1.1rem;
        font-weight: 700;
        color: var(--text-primary, #f1f1f1);
      }
      .ob-summary-avatar {
        font-size: 2rem;
        width: 48px; height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(168,85,247,0.12);
        border: 2px solid var(--accent-primary, #a855f7);
      }
      .ob-summary-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.35rem;
      }
      .ob-badge {
        padding: 0.25rem 0.6rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 600;
        background: rgba(168,85,247,0.1);
        border: 1px solid rgba(168,85,247,0.25);
        color: var(--text-primary, #f1f1f1);
      }
      .ob-summary-habits {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-secondary, #a1a1b5);
        text-align: left;
        columns: 2;
      }
      .ob-summary-habits li {
        padding: 0.15rem 0;
      }
      .ob-summary-mode {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--text-primary, #f1f1f1);
        text-align: center;
      }

      /* Day counter */
      .ob-day-counter {
        display: flex;
        align-items: baseline;
        gap: 0.3rem;
        animation: dayReveal 0.8s ease 0.3s both;
      }
      @keyframes dayReveal {
        from { transform: scale(0.5); opacity: 0; }
        to   { transform: scale(1);   opacity: 1; }
      }
      .ob-day-num {
        font-family: 'Orbitron', sans-serif;
        font-size: 3.5rem;
        font-weight: 900;
        background: linear-gradient(135deg, var(--accent-primary, #a855f7), var(--accent-secondary, #6366f1));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .ob-day-divider {
        font-size: 2rem;
        color: var(--text-secondary, #a1a1b5);
        font-weight: 300;
      }
      .ob-day-total {
        font-family: 'Orbitron', sans-serif;
        font-size: 2rem;
        font-weight: 700;
        color: var(--text-secondary, #a1a1b5);
      }

      .ob-launch-btn {
        font-size: 1.15rem;
        padding: 1rem 2.8rem;
      }

      /* ---- Confetti canvas ---- */
      .ob-confetti-canvas {
        position: fixed;
        inset: 0;
        z-index: 10000;
        pointer-events: none;
      }

      /* ---- Responsive ---- */
      @media (max-width: 480px) {
        .ob-emoji-picker { grid-template-columns: repeat(5, 1fr); gap: 0.4rem; }
        .ob-avatar-btn   { width: 46px; height: 46px; font-size: 1.4rem; }
        .ob-category-grid { grid-template-columns: 1fr 1fr; gap: 0.6rem; }
        .ob-difficulty-grid { grid-template-columns: 1fr; }
        .ob-app-name { font-size: 1.8rem; }
      }

      .hidden { display: none !important; }
    `;
    document.head.appendChild(s);
  }

  /* ── Public API ────────────────────────────────────────────── */
  return {
    get currentStep()  { return currentStep; },
    get totalSteps()   { return totalSteps; },
    get selections()   { return { ...selections }; },

    start,
    nextStep,
    prevStep,
    goToStep,
    renderStep,

    renderWelcome,
    renderNameAvatar,
    renderCategories,
    renderHabits,
    renderDifficulty,
    renderLaunch,

    complete,
    getHabitSuggestions,
  };
})();
