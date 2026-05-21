// background.js — service worker

chrome.runtime.onMessage.addListener(function (message, sender) {

  if (message.type === 'POLL_STARTED') {

    // Pick a random friend image, then do everything else
    pickRandomFriend(function (friendFilename) {

      chrome.storage.local.set({
        pollActive: true,
        currentFriend: friendFilename,  // null if no friends added yet
      });

      // LIVE badge on the toolbar icon
      chrome.action.setBadgeText({ text: 'LIVE' });
      chrome.action.setBadgeBackgroundColor({ color: '#cc3300' });

      chrome.storage.local.get(
        { notificationsEnabled: true, soundEnabled: true },
        function (settings) {

          if (settings.notificationsEnabled) {
            chrome.notifications.create('poll-active', {
              type:     'basic',
              iconUrl:  'icons/icon128.png',
              title:    '🔔 Poll question is live!',
              message:  message.platform + ' — click the notif icon and answer now.',
              priority: 2,
            });
          }

          if (settings.soundEnabled && sender.tab) {
            chrome.tabs.sendMessage(sender.tab.id, { type: 'PLAY_SOUND' });
          }
        }
      );
    });
  }

  if (message.type === 'POLL_ENDED') {
    chrome.storage.local.set({ pollActive: false, currentFriend: null });
    chrome.action.setBadgeText({ text: '' });
  }
});

// ── Pick a random filename from assets/friends.json ──
// Uses fetch() to read the JSON file bundled with the extension.
// Returns null if the list is empty (user hasn't added photos yet).
function pickRandomFriend(callback) {
  fetch(chrome.runtime.getURL('assets/friends.json'))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const list = data.friends || [];
      if (list.length === 0) {
        callback(null);
      } else {
        const pick = list[Math.floor(Math.random() * list.length)];
        callback(pick);
      }
    })
    .catch(function () {
      callback(null); // if anything goes wrong, just skip the image
    });
}
