/* ============================================
   LifeReset66 — UI Utilities
   Toasts, modals, animations, navigation, FX
   ============================================ */

(function () {
  'use strict';

  // ====== LEVEL TITLES MAP ======
  var LEVEL_TITLES = [
    { level: 1,  title: 'Novice' },
    { level: 3,  title: 'Initiate' },
    { level: 5,  title: 'Apprentice' },
    { level: 8,  title: 'Warrior' },
    { level: 11, title: 'Champion' },
    { level: 14, title: 'Veteran' },
    { level: 17, title: 'Legend' },
    { level: 20, title: 'Ascended' }
  ];

  // Confetti palette
  var CONFETTI_COLORS = [
    '#06b6d4', '#8b5cf6', '#f59e0b', '#f97316',
    '#10b981', '#ef4444', '#ec4899', '#6366f1',
    '#14b8a6', '#a855f7'
  ];

  window.UI = {

    // ====== DOM HELPERS ======

    /**
     * querySelector shortcut
     * @param {string} selector
     * @returns {Element|null}
     */
    $(selector) {
      return document.querySelector(selector);
    },

    /**
     * querySelectorAll shortcut
     * @param {string} selector
     * @returns {NodeListOf<Element>}
     */
    $$(selector) {
      return document.querySelectorAll(selector);
    },

    /**
     * Create and return a DOM element
     * @param {string} tag
     * @param {string} [className]
     * @param {string} [innerHTML]
     * @returns {HTMLElement}
     */
    createElement(tag, className, innerHTML) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (innerHTML) el.innerHTML = innerHTML;
      return el;
    },

    // ====== TOASTS ======

    /**
     * Ensure the toast container exists
     * @returns {HTMLElement}
     */
    _getToastContainer() {
      var container = document.querySelector('.toast-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
      return container;
    },

    /**
     * Show a toast notification
     * @param {string} message  - HTML string or text
     * @param {string} [type]   - 'default'|'xp'|'level'|'streak'|'error'
     * @param {number} [duration] - ms before auto-dismiss (default 3000)
     */
    showToast(message, type, duration) {
      type = type || 'default';
      duration = duration || 3000;

      var container = this._getToastContainer();

      var toast = document.createElement('div');
      var typeClass = type !== 'default' ? ' toast-' + type : '';
      toast.className = 'toast' + typeClass;
      toast.innerHTML = message;

      container.appendChild(toast);

      // Auto-dismiss
      setTimeout(function () {
        toast.classList.add('toast-exit');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
      }, duration);
    },

    /**
     * Shortcut: gold-styled XP gain toast
     * @param {number} amount
     */
    showXPToast(amount) {
      this.showToast('⚡ +' + amount + ' XP', 'xp', 2500);
    },

    /**
     * Shortcut: level-up toast
     * @param {number} level
     */
    showLevelUpToast(level) {
      this.showToast('🎉 Level Up! You are now <strong>Level ' + level + '</strong>', 'level', 4000);
    },

    /**
     * Shortcut: streak toast with fire
     * @param {number} count
     */
    showStreakToast(count) {
      this.showToast('🔥 ' + count + ' Day Streak!', 'streak', 3000);
    },

    // ====== MODALS ======

    /**
     * Show a modal with HTML content
     * @param {string} content  - inner HTML
     * @param {object} [options]
     * @param {boolean} [options.closable=true]
     * @param {string} [options.className]
     */
    showModal(content, options) {
      options = options || {};
      var closable = options.closable !== false;

      // Remove any existing modal
      this.closeModal();

      var overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.id = 'active-modal-overlay';

      var modal = document.createElement('div');
      modal.className = 'modal' + (options.className ? ' ' + options.className : '');
      modal.innerHTML = content;

      if (closable) {
        var closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '✕';
        closeBtn.addEventListener('click', function () {
          window.UI.closeModal();
        });
        modal.insertBefore(closeBtn, modal.firstChild);

        // Close on overlay click
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) {
            window.UI.closeModal();
          }
        });
      }

      overlay.appendChild(modal);
      document.body.appendChild(overlay);
    },

    /** Close the current modal */
    closeModal() {
      var overlay = document.getElementById('active-modal-overlay');
      if (overlay) {
        overlay.style.animation = 'fadeIn 0.2s ease reverse forwards';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 200);
      }
    },

    /**
     * Confirmation dialog
     * @param {string} title
     * @param {string} message
     * @param {Function} onConfirm
     */
    showConfirm(title, message, onConfirm) {
      var html =
        '<div class="modal-title">' + title + '</div>' +
        '<div class="modal-body">' + message + '</div>' +
        '<div class="modal-actions">' +
          '<button class="btn btn-ghost" id="modal-cancel-btn">Cancel</button>' +
          '<button class="btn btn-danger" id="modal-confirm-btn">Confirm</button>' +
        '</div>';

      this.showModal(html, { closable: true });

      document.getElementById('modal-cancel-btn').addEventListener('click', function () {
        window.UI.closeModal();
      });

      document.getElementById('modal-confirm-btn').addEventListener('click', function () {
        window.UI.closeModal();
        if (typeof onConfirm === 'function') onConfirm();
      });
    },

    // ====== ANIMATIONS ======

    /**
     * Apply a CSS animation class, remove after it completes
     * @param {HTMLElement} el
     * @param {string} animationName  - name of @keyframes
     * @param {number} [duration]     - ms (default 500)
     */
    animateElement(el, animationName, duration) {
      duration = duration || 500;
      el.style.animation = animationName + ' ' + (duration / 1000) + 's ease';
      setTimeout(function () {
        el.style.animation = '';
      }, duration);
    },

    /**
     * Create a particle burst at x,y
     * @param {number} x
     * @param {number} y
     * @param {number} [count]
     * @param {string} [color]
     */
    createParticles(x, y, count, color) {
      count = count || 12;
      color = color || '#06b6d4';

      for (var i = 0; i < count; i++) {
        var particle = document.createElement('div');
        particle.className = 'particle';

        var size = Math.random() * 6 + 3;
        var angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        var distance = Math.random() * 60 + 30;
        var dx = Math.cos(angle) * distance;
        var dy = Math.sin(angle) * distance;
        var dur = Math.random() * 400 + 400;

        particle.style.cssText =
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'left:' + x + 'px;' +
          'top:' + y + 'px;' +
          'background:' + color + ';' +
          'opacity:1;' +
          'transition:all ' + (dur / 1000) + 's ease-out;';

        document.body.appendChild(particle);

        // Trigger animation in next frame
        requestAnimationFrame(function (p, dx, dy) {
          return function () {
            p.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
            p.style.opacity = '0';
          };
        }(particle, dx, dy));

        // Cleanup
        (function (p, d) {
          setTimeout(function () {
            if (p.parentNode) p.parentNode.removeChild(p);
          }, d + 50);
        })(particle, dur);
      }
    },

    /**
     * Full-screen confetti celebration
     */
    createConfetti() {
      var count = 120;
      for (var i = 0; i < count; i++) {
        (function (index) {
          setTimeout(function () {
            var piece = document.createElement('div');
            piece.className = 'confetti-piece';
            var color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            var left = Math.random() * 100;
            var width = Math.random() * 8 + 5;
            var height = Math.random() * 4 + 3;
            var fallDuration = Math.random() * 2 + 2;
            var rotation = Math.random() * 1080;

            piece.style.cssText =
              'left:' + left + '%;' +
              'width:' + width + 'px;' +
              'height:' + height + 'px;' +
              'background:' + color + ';' +
              'border-radius:2px;' +
              '--fall-duration:' + fallDuration + 's;' +
              '--rotation:' + rotation + 'deg;';

            document.body.appendChild(piece);

            setTimeout(function () {
              if (piece.parentNode) piece.parentNode.removeChild(piece);
            }, fallDuration * 1000 + 200);
          }, index * 15);
        })(i);
      }
    },

    /**
     * Create floating text that rises and fades out (for +XP)
     * @param {number} x
     * @param {number} y
     * @param {string} text
     * @param {string} [className]
     */
    createFloatingText(x, y, text, className) {
      var el = document.createElement('div');
      el.className = 'floating-text' + (className ? ' ' + className : '');
      el.textContent = text;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      document.body.appendChild(el);

      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 1500);
    },

    // ====== NAVIGATION ======

    /**
     * Switch to a page view
     * @param {string} pageId - id of the page element (without #)
     */
    showPage(pageId) {
      // Deactivate all pages
      var pages = document.querySelectorAll('.page');
      for (var i = 0; i < pages.length; i++) {
        pages[i].classList.remove('active');
      }

      // Activate target page
      var target = document.getElementById(pageId);
      if (target) {
        target.classList.add('active');
      }

      // Update nav items
      var navItems = document.querySelectorAll('.nav-item');
      for (var j = 0; j < navItems.length; j++) {
        navItems[j].classList.remove('active');
        var navTarget = navItems[j].getAttribute('data-page');
        if (navTarget === pageId) {
          navItems[j].classList.add('active');
        }
      }
    },

    // ====== LEVEL CEREMONY ======

    /**
     * Get the level title for a given level
     * @param {number} level
     * @returns {string}
     */
    getLevelTitle(level) {
      var title = 'Novice';
      for (var i = 0; i < LEVEL_TITLES.length; i++) {
        if (level >= LEVEL_TITLES[i].level) {
          title = LEVEL_TITLES[i].title;
        }
      }
      return title;
    },

    /**
     * Full-screen level-up celebration overlay
     * @param {number} level
     * @param {string} [title]  - custom title override
     */
    showLevelUpCeremony(level, title) {
      title = title || this.getLevelTitle(level);

      var overlay = document.createElement('div');
      overlay.className = 'levelup-overlay';
      overlay.innerHTML =
        '<div class="levelup-badge">' + level + '</div>' +
        '<div class="levelup-title">LEVEL UP!</div>' +
        '<div class="levelup-subtitle">' + title + '</div>';

      document.body.appendChild(overlay);

      // Confetti burst
      this.createConfetti();

      // Dismiss on click
      overlay.addEventListener('click', function () {
        overlay.style.animation = 'fadeIn 0.3s ease reverse forwards';
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 300);
      });

      // Auto-dismiss after 4 seconds
      setTimeout(function () {
        if (overlay.parentNode) {
          overlay.style.animation = 'fadeIn 0.3s ease reverse forwards';
          setTimeout(function () {
            if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
          }, 300);
        }
      }, 4000);
    }
  };
})();
