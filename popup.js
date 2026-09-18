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

  // Images where we want to see the whole thing (contain) vs just the face (cover).
  // contain = shrink to fit the box, no cropping — good for body shots or close faces
  // cover  = fill the box and crop overflow — good for centered portrait shots
  const CONTAIN_IMAGES = new Set([
    // Add a filename here if 'cover' crops that photo badly — it'll use
    // 'contain' (shrink-to-fit, no cropping) instead. Empty = all use 'cover'.
  ]);

  // ── Poll screen: load friend image ──
  function showPollScreen(filename) {
    showScreen('poll');
    const img = document.getElementById('friend-img');
    img.style.objectFit      = CONTAIN_IMAGES.has(filename) ? 'contain' : 'cover';
    img.style.objectPosition = CONTAIN_IMAGES.has(filename) ? 'center center' : 'center top';
    img.src = chrome.runtime.getURL('assets/friends/' + filename);
    img.onerror = function () {
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

  // Platform picker → TopHat (not supported yet — show a "coming soon" note
  // instead of selecting it, so TopHat users aren't left with a silent no-op)
  document.getElementById('btn-pick-tophat').addEventListener('click', function () {
    document.getElementById('tophat-note').hidden = false;
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

  // Open the reviewer/dev demo page. Using getURL guarantees it opens as an
  // extension page (chrome-extension://…/test.html) so chrome.runtime works there.
  document.getElementById('btn-open-demo').addEventListener('click', function () {
    chrome.tabs.create({ url: chrome.runtime.getURL('test.html') });
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
