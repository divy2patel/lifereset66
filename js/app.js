/* ============================================================
   LifeReset66 — Main Application Controller
   js/app.js
   Glues all pages, navigation, and state together.
   ============================================================ */

(function () {
  'use strict';

  // ====== INITIALIZATION ======
  document.addEventListener('DOMContentLoaded', () => {
    const bindNavigation = () => {
      const navItems = document.querySelectorAll('.nav-bar .nav-item');
      navItems.forEach(item => {
        item.addEventListener('click', () => {
          const pageId = item.getAttribute('data-page');
          if (pageId) {
            const user = Store.getUser();
            if (!user.onboardingComplete) {
              UI.showToast('Please complete onboarding first!', 'error');
              return;
            }
            UI.showPage(pageId);
            renderActivePage(pageId);
          }
        });
      });
    };

    const startApp = () => {
      bindNavigation();
      const user = Store.getUser();
      if (!user.onboardingComplete) {
        Onboarding.start();
      } else {
        checkDailyStatus();
        UI.showPage('page-home');
        renderActivePage('page-home');
      }
      bindHomeButtons();
    };

    const initializeWithFirebase = async (authUser) => {
      Store.setFirebaseUserId(authUser.uid);
      Store.init();
      try {
        const remote = await Firebase.loadUserData(authUser.uid);
        if (remote) {
          Store.mergeRemoteData(remote);
        } else {
          Store.save();
        }
      } catch (err) {
        console.error('[Firebase] Load user data failed:', err);
        Store.save();
      }
      startApp();
    };

    // ====== AUTH CHECK - REDIRECT TO LOGIN IF NOT AUTHENTICATED ======
    if (window.Firebase && Firebase.onAuthStateChanged) {
      Firebase.onAuthStateChanged(user => {
        if (!user) {
          // No user logged in - redirect to login page
          window.location.href = 'login.html';
          return;
        }
        initializeWithFirebase(user);
      });
    } else {
      // Firebase not available - redirect to login
      window.location.href = 'login.html';
    }
  });

  /**
   * Router to render active page contents when navigated
   * @param {string} pageId 
   */
  function renderActivePage(pageId) {
    const user = Store.getUser();
    if (!user.onboardingComplete) return;

    switch (pageId) {
      case 'page-home':
        renderHome();
        break;
      case 'page-quests':
        Quests.renderQuestsPage();
        break;
      case 'page-progress':
        Streaks.renderProgressPage();
        break;
      case 'page-timer':
        Timer.renderTimerPage();
        break;
      case 'page-profile':
        renderProfile();
        break;
    }
  }

  // ====== HOME PAGE RENDERER ======
  function renderHome() {
    const user = Store.getUser();
    
    // 1. Time-of-day greeting context
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour >= 5 && hour < 12) {
      greeting = 'Good morning';
    } else if (hour >= 12 && hour < 17) {
      greeting = 'Good afternoon';
    }
    
    const greetingEl = document.getElementById('home-greeting');
    if (greetingEl) greetingEl.textContent = greeting;

    const usernameEl = document.getElementById('home-username');
    if (usernameEl) usernameEl.textContent = user.name || 'Warrior';

    // 2. Level Badge
    const badgeEl = document.getElementById('home-level-badge');
    if (badgeEl) badgeEl.textContent = user.level;

    // 3. XP Bar
    const xpContainer = document.getElementById('home-xp-container');
    if (xpContainer) {
      XP.renderXPBar(xpContainer);
    }

    // 4. Day Counter
    const dayTitle = document.getElementById('home-day-title');
    const dayDesc = document.getElementById('home-day-desc');
    const currentDay = Store.getCurrentDay();
    
    if (dayTitle) {
      dayTitle.textContent = `Day ${currentDay} of 66`;
    }
    if (dayDesc) {
      if (currentDay >= 66) {
        dayDesc.textContent = '🚀 This is it! Day 66! Complete today\'s quests to claim ultimate victory!';
      } else {
        const remaining = 66 - currentDay;
        dayDesc.textContent = `Forge ahead! Only ${remaining} more day${remaining === 1 ? '' : 's'} to complete your life reset.`;
      }
    }

    // 5. Streaks Badge
    const streakContainer = document.getElementById('home-streak-container');
    if (streakContainer) {
      Streaks.renderStreakBadge(streakContainer);
    }

    // 6. Stats Row
    const statXp = document.getElementById('home-stat-xp');
    const statCompleted = document.getElementById('home-stat-completed');
    const statStreak = document.getElementById('home-stat-streak');
    
    if (statXp) {
      statXp.textContent = getCumulativeXP(user.level, user.xp);
    }
    if (statCompleted) {
      let totalCompletions = 0;
      Store.getHabits().forEach(h => {
        totalCompletions += Object.keys(h.completions || {}).length;
      });
      statCompleted.textContent = totalCompletions;
    }
    if (statStreak) {
      statStreak.textContent = Store.getStreaks().longest || 0;
    }

    // 7. Quests List
    const questsList = document.getElementById('home-quests-list');
    if (questsList) {
      Quests.renderQuestList(questsList);
    }

    // 8. Daily Wisdom Card
    const quoteContainer = document.getElementById('home-quote-container');
    if (quoteContainer) {
      Cards.renderDailyCard(quoteContainer);
    }
  }

  /**
   * Helper to bind quick-action elements on the dashboard home screen
   */
  function bindHomeButtons() {
    // Manage quests link
    const manageBtn = document.getElementById('home-manage-quests-btn');
    if (manageBtn) {
      manageBtn.addEventListener('click', () => {
        Quests.renderQuestManagement();
      });
    }

    // Browse cards deck link
    const deckBtn = document.getElementById('home-browse-cards-btn');
    if (deckBtn) {
      deckBtn.addEventListener('click', () => {
        Cards.renderCardsBrowser();
      });
    }

    // Quick-action Focus Timer
    const quickTimerBtn = document.getElementById('home-quick-timer-btn');
    if (quickTimerBtn) {
      quickTimerBtn.addEventListener('click', () => {
        UI.showPage('page-timer');
        renderActivePage('page-timer');
      });
    }
  }

  // ====== PROFILE PAGE RENDERER ======
  function renderProfile() {
    const user = Store.getUser();
    const streaks = Store.getStreaks();

    // Header updates
    const avatarDisp = document.getElementById('profile-avatar-display');
    const nameDisp = document.getElementById('profile-name-display');
    const titleDisp = document.getElementById('profile-level-title-display');

    if (avatarDisp) avatarDisp.textContent = user.avatar || '🧑';
    if (nameDisp) nameDisp.textContent = user.name || 'Warrior';
    if (titleDisp) {
      titleDisp.textContent = `${XP.getLevelTitle(user.level)} Warrior`;
    }

    // Stats Grid
    const statStreakCurr = document.getElementById('profile-stat-streak-curr');
    const statLevel = document.getElementById('profile-stat-level');
    const statSessions = document.getElementById('profile-stat-timer-sessions');

    if (statStreakCurr) statStreakCurr.textContent = streaks.current || 0;
    if (statLevel) statLevel.textContent = user.level;
    if (statSessions) {
      statSessions.textContent = Store.getTimerStats().totalSessions || 0;
    }

    // Bind settings toggles
    const hardModeCheckbox = document.getElementById('profile-hardmode-checkbox');
    if (hardModeCheckbox) {
      hardModeCheckbox.checked = !!user.hardMode;
      // Remove any existing listeners by cloning
      const newCheckbox = hardModeCheckbox.cloneNode(true);
      hardModeCheckbox.parentNode.replaceChild(newCheckbox, hardModeCheckbox);
      
      newCheckbox.addEventListener('change', (e) => {
        Store.updateUser({ hardMode: e.target.checked });
        if (e.target.checked) {
          UI.showToast('🔥 Hard Mode Enabled! XP payouts increased to 1.5x, but missing daily quests will break your streak!', 'streak', 5000);
        } else {
          UI.showToast('🎮 Hard Mode Disabled. Standard rewards and safety active.', 'default', 3500);
        }
      });
    }

    const remindersCheckbox = document.getElementById('profile-reminders-checkbox');
    if (remindersCheckbox) {
      remindersCheckbox.checked = !!Store.data.settings.notifications;
      const newCheckbox = remindersCheckbox.cloneNode(true);
      remindersCheckbox.parentNode.replaceChild(newCheckbox, remindersCheckbox);

      newCheckbox.addEventListener('change', (e) => {
        const active = e.target.checked;
        if (active) {
          if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                Store.data.settings.notifications = true;
                Store.save();
                UI.showToast('🔔 Notifications activated!', 'success');
                new Notification('LifeReset66', {
                  body: 'Daily reminders activated! Forge your future in 66 days.',
                  icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">⚡</text></svg>'
                });
              } else {
                e.target.checked = false;
                Store.data.settings.notifications = false;
                Store.save();
                UI.showToast('Notifications blocked by browser settings.', 'error');
              }
            });
          } else {
            e.target.checked = false;
            UI.showToast('Notifications not supported by this browser.', 'error');
          }
        } else {
          Store.data.settings.notifications = false;
          Store.save();
          UI.showToast('Reminders muted.', 'default');
        }
      });
    }

    // Bind Data actions
    const btnExport = document.getElementById('profile-btn-export');
    const btnImport = document.getElementById('profile-btn-import');
    const btnReset = document.getElementById('profile-btn-reset');

    if (btnExport) {
      // Re-bind click
      const newBtn = btnExport.cloneNode(true);
      btnExport.parentNode.replaceChild(newBtn, btnExport);
      newBtn.addEventListener('click', handleExport);
    }

    if (btnImport) {
      const newBtn = btnImport.cloneNode(true);
      btnImport.parentNode.replaceChild(newBtn, btnImport);
      newBtn.addEventListener('click', handleImport);
    }

    if (btnReset) {
      const newBtn = btnReset.cloneNode(true);
      btnReset.parentNode.replaceChild(newBtn, btnReset);
      newBtn.addEventListener('click', handleReset);
    }
  }

  // ====== UTILITIES / DATA HANDLERS ======

  /**
   * Helper to format Date objects as 'YYYY-MM-DD' safely
   */
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get total cumulative XP earned from Day 1 based on level & level-offset XP
   */
  function getCumulativeXP(level, currentXP) {
    let total = 0;
    for (let i = 1; i < level; i++) {
      total += i * 150;
    }
    return total + currentXP;
  }

  /**
   * Check historical days since start date to register missed days
   * and reset streaks when appropriate.
   */
  function checkDailyStatus() {
    const user = Store.getUser();
    if (!user.startDate || !user.onboardingComplete) return;

    const habits = Store.getHabits();
    const todayStr = Store.getTodayString();
    
    const start = new Date(user.startDate + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');

    let current = new Date(start);
    let evaluatedAny = false;
    let missedDaysCount = 0;

    // Walk from Start Date up to Yesterday
    while (current < today) {
      const dateStr = formatDate(current);
      const existingStatus = Store.getDayStatus(dateStr);

      if (!existingStatus) {
        // Evaluate completion status for this day
        const completedCount = Store.getCompletedCount(dateStr);
        let status = 'missed';
        
        if (habits.length > 0) {
          if (completedCount === habits.length) {
            status = 'complete';
          } else if (completedCount > 0) {
            status = 'partial';
          }
        } else {
          status = 'complete'; // Free pass if no habits defined
        }

        Store.updateStreak(dateStr, status);
        evaluatedAny = true;

        if (status === 'missed') {
          missedDaysCount++;
          if (user.hardMode) {
            // Under Hard Mode, any missed day resets the current streak entirely
            const streaks = Store.getStreaks();
            streaks.current = 0;
            Store.save();
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }

    if (evaluatedAny) {
      // Re-evaluate today's active streak parameters
      Streaks.evaluateDay(todayStr);
      
      if (missedDaysCount > 0 && user.hardMode) {
        setTimeout(() => {
          UI.showToast(`💀 Hard Mode Penalty: Missed days detected! Current streak reset to 0.`, 'error', 5000);
        }, 1000);
      }
    }
  }

  /**
   * Handle exporting save state
   */
  function handleExport() {
    const dataStr = Store.exportData();
    const modalContent = `
      <div class="modal-title">Export Save File</div>
      <p class="modal-body" style="font-size:var(--fs-sm)">Copy this code block and save it somewhere safe. You can import it later to restore your progress.</p>
      <textarea class="data-text-area" readonly id="export-textarea">${dataStr}</textarea>
      <div class="modal-actions">
        <button class="btn btn-primary" id="btn-copy-export">Copy to Clipboard</button>
        <button class="btn btn-ghost" onclick="UI.closeModal()">Close</button>
      </div>
    `;
    UI.showModal(modalContent, { closable: true });

    const btnCopy = document.getElementById('btn-copy-export');
    const textCopy = document.getElementById('export-textarea');
    if (btnCopy && textCopy) {
      btnCopy.addEventListener('click', () => {
        textCopy.select();
        document.execCommand('copy');
        UI.showToast('📋 Save file copied to clipboard!', 'success');
      });
    }
  }

  /**
   * Handle importing save state
   */
  function handleImport() {
    const modalContent = `
      <div class="modal-title">Import Save File</div>
      <p class="modal-body" style="font-size:var(--fs-sm)">Paste a copied LifeReset66 save JSON code below to overwrite and restore your progress.</p>
      <textarea class="data-text-area" id="import-textarea" placeholder='Paste save JSON here...'></textarea>
      <div class="modal-actions">
        <button class="btn btn-danger" id="btn-confirm-import">Over-write Save</button>
        <button class="btn btn-ghost" onclick="UI.closeModal()">Cancel</button>
      </div>
    `;
    UI.showModal(modalContent, { closable: true });

    const btnConfirm = document.getElementById('btn-confirm-import');
    if (btnConfirm) {
      btnConfirm.addEventListener('click', () => {
        const importText = document.getElementById('import-textarea').value.trim();
        if (!importText) {
          UI.showToast('Text area is empty!', 'error');
          return;
        }
        
        try {
          // Quick syntax check
          JSON.parse(importText);
          
          UI.showConfirm('Import Save', 'Are you sure? This will delete all current progress and overwrite your save!', () => {
            Store.importData(importText);
            UI.closeModal();
            UI.showToast('🎉 Save file imported successfully!', 'success');
            // Refresh
            location.reload();
          });
        } catch (e) {
          UI.showToast('Invalid JSON file format.', 'error');
        }
      });
    }
  }

  /**
   * Handle resetting all progress
   */
  function handleReset() {
    UI.showConfirm(
      '💀 Reset All Progress',
      'This will delete all habits, streaks, level status, focus timers, and reset the app to factory settings. This cannot be undone. Proceed?',
      () => {
        Store.reset();
        UI.showToast('App has been reset.', 'default');
        location.reload();
      }
    );
  }

  // Expose active page router to window so UI.showPage can be backed up if needed
  window.renderActivePage = renderActivePage;

})();
