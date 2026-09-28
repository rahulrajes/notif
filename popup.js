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

  // ── Read settings on open, decide which screen to show ──
  chrome.storage.local.get(
    {
      onboardingComplete: false,
      platform: null,          // 'iClicker' or 'TopHat'
      notificationsEnabled: true,
      soundEnabled: true,
      pollActive: false,
      macNoticeDismissed: false,   // hide the macOS-notifications reminder once acknowledged
    },
    function (s) {

      if (!s.onboardingComplete) { showScreen('onboarding'); return; }
      if (!s.platform)           { showScreen('platform');   return; }

      document.getElementById('footer-platform').textContent = 'Watching ' + s.platform;

      // If a poll is active → poll screen
      if (s.pollActive) { showPollScreen(s.platform); return; }

      // Otherwise → settings
      showScreen('main');
      document.getElementById('toggle-notifications').checked = s.notificationsEnabled;
      document.getElementById('toggle-sound').checked         = s.soundEnabled;
      if (s.macNoticeDismissed) {
        document.getElementById('mac-notice').hidden = true;
      }
    }
  );

  // ── Poll screen ──
  function showPollScreen(platform) {
    showScreen('poll');
    document.getElementById('poll-platform').textContent = platform || 'your class';
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

  // Dismiss the macOS-notifications reminder and remember it stays hidden.
  document.getElementById('btn-dismiss-notice').addEventListener('click', function () {
    chrome.storage.local.set({ macNoticeDismissed: true });
    document.getElementById('mac-notice').hidden = true;
  });

  // Test notification — lets the user confirm their macOS Chrome-notification
  // setting is actually on. If no banner appears, the OS is blocking Chrome.
  document.getElementById('btn-test-notif').addEventListener('click', function () {
    chrome.notifications.create('notif-test', {
      type:     'basic',
      iconUrl:  'icons/icon128.png',
      title:    '✅ Notifications are on!',
      message:  "If you can see this banner, you're all set for live polls.",
      priority: 2,
    });
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
