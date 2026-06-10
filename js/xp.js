/* ============================================================
   XP & Leveling System — window.XP
   LifeReset66 Gamified Habit Tracker
   ============================================================ */

window.XP = (() => {
  // ── XP Reward Constants ──────────────────────────────────────
  const QUEST_XP            = 25;
  const DAILY_BONUS_XP      = 50;
  const MILESTONE_XP        = 100;
  const TIMER_XP            = 10;
  const HARD_MODE_MULTIPLIER = 1.5;

  const MILESTONE_DAYS = [7, 14, 21, 30, 45, 66];

  const LEVEL_TITLES = {
    1:  'Novice',
    3:  'Initiate',
    5:  'Apprentice',
    8:  'Warrior',
    11: 'Champion',
    14: 'Veteran',
    17: 'Legend',
    20: 'Ascended',
  };

  // ── Helpers ──────────────────────────────────────────────────

  /**
   * Return the effective XP after applying the hard-mode multiplier
   * when the user has opted-in.
   */
  function _applyMultiplier(baseXP) {
    const user = Store.getUser();
    return user.hardMode
      ? Math.round(baseXP * HARD_MODE_MULTIPLIER)
      : baseXP;
  }

  /**
   * Core award routine.  Adds XP to the store, shows a toast,
   * and triggers a level-up ceremony when applicable.
   * Returns the result from Store.addXP().
   */
  function _award(baseXP) {
    const amount = _applyMultiplier(baseXP);
    const result = Store.addXP(amount);
    UI.showXPToast(amount);
    if (result.leveledUp) {
      handleLevelUp(result.newLevel);
    }
    return result;
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Award XP for completing a single quest (habit).
   */
  function awardQuestXP() {
    return _award(QUEST_XP);
  }

  /**
   * Award the daily-completion bonus (all quests finished).
   */
  function awardDailyBonus() {
    return _award(DAILY_BONUS_XP);
  }

  /**
   * Award milestone XP if `day` falls on a milestone day.
   * @param {number} day — current day in the 66-day journey
   * @returns {object|null} — Store.addXP result or null
   */
  function awardMilestoneXP(day) {
    if (MILESTONE_DAYS.includes(day)) {
      return _award(MILESTONE_XP);
    }
    return null;
  }

  /**
   * Award XP for a completed focus-timer session.
   */
  function awardTimerXP() {
    return _award(TIMER_XP);
  }

  /**
   * Return the title string for a given level.
   * Finds the highest LEVEL_TITLES key that is ≤ level.
   */
  function getLevelTitle(level) {
    const thresholds = Object.keys(LEVEL_TITLES)
      .map(Number)
      .sort((a, b) => b - a);              // descending
    for (const t of thresholds) {
      if (level >= t) return LEVEL_TITLES[t];
    }
    return LEVEL_TITLES[1];                  // fallback
  }

  /**
   * Render (or re-render) the XP progress bar inside `container`.
   * Structure:
   *   .xp-bar-container
   *     .xp-bar-track
   *       .xp-bar-fill  (width = percentage)
   *     .xp-bar-label   "420 / 600 XP"
   */
  function renderXPBar(container) {
    if (!container) return;
    const progress = Store.getXPProgress();   // { current, needed, percentage }
    const user     = Store.getUser();

    container.innerHTML = '';

    // Wrapper
    const wrapper = UI.createElement('div', 'xp-bar-container');

    // Level + title row
    const levelRow = UI.createElement('div', 'xp-bar-header');
    const levelLabel = UI.createElement('span', 'xp-level-label',
      `Lv. ${user.level} — ${getLevelTitle(user.level)}`);
    const xpNumbers = UI.createElement('span', 'xp-numbers',
      `${progress.current} / ${progress.needed} XP`);
    levelRow.appendChild(levelLabel);
    levelRow.appendChild(xpNumbers);
    wrapper.appendChild(levelRow);

    // Track
    const track = UI.createElement('div', 'xp-bar-track');

    // Fill
    const fill = UI.createElement('div', 'xp-bar-fill');
    fill.style.width = '0%';
    track.appendChild(fill);
    wrapper.appendChild(track);

    // Label (percentage beneath)
    const label = UI.createElement('div', 'xp-bar-label',
      `${Math.round(progress.percentage)}% to Level ${user.level + 1}`);
    wrapper.appendChild(label);

    container.appendChild(wrapper);

    // Animate fill after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fill.style.width = `${Math.min(progress.percentage, 100)}%`;
      });
    });
  }

  /**
   * Trigger the level-up ceremony and update all visible XP displays.
   */
  function handleLevelUp(newLevel) {
    const title = getLevelTitle(newLevel);
    UI.showLevelUpCeremony(newLevel, title);
    UI.showLevelUpToast(newLevel);

    // Re-render any existing XP bars on the page
    const bars = UI.$$('.xp-bar-container');
    bars.forEach(bar => {
      const parent = bar.parentElement;
      if (parent) renderXPBar(parent);
    });
  }

  // ── Expose ───────────────────────────────────────────────────
  return {
    QUEST_XP,
    DAILY_BONUS_XP,
    MILESTONE_XP,
    TIMER_XP,
    HARD_MODE_MULTIPLIER,
    MILESTONE_DAYS,
    LEVEL_TITLES,

    awardQuestXP,
    awardDailyBonus,
    awardMilestoneXP,
    awardTimerXP,
    getLevelTitle,
    renderXPBar,
    handleLevelUp,
  };
})();
