/* ============================================================
   Daily Quest System — window.Quests
   LifeReset66 Gamified Habit Tracker
   ============================================================ */

window.Quests = (() => {
  // Track whether daily bonus has already been awarded today to prevent duplicates
  let _dailyBonusAwardedDate = null;

  // ── Icon sets by category ────────────────────────────────────
  const ICON_CATEGORIES = {
    Fitness:      ['💪', '🏃', '🧘', '🏋️', '🚴', '⚽', '🏊', '🥊'],
    Mind:         ['🧠', '📖', '🎯', '✍️', '📝', '🔬', '📚', '💡'],
    Wellness:     ['💧', '🥗', '😴', '💊', '🍎', '🧴', '🌿', '❤️'],
    Productivity: ['💼', '📊', '🖥️', '📧', '✅', '⏰', '📋', '🗂️'],
    Creativity:   ['🎨', '🎵', '📸', '✏️', '🎬', '🎸', '🎭', '🖌️'],
  };

  // ── Public API ───────────────────────────────────────────────

  /**
   * Render today's quest list into `container`.
   */
  function renderQuestList(container) {
    if (!container) return;
    container.innerHTML = '';

    const habits = Store.getHabits();
    const today  = Store.getTodayString();

    if (habits.length === 0) {
      const empty = UI.createElement('div', 'quest-empty');
      empty.innerHTML = `
        <div class="quest-empty-icon">⚔️</div>
        <p class="quest-empty-text">No quests yet</p>
        <p class="quest-empty-sub">Add your first daily quest to begin</p>`;
      container.appendChild(empty);
      return;
    }

    const list = UI.createElement('div', 'quest-list');

    habits.forEach(habit => {
      const completed = Store.isHabitCompleted(habit.id, today);
      const card = UI.createElement('div',
        `quest-card${completed ? ' completed' : ''}`);
      card.setAttribute('data-habit-id', habit.id);

      // Check button
      const checkBtn = UI.createElement('button', 'quest-check');
      checkBtn.setAttribute('aria-label', completed ? 'Mark incomplete' : 'Mark complete');
      checkBtn.innerHTML = completed
        ? '<svg viewBox="0 0 24 24" class="check-icon"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
        : '';

      // Info section
      const info = UI.createElement('div', 'quest-info');
      const icon = UI.createElement('span', 'quest-icon', habit.icon || '⚡');
      const name = UI.createElement('span', 'quest-name', habit.name);
      info.appendChild(icon);
      info.appendChild(name);

      // XP label
      const xpLabel = UI.createElement('span', 'quest-xp',
        `+${_getQuestXP()} XP`);

      card.appendChild(checkBtn);
      card.appendChild(info);
      card.appendChild(xpLabel);

      // Click handler
      checkBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleQuest(habit.id, checkBtn);
      });

      // Also allow clicking the whole card
      card.addEventListener('click', () => {
        toggleQuest(habit.id, checkBtn);
      });

      list.appendChild(card);
    });

    container.appendChild(list);
  }

  /**
   * Return the effective XP per quest (with hard mode).
   */
  function _getQuestXP() {
    const user = Store.getUser();
    const base = XP.QUEST_XP;
    return user.hardMode ? Math.round(base * XP.HARD_MODE_MULTIPLIER) : base;
  }

  /**
   * Toggle quest completion for a habit.
   */
  function toggleQuest(habitId, btnElement) {
    const today = Store.getTodayString();
    const wasDone = Store.isHabitCompleted(habitId, today);

    Store.toggleHabitCompletion(habitId, today);

    if (!wasDone) {
      // Just completed — animate + award
      if (btnElement) {
        UI.animateElement(btnElement, 'checkPop', 600);

        // Particles at button position
        const rect = btnElement.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        UI.createParticles(cx, cy, 12, '#00e5ff');
      }
      XP.awardQuestXP();
    }
    // If uncompleted (undo) — no XP subtraction per spec

    // Re-render the quest list
    const container = UI.$('.quest-list-container');
    if (container) renderQuestList(container);

    // Update completion counter
    _updateCounter();

    // Check daily completion
    checkDailyCompletion();

    // Evaluate streak
    Streaks.evaluateDay(today);
  }

  /**
   * Check if ALL habits are completed today. If so, award bonuses.
   */
  function checkDailyCompletion() {
    const today  = Store.getTodayString();
    const habits = Store.getHabits();
    if (habits.length === 0) return;

    const allDone = Store.getAllCompleted(today);

    if (allDone && _dailyBonusAwardedDate !== today) {
      _dailyBonusAwardedDate = today;

      // Daily bonus
      XP.awardDailyBonus();
      UI.showToast('🎯 All Quests Complete! Bonus XP!', 'xp', 3500);
      UI.createConfetti();

      // Update streak
      Store.updateStreak(today, 'complete');

      // Milestone check
      const currentDay = Store.getCurrentDay();
      XP.awardMilestoneXP(currentDay);
      Streaks.checkMilestone(currentDay);
    }
  }

  /**
   * Update the quest completion counter text.
   */
  function _updateCounter() {
    const counter = UI.$('.quest-counter');
    if (!counter) return;
    const habits = Store.getHabits();
    const today  = Store.getTodayString();
    const done   = Store.getCompletedCount(today);
    counter.textContent = `${done}/${habits.length} Quests Complete`;

    // Progress fill
    const fill = UI.$('.quest-counter-fill');
    if (fill) {
      fill.style.width = habits.length > 0
        ? `${(done / habits.length) * 100}%`
        : '0%';
    }
  }

  /**
   * Render the full quests page into #page-quests.
   */
  function renderQuestsPage() {
    const page = UI.$('#page-quests');
    if (!page) return;
    page.innerHTML = '';

    const habits = Store.getHabits();
    const today  = Store.getTodayString();
    const done   = Store.getCompletedCount(today);

    // ── Header ──────────────────────────────────────────────
    const header = UI.createElement('div', 'quests-header');
    header.innerHTML = `
      <h2 class="page-title">Daily Quests</h2>
      <p class="page-subtitle">Complete your quests to earn XP and keep your streak alive</p>`;
    page.appendChild(header);

    // ── Counter bar ─────────────────────────────────────────
    const counterWrap = UI.createElement('div', 'quest-counter-wrap');
    counterWrap.innerHTML = `
      <div class="quest-counter-track">
        <div class="quest-counter-fill" style="width:${habits.length > 0 ? (done / habits.length) * 100 : 0}%"></div>
      </div>
      <span class="quest-counter">${done}/${habits.length} Quests Complete</span>`;
    page.appendChild(counterWrap);

    // ── Quest list ──────────────────────────────────────────
    const listContainer = UI.createElement('div', 'quest-list-container');
    renderQuestList(listContainer);
    page.appendChild(listContainer);

    // ── Add quest button ────────────────────────────────────
    const addBtn = UI.createElement('button', 'btn-add-quest');
    addBtn.innerHTML = '<span class="btn-icon">＋</span> Add New Quest';
    addBtn.addEventListener('click', () => renderQuestManagement());
    page.appendChild(addBtn);
  }

  /**
   * Show the quest management modal (add / remove habits).
   */
  function renderQuestManagement() {
    const habits = Store.getHabits();

    let selectedIcon = '⚡';
    let selectedCategory = 'Fitness';

    const content = document.createElement('div');
    content.className = 'quest-management';

    // ── Current habits list ───────────────────────────────
    const existingSection = UI.createElement('div', 'qm-existing');
    existingSection.innerHTML = '<h3 class="qm-section-title">Current Quests</h3>';

    const habitList = UI.createElement('div', 'qm-habit-list');
    if (habits.length === 0) {
      habitList.innerHTML = '<p class="qm-empty">No quests added yet.</p>';
    } else {
      habits.forEach(h => {
        const row = UI.createElement('div', 'qm-habit-row');
        row.innerHTML = `
          <span class="qm-habit-icon">${h.icon}</span>
          <span class="qm-habit-name">${h.name}</span>`;

        const delBtn = UI.createElement('button', 'qm-delete-btn', '✕');
        delBtn.setAttribute('aria-label', `Remove ${h.name}`);
        delBtn.addEventListener('click', () => {
          UI.showConfirm('Remove Quest',
            `Remove "${h.name}" from your daily quests?`,
            () => {
              Store.removeHabit(h.id);
              UI.closeModal();
              renderQuestManagement();  // re-open refreshed
              // Re-render quests page
              renderQuestsPage();
            });
        });
        row.appendChild(delBtn);
        habitList.appendChild(row);
      });
    }
    existingSection.appendChild(habitList);
    content.appendChild(existingSection);

    // ── Add new habit form ────────────────────────────────
    const addSection = UI.createElement('div', 'qm-add-section');
    addSection.innerHTML = '<h3 class="qm-section-title">Add New Quest</h3>';

    // Name input
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'qm-name-input';
    nameInput.placeholder = 'Quest name (e.g., "Run 2 miles")';
    nameInput.maxLength = 60;
    addSection.appendChild(nameInput);

    // Category selector
    const catWrap = UI.createElement('div', 'qm-category-wrap');
    catWrap.innerHTML = '<label class="qm-label">Category</label>';
    const catRow = UI.createElement('div', 'qm-category-row');

    Object.keys(ICON_CATEGORIES).forEach(cat => {
      const btn = UI.createElement('button',
        `qm-cat-btn${cat === selectedCategory ? ' active' : ''}`, cat);
      btn.addEventListener('click', () => {
        selectedCategory = cat;
        // Update active class
        catRow.querySelectorAll('.qm-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // Re-render icon grid
        _renderIconGrid(iconGrid, cat);
      });
      catRow.appendChild(btn);
    });
    catWrap.appendChild(catRow);
    addSection.appendChild(catWrap);

    // Icon picker
    const iconWrap = UI.createElement('div', 'qm-icon-wrap');
    iconWrap.innerHTML = '<label class="qm-label">Icon</label>';
    const iconGrid = UI.createElement('div', 'qm-icon-grid');
    _renderIconGrid(iconGrid, selectedCategory);
    iconWrap.appendChild(iconGrid);
    addSection.appendChild(iconWrap);

    // Selected icon preview
    const preview = UI.createElement('div', 'qm-preview');
    preview.innerHTML = `<span class="qm-preview-icon" id="qm-preview-icon">${selectedIcon}</span>`;
    addSection.appendChild(preview);

    // Save button
    const saveBtn = UI.createElement('button', 'btn-primary qm-save-btn', '✚ Add Quest');
    saveBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      if (!name) {
        UI.showToast('Please enter a quest name', 'error');
        nameInput.focus();
        return;
      }
      Store.addHabit(name, selectedIcon, selectedCategory);
      UI.showToast(`Quest "${name}" added!`, 'default', 2500);
      UI.closeModal();
      renderQuestsPage();
    });
    addSection.appendChild(saveBtn);

    content.appendChild(addSection);

    // ── Render icon grid helper (closure) ─────────────────
    function _renderIconGrid(grid, category) {
      grid.innerHTML = '';
      const icons = ICON_CATEGORIES[category] || [];
      icons.forEach(ic => {
        const btn = UI.createElement('button',
          `qm-icon-btn${ic === selectedIcon ? ' active' : ''}`, ic);
        btn.addEventListener('click', () => {
          selectedIcon = ic;
          grid.querySelectorAll('.qm-icon-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const prev = content.querySelector('#qm-preview-icon');
          if (prev) prev.textContent = ic;
        });
        grid.appendChild(btn);
      });
    }

    // Show modal
    UI.showModal(content.outerHTML, { closable: true, className: 'quest-mgmt-modal' });

    // Re-bind events after modal renders (since outerHTML loses listeners)
    setTimeout(() => {
      _bindManagementEvents();
    }, 50);
  }

  /**
   * Re-bind event listeners inside the quest management modal.
   * Called after the modal DOM is inserted.
   */
  function _bindManagementEvents() {
    const modal = UI.$('.quest-mgmt-modal') || UI.$('.modal');
    if (!modal) return;

    let selectedIcon = '⚡';
    let selectedCategory = 'Fitness';

    // Delete buttons
    modal.querySelectorAll('.qm-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = btn.closest('.qm-habit-row');
        const name = row ? row.querySelector('.qm-habit-name').textContent : '';
        const habits = Store.getHabits();
        const habit = habits.find(h => h.name === name);
        if (!habit) return;

        UI.showConfirm('Remove Quest',
          `Remove "${habit.name}" from your daily quests?`,
          () => {
            Store.removeHabit(habit.id);
            UI.closeModal();
            renderQuestManagement();
            renderQuestsPage();
          });
      });
    });

    // Category buttons
    modal.querySelectorAll('.qm-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedCategory = btn.textContent;
        modal.querySelectorAll('.qm-cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const iconGrid = modal.querySelector('.qm-icon-grid');
        if (iconGrid) {
          iconGrid.innerHTML = '';
          const icons = ICON_CATEGORIES[selectedCategory] || [];
          icons.forEach(ic => {
            const ibtn = UI.createElement('button',
              `qm-icon-btn${ic === selectedIcon ? ' active' : ''}`, ic);
            ibtn.addEventListener('click', () => {
              selectedIcon = ic;
              iconGrid.querySelectorAll('.qm-icon-btn').forEach(b => b.classList.remove('active'));
              ibtn.classList.add('active');
              const prev = modal.querySelector('#qm-preview-icon');
              if (prev) prev.textContent = ic;
            });
            iconGrid.appendChild(ibtn);
          });
        }
      });
    });

    // Icon buttons (initial grid)
    modal.querySelectorAll('.qm-icon-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedIcon = btn.textContent;
        modal.querySelectorAll('.qm-icon-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const prev = modal.querySelector('#qm-preview-icon');
        if (prev) prev.textContent = selectedIcon;
      });
    });

    // Save button
    const saveBtn = modal.querySelector('.qm-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const nameInput = modal.querySelector('.qm-name-input');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
          UI.showToast('Please enter a quest name', 'error');
          if (nameInput) nameInput.focus();
          return;
        }
        Store.addHabit(name, selectedIcon, selectedCategory);
        UI.showToast(`Quest "${name}" added!`, 'default', 2500);
        UI.closeModal();
        renderQuestsPage();
      });
    }
  }

  /**
   * Apply hard-mode penalty for a missed day.
   */
  function applyHardModePenalty(date) {
    const user = Store.getUser();
    if (!user.hardMode) return;

    const status = Store.getDayStatus(date);
    if (status === 'missed') {
      UI.showToast('⚠️ Hard Mode: Missed day! Streak reset.', 'error', 4000);
      const streaks = Store.getStreaks();
      streaks.current = 0;
      Store.save();
    }
  }

  // ── Expose ───────────────────────────────────────────────────
  return {
    renderQuestList,
    toggleQuest,
    renderQuestsPage,
    renderQuestManagement,
    checkDailyCompletion,
    applyHardModePenalty,
  };
})();
