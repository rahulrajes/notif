// popup.js — controls which screen is visible and handles all popup interactions.

(function () {
  'use strict';

  // ── Screens ──
  const screens = {
    onboarding: document.getElementById('screen-onboarding'),
    platform:   document.getElementById('screen-platform'),
    main:       document.getElementById('screen-main'),
    poll:       document.getElementById('screen-poll'),
  };

  // ── Show exactly one screen, hide the rest ──
  function showScreen(name) {
    Object.keys(screens).forEach(function (key) {
      screens[key].hidden = (key !== name);
    });
  }

  // ── Read all settings on open, decide which screen to show ──
  chrome.storage.local.get(
    {
      onboardingComplete: false,
      platform: null,          // 'iClicker' or 'TopHat'
      notificationsEnabled: true,
      soundEnabled: true,
      pollActive: false,
      currentFriend: null,     // filename of the selected friend image
    },
    function (s) {

      if (!s.onboardingComplete) {
        showScreen('onboarding');
        return;
      }

      if (!s.platform) {
        showScreen('platform');
        return;
      }

      // Update footer platform label
      document.getElementById('footer-platform').textContent = 'Watching ' + s.platform;

      // If a poll is active and we have a friend to show → poll screen
      if (s.pollActive && s.currentFriend) {
        showPollScreen(s.currentFriend);
        return;
      }

      // Otherwise → normal settings screen
      showScreen('main');
      document.getElementById('toggle-notifications').checked = s.notificationsEnabled;
      document.getElementById('toggle-sound').checked         = s.soundEnabled;

      if (s.pollActive) {
        const badge = document.getElementById('status-badge');
        badge.textContent = 'LIVE';
        badge.className   = 'badge badge--live';
      }
    }
  );

  // ── Poll screen: load friend image ──
  function showPollScreen(filename) {
    showScreen('poll');
    const img = document.getElementById('friend-img');
    img.src = chrome.runtime.getURL('assets/friends/' + filename);
    img.onerror = function () {
      // If the image fails to load, show a text fallback
      img.parentElement.innerHTML =
        '<p class="poll__no-friends">📸 (add photos to assets/friends/ to see your friends here)</p>';
    };
  }

  // ══════════════════════════════════
  // Button handlers
  // ══════════════════════════════════

  // Onboarding → done
  document.getElementById('btn-onboarding-done').addEventListener('click', function () {
    chrome.storage.local.set({ onboardingComplete: true }, function () {
      showScreen('platform');
    });
  });

  // Platform picker → iClicker
  document.getElementById('btn-pick-iclicker').addEventListener('click', function () {
    chrome.storage.local.set({ platform: 'iClicker' }, function () {
      document.getElementById('footer-platform').textContent = 'Watching iClicker';
      showScreen('main');
    });
  });

  // Platform picker → TopHat
  document.getElementById('btn-pick-tophat').addEventListener('click', function () {
    chrome.storage.local.set({ platform: 'TopHat' }, function () {
      document.getElementById('footer-platform').textContent = 'Watching TopHat';
      showScreen('main');
    });
  });

  // Main → switch platform
  document.getElementById('btn-switch-platform').addEventListener('click', function () {
    chrome.storage.local.set({ platform: null }, function () {
      showScreen('platform');
    });
  });

  // Poll screen → continue
  document.getElementById('btn-continue').addEventListener('click', function () {
    showScreen('main');
  });

  // ══════════════════════════════════
  // Toggle persistence
  // ══════════════════════════════════

  document.getElementById('toggle-notifications').addEventListener('change', function () {
    chrome.storage.local.set({ notificationsEnabled: this.checked });
  });

  document.getElementById('toggle-sound').addEventListener('change', function () {
    chrome.storage.local.set({ soundEnabled: this.checked });
  });

})();
