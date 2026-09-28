// background.js — service worker

chrome.runtime.onMessage.addListener(function (message) {

  if (message.type === 'POLL_STARTED') {

    chrome.storage.local.set({ pollActive: true });

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
            message:  message.platform + ' — switch to the tab and answer now.',
            priority: 2,
          });
        }

        if (settings.soundEnabled) {
          playSound();
        }
      }
    );
  }

  if (message.type === 'POLL_ENDED') {
    chrome.storage.local.set({ pollActive: false });
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
