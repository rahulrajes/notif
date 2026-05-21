// background.js — service worker

chrome.runtime.onMessage.addListener(function (message) {

  if (message.type === 'POLL_STARTED') {

    pickRandomFriend(function (friendFilename) {

      chrome.storage.local.set({
        pollActive: true,
        currentFriend: friendFilename,
      });

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

          if (settings.soundEnabled) {
            playSound();
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

// ── Play sound via offscreen document ──
// Service workers have no audio API.
// iClicker's CSP blocks audio in content scripts.
// Offscreen documents run in the extension's context — no restrictions.
async function playSound() {
  // Only one offscreen document can exist at a time — check first
  const existing = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
  });

  if (existing.length === 0) {
    await chrome.offscreen.createDocument({
      url:           'offscreen.html',
      reasons:       ['AUDIO_PLAYBACK'],
      justification: 'Play alert beep when a poll question goes live',
    });
  }

  chrome.runtime.sendMessage({ type: 'PLAY_SOUND_OFFSCREEN' });
}

// ── Pick a random friend image ──
function pickRandomFriend(callback) {
  fetch(chrome.runtime.getURL('assets/friends.json'))
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const list = data.friends || [];
      callback(list.length === 0 ? null : list[Math.floor(Math.random() * list.length)]);
    })
    .catch(function () { callback(null); });
}
