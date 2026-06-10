/* ============================================================
   Motivational Cards — window.Cards
   LifeReset66 Gamified Habit Tracker
   ============================================================ */

window.Cards = (() => {

  // ── Quote Data (55 curated quotes) ───────────────────────────
  const quotes = [
    // ─── Discipline ────────────────────────────────────────
    { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius', category: 'discipline' },
    { text: 'We suffer more often in imagination than in reality.', author: 'Seneca', category: 'discipline' },
    { text: 'No man is free who is not master of himself.', author: 'Epictetus', category: 'discipline' },
    { text: 'The impediment to action advances action. What stands in the way becomes the way.', author: 'Marcus Aurelius', category: 'discipline' },
    { text: 'It is not that we have a short time to live, but that we waste a great deal of it.', author: 'Seneca', category: 'discipline' },
    { text: 'Discipline equals freedom.', author: 'Jocko Willink', category: 'discipline' },
    { text: 'Don\'t expect to be motivated every day to get out there and make things happen. You won\'t be. Don\'t count on motivation. Count on discipline.', author: 'Jocko Willink', category: 'discipline' },
    { text: 'The more you sweat in training, the less you bleed in combat.', author: 'Richard Marcinko', category: 'discipline' },
    { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', category: 'discipline' },
    { text: 'Suffer the pain of discipline or suffer the pain of regret.', author: 'Jim Rohn', category: 'discipline' },
    { text: 'Self-discipline is the magic power that makes you virtually unstoppable.', author: 'Dan Kennedy', category: 'discipline' },

    // ─── Focus ─────────────────────────────────────────────
    { text: 'It is not enough to be busy. The question is: what are we busy about?', author: 'Henry David Thoreau', category: 'focus' },
    { text: 'The successful warrior is the average man, with laser-like focus.', author: 'Bruce Lee', category: 'focus' },
    { text: 'Concentrate all your thoughts upon the work at hand. The sun\'s rays do not burn until brought to a focus.', author: 'Alexander Graham Bell', category: 'focus' },
    { text: 'Where focus goes, energy flows.', author: 'Tony Robbins', category: 'focus' },
    { text: 'You will never reach your destination if you stop and throw stones at every dog that barks.', author: 'Winston Churchill', category: 'focus' },
    { text: 'The main thing is to keep the main thing the main thing.', author: 'Stephen Covey', category: 'focus' },
    { text: 'People think focus means saying yes to the thing you\'ve got to focus on. It means saying no to the hundred other good ideas.', author: 'Steve Jobs', category: 'focus' },
    { text: 'Starve your distractions, feed your focus.', author: 'Daniel Goleman', category: 'focus' },
    { text: 'Until you value your time, you will not do anything with it.', author: 'M. Scott Peck', category: 'focus' },
    { text: 'You can do anything, but not everything.', author: 'David Allen', category: 'focus' },
    { text: 'What you stay focused on will grow.', author: 'Roy T. Bennett', category: 'focus' },

    // ─── Strength ──────────────────────────────────────────
    { text: 'Be willing to be uncomfortable. Be comfortable being uncomfortable.', author: 'David Goggins', category: 'strength' },
    { text: 'Don\'t stop when you\'re tired. Stop when you\'re done.', author: 'David Goggins', category: 'strength' },
    { text: 'You are in danger of living a life so comfortable and soft, that you will die without ever realizing your true potential.', author: 'David Goggins', category: 'strength' },
    { text: 'The only easy day was yesterday.', author: 'Navy SEAL Motto', category: 'strength' },
    { text: 'Hard times create strong men, strong men create good times.', author: 'G. Michael Hopf', category: 'strength' },
    { text: 'Strength does not come from winning. Your struggles develop your strengths.', author: 'Arnold Schwarzenegger', category: 'strength' },
    { text: 'The world breaks everyone, and afterward, many are strong at the broken places.', author: 'Ernest Hemingway', category: 'strength' },
    { text: 'Get comfortable being uncomfortable. That\'s how you break the plateau.', author: 'Jocko Willink', category: 'strength' },
    { text: 'A warrior\'s greatest weapon is not a sword, but his iron will.', author: 'Unknown', category: 'strength' },
    { text: 'Do not pray for an easy life; pray for the strength to endure a difficult one.', author: 'Bruce Lee', category: 'strength' },
    { text: 'Pain is weakness leaving the body.', author: 'Marine Corps Proverb', category: 'strength' },

    // ─── Growth ────────────────────────────────────────────
    { text: 'Atomic habits are the compound interest of self-improvement.', author: 'James Clear', category: 'growth' },
    { text: 'Every action you take is a vote for the type of person you wish to become.', author: 'James Clear', category: 'growth' },
    { text: 'You do not rise to the level of your goals. You fall to the level of your systems.', author: 'James Clear', category: 'growth' },
    { text: 'The obstacle is the way.', author: 'Ryan Holiday', category: 'growth' },
    { text: 'Ego is the enemy.', author: 'Ryan Holiday', category: 'growth' },
    { text: 'If you are not willing to learn, no one can help you. If you are determined to learn, no one can stop you.', author: 'Zig Ziglar', category: 'growth' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb', category: 'growth' },
    { text: 'Desire is a contract you make with yourself to be unhappy until you get what you want.', author: 'Naval Ravikant', category: 'growth' },
    { text: 'A fit body, a calm mind, a house full of love. These things cannot be bought — they must be earned.', author: 'Naval Ravikant', category: 'growth' },
    { text: 'Play long-term games with long-term people.', author: 'Naval Ravikant', category: 'growth' },
    { text: 'The greatest glory in living lies not in never falling, but in rising every time we fall.', author: 'Nelson Mandela', category: 'growth' },

    // ─── Resilience ────────────────────────────────────────
    { text: 'The gem cannot be polished without friction, nor man perfected without trials.', author: 'Seneca', category: 'resilience' },
    { text: 'Difficulties strengthen the mind, as labor does the body.', author: 'Seneca', category: 'resilience' },
    { text: 'It\'s not whether you get knocked down, it\'s whether you get up.', author: 'Vince Lombardi', category: 'resilience' },
    { text: 'Fall seven times, stand up eight.', author: 'Japanese Proverb', category: 'resilience' },
    { text: 'What does not kill me makes me stronger.', author: 'Friedrich Nietzsche', category: 'resilience' },
    { text: 'Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.', author: 'Thomas Edison', category: 'resilience' },
    { text: 'Persistence guarantees that results are inevitable.', author: 'Paramahansa Yogananda', category: 'resilience' },
    { text: 'You may have to fight a battle more than once to win it.', author: 'Margaret Thatcher', category: 'resilience' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', category: 'resilience' },
    { text: 'Rock bottom became the solid foundation on which I rebuilt my life.', author: 'J.K. Rowling', category: 'resilience' },
    { text: 'Courage is not having the strength to go on; it is going on when you don\'t have the strength.', author: 'Theodore Roosevelt', category: 'resilience' },
  ];

  // ── Category Configs ─────────────────────────────────────────
  const CATEGORY_CONFIG = {
    discipline: { icon: '⚔️',  gradient: 'linear-gradient(135deg, #00b4d8, #0077b6)', label: 'Discipline' },
    focus:      { icon: '🎯',  gradient: 'linear-gradient(135deg, #7b2ff7, #4a0e8f)', label: 'Focus' },
    strength:   { icon: '🔥',  gradient: 'linear-gradient(135deg, #ff6b35, #d62828)', label: 'Strength' },
    growth:     { icon: '🌱',  gradient: 'linear-gradient(135deg, #2dd4bf, #0891b2)', label: 'Growth' },
    resilience: { icon: '🛡️',  gradient: 'linear-gradient(135deg, #f59e0b, #ea580c)', label: 'Resilience' },
  };

  // ── Helpers ──────────────────────────────────────────────────

  /**
   * Simple deterministic hash from a string → integer.
   */
  function _hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + ch;
      hash |= 0; // Convert to 32-bit int
    }
    return Math.abs(hash);
  }

  // ── Public API ───────────────────────────────────────────────

  /**
   * Get today's deterministic daily card.
   */
  function getDailyCard() {
    const today = Store.getTodayString();
    const idx = _hashString(today) % quotes.length;
    return quotes[idx];
  }

  /**
   * Render a single motivational card into `container`.
   */
  function renderCard(quote, container) {
    if (!container || !quote) return;

    const config = CATEGORY_CONFIG[quote.category] || CATEGORY_CONFIG.discipline;

    const card = UI.createElement('div', 'moti-card');
    card.innerHTML = `
      <div class="moti-card-inner">
        <div class="moti-card-front" style="background:${config.gradient}">
          <span class="moti-card-category-icon">${config.icon}</span>
          <span class="moti-card-label">Daily Wisdom</span>
          <span class="moti-card-tap">Tap to reveal</span>
        </div>
        <div class="moti-card-back">
          <blockquote class="moti-card-quote">"${quote.text}"</blockquote>
          <cite class="moti-card-author">— ${quote.author}</cite>
          <span class="moti-card-tag" style="background:${config.gradient}">${config.label}</span>
        </div>
      </div>`;

    // 3D flip on click
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });

    container.appendChild(card);
  }

  /**
   * Render the daily card widget (for dashboard use).
   */
  function renderDailyCard(container) {
    if (!container) return;
    container.innerHTML = '';

    const wrapper = UI.createElement('div', 'daily-card-wrapper');
    const quote = getDailyCard();
    renderCard(quote, wrapper);
    container.appendChild(wrapper);
  }

  /**
   * Render the full cards browser (modal view with navigation & filtering).
   */
  function renderCardsBrowser() {
    let currentIdx = 0;
    let activeCategory = 'all';
    let filteredQuotes = [...quotes];

    function _getFiltered() {
      if (activeCategory === 'all') return [...quotes];
      return quotes.filter(q => q.category === activeCategory);
    }

    function _buildContent() {
      filteredQuotes = _getFiltered();
      if (currentIdx >= filteredQuotes.length) currentIdx = 0;
      const quote = filteredQuotes[currentIdx];
      const config = quote ? (CATEGORY_CONFIG[quote.category] || CATEGORY_CONFIG.discipline) : CATEGORY_CONFIG.discipline;

      return `
        <div class="cards-browser">
          <h2 class="cards-browser-title">Motivational Cards</h2>

          <!-- Category filters -->
          <div class="cards-filter-row">
            <button class="cards-filter-btn${activeCategory === 'all' ? ' active' : ''}" data-cat="all">All</button>
            ${Object.keys(CATEGORY_CONFIG).map(cat =>
              `<button class="cards-filter-btn${activeCategory === cat ? ' active' : ''}" data-cat="${cat}">
                ${CATEGORY_CONFIG[cat].icon}
              </button>`
            ).join('')}
          </div>

          <!-- Card counter -->
          <div class="cards-counter">${filteredQuotes.length > 0 ? currentIdx + 1 : 0} / ${filteredQuotes.length}</div>

          <!-- Card display -->
          <div class="cards-display">
            ${quote ? `
            <div class="moti-card browser-card">
              <div class="moti-card-inner">
                <div class="moti-card-front" style="background:${config.gradient}">
                  <span class="moti-card-category-icon">${config.icon}</span>
                  <span class="moti-card-label">${config.label}</span>
                  <span class="moti-card-tap">Tap to reveal</span>
                </div>
                <div class="moti-card-back">
                  <blockquote class="moti-card-quote">"${quote.text}"</blockquote>
                  <cite class="moti-card-author">— ${quote.author}</cite>
                  <span class="moti-card-tag" style="background:${config.gradient}">${config.label}</span>
                </div>
              </div>
            </div>
            ` : '<p class="cards-empty">No cards in this category</p>'}
          </div>

          <!-- Navigation -->
          <div class="cards-nav">
            <button class="cards-nav-btn" id="cards-prev" ${currentIdx <= 0 ? 'disabled' : ''}>
              ‹ Prev
            </button>
            <button class="cards-nav-btn" id="cards-next" ${currentIdx >= filteredQuotes.length - 1 ? 'disabled' : ''}>
              Next ›
            </button>
          </div>
        </div>`;
    }

    function _showBrowser() {
      UI.showModal(_buildContent(), { closable: true, className: 'cards-browser-modal' });

      // Bind events after DOM render
      setTimeout(() => _bindBrowserEvents(), 50);
    }

    function _bindBrowserEvents() {
      const modal = UI.$('.cards-browser-modal') || UI.$('.modal');
      if (!modal) return;

      // Filter buttons
      modal.querySelectorAll('.cards-filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          activeCategory = btn.dataset.cat;
          currentIdx = 0;
          // Re-render modal content in-place
          const browser = modal.querySelector('.cards-browser');
          if (browser) {
            const tmp = document.createElement('div');
            tmp.innerHTML = _buildContent();
            const newBrowser = tmp.querySelector('.cards-browser');
            browser.replaceWith(newBrowser);
            setTimeout(() => _bindBrowserEvents(), 30);
          }
        });
      });

      // Navigation
      const prevBtn = modal.querySelector('#cards-prev');
      const nextBtn = modal.querySelector('#cards-next');

      if (prevBtn) {
        prevBtn.addEventListener('click', () => {
          if (currentIdx > 0) {
            currentIdx--;
            const browser = modal.querySelector('.cards-browser');
            if (browser) {
              const tmp = document.createElement('div');
              tmp.innerHTML = _buildContent();
              const newBrowser = tmp.querySelector('.cards-browser');
              browser.replaceWith(newBrowser);
              setTimeout(() => _bindBrowserEvents(), 30);
            }
          }
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          if (currentIdx < filteredQuotes.length - 1) {
            currentIdx++;
            const browser = modal.querySelector('.cards-browser');
            if (browser) {
              const tmp = document.createElement('div');
              tmp.innerHTML = _buildContent();
              const newBrowser = tmp.querySelector('.cards-browser');
              browser.replaceWith(newBrowser);
              setTimeout(() => _bindBrowserEvents(), 30);
            }
          }
        });
      }

      // Card flip
      const card = modal.querySelector('.moti-card');
      if (card) {
        card.addEventListener('click', () => card.classList.toggle('flipped'));
      }
    }

    _showBrowser();
  }

  // ── Expose ───────────────────────────────────────────────────
  return {
    quotes,
    getDailyCard,
    renderDailyCard,
    renderCardsBrowser,
    renderCard,
  };
})();
