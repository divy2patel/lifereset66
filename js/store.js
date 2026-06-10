/* ============================================
   LifeReset66 — State Management (Store)
   localStorage-backed reactive data layer
   ============================================ */

(function () {
  'use strict';

  const STORAGE_KEY = 'lifereset66_data';

  /** Default data shape */
  function getDefaults() {
    return {
      user: {
        name: '',
        avatar: '🧑',
        startDate: null,
        xp: 0,
        level: 1,
        hardMode: false,
        onboardingComplete: false
      },
      habits: [],
      streaks: {
        current: 0,
        longest: 0,
        history: {}
      },
      timer: {
        totalSessions: 0,
        totalMinutes: 0
      },
      settings: {
        notifications: false
      }
    };
  }

  window.Store = {

    /** @type {ReturnType<typeof getDefaults>} */
    data: null,

    // ====== INITIALIZATION ======

    /** Load persisted state or create defaults */
    init() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // Deep-merge with defaults so newly-added keys are always present
          this.data = this._deepMerge(getDefaults(), parsed);
        } else {
          this.data = getDefaults();
        }
      } catch (err) {
        console.warn('[Store] Failed to load data, using defaults:', err);
        this.data = getDefaults();
      }
      this.save();
    },

    /** Persist current state to localStorage */
    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      } catch (err) {
        console.error('[Store] Failed to save:', err);
      }
    },

    /** Clear all data and reset to defaults */
    reset() {
      localStorage.removeItem(STORAGE_KEY);
      this.data = getDefaults();
      this.save();
    },

    // ====== USER ======

    /** Returns the user object */
    getUser() {
      return this.data.user;
    },

    /** Merge partial updates into the user object and persist */
    updateUser(updates) {
      Object.assign(this.data.user, updates);
      this.save();
    },

    // ====== HABITS ======

    /** Returns the habits array */
    getHabits() {
      return this.data.habits;
    },

    /**
     * Add a new habit
     * @param {string} name
     * @param {string} icon  - emoji
     * @param {string} category
     * @returns {object} the newly created habit
     */
    addHabit(name, icon, category) {
      const habit = {
        id: this.generateId(),
        name: name,
        icon: icon || '⭐',
        category: category || 'general',
        createdAt: new Date().toISOString(),
        completions: {}
      };
      this.data.habits.push(habit);
      this.save();
      return habit;
    },

    /** Remove a habit by id */
    removeHabit(id) {
      this.data.habits = this.data.habits.filter(function (h) { return h.id !== id; });
      this.save();
    },

    /**
     * Toggle completion for a habit on a specific date
     * @param {string} id    - habit id
     * @param {string} date  - 'YYYY-MM-DD'
     */
    toggleHabitCompletion(id, date) {
      var habit = this.data.habits.find(function (h) { return h.id === id; });
      if (!habit) return;
      if (habit.completions[date]) {
        delete habit.completions[date];
      } else {
        habit.completions[date] = true;
      }
      this.save();
    },

    /**
     * Check whether a habit is completed on a given date
     * @param {string} id
     * @param {string} date - 'YYYY-MM-DD'
     * @returns {boolean}
     */
    isHabitCompleted(id, date) {
      var habit = this.data.habits.find(function (h) { return h.id === id; });
      return habit ? !!habit.completions[date] : false;
    },

    /**
     * Count how many habits are completed for a date
     * @param {string} date
     * @returns {number}
     */
    getCompletedCount(date) {
      var count = 0;
      this.data.habits.forEach(function (h) {
        if (h.completions[date]) count++;
      });
      return count;
    },

    /**
     * Check if ALL habits are completed for a date
     * @param {string} date
     * @returns {boolean}
     */
    getAllCompleted(date) {
      if (this.data.habits.length === 0) return false;
      return this.data.habits.every(function (h) { return !!h.completions[date]; });
    },

    // ====== STREAKS ======

    /** Returns the streaks object */
    getStreaks() {
      return this.data.streaks;
    },

    /**
     * Set the status for a date and recalculate current / longest streak
     * @param {string} date   - 'YYYY-MM-DD'
     * @param {string} status - 'complete' | 'missed' | 'partial'
     */
    updateStreak(date, status) {
      this.data.streaks.history[date] = status;

      // Recalculate current streak by walking backwards from today
      var today = this.getTodayString();
      var current = 0;
      var d = new Date(today + 'T00:00:00');

      while (true) {
        var key = this._dateToString(d);
        if (this.data.streaks.history[key] === 'complete') {
          current++;
          d.setDate(d.getDate() - 1);
        } else {
          break;
        }
      }

      this.data.streaks.current = current;
      if (current > this.data.streaks.longest) {
        this.data.streaks.longest = current;
      }

      this.save();
    },

    /**
     * Get the current day number (1-66) based on startDate.
     * Returns 0 if startDate is not set.
     * @returns {number}
     */
    getCurrentDay() {
      var startDate = this.data.user.startDate;
      if (!startDate) return 0;

      var start = new Date(startDate + 'T00:00:00');
      var now = new Date(this.getTodayString() + 'T00:00:00');
      var diff = Math.floor((now - start) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, Math.min(diff, 66));
    },

    /**
     * Get the status for a specific date
     * @param {string} date
     * @returns {string|undefined} 'complete' | 'missed' | 'partial' | undefined
     */
    getDayStatus(date) {
      return this.data.streaks.history[date];
    },

    // ====== TIMER ======

    /** Returns the timer stats object */
    getTimerStats() {
      return this.data.timer;
    },

    /**
     * Record a completed timer session
     * @param {number} minutes
     */
    addTimerSession(minutes) {
      this.data.timer.totalSessions++;
      this.data.timer.totalMinutes += minutes;
      this.save();
    },

    // ====== XP ======

    /**
     * Add XP, handle level-up.
     * Leveling formula: XP to reach level N+1 = N × 150
     *   Level 1→2 = 150 XP, Level 2→3 = 300 XP, etc.
     *
     * @param {number} amount
     * @returns {{ newXP: number, leveledUp: boolean, newLevel: number }}
     */
    addXP(amount) {
      this.data.user.xp += amount;
      var leveledUp = false;
      var newLevel = this.data.user.level;

      // Check for (possibly multiple) level ups
      while (this.data.user.xp >= this.getXPForNextLevel()) {
        this.data.user.xp -= this.getXPForNextLevel();
        this.data.user.level++;
        newLevel = this.data.user.level;
        leveledUp = true;
      }

      this.save();
      return { newXP: this.data.user.xp, leveledUp: leveledUp, newLevel: newLevel };
    },

    /**
     * XP needed to advance from current level to the next
     * @returns {number}
     */
    getXPForNextLevel() {
      return this.data.user.level * 150;
    },

    /**
     * Progress towards next level
     * @returns {{ current: number, needed: number, percentage: number }}
     */
    getXPProgress() {
      var needed = this.getXPForNextLevel();
      var current = this.data.user.xp;
      var percentage = needed > 0 ? Math.min((current / needed) * 100, 100) : 0;
      return { current: current, needed: needed, percentage: percentage };
    },

    // ====== UTILITIES ======

    /**
     * Returns today formatted as 'YYYY-MM-DD'
     * @returns {string}
     */
    getTodayString() {
      return this._dateToString(new Date());
    },

    /**
     * Generate a unique ID
     * @returns {string}
     */
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Export all data as a JSON string
     * @returns {string}
     */
    exportData() {
      return JSON.stringify(this.data, null, 2);
    },

    /**
     * Import data from a JSON string
     * @param {string} jsonString
     */
    importData(jsonString) {
      try {
        var parsed = JSON.parse(jsonString);
        this.data = this._deepMerge(getDefaults(), parsed);
        this.save();
      } catch (err) {
        console.error('[Store] importData failed:', err);
      }
    },

    // ====== PRIVATE HELPERS ======

    /**
     * Format a Date object as 'YYYY-MM-DD'
     * @param {Date} d
     * @returns {string}
     */
    _dateToString(d) {
      var year = d.getFullYear();
      var month = String(d.getMonth() + 1).padStart(2, '0');
      var day = String(d.getDate()).padStart(2, '0');
      return year + '-' + month + '-' + day;
    },

    /**
     * Deep-merge source into target (non-destructive).
     * Arrays from source replace target arrays entirely.
     * @param {object} target
     * @param {object} source
     * @returns {object}
     */
    _deepMerge(target, source) {
      var output = Object.assign({}, target);
      for (var key in source) {
        if (!source.hasOwnProperty(key)) continue;
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object' &&
          !Array.isArray(target[key])
        ) {
          output[key] = this._deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    }
  };
})();
