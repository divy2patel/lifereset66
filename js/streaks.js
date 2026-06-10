/* ============================================================
   Streak & 66-Day Tracker — window.Streaks
   LifeReset66 Gamified Habit Tracker
   ============================================================ */

window.Streaks = (() => {
  const TOTAL_DAYS = 66;
  const MILESTONE_DAYS = [7, 14, 21, 30, 45, 66];

  // ── Helpers ──────────────────────────────────────────────────

  /**
   * Return the calendar date string (YYYY-MM-DD) for a given
   * journey day number (1-based).
   */
  function _dateForDay(dayNumber) {
    const user = Store.getUser();
    if (!user.startDate) return null;
    const start = new Date(user.startDate + 'T00:00:00');
    const target = new Date(start);
    target.setDate(start.getDate() + (dayNumber - 1));
    return target.toISOString().slice(0, 10);
  }

  /**
   * Return the current journey day number (1-based).
   */
  function _currentDay() {
    return Store.getCurrentDay();
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Render the 66-day grid into `container`.
   */
  function renderGrid(container) {
    if (!container) return;
    container.innerHTML = '';

    const grid = UI.createElement('div', 'streak-grid');
    const today = Store.getTodayString();
    const currentDay = _currentDay();

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const dateStr = _dateForDay(day);
      const status  = dateStr ? Store.getDayStatus(dateStr) : null;
      const isToday = dateStr === today;
      const isFuture = day > currentDay;
      const isMilestone = MILESTONE_DAYS.includes(day);

      // Build class list
      let cls = 'streak-cell';
      if (isToday)                        cls += ' today';
      else if (isFuture)                  cls += ' future';
      else if (status === 'complete')     cls += ' completed';
      else if (status === 'partial')      cls += ' partial';
      else if (status === 'missed')       cls += ' missed';
      if (isMilestone)                    cls += ' milestone';

      const cell = UI.createElement('div', cls);
      cell.setAttribute('data-day', day);
      cell.setAttribute('title', `Day ${day}${dateStr ? ' — ' + dateStr : ''}`);

      // Day number
      const num = UI.createElement('span', 'streak-cell-num', String(day));
      cell.appendChild(num);

      // Milestone marker
      if (isMilestone) {
        const star = UI.createElement('span', 'streak-cell-star', '⭐');
        cell.appendChild(star);
      }

      // Today pulse
      if (isToday) {
        UI.animateElement(cell, 'pulse', 2000);
      }

      grid.appendChild(cell);
    }

    container.appendChild(grid);
  }

  /**
   * Render the streak counter badge into `container`.
   */
  function renderStreakBadge(container) {
    if (!container) return;
    container.innerHTML = '';

    const streaks = Store.getStreaks();
    const badge = UI.createElement('div', 'streak-badge');

    const flame = UI.createElement('span', 'streak-flame', '🔥');
    const count = UI.createElement('span', 'streak-count', String(streaks.current));
    const label = UI.createElement('span', 'streak-label', streaks.current === 1 ? 'day streak' : 'day streak');

    badge.appendChild(flame);
    badge.appendChild(count);
    badge.appendChild(label);

    // Longest streak note
    if (streaks.longest > 0) {
      const longest = UI.createElement('div', 'streak-longest',
        `Longest: ${streaks.longest} days`);
      badge.appendChild(longest);
    }

    container.appendChild(badge);
  }

  /**
   * Evaluate the given date: all, some, or no habits completed.
   * Updates the store streak and returns the status string.
   */
  function evaluateDay(date) {
    const habits = Store.getHabits();
    if (habits.length === 0) return 'complete';

    const completedCount = Store.getCompletedCount(date);
    let status;
    if (completedCount >= habits.length) {
      status = 'complete';
    } else if (completedCount > 0) {
      status = 'partial';
    } else {
      status = 'missed';
    }

    Store.updateStreak(date, status);
    return status;
  }

  /**
   * If `day` is a milestone, trigger a celebration.
   */
  function checkMilestone(day) {
    if (!MILESTONE_DAYS.includes(day)) return;

    const milestoneLabels = {
      7:  '1 Week Complete!',
      14: '2 Weeks Complete!',
      21: '3 Weeks Complete!',
      30: '30 Days — 1 Month!',
      45: '45 Days — Keep Going!',
      66: '66 Days — Journey Complete!',
    };

    UI.createConfetti();
    UI.showStreakToast(day);
    UI.showToast(`🏆 Milestone: ${milestoneLabels[day] || 'Day ' + day}`, 'streak', 4000);

    if (day === 66) {
      setTimeout(() => checkJourneyComplete(), 1500);
    }
  }

  /**
   * Render the full Progress page into #page-progress.
   */
  function renderProgressPage() {
    const page = UI.$('#page-progress');
    if (!page) return;
    page.innerHTML = '';

    const user    = Store.getUser();
    const streaks = Store.getStreaks();
    const currentDay = _currentDay();
    const capped = Math.min(currentDay, TOTAL_DAYS);

    // ── Section: Day counter circle ────────────────────────────
    const heroSection = UI.createElement('div', 'progress-hero');

    const circle = UI.createElement('div', 'day-circle');
    const percentage = Math.round((capped / TOTAL_DAYS) * 100);

    circle.innerHTML = `
      <svg viewBox="0 0 120 120" class="day-circle-svg">
        <circle cx="60" cy="60" r="52" class="day-circle-bg"/>
        <circle cx="60" cy="60" r="52" class="day-circle-fg"
          stroke-dasharray="${2 * Math.PI * 52}"
          stroke-dashoffset="${2 * Math.PI * 52 * (1 - percentage / 100)}" />
      </svg>
      <div class="day-circle-text">
        <span class="day-circle-number">${capped}</span>
        <span class="day-circle-total">/ ${TOTAL_DAYS}</span>
        <span class="day-circle-label">DAYS</span>
      </div>`;
    heroSection.appendChild(circle);
    page.appendChild(heroSection);

    // ── Section: Streak badge ──────────────────────────────────
    const streakSection = UI.createElement('div', 'progress-streak-section');
    renderStreakBadge(streakSection);
    page.appendChild(streakSection);

    // ── Section: 66-Day grid ───────────────────────────────────
    const gridSection = UI.createElement('div', 'progress-grid-section');
    const gridTitle = UI.createElement('h3', 'section-title', '66-Day Journey');
    gridSection.appendChild(gridTitle);
    renderGrid(gridSection);
    page.appendChild(gridSection);

    // ── Section: Stats cards ───────────────────────────────────
    const statsSection = UI.createElement('div', 'progress-stats');
    const statsTitle = UI.createElement('h3', 'section-title', 'Statistics');
    statsSection.appendChild(statsTitle);

    const statsGrid = UI.createElement('div', 'stats-grid');

    // Count completed days
    const history = streaks.history || {};
    const completedDays = Object.values(history).filter(s => s === 'complete').length;

    // Timer stats
    const timerStats = Store.getTimerStats ? Store.getTimerStats() : { totalSessions: 0 };

    const cards = [
      { icon: '✅', value: completedDays,          label: 'Days Completed' },
      { icon: '🔥', value: streaks.longest,         label: 'Longest Streak' },
      { icon: '⚡', value: user.xp,                 label: 'Total XP' },
      { icon: '🎯', value: timerStats.totalSessions || 0, label: 'Focus Sessions' },
    ];

    cards.forEach(c => {
      const card = UI.createElement('div', 'stat-card');
      card.innerHTML = `
        <span class="stat-icon">${c.icon}</span>
        <span class="stat-value">${c.value}</span>
        <span class="stat-label">${c.label}</span>`;
      statsGrid.appendChild(card);
    });

    statsSection.appendChild(statsGrid);
    page.appendChild(statsSection);
  }

  /**
   * Check whether the 66-day journey has been fully completed.
   */
  function checkJourneyComplete() {
    const currentDay = _currentDay();
    if (currentDay < TOTAL_DAYS) return false;

    const dateStr = _dateForDay(TOTAL_DAYS);
    const status  = dateStr ? Store.getDayStatus(dateStr) : null;
    if (status === 'complete') {
      showCompletionCeremony();
      return true;
    }
    return false;
  }

  /**
   * Grand completion ceremony overlay.
   */
  function showCompletionCeremony() {
    const user    = Store.getUser();
    const streaks = Store.getStreaks();
    const history = streaks.history || {};
    const completedDays = Object.values(history).filter(s => s === 'complete').length;

    const content = `
      <div class="completion-ceremony">
        <div class="completion-glow"></div>
        <div class="completion-badge">🏆</div>
        <h2 class="completion-title">Journey Complete!</h2>
        <p class="completion-subtitle">You conquered the 66-day challenge</p>

        <div class="completion-stats">
          <div class="completion-stat">
            <span class="completion-stat-value">${completedDays}</span>
            <span class="completion-stat-label">Days Completed</span>
          </div>
          <div class="completion-stat">
            <span class="completion-stat-value">${streaks.longest}</span>
            <span class="completion-stat-label">Longest Streak</span>
          </div>
          <div class="completion-stat">
            <span class="completion-stat-value">${user.xp}</span>
            <span class="completion-stat-label">Total XP Earned</span>
          </div>
          <div class="completion-stat">
            <span class="completion-stat-value">Lv.${user.level}</span>
            <span class="completion-stat-label">${XP.getLevelTitle(user.level)}</span>
          </div>
        </div>

        <button class="btn-primary completion-restart" id="btn-new-cycle">
          🔄 Start New Cycle
        </button>
      </div>`;

    UI.showModal(content, { closable: true, className: 'completion-modal' });

    // Confetti burst
    UI.createConfetti();
    setTimeout(() => UI.createConfetti(), 800);
    setTimeout(() => UI.createConfetti(), 1600);

    // Bind restart
    setTimeout(() => {
      const btn = UI.$('#btn-new-cycle');
      if (btn) {
        btn.addEventListener('click', () => {
          UI.showConfirm(
            'Start New Cycle',
            'This will reset your 66-day journey but keep your level and XP. Continue?',
            () => {
              Store.updateUser({ startDate: Store.getTodayString() });
              // Clear streak history
              const streakData = Store.getStreaks();
              streakData.current = 0;
              streakData.history = {};
              Store.save();
              UI.closeModal();
              renderProgressPage();
            }
          );
        });
      }
    }, 100);
  }

  // ── Expose ───────────────────────────────────────────────────
  return {
    renderGrid,
    renderStreakBadge,
    evaluateDay,
    checkMilestone,
    renderProgressPage,
    checkJourneyComplete,
    showCompletionCeremony,
  };
})();
