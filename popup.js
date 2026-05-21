// popup.js — runs inside the popup window when you click the extension icon.
// Its job: load saved settings from chrome.storage, display them, and save changes.

(function () {
  'use strict';

  const toggleNotifications = document.getElementById('toggle-notifications');
  const toggleSound         = document.getElementById('toggle-sound');
  const statusBadge         = document.getElementById('status-badge');

  // --- Load saved settings when popup opens ---
  // chrome.storage.local is like localStorage but for extensions.
  // It persists across browser restarts and is scoped to your extension.
  chrome.storage.local.get(
    { notificationsEnabled: true, soundEnabled: true, pollActive: false },
    function (settings) {
      toggleNotifications.checked = settings.notificationsEnabled;
      toggleSound.checked         = settings.soundEnabled;

      // Reflect whether a poll is currently live
      if (settings.pollActive) {
        statusBadge.textContent = 'LIVE';
        statusBadge.className   = 'badge badge--live';
      }
    }
  );

  // --- Save when a toggle changes ---
  toggleNotifications.addEventListener('change', function () {
    chrome.storage.local.set({ notificationsEnabled: toggleNotifications.checked });
  });

  toggleSound.addEventListener('change', function () {
    chrome.storage.local.set({ soundEnabled: toggleSound.checked });
  });

})();
